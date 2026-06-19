import { useEffect } from 'react';
import type { GameState, MatchResult } from '@valorant-manager/game-core';
import { teamName } from '../lib/stats';
import { Pill } from './ui';

function resultLabel(result: MatchResult) {
  if (result.fixtureType === 'playoff') {
    return result.playoffRound === 'final' ? 'Playoff Final' : 'Playoff Semifinal';
  }
  return `Week ${result.matchday}`;
}

export function BoxScoreModal({ game, result, onClose }: { game: GameState; result: MatchResult; onClose: () => void }) {
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
  const roundsFor = (teamId: string) => (teamId === result.homeTeamId ? result.homeRounds : result.awayRounds);

  const TeamBoxScore = ({ teamId }: { teamId: string }) => {
    const team = teamsById.get(teamId);
    const isUserTeam = teamId === game.userTeamId;
    const isWinner = teamId === result.winnerTeamId;
    const stats = result.boxScore.filter((stat) => stat.teamId === teamId).sort((a, b) => b.acs - a.acs);

    return (
      <div className={`rounded-xl border ${isUserTeam ? 'border-valorant/30' : 'border-line'} bg-surface-2`}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="h-5 w-1.5 rounded-full"
              style={{ background: team ? `linear-gradient(${team.colors.primary}, ${team.colors.secondary})` : undefined }}
            />
            <span className="font-black">{teamName(game, teamId)}</span>
            {isWinner && <Pill tone="positive">Win</Pill>}
          </div>
          <span className="tnum text-2xl font-black">{roundsFor(teamId)}</span>
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
              {stats.map((stat) => {
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
              {teamName(game, result.homeTeamId)} <span className="text-faint">{result.homeRounds} – {result.awayRounds}</span> {teamName(game, result.awayTeamId)}
            </h2>
            <p className="mt-0.5 text-xs text-faint">Day {result.day}</p>
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

        <div className="space-y-4 p-5">
          {result.summary && <p className="text-sm text-muted">{result.summary}</p>}
          {orderedTeamIds.map((teamId) => (
            <TeamBoxScore key={teamId} teamId={teamId} />
          ))}
        </div>
      </div>
    </div>
  );
}
