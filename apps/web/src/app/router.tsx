import type { Screen } from "../store/game-store";

export const ROUTES: { id: Screen; label: string }[] = [
  { id: "squad", label: "Squad" },
  { id: "tactics", label: "Tactics" },
  { id: "schedule", label: "Schedule" },
  { id: "scouting", label: "Scouting" },
  { id: "finance", label: "Finance" },
  { id: "match", label: "Match Day" }
];
