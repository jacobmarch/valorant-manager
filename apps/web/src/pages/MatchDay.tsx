import { MAP_POOL, type SiteFocus } from "@valorant-manager/game-core";
import { CommentaryFeed } from "../components/CommentaryFeed";
import { selectUserTeam, useGameStore } from "../store/game-store";

export function MatchDay() {
  const state = useGameStore((store) => store.state);
  const activeMatch = useGameStore((store) => store.activeMatch);
  const startMatch = useGameStore((store) => store.startMatch);
  const nextRound = useGameStore((store) => store.nextRound);
  const callTimeout = useGameStore((store) => store.callTimeout);
  const team = selectUserTeam(state);
  const latestRound = activeMatch?.rounds.at(-1);
  const nextFixture = state.fixtures.find(
    (fixture) => !fixture.played && (fixture.homeTeamId === state.userTeamId || fixture.awayTeamId === state.userTeamId)
  );
  const currentMap = MAP_POOL.find((map) => map.id === team.defaultPrep.map) ?? MAP_POOL[0];
  const timeoutUsedThisHalf = activeMatch?.timeouts.some((timeout) => {
    const half = (activeMatch.rounds.length < 12 ? 0 : 1);
    return (timeout.roundsPlayed < 12 ? 0 : 1) === half;
  });

  if (!activeMatch) {
    return (
      <section className="panel p-8 text-center">
        <h1 className="text-3xl font-bold">Match Day</h1>
        <p className="mt-3 text-slate-400">No active match. Start the next fixture from here or the schedule page.</p>
        <button
          disabled={!nextFixture}
          onClick={() => startMatch()}
          className="mt-6 rounded-xl bg-rose-500 px-6 py-3 font-semibold text-white disabled:bg-slate-700"
        >
          Start Next Match
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-4">
        <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <h1 className="text-3xl font-bold">Live Match Feed</h1>
            <p className="text-slate-400">{currentMap.name} · First to 13 · Side switch after round 12</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Score</p>
            <p className="text-4xl font-black text-cyan-300">
              {latestRound?.score[0] ?? 0}-{latestRound?.score[1] ?? 0}
            </p>
          </div>
        </div>
        <CommentaryFeed lines={activeMatch.commentary} />
      </div>

      <aside className="space-y-4">
        <div className="panel p-5">
          <h2 className="text-xl font-semibold">Coach Controls</h2>
          <button
            disabled={Boolean(activeMatch.result)}
            onClick={nextRound}
            className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400"
          >
            {activeMatch.result ? "Match Complete" : "Next Round"}
          </button>
          {activeMatch.result && (
            <p className="mt-3 text-sm text-slate-300">
              Winner: {state.teams.find((candidate) => candidate.id === activeMatch.result?.winnerId)?.shortName}
            </p>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-xl font-semibold">Tactical Timeout</h2>
          <p className="mt-2 text-sm text-slate-400">One per half. Adds a short execution bonus and locks focus to a site.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {currentMap.sites.map((site) => (
              <button
                key={site}
                disabled={timeoutUsedThisHalf || Boolean(activeMatch.result)}
                onClick={() => callTimeout(site as SiteFocus)}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-600"
              >
                Focus {site}
              </button>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-xl font-semibold">Round History</h2>
          <div className="mt-3 space-y-2 text-sm">
            {activeMatch.rounds.map((round) => (
              <div key={round.roundNumber} className="flex justify-between rounded-lg bg-slate-950/70 px-3 py-2">
                <span>Round {round.roundNumber}</span>
                <span>{round.score[0]}-{round.score[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}
