import { getPlayoffFixtures, type Fixture, type GameState } from '@valorant-manager/game-core';
import { teamName } from '../lib/stats';
import { Pill } from './ui';

function BracketMatch({ game, fixture }: { game: GameState; fixture: Fixture }) {
  const winnerId = fixture.result?.winnerTeamId;
  const rows = [
    { teamId: fixture.homeTeamId, seed: fixture.homeSeed, maps: fixture.result?.homeMaps },
    { teamId: fixture.awayTeamId, seed: fixture.awaySeed, maps: fixture.result?.awayMaps }
  ];

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-2.5">
      <p className="mb-2 text-[0.65rem] uppercase tracking-wider text-faint">
        {fixture.playoffRound === 'final' ? 'Final' : 'Semifinal'} · Day {fixture.day}
      </p>
      <div className="space-y-1.5">
        {rows.map((row) => {
          const isWinner = winnerId === row.teamId;
          return (
            <div
              key={row.teamId}
              className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-sm ${
                isWinner ? 'bg-valorant/15 font-bold text-ink ring-1 ring-valorant/30' : 'bg-surface-3 text-muted'
              }`}
            >
              <span className="truncate">
                {row.seed ? <span className="text-faint">#{row.seed} </span> : ''}
                {teamName(game, row.teamId)}
              </span>
              <span className="tnum font-black">{row.maps ?? '–'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PlayoffBracket({ game }: { game: GameState }) {
  const semifinals = getPlayoffFixtures(game, 'semifinal');
  const finals = getPlayoffFixtures(game, 'final');
  const championId = game.playoffBracket?.championTeamId;

  return (
    <div>
      {championId && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-gold/30 bg-gold/10 px-3 py-2">
          <Pill tone="gold">Champion</Pill>
          <span className="font-black">{teamName(game, championId)}</span>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Semifinals</p>
          <div className="space-y-2">
            {semifinals.length === 0 && <p className="text-sm text-faint">Set after the regular season.</p>}
            {semifinals.map((fixture) => (
              <BracketMatch key={fixture.id} game={game} fixture={fixture} />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Final</p>
          <div className="space-y-2">
            {finals.length === 0 && <p className="text-sm text-faint">Set after semifinals.</p>}
            {finals.map((fixture) => (
              <BracketMatch key={fixture.id} game={game} fixture={fixture} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
