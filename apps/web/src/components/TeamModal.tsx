import type { GameState, Team } from '@valorant-manager/game-core';
import {
  getPlayerOverall,
  getPlayerSeasonStats,
  getTeamForm,
  getTeamOverall,
  getTeamResults,
  teamShort
} from '../lib/stats';
import { Diff, Eyebrow, FormStreak, Modal, Pill, StatTile } from './ui';
import { useDrilldown } from './Drilldown';

function resultLabel(fixtureType: string, playoffRound?: string, matchday?: number): string {
  if (fixtureType === 'playoff') {
    return playoffRound === 'final' ? 'Final' : 'Semi';
  }
  return `MD ${matchday}`;
}

/** Full team detail popup — standing, form, roster and result history. Reachable from any team in the UI. */
export function TeamModal({ game, team, onClose }: { game: GameState; team: Team; onClose: () => void }) {
  const { openPlayer, openResult } = useDrilldown();

  const standingIndex = game.standings.findIndex((row) => row.teamId === team.id);
  const standing = standingIndex >= 0 ? game.standings[standingIndex] : undefined;
  const rank = standingIndex >= 0 ? standingIndex + 1 : undefined;
  const titles = game.seasonHistory.filter((season) => season.championTeamId === team.id);
  const results = getTeamResults(game, team.id);

  const roster = [...team.players]
    .map((player) => ({ player, overall: getPlayerOverall(player), acs: getPlayerSeasonStats(game, player.id).acs }))
    .sort((a, b) => b.overall - a.overall);

  return (
    <Modal
      onClose={onClose}
      spine={team.colors}
      eyebrow={
        <Eyebrow>
          {team.region}
          {rank ? ` · #${rank} in table` : ''}
          {titles.length > 0 ? ` · ${titles.length}× champion` : ''}
        </Eyebrow>
      }
      title={team.name}
    >
      <div className="space-y-5 p-5">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <StatTile label="Team OVR" value={getTeamOverall(team)} tone="accent" />
          <StatTile label="Record" value={`${standing?.wins ?? 0}-${standing?.losses ?? 0}`} />
          <StatTile label="Map Diff" value={<Diff value={standing?.mapDiff ?? 0} />} />
          <StatTile label="Round Diff" value={<Diff value={standing?.roundDiff ?? 0} />} />
        </div>

        <div className="flex items-center justify-between rounded-md border border-line bg-surface-2 px-4 py-3">
          <span className="text-[0.65rem] uppercase tracking-wider text-faint">Recent form</span>
          <FormStreak form={getTeamForm(game, team.id, 6)} />
        </div>

        {/* Roster */}
        <div>
          <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted">Roster</h3>
          <div className="overflow-hidden rounded-md border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-2 text-left text-[0.6rem] uppercase tracking-wider text-faint">
                  <th className="px-3 py-2 font-semibold">Player</th>
                  <th className="py-2 text-center font-semibold">Role</th>
                  <th className="py-2 text-center font-semibold">OVR</th>
                  <th className="px-3 py-2 text-right font-semibold">ACS</th>
                </tr>
              </thead>
              <tbody className="tnum">
                {roster.map(({ player, overall, acs }) => (
                  <tr
                    key={player.id}
                    onClick={() => openPlayer(player.id)}
                    role="button"
                    title="View player"
                    className="cursor-pointer border-t border-line transition-colors hover:bg-surface-2"
                  >
                    <td className="px-3 py-2 font-semibold">
                      <span className="border-b border-dotted border-faint/40">{player.handle}</span>
                    </td>
                    <td className="py-2 text-center text-[0.7rem] uppercase tracking-wider text-faint">{player.role}</td>
                    <td className="py-2 text-center font-display font-bold">{overall}</td>
                    <td className="px-3 py-2 text-right font-bold text-valorant-bright">{Math.round(acs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Result history */}
        <div>
          <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted">Results</h3>
          {results.length === 0 ? (
            <p className="rounded-md border border-line bg-surface-2 px-3 py-3 text-sm text-faint">No matches played yet this season.</p>
          ) : (
            <div className="space-y-1.5">
              {results.slice(0, 10).map((result) => {
                const isHome = result.homeTeamId === team.id;
                const teamMaps = isHome ? result.homeMaps : result.awayMaps;
                const oppMaps = isHome ? result.awayMaps : result.homeMaps;
                const opponentId = isHome ? result.awayTeamId : result.homeTeamId;
                const won = result.winnerTeamId === team.id;
                return (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => openResult(result)}
                    title="View box score"
                    className="flex w-full items-center gap-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-left transition-colors hover:border-border-strong hover:bg-surface-3"
                  >
                    <span className={`w-5 text-center font-bold ${won ? 'text-positive' : 'text-negative'}`}>{won ? 'W' : 'L'}</span>
                    <span className="tnum font-display font-bold">
                      {teamMaps}<span className="text-faint">–</span>{oppMaps}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm">
                      <span className="text-faint">vs </span>
                      {teamShort(game, opponentId)}
                    </span>
                    <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>
                      {resultLabel(result.fixtureType, result.playoffRound, result.matchday)}
                    </Pill>
                    <span className="text-[0.65rem] uppercase tracking-wider text-faint">D{result.day}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
