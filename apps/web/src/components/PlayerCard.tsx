import { Morale, overallRating, type Player } from "@valorant-manager/game-core";
import { StatBar } from "./StatBar";

type PlayerCardProps = {
  player: Player;
  compact?: boolean;
};

export function PlayerCard({ player, compact = false }: PlayerCardProps) {
  return (
    <article className="panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">{player.name}</h3>
          <p className="text-sm text-slate-400">
            {player.age} years old · ${player.salary.toLocaleString()}/week
          </p>
        </div>
        <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-center">
          <div className="text-xs text-rose-200">OVR</div>
          <div className="text-xl font-bold text-rose-300">{overallRating(player)}</div>
        </div>
      </div>
      {!compact && (
        <div className="mt-4 grid gap-2">
          <StatBar label="Aim" value={player.stats.aim} />
          <StatBar label="Gamesense" value={player.stats.gamesense} />
          <StatBar label="Comms" value={player.stats.communication} />
          <StatBar label="Mental" value={player.stats.mental} />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Morale: {Morale[player.morale]}</span>
            <span>Fatigue: {Math.round(player.fatigue)}%</span>
          </div>
        </div>
      )}
    </article>
  );
}
