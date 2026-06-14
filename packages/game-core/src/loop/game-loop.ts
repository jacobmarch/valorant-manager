import { createNewGame } from "../gen/league";
import type { DayEvent, GameState } from "../models/game-state";
import type { Player } from "../models/player";
import { Morale, type TrainingFocus } from "../types/enums";
import type { Fixture } from "../models/league";
import { sortStandings } from "../models/league";
import type { Team } from "../models/team";
import { getLineupPlayers } from "../models/team";
import { awardPrizeMoney, payWeeklySalaries } from "../economy/team-budget";
import { MatchSimulator, simulateMatch, type MatchResult } from "../sim/match";
import { isMatchDay, isTrainingDay, nextDay } from "./calendar";
import { applyTraining, recoverAfterMatch } from "./training";

export { createNewGame };

export type AdvanceDayAction = {
  trainingFocus?: TrainingFocus;
  autoPlayMatches?: boolean;
};

export function advanceDay(state: GameState, action: AdvanceDayAction = {}): GameState {
  const events: DayEvent[] = [];
  let nextState = state;
  const userTeam = getUserTeam(nextState);

  if (isTrainingDay(nextState.calendar.day)) {
    const focus = action.trainingFocus ?? "aim";
    nextState = {
      ...nextState,
      players: applyTraining(nextState.players, userTeam, focus)
    };
    events.push({
      title: "Training complete",
      description: `${focusLabel(focus)} training finished for ${userTeam.shortName}.`
    });
  }

  if (isMatchDay(nextState.calendar.day) && action.autoPlayMatches !== false) {
    const fixture = nextFixtureForTeam(nextState, userTeam);
    if (fixture) {
      const result = playFixture(nextState, fixture);
      nextState = applyMatchResult(nextState, fixture, result);
      events.push({
        title: "Match played",
        description: `${result.score[0]}-${result.score[1]} on ${result.map}.`
      });
    }
  }

  if (nextState.calendar.day === "Sunday") {
    nextState = {
      ...nextState,
      teams: nextState.teams.map((team) => payWeeklySalaries(team, nextState.players))
    };
    events.push({ title: "Finance update", description: "Weekly salaries have been paid." });
  }

  return {
    ...nextState,
    calendar: nextDay(nextState.calendar),
    news: [...events, ...nextState.news].slice(0, 50)
  };
}

export function createMatchSimulatorForFixture(state: GameState, fixture: Fixture, seed = Date.now()): MatchSimulator {
  const homeTeam = getTeam(state, fixture.homeTeamId);
  const awayTeam = getTeam(state, fixture.awayTeamId);
  return new MatchSimulator({
    homeTeam,
    awayTeam,
    homePlayers: getLineupPlayers(homeTeam.defaultPrep, state.players),
    awayPlayers: getLineupPlayers(awayTeam.defaultPrep, state.players),
    homePrep: homeTeam.defaultPrep,
    awayPrep: awayTeam.defaultPrep,
    seed
  });
}

export function playFixture(state: GameState, fixture: Fixture): MatchResult {
  const homeTeam = getTeam(state, fixture.homeTeamId);
  const awayTeam = getTeam(state, fixture.awayTeamId);
  return simulateMatch({
    homeTeam,
    awayTeam,
    homePlayers: getLineupPlayers(homeTeam.defaultPrep, state.players),
    awayPlayers: getLineupPlayers(awayTeam.defaultPrep, state.players),
    homePrep: homeTeam.defaultPrep,
    awayPrep: awayTeam.defaultPrep,
    seed: state.calendar.week * 1000 + state.matchHistory.length
  });
}

export function applyMatchResult(state: GameState, fixture: Fixture, result: MatchResult): GameState {
  const homeWon = result.winnerId === fixture.homeTeamId;
  const roundDiff = result.score[0] - result.score[1];
  const userTeam = getUserTeam(state);

  const teams = state.teams.map((team) => {
    if (team.id !== fixture.homeTeamId && team.id !== fixture.awayTeamId) return team;
    const didWin = team.id === result.winnerId;
    const differential = team.id === fixture.homeTeamId ? roundDiff : -roundDiff;
    const updated: Team = {
      ...team,
      wins: team.wins + (didWin ? 1 : 0),
      losses: team.losses + (didWin ? 0 : 1),
      mapDifferential: team.mapDifferential + differential,
      teamCohesion: Math.min(20, team.teamCohesion + (didWin ? 1 : 0))
    };
    return didWin ? awardPrizeMoney(updated, 12_500) : updated;
  });

  const players = recoverAfterMatch(state.players, userTeam).map((player) => {
    const stats = result.playerStats[player.id];
    if (!stats) return player;
    const won = result.winnerId === state.teams.find((team) => team.players.includes(player.id))?.id;
    return {
      ...player,
      morale: adjustMorale(player.morale, won),
      fatigue: Math.min(100, player.fatigue + 8)
    };
  });

  const standings = sortStandings(
    state.standings.map((standing) => {
      if (standing.teamId !== fixture.homeTeamId && standing.teamId !== fixture.awayTeamId) return standing;
      const didWin = standing.teamId === result.winnerId;
      return {
        ...standing,
        wins: standing.wins + (didWin ? 1 : 0),
        losses: standing.losses + (didWin ? 0 : 1),
        roundDifferential: standing.roundDifferential + (standing.teamId === fixture.homeTeamId ? roundDiff : -roundDiff)
      };
    })
  );

  return {
    ...state,
    teams,
    players,
    standings,
    fixtures: state.fixtures.map((candidate) =>
      candidate.id === fixture.id ? { ...candidate, played: true, resultId: result.id } : candidate
    ),
    matchHistory: [result, ...state.matchHistory]
  };
}

export function nextFixtureForTeam(state: GameState, team: Team): Fixture | undefined {
  return state.fixtures.find(
    (fixture) => !fixture.played && (fixture.homeTeamId === team.id || fixture.awayTeamId === team.id)
  );
}

function getUserTeam(state: GameState): Team {
  return getTeam(state, state.userTeamId);
}

function getTeam(state: GameState, teamId: Team["id"]): Team {
  const team = state.teams.find((candidate) => candidate.id === teamId);
  if (!team) throw new Error(`Team not found: ${teamId}`);
  return team;
}

function adjustMorale(morale: Morale, won: boolean): Morale {
  const next = Number(morale) + (won ? 1 : -1);
  return Math.max(Morale.Abysmal, Math.min(Morale.Superb, next)) as Morale;
}

function focusLabel(focus: TrainingFocus): string {
  switch (focus) {
    case "aim":
      return "Aim";
    case "gamesense":
      return "Gamesense";
    case "communication":
      return "Communication";
    case "agents":
      return "Agent mastery";
    case "rest":
      return "Recovery";
  }
}
