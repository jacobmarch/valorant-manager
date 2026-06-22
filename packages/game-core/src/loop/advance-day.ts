import type { GameState, MatchResult, SeasonSummary, Team } from '../types/models';
import { createFinalFixture, createPlayoffBracket, createSemifinalFixtures } from '../gen/playoffs';
import { createDoubleRoundRobinSchedule } from '../gen/schedule';
import { simulateMatch } from '../sim/match';
import { runOffseason } from './offseason';
import { getStandings } from './selectors';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function updateTeamAfterResults(team: Team, results: MatchResult[]): Team {
  const played = results.some((result) => result.homeTeamId === team.id || result.awayTeamId === team.id);
  const won = results.some((result) => result.winnerTeamId === team.id);

  return {
    ...team,
    players: team.players.map((player) => ({
      ...player,
      attributes: {
        ...player.attributes,
        fatigue: clamp(player.attributes.fatigue + (played ? 9 : -4), 0, 100),
        morale: clamp(player.attributes.morale + (played ? (won ? 4 : -3) : 1), 0, 100)
      }
    }))
  };
}

export function advanceDay(state: GameState): GameState {
  if (state.seasonPhase === 'seasonReview') {
    return startNextSeason(state);
  }

  const todaysFixtures = state.schedule.filter((fixture) => fixture.day === state.currentDay && !fixture.result);
  const todaysResults = todaysFixtures.map((fixture) => simulateMatch(fixture, state.teams, `${state.createdAt}-${fixture.id}-${state.matchHistory.length}`));
  const resultByFixture = new Map(todaysResults.map((result) => [result.fixtureId, result]));
  const matchHistory = [...state.matchHistory, ...todaysResults];
  const teams = state.teams.map((team) => updateTeamAfterResults(team, todaysResults));
  const schedule = state.schedule.map((fixture) => {
    const result = resultByFixture.get(fixture.id);
    return result ? { ...fixture, result } : fixture;
  });
  const standings = getStandings(teams, matchHistory);
  const nextState: GameState = {
    ...state,
    currentDay: state.currentDay + 1,
    teams,
    schedule,
    matchHistory,
    standings
  };

  if (nextState.seasonPhase === 'regularSeason' && isRegularSeasonComplete(nextState)) {
    const bracket = createPlayoffBracket(nextState.standings, nextState.seasonYear);
    return {
      ...nextState,
      seasonPhase: 'playoffs',
      playoffBracket: bracket,
      schedule: [...nextState.schedule, ...createSemifinalFixtures(bracket, nextState.currentDay)]
    };
  }

  if (nextState.seasonPhase === 'playoffs') {
    return advancePlayoffs(nextState);
  }

  return nextState;
}

function isRegularSeasonComplete(state: GameState): boolean {
  return state.schedule.filter((fixture) => fixture.type === 'regular').every((fixture) => fixture.result);
}

function advancePlayoffs(state: GameState): GameState {
  const bracket = state.playoffBracket;
  if (!bracket) {
    throw new Error('Cannot advance playoffs without a playoff bracket.');
  }

  const semifinalFixtures = state.schedule.filter((fixture) => fixture.type === 'playoff' && fixture.playoffRound === 'semifinal');
  const finalFixture = state.schedule.find((fixture) => fixture.type === 'playoff' && fixture.playoffRound === 'final');

  if (semifinalFixtures.length === 2 && semifinalFixtures.every((fixture) => fixture.result) && !finalFixture) {
    return {
      ...state,
      schedule: [...state.schedule, createFinalFixture(bracket, semifinalFixtures, state.currentDay)]
    };
  }

  if (finalFixture?.result) {
    const runnerUpTeamId = finalFixture.result.winnerTeamId === finalFixture.homeTeamId ? finalFixture.awayTeamId : finalFixture.homeTeamId;
    return {
      ...state,
      seasonPhase: 'seasonReview',
      playoffBracket: {
        ...bracket,
        championTeamId: finalFixture.result.winnerTeamId,
        runnerUpTeamId
      }
    };
  }

  return state;
}

function createSeasonSummary(state: GameState): SeasonSummary {
  const finalFixture = state.schedule.find((fixture) => fixture.type === 'playoff' && fixture.playoffRound === 'final' && fixture.result);

  if (!state.playoffBracket?.championTeamId || !state.playoffBracket.runnerUpTeamId || !finalFixture?.result) {
    throw new Error('Cannot archive season before the champion is decided.');
  }

  return {
    seasonYear: state.seasonYear,
    championTeamId: state.playoffBracket.championTeamId,
    runnerUpTeamId: state.playoffBracket.runnerUpTeamId,
    finalResultId: finalFixture.result.id,
    standings: state.standings,
    completedAtDay: state.currentDay
  };
}

function resetTeamForNewSeason(team: Team): Team {
  return {
    ...team,
    players: team.players.map((player) => ({
      ...player,
      attributes: {
        ...player.attributes,
        morale: 70,
        fatigue: 8
      }
    }))
  };
}

function startNextSeason(state: GameState): GameState {
  const seasonYear = state.seasonYear + 1;
  // Off-season: age players, develop/decline skills, retire and replace.
  const agedTeams = runOffseason(state.teams, seasonYear, `${state.createdAt}-offseason-${seasonYear}`);
  const teams = agedTeams.map(resetTeamForNewSeason);

  return {
    ...state,
    seasonYear,
    seasonPhase: 'regularSeason',
    currentDay: 1,
    teams,
    schedule: createDoubleRoundRobinSchedule(teams, seasonYear),
    matchHistory: [],
    standings: getStandings(teams, []),
    playoffBracket: undefined,
    seasonHistory: [...state.seasonHistory, createSeasonSummary(state)]
  };
}
