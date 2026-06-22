import { useGameStore } from '../store/useGameStore';
import { Card, Eyebrow, Pill, TeamSpine } from '../components/ui';
import { useDrilldown } from '../components/Drilldown';

export function MatchHistory() {
  const game = useGameStore((state) => state.game)!;
  const { openPlayer, openTeam, openResult } = useDrilldown();
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>Archive</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Season {game.seasonYear} Match History</h1>
        <p className="mt-1 text-sm text-muted">Tap a scoreline for the full match, or any player for their profile.</p>
      </div>

      {game.seasonHistory.length > 0 && (
        <Card className="p-5">
          <h2 className="font-display text-base font-bold">Past Champions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[...game.seasonHistory].reverse().map((season) => (
              <button
                key={season.seasonYear}
                type="button"
                onClick={() => openTeam(season.championTeamId)}
                title="View team"
                className="flex items-center justify-between rounded-md border border-line bg-surface-2 p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-3"
              >
                <div className="flex items-center gap-2.5">
                  <TeamSpine colors={teamsById.get(season.championTeamId)?.colors} className="h-9 w-1" />
                  <div>
                    <p className="text-xs text-faint">Season {season.seasonYear}</p>
                    <p className="font-display font-bold">{teamsById.get(season.championTeamId)?.name}</p>
                    <p className="text-xs text-muted">def. {teamsById.get(season.runnerUpTeamId)?.name}</p>
                  </div>
                </div>
                <Pill tone="gold">Champion</Pill>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {game.matchHistory.length === 0 && <Card className="p-6 text-muted">No completed matches yet.</Card>}
        {[...game.matchHistory].reverse().map((result) => {
          const userInvolved = result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId;
          const winner = teamsById.get(result.winnerTeamId);
          return (
            <Card key={result.id} className={`p-5 ${userInvolved ? 'ring-1 ring-border-strong' : ''}`}>
              {/* Scoreline drills into the full match */}
              <button
                onClick={() => openResult(result)}
                className="flex w-full flex-wrap items-center justify-between gap-3 text-left"
                title="View full match"
              >
                <div className="flex items-center gap-3">
                  <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>
                    {result.fixtureType === 'playoff' ? (result.playoffRound === 'final' ? 'Final' : 'Semifinal') : `MD ${result.matchday}`}
                  </Pill>
                  <h2 className="font-display tnum text-xl font-bold">
                    {teamsById.get(result.homeTeamId)?.shortName} {result.homeMaps}
                    <span className="text-faint"> – </span>
                    {result.awayMaps} {teamsById.get(result.awayTeamId)?.shortName}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <div>
                    <p className="text-sm font-semibold text-positive">{winner?.name} win</p>
                    <p className="text-xs text-faint">Day {result.day}</p>
                  </div>
                  <span className="text-faint">→</span>
                </div>
              </button>
              <p className="mt-2 text-sm text-muted">{result.summary}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {[...result.boxScore]
                  .sort((a, b) => b.acs - a.acs)
                  .map((stat) => {
                    const player = playersById.get(stat.playerId);
                    const isUserTeam = stat.teamId === game.userTeamId;
                    return (
                      <button
                        key={stat.playerId}
                        onClick={() => player && openPlayer(stat.playerId)}
                        title="View player"
                        className={`rounded-md border p-3 text-left transition-colors hover:border-border-strong hover:bg-surface-3 ${
                          isUserTeam ? 'border-border-strong bg-surface-3' : 'border-line bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold">{player?.handle}</p>
                          <span className="text-[0.6rem] uppercase tracking-wider text-faint">{teamsById.get(stat.teamId)?.shortName}</span>
                        </div>
                        <p className="mt-1.5 tnum text-sm">
                          <span className="text-muted">
                            {stat.kills}/{stat.deaths}/{stat.assists}
                          </span>{' '}
                          · <span className="font-bold text-valorant-bright">{stat.acs}</span>{' '}
                          <span className="text-faint">ACS</span>
                        </p>
                      </button>
                    );
                  })}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
