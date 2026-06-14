import { CALENDAR_DAYS, type CalendarDay } from "../types/enums";
import type { CalendarState } from "../models/game-state";

export function nextDay(calendar: CalendarState): CalendarState {
  const dayIndex = CALENDAR_DAYS.indexOf(calendar.day);
  const nextIndex = (dayIndex + 1) % CALENDAR_DAYS.length;
  return {
    week: nextIndex === 0 ? calendar.week + 1 : calendar.week,
    day: CALENDAR_DAYS[nextIndex]
  };
}

export function isTrainingDay(day: CalendarDay): boolean {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day);
}

export function isMatchDay(day: CalendarDay): boolean {
  return day === "Saturday" || day === "Sunday";
}
