import {
  advanceDay,
  applyMatchResult,
  createDefaultPrep,
  createMatchSimulatorForFixture,
  createNewGame,
  getLineupPlayers,
  MAP_POOL,
  signFreeAgent,
  type Fixture,
  type GameState,
  type MatchPrep,
  type MatchResult,
  type PlayerId,
  type RoundSummary,
  type SiteFocus,
  type Team,
  type TrainingFocus
} from "@valorant-manager/game-core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Screen = "main" | "squad" | "tactics" | "schedule" | "scouting" | "finance" | "match";

export type ActiveMatchState = {
  fixtureId: Fixture["id"];
  seed: number;
  rounds: RoundSummary[];
  commentary: string[];
  timeouts: { roundsPlayed: number; teamId: Team["id"]; aggression: number; siteFocus: SiteFocus | null }[];
  result?: MatchResult;
};

type GameStore = {
  screen: Screen;
  state: GameState;
  activeMatch?: ActiveMatchState;
  setScreen: (screen: Screen) => void;
  newGame: (teamName?: string) => void;
  advance: (trainingFocus?: TrainingFocus) => void;
  updateUserPrep: (prep: MatchPrep) => void;
  signPlayer: (playerId: PlayerId) => void;
  startMatch: (fixtureId?: Fixture["id"]) => void;
  callTimeout: (siteFocus: SiteFocus | null) => void;
  nextRound: () => void;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      screen: "main",
      state: createNewGame(),
      setScreen: (screen) => set({ screen }),
      newGame: (teamName) => set({ state: createNewGame(teamName), activeMatch: undefined, screen: "squad" }),
      advance: (trainingFocus) => set({ state: advanceDay(get().state, { trainingFocus }) }),
      updateUserPrep: (prep) =>
        set(({ state }) => ({
          state: {
            ...state,
            teams: state.teams.map((team) =>
              team.id === state.userTeamId ? { ...team, starters: prep.lineup, defaultPrep: prep } : team
            )
          }
        })),
      signPlayer: (playerId) => set(({ state }) => ({ state: signFreeAgent(state, playerId) })),
      startMatch: (fixtureId) => {
        const state = get().state;
        const fixture = fixtureId
          ? state.fixtures.find((candidate) => candidate.id === fixtureId)
          : state.fixtures.find(
              (candidate) => !candidate.played && (candidate.homeTeamId === state.userTeamId || candidate.awayTeamId === state.userTeamId)
            );
        if (!fixture) return;
        set({
          activeMatch: {
            fixtureId: fixture.id,
            seed: state.calendar.week * 1000 + state.matchHistory.length + 77,
            rounds: [],
            commentary: [],
            timeouts: []
          },
          screen: "match"
        });
      },
      callTimeout: (siteFocus) => {
        const { activeMatch, state } = get();
        if (!activeMatch || activeMatch.result) return;
        const userTeam = selectUserTeam(state);
        const half = activeMatch.rounds.length < 12 ? 0 : 1;
        const alreadyUsed = activeMatch.timeouts.some((timeout) => (timeout.roundsPlayed < 12 ? 0 : 1) === half);
        if (alreadyUsed) return;
        set({
          activeMatch: {
            ...activeMatch,
            commentary: [...activeMatch.commentary, `${userTeam.shortName} calls a tactical timeout.`],
            timeouts: [
              ...activeMatch.timeouts,
              {
                roundsPlayed: activeMatch.rounds.length,
                teamId: userTeam.id,
                aggression: Math.min(100, userTeam.defaultPrep.aggression + 10),
                siteFocus
              }
            ]
          }
        });
      },
      nextRound: () => {
        const { activeMatch, state } = get();
        if (!activeMatch || activeMatch.result) return;
        const fixture = state.fixtures.find((candidate) => candidate.id === activeMatch.fixtureId);
        if (!fixture) return;
        const simulator = createMatchSimulatorForFixture(state, fixture, activeMatch.seed);
        activeMatch.rounds.forEach((_, index) => {
          activeMatch.timeouts
            .filter((timeout) => timeout.roundsPlayed === index)
            .forEach((timeout) =>
              simulator.callTimeout({
                teamId: timeout.teamId,
                aggression: timeout.aggression,
                siteFocus: timeout.siteFocus
              })
            );
          simulator.simulateNextRound();
        });
        activeMatch.timeouts
          .filter((timeout) => timeout.roundsPlayed === activeMatch.rounds.length)
          .forEach((timeout) =>
            simulator.callTimeout({
              teamId: timeout.teamId,
              aggression: timeout.aggression,
              siteFocus: timeout.siteFocus
            })
          );
        const round = simulator.simulateNextRound();
        const commentary = [...activeMatch.commentary, ...round.events.map((event) => event.text)];
        if (simulator.isComplete) {
          const result = simulator.result();
          set({
            activeMatch: { ...activeMatch, rounds: [...activeMatch.rounds, round], commentary, result },
            state: applyMatchResult(state, fixture, result)
          });
          return;
        }
        set({
          activeMatch: {
            ...activeMatch,
            rounds: [...activeMatch.rounds, round],
            commentary
          }
        });
      }
    }),
    {
      name: "valorant-manager-save-v1",
      partialize: (value) => ({ state: value.state, screen: value.screen })
    }
  )
);

export function selectUserTeam(state: GameState): Team {
  const team = state.teams.find((candidate) => candidate.id === state.userTeamId);
  if (!team) throw new Error("User team missing from save.");
  return team;
}

export function createStarterPrep(team: Team): MatchPrep {
  return createDefaultPrep(team.starters, MAP_POOL[0].id);
}

export function selectLineupPlayers(state: GameState, prep = selectUserTeam(state).defaultPrep) {
  return getLineupPlayers(prep, state.players);
}
