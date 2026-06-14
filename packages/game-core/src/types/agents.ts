import type { AgentId, MapId } from "./ids";

export type AgentRole = "Duelist" | "Initiator" | "Controller" | "Sentinel";

export type Agent = {
  id: AgentId;
  name: string;
  role: AgentRole;
  abilities: string[];
};

export type ValorantMap = {
  id: MapId;
  name: string;
  sites: readonly ("A" | "B" | "C")[];
  attackBias: number;
};

function agent(id: string, name: string, role: AgentRole, abilities: string[]): Agent {
  return { id: id as AgentId, name, role, abilities };
}

function map(id: string, name: string, sites: readonly ("A" | "B" | "C")[], attackBias: number): ValorantMap {
  return { id: id as MapId, name, sites, attackBias };
}

export const AGENTS: Agent[] = [
  agent("jett", "Jett", "Duelist", ["Cloudburst", "Updraft", "Tailwind"]),
  agent("raze", "Raze", "Duelist", ["Boom Bot", "Paint Shells", "Blast Pack"]),
  agent("neon", "Neon", "Duelist", ["Relay Bolt", "High Gear", "Fast Lane"]),
  agent("sova", "Sova", "Initiator", ["Recon Bolt", "Owl Drone", "Shock Bolt"]),
  agent("fade", "Fade", "Initiator", ["Haunt", "Prowler", "Seize"]),
  agent("breach", "Breach", "Initiator", ["Flashpoint", "Fault Line", "Aftershock"]),
  agent("omen", "Omen", "Controller", ["Dark Cover", "Paranoia", "Shrouded Step"]),
  agent("viper", "Viper", "Controller", ["Toxic Screen", "Poison Cloud", "Snake Bite"]),
  agent("brimstone", "Brimstone", "Controller", ["Sky Smoke", "Stim Beacon", "Incendiary"]),
  agent("killjoy", "Killjoy", "Sentinel", ["Turret", "Alarmbot", "Nanoswarm"]),
  agent("cypher", "Cypher", "Sentinel", ["Spycam", "Trapwire", "Cyber Cage"]),
  agent("sage", "Sage", "Sentinel", ["Barrier Orb", "Slow Orb", "Healing Orb"])
];

export const MAP_POOL: ValorantMap[] = [
  map("ascent", "Ascent", ["A", "B"], 0.49),
  map("bind", "Bind", ["A", "B"], 0.51),
  map("haven", "Haven", ["A", "B", "C"], 0.5),
  map("split", "Split", ["A", "B"], 0.46),
  map("lotus", "Lotus", ["A", "B", "C"], 0.52),
  map("sunset", "Sunset", ["A", "B"], 0.5),
  map("icebox", "Icebox", ["A", "B"], 0.53)
];

export function getAgent(agentId: AgentId): Agent {
  const agent = AGENTS.find((candidate) => candidate.id === agentId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  return agent;
}

export function getMap(mapId: MapId): ValorantMap {
  const value = MAP_POOL.find((candidate) => candidate.id === mapId);
  if (!value) throw new Error(`Unknown map: ${mapId}`);
  return value;
}

export function agentsForRole(role: AgentRole): Agent[] {
  return AGENTS.filter((agent) => agent.role === role);
}
