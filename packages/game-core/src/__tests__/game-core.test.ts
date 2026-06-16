import { describe, expect, it } from 'vitest';
import { advanceDay, createNewGame, deserializeGameState, getStandings, serializeGameState, simulateMatch } from '../index';

describe('createNewGame', () => {
  it('creates an 8-team league with five-player rosters and a 14-day schedule', () => {
    const game = createNewGame();

    expect(game.teams).toHaveLength(8);
    expect(game.teams.every((team) => team.players.length === 5)).toBe(true);
    expect(game.schedule).toHaveLength(56);

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

describe('save serialization', () => {
  it('round trips game state', () => {
    const game = advanceDay(createNewGame());
    const restored = deserializeGameState(serializeGameState(game));

    expect(restored).toEqual(game);
  });
});
