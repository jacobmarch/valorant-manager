import type { GameState, MatchResult, Player, PlayerMatchStat, Team } from '@valorant-manager/game-core';

export function teamById(game: GameState, teamId: string): Team | undefined {
  return game.teams.find((team) => team.id === teamId);
}

export function teamName(game: GameState, teamId: string): string {
  return teamById(game, teamId)?.name ?? 'Unknown';
}

export function teamShort(game: GameState, teamId: string): string {
  return teamById(game, teamId)?.shortName ?? '???';
}

export function isUserMatch(game: GameState, result: MatchResult): boolean {
  return result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId;
}

/** All results involving a team, newest first. */
export function getTeamResults(game: GameState, teamId: string): MatchResult[] {
  return [...game.matchHistory]
    .filter((result) => result.homeTeamId === teamId || result.awayTeamId === teamId)
    .sort((a, b) => b.day - a.day || b.fixtureId.localeCompare(a.fixtureId));
}

/** Recent win/loss form for a team, oldest first (so the last chip is most recent). */
export function getTeamForm(game: GameState, teamId: string, limit = 5): Array<'W' | 'L'> {
  return getTeamResults(game, teamId)
    .slice(0, limit)
    .reverse()
    .map((result) => (result.winnerTeamId === teamId ? 'W' : 'L'));
}

export interface PlayerSeasonStats {
  games: number;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
  kd: number;
}

const emptySeasonStats: PlayerSeasonStats = { games: 0, kills: 0, deaths: 0, assists: 0, acs: 0, kd: 0 };

/** Per-game averages for a player across this season's played matches. */
export function getPlayerSeasonStats(game: GameState, playerId: string): PlayerSeasonStats {
  const stats: PlayerMatchStat[] = game.matchHistory.flatMap((result) =>
    result.boxScore.filter((stat) => stat.playerId === playerId)
  );

  if (stats.length === 0) {
    return emptySeasonStats;
  }

  const totals = stats.reduce(
    (acc, stat) => {
      acc.kills += stat.kills;
      acc.deaths += stat.deaths;
      acc.assists += stat.assists;
      acc.acs += stat.acs;
      return acc;
    },
    { kills: 0, deaths: 0, assists: 0, acs: 0 }
  );

  return {
    games: stats.length,
    kills: totals.kills / stats.length,
    deaths: totals.deaths / stats.length,
    assists: totals.assists / stats.length,
    acs: totals.acs / stats.length,
    kd: totals.deaths === 0 ? totals.kills : totals.kills / totals.deaths
  };
}

export interface PlayerMatchLogEntry {
  result: MatchResult;
  stat: PlayerMatchStat;
  opponentId: string;
  won: boolean;
}

/** Per-match stat lines for a player this season, newest first, with opponent + outcome context. */
export function getPlayerMatchLog(game: GameState, playerId: string): PlayerMatchLogEntry[] {
  return [...game.matchHistory]
    .sort((a, b) => b.day - a.day || b.fixtureId.localeCompare(a.fixtureId))
    .flatMap((result) => {
      const stat = result.boxScore.find((entry) => entry.playerId === playerId);
      if (!stat) {
        return [];
      }
      const opponentId = stat.teamId === result.homeTeamId ? result.awayTeamId : result.homeTeamId;
      return [{ result, stat, opponentId, won: result.winnerTeamId === stat.teamId }];
    });
}

const OVERALL_KEYS: Array<keyof Player['attributes']> = ['aim', 'gameSense', 'utility', 'clutch', 'communication', 'consistency'];

/** Composite skill rating from core performance attributes (excludes morale/fatigue/potential). */
export function getPlayerOverall(player: Player): number {
  const total = OVERALL_KEYS.reduce((sum, key) => sum + player.attributes[key], 0);
  return Math.round(total / OVERALL_KEYS.length);
}

/** Average overall across a team's roster. */
export function getTeamOverall(team: Team): number {
  if (team.players.length === 0) {
    return 0;
  }
  return Math.round(team.players.reduce((sum, player) => sum + getPlayerOverall(player), 0) / team.players.length);
}

/** Upcoming + recent fixtures for the user team, ordered by day. */
export function getUserFixtures(game: GameState) {
  return game.schedule
    .filter((fixture) => fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId)
    .sort((a, b) => a.day - b.day);
}
