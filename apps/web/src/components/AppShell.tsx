import type { ReactNode } from 'react';
import { getNextUserFixture } from '@valorant-manager/game-core';
import { useGameStore, type Screen } from '../store/useGameStore';
import { getTeamForm, teamName } from '../lib/stats';
import { FormStreak, Pill } from './ui';

const navItems: Array<{ screen: Screen; label: string; icon: string }> = [
  { screen: 'dashboard', label: 'Dashboard', icon: '◆' },
  { screen: 'roster', label: 'Roster', icon: '☰' },
  { screen: 'schedule', label: 'Schedule', icon: '▦' },
  { screen: 'standings', label: 'Standings', icon: '▲' },
  { screen: 'match', label: 'Match Center', icon: '✦' },
  { screen: 'aroundLeague', label: 'Around League', icon: '◈' },
  { screen: 'history', label: 'History', icon: '⟲' },
  { screen: 'saves', label: 'Save / Load', icon: '⛁' }
];

function phaseTone(phase: string) {
  if (phase === 'playoffs') return 'gold' as const;
  if (phase === 'seasonReview') return 'accent' as const;
  return 'positive' as const;
}

export function AppShell({ children }: { children: ReactNode }) {
  const game = useGameStore((state) => state.game);
  const screen = useGameStore((state) => state.screen);
  const setScreen = useGameStore((state) => state.setScreen);
  const advanceDay = useGameStore((state) => state.advanceDay);

  const userTeam = game?.teams.find((team) => team.id === game.userTeamId);
  const standing = game?.standings.find((row) => row.teamId === game.userTeamId);
  const nextFixture = game ? getNextUserFixture(game) : undefined;
  const opponentId = nextFixture
    ? nextFixture.homeTeamId === game!.userTeamId
      ? nextFixture.awayTeamId
      : nextFixture.homeTeamId
    : undefined;
  const advanceLabel = game?.seasonPhase === 'seasonReview' ? 'Start Next Season' : 'Advance Day';
  const phaseLabel = game?.seasonPhase === 'playoffs' ? 'Playoffs' : game?.seasonPhase === 'seasonReview' ? 'Review' : 'Regular Season';

  return (
    <div className="min-h-screen bg-bg text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border bg-surface lg:flex">
        <div className="border-b border-border p-5">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-valorant">Career Mode</p>
          <h1 className="mt-1.5 text-xl font-black tracking-tight">Valorant Manager</h1>
        </div>

        {userTeam && game && (
          <div className="p-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${userTeam.colors.primary}, ${userTeam.colors.secondary})` }} />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-faint">{userTeam.city}</p>
                  <Pill tone={phaseTone(game.seasonPhase)}>{phaseLabel}</Pill>
                </div>
                <p className="mt-1 text-lg font-black leading-tight">{userTeam.name}</p>
                <p className="text-xs text-muted">Mgr. {game.managerName} · Day {game.currentDay}</p>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-3 px-3 py-2">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider text-faint">Record</p>
                    <p className="tnum text-lg font-black">
                      {standing?.wins ?? 0}-{standing?.losses ?? 0}
                    </p>
                  </div>
                  <FormStreak form={getTeamForm(game, game.userTeamId, 5)} />
                </div>

                <button
                  className="mt-3 w-full rounded-xl bg-valorant px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-valorant/20 transition hover:bg-valorant-bright"
                  onClick={advanceDay}
                >
                  {advanceLabel}
                </button>

                {nextFixture && opponentId && (
                  <button
                    onClick={() => setScreen('match')}
                    className="mt-2 flex w-full items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-left transition hover:border-valorant/50"
                  >
                    <span>
                      <span className="block text-[0.6rem] uppercase tracking-wider text-faint">Next match · Day {nextFixture.day}</span>
                      <span className="text-sm font-bold">vs {teamName(game, opponentId)}</span>
                    </span>
                    <span className="text-valorant">→</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5">
          {navItems.map((item) => {
            const active = screen === item.screen;
            return (
              <button
                key={item.screen}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active ? 'bg-valorant/15 text-valorant-bright ring-1 ring-valorant/30' : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`}
                onClick={() => setScreen(item.screen)}
              >
                <span className={`w-4 text-center text-xs ${active ? 'text-valorant' : 'text-faint'}`}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <header className="sticky top-0 z-10 border-b border-border bg-surface/95 p-4 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-valorant">Valorant Manager</p>
            <p className="truncate font-bold">
              {userTeam?.name} · {standing?.wins ?? 0}-{standing?.losses ?? 0}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg bg-valorant px-3 py-2 text-sm font-bold text-white" onClick={advanceDay}>
              {advanceLabel}
            </button>
            <select
              className="rounded-lg border border-border bg-surface-2 p-2 text-sm"
              value={screen}
              onChange={(event) => setScreen(event.target.value as Screen)}
            >
              {navItems.map((item) => (
                <option key={item.screen} value={item.screen}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="p-4 lg:ml-72 lg:p-8">{children}</main>
    </div>
  );
}
