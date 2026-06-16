import { createSampleTeams } from '@valorant-manager/game-core';
import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { getTeamOverall } from '../lib/stats';
import { Button, Eyebrow } from '../components/ui';

export function MainMenu() {
  const teams = createSampleTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0].id);
  const [managerName, setManagerName] = useState('Alex Carter');
  const createGame = useGameStore((state) => state.createGame);
  const hasSave = useGameStore((state) => Boolean(state.game));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#241016,#0a0a0d_55%)] px-4 py-10 text-ink">
      <section className="mx-auto max-w-5xl rounded-3xl border border-border bg-surface/90 p-8 shadow-2xl">
        <Eyebrow className="tracking-[0.5em]">New Career</Eyebrow>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Valorant Manager</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Take control of a fictional Valorant team, manage your roster, play a double round-robin league, and build a match history one day at a time.
        </p>

        <label className="mt-8 block max-w-sm">
          <span className="text-sm font-semibold text-muted">Manager name</span>
          <input
            className="mt-2 w-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-ink outline-none transition focus:border-valorant focus:ring-2 focus:ring-valorant/40"
            value={managerName}
            onChange={(event) => setManagerName(event.target.value)}
            placeholder="Enter your name"
          />
        </label>

        <p className="mt-8 text-sm font-semibold text-muted">Choose your team</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {teams.map((team) => {
            const selected = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                className={`overflow-hidden rounded-2xl border text-left transition ${
                  selected ? 'border-valorant bg-valorant/10 ring-1 ring-valorant/40' : 'border-border bg-surface-2 hover:border-valorant/40'
                }`}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${team.colors.primary}, ${team.colors.secondary})` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-faint">{team.city}</p>
                      <h2 className="text-lg font-black leading-tight">{team.name}</h2>
                    </div>
                    <div className="rounded-lg bg-surface-3 px-2 py-1 text-center">
                      <p className="text-[0.55rem] uppercase tracking-wider text-faint">OVR</p>
                      <p className="tnum text-lg font-black text-valorant-bright">{getTeamOverall(team)}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted">{team.players.map((player) => player.handle).join(' · ')}</p>
                </div>
              </button>
            );
          })}
        </div>

        {hasSave && <p className="mt-4 text-sm text-faint">A previous save exists and will be replaced if you start a new career.</p>}
        <Button className="mt-8 px-6 py-3" onClick={() => createGame(managerName, selectedTeamId)}>
          Start Career
        </Button>
      </section>
    </main>
  );
}
