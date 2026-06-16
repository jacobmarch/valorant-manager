import type { MatchResult, PlayerMatchStat } from '@valorant-manager/game-core';
import { getRecentResults } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { teamName } from '../lib/stats';
import { Card, Eyebrow, Pill } from '../components/ui';

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
  const recentResults = getRecentResults(game, 16);

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>Season {game.seasonYear}</Eyebrow>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Around the League</h1>
        <p className="mt-1 text-sm text-muted">League-wide recaps, winners, and standout performances from recent games.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {recentResults.length === 0 && (
          <Card className="p-6 text-muted">No league matches have been played yet.</Card>
        )}
        {recentResults.map((result) => {
          const topAcs = getTopAcs(result);
          const topPlayer = topAcs ? playersById.get(topAcs.playerId) : undefined;
          const homeWon = result.winnerTeamId === result.homeTeamId;
          const involvesUser = result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId;

          return (
            <Card key={result.id} className={`p-5 ${involvesUser ? 'ring-1 ring-valorant/30' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>{matchLabel(result)}</Pill>
                <span className="text-[0.65rem] uppercase tracking-wider text-faint">Day {result.day}</span>
              </div>

              <div className="mt-3 space-y-1.5 tnum">
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${homeWon ? 'bg-positive/10 text-ink' : 'bg-surface-2 text-muted'}`}>
                  <span className="font-bold">{teamName(game, result.homeTeamId)}</span>
                  <span className="text-lg font-black">{result.homeRounds}</span>
                </div>
                <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${!homeWon ? 'bg-positive/10 text-ink' : 'bg-surface-2 text-muted'}`}>
                  <span className="font-bold">{teamName(game, result.awayTeamId)}</span>
                  <span className="text-lg font-black">{result.awayRounds}</span>
                </div>
              </div>

              {topAcs && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2">
                  <div>
                    <p className="text-[0.6rem] uppercase tracking-wider text-faint">Top performer</p>
                    <p className="text-sm font-bold">
                      {topPlayer?.handle ?? 'Unknown'} <span className="text-faint">· {teamsById.get(topAcs.teamId)?.shortName}</span>
                    </p>
                  </div>
                  <div className="text-right tnum">
                    <p className="font-black text-valorant-bright">{topAcs.acs} ACS</p>
                    <p className="text-xs text-muted">
                      {topAcs.kills}/{topAcs.deaths}/{topAcs.assists}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
