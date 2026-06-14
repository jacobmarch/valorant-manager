export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type PlayerId = Brand<string, "PlayerId">;
export type TeamId = Brand<string, "TeamId">;
export type FixtureId = Brand<string, "FixtureId">;
export type MatchId = Brand<string, "MatchId">;
export type AgentId = Brand<string, "AgentId">;
export type MapId = Brand<string, "MapId">;

let nextId = 1;

export function createId(prefix: string): string {
  const value = `${prefix}_${nextId++}_${Math.random().toString(36).slice(2, 8)}`;
  return value;
}
