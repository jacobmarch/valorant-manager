import { advanceDay as advanceGameDay, createNewGame, deserializeGameState, serializeGameState, type GameState, type MatchResult, type TeamId } from '@valorant-manager/game-core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Screen = 'dashboard' | 'roster' | 'schedule' | 'standings' | 'match' | 'history' | 'saves';

interface GameStore {
  game: GameState | null;
  screen: Screen;
  lastAdvancedResults: MatchResult[];
  setScreen: (screen: Screen) => void;
  createGame: (managerName: string, teamId?: TeamId) => void;
  advanceDay: () => void;
  exportSave: () => string;
  importSave: (serialized: string) => void;
  deleteSave: () => void;
}

type PersistedGameStore = {
  game: GameState | null;
  screen: Screen;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      screen: 'dashboard',
      lastAdvancedResults: [],
      setScreen: (screen) => set({ screen }),
      createGame: (managerName, teamId) => set({ game: createNewGame({ managerName, userTeamId: teamId }), screen: 'dashboard', lastAdvancedResults: [] }),
      advanceDay: () => {
        const game = get().game;
        if (!game) {
          return;
        }
        const next = advanceGameDay(game);
        set({
          game: next,
          lastAdvancedResults: next.matchHistory.slice(game.matchHistory.length)
        });
      },
      exportSave: () => {
        const game = get().game;
        if (!game) {
          throw new Error('No save to export.');
        }
        return serializeGameState(game);
      },
      importSave: (serialized) => set({ game: deserializeGameState(serialized), screen: 'dashboard', lastAdvancedResults: [] }),
      deleteSave: () => set({ game: null, screen: 'dashboard', lastAdvancedResults: [] })
    }),
    {
      name: 'valorant-manager-save-v1',
      version: 2,
      migrate: (persisted) => {
        const persistedStore = persisted as Partial<PersistedGameStore>;

        return {
          game: persistedStore.game ? deserializeGameState(JSON.stringify(persistedStore.game)) : null,
          screen: persistedStore.screen ?? 'dashboard'
        };
      },
      partialize: (state) => ({ game: state.game, screen: state.screen })
    }
  )
);
