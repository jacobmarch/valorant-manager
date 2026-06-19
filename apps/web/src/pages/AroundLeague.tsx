import { useState } from 'react';
import type { MatchResult, PlayerMatchStat } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { teamName } from '../lib/stats';
import { Card, Eyebrow, Pill } from '../components/ui';
import { BoxScoreModal } from '../components/BoxScoreModal';

interface WeekGroup {
  key: string;
  label: string;
  kind: 'week' | 'playoff';
  maxDay: number;
  results: MatchResult[];
}

function playoffLabel(result: MatchResult) {
  return result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinals';
}

function groupResults(results: MatchResult[]): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();

  for (const result of results) {
    const isPlayoff = result.fixtureType === 'playoff';
    const key = isPlayoff ? `playoff-${result.playoffRound}` : `week-${result.matchday}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        label: isPlayoff ? playoffLabel(result) : `Week ${result.matchday}`,
        kind: isPlayoff ? 'playoff' : 'week',
        maxDay: result.day,
        results: []
      };
      groups.set(key, group);
    }
    group.results.push(result);
    group.maxDay = Math.max(group.maxDay, result.day);
  }

  for (const group of groups.values()) {
    group.results.sort((a, b) => a.day - b.day || a.fixtureId.localeCompare(b.fixtureId));
  }

  // Most recent week (or playoff round) first.
  return [...groups.values()].sort((a, b) => b.maxDay - a.maxDay);
}

function getTopAcs(result: MatchResult): PlayerMatchStat | undefined {
  return [...result.boxScore].sort((a, b) => b.acs - a.acs || b.kills - a.kills)[0];
}

export function AroundLeague() {
  const game = useGameStore((state) => state.game)!;
  const [openResult, setOpenResult] = useState<MatchResult | null>(null);
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));
  const groups = groupResults(game.matchHistory);

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>Season {game.seasonYear}</Eyebrow>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Around the League</h1>
        <p className="mt-1 text-sm text-muted">League-wide results, broken down by week so you can see what happened before and after each break.</p>
      </div>

      {groups.length === 0 && <Card className="p-6 text-muted">No league matches have been played yet.</Card>}

      <div className="space-y-10">
        {groups.map((group) => {
          const userInWeek = group.results.some(
            (result) => result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId
          );

          return (
            <div key={group.key}>
              {/* Week divider — clearly marks where each week starts and ends. */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-black uppercase tracking-wider ${
                      group.kind === 'playoff' ? 'text-gold' : 'text-ink'
                    }`}
                  >
                    {group.label}
                  </span>
                  {userInWeek && <Pill tone="accent">Your week</Pill>}
                </div>
                <div className={`h-px flex-1 ${group.kind === 'playoff' ? 'bg-gold/30' : 'bg-border'}`} />
                <span className="text-[0.65rem] uppercase tracking-wider text-faint">
                  {group.results.length} {group.results.length === 1 ? 'game' : 'games'}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {group.results.map((result) => {
                  const topAcs = getTopAcs(result);
                  const topPlayer = topAcs ? playersById.get(topAcs.playerId) : undefined;
                  const homeWon = result.winnerTeamId === result.homeTeamId;
                  const involvesUser = result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId;

                  return (
                    <Card
                      key={result.id}
                      onClick={() => setOpenResult(result)}
                      className={`p-5 ${involvesUser ? 'ring-1 ring-valorant/30' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>{group.label}</Pill>
                        <span className="text-[0.65rem] uppercase tracking-wider text-faint">Day {result.day}</span>
                      </div>

                      <div className="mt-3 space-y-1.5 tnum">
                        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${homeWon ? 'bg-positive/10 text-ink' : 'bg-surface-2 text-muted'}`}>
                          <span className="font-bold">{teamName(game, result.homeTeamId)}</span>
                          <span className="text-lg font-black">{result.homeMaps}</span>
                        </div>
                        <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${!homeWon ? 'bg-positive/10 text-ink' : 'bg-surface-2 text-muted'}`}>
                          <span className="font-bold">{teamName(game, result.awayTeamId)}</span>
                          <span className="text-lg font-black">{result.awayMaps}</span>
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
            </div>
          );
        })}
      </div>

      {openResult && <BoxScoreModal game={game} result={openResult} onClose={() => setOpenResult(null)} />}
    </section>
  );
}
