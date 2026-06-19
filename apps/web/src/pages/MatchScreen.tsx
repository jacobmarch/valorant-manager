import { useState } from 'react';
import { getNextUserFixture, type MatchResult } from '@valorant-manager/game-core';
import { useGameStore } from '../store/useGameStore';
import { getTeamForm, getTeamOverall, teamById, teamName } from '../lib/stats';
import { Button, Card, Eyebrow, FormStreak, Pill } from '../components/ui';
import { BoxScoreModal } from '../components/BoxScoreModal';

export function MatchScreen() {
  const game = useGameStore((state) => state.game)!;
  const advanceDay = useGameStore((state) => state.advanceDay);
  const setScreen = useGameStore((state) => state.setScreen);
  const [openResult, setOpenResult] = useState<MatchResult | null>(null);
  const fixture = getNextUserFixture(game);
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const isToday = fixture?.day === game.currentDay;
  const championTeam = game.playoffBracket?.championTeamId ? teamsById.get(game.playoffBracket.championTeamId) : undefined;
  const lastResultForTeam = (teamId: string) =>
    [...game.matchHistory].reverse().find((result) => result.homeTeamId === teamId || result.awayTeamId === teamId);

  if (!fixture) {
    return (
      <Card className="p-6">
        <Eyebrow>Match Center</Eyebrow>
        <h1 className="mt-2 text-3xl font-black tracking-tight">{game.seasonPhase === 'seasonReview' ? 'Season Review' : 'No Upcoming Match'}</h1>
        {game.seasonPhase === 'seasonReview' && championTeam ? (
          <>
            <p className="mt-3 text-muted">
              Season {game.seasonYear} champion: <span className="font-bold text-ink">{championTeam.name}</span>
            </p>
            <p className="mt-2 text-sm text-faint">Advance the day from the dashboard to archive this season and begin next year.</p>
          </>
        ) : (
          <p className="mt-3 text-muted">There are no remaining user fixtures right now.</p>
        )}
        <Button variant="ghost" className="mt-5" onClick={() => setScreen('dashboard')}>
          Back to Dashboard
        </Button>
      </Card>
    );
  }

  const fixtureLabel = fixture.type === 'playoff' ? (fixture.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal') : `Matchday ${fixture.matchday}`;
  const home = teamById(game, fixture.homeTeamId)!;
  const away = teamById(game, fixture.awayTeamId)!;
  const homeStanding = game.standings.find((row) => row.teamId === home.id);
  const awayStanding = game.standings.find((row) => row.teamId === away.id);

  const TeamColumn = ({ teamId }: { teamId: string }) => {
    const team = teamById(game, teamId)!;
    const standing = game.standings.find((row) => row.teamId === teamId);
    return (
      <div className="flex flex-1 flex-col items-center gap-2 text-center">
        <span className="h-10 w-1.5 rounded-full" style={{ background: `linear-gradient(${team.colors.primary}, ${team.colors.secondary})` }} />
        <p className="text-lg font-black leading-tight">{team.name}</p>
        <p className="tnum text-sm text-muted">
          {standing?.wins ?? 0}-{standing?.losses ?? 0} · {getTeamOverall(team)} OVR
        </p>
        <FormStreak form={getTeamForm(game, teamId, 5)} />
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden p-0">
        <div className="h-1.5 bg-gradient-to-r from-valorant to-valorant-bright" />
        <div className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Eyebrow>Match Center</Eyebrow>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <TeamColumn teamId={home.id} />
            <div className="flex flex-col items-center">
              <Pill tone="accent">{fixtureLabel}</Pill>
              <p className="mt-2 text-2xl font-black text-faint">VS</p>
              <p className="text-xs text-faint">Day {fixture.day}</p>
            </div>
            <TeamColumn teamId={away.id} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isToday ? (
              <Button onClick={advanceDay}>Simulate Match Day</Button>
            ) : (
              <>
                <p className="w-full text-center text-sm text-muted">
                  This match is scheduled for day {fixture.day}. Advance to day {fixture.day} to play it.
                </p>
                <Button onClick={advanceDay}>Advance Day</Button>
                <Button variant="ghost" onClick={() => setScreen('dashboard')}>
                  Back to Dashboard
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Pre-match comparison */}
      <Card className="p-5">
        <h2 className="text-base font-black">Tale of the Tape</h2>
        <div className="mt-4 space-y-2 tnum">
          {[
            { label: 'Record', h: `${homeStanding?.wins ?? 0}-${homeStanding?.losses ?? 0}`, a: `${awayStanding?.wins ?? 0}-${awayStanding?.losses ?? 0}` },
            { label: 'Team OVR', h: getTeamOverall(home), a: getTeamOverall(away) },
            { label: 'Map Diff', h: homeStanding?.mapDiff ?? 0, a: awayStanding?.mapDiff ?? 0 },
            { label: 'Round Diff', h: homeStanding?.roundDiff ?? 0, a: awayStanding?.roundDiff ?? 0 }
          ].map((cmp) => (
            <div key={cmp.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-surface-2 px-4 py-2">
              <span className="text-left font-bold">{cmp.h}</span>
              <span className="text-[0.65rem] uppercase tracking-wider text-faint">{cmp.label}</span>
              <span className="text-right font-bold">{cmp.a}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black">Last Time Out</h2>
          <span className="text-xs text-faint">Tap a result for the full box score</span>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[home.id, away.id].map((teamId) => {
            const result = lastResultForTeam(teamId);
            const team = teamById(game, teamId)!;
            if (!result) {
              return (
                <div key={teamId} className="rounded-xl border border-line bg-surface-2 p-4">
                  <p className="font-bold">{team.name}</p>
                  <p className="mt-1 text-sm text-faint">No matches played yet.</p>
                </div>
              );
            }
            const isHome = result.homeTeamId === teamId;
            const teamMaps = (isHome ? result.homeMaps : result.awayMaps) ?? 0;
            const oppMaps = (isHome ? result.awayMaps : result.homeMaps) ?? 0;
            const oppId = isHome ? result.awayTeamId : result.homeTeamId;
            const won = result.winnerTeamId === teamId;
            const label =
              result.fixtureType === 'playoff'
                ? result.playoffRound === 'final'
                  ? 'Playoff Final'
                  : 'Playoff Semifinal'
                : `Week ${result.matchday}`;
            return (
              <button
                key={teamId}
                onClick={() => setOpenResult(result)}
                className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2 p-4 text-left transition hover:border-valorant/50 hover:bg-surface-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold">{team.name}</span>
                  <Pill tone={won ? 'positive' : 'negative'}>{won ? 'W' : 'L'}</Pill>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="tnum text-2xl font-black">
                    {teamMaps}-{oppMaps}
                  </span>
                  <span className="truncate text-sm text-muted">
                    {won ? 'def.' : 'lost to'} {teamName(game, oppId)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[0.65rem] uppercase tracking-wider text-faint">
                  <span>
                    {label} · Day {result.day}
                  </span>
                  <span className="text-valorant-bright">View box score →</span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {openResult && <BoxScoreModal game={game} result={openResult} onClose={() => setOpenResult(null)} />}
    </section>
  );
}
