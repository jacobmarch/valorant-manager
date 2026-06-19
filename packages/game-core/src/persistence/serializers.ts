import type { Fixture, GameState, MatchResult } from '../types/models';
import { getStandings } from '../loop/selectors';

type LegacyMatchResult = Omit<MatchResult, 'seasonYear' | 'fixtureType' | 'playoffRound'>;
type LegacyFixture = Omit<Fixture, 'seasonYear' | 'type' | 'playoffRound' | 'homeSeed' | 'awaySeed' | 'result'> & {
  result?: LegacyMatchResult;
};
type LegacyGameState = Omit<GameState, 'version' | 'seasonYear' | 'seasonPhase' | 'schedule' | 'matchHistory' | 'playoffBracket' | 'seasonHistory'> & {
  version: 1;
  schedule: LegacyFixture[];
  matchHistory: LegacyMatchResult[];
};

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

// Backfill the series fields (maps / homeMaps / awayMaps) for results saved
// before matches became best-of-N. Such results recorded a single map's rounds,
// so we treat that score as a one-map series.
function normalizeMatchResult(result: MatchResult): MatchResult {
  if (Array.isArray(result.maps) && typeof result.homeMaps === 'number' && typeof result.awayMaps === 'number') {
    return result;
  }

  const boxScore = result.boxScore ?? [];
  const homeRounds = result.homeRounds ?? 0;
  const awayRounds = result.awayRounds ?? 0;
  const homeWon = homeRounds >= awayRounds;

  return {
    ...result,
    homeMaps: result.homeMaps ?? (homeWon ? 1 : 0),
    awayMaps: result.awayMaps ?? (homeWon ? 0 : 1),
    boxScore,
    maps: result.maps ?? [{ homeRounds, awayRounds, boxScore }]
  };
}

function normalizeMatchResults(state: GameState): GameState {
  const matchHistory = state.matchHistory.map(normalizeMatchResult);
  return {
    ...state,
    schedule: state.schedule.map((fixture) =>
      fixture.result ? { ...fixture, result: normalizeMatchResult(fixture.result) } : fixture
    ),
    matchHistory,
    // Recompute so the maps-for/against columns match the backfilled results.
    standings: getStandings(state.teams, matchHistory)
  };
}

export function deserializeGameState(serialized: string): GameState {
  const parsed = JSON.parse(serialized) as Partial<GameState> & { version?: number };

  if (!Array.isArray(parsed.teams) || !Array.isArray(parsed.schedule) || !Array.isArray(parsed.matchHistory)) {
    throw new Error('Invalid Valorant Manager save file.');
  }

  if (parsed.version === 2) {
    return normalizeMatchResults(parsed as GameState);
  }

  if (parsed.version === 1) {
    return normalizeMatchResults(migrateVersionOneSave(parsed as unknown as LegacyGameState));
  }

  throw new Error('Invalid Valorant Manager save file.');
}

function migrateVersionOneSave(legacy: LegacyGameState): GameState {
  const schedule: Fixture[] = legacy.schedule.map((fixture) => ({
    ...fixture,
    seasonYear: 1,
    type: 'regular',
    result: fixture.result
      ? {
          ...fixture.result,
          seasonYear: 1,
          fixtureType: 'regular'
        }
      : undefined
  }));
  const matchHistory: MatchResult[] = legacy.matchHistory.map((result) => ({
    ...result,
    seasonYear: 1,
    fixtureType: 'regular'
  }));

  return {
    ...legacy,
    version: 2,
    seasonYear: 1,
    seasonPhase: 'regularSeason',
    schedule,
    matchHistory,
    standings: getStandings(legacy.teams, matchHistory),
    seasonHistory: []
  };
}
