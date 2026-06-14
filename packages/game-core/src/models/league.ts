import { createId, type FixtureId, type TeamId } from "../types/ids";

export type Fixture = {
  id: FixtureId;
  week: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  played: boolean;
  resultId?: string;
};

export type Standing = {
  teamId: TeamId;
  wins: number;
  losses: number;
  roundDifferential: number;
};

export function createFixture(week: number, homeTeamId: TeamId, awayTeamId: TeamId): Fixture {
  return {
    id: createId("fixture") as FixtureId,
    week,
    homeTeamId,
    awayTeamId,
    played: false
  };
}

export function createStandings(teamIds: TeamId[]): Standing[] {
  return teamIds.map((teamId) => ({
    teamId,
    wins: 0,
    losses: 0,
    roundDifferential: 0
  }));
}

export function sortStandings(standings: Standing[]): Standing[] {
  return [...standings].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.roundDifferential - a.roundDifferential;
  });
}
