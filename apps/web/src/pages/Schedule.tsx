import { useState } from 'react';
import type { Fixture } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { teamName } from '../lib/stats';
import { Card, Eyebrow, Pill } from '../components/ui';
import { PlayoffBracket } from '../components/PlayoffBracket';

const MATCHDAYS = 14;

export function Schedule() {
  const game = useGameStore((state) => state.game)!;
  const [mineOnly, setMineOnly] = useState(false);
  const nextFixtureId = game.schedule.find(
    (fixture) => !fixture.result && fixture.day >= game.currentDay && (fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId)
  )?.id;

  const involvesUser = (fixture: Fixture) => fixture.homeTeamId === game.userTeamId || fixture.awayTeamId === game.userTeamId;
  const regularFixtures = game.schedule.filter((fixture) => fixture.type === 'regular' && (!mineOnly || involvesUser(fixture)));
  const playoffFixtures = game.schedule.filter((fixture) => fixture.type === 'playoff');

  const renderFixture = (fixture: Fixture) => {
    const isUser = involvesUser(fixture);
    const isNext = fixture.id === nextFixtureId;
    let status: { text: string; tone: 'win' | 'loss' | 'neutral' };
    if (fixture.result) {
      const userWon = fixture.result.winnerTeamId === game.userTeamId;
      const tone = isUser ? (userWon ? 'win' : 'loss') : 'neutral';
      status = { text: `${fixture.result.homeRounds}-${fixture.result.awayRounds}`, tone };
    } else if (fixture.day < game.currentDay) {
      status = { text: fixture.type === 'playoff' ? 'Pending' : 'Skipped', tone: 'neutral' };
    } else {
      status = { text: 'Upcoming', tone: 'neutral' };
    }
    const statusColor = status.tone === 'win' ? 'text-positive' : status.tone === 'loss' ? 'text-negative' : 'text-faint';

    return (
      <div
        key={fixture.id}
        className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
          isNext ? 'border-valorant/50 bg-valorant/10' : isUser ? 'border-valorant/20 bg-surface-2' : 'border-line bg-surface-2'
        }`}
      >
        <div className="min-w-0">
          {fixture.type === 'playoff' && (
            <p className="text-[0.65rem] uppercase tracking-wider text-valorant">{fixture.playoffRound === 'final' ? 'Final' : 'Semifinal'}</p>
          )}
          <p className="truncate text-sm font-semibold">
            {fixture.homeSeed ? <span className="text-faint">#{fixture.homeSeed} </span> : ''}
            {teamName(game, fixture.homeTeamId)}
            <span className="text-faint"> vs </span>
            {fixture.awaySeed ? <span className="text-faint">#{fixture.awaySeed} </span> : ''}
            {teamName(game, fixture.awayTeamId)}
          </p>
          <p className="text-xs text-faint">Day {fixture.day}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isNext && <Pill tone="accent">Next</Pill>}
          <span className={`tnum text-sm font-black ${statusColor}`}>{status.text}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow>Season {game.seasonYear}</Eyebrow>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Schedule</h1>
          <p className="mt-1 text-sm text-muted">Double round-robin regular season, then playoffs.</p>
        </div>
        <button
          onClick={() => setMineOnly((value) => !value)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
            mineOnly ? 'border-valorant/50 bg-valorant/15 text-valorant-bright' : 'border-border bg-surface-2 text-muted hover:text-ink'
          }`}
        >
          {mineOnly ? '✓ My fixtures only' : 'My fixtures only'}
        </button>
      </div>

      <div className="space-y-4">
        {Array.from({ length: MATCHDAYS }, (_, index) => index + 1).map((matchday) => {
          const fixtures = regularFixtures.filter((fixture) => fixture.matchday === matchday);
          if (fixtures.length === 0) {
            return null;
          }
          return (
            <Card key={matchday} className="p-5">
              <h2 className="text-sm font-black uppercase tracking-wider text-muted">Matchday {matchday}</h2>
              <div className="mt-3 grid gap-2.5 md:grid-cols-2">{fixtures.map(renderFixture)}</div>
            </Card>
          );
        })}

        <Card className="p-5">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted">Playoffs</h2>
          {playoffFixtures.length === 0 ? (
            <p className="mt-3 text-sm text-faint">The playoff bracket appears after the regular season ends.</p>
          ) : (
            <div className="mt-4">
              <PlayoffBracket game={game} />
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
