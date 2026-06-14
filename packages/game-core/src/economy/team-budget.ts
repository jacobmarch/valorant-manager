import type { Player } from "../models/player";
import type { Team } from "../models/team";

export function weeklyWageBill(team: Team, players: Player[]): number {
  const playerMap = new Map(players.map((player) => [player.id, player]));
  return team.players.reduce((sum, playerId) => sum + (playerMap.get(playerId)?.salary ?? 0), 0);
}

export function canSignPlayer(team: Team, player: Player): boolean {
  const upfrontCost = player.salary * 8;
  return team.budget >= upfrontCost;
}

export function signPlayer(team: Team, player: Player): Team {
  if (!canSignPlayer(team, player) || team.players.includes(player.id)) return team;
  return {
    ...team,
    budget: team.budget - player.salary * 8,
    players: [...team.players, player.id]
  };
}

export function payWeeklySalaries(team: Team, players: Player[]): Team {
  return {
    ...team,
    budget: team.budget - weeklyWageBill(team, players)
  };
}

export function awardPrizeMoney(team: Team, amount: number): Team {
  return {
    ...team,
    budget: team.budget + amount
  };
}
