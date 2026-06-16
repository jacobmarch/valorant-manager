import { useGameStore } from '../store/useGameStore';

export function MatchHistory() {
  const game = useGameStore((state) => state.game)!;
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.4em] text-valorant">Archive</p>
      <h1 className="mt-2 text-3xl font-black">Season {game.seasonYear} Match History</h1>
      {game.seasonHistory.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="text-xl font-black">Past Champions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[...game.seasonHistory].reverse().map((season) => (
              <div key={season.seasonYear} className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Season {season.seasonYear}</p>
                <p className="font-bold">Champion: {teamsById.get(season.championTeamId)?.name}</p>
                <p className="text-sm text-slate-400">Runner-up: {teamsById.get(season.runnerUpTeamId)?.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6 space-y-4">
        {game.matchHistory.length === 0 && <p className="rounded-2xl border border-white/10 bg-panel p-6 text-slate-400">No completed matches yet.</p>}
        {[...game.matchHistory].reverse().map((result) => (
          <article key={result.id} className="rounded-2xl border border-white/10 bg-panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400">Matchday {result.matchday} · Day {result.day}</p>
                <p className="text-xs uppercase tracking-[0.25em] text-valorant">
                  {result.fixtureType === 'playoff' ? (result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal') : 'Regular Season'}
                </p>
                <h2 className="text-xl font-black">
                  {teamsById.get(result.homeTeamId)?.shortName} {result.homeRounds} - {result.awayRounds} {teamsById.get(result.awayTeamId)?.shortName}
                </h2>
                <p className="text-slate-300">{result.summary}</p>
              </div>
              <span className="rounded-full bg-valorant/15 px-3 py-1 text-sm font-bold text-valorant">
                Winner: {teamsById.get(result.winnerTeamId)?.name}
              </span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-2 lg:grid-cols-5">
              {result.boxScore.map((stat) => {
                const player = playersById.get(stat.playerId);
                return (
                  <div key={stat.playerId} className="rounded-xl bg-slate-950 p-3">
                    <p className="font-semibold">{player?.handle}</p>
                    <p className="text-xs text-slate-500">{teamsById.get(stat.teamId)?.shortName}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {stat.kills}/{stat.deaths}/{stat.assists} · {stat.acs} ACS
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
