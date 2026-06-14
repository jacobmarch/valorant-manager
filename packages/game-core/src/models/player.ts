import { GAME_CONFIG } from "../config";
import type { AgentRole } from "../types/agents";
import { createId, type PlayerId } from "../types/ids";
import { Morale } from "../types/enums";
import { clamp, type Rng } from "../sim/rng";

export type PlayerStats = {
  aim: number;
  gamesense: number;
  communication: number;
  mental: number;
  movement: number;
};

export type AgentMastery = Record<AgentRole, number>;

export type Player = {
  id: PlayerId;
  name: string;
  age: number;
  nationality: string;
  stats: PlayerStats;
  agentMastery: AgentMastery;
  morale: Morale;
  fatigue: number;
  salary: number;
  contractWeeks: number;
  potential: number;
};

export type PlayerMatchStats = {
  kills: number;
  deaths: number;
  assists: number;
  damage: number;
  firstKills: number;
  clutchesWon: number;
  clutchesAttempted: number;
};

const STAT_KEYS = ["aim", "gamesense", "communication", "mental", "movement"] as const;

export function createEmptyMatchStats(): PlayerMatchStats {
  return {
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    firstKills: 0,
    clutchesWon: 0,
    clutchesAttempted: 0
  };
}

export function overallRating(player: Player): number {
  const statsAverage = STAT_KEYS.reduce((sum, key) => sum + player.stats[key], 0) / STAT_KEYS.length;
  const masteryAverage = Object.values(player.agentMastery).reduce((sum, value) => sum + value, 0) / 4;
  return Math.round(statsAverage * 0.8 + masteryAverage * 0.2);
}

export function effectiveStat(player: Player, stat: keyof PlayerStats, role?: AgentRole): number {
  const moraleMultiplier = 0.85 + Number(player.morale) * 0.06;
  const fatigueMultiplier = clamp(1 - player.fatigue / 220, 0.55, 1);
  const roleMultiplier = role ? 0.75 + player.agentMastery[role] / 80 : 1;
  return player.stats[stat] * moraleMultiplier * fatigueMultiplier * roleMultiplier;
}

export function createPlayer(name: string, rng: Rng, ratingFloor = 8, ratingCeiling = 18): Player {
  const stat = () => Math.round(ratingFloor + rng() * (ratingCeiling - ratingFloor));
  const stats: PlayerStats = {
    aim: stat(),
    gamesense: stat(),
    communication: stat(),
    mental: stat(),
    movement: stat()
  };
  const mastery: AgentMastery = {
    Duelist: stat(),
    Initiator: stat(),
    Controller: stat(),
    Sentinel: stat()
  };

  return {
    id: createId("player") as PlayerId,
    name,
    age: Math.round(18 + rng() * 10),
    nationality: "International",
    stats,
    agentMastery: mastery,
    morale: Morale.Average,
    fatigue: Math.round(rng() * 15),
    salary: Math.round(1500 + overallFromParts(stats, mastery) * 450 + rng() * 3000),
    contractWeeks: Math.round(26 + rng() * 78),
    potential: clamp(stat() + Math.round(rng() * 5), GAME_CONFIG.minStat, GAME_CONFIG.maxStat)
  };
}

function overallFromParts(stats: PlayerStats, mastery: AgentMastery): number {
  const statsAverage = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0) / STAT_KEYS.length;
  const masteryAverage = Object.values(mastery).reduce((sum, value) => sum + value, 0) / 4;
  return statsAverage * 0.8 + masteryAverage * 0.2;
}
