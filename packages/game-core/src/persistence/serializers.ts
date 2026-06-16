import type { GameState } from '../types/models';

export function serializeGameState(state: GameState): string {
  return JSON.stringify(state);
}

export function deserializeGameState(serialized: string): GameState {
  const parsed = JSON.parse(serialized) as Partial<GameState>;

  if (parsed.version !== 1 || !Array.isArray(parsed.teams) || !Array.isArray(parsed.schedule) || !Array.isArray(parsed.matchHistory)) {
    throw new Error('Invalid Valorant Manager save file.');
  }

  return parsed as GameState;
}
