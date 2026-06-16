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

export function deserializeGameState(serialized: string): GameState {
  const parsed = JSON.parse(serialized) as Partial<GameState> & { version?: number };

  if (!Array.isArray(parsed.teams) || !Array.isArray(parsed.schedule) || !Array.isArray(parsed.matchHistory)) {
    throw new Error('Invalid Valorant Manager save file.');
  }

  if (parsed.version === 2) {
    return parsed as GameState;
  }

  if (parsed.version === 1) {
    return migrateVersionOneSave(parsed as unknown as LegacyGameState);
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
