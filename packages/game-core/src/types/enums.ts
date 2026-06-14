export enum Morale {
  Abysmal = 1,
  Poor = 2,
  Average = 3,
  Good = 4,
  Superb = 5
}

export type BuyPhase = "eco" | "force" | "half" | "full";
export type EconStrategy = "save" | "balanced" | "force";
export type TrainingFocus = "aim" | "gamesense" | "communication" | "agents" | "rest";
export type SiteFocus = "A" | "B" | "C";
export type Side = "attack" | "defense";

export type CalendarDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export const CALENDAR_DAYS: CalendarDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
