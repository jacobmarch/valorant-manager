import { weeklyWageBill } from "@valorant-manager/game-core";
import { selectUserTeam, useGameStore } from "../store/game-store";

export function Finance() {
  const state = useGameStore((store) => store.state);
  const team = selectUserTeam(state);
  const wageBill = weeklyWageBill(team, state.players);
  const runway = wageBill > 0 ? Math.floor(team.budget / wageBill) : 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Finance</h1>
        <p className="text-slate-400">Keep the wage bill sustainable while improving the roster.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Budget" value={`$${team.budget.toLocaleString()}`} />
        <Metric label="Weekly wage bill" value={`$${wageBill.toLocaleString()}`} />
        <Metric label="Runway" value={`${runway} weeks`} />
      </div>
      <div className="panel p-5">
        <h2 className="mb-3 text-xl font-semibold">Recent News</h2>
        <div className="space-y-3">
          {state.news.slice(0, 8).map((item, index) => (
            <article key={`${item.title}-${index}`} className="rounded-xl bg-slate-950/70 p-3">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
