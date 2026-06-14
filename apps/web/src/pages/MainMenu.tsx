import { useState } from "react";
import { useGameStore } from "../store/game-store";

export function MainMenu() {
  const [teamName, setTeamName] = useState("Valorant FC");
  const newGame = useGameStore((store) => store.newGame);
  const continueGame = useGameStore((store) => store.setScreen);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#1e293b,#030712_60%)] px-6">
      <section className="panel max-w-2xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-300">Web MVP</p>
        <h1 className="mt-4 text-5xl font-black text-white">Valorant Manager</h1>
        <p className="mt-4 text-slate-300">
          Build a five-player roster, prepare maps and agents, manage salaries, and coach round-by-round
          matches through a text-based Valorant simulator.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={teamName}
            onChange={(event) => setTeamName(event.target.value)}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            placeholder="Team name"
          />
          <button
            onClick={() => newGame(teamName)}
            className="rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-400"
          >
            New Game
          </button>
          <button
            onClick={() => continueGame("squad")}
            className="rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white hover:bg-slate-700"
          >
            Continue
          </button>
        </div>
      </section>
    </main>
  );
}
