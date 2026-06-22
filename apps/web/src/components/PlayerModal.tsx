import type { GameState, Player } from '@valorant-manager/game-core';
import { getPlayerMatchLog, getPlayerOverall, getPlayerSeasonStats, teamById, teamShort } from '../lib/stats';
import { AttributeBar, ConditionMeter, Eyebrow, Modal, Pill } from './ui';
import { useDrilldown } from './Drilldown';

const attributeLabels: Array<[keyof Player['attributes'], string]> = [
  ['aim', 'Aim'],
  ['gameSense', 'Game Sense'],
  ['utility', 'Utility'],
  ['clutch', 'Clutch'],
  ['communication', 'Comms'],
  ['consistency', 'Consistency']
];

/** Full player detail popup — attributes, condition, season averages and a game-by-game log. */
export function PlayerModal({ game, player, onClose }: { game: GameState; player: Player; onClose: () => void }) {
  const { openResult, openTeam } = useDrilldown();
  const team = teamById(game, player.teamId);
  const overall = getPlayerOverall(player);
  const stats = getPlayerSeasonStats(game, player.id);
  const log = getPlayerMatchLog(game, player.id);

  return (
    <Modal
      onClose={onClose}
      spine={team?.colors}
      eyebrow={
        <Eyebrow>
          {player.role} ·{' '}
          {team ? (
            <button
              type="button"
              onClick={() => openTeam(team.id)}
              className="text-faint underline decoration-dotted underline-offset-2 transition-colors hover:text-ink"
            >
              {team.name}
            </button>
          ) : (
            'Free agent'
          )}{' '}
          · Age {player.age}
        </Eyebrow>
      }
      title={
        <span className="flex items-baseline gap-3">
          {player.handle}
          <span className="font-display tnum text-base font-bold text-valorant-bright">{overall} OVR</span>
        </span>
      }
    >
      <div className="space-y-5 p-5">
        <p className="text-sm text-muted">{player.name}</p>

        {/* Season averages */}
        <div className="grid grid-cols-4 gap-2 rounded-md border border-line bg-surface-2 p-3 text-center tnum">
          <div>
            <p className="font-display text-lg font-bold">{stats.games}</p>
            <p className="text-[0.6rem] uppercase tracking-wider text-faint">Games</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold">
              {stats.kills.toFixed(1)}/{stats.deaths.toFixed(1)}/{stats.assists.toFixed(1)}
            </p>
            <p className="text-[0.6rem] uppercase tracking-wider text-faint">K/D/A</p>
          </div>
          <div>
            <p className={`font-display text-lg font-bold ${stats.kd >= 1 ? 'text-positive' : 'text-negative'}`}>{stats.kd.toFixed(2)}</p>
            <p className="text-[0.6rem] uppercase tracking-wider text-faint">KD</p>
          </div>
          <div>
            <p className="font-display text-lg font-bold text-valorant-bright">{Math.round(stats.acs)}</p>
            <p className="text-[0.6rem] uppercase tracking-wider text-faint">ACS</p>
          </div>
        </div>

        {/* Attributes */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted">Attributes</h3>
            <Pill tone="accent">POT {player.attributes.potential}</Pill>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {attributeLabels.map(([key, label]) => (
              <AttributeBar key={key} label={label} value={player.attributes[key]} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <ConditionMeter label="Morale" value={player.attributes.morale} tone="good-high" />
            <ConditionMeter label="Fatigue" value={player.attributes.fatigue} tone="good-low" />
          </div>
        </div>

        {/* Game log */}
        <div>
          <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wider text-muted">Recent Games</h3>
          {log.length === 0 ? (
            <p className="rounded-md border border-line bg-surface-2 px-3 py-3 text-sm text-faint">No games played yet this season.</p>
          ) : (
            <div className="overflow-hidden rounded-md border border-line">
              <table className="w-full text-sm tnum">
                <thead>
                  <tr className="bg-surface-2 text-left text-[0.6rem] uppercase tracking-wider text-faint">
                    <th className="px-3 py-2 font-semibold">Opponent</th>
                    <th className="py-2 text-center font-semibold">Res</th>
                    <th className="py-2 text-center font-semibold">K</th>
                    <th className="py-2 text-center font-semibold">D</th>
                    <th className="py-2 text-center font-semibold">A</th>
                    <th className="px-3 py-2 text-right font-semibold">ACS</th>
                  </tr>
                </thead>
                <tbody>
                  {log.slice(0, 10).map(({ result, stat, opponentId, won }) => (
                    <tr
                      key={result.id}
                      onClick={() => openResult(result)}
                      role="button"
                      title="View box score"
                      className="cursor-pointer border-t border-line transition-colors hover:bg-surface-2"
                    >
                      <td className="px-3 py-2 font-semibold">
                        <span className="text-faint">vs </span>
                        {teamShort(game, opponentId)}
                        <span className="ml-1.5 text-[0.65rem] text-faint">D{result.day}</span>
                      </td>
                      <td className={`py-2 text-center font-bold ${won ? 'text-positive' : 'text-negative'}`}>{won ? 'W' : 'L'}</td>
                      <td className="py-2 text-center">{stat.kills}</td>
                      <td className="py-2 text-center">{stat.deaths}</td>
                      <td className="py-2 text-center">{stat.assists}</td>
                      <td className="px-3 py-2 text-right font-bold text-valorant-bright">{stat.acs}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
