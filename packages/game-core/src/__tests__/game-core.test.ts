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
  it('returns a valid first-to-13 match result for a fixture', () => {
    const game = createNewGame();
    const result = simulateMatch(game.schedule[0], game.teams, 'test-seed');

    expect(Math.max(result.homeRounds, result.awayRounds)).toBe(13);
    expect(Math.min(result.homeRounds, result.awayRounds)).toBeLessThan(13);
    expect(result.boxScore).toHaveLength(10);
    expect(result.seasonYear).toBe(1);
    expect(result.fixtureType).toBe('regular');
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
    expect(getStandings(next.teams, next.matchHistory)).toEqual(next.standings);
  });
});

describe('season flow', () => {
  it('creates playoff semifinals after the regular season', () => {
    const game = advanceMany(createNewGame(), 14);

    expect(game.currentDay).toBe(15);
    expect(game.seasonPhase).toBe('playoffs');
    expect(game.playoffBracket?.seeds).toHaveLength(4);
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
