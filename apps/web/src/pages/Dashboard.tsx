import { getCurrentPhaseLabel, getNextUserFixture, getSeasonChampion, type Fixture, type GameState, type MatchResult, type PlayerMatchStat } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';

function teamName(game: GameState, teamId: string) {
  return game.teams.find((team) => team.id === teamId)?.name ?? 'Unknown';
}

function getUserResults(game: GameState): MatchResult[] {
  return game.matchHistory.filter((result) => result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId);
}

function getUserBoxScores(game: GameState): PlayerMatchStat[] {
  return getUserResults(game).flatMap((result) => result.boxScore.filter((stat) => stat.teamId === game.userTeamId));
}

function average(values: number[]): string {
  if (values.length === 0) {
    return '0.0';
  }

  return (values.reduce((total, value) => total + value, 0) / values.length).toFixed(1);
}

function getLatestUserResult(game: GameState): MatchResult | undefined {
  return [...getUserResults(game)].sort((a, b) => b.day - a.day || b.fixtureId.localeCompare(a.fixtureId))[0];
}

function getTopUserPerformer(game: GameState, result: MatchResult): PlayerMatchStat | undefined {
  return result.boxScore
    .filter((stat) => stat.teamId === game.userTeamId)
    .sort((a, b) => b.acs - a.acs || b.kills - a.kills)[0];
}

function formatFixtureType(result: MatchResult): string {
  if (result.fixtureType === 'playoff') {
    return result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal';
  }

  return 'Regular Season';
}

function formatFixtureLabel(fixture: Fixture): string {
  if (fixture.type === 'playoff') {
    return fixture.playoffRound === 'final' ? 'Final' : 'Semifinal';
  }

  return `Matchday ${fixture.matchday}`;
}

function formatFixtureScore(fixture: Fixture): string {
  if (!fixture.result) {
    return 'Upcoming';
  }

  return `${fixture.result.homeRounds}-${fixture.result.awayRounds}`;
}

function getPlayoffFixtures(game: GameState, round: 'semifinal' | 'final'): Fixture[] {
  return game.schedule.filter((fixture) => fixture.type === 'playoff' && fixture.playoffRound === round);
}

function PlayoffFixtureCard({ game, fixture }: { game: GameState; fixture: Fixture }) {
  const winnerTeamId = fixture.result?.winnerTeamId;

  return (
    <div className="rounded-xl bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-[0.25em] text-valorant">{formatFixtureLabel(fixture)}</p>
      <div className="mt-3 space-y-2">
        <div className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${winnerTeamId === fixture.homeTeamId ? 'bg-valorant/15 text-white' : 'bg-white/5 text-slate-300'}`}>
          <span>{fixture.homeSeed ? `#${fixture.homeSeed} ` : ''}{teamName(game, fixture.homeTeamId)}</span>
          <span className="font-black">{fixture.result?.homeRounds ?? '-'}</span>
        </div>
        <div className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 ${winnerTeamId === fixture.awayTeamId ? 'bg-valorant/15 text-white' : 'bg-white/5 text-slate-300'}`}>
          <span>{fixture.awaySeed ? `#${fixture.awaySeed} ` : ''}{teamName(game, fixture.awayTeamId)}</span>
          <span className="font-black">{fixture.result?.awayRounds ?? '-'}</span>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-500">{formatFixtureScore(fixture)}</p>
    </div>
  );
}

export function Dashboard() {
  const game = useGameStore((state) => state.game)!;
  const advanceDay = useGameStore((state) => state.advanceDay);
  const setScreen = useGameStore((state) => state.setScreen);
  const nextFixture = getNextUserFixture(game);
  const userStanding = game.standings.find((row) => row.teamId === game.userTeamId);
  const userTeam = game.teams.find((team) => team.id === game.userTeamId)!;
  const championTeamId = getSeasonChampion(game);
  const championTeam = championTeamId ? game.teams.find((team) => team.id === championTeamId) : undefined;
  const phaseLabel = getCurrentPhaseLabel(game);
  const advanceLabel = game.seasonPhase === 'seasonReview' ? 'Start Next Season' : 'Advance Day';
  const userBoxScores = getUserBoxScores(game);
  const latestUserResult = getLatestUserResult(game);
  const topPerformer = latestUserResult ? getTopUserPerformer(game, latestUserResult) : undefined;
  const topPerformerPlayer = topPerformer ? userTeam.players.find((player) => player.id === topPerformer.playerId) : undefined;
  const standingsPreview = game.standings.slice(0, 4);
  const semifinalFixtures = getPlayoffFixtures(game, 'semifinal');
  const finalFixtures = getPlayoffFixtures(game, 'final');
  const showPlayoffBracket = game.seasonPhase !== 'regularSeason';

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,#1f2937,#101827_55%)] p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-[0.4em] text-valorant">Season {game.seasonYear} · {phaseLabel} · Day {game.currentDay}</p>
        <div className="mt-3 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <h1 className="text-4xl font-black">{userTeam.name} Command Center</h1>
            <p className="mt-3 max-w-3xl text-slate-300">
              Manage your five-player roster, chase the playoffs, and carry your squad from one season to the next.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-center">
            <div>
              <p className="text-2xl font-black">{userStanding?.wins ?? 0}</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-slate-500">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-black">{userStanding?.losses ?? 0}</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-slate-500">Losses</p>
            </div>
            <div>
              <p className="text-2xl font-black">{userStanding?.roundDiff ?? 0}</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-slate-500">RD</p>
            </div>
            <div>
              <p className="text-2xl font-black">{userStanding?.mapDiff ?? 0}</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-slate-500">MD</p>
            </div>
          </div>
        </div>
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
          <h2 className="text-xl font-black">Season Player Averages</h2>
          <p className="mt-1 text-sm text-slate-400">Per player, per user-team match this season.</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{average(userBoxScores.map((stat) => stat.kills))}</p>
              <p className="text-xs text-slate-400">Kills</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{average(userBoxScores.map((stat) => stat.deaths))}</p>
              <p className="text-xs text-slate-400">Deaths</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{average(userBoxScores.map((stat) => stat.assists))}</p>
              <p className="text-xs text-slate-400">Assists</p>
            </div>
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-3xl font-black">{average(userBoxScores.map((stat) => stat.acs))}</p>
              <p className="text-xs text-slate-400">ACS</p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="text-xl font-black">Match Snapshot</h2>
          {latestUserResult ? (
            <div className="mt-5 rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Latest user match · {formatFixtureType(latestUserResult)}</p>
              <p className="mt-2 text-2xl font-black">
                {teamName(game, latestUserResult.homeTeamId)} {latestUserResult.homeRounds}-{latestUserResult.awayRounds} {teamName(game, latestUserResult.awayTeamId)}
              </p>
              {topPerformer && (
                <div className="mt-4 rounded-lg bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Top Performer</p>
                  <p className="font-bold">{topPerformerPlayer?.handle ?? 'Unknown'} · {topPerformer.acs} ACS</p>
                  <p className="text-sm text-slate-400">{topPerformer.kills}/{topPerformer.deaths}/{topPerformer.assists} KDA</p>
                </div>
              )}
              <button className="mt-4 rounded-lg bg-white px-4 py-2 font-bold text-slate-950" onClick={() => setScreen('match')}>
                Open Match Center
              </button>
            </div>
          ) : nextFixture ? (
            <div className="mt-5 rounded-xl bg-slate-950 p-4">
              <p className="text-sm text-slate-400">
                {nextFixture.type === 'playoff' ? `${nextFixture.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal'}` : `Matchday ${nextFixture.matchday}`} · Day {nextFixture.day}
              </p>
              <p className="mt-2 text-lg font-bold">
                {teamName(game, nextFixture.homeTeamId)} vs {teamName(game, nextFixture.awayTeamId)}
              </p>
              <button className="mt-4 rounded-lg bg-white px-4 py-2 font-bold text-slate-950" onClick={() => setScreen('match')}>
                Open Match Center
              </button>
            </div>
          ) : (
            <p className="mt-4 text-slate-400">No recent or upcoming user match.</p>
          )}
        </article>

        {showPlayoffBracket ? (
          <article className="rounded-2xl border border-white/10 bg-panel p-5">
            <h2 className="text-xl font-black">Playoff Bracket</h2>
            {championTeam && (
              <p className="mt-2 rounded-xl bg-valorant/15 p-3 font-bold text-white">Champion: {championTeam.name}</p>
            )}
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-sm font-bold text-slate-300">Semifinals</p>
                <div className="space-y-2">
                  {semifinalFixtures.length === 0 && <p className="text-sm text-slate-400">Semifinals will appear after the regular season.</p>}
                  {semifinalFixtures.map((fixture) => <PlayoffFixtureCard key={fixture.id} game={game} fixture={fixture} />)}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-bold text-slate-300">Final</p>
                <div className="space-y-2">
                  {finalFixtures.length === 0 && <p className="text-sm text-slate-400">Final will appear after semifinals are complete.</p>}
                  {finalFixtures.map((fixture) => <PlayoffFixtureCard key={fixture.id} game={game} fixture={fixture} />)}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <article className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">Standings Preview</h2>
              <button className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white hover:bg-white/15" onClick={() => setScreen('standings')}>
                View Full
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {standingsPreview.map((row, index) => (
                <div key={row.teamId} className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl p-3 ${row.teamId === game.userTeamId ? 'bg-valorant/15 ring-1 ring-valorant/40' : 'bg-slate-950'}`}>
                  <p className="text-lg font-black">{index + 1}</p>
                  <div>
                    <p className="font-semibold">{teamName(game, row.teamId)}</p>
                    <p className="text-xs text-slate-500">{row.wins}-{row.losses} · MD {row.mapDiff} · RD {row.roundDiff}</p>
                  </div>
                  <p className="font-black">{row.mapDiff} MD</p>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
