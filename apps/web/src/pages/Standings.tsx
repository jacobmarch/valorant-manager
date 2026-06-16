import { useGameStore } from '../store/useGameStore';

export function Standings() {
  const game = useGameStore((state) => state.game)!;
  const teamsById = new Map(game.teams.map((team) => [team.id, team]));

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.4em] text-valorant">League Table</p>
      <h1 className="mt-2 text-3xl font-black">Standings</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-panel">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3">P</th>
              <th className="px-4 py-3">W</th>
              <th className="px-4 py-3">L</th>
              <th className="px-4 py-3">RF</th>
              <th className="px-4 py-3">RA</th>
              <th className="px-4 py-3">RD</th>
              <th className="px-4 py-3">Pts</th>
            </tr>
          </thead>
          <tbody>
            {game.standings.map((row, index) => {
              const team = teamsById.get(row.teamId);
              return (
                <tr key={row.teamId} className={`border-t border-white/10 ${row.teamId === game.userTeamId ? 'bg-valorant/10' : ''}`}>
                  <td className="px-4 py-4 font-bold">{index + 1}</td>
                  <td className="px-4 py-4">
                    <p className="font-bold">{team?.name}</p>
                    <p className="text-xs text-slate-500">{team?.city}</p>
                  </td>
                  <td className="px-4 py-4">{row.played}</td>
                  <td className="px-4 py-4">{row.wins}</td>
                  <td className="px-4 py-4">{row.losses}</td>
                  <td className="px-4 py-4">{row.roundsFor}</td>
                  <td className="px-4 py-4">{row.roundsAgainst}</td>
                  <td className="px-4 py-4">{row.roundDiff}</td>
                  <td className="px-4 py-4 font-black">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
