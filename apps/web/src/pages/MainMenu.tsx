import { createSampleTeams } from '@valorant-manager/game-core';
import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';

export function MainMenu() {
  const teams = createSampleTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0].id);
  const [managerName, setManagerName] = useState('Alex Carter');
  const createGame = useGameStore((state) => state.createGame);
  const hasSave = useGameStore((state) => Boolean(state.game));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#1f2937,#070b12_55%)] px-4 py-10 text-ink">
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-panel/80 p-8 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.5em] text-valorant">New Career</p>
        <h1 className="mt-4 text-5xl font-black">Valorant Manager</h1>
        <p className="mt-4 max-w-2xl text-slate-300">Take control of a fictional Valorant team, manage your roster, play a double round-robin league, and build a match history one day at a time.</p>
        <label className="mt-8 block max-w-sm">
          <span className="text-sm font-semibold text-slate-300">Manager name</span>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-valorant/40 focus:ring-2"
            value={managerName}
            onChange={(event) => setManagerName(event.target.value)}
            placeholder="Enter your name"
          />
        </label>
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {teams.map((team) => (
            <button
              key={team.id}
              className={`rounded-2xl border p-4 text-left transition ${selectedTeamId === team.id ? 'border-valorant bg-valorant/15' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
              onClick={() => setSelectedTeamId(team.id)}
            >
              <div className="mb-4 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${team.colors.primary}, ${team.colors.secondary})` }} />
              <p className="text-xs text-slate-400">{team.city}</p>
              <h2 className="text-lg font-bold">{team.name}</h2>
              <p className="mt-2 text-xs text-slate-500">{team.players.map((player) => player.handle).join(' / ')}</p>
            </button>
          ))}
        </div>
        {hasSave && <p className="mt-4 text-sm text-slate-400">A previous save exists and will be replaced if you start a new career.</p>}
        <button className="mt-8 rounded-xl bg-valorant px-6 py-3 font-bold text-white shadow-lg shadow-valorant/20" onClick={() => createGame(managerName, selectedTeamId)}>
          Start Career
        </button>
      </section>
    </main>
  );
}
