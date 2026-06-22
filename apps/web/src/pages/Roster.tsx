import type { Player } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { getPlayerOverall, getPlayerSeasonStats, getTeamOverall } from '../lib/stats';
import { AttributeBar, Card, ConditionMeter, Eyebrow, Pill, StatTile, TeamSpine } from '../components/ui';
import { useDrilldown } from '../components/Drilldown';

const attributeLabels: Array<[keyof Player['attributes'], string]> = [
  ['aim', 'Aim'],
  ['gameSense', 'Game Sense'],
  ['utility', 'Utility'],
  ['clutch', 'Clutch'],
  ['communication', 'Comms'],
  ['consistency', 'Consistency']
];

export function Roster() {
  const game = useGameStore((state) => state.game)!;
  const team = game.teams.find((candidate) => candidate.id === game.userTeamId)!;
  const teamOverall = getTeamOverall(team);
  const avgAge = Math.round(team.players.reduce((sum, player) => sum + player.age, 0) / team.players.length);
  const topPotential = Math.max(...team.players.map((player) => player.attributes.potential));

  const { openPlayer } = useDrilldown();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <TeamSpine colors={team.colors} className="h-12 w-1.5" />
          <div>
            <Eyebrow>Roster</Eyebrow>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">{team.name}</h1>
            <p className="mt-1 text-sm text-muted">Your starting five — tap a player for their full profile and game log.</p>
          </div>
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
            <Card key={player.id} onClick={() => openPlayer(player.id)} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <TeamSpine colors={team.colors} className="mt-1 h-12 w-1" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Pill tone="accent">{player.role}</Pill>
                      <span className="text-xs text-faint">Age {player.age}</span>
                    </div>
                    <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{player.handle}</h2>
                    <p className="text-sm text-muted">{player.name}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center rounded-md border border-line bg-surface-2 px-4 py-2.5">
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">Overall</p>
                  <p className="font-display tnum text-3xl font-bold text-valorant-bright">{overall}</p>
                  <p className="text-[0.6rem] text-faint">POT {player.attributes.potential}</p>
                </div>
              </div>

              {/* Season stat line */}
              <div className="mt-4 grid grid-cols-4 gap-2 rounded-md border border-line bg-surface-2 p-2.5 text-center tnum">
                <div>
                  <p className="font-display text-sm font-bold">{stats.games}</p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">GP</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold">
                    {stats.kills.toFixed(1)}/{stats.deaths.toFixed(1)}/{stats.assists.toFixed(1)}
                  </p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">K/D/A</p>
                </div>
                <div>
                  <p className={`font-display text-sm font-bold ${stats.kd >= 1 ? 'text-positive' : 'text-negative'}`}>{stats.kd.toFixed(2)}</p>
                  <p className="text-[0.6rem] uppercase tracking-wider text-faint">KD</p>
                </div>
                <div>
                  <p className="font-display text-sm font-bold">{Math.round(stats.acs)}</p>
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
