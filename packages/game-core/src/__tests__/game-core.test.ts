import { describe, expect, it } from 'vitest';
import { advanceDay, createNewGame, deserializeGameState, getPlayoffFixtures, getStandings, serializeGameState, simulateMatch, type GameState } from '../index';

function advanceMany(game: GameState, days: number): GameState {
  return Array.from({ length: days }).reduce<GameState>((state) => advanceDay(state), game);
}

describe('createNewGame', () => {
  it('creates an 8-team league with five-player rosters and a 14-day schedule', () => {
    const game = createNewGame();

    expect(game.version).toBe(2);
    expect(game.seasonYear).toBe(1);
    expect(game.seasonPhase).toBe('regularSeason');
    expect(game.teams).toHaveLength(8);
    expect(game.teams.every((team) => team.players.length === 5)).toBe(true);
    expect(game.schedule).toHaveLength(56);
    expect(game.schedule.every((fixture) => fixture.seasonYear === 1 && fixture.type === 'regular')).toBe(true);

    const matchdays = new Map<number, number>();
    for (const fixture of game.schedule) {
      matchdays.set(fixture.matchday, (matchdays.get(fixture.matchday) ?? 0) + 1);
    }

    expect(matchdays.size).toBe(14);
    expect([...matchdays.values()].every((count) => count === 4)).toBe(true);
  });
});

describe('simulateMatch', () => {
  it('returns a valid best-of-three series result for a regular fixture', () => {
    const game = createNewGame();
    const result = simulateMatch(game.schedule[0], game.teams, 'test-seed');

    const winnerMaps = Math.max(result.homeMaps, result.awayMaps);
    const loserMaps = Math.min(result.homeMaps, result.awayMaps);
    // Best of three: first to two maps, so two or three maps are played.
    expect(winnerMaps).toBe(2);
    expect(loserMaps).toBeLessThanOrEqual(1);
    expect(result.maps.length).toBe(winnerMaps + loserMaps);
    expect(result.maps.length).toBeGreaterThanOrEqual(2);
    expect(result.maps.length).toBeLessThanOrEqual(3);

    // Every map is first-to-13, and overtime must be won by two — never 13-12.
    for (const map of result.maps) {
      const winnerRounds = Math.max(map.homeRounds, map.awayRounds);
      const loserRounds = Math.min(map.homeRounds, map.awayRounds);
      expect(winnerRounds).toBeGreaterThanOrEqual(13);
      expect(winnerRounds - loserRounds).toBeGreaterThanOrEqual(2);
      // Each map carries its own full box score for both teams.
      expect(map.boxScore).toHaveLength(10);
    }

    // Total rounds equal the sum across maps.
    expect(result.homeRounds).toBe(result.maps.reduce((total, map) => total + map.homeRounds, 0));
    expect(result.awayRounds).toBe(result.maps.reduce((total, map) => total + map.awayRounds, 0));

    expect(result.boxScore).toHaveLength(10);
    expect(result.seasonYear).toBe(1);
    expect(result.fixtureType).toBe('regular');
  });

  it('plays the playoff grand final as a best-of-five', () => {
    const game = createNewGame();
    const finalFixture = { ...game.schedule[0], type: 'playoff' as const, playoffRound: 'final' as const };
    const result = simulateMatch(finalFixture, game.teams, 'final-seed');

    expect(Math.max(result.homeMaps, result.awayMaps)).toBe(3);
    expect(result.maps.length).toBeGreaterThanOrEqual(3);
    expect(result.maps.length).toBeLessThanOrEqual(5);
  });
});

describe('advanceDay', () => {
  it('simulates todays fixtures, updates standings, and advances the calendar', () => {
    const game = createNewGame();
    const next = advanceDay(game);

    expect(next.currentDay).toBe(2);
    expect(next.matchHistory).toHaveLength(4);
    expect(next.schedule.filter((fixture) => fixture.day === 1 && fixture.result)).toHaveLength(4);
    expect(next.standings.reduce((played, row) => played + row.played, 0)).toBe(8);
    expect(next.standings.every((row) => row.played === row.wins + row.losses)).toBe(true);
    expect(next.standings.every((row) => row.mapDiff === row.mapsFor - row.mapsAgainst)).toBe(true);
    // Maps won by one side are maps lost by the other, so the ledger balances.
    expect(next.standings.reduce((total, row) => total + row.mapsFor, 0)).toBe(
      next.standings.reduce((total, row) => total + row.mapsAgainst, 0)
    );
    expect(getStandings(next.teams, next.matchHistory)).toEqual(next.standings);
  });
});

describe('season flow', () => {
  it('creates playoff semifinals after the regular season', () => {
    const game = advanceMany(createNewGame(), 14);

    expect(game.currentDay).toBe(15);
    expect(game.seasonPhase).toBe('playoffs');
    expect(game.playoffBracket?.seeds).toHaveLength(4);
    expect(game.playoffBracket?.seeds.map((seed) => seed.teamId)).toEqual(game.standings.slice(0, 4).map((row) => row.teamId));
    expect(getPlayoffFixtures(game, 'semifinal')).toHaveLength(2);
    expect(getPlayoffFixtures(game, 'final')).toHaveLength(0);
  });

  it('creates a final after semifinals and crowns a champion after the final', () => {
    const afterSemifinals = advanceDay(advanceMany(createNewGame(), 14));

    expect(afterSemifinals.currentDay).toBe(16);
    expect(getPlayoffFixtures(afterSemifinals, 'semifinal').every((fixture) => fixture.result)).toBe(true);
    expect(getPlayoffFixtures(afterSemifinals, 'final')).toHaveLength(1);

    const afterFinal = advanceDay(afterSemifinals);

    expect(afterFinal.currentDay).toBe(17);
    expect(afterFinal.seasonPhase).toBe('seasonReview');
    expect(afterFinal.playoffBracket?.championTeamId).toBeTruthy();
    expect(afterFinal.playoffBracket?.runnerUpTeamId).toBeTruthy();
  });

  it('rolls season review into a new season while preserving players', () => {
    const seasonReview = advanceDay(advanceDay(advanceMany(createNewGame(), 14)));
    const originalPlayerIds = seasonReview.teams.flatMap((team) => team.players.map((player) => player.id));
    const nextSeason = advanceDay(seasonReview);

    expect(nextSeason.seasonYear).toBe(2);
    expect(nextSeason.seasonPhase).toBe('regularSeason');
    expect(nextSeason.currentDay).toBe(1);
    expect(nextSeason.matchHistory).toHaveLength(0);
    expect(nextSeason.schedule).toHaveLength(56);
    expect(nextSeason.standings.reduce((played, row) => played + row.played, 0)).toBe(0);
    expect(nextSeason.seasonHistory).toHaveLength(1);
    expect(nextSeason.teams.flatMap((team) => team.players.map((player) => player.id))).toEqual(originalPlayerIds);
  });
});

describe('save serialization', () => {
  it('round trips game state', () => {
    const game = advanceDay(createNewGame());
    const restored = deserializeGameState(serializeGameState(game));

    expect(restored).toEqual(game);
  });
});
