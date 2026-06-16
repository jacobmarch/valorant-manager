import { useGameStore } from '../store/useGameStore';
import { Card, Eyebrow, Pill } from '../components/ui';

export function MatchHistory() {
  const game = useGameStore((state) => state.game)!;
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));
  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>Archive</Eyebrow>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Season {game.seasonYear} Match History</h1>
        <p className="mt-1 text-sm text-muted">Every completed result with full box scores.</p>
      </div>

      {game.seasonHistory.length > 0 && (
        <Card className="p-5">
          <h2 className="text-base font-black">Past Champions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[...game.seasonHistory].reverse().map((season) => (
              <div key={season.seasonYear} className="flex items-center justify-between rounded-xl border border-line bg-surface-2 p-4">
                <div>
                  <p className="text-xs text-faint">Season {season.seasonYear}</p>
                  <p className="font-black">{teamsById.get(season.championTeamId)?.name}</p>
                  <p className="text-xs text-muted">def. {teamsById.get(season.runnerUpTeamId)?.name}</p>
                </div>
                <Pill tone="gold">Champion</Pill>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {game.matchHistory.length === 0 && <Card className="p-6 text-muted">No completed matches yet.</Card>}
        {[...game.matchHistory].reverse().map((result) => {
          const userInvolved = result.homeTeamId === game.userTeamId || result.awayTeamId === game.userTeamId;
          return (
            <Card key={result.id} className={`p-5 ${userInvolved ? 'ring-1 ring-valorant/20' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>
                    {result.fixtureType === 'playoff' ? (result.playoffRound === 'final' ? 'Final' : 'Semifinal') : `MD ${result.matchday}`}
                  </Pill>
                  <h2 className="tnum text-xl font-black">
                    {teamsById.get(result.homeTeamId)?.shortName} {result.homeRounds}
                    <span className="text-faint"> – </span>
                    {result.awayRounds} {teamsById.get(result.awayTeamId)?.shortName}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-positive">{teamsById.get(result.winnerTeamId)?.name} win</p>
                  <p className="text-xs text-faint">Day {result.day}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{result.summary}</p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {[...result.boxScore]
                  .sort((a, b) => b.acs - a.acs)
                  .map((stat) => {
                    const player = playersById.get(stat.playerId);
                    const isUserTeam = stat.teamId === game.userTeamId;
                    return (
                      <div key={stat.playerId} className={`rounded-xl border p-3 ${isUserTeam ? 'border-valorant/30 bg-valorant/5' : 'border-line bg-surface-2'}`}>
                        <div className="flex items-center justify-between">
                          <p className="font-bold">{player?.handle}</p>
                          <span className="text-[0.6rem] uppercase tracking-wider text-faint">{teamsById.get(stat.teamId)?.shortName}</span>
                        </div>
                        <p className="mt-1.5 tnum text-sm">
                          <span className="text-muted">
                            {stat.kills}/{stat.deaths}/{stat.assists}
                          </span>{' '}
                          · <span className="font-black text-valorant-bright">{stat.acs}</span>{' '}
                          <span className="text-faint">ACS</span>
                        </p>
                      </div>
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
