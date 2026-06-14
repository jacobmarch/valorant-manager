import { createDefaultPrep, type PlayerId } from "@valorant-manager/game-core";
import { PlayerCard } from "../components/PlayerCard";
import { selectUserTeam, useGameStore } from "../store/game-store";

export function Squad() {
  const state = useGameStore((store) => store.state);
  const updateUserPrep = useGameStore((store) => store.updateUserPrep);
  const team = selectUserTeam(state);
  const playerMap = new Map(state.players.map((player) => [player.id, player]));
  const starters = team.starters.map((id) => playerMap.get(id)).filter(Boolean);
  const bench = team.players
    .filter((id) => !team.starters.includes(id))
    .map((id) => playerMap.get(id))
    .filter(Boolean);

  function promote(playerId: PlayerId) {
    const lineup = [...team.starters.slice(1), playerId];
    updateUserPrep(createDefaultPrep(lineup, team.defaultPrep.map));
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Squad</h1>
        <p className="text-slate-400">Five active starters and one bench player for the MVP roster.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        {starters.map((player, index) =>
          player ? (
            <div key={player.id} className="space-y-2">
              <p className="text-sm font-semibold text-cyan-300">Starter {index + 1}</p>
              <PlayerCard player={player} />
            </div>
          ) : null
        )}
      </div>
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Bench</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bench.map((player) =>
            player ? (
              <div key={player.id} className="space-y-3">
                <PlayerCard player={player} compact />
                <button
                  onClick={() => promote(player.id)}
                  className="w-full rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-300"
                >
                  Rotate into starters
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}
