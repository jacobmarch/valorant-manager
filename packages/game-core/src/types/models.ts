export type TeamId = string;
export type PlayerId = string;
export type FixtureId = string;

export type PlayerRole = 'duelist' | 'initiator' | 'controller' | 'sentinel' | 'flex';
export type SeasonPhase = 'regularSeason' | 'playoffs' | 'seasonReview';
export type FixtureType = 'regular' | 'playoff';
export type PlayoffRound = 'semifinal' | 'final';

export interface PlayerAttributes {
  aim: number;
  gameSense: number;
  utility: number;
  clutch: number;
  communication: number;
  consistency: number;
  potential: number;
  morale: number;
  fatigue: number;
}

export interface Player {
  id: PlayerId;
  teamId: TeamId;
  name: string;
  handle: string;
  role: PlayerRole;
  age: number;
  attributes: PlayerAttributes;
}

export interface Team {
  id: TeamId;
  name: string;
  shortName: string;
  city: string;
  colors: {
    primary: string;
    secondary: string;
  };
  players: Player[];
}

export interface Fixture {
  id: FixtureId;
  seasonYear: number;
  type: FixtureType;
  day: number;
  matchday: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  playoffRound?: PlayoffRound;
  homeSeed?: number;
  awaySeed?: number;
  result?: MatchResult;
}

export interface MatchResult {
  id: string;
  fixtureId: FixtureId;
  seasonYear: number;
  fixtureType: FixtureType;
  playoffRound?: PlayoffRound;
  day: number;
  matchday: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeRounds: number;
  awayRounds: number;
  winnerTeamId: TeamId;
  boxScore: PlayerMatchStat[];
  summary: string;
}

export interface PlayerMatchStat {
  playerId: PlayerId;
  teamId: TeamId;
  kills: number;
  deaths: number;
  assists: number;
  acs: number;
}

export interface StandingsRow {
  teamId: TeamId;
  played: number;
  wins: number;
  losses: number;
  roundsFor: number;
  roundsAgainst: number;
  roundDiff: number;
  points: number;
}

export interface PlayoffSeed {
  seed: number;
  teamId: TeamId;
}

export interface PlayoffBracket {
  seasonYear: number;
  seeds: PlayoffSeed[];
  championTeamId?: TeamId;
  runnerUpTeamId?: TeamId;
}

export interface SeasonSummary {
  seasonYear: number;
  championTeamId: TeamId;
  runnerUpTeamId: TeamId;
  finalResultId: string;
  standings: StandingsRow[];
  completedAtDay: number;
}

export interface GameState {
  version: 2;
  createdAt: string;
  managerName: string;
  seasonYear: number;
  seasonPhase: SeasonPhase;
  currentDay: number;
  userTeamId: TeamId;
  teams: Team[];
  schedule: Fixture[];
  matchHistory: MatchResult[];
  standings: StandingsRow[];
  playoffBracket?: PlayoffBracket;
  seasonHistory: SeasonSummary[];
}
