import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { MatchResult } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { PlayerModal } from './PlayerModal';
import { TeamModal } from './TeamModal';
import { BoxScoreModal } from './BoxScoreModal';

type Entry =
  | { kind: 'player'; id: string }
  | { kind: 'team'; id: string }
  | { kind: 'result'; result: MatchResult };

interface DrilldownApi {
  openPlayer: (playerId: string) => void;
  openTeam: (teamId: string) => void;
  openResult: (result: MatchResult) => void;
}

const DrilldownContext = createContext<DrilldownApi | null>(null);

/** Access the open-modal helpers. Any element can drill into a player, team, or match in one call. */
export function useDrilldown(): DrilldownApi {
  const ctx = useContext(DrilldownContext);
  if (!ctx) {
    throw new Error('useDrilldown must be used within a <DrilldownProvider>');
  }
  return ctx;
}

/**
 * Owns the stack of detail modals (player / team / match) shown above the app.
 * Modals can open one another (a box score opens a player, who opens their team…) and each
 * Escape or backdrop click dismisses just the topmost one, walking back the way you came.
 */
export function DrilldownProvider({ children }: { children: ReactNode }) {
  const game = useGameStore((state) => state.game);
  const [stack, setStack] = useState<Entry[]>([]);

  const closeTop = useCallback(() => setStack((current) => current.slice(0, -1)), []);

  const api = useMemo<DrilldownApi>(
    () => ({
      openPlayer: (id) => setStack((current) => [...current, { kind: 'player', id }]),
      openTeam: (id) => setStack((current) => [...current, { kind: 'team', id }]),
      openResult: (result) => setStack((current) => [...current, { kind: 'result', result }])
    }),
    []
  );

  // Drop any open modals when the save clears (e.g. delete save / start a new career).
  useEffect(() => {
    if (!game) {
      setStack([]);
    }
  }, [game]);

  // One Escape handler for the whole stack so nested modals close one level at a time.
  useEffect(() => {
    if (stack.length === 0) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stack.length, closeTop]);

  const playersById = useMemo(
    () => new Map(game?.teams.flatMap((team) => team.players).map((player) => [player.id, player]) ?? []),
    [game]
  );
  const teamsById = useMemo(() => new Map(game?.teams.map((team) => [team.id, team]) ?? []), [game]);

  return (
    <DrilldownContext.Provider value={api}>
      {children}
      {game &&
        stack.map((entry, index) => {
          const key = `${entry.kind}-${index}`;
          if (entry.kind === 'player') {
            const player = playersById.get(entry.id);
            return player ? <PlayerModal key={key} game={game} player={player} onClose={closeTop} /> : null;
          }
          if (entry.kind === 'team') {
            const team = teamsById.get(entry.id);
            return team ? <TeamModal key={key} game={game} team={team} onClose={closeTop} /> : null;
          }
          return <BoxScoreModal key={key} game={game} result={entry.result} onClose={closeTop} />;
        })}
    </DrilldownContext.Provider>
  );
}
