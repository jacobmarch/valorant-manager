import { getPlayoffFixtures, type Fixture, type GameState } from '@valorant-manager/game-core';
import { teamName } from '../lib/stats';
import { Pill } from './ui';
import { useDrilldown } from './Drilldown';

function BracketMatch({ game, fixture }: { game: GameState; fixture: Fixture }) {
  const { openResult, openTeam } = useDrilldown();
  const winnerId = fixture.result?.winnerTeamId;
  const rows = [
    { teamId: fixture.homeTeamId, seed: fixture.homeSeed, maps: fixture.result?.homeMaps },
    { teamId: fixture.awayTeamId, seed: fixture.awaySeed, maps: fixture.result?.awayMaps }
  ];
  const clickable = Boolean(fixture.result);

  return (
    <div
      onClick={clickable ? () => openResult(fixture.result!) : undefined}
      role={clickable ? 'button' : undefined}
      title={clickable ? 'View box score' : undefined}
      className={`rounded-md border border-line bg-surface-2 p-2.5 ${
        clickable ? 'cursor-pointer transition hover:border-border-strong' : ''
      }`}
    >
      <p className="mb-2 text-[0.65rem] uppercase tracking-wider text-faint">
        {fixture.playoffRound === 'final' ? 'Final' : 'Semifinal'} · Day {fixture.day}
      </p>
      <div className="space-y-1.5">
        {rows.map((row) => {
          const isWinner = winnerId === row.teamId;
          return (
            <button
              type="button"
              key={row.teamId}
              onClick={(event) => {
                event.stopPropagation();
                openTeam(row.teamId);
              }}
              title="View team"
              className={`flex w-full items-center justify-between gap-2 rounded px-2.5 py-1.5 text-sm transition-colors ${
                isWinner ? 'bg-surface-3 font-bold text-ink ring-1 ring-border-strong' : 'bg-surface-2 text-faint hover:text-ink'
              }`}
            >
              <span className="truncate text-left">
                {row.seed ? <span className="text-faint">#{row.seed} </span> : ''}
                {teamName(game, row.teamId)}
              </span>
              <span className="tnum font-bold">{row.maps ?? '–'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PlayoffBracket({ game }: { game: GameState }) {
  const { openTeam } = useDrilldown();
  const semifinals = getPlayoffFixtures(game, 'semifinal');
  const finals = getPlayoffFixtures(game, 'final');
  const championId = game.playoffBracket?.championTeamId;

  return (
    <div>
      {championId && (
        <button
          type="button"
          onClick={() => openTeam(championId)}
          title="View team"
          className="mb-4 flex w-full items-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-3 py-2 text-left transition-colors hover:bg-gold/15"
        >
          <Pill tone="gold">Champion</Pill>
          <span className="font-bold">{teamName(game, championId)}</span>
        </button>
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
