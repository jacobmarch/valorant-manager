import { MAP_POOL, type MapId } from "@valorant-manager/game-core";

type MapBanPhaseProps = {
  selectedMap: MapId;
  onSelect: (mapId: MapId) => void;
};

export function MapBanPhase({ selectedMap, onSelect }: MapBanPhaseProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {MAP_POOL.map((map) => (
        <button
          key={map.id}
          onClick={() => onSelect(map.id)}
          className={`rounded-xl border p-4 text-left transition ${
            selectedMap === map.id
              ? "border-cyan-300 bg-cyan-400/15"
              : "border-slate-700 bg-slate-900/70 hover:border-slate-500"
          }`}
        >
          <div className="font-semibold">{map.name}</div>
          <div className="text-sm text-slate-400">{map.sites.length} sites</div>
        </button>
      ))}
    </div>
  );
}
