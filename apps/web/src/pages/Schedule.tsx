import { useGameStore } from '../store/useGameStore';

export function Schedule() {
  const game = useGameStore((state) => state.game)!;
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const regularFixtures = game.schedule.filter((fixture) => fixture.type === 'regular');
  const playoffFixtures = game.schedule.filter((fixture) => fixture.type === 'playoff');

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.4em] text-valorant">Season {game.seasonYear}</p>
      <h1 className="mt-2 text-3xl font-black">Schedule</h1>
      <div className="mt-6 space-y-5">
        {Array.from({ length: 14 }, (_, index) => index + 1).map((matchday) => (
          <article key={matchday} className="rounded-2xl border border-white/10 bg-panel p-5">
            <h2 className="text-lg font-bold">Matchday {matchday}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {regularFixtures.filter((fixture) => fixture.matchday === matchday).map((fixture) => (
                <div key={fixture.id} className={`rounded-xl p-4 ${fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId ? 'bg-valorant/15 ring-1 ring-valorant/40' : 'bg-slate-900'}`}>
                  <p className="font-semibold">{teamsById.get(fixture.homeTeamId)?.name} vs {teamsById.get(fixture.awayTeamId)?.name}</p>
                  <p className="mt-1 text-sm text-slate-400">Day {fixture.day} - {fixture.result ? `${fixture.result.homeRounds}-${fixture.result.awayRounds}` : fixture.day < game.currentDay ? 'Skipped' : 'Upcoming'}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
        <article className="rounded-2xl border border-white/10 bg-panel p-5">
          <h2 className="text-lg font-bold">Playoffs</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {playoffFixtures.length === 0 && <p className="text-sm text-slate-400">Playoff bracket will appear after the regular season ends.</p>}
            {playoffFixtures.map((fixture) => (
              <div key={fixture.id} className={`rounded-xl p-4 ${fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId ? 'bg-valorant/15 ring-1 ring-valorant/40' : 'bg-slate-900'}`}>
                <p className="text-xs uppercase tracking-[0.25em] text-valorant">{fixture.playoffRound === 'final' ? 'Final' : 'Semifinal'}</p>
                <p className="mt-2 font-semibold">
                  {fixture.homeSeed ? `#${fixture.homeSeed} ` : ''}{teamsById.get(fixture.homeTeamId)?.name} vs {fixture.awaySeed ? `#${fixture.awaySeed} ` : ''}{teamsById.get(fixture.awayTeamId)?.name}
                </p>
                <p className="mt-1 text-sm text-slate-400">Day {fixture.day} - {fixture.result ? `${fixture.result.homeRounds}-${fixture.result.awayRounds}` : fixture.day < game.currentDay ? 'Pending' : 'Upcoming'}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
