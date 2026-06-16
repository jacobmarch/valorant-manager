import type { GameState, MatchResult, PlayerMatchStat } from '@valorant-manager/game-core';
import { getRecentResults } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';

function teamName(game: GameState, teamId: string) {
  return game.teams.find((team) => team.id === teamId)?.name ?? 'Unknown';
}

function matchLabel(result: MatchResult) {
  if (result.fixtureType === 'playoff') {
    return result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal';
  }

  return `Matchday ${result.matchday}`;
}

function getTopAcs(result: MatchResult): PlayerMatchStat | undefined {
  return [...result.boxScore].sort((a, b) => b.acs - a.acs || b.kills - a.kills)[0];
}

export function AroundLeague() {
  const game = useGameStore((state) => state.game)!;
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));
  const recentResults = getRecentResults(game, 12);

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.4em] text-valorant">Season {game.seasonYear}</p>
      <h1 className="mt-2 text-3xl font-black">Around The League</h1>
      <p className="mt-2 text-slate-400">League-wide recaps, match winners, and top performers from recently played games.</p>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {recentResults.length === 0 && (
          <p className="rounded-2xl border border-white/10 bg-panel p-6 text-slate-400">No league matches have been played yet.</p>
        )}
        {recentResults.map((result) => {
          const topAcs = getTopAcs(result);
          const topPlayer = topAcs ? playersById.get(topAcs.playerId) : undefined;
          const winner = teamsById.get(result.winnerTeamId);

          return (
            <article key={result.id} className="rounded-2xl border border-white/10 bg-panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-valorant">{matchLabel(result)} · Day {result.day}</p>
                  <h2 className="mt-2 text-2xl font-black">
                    {teamName(game, result.homeTeamId)} {result.homeRounds}-{result.awayRounds} {teamName(game, result.awayTeamId)}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">Winner: {winner?.name ?? 'Unknown'}</p>
                </div>
                {topAcs && (
                  <div className="rounded-xl bg-slate-950 p-3 text-right">
                    <p className="text-xs uppercase tracking-wider text-slate-500">Top ACS</p>
                    <p className="font-bold">{topPlayer?.handle ?? 'Unknown'}</p>
                    <p className="text-sm text-slate-400">{topAcs.acs} ACS · {topAcs.kills}/{topAcs.deaths}/{topAcs.assists}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
