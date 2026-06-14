import type { GameState } from "../models/game-state";
import type { PlayerId } from "../types/ids";
import { canSignPlayer, signPlayer } from "../economy/team-budget";

export function signFreeAgent(state: GameState, playerId: PlayerId): GameState {
  const player = state.freeAgents.find((candidate) => candidate.id === playerId);
  if (!player) return state;
  const userTeam = state.teams.find((team) => team.id === state.userTeamId);
  if (!userTeam || !canSignPlayer(userTeam, player)) return state;
  return {
    ...state,
    teams: state.teams.map((team) =>
      team.id === state.userTeamId ? signPlayer(team, player) : team
    ),
    players: [...state.players, player],
    freeAgents: state.freeAgents.filter((candidate) => candidate.id !== playerId),
    news: [
      {
        title: "Free agent signed",
        description: `${player.name} joins your roster on a ${player.contractWeeks}-week deal.`
      },
      ...state.news
    ]
  };
}
