import type { ReactNode } from 'react';
import { useGameStore, type Screen } from '../store/useGameStore';

const navItems: Array<{ screen: Screen; label: string }> = [
  { screen: 'dashboard', label: 'Dashboard' },
  { screen: 'roster', label: 'Roster' },
  { screen: 'schedule', label: 'Schedule' },
  { screen: 'standings', label: 'Standings' },
  { screen: 'match', label: 'Match' },
  { screen: 'history', label: 'History' },
  { screen: 'saves', label: 'Save/Load' }
];

export function AppShell({ children }: { children: ReactNode }) {
  const game = useGameStore((state) => state.game);
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const userTeam = game?.teams.find((team) => team.id === game.userTeamId);

  return (
    <div className="min-h-screen bg-[#070b12] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-panel/95 p-5 lg:block">
        <p className="text-xs uppercase tracking-[0.4em] text-valorant">Career</p>
        <h1 className="mt-3 text-2xl font-black">Valorant Manager</h1>
        {userTeam && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${userTeam.colors.primary}, ${userTeam.colors.secondary})` }} />
            <p className="mt-4 text-sm text-slate-400">Manager {game?.managerName}</p>
            <p className="text-lg font-bold">{userTeam.name}</p>
            <p className="text-sm text-slate-500">Day {game?.currentDay}</p>
          </div>
        )}
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.screen}
              className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition ${screen === item.screen ? 'bg-valorant text-white' : 'text-slate-300 hover:bg-white/10'}`}
              onClick={() => setScreen(item.screen)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      <header className="border-b border-white/10 bg-panel/90 p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-valorant">Valorant Manager</p>
            <p className="font-bold">{userTeam?.name}</p>
          </div>
          <select className="rounded-lg bg-slate-950 p-2 text-sm" value={screen} onChange={(event) => setScreen(event.target.value as Screen)}>
            {navItems.map((item) => (
              <option key={item.screen} value={item.screen}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="p-4 lg:ml-64 lg:p-8">{children}</main>
    </div>
  );
}
