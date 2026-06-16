import { getNextUserFixture } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';

export function MatchScreen() {
  const game = useGameStore((state) => state.game)!;
  const advanceDay = useGameStore((state) => state.advanceDay);
  const setScreen = useGameStore((state) => state.setScreen);
  const fixture = getNextUserFixture(game);
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));
  const isToday = fixture?.day === game.currentDay;
  const championTeam = game.playoffBracket?.championTeamId ? teamsById.get(game.playoffBracket.championTeamId) : undefined;
  const latestUserResult = [...game.matchHistory]
    .reverse()
    .find((result) => result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId);

  if (!fixture) {
    return (
      <section className="rounded-2xl border border-white/10 bg-panel p-6">
        <h1 className="text-3xl font-black">{game.seasonPhase === 'seasonReview' ? 'Season Review' : 'No Upcoming Match'}</h1>
        {game.seasonPhase === 'seasonReview' && championTeam ? (
          <>
            <p className="mt-3 text-slate-300">Season {game.seasonYear} champion: <span className="font-bold text-white">{championTeam.name}</span></p>
            <p className="mt-2 text-slate-400">Advance day from the dashboard to archive this season and begin next year.</p>
          </>
        ) : (
          <p className="mt-3 text-slate-400">There are no remaining user fixtures right now.</p>
        )}
      </section>
    );
  }

  const fixtureLabel = fixture.type === 'playoff' ? (fixture.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal') : `Matchday ${fixture.matchday}`;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-panel p-6">
        <p className="text-sm uppercase tracking-[0.4em] text-valorant">Match Center</p>
        <h1 className="mt-2 text-3xl font-black">
          {teamsById.get(fixture.homeTeamId)?.name} vs {teamsById.get(fixture.awayTeamId)?.name}
        </h1>
        <p className="mt-2 text-slate-400">Season {game.seasonYear} · {fixtureLabel} · Scheduled for day {fixture.day} · Current day {game.currentDay}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {isToday ? (
            <button className="rounded-xl bg-valorant px-5 py-3 font-bold text-white" onClick={advanceDay}>
              Simulate Match Day
            </button>
          ) : (
            <button className="rounded-xl bg-white px-5 py-3 font-bold text-slate-950" onClick={() => setScreen('dashboard')}>
              Return to Dashboard
            </button>
          )}
        </div>
      </div>

      <article className="rounded-2xl border border-white/10 bg-panel p-5">
        <h2 className="text-xl font-black">Latest User Result</h2>
        {latestUserResult ? (
          <div className="mt-4">
            <p className="text-lg font-bold">{latestUserResult.summary}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {latestUserResult.boxScore.map((stat) => {
                const player = playersById.get(stat.playerId);
                return (
                  <div key={stat.playerId} className="rounded-xl bg-slate-950 p-3">
                    <p className="font-semibold">{player?.handle}</p>
                    <p className="text-xs text-slate-500">{teamsById.get(stat.teamId)?.shortName}</p>
                    <p className="text-sm text-slate-400">
                      {stat.kills}/{stat.deaths}/{stat.assists} · {stat.acs} ACS
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-4 text-slate-400">No user match has been played yet.</p>
        )}
      </article>
    </section>
  );
}
