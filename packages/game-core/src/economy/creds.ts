import { GAME_CONFIG } from "../config";
import type { BuyPhase } from "../types/enums";
import type { TeamId } from "../types/ids";

export type MatchEconomyTeamState = {
  teamId: TeamId;
  creds: number[];
  lossStreak: number;
  lastBuy: BuyPhase;
};

export function createMatchEconomy(teamId: TeamId): MatchEconomyTeamState {
  return {
    teamId,
    creds: Array.from({ length: 5 }, () => GAME_CONFIG.startingCreds),
    lossStreak: 0,
    lastBuy: "eco"
  };
}

export function averageCreds(state: MatchEconomyTeamState): number {
  return state.creds.reduce((sum, value) => sum + value, 0) / state.creds.length;
}

export function resetHalfEconomy(state: MatchEconomyTeamState): MatchEconomyTeamState {
  return {
    ...state,
    creds: Array.from({ length: 5 }, () => GAME_CONFIG.startingCreds),
    lossStreak: 0,
    lastBuy: "eco"
  };
}
