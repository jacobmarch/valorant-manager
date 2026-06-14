import { overallRating } from "@valorant-manager/game-core";
import { PlayerCard } from "../components/PlayerCard";
import { selectUserTeam, useGameStore } from "../store/game-store";

export function Scouting() {
  const state = useGameStore((store) => store.state);
  const signPlayer = useGameStore((store) => store.signPlayer);
  const team = selectUserTeam(state);
  const sorted = [...state.freeAgents].sort((a, b) => overallRating(b) - overallRating(a));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Scouting</h1>
        <p className="text-slate-400">Budget: ${team.budget.toLocaleString()} · Signing cost is eight weeks of salary.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sorted.slice(0, 12).map((player) => {
          const cost = player.salary * 8;
          return (
            <div key={player.id} className="space-y-3">
              <PlayerCard player={player} compact />
              <div className="flex items-center justify-between rounded-xl bg-slate-950/70 p-3 text-sm">
                <span>Cost: ${cost.toLocaleString()}</span>
                <button
                  disabled={team.budget < cost}
                  onClick={() => signPlayer(player.id)}
                  className="rounded-lg bg-cyan-400 px-3 py-2 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Sign
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
