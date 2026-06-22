import type { MatchResult, PlayerMatchStat } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { teamName } from '../lib/stats';
import { Card, Eyebrow, Pill, TeamSpine } from '../components/ui';
import { useDrilldown } from '../components/Drilldown';

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
  const { openResult, openPlayer, openTeam } = useDrilldown();
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));
  const groups = groupResults(game.matchHistory);

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>Season {game.seasonYear}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Around the League</h1>
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
                    className={`text-sm font-bold uppercase tracking-wider ${
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
                    <div
                      key={result.id}
                      onClick={() => openResult(result)}
                      role="button"
                      title="View full match"
                      className={`cursor-pointer rounded-lg border bg-surface p-5 text-left transition-colors hover:border-border-strong hover:bg-surface-2 ${
                        involvesUser ? 'border-border-strong' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>{group.label}</Pill>
                        <span className="text-[0.65rem] uppercase tracking-wider text-faint">Day {result.day}</span>
                      </div>

                      <div className="mt-3 space-y-1.5 tnum">
                        <div className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 ${homeWon ? 'bg-surface-3 text-ink' : 'bg-surface-2 text-faint'}`}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openTeam(result.homeTeamId);
                            }}
                            title="View team"
                            className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-valorant-bright"
                          >
                            <TeamSpine colors={teamsById.get(result.homeTeamId)?.colors} className="h-4 w-1" />
                            <span className="truncate font-semibold">{teamName(game, result.homeTeamId)}</span>
                          </button>
                          <span className="font-display text-lg font-bold">{result.homeMaps}</span>
                        </div>
                        <div className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 ${!homeWon ? 'bg-surface-3 text-ink' : 'bg-surface-2 text-faint'}`}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              openTeam(result.awayTeamId);
                            }}
                            title="View team"
                            className="flex min-w-0 items-center gap-2 text-left transition-colors hover:text-valorant-bright"
                          >
                            <TeamSpine colors={teamsById.get(result.awayTeamId)?.colors} className="h-4 w-1" />
                            <span className="truncate font-semibold">{teamName(game, result.awayTeamId)}</span>
                          </button>
                          <span className="font-display text-lg font-bold">{result.awayMaps}</span>
                        </div>
                      </div>

                      {topAcs && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (topPlayer) {
                              openPlayer(topPlayer.id);
                            }
                          }}
                          title="View player"
                          className="mt-3 flex w-full items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-left transition-colors hover:border-border-strong hover:bg-surface-3"
                        >
                          <div>
                            <p className="text-[0.6rem] uppercase tracking-wider text-faint">Top performer</p>
                            <p className="text-sm font-semibold">
                              {topPlayer?.handle ?? 'Unknown'} <span className="text-faint">· {teamsById.get(topAcs.teamId)?.shortName}</span>
                            </p>
                          </div>
                          <div className="text-right tnum">
                            <p className="font-bold text-valorant-bright">{topAcs.acs} ACS</p>
                            <p className="text-xs text-muted">
                              {topAcs.kills}/{topAcs.deaths}/{topAcs.assists}
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
