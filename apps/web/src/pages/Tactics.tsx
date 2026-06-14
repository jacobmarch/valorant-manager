import { AGENTS, type AgentId, type EconStrategy, type MapId } from "@valorant-manager/game-core";
import { MapBanPhase } from "../components/MapBanPhase";
import { selectLineupPlayers, selectUserTeam, useGameStore } from "../store/game-store";

export function Tactics() {
  const state = useGameStore((store) => store.state);
  const updateUserPrep = useGameStore((store) => store.updateUserPrep);
  const team = selectUserTeam(state);
  const prep = team.defaultPrep;
  const lineup = selectLineupPlayers(state, prep);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tactics</h1>
        <p className="text-slate-400">Pick the map, assign agents, and tune your pre-match style.</p>
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 text-xl font-semibold">Map Pick / Ban</h2>
        <MapBanPhase selectedMap={prep.map} onSelect={(map) => updateUserPrep({ ...prep, map })} />
      </div>

      <div className="panel p-5">
        <h2 className="mb-4 text-xl font-semibold">Team Composition</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {lineup.map((player) => (
            <label key={player.id} className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
              <span className="block font-semibold">{player.name}</span>
              <span className="mb-3 block text-sm text-slate-400">Choose an agent that fits their role mastery.</span>
              <select
                value={prep.agentAssignments[player.id]}
                onChange={(event) =>
                  updateUserPrep({
                    ...prep,
                    agentAssignments: {
                      ...prep.agentAssignments,
                      [player.id]: event.target.value as AgentId
                    }
                  })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              >
                {AGENTS.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.role})
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-xl font-semibold">Playstyle</h2>
          <label className="mt-4 block text-sm text-slate-300">
            Aggression: {prep.aggression}
            <input
              type="range"
              min={0}
              max={100}
              value={prep.aggression}
              onChange={(event) => updateUserPrep({ ...prep, aggression: Number(event.target.value) })}
              className="mt-3 w-full"
            />
          </label>
          <p className="mt-2 text-sm text-slate-400">Low means slower defaults. High means faster executes and riskier opening duels.</p>
        </div>

        <div className="panel p-5">
          <h2 className="text-xl font-semibold">Economic Strategy</h2>
          <select
            value={prep.econStrategy}
            onChange={(event) => updateUserPrep({ ...prep, econStrategy: event.target.value as EconStrategy })}
            className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
          >
            <option value="save">Save</option>
            <option value="balanced">Balanced</option>
            <option value="force">Force Buy</option>
          </select>
        </div>
      </div>
    </section>
  );
}
