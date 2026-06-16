import type { Player } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { getPlayerOverall, getPlayerSeasonStats, getTeamOverall } from '../lib/stats';
import { Card, Eyebrow, Pill, StatTile } from '../components/ui';

const attributeLabels: Array<[keyof Player['attributes'], string]> = [
  ['aim', 'Aim'],
  ['gameSense', 'Game Sense'],
  ['utility', 'Utility'],
  ['clutch', 'Clutch'],
  ['communication', 'Comms'],
  ['consistency', 'Consistency']
];

function barColor(value: number): string {
  if (value >= 80) return 'bg-positive';
  if (value >= 60) return 'bg-valorant';
  if (value >= 40) return 'bg-gold';
  return 'bg-negative';
}

function AttributeBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="tnum font-bold text-ink">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div className={`h-full rounded-full ${barColor(value)}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ConditionMeter({ label, value, tone }: { label: string; value: number; tone: 'good-high' | 'good-low' }) {
  const healthy = tone === 'good-high' ? value >= 60 : value <= 40;
  return (
    <div className="rounded-lg bg-surface-2 px-2.5 py-2">
      <p className="text-[0.6rem] uppercase tracking-wider text-faint">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
          <div className={`h-full rounded-full ${healthy ? 'bg-positive' : 'bg-negative'}`} style={{ width: `${value}%` }} />
        </div>
        <span className="tnum text-xs font-bold">{value}</span>
      </div>
    </div>
  );
}

export function Roster() {
  const game = useGameStore((state) => state.game)!;
  const team = game.teams.find((candidate) => candidate.id === game.userTeamId)!;
  const teamOverall = getTeamOverall(team);
  const avgAge = Math.round(team.players.reduce((sum, player) => sum + player.age, 0) / team.players.length);
  const topPotential = Math.max(...team.players.map((player) => player.attributes.potential));

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Roster</Eyebrow>
          <h1 className="mt-2 text-3xl font-black tracking-tight">{team.name}</h1>
          <p className="mt-1 text-sm text-muted">Your starting five — attributes, condition, and season form.</p>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile label="Team OVR" value={teamOverall} tone="accent" />
          <StatTile label="Avg Age" value={avgAge} />
          <StatTile label="Top Potential" value={topPotential} />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {team.players.map((player) => {
          const overall = getPlayerOverall(player);
          const stats = getPlayerSeasonStats(game, player.id);
          return (
            <Card key={player.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Pill tone="accent">{player.role}</Pill>
                    <span className="text-xs text-faint">Age {player.age}</span>
                  </div>
                  <h2 className="mt-2 text-2xl font-black leading-tight">{player.handle}</h2>
                  <p className="text-sm text-muted">{player.name}</p>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-line bg-surface-2 px-4 py-2.5">
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">Overall</p>
                  <p className="tnum text-3xl font-black text-valorant-bright">{overall}</p>
                  <p className="text-[0.6rem] text-faint">POT {player.attributes.potential}</p>
                </div>
              </div>

              {/* Season stat line */}
              <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl border border-line bg-surface-2 p-2.5 text-center tnum">
                <div>
                  <p className="text-sm font-black">{stats.games}</p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">GP</p>
                </div>
                <div>
                  <p className="text-sm font-black">
                    {stats.kills.toFixed(1)}/{stats.deaths.toFixed(1)}/{stats.assists.toFixed(1)}
                  </p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">K/D/A</p>
                </div>
                <div>
                  <p className={`text-sm font-black ${stats.kd >= 1 ? 'text-positive' : 'text-negative'}`}>{stats.kd.toFixed(2)}</p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">KD</p>
                </div>
                <div>
                  <p className="text-sm font-black">{Math.round(stats.acs)}</p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">ACS</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {attributeLabels.map(([key, label]) => (
                  <AttributeBar key={key} label={label} value={player.attributes[key]} />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <ConditionMeter label="Morale" value={player.attributes.morale} tone="good-high" />
                <ConditionMeter label="Fatigue" value={player.attributes.fatigue} tone="good-low" />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
