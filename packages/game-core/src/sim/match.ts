import { createMatchEconomy, resetHalfEconomy, type MatchEconomyTeamState } from "../economy/creds";
import type { Player, PlayerMatchStats } from "../models/player";
import { createEmptyMatchStats } from "../models/player";
import type { MatchPrep, Team } from "../models/team";
import type { MatchId, PlayerId, TeamId } from "../types/ids";
import type { Side, SiteFocus } from "../types/enums";
import { createId } from "../types/ids";
import { createSeededRng, type Rng } from "./rng";
import { simulateRound, type RoundSummary } from "./round";
import { timeoutCalled, type RoundEvent } from "./commentary";
import { GAME_CONFIG } from "../config";

export type MatchResult = {
  id: MatchId;
  map: string;
  teamIds: [TeamId, TeamId];
  score: [number, number];
  rounds: RoundSummary[];
  playerStats: Record<PlayerId, PlayerMatchStats>;
  winnerId: TeamId;
};

export type MatchSetup = {
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  homePrep: MatchPrep;
  awayPrep: MatchPrep;
  seed?: number;
};

export type TimeoutAdjustment = {
  teamId: TeamId;
  aggression?: number;
  siteFocus?: SiteFocus | null;
};

export class MatchSimulator {
  private readonly id = createId("match") as MatchId;
  private readonly rng: Rng;
  private score: [number, number] = [0, 0];
  private rounds: RoundSummary[] = [];
  private homeEconomy: MatchEconomyTeamState;
  private awayEconomy: MatchEconomyTeamState;
  private homeSide: Side = "attack";
  private awaySide: Side = "defense";
  private timeoutUsed: Record<TeamId, [boolean, boolean]>;
  private timeoutBuff: Record<TeamId, number>;
  private homePrep: MatchPrep;
  private awayPrep: MatchPrep;

  constructor(private readonly setup: MatchSetup) {
    this.rng = createSeededRng(setup.seed ?? Date.now());
    this.homeEconomy = createMatchEconomy(setup.homeTeam.id);
    this.awayEconomy = createMatchEconomy(setup.awayTeam.id);
    this.homePrep = setup.homePrep;
    this.awayPrep = setup.awayPrep;
    this.timeoutUsed = {
      [setup.homeTeam.id]: [false, false],
      [setup.awayTeam.id]: [false, false]
    };
    this.timeoutBuff = {
      [setup.homeTeam.id]: 0,
      [setup.awayTeam.id]: 0
    };
  }

  get isComplete(): boolean {
    return this.score[0] >= 13 || this.score[1] >= 13;
  }

  get currentScore(): [number, number] {
    return [...this.score];
  }

  get completedRounds(): RoundSummary[] {
    return [...this.rounds];
  }

  callTimeout(adjustment: TimeoutAdjustment): RoundEvent | null {
    const half = this.rounds.length < 12 ? 0 : 1;
    if (this.timeoutUsed[adjustment.teamId]?.[half]) return null;
    this.timeoutUsed[adjustment.teamId][half] = true;
    this.timeoutBuff[adjustment.teamId] = GAME_CONFIG.timeoutBuffRounds;

    if (adjustment.teamId === this.setup.homeTeam.id) {
      this.homePrep = { ...this.homePrep, ...adjustment };
    } else {
      this.awayPrep = { ...this.awayPrep, ...adjustment };
    }

    return timeoutCalled(adjustment.teamId === this.setup.homeTeam.id ? this.setup.homeTeam : this.setup.awayTeam);
  }

  simulateNextRound(): RoundSummary {
    if (this.isComplete) throw new Error("Cannot simulate a completed match.");
    const roundNumber = this.rounds.length + 1;
    if (roundNumber === 13) this.switchSidesAndResetEconomy();

    const result = simulateRound({
      roundNumber,
      home: {
        team: this.setup.homeTeam,
        players: this.setup.homePlayers,
        prep: this.homePrep,
        economy: this.homeEconomy,
        side: this.homeSide,
        timeoutBuffRoundsRemaining: this.timeoutBuff[this.setup.homeTeam.id]
      },
      away: {
        team: this.setup.awayTeam,
        players: this.setup.awayPlayers,
        prep: this.awayPrep,
        economy: this.awayEconomy,
        side: this.awaySide,
        timeoutBuffRoundsRemaining: this.timeoutBuff[this.setup.awayTeam.id]
      },
      scoreBefore: this.score,
      rng: this.rng
    });

    this.score = result.summary.score;
    this.homeEconomy = result.homeEconomy;
    this.awayEconomy = result.awayEconomy;
    this.rounds.push(result.summary);
    this.timeoutBuff[this.setup.homeTeam.id] = Math.max(0, this.timeoutBuff[this.setup.homeTeam.id] - 1);
    this.timeoutBuff[this.setup.awayTeam.id] = Math.max(0, this.timeoutBuff[this.setup.awayTeam.id] - 1);
    return result.summary;
  }

  simulateToEnd(): MatchResult {
    while (!this.isComplete) this.simulateNextRound();
    return this.result();
  }

  result(): MatchResult {
    if (!this.isComplete) throw new Error("Cannot create result before match is complete.");
    return {
      id: this.id,
      map: this.rounds[0]?.map ?? "Unknown",
      teamIds: [this.setup.homeTeam.id, this.setup.awayTeam.id],
      score: this.score,
      rounds: this.rounds,
      playerStats: aggregateStats(this.rounds),
      winnerId: this.score[0] > this.score[1] ? this.setup.homeTeam.id : this.setup.awayTeam.id
    };
  }

  private switchSidesAndResetEconomy() {
    this.homeSide = this.homeSide === "attack" ? "defense" : "attack";
    this.awaySide = this.awaySide === "attack" ? "defense" : "attack";
    this.homeEconomy = resetHalfEconomy(this.homeEconomy);
    this.awayEconomy = resetHalfEconomy(this.awayEconomy);
  }
}

export function simulateMatch(setup: MatchSetup): MatchResult {
  return new MatchSimulator(setup).simulateToEnd();
}

function aggregateStats(rounds: RoundSummary[]): Record<PlayerId, PlayerMatchStats> {
  const aggregate = {} as Record<PlayerId, PlayerMatchStats>;
  for (const round of rounds) {
    for (const [playerId, stats] of Object.entries(round.playerStats) as [PlayerId, PlayerMatchStats][]) {
      aggregate[playerId] ??= createEmptyMatchStats();
      aggregate[playerId].kills += stats.kills;
      aggregate[playerId].deaths += stats.deaths;
      aggregate[playerId].assists += stats.assists;
      aggregate[playerId].damage += stats.damage;
      aggregate[playerId].firstKills += stats.firstKills;
      aggregate[playerId].clutchesWon += stats.clutchesWon;
      aggregate[playerId].clutchesAttempted += stats.clutchesAttempted;
    }
  }
  return aggregate;
}
