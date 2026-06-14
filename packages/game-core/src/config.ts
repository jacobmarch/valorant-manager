export const GAME_CONFIG = {
  startingBudget: 500_000,
  startingCreds: 800,
  winCreds: 3000,
  lossCreds: 1900,
  lossBonusStep: 500,
  maxLossBonus: 2900,
  killCreds: 200,
  assistCreds: 100,
  plantCreds: 300,
  timeoutBuffRounds: 3,
  timeoutPowerBonus: 1.04,
  maxFatigue: 100,
  minStat: 1,
  maxStat: 20
} as const;
