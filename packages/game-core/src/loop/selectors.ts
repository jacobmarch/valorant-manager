import type { Fixture, GameState, MatchResult, PlayoffRound, StandingsRow, Team } from '../types/models';

function emptyRow(teamId: string): StandingsRow {
  return {
    teamId,
    played: 0,
    wins: 0,
    losses: 0,
    roundsFor: 0,
    roundsAgainst: 0,
    roundDiff: 0,
    points: 0
  };
}

export function getStandings(teams: Team[], matchHistory: MatchResult[]): StandingsRow[] {
  const rows = new Map(teams.map((team) => [team.id, emptyRow(team.id)]));

  for (const result of matchHistory.filter((candidate) => candidate.fixtureType === 'regular')) {
    const home = rows.get(result.homeTeamId);
    const away = rows.get(result.awayTeamId);
    if (!home || !away) {
      continue;
    }

    home.played += 1;
    away.played += 1;
    home.roundsFor += result.homeRounds;
    home.roundsAgainst += result.awayRounds;
    away.roundsFor += result.awayRounds;
    away.roundsAgainst += result.homeRounds;

    if (result.winnerTeamId === result.homeTeamId) {
      home.wins += 1;
      away.losses += 1;
      home.points += 3;
    } else {
      away.wins += 1;
      home.losses += 1;
      away.points += 3;
    }
  }

  return [...rows.values()]
    .map((row) => ({ ...row, roundDiff: row.roundsFor - row.roundsAgainst }))
    .sort((a, b) => b.points - a.points || b.roundDiff - a.roundDiff || b.roundsFor - a.roundsFor || a.teamId.localeCompare(b.teamId));
}

export function getNextUserFixture(state: GameState): Fixture | undefined {
  return state.schedule.find((fixture) => !fixture.result && fixture.day >= state.currentDay && (fixture.homeTeamId === state.userTeamId || fixture.awayTeamId === state.userTeamId));
}

export function getRecentResults(state: GameState, limit = 5): MatchResult[] {
  return [...state.matchHistory].sort((a, b) => b.day - a.day || b.fixtureId.localeCompare(a.fixtureId)).slice(0, limit);
}

export function getCurrentPhaseLabel(state: GameState): string {
  if (state.seasonPhase === 'regularSeason') {
    return 'Regular Season';
  }

  if (state.seasonPhase === 'playoffs') {
    return 'Playoffs';
  }

  return 'Season Review';
}

export function getPlayoffFixtures(state: GameState, round?: PlayoffRound): Fixture[] {
  return state.schedule.filter((fixture) => fixture.type === 'playoff' && (!round || fixture.playoffRound === round));
}

export function getSeasonChampion(state: GameState): string | undefined {
  return state.playoffBracket?.championTeamId;
}
