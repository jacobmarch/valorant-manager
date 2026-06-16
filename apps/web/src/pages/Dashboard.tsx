import { getCurrentPhaseLabel, getNextUserFixture, getRecentResults, getSeasonChampion, type GameState } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';

function teamName(game: GameState, teamId: string) {
  return game.teams.find((team) => team.id === teamId)?.name ?? 'Unknown';
}

export function Dashboard() {
  const game = useGameStore((state) => state.game)!;
  const advanceDay = useGameStore((state) => state.advanceDay);
  const setScreen = useGameStore((state) => state.setScreen);
  const recent = getRecentResults(game, 5);
  const nextFixture = getNextUserFixture(game);
  const userStanding = game.standings.find((row) => row.teamId === game.userTeamId);
  const userTeam = game.teams.find((team) => team.id === game.userTeamId)!;
  const championTeamId = getSeasonChampion(game);
  const championTeam = championTeamId ? game.teams.find((team) => team.id === championTeamId) : undefined;
  const phaseLabel = getCurrentPhaseLabel(game);
  const advanceLabel = game.seasonPhase === 'seasonReview' ? 'Start Next Season' : 'Advance Day';

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,#1f2937,#101827_55%)] p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.4em] text-valorant">Season {game.seasonYear} · {phaseLabel} · Day {game.currentDay}</p>
        <h1 className="mt-3 text-4xl font-black">{userTeam.name} Command Center</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Manage your five-player roster, chase the playoffs, and carry your squad from one season to the next.
        </p>
        {game.seasonPhase === 'seasonReview' && championTeam && (
          <div className="mt-5 rounded-2xl border border-valorant/30 bg-valorant/10 p-4">
            <p className="text-sm text-slate-300">Season {game.seasonYear} Champion</p>
            <p className="text-2xl font-black">{championTeam.name}</p>
            <p className="mt-1 text-sm text-slate-400">Advance to archive the year, reset standings, regenerate the schedule, and begin next season.</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-xl bg-valorant px-5 py-3 font-bold text-white shadow-lg shadow-valorant/20" onClick={advanceDay}>
            {advanceLabel}
          </button>
          <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-white hover:bg-white/10" onClick={() => setScreen('match')}>
            Match Center
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="text-xl font-black">Club Form</h2>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{userStanding?.wins ?? 0}</p>
              <p className="text-xs text-slate-400">Wins</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{userStanding?.losses ?? 0}</p>
              <p className="text-xs text-slate-400">Losses</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{userStanding?.roundDiff ?? 0}</p>
              <p className="text-xs text-slate-400">Round +/-</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="text-xl font-black">Next Match</h2>
          {nextFixture ? (
            <div className="mt-5 rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                {nextFixture.type === 'playoff' ? `${nextFixture.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal'}` : `Matchday ${nextFixture.matchday}`} · Day {nextFixture.day}
              </p>
              <p className="mt-2 text-lg font-bold">
                {teamName(game, nextFixture.homeTeamId)} vs {teamName(game, nextFixture.awayTeamId)}
              </p>
              <button className="mt-4 rounded-lg bg-white px-4 py-2 font-bold text-slate-950" onClick={() => setScreen('match')}>
                Open Match
              </button>
            </div>
          ) : (
            <p className="mt-4 text-slate-400">The league season is complete.</p>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="text-xl font-black">Recent Results</h2>
          <div className="mt-5 space-y-3">
            {recent.length === 0 && <p className="text-slate-400">No matches played yet.</p>}
            {recent.map((result) => (
              <div key={result.id} className="rounded-xl bg-slate-950 p-3">
                <p className="font-semibold">{result.summary}</p>
                <p className="text-sm text-slate-400">Matchday {result.matchday}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
