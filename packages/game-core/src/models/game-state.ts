import type { CalendarDay } from "../types/enums";
import type { Fixture, Standing } from "./league";
import type { Player } from "./player";
import type { Team } from "./team";
import type { MatchResult } from "../sim/match";

export type CalendarState = {
  week: number;
  day: CalendarDay;
};

export type DayEvent = {
  title: string;
  description: string;
};

export type GameState = {
  calendar: CalendarState;
  userTeamId: Team["id"];
  teams: Team[];
  players: Player[];
  freeAgents: Player[];
  fixtures: Fixture[];
  standings: Standing[];
  matchHistory: MatchResult[];
  news: DayEvent[];
};
