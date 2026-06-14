import { MainMenu } from "../pages/MainMenu";
import { Squad } from "../pages/Squad";
import { Tactics } from "../pages/Tactics";
import { Schedule } from "../pages/Schedule";
import { Scouting } from "../pages/Scouting";
import { Finance } from "../pages/Finance";
import { MatchDay } from "../pages/MatchDay";
import { useGameStore, type Screen } from "../store/game-store";

const NAV: { id: Screen; label: string }[] = [
  { id: "squad", label: "Squad" },
  { id: "tactics", label: "Tactics" },
  { id: "schedule", label: "Schedule" },
  { id: "scouting", label: "Scouting" },
  { id: "finance", label: "Finance" },
  { id: "match", label: "Match Day" }
];

export function App() {
  const screen = useGameStore((store) => store.screen);
  const setScreen = useGameStore((store) => store.setScreen);
  const state = useGameStore((store) => store.state);
  const team = state.teams.find((candidate) => candidate.id === state.userTeamId);

  if (screen === "main") return <MainMenu />;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#172554,#070b12_42%)]">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <button onClick={() => setScreen("main")} className="text-left text-xl font-bold text-white">
              Valorant Manager
            </button>
            <p className="text-sm text-slate-400">
              Week {state.calendar.week}, {state.calendar.day} · {team?.shortName ?? "No team"}
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setScreen(item.id)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  screen === item.id ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{renderScreen(screen)}</main>
    </div>
  );
}

function renderScreen(screen: Screen) {
  switch (screen) {
    case "squad":
      return <Squad />;
    case "tactics":
      return <Tactics />;
    case "schedule":
      return <Schedule />;
    case "scouting":
      return <Scouting />;
    case "finance":
      return <Finance />;
    case "match":
      return <MatchDay />;
    case "main":
      return <MainMenu />;
  }
}
