import { useEffect, useState } from 'react';
import type { GameState, MatchResult, PlayerMatchStat } from '@valorant-manager/game-core';
import { teamName } from '../lib/stats';
import { Pill } from './ui';

function resultLabel(result: MatchResult) {
  if (result.fixtureType === 'playoff') {
    return result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal';
  }
  return `Week ${result.matchday}`;
}

// -1 represents the aggregated "All Maps" view; 0+ is an individual map index.
const ALL_MAPS = -1;

export function BoxScoreModal({ game, result, onClose }: { game: GameState; result: MatchResult; onClose: () => void }) {
  const [tab, setTab] = useState<number>(ALL_MAPS);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const playersById = new Map(game.teams.flatMap((team) => team.players).map((player) => [player.id, player]));
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));

  const loserTeamId = result.winnerTeamId === result.homeTeamId ? result.awayTeamId : result.homeTeamId;
  const orderedTeamIds = [result.winnerTeamId, loserTeamId];

  // Guard against legacy results saved before per-map data existed.
  const maps = result.maps ?? [];
  const homeMaps = result.homeMaps ?? ((result.homeRounds ?? 0) >= (result.awayRounds ?? 0) ? 1 : 0);
  const awayMaps = result.awayMaps ?? ((result.awayRounds ?? 0) > (result.homeRounds ?? 0) ? 1 : 0);

  const activeMap = tab === ALL_MAPS ? undefined : maps[tab];
  const boxScore = (activeMap ? activeMap.boxScore : result.boxScore) ?? [];

  // Score shown next to each team: series maps on "All Maps", map rounds otherwise.
  const teamScore = (teamId: string) => {
    if (!activeMap) {
      return teamId === result.homeTeamId ? homeMaps : awayMaps;
    }
    return teamId === result.homeTeamId ? activeMap.homeRounds : activeMap.awayRounds;
  };

  const isWinner = (teamId: string) => {
    if (!activeMap) {
      return teamId === result.winnerTeamId;
    }
    const mapWinnerId = activeMap.homeRounds > activeMap.awayRounds ? result.homeTeamId : result.awayTeamId;
    return teamId === mapWinnerId;
  };

  const TeamBoxScore = ({ teamId, stats }: { teamId: string; stats: PlayerMatchStat[] }) => {
    const team = teamsById.get(teamId);
    const isUserTeam = teamId === game.userTeamId;
    const sorted = [...stats].sort((a, b) => b.acs - a.acs);

    return (
      <div className={`rounded-xl border ${isUserTeam ? 'border-valorant/30' : 'border-line'} bg-surface-2`}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="h-5 w-1.5 rounded-full"
              style={{ background: team ? `linear-gradient(${team.colors.primary}, ${team.colors.secondary})` : undefined }}
            />
            <span className="font-black">{teamName(game, teamId)}</span>
            {isWinner(teamId) && <Pill tone="positive">Win</Pill>}
          </div>
          <span className="tnum text-2xl font-black">{teamScore(teamId)}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[380px] text-sm tnum">
            <thead>
              <tr className="text-left text-[0.6rem] uppercase tracking-wider text-faint">
                <th className="px-4 pb-2 pt-3 font-semibold">Player</th>
                <th className="pb-2 pt-3 text-center font-semibold">K</th>
                <th className="pb-2 pt-3 text-center font-semibold">D</th>
                <th className="pb-2 pt-3 text-center font-semibold">A</th>
                <th className="px-4 pb-2 pt-3 text-right font-semibold">ACS</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((stat) => {
                const player = playersById.get(stat.playerId);
                return (
                  <tr key={stat.playerId} className="border-t border-line">
                    <td className="px-4 py-2 font-bold">{player?.handle ?? 'Unknown'}</td>
                    <td className="py-2 text-center">{stat.kills}</td>
                    <td className="py-2 text-center">{stat.deaths}</td>
                    <td className="py-2 text-center">{stat.assists}</td>
                    <td className="px-4 py-2 text-right font-black text-valorant-bright">{stat.acs}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabClass = (active: boolean) =>
    `shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
      active ? 'bg-valorant text-white' : 'bg-surface-2 text-muted hover:text-ink'
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="my-auto w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-5">
          <div>
            <Pill tone={result.fixtureType === 'playoff' ? 'gold' : 'neutral'}>{resultLabel(result)}</Pill>
            <h2 className="mt-2 tnum text-xl font-black">
              {teamName(game, result.homeTeamId)} <span className="text-faint">{homeMaps} – {awayMaps}</span> {teamName(game, result.awayTeamId)}
            </h2>
            <p className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-faint">
              <span>Day {result.day}</span>
              {maps.map((map, index) => (
                <span key={index} className="tnum">
                  · Map {index + 1} {map.homeRounds}-{map.awayRounds}
                </span>
              ))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2.5 py-1 text-lg font-bold text-muted transition hover:bg-surface-3 hover:text-ink"
            aria-label="Close box score"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-line px-5 py-3">
          <button type="button" className={tabClass(tab === ALL_MAPS)} onClick={() => setTab(ALL_MAPS)}>
            All Maps
          </button>
          {maps.map((map, index) => (
            <button key={index} type="button" className={tabClass(tab === index)} onClick={() => setTab(index)}>
              Map {index + 1}
              <span className="ml-1.5 tnum text-faint">{map.homeRounds}-{map.awayRounds}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4 p-5">
          {tab === ALL_MAPS && result.summary && <p className="text-sm text-muted">{result.summary}</p>}
          {orderedTeamIds.map((teamId) => (
            <TeamBoxScore key={teamId} teamId={teamId} stats={boxScore.filter((stat) => stat.teamId === teamId)} />
          ))}
        </div>
      </div>
    </div>
  );
}
