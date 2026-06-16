import type { GameState, MatchResult, Team } from '../types/models';
import { simulateMatch } from '../sim/match';
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
  const todaysFixtures = state.schedule.filter((fixture) => fixture.day === state.currentDay && !fixture.result);
  const todaysResults = todaysFixtures.map((fixture) => simulateMatch(fixture, state.teams, `${state.createdAt}-${fixture.id}-${state.matchHistory.length}`));
  const resultByFixture = new Map(todaysResults.map((result) => [result.fixtureId, result]));
  const matchHistory = [...state.matchHistory, ...todaysResults];
  const teams = state.teams.map((team) => updateTeamAfterResults(team, todaysResults));

  return {
    ...state,
    currentDay: state.currentDay + 1,
    teams,
    schedule: state.schedule.map((fixture) => {
      const result = resultByFixture.get(fixture.id);
      return result ? { ...fixture, result } : fixture;
    }),
    matchHistory,
    standings: getStandings(teams, matchHistory)
  };
}
