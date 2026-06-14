import { selectUserTeam, useGameStore } from "../store/game-store";

export function Schedule() {
  const state = useGameStore((store) => store.state);
  const setStateAdvance = useGameStore((store) => store.advance);
  const startMatch = useGameStore((store) => store.startMatch);
  const userTeam = selectUserTeam(state);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Schedule</h1>
          <p className="text-slate-400">
            Week {state.calendar.week}, {state.calendar.day}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStateAdvance("aim")} className="rounded-xl bg-slate-800 px-4 py-2 hover:bg-slate-700">
            Advance Day
          </button>
          <button onClick={() => startMatch()} className="rounded-xl bg-rose-500 px-4 py-2 font-semibold hover:bg-rose-400">
            Prepare Match Day
          </button>
        </div>
      </div>
      <div className="grid gap-3">
        {state.fixtures.slice(0, 18).map((fixture) => {
          const home = state.teams.find((team) => team.id === fixture.homeTeamId);
          const away = state.teams.find((team) => team.id === fixture.awayTeamId);
          const involvesUser = fixture.homeTeamId === userTeam.id || fixture.awayTeamId === userTeam.id;
          return (
            <article
              key={fixture.id}
              className={`panel flex flex-wrap items-center justify-between gap-4 p-4 ${
                involvesUser ? "border-cyan-500/80" : ""
              }`}
            >
              <div>
                <p className="text-sm text-slate-400">Week {fixture.week}</p>
                <h3 className="font-semibold">
                  {home?.shortName} vs {away?.shortName}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className={fixture.played ? "text-green-300" : "text-slate-400"}>{fixture.played ? "Played" : "Upcoming"}</span>
                {involvesUser && !fixture.played && (
                  <button
                    onClick={() => startMatch(fixture.id)}
                    className="rounded-lg bg-cyan-400 px-3 py-2 text-sm font-semibold text-slate-950"
                  >
                    Play
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
