import { useGameStore } from '../store/useGameStore';

export function Schedule() {
  const game = useGameStore((state) => state.game)!;
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));

  return (
    <section>
      <h1 className="text-3xl font-black">Schedule</h1>
      <div className="mt-6 space-y-5">
        {Array.from({ length: 14 }, (_, index) => index + 1).map((matchday) => (
          <article key={matchday} className="rounded-2xl border border-white/10 bg-panel p-5">
            <h2 className="text-lg font-bold">Matchday {matchday}</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {game.schedule.filter((fixture) => fixture.matchday === matchday).map((fixture) => (
                <div key={fixture.id} className={`rounded-xl p-4 ${fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId ? 'bg-valorant/15 ring-1 ring-valorant/40' : 'bg-slate-900'}`}>
                  <p className="font-semibold">{teamsById.get(fixture.homeTeamId)?.name} vs {teamsById.get(fixture.awayTeamId)?.name}</p>
                  <p className="mt-1 text-sm text-slate-400">Day {fixture.day} - {fixture.result ? `${fixture.result.homeRounds}-${fixture.result.awayRounds}` : fixture.day < game.currentDay ? 'Skipped' : 'Upcoming'}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
