import { describe, expect, it } from 'vitest';
import { advanceDay, createNewGame, deserializeGameState, getPlayoffFixtures, getStandings, retirementChance, runOffseason, serializeGameState, simulateMatch, type GameState } from '../index';

function advanceMany(game: GameState, days: number): GameState {
  return Array.from({ length: days }).reduce<GameState>((state) => advanceDay(state), game);
}

describe('createNewGame', () => {
  it('creates a 12-team league with five-player rosters and a 22-matchday schedule', () => {
    const game = createNewGame();

    expect(game.version).toBe(2);
    expect(game.seasonYear).toBe(1);
    expect(game.seasonPhase).toBe('regularSeason');
    expect(game.teams).toHaveLength(12);
    expect(game.teams.every((team) => team.players.length === 5)).toBe(true);
    // Double round-robin: 12 teams play each other twice = 12 * 11 = 132 fixtures.
    expect(game.schedule).toHaveLength(132);
    expect(game.schedule.every((fixture) => fixture.seasonYear === 1 && fixture.type === 'regular')).toBe(true);

    const matchdays = new Map<number, number>();
    for (const fixture of game.schedule) {
      matchdays.set(fixture.matchday, (matchdays.get(fixture.matchday) ?? 0) + 1);
    }

    expect(matchdays.size).toBe(22);
    expect([...matchdays.values()].every((count) => count === 6)).toBe(true);
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
    expect(next.matchHistory).toHaveLength(6);
    expect(next.schedule.filter((fixture) => fixture.day === 1 && fixture.result)).toHaveLength(6);
    expect(next.standings.reduce((played, row) => played + row.played, 0)).toBe(12);
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
    const game = advanceMany(createNewGame(), 22);

    expect(game.currentDay).toBe(23);
    expect(game.seasonPhase).toBe('playoffs');
    expect(game.playoffBracket?.seeds).toHaveLength(4);
    expect(game.playoffBracket?.seeds.map((seed) => seed.teamId)).toEqual(game.standings.slice(0, 4).map((row) => row.teamId));
    expect(getPlayoffFixtures(game, 'semifinal')).toHaveLength(2);
    expect(getPlayoffFixtures(game, 'final')).toHaveLength(0);
  });

  it('creates a final after semifinals and crowns a champion after the final', () => {
    const afterSemifinals = advanceDay(advanceMany(createNewGame(), 22));

    expect(afterSemifinals.currentDay).toBe(24);
    expect(getPlayoffFixtures(afterSemifinals, 'semifinal').every((fixture) => fixture.result)).toBe(true);
    expect(getPlayoffFixtures(afterSemifinals, 'final')).toHaveLength(1);

    const afterFinal = advanceDay(afterSemifinals);

    expect(afterFinal.currentDay).toBe(25);
    expect(afterFinal.seasonPhase).toBe('seasonReview');
    expect(afterFinal.playoffBracket?.championTeamId).toBeTruthy();
    expect(afterFinal.playoffBracket?.runnerUpTeamId).toBeTruthy();
  });

  it('rolls season review into a new season while preserving players', () => {
    const seasonReview = advanceDay(advanceDay(advanceMany(createNewGame(), 22)));
    const originalPlayerIds = seasonReview.teams.flatMap((team) => team.players.map((player) => player.id));
    const nextSeason = advanceDay(seasonReview);

    expect(nextSeason.seasonYear).toBe(2);
    expect(nextSeason.seasonPhase).toBe('regularSeason');
    expect(nextSeason.currentDay).toBe(1);
    expect(nextSeason.matchHistory).toHaveLength(0);
    expect(nextSeason.schedule).toHaveLength(132);
    expect(nextSeason.standings.reduce((played, row) => played + row.played, 0)).toBe(0);
    expect(nextSeason.seasonHistory).toHaveLength(1);
    expect(nextSeason.teams.flatMap((team) => team.players.map((player) => player.id))).toEqual(originalPlayerIds);
  });
});

describe('off-season aging', () => {
  it('ages every player by one year when nobody retires', () => {
    const game = createNewGame();
    const beforeAges = new Map(game.teams.flatMap((team) => team.players.map((player) => [player.id, player.age] as const)));
    // The initial league is young (<= 26), so the first off-season has no retirements.
    const aged = runOffseason(game.teams, game.seasonYear + 1, 'no-retire-seed');

    for (const team of aged) {
      for (const player of team.players) {
        expect(beforeAges.has(player.id)).toBe(true);
        expect(player.age).toBe(beforeAges.get(player.id)! + 1);
      }
    }
  });

  it('declines skills more steeply for older players', () => {
    const game = createNewGame();
    const team = game.teams[0];
    const veteranTeam = {
      ...team,
      players: team.players.map((player) => ({ ...player, age: 33 }))
    };

    const aged = runOffseason([veteranTeam], game.seasonYear + 1, 'decline-seed')[0];

    for (let index = 0; index < aged.players.length; index += 1) {
      const before = veteranTeam.players[index];
      const after = aged.players[index];
      // A 33 year old who survives should have lost skill; a retiree is replaced
      // by a younger player, which we detect by a changed id.
      if (after.id === before.id) {
        expect(after.attributes.aim).toBeLessThan(before.attributes.aim);
        expect(after.age).toBe(34);
      }
    }
  });

  it('retires aging players and replaces them with younger prospects in the same role', () => {
    const game = createNewGame();
    const team = game.teams[0];
    // Past the forced-retirement age everyone retires this off-season.
    const oldTeam = {
      ...team,
      players: team.players.map((player) => ({ ...player, age: 45 }))
    };

    const aged = runOffseason([oldTeam], game.seasonYear + 1, 'retire-seed')[0];
    const originalIds = new Set(oldTeam.players.map((player) => player.id));

    expect(aged.players).toHaveLength(oldTeam.players.length);
    for (let index = 0; index < aged.players.length; index += 1) {
      const replacement = aged.players[index];
      expect(originalIds.has(replacement.id)).toBe(false);
      expect(replacement.teamId).toBe(oldTeam.id);
      expect(replacement.role).toBe(oldTeam.players[index].role);
      expect(replacement.age).toBeLessThanOrEqual(20);
    }
  });

  it('models retirement chance as zero when young and certain when very old', () => {
    expect(retirementChance(25)).toBe(0);
    expect(retirementChance(31)).toBeGreaterThan(retirementChance(30));
    expect(retirementChance(45)).toBe(1);
  });
});

describe('save serialization', () => {
  it('round trips game state', () => {
    const game = advanceDay(createNewGame());
    const restored = deserializeGameState(serializeGameState(game));

    expect(restored).toEqual(game);
  });
});
