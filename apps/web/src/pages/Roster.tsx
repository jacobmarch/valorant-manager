import type { Player } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';

const attributeLabels: Array<[keyof Player['attributes'], string]> = [
  ['aim', 'Aim'],
  ['gameSense', 'Game Sense'],
  ['utility', 'Utility'],
  ['clutch', 'Clutch'],
  ['communication', 'Comms'],
  ['consistency', 'Consistency'],
  ['potential', 'Potential'],
  ['morale', 'Morale'],
  ['fatigue', 'Fatigue']
];

function AttributeBar({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  const color = danger ? 'bg-amber-400' : 'bg-valorant';
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Roster() {
  const game = useGameStore((state) => state.game)!;
  const team = game.teams.find((candidate) => candidate.id === game.userTeamId)!;

  return (
    <section>
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-valorant">Roster</p>
        <h1 className="mt-2 text-3xl font-black">{team.name}</h1>
        <p className="mt-2 text-slate-400">Your starting five. No bench, contracts, or transfers yet: the MVP is focused on the playable loop.</p>
      </div>
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {team.players.map((player) => (
          <article key={player.id} className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-slate-500">{player.role}</p>
                <h2 className="text-2xl font-black">{player.handle}</h2>
                <p className="text-slate-400">{player.name} · Age {player.age}</p>
              </div>
              <div className="rounded-xl bg-slate-950 px-4 py-2 text-right">
                <p className="text-xs text-slate-500">Potential</p>
                <p className="text-2xl font-black">{player.attributes.potential}</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {attributeLabels.map(([key, label]) => (
                <AttributeBar key={key} label={label} value={player.attributes[key]} danger={key === 'fatigue'} />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
