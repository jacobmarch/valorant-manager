import { AGENTS, MAP_POOL, type AgentRole } from "../types/agents";
import type { EconStrategy, SiteFocus } from "../types/enums";
import { createId, type AgentId, type MapId, type PlayerId, type TeamId } from "../types/ids";
import type { Player } from "./player";

export type MatchPrep = {
  map: MapId;
  lineup: PlayerId[];
  agentAssignments: Record<PlayerId, AgentId>;
  aggression: number;
  econStrategy: EconStrategy;
  siteFocus?: SiteFocus | null;
};

export type Team = {
  id: TeamId;
  name: string;
  shortName: string;
  region: string;
  players: PlayerId[];
  starters: PlayerId[];
  coach: string;
  budget: number;
  wins: number;
  losses: number;
  mapDifferential: number;
  teamCohesion: number;
  defaultPrep: MatchPrep;
};

export function createTeam(
  name: string,
  shortName: string,
  region: string,
  players: Player[],
  coach = "You",
  budget = 500_000
): Team {
  const starters = players.slice(0, 5).map((player) => player.id);
  const defaultMap = MAP_POOL[0].id;
  return {
    id: createId("team") as TeamId,
    name,
    shortName,
    region,
    players: players.map((player) => player.id),
    starters,
    coach,
    budget,
    wins: 0,
    losses: 0,
    mapDifferential: 0,
    teamCohesion: 10,
    defaultPrep: createDefaultPrep(starters, defaultMap)
  };
}

export function createDefaultPrep(lineup: PlayerId[], map: MapId = MAP_POOL[0].id): MatchPrep {
  const roleOrder: AgentRole[] = ["Duelist", "Initiator", "Controller", "Sentinel", "Initiator"];
  const agentAssignments = lineup.reduce<Record<PlayerId, AgentId>>((assignments, playerId, index) => {
    const role = roleOrder[index] ?? "Duelist";
    const agent = AGENTS.find((candidate) => candidate.role === role) ?? AGENTS[0];
    assignments[playerId] = agent.id;
    return assignments;
  }, {} as Record<PlayerId, AgentId>);

  return {
    map,
    lineup,
    agentAssignments,
    aggression: 50,
    econStrategy: "balanced",
    siteFocus: null
  };
}

export function getTeamPlayers(team: Team, players: Player[]): Player[] {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return team.players.map((id) => playerMap.get(id)).filter((player): player is Player => Boolean(player));
}

export function getLineupPlayers(prep: MatchPrep, players: Player[]): Player[] {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return prep.lineup.map((id) => playerMap.get(id)).filter((player): player is Player => Boolean(player));
}

export function ensureValidPrep(team: Team, prep: MatchPrep): MatchPrep {
  const lineup = prep.lineup.filter((id) => team.players.includes(id)).slice(0, 5);
  const fullLineup = lineup.length === 5 ? lineup : team.starters;
  return {
    ...prep,
    lineup: fullLineup,
    agentAssignments: fullLineup.reduce<Record<PlayerId, AgentId>>((assignments, id) => {
      assignments[id] = prep.agentAssignments[id] ?? team.defaultPrep.agentAssignments[id] ?? AGENTS[0].id;
      return assignments;
    }, {} as Record<PlayerId, AgentId>)
  };
}
