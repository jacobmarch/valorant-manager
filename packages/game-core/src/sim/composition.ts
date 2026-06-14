import { getAgent, type AgentRole } from "../types/agents";
import type { PlayerId } from "../types/ids";
import type { MatchPrep } from "../models/team";

export type CompositionReport = {
  roles: Record<AgentRole, number>;
  modifier: number;
  notes: string[];
};

const ROLES: AgentRole[] = ["Duelist", "Initiator", "Controller", "Sentinel"];

export function evaluateComposition(prep: MatchPrep, phase: "execute" | "hold"): CompositionReport {
  const roles = ROLES.reduce<Record<AgentRole, number>>((counts, role) => {
    counts[role] = 0;
    return counts;
  }, {} as Record<AgentRole, number>);

  prep.lineup.forEach((playerId: PlayerId) => {
    roles[getAgent(prep.agentAssignments[playerId]).role] += 1;
  });

  let modifier = 1;
  const notes: string[] = [];

  if (ROLES.every((role) => roles[role] >= 1)) {
    modifier += 0.05;
    notes.push("balanced composition");
  }
  if (roles.Controller === 0) {
    modifier -= phase === "hold" ? 0.08 : 0.04;
    notes.push("missing controller");
  }
  if (roles.Initiator === 0) {
    modifier -= phase === "execute" ? 0.08 : 0.04;
    notes.push("missing initiator");
  }
  if (roles.Duelist >= 2) {
    modifier += 0.02;
    notes.push("double duelist pressure");
  }

  return { roles, modifier, notes };
}
