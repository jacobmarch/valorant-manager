import {
  getCurrentPhaseLabel,
  getNextUserFixture,
  getRecentResults,
  getSeasonChampion,
  type Fixture,
  type GameState,
  type MatchResult,
  type StandingsRow
} from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import {
  getPlayerOverall,
  getPlayerSeasonStats,
  getTeamForm,
  getTeamOverall,
  getUserFixtures,
  teamById,
  teamName,
  teamShort
} from '../lib/stats';
import { Button, Card, Diff, Eyebrow, FormStreak, PanelHeader, Pill, StatTile } from '../components/ui';
import { PlayoffBracket } from '../components/PlayoffBracket';

function standingOf(game: GameState, teamId: string): StandingsRow | undefined {
  return game.standings.find((row) => row.teamId === teamId);
}

function rankOf(game: GameState, teamId: string): number {
  return game.standings.findIndex((row) => row.teamId === teamId) + 1;
}

function fixtureLabel(fixture: Fixture): string {
  if (fixture.type === 'playoff') {
    return fixture.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal';
  }
  return `Matchday ${fixture.matchday}`;
}

function resultLabel(result: MatchResult): string {
  if (result.fixtureType === 'playoff') {
    return result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal';
  }
  return `Matchday ${result.matchday}`;
}

function TeamBadge({ game, teamId, align = 'left' }: { game: GameState; teamId: string; align?: 'left' | 'right' }) {
  const team = teamById(game, teamId);
  const standing = standingOf(game, teamId);
  return (
    <div className={`flex flex-col gap-2 ${align === 'right' ? 'items-end text-right' : 'items-start'}`}>
      <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        <span className="h-9 w-1.5 rounded-full" style={{ background: `linear-gradient(${team?.colors.primary}, ${team?.colors.secondary})` }} />
        <div>
          <p className="text-lg font-black leading-tight">{team?.name}</p>
          <p className="tnum text-xs text-muted">
            {standing?.wins ?? 0}-{standing?.losses ?? 0} · {getTeamOverall(team!)} OVR
          </p>
        </div>
      </div>
      <FormStreak form={getTeamForm(game, teamId, 5)} />
    </div>
  );
}

export function Dashboard() {
  const game = useGameStore((state) => state.game)!;
  const advanceDay = useGameStore((state) => state.advanceDay);
  const setScreen = useGameStore((state) => state.setScreen);

  const userTeam = teamById(game, game.userTeamId)!;
  const userStanding = standingOf(game, game.userTeamId);
  const userRank = rankOf(game, game.userTeamId);
  const phaseLabel = getCurrentPhaseLabel(game);
  const advanceLabel = game.seasonPhase === 'seasonReview' ? 'Start Next Season' : 'Advance Day';

  const nextFixture = getNextUserFixture(game);
  const opponentId = nextFixture
    ? nextFixture.homeTeamId === game.userTeamId
      ? nextFixture.awayTeamId
      : nextFixture.homeTeamId
    : undefined;

  const userResults = [...game.matchHistory]
    .filter((result) => result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId)
    .sort((a, b) => b.day - a.day || b.fixtureId.localeCompare(a.fixtureId));
  const lastResult = userResults[0];
  const lastWin = lastResult ? lastResult.winnerTeamId === game.userTeamId : false;

  const championTeamId = getSeasonChampion(game);
  const championTeam = championTeamId ? teamById(game, championTeamId) : undefined;

  const standingsPreview = game.standings.slice(0, 5);
  const userInPreview = standingsPreview.some((row) => row.teamId === game.userTeamId);

  const fixtures = getUserFixtures(game);
  const upcomingIndex = fixtures.findIndex((fixture) => !fixture.result);
  const sliceStart = upcomingIndex < 0 ? Math.max(0, fixtures.length - 6) : Math.max(0, upcomingIndex - 2);
  const scheduleStrip = fixtures.slice(sliceStart, sliceStart + 6);

  const recentLeague = getRecentResults(game, 5);

  const roster = [...userTeam.players]
    .map((player) => ({ player, stats: getPlayerSeasonStats(game, player.id) }))
    .sort((a, b) => b.stats.acs - a.stats.acs);

  return (
    <section className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden p-0">
        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${userTeam.colors.primary}, ${userTeam.colors.secondary})` }} />
        <div className="p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <Eyebrow>
                Season {game.seasonYear} · {phaseLabel} · Day {game.currentDay}
              </Eyebrow>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{userTeam.name}</h1>
              <p className="mt-1 text-sm text-muted">
                League rank <span className="font-bold text-ink">#{userRank}</span> of {game.standings.length} · {userTeam.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={advanceDay}>{advanceLabel}</Button>
                <Button variant="ghost" onClick={() => setScreen('match')}>
                  Match Center
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatTile label="Wins" value={userStanding?.wins ?? 0} tone="positive" />
              <StatTile label="Losses" value={userStanding?.losses ?? 0} tone="negative" />
              <StatTile label="Map Diff" value={<Diff value={userStanding?.mapDiff ?? 0} />} />
              <StatTile label="Round Diff" value={<Diff value={userStanding?.roundDiff ?? 0} />} />
            </div>
          </div>

          {game.seasonPhase === 'seasonReview' && championTeam && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
              <div>
                <Pill tone="gold">Season {game.seasonYear} Champion</Pill>
                <p className="mt-1.5 text-xl font-black">{championTeam.name}</p>
              </div>
              <p className="max-w-md text-sm text-muted">Advance to archive the year, reset standings, regenerate the schedule, and begin next season.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Next match + standings */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <PanelHeader title="Next Match" subtitle="Your upcoming fixture" action="Match Center" onAction={() => setScreen('match')} />
          {nextFixture && opponentId ? (
            <button
              onClick={() => setScreen('match')}
              className="mt-4 block w-full rounded-2xl border border-line bg-surface-2 p-5 text-left transition hover:border-valorant/50"
            >
              <div className="mb-4 flex items-center justify-center gap-2">
                <Pill tone="accent">{fixtureLabel(nextFixture)}</Pill>
                <span className="text-xs text-faint">Day {nextFixture.day}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <TeamBadge game={game} teamId={game.userTeamId} />
                <div className="text-center">
                  <p className="text-2xl font-black text-faint">VS</p>
                </div>
                <TeamBadge game={game} teamId={opponentId} align="right" />
              </div>
            </button>
          ) : (
            <p className="mt-4 rounded-2xl border border-line bg-surface-2 p-5 text-sm text-muted">
              No upcoming user fixture. {game.seasonPhase === 'seasonReview' ? 'Advance the day to start next season.' : 'Advance the day to continue.'}
            </p>
          )}

          {lastResult && (
            <div className="mt-4">
              <PanelHeader title="Last Result" subtitle={`${resultLabel(lastResult)} · Day ${lastResult.day}`} action="History" onAction={() => setScreen('history')} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Pill tone={lastWin ? 'positive' : 'negative'}>{lastWin ? 'Win' : 'Loss'}</Pill>
                  <p className="tnum text-lg font-black">
                    {teamShort(game, lastResult.homeTeamId)} {lastResult.homeMaps}
                    <span className="text-faint"> – </span>
                    {lastResult.awayMaps} {teamShort(game, lastResult.awayTeamId)}
                  </p>
                </div>
                <p className="text-sm text-muted">{lastResult.summary}</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <PanelHeader title="Standings" subtitle="Top of the table" action="Full table" onAction={() => setScreen('standings')} />
          <div className="mt-4 space-y-1.5">
            {standingsPreview.map((row, index) => {
              const isUser = row.teamId === game.userTeamId;
              return (
                <div
                  key={row.teamId}
                  className={`grid grid-cols-[1.5rem_1fr_auto] items-center gap-2 rounded-xl px-3 py-2 ${
                    isUser ? 'bg-valorant/15 ring-1 ring-valorant/30' : 'bg-surface-2'
                  }`}
                >
                  <span className={`tnum text-sm font-black ${index < 4 ? 'text-gold' : 'text-faint'}`}>{index + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{teamName(game, row.teamId)}</p>
                    <p className="tnum text-xs text-faint">
                      {row.wins}-{row.losses}
                    </p>
                  </div>
                  <Diff value={row.mapDiff} suffix="MD" />
                </div>
              );
            })}
            {!userInPreview && userStanding && (
              <div className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-2 rounded-xl bg-valorant/15 px-3 py-2 ring-1 ring-valorant/30">
                <span className="tnum text-sm font-black text-faint">{userRank}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{userTeam.name}</p>
                  <p className="tnum text-xs text-faint">
                    {userStanding.wins}-{userStanding.losses}
                  </p>
                </div>
                <Diff value={userStanding.mapDiff} suffix="MD" />
              </div>
            )}
          </div>
          <p className="mt-3 text-[0.7rem] text-faint">Top 4 seeds qualify for playoffs.</p>
        </Card>
      </div>

      {/* Playoff bracket (when active) */}
      {game.seasonPhase !== 'regularSeason' && (
        <Card className="p-5">
          <PanelHeader title="Playoff Bracket" subtitle={`Season ${game.seasonYear} postseason`} action="Schedule" onAction={() => setScreen('schedule')} />
          <div className="mt-4">
            <PlayoffBracket game={game} />
          </div>
        </Card>
      )}

      {/* Schedule strip */}
      <Card className="p-5">
        <PanelHeader title="Your Schedule" subtitle="Recent and upcoming fixtures" action="Full schedule" onAction={() => setScreen('schedule')} />
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {scheduleStrip.map((fixture) => {
            const oppId = fixture.homeTeamId === game.userTeamId ? fixture.awayTeamId : fixture.homeTeamId;
            const isUpcomingNext = fixture.id === nextFixture?.id;
            let outcome: 'W' | 'L' | null = null;
            if (fixture.result) {
              outcome = fixture.result.winnerTeamId === game.userTeamId ? 'W' : 'L';
            }
            return (
              <div
                key={fixture.id}
                className={`min-w-[9.5rem] shrink-0 rounded-xl border p-3 ${
                  isUpcomingNext ? 'border-valorant/50 bg-valorant/10' : 'border-line bg-surface-2'
                }`}
              >
                <p className="text-[0.65rem] uppercase tracking-wider text-faint">{fixtureLabel(fixture)} · D{fixture.day}</p>
                <p className="mt-1 text-sm font-bold">
                  {fixture.homeTeamId === game.userTeamId ? 'vs' : '@'} {teamShort(game, oppId)}
                </p>
                <div className="mt-2">
                  {outcome ? (
                    <span className={`tnum text-sm font-black ${outcome === 'W' ? 'text-positive' : 'text-negative'}`}>
                      {outcome} {fixture.result!.homeMaps}-{fixture.result!.awayMaps}
                    </span>
                  ) : isUpcomingNext ? (
                    <Pill tone="accent">Next</Pill>
                  ) : (
                    <span className="text-xs text-faint">Upcoming</span>
                  )}
                </div>
              </div>
            );
          })}
          {scheduleStrip.length === 0 && <p className="text-sm text-muted">No fixtures scheduled.</p>}
        </div>
      </Card>

      {/* Roster snapshot + around league */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <PanelHeader title="Squad Performance" subtitle="Season averages, sorted by ACS" action="Full roster" onAction={() => setScreen('roster')} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="text-left text-[0.65rem] uppercase tracking-wider text-faint">
                  <th className="pb-2 font-semibold">Player</th>
                  <th className="pb-2 text-center font-semibold">OVR</th>
                  <th className="pb-2 text-center font-semibold">GP</th>
                  <th className="pb-2 text-center font-semibold">K/D/A</th>
                  <th className="pb-2 text-right font-semibold">KD</th>
                  <th className="pb-2 text-right font-semibold">ACS</th>
                </tr>
              </thead>
              <tbody className="tnum">
                {roster.map(({ player, stats }) => (
                  <tr key={player.id} className="border-t border-line">
                    <td className="py-2.5">
                      <p className="font-bold">{player.handle}</p>
                      <p className="text-[0.7rem] uppercase tracking-wider text-faint">{player.role}</p>
                    </td>
                    <td className="py-2.5 text-center font-black">{getPlayerOverall(player)}</td>
                    <td className="py-2.5 text-center text-muted">{stats.games}</td>
                    <td className="py-2.5 text-center text-muted">
                      {stats.kills.toFixed(1)}/{stats.deaths.toFixed(1)}/{stats.assists.toFixed(1)}
                    </td>
                    <td className={`py-2.5 text-right font-bold ${stats.kd >= 1 ? 'text-positive' : 'text-negative'}`}>{stats.kd.toFixed(2)}</td>
                    <td className="py-2.5 text-right font-black">{Math.round(stats.acs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <PanelHeader title="Around the League" subtitle="Latest results" action="See all" onAction={() => setScreen('aroundLeague')} />
          <div className="mt-4 space-y-2">
            {recentLeague.length === 0 && <p className="text-sm text-muted">No matches played yet.</p>}
            {recentLeague.map((result) => (
              <div key={result.id} className="rounded-xl border border-line bg-surface-2 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="tnum text-sm font-bold">
                    {teamShort(game, result.homeTeamId)} {result.homeMaps}-{result.awayMaps} {teamShort(game, result.awayTeamId)}
                  </p>
                  <span className="text-[0.65rem] uppercase tracking-wider text-faint">D{result.day}</span>
                </div>
                <p className="mt-0.5 text-xs text-muted">{teamName(game, result.winnerTeamId)} win</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}
