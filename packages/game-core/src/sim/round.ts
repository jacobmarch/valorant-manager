import { applyBuy, applyRoundEconomy, decideBuy } from "../economy/economy-engine";
import type { MatchEconomyTeamState } from "../economy/creds";
import { getMap } from "../types/agents";
import type { PlayerId, TeamId } from "../types/ids";
import type { SiteFocus, Side } from "../types/enums";
import { createEmptyMatchStats, type Player, type PlayerMatchStats } from "../models/player";
import type { MatchPrep, Team } from "../models/team";
import {
  calculateTeamPower,
  estimateKills,
  pickOpeningDuel,
  resolveWinChance,
  roll,
  type TeamCombatContext
} from "./combat";
import { clutch, ecoWin, openingPick, retake, roundWin, spikePlanted, type RoundEvent } from "./commentary";
import { pickOne, type Rng } from "./rng";

export type RoundTeamInput = {
  team: Team;
  players: Player[];
  prep: MatchPrep;
  economy: MatchEconomyTeamState;
  side: Side;
  timeoutBuffRoundsRemaining: number;
};

export type RoundSummary = {
  roundNumber: number;
  map: string;
  winnerId: TeamId;
  attackerId: TeamId;
  defenderId: TeamId;
  site: SiteFocus;
  score: [number, number];
  events: RoundEvent[];
  buyPhases: Record<TeamId, string>;
  playerStats: Record<PlayerId, PlayerMatchStats>;
};

export type RoundResult = {
  summary: RoundSummary;
  homeEconomy: MatchEconomyTeamState;
  awayEconomy: MatchEconomyTeamState;
};

export function simulateRound(input: {
  roundNumber: number;
  home: RoundTeamInput;
  away: RoundTeamInput;
  scoreBefore: [number, number];
  rng: Rng;
}): RoundResult {
  const homeBuy = decideBuy(input.home.economy, input.home.prep.econStrategy);
  const awayBuy = decideBuy(input.away.economy, input.away.prep.econStrategy);
  const homeEconomyAfterBuy = applyBuy(input.home.economy, homeBuy);
  const awayEconomyAfterBuy = applyBuy(input.away.economy, awayBuy);
  const map = getMap(input.home.prep.map);
  const homeContext = createContext(input.home, homeEconomyAfterBuy);
  const awayContext = createContext(input.away, awayEconomyAfterBuy);
  const attacker = input.home.side === "attack" ? homeContext : awayContext;
  const defender = input.home.side === "defense" ? homeContext : awayContext;
  const attackerTeamInput = input.home.side === "attack" ? input.home : input.away;
  const defenderTeamInput = input.home.side === "defense" ? input.home : input.away;
  const attackerPower = calculateTeamPower(attacker);
  const defenderPower = calculateTeamPower(defender);
  const attackWinChance = resolveWinChance(attackerPower, defenderPower, map.attackBias);
  const attackerWins = roll(attackWinChance, input.rng);
  const site = chooseSite(attackerTeamInput.prep, map.sites, input.rng);
  const score: [number, number] = [...input.scoreBefore];
  const homeWon = attackerWins ? attacker.team.id === input.home.team.id : defender.team.id === input.home.team.id;
  score[homeWon ? 0 : 1] += 1;

  const winningContext = homeWon ? homeContext : awayContext;
  const losingContext = homeWon ? awayContext : homeContext;
  const { winnerKills, loserKills } = estimateKills(
    calculateTeamPower(winningContext),
    calculateTeamPower(losingContext),
    input.rng
  );
  const playerStats = buildPlayerStats(input.home.players, input.away.players);
  distributeKills(winningContext.players, losingContext.players, playerStats, winnerKills, loserKills, input.rng);

  const events = buildEvents({
    attacker,
    defender,
    attackerWins,
    site,
    score,
    winner: winningContext.team,
    winnerBuy: winningContext.team.id === input.home.team.id ? homeBuy : awayBuy,
    loserBuy: losingContext.team.id === input.home.team.id ? homeBuy : awayBuy,
    rng: input.rng
  });

  const economy = applyRoundEconomy(
    homeWon ? homeEconomyAfterBuy : awayEconomyAfterBuy,
    homeWon ? awayEconomyAfterBuy : homeEconomyAfterBuy,
    {
      winnerKills,
      loserKills,
      spikePlanted: attackerWins || input.rng() > 0.35,
      attackerWon: attackerWins
    }
  );

  return {
    summary: {
      roundNumber: input.roundNumber,
      map: map.name,
      winnerId: winningContext.team.id,
      attackerId: attacker.team.id,
      defenderId: defender.team.id,
      site,
      score,
      events,
      buyPhases: {
        [input.home.team.id]: homeBuy,
        [input.away.team.id]: awayBuy
      },
      playerStats
    },
    homeEconomy: homeWon ? economy.winner : economy.loser,
    awayEconomy: homeWon ? economy.loser : economy.winner
  };
}

function createContext(input: RoundTeamInput, economy: MatchEconomyTeamState): TeamCombatContext {
  return {
    team: input.team,
    players: input.players,
    prep: input.prep,
    economy,
    isAttacking: input.side === "attack",
    timeoutBuffRoundsRemaining: input.timeoutBuffRoundsRemaining
  };
}

function chooseSite(prep: MatchPrep, sites: readonly SiteFocus[], rng: Rng): SiteFocus {
  if (prep.siteFocus && sites.includes(prep.siteFocus) && rng() < 0.68) return prep.siteFocus;
  return pickOne(sites, rng);
}

function buildPlayerStats(homePlayers: Player[], awayPlayers: Player[]): Record<PlayerId, PlayerMatchStats> {
  return [...homePlayers, ...awayPlayers].reduce<Record<PlayerId, PlayerMatchStats>>((stats, player) => {
    stats[player.id] = createEmptyMatchStats();
    return stats;
  }, {} as Record<PlayerId, PlayerMatchStats>);
}

function distributeKills(
  winners: Player[],
  losers: Player[],
  playerStats: Record<PlayerId, PlayerMatchStats>,
  winnerKills: number,
  loserKills: number,
  rng: Rng
) {
  for (let index = 0; index < winnerKills; index += 1) {
    const killer = pickOne(winners, rng);
    const victim = pickOne(losers, rng);
    playerStats[killer.id].kills += 1;
    playerStats[killer.id].damage += 145;
    playerStats[victim.id].deaths += 1;
  }
  for (let index = 0; index < loserKills; index += 1) {
    const killer = pickOne(losers, rng);
    const victim = pickOne(winners, rng);
    playerStats[killer.id].kills += 1;
    playerStats[killer.id].damage += 130;
    playerStats[victim.id].deaths += 1;
  }
}

function buildEvents(input: {
  attacker: TeamCombatContext;
  defender: TeamCombatContext;
  attackerWins: boolean;
  site: SiteFocus;
  score: [number, number];
  winner: Team;
  winnerBuy: string;
  loserBuy: string;
  rng: Rng;
}): RoundEvent[] {
  const openerTeam = input.attacker.prep.aggression > 55 ? input.attacker : input.defender;
  const opponentPlayers = openerTeam.team.id === input.attacker.team.id ? input.defender.players : input.attacker.players;
  const { opener, victim } = pickOpeningDuel(openerTeam, opponentPlayers, input.rng);
  const events: RoundEvent[] = [openingPick(opener, victim, input.site)];
  if (input.attackerWins) {
    events.push(spikePlanted(input.attacker.team, input.site));
  } else {
    events.push(retake(input.defender.team, input.site));
  }
  if (input.rng() > 0.82) {
    events.push(clutch(pickOne(input.winner.id === input.attacker.team.id ? input.attacker.players : input.defender.players, input.rng), 2));
  }
  if (input.winnerBuy === "eco" && input.loserBuy !== "eco") {
    events.push(ecoWin(input.winner));
  }
  events.push(roundWin(input.winner, input.score));
  return events;
}
