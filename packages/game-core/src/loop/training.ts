import { GAME_CONFIG } from "../config";
import type { Player } from "../models/player";
import type { Team } from "../models/team";
import type { TrainingFocus } from "../types/enums";
import { clamp } from "../sim/rng";

export function applyTraining(players: Player[], team: Team, focus: TrainingFocus): Player[] {
  return players.map((player) => {
    if (!team.players.includes(player.id)) return player;
    if (focus === "rest") {
      return { ...player, fatigue: clamp(player.fatigue - 16, 0, GAME_CONFIG.maxFatigue) };
    }

    const updated: Player = {
      ...player,
      stats: { ...player.stats },
      agentMastery: { ...player.agentMastery },
      fatigue: clamp(player.fatigue + 6, 0, GAME_CONFIG.maxFatigue)
    };

    if (focus === "agents") {
      updated.agentMastery = Object.fromEntries(
        Object.entries(updated.agentMastery).map(([role, value]) => [
          role,
          clamp(value + 0.12, GAME_CONFIG.minStat, Math.min(GAME_CONFIG.maxStat, player.potential))
        ])
      ) as Player["agentMastery"];
    } else {
      const statKey = focus === "gamesense" ? "gamesense" : focus;
      updated.stats[statKey] = clamp(
        updated.stats[statKey] + 0.15,
        GAME_CONFIG.minStat,
        Math.min(GAME_CONFIG.maxStat, player.potential)
      );
    }

    return updated;
  });
}

export function recoverAfterMatch(players: Player[], team: Team): Player[] {
  return players.map((player) =>
    team.players.includes(player.id)
      ? { ...player, fatigue: clamp(player.fatigue + 10, 0, GAME_CONFIG.maxFatigue) }
      : player
  );
}
