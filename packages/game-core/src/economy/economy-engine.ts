import { GAME_CONFIG } from "../config";
import type { BuyPhase, EconStrategy } from "../types/enums";
import { averageCreds, type MatchEconomyTeamState } from "./creds";

export type RoundEconomyResult = {
  winner: MatchEconomyTeamState;
  loser: MatchEconomyTeamState;
};

export function decideBuy(state: MatchEconomyTeamState, strategy: EconStrategy): BuyPhase {
  const average = averageCreds(state);
  const forceBias = strategy === "force" ? -450 : strategy === "save" ? 550 : 0;
  const fullBuyThreshold = 3900 + forceBias;
  const forceThreshold = 2200 + forceBias;

  if (average >= fullBuyThreshold) return "full";
  if (average >= forceThreshold) return strategy === "save" ? "half" : "force";
  if (average >= 1500 && strategy === "force") return "force";
  return "eco";
}

export function buyMultiplier(buy: BuyPhase): number {
  switch (buy) {
    case "full":
      return 1.18;
    case "half":
      return 1.02;
    case "force":
      return 0.95;
    case "eco":
      return 0.78;
  }
}

export function applyBuy(state: MatchEconomyTeamState, buy: BuyPhase): MatchEconomyTeamState {
  const cost = buyCost(buy);
  return {
    ...state,
    lastBuy: buy,
    creds: state.creds.map((creds) => Math.max(0, creds - cost))
  };
}

export function applyRoundEconomy(
  winner: MatchEconomyTeamState,
  loser: MatchEconomyTeamState,
  options: { winnerKills: number; loserKills: number; spikePlanted: boolean; attackerWon: boolean }
): RoundEconomyResult {
  const loserLossBonus = Math.min(
    GAME_CONFIG.maxLossBonus,
    GAME_CONFIG.lossCreds + loser.lossStreak * GAME_CONFIG.lossBonusStep
  );
  return {
    winner: distributeCredits(
      {
        ...winner,
        lossStreak: 0
      },
      GAME_CONFIG.winCreds + options.winnerKills * GAME_CONFIG.killCreds
    ),
    loser: distributeCredits(
      {
        ...loser,
        lossStreak: loser.lossStreak + 1
      },
      loserLossBonus + options.loserKills * GAME_CONFIG.killCreds + (options.spikePlanted && !options.attackerWon ? GAME_CONFIG.plantCreds : 0)
    )
  };
}

function distributeCredits(state: MatchEconomyTeamState, amount: number): MatchEconomyTeamState {
  return {
    ...state,
    creds: state.creds.map((creds) => Math.min(9000, creds + amount))
  };
}

function buyCost(buy: BuyPhase): number {
  switch (buy) {
    case "full":
      return 3900;
    case "half":
      return 2600;
    case "force":
      return 2200;
    case "eco":
      return 400;
  }
}
