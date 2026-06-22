import type { Fixture } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { teamName } from '../lib/stats';
import { Card, Eyebrow, Pill } from '../components/ui';
import { PlayoffBracket } from '../components/PlayoffBracket';
import { useDrilldown } from '../components/Drilldown';

export function Schedule() {
  const game = useGameStore((state) => state.game)!;
  const { openResult } = useDrilldown();
  const involvesUser = (fixture: Fixture) => fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId;

  const nextFixtureId = game.schedule.find(
    (fixture) => !fixture.result && fixture.day >= game.currentDay && involvesUser(fixture)
  )?.id;

  const userFixtures = game.schedule
    .filter((fixture) => fixture.type === 'regular' && involvesUser(fixture))
    .sort((a, b) => a.matchday - b.matchday);

  const playoffFixtures = game.schedule.filter((fixture) => fixture.type === 'playoff');

  const renderRow = (fixture: Fixture) => {
    const isHome = fixture.homeTeamId === game.userTeamId;
    const opponentId = isHome ? fixture.awayTeamId : fixture.homeTeamId;
    const isNext = fixture.id === nextFixtureId;

    let status: { text: string; tone: 'win' | 'loss' | 'neutral' };
    if (fixture.result) {
      const userWon = fixture.result.winnerTeamId === game.userTeamId;
      const userMaps = isHome ? fixture.result.homeMaps : fixture.result.awayMaps;
      const oppMaps = isHome ? fixture.result.awayMaps : fixture.result.homeMaps;
      status = { text: `${userMaps}-${oppMaps}`, tone: userWon ? 'win' : 'loss' };
    } else if (fixture.day < game.currentDay) {
      status = { text: 'Skipped', tone: 'neutral' };
    } else {
      status = { text: 'Upcoming', tone: 'neutral' };
    }
    const statusColor = status.tone === 'win' ? 'text-positive' : status.tone === 'loss' ? 'text-negative' : 'text-faint';
    const hasBoxScore = Boolean(fixture.result);

    return (
      <div
        key={fixture.id}
        onClick={hasBoxScore ? () => openResult(fixture.result!) : undefined}
        role={hasBoxScore ? 'button' : undefined}
        title={hasBoxScore ? 'View box score' : undefined}
        className={`flex items-center gap-4 rounded-md border px-4 py-3 ${
          isNext ? 'border-border-strong bg-surface-3' : 'border-line bg-surface-2'
        } ${hasBoxScore ? 'cursor-pointer transition hover:border-border-strong hover:bg-surface-3' : ''}`}
      >
        <div className="flex h-10 w-14 shrink-0 flex-col items-center justify-center rounded-md bg-surface-3">
          <span className="text-[0.55rem] font-semibold uppercase tracking-wider text-faint">Week</span>
          <span className="font-display tnum text-base font-bold leading-none">{fixture.matchday}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            <span className="text-faint">{isHome ? 'vs' : '@'} </span>
            {teamName(game, opponentId)}
          </p>
          <p className="text-xs text-faint">{isHome ? 'Home' : 'Away'} · Day {fixture.day}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isNext && <Pill tone="accent">Next</Pill>}
          <span className={`tnum text-sm font-bold ${statusColor}`}>{status.text}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>Season {game.seasonYear}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="mt-1 text-sm text-muted">Your team plays one game per week through the regular season, then the playoffs.</p>
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Regular Season</h2>
        {userFixtures.length === 0 ? (
          <p className="mt-3 text-sm text-faint">No regular season games scheduled.</p>
        ) : (
          <div className="mt-3 space-y-2.5">{userFixtures.map(renderRow)}</div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Playoffs</h2>
        {playoffFixtures.length === 0 ? (
          <p className="mt-3 text-sm text-faint">The playoff bracket appears after the regular season ends.</p>
        ) : (
          <div className="mt-4">
            <PlayoffBracket game={game} />
          </div>
        )}
      </Card>
    </section>
  );
}
