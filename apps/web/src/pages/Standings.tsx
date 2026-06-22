import { useGameStore } from '../store/useGameStore';
import { getTeamForm } from '../lib/stats';
import { Card, Diff, Eyebrow, FormStreak, PanelHeader, TeamSpine } from '../components/ui';
import { PlayoffBracket } from '../components/PlayoffBracket';
import { useDrilldown } from '../components/Drilldown';

const PLAYOFF_CUTOFF = 4;

export function Standings() {
  const game = useGameStore((state) => state.game)!;
  const setScreen = useGameStore((state) => state.setScreen);
  const { openTeam } = useDrilldown();
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));

  return (
    <section className="space-y-6">
      <div>
        <Eyebrow>League Table</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Season {game.seasonYear} Standings</h1>
        <p className="mt-1 text-sm text-muted">Ranked by map differential, then round differential. Top {PLAYOFF_CUTOFF} qualify for playoffs.</p>
      </div>

      {game.seasonPhase !== 'regularSeason' && (
        <Card className="p-5">
          <PanelHeader title="Playoff Bracket" subtitle={`Season ${game.seasonYear} postseason`} action="Schedule" onAction={() => setScreen('schedule')} />
          <div className="mt-4">
            <PlayoffBracket game={game} />
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm tnum">
            <thead className="border-b border-border bg-surface-2 text-[0.65rem] uppercase tracking-wider text-faint">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Team</th>
                <th className="px-3 py-3 text-center font-semibold">P</th>
                <th className="px-3 py-3 text-center font-semibold">W</th>
                <th className="px-3 py-3 text-center font-semibold">L</th>
                <th className="px-3 py-3 text-center font-semibold">MF</th>
                <th className="px-3 py-3 text-center font-semibold">MA</th>
                <th className="px-3 py-3 text-center font-semibold">MD</th>
                <th className="px-3 py-3 text-center font-semibold">RD</th>
                <th className="px-4 py-3 font-semibold">Form</th>
              </tr>
            </thead>
            <tbody>
              {game.standings.map((row, index) => {
                const team = teamsById.get(row.teamId);
                const isUser = row.teamId === game.userTeamId;
                const rank = index + 1;
                const playoffLine = rank === PLAYOFF_CUTOFF;
                return (
                  <tr
                    key={row.teamId}
                    onClick={() => openTeam(row.teamId)}
                    role="button"
                    title="View team"
                    style={isUser ? { borderLeftColor: team?.colors.primary } : undefined}
                    className={`cursor-pointer border-b border-line ${playoffLine ? 'border-b-2 border-b-gold/40' : ''} ${
                      isUser ? 'border-l-2 bg-surface-2' : 'hover:bg-surface-2'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`font-display font-bold ${rank <= PLAYOFF_CUTOFF ? 'text-gold' : 'text-faint'}`}>{rank}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <TeamSpine colors={team?.colors} className="h-7 w-1" />
                        <div>
                          <p className="font-semibold text-ink">{team?.name}</p>
                          <p className="text-xs text-faint">{team?.region}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-muted">{row.played}</td>
                    <td className="px-3 py-3 text-center font-bold text-positive">{row.wins}</td>
                    <td className="px-3 py-3 text-center font-bold text-negative">{row.losses}</td>
                    <td className="px-3 py-3 text-center text-muted">{row.mapsFor}</td>
                    <td className="px-3 py-3 text-center text-muted">{row.mapsAgainst}</td>
                    <td className="px-3 py-3 text-center">
                      <Diff value={row.mapDiff} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <Diff value={row.roundDiff} />
                    </td>
                    <td className="px-4 py-3">
                      <FormStreak form={getTeamForm(game, row.teamId, 5)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
