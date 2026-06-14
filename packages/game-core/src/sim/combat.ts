import { GAME_CONFIG } from "../config";
import { buyMultiplier } from "../economy/economy-engine";
import type { MatchEconomyTeamState } from "../economy/creds";
import { effectiveStat, type Player } from "../models/player";
import type { MatchPrep, Team } from "../models/team";
import { getAgent } from "../types/agents";
import { clamp, pickOne, type Rng } from "./rng";
import { evaluateComposition } from "./composition";

export type TeamCombatContext = {
  team: Team;
  players: Player[];
  prep: MatchPrep;
  economy: MatchEconomyTeamState;
  isAttacking: boolean;
  timeoutBuffRoundsRemaining: number;
};

export function calculateTeamPower(context: TeamCombatContext): number {
  const phase = context.isAttacking ? "execute" : "hold";
  const composition = evaluateComposition(context.prep, phase);
  const aggression = context.prep.aggression / 100;
  const playstyleModifier = context.isAttacking
    ? 0.94 + aggression * 0.16
    : 1.06 - aggression * 0.08;
  const cohesionModifier = 0.9 + context.team.teamCohesion / 100;
  const timeoutModifier = context.timeoutBuffRoundsRemaining > 0 ? GAME_CONFIG.timeoutPowerBonus : 1;

  const playerPower = context.players.reduce((sum, player) => {
    const agent = getAgent(context.prep.agentAssignments[player.id]);
    const role = agent.role;
    const combat =
      effectiveStat(player, "aim", role) * 0.33 +
      effectiveStat(player, "gamesense", role) * 0.24 +
      effectiveStat(player, "communication", role) * 0.16 +
      effectiveStat(player, "mental", role) * 0.17 +
      effectiveStat(player, "movement", role) * 0.1;
    return sum + combat;
  }, 0);

  return playerPower * buyMultiplier(context.economy.lastBuy) * composition.modifier * playstyleModifier * cohesionModifier * timeoutModifier;
}

export function resolveWinChance(attackerPower: number, defenderPower: number, mapAttackBias: number): number {
  const diff = (attackerPower - defenderPower) / 12;
  const sigmoid = 1 / (1 + Math.exp(-diff));
  return clamp(sigmoid * 0.85 + mapAttackBias * 0.15, 0.08, 0.92);
}

export function roll(chance: number, rng: Rng): boolean {
  const boundedNoise = (rng() - 0.5) * 0.16;
  return rng() < clamp(chance + boundedNoise, 0.03, 0.97);
}

export function pickOpeningDuel(
  context: TeamCombatContext,
  opponentPlayers: Player[],
  rng: Rng
): { opener: Player; victim: Player } {
  const sorted = [...context.players].sort((a, b) => {
    const aAgent = getAgent(context.prep.agentAssignments[a.id]);
    const bAgent = getAgent(context.prep.agentAssignments[b.id]);
    return effectiveStat(b, "aim", bAgent.role) - effectiveStat(a, "aim", aAgent.role);
  });
  const opener = context.prep.aggression > 65 ? sorted[0] : pickOne(sorted.slice(0, 3), rng);
  const victim = pickOne(opponentPlayers, rng);
  return { opener, victim };
}

export function estimateKills(winningPower: number, losingPower: number, rng: Rng): { winnerKills: number; loserKills: number } {
  const dominance = clamp((winningPower - losingPower) / 55, -0.25, 0.35);
  const loserKills = clamp(Math.round(2 + rng() * 3 - dominance * 4), 0, 5);
  const winnerKills = Math.min(5, Math.max(1, loserKills + 1 + Math.round(rng() * 2)));
  return { winnerKills, loserKills };
}
