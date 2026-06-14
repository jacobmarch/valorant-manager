import { describe, expect, it } from "vitest";
import { createNewGame, createMatchSimulatorForFixture, playFixture } from "../index";

describe("MatchSimulator", () => {
  it("simulates a complete first-to-13 match with commentary", () => {
    const state = createNewGame("Test Team", 123);
    const fixture = state.fixtures[0];
    const result = playFixture(state, fixture);

    expect(Math.max(...result.score)).toBe(13);
    expect(result.rounds.length).toBeGreaterThanOrEqual(13);
    expect(result.rounds.length).toBeLessThanOrEqual(25);
    expect(result.rounds.flatMap((round) => round.events).length).toBeGreaterThan(0);
    expect(result.winnerId).toBe(result.score[0] > result.score[1] ? fixture.homeTeamId : fixture.awayTeamId);
  });

  it("switches sides and resets economy at round 13", () => {
    const state = createNewGame("Test Team", 456);
    const fixture = state.fixtures[0];
    const simulator = createMatchSimulatorForFixture(state, fixture, 456);

    for (let index = 0; index < 12; index += 1) simulator.simulateNextRound();
    const round12 = simulator.completedRounds.at(-1);
    const round13 = simulator.simulateNextRound();

    expect(round12?.attackerId).not.toBe(round13.attackerId);
    expect(round13.buyPhases[fixture.homeTeamId]).toBe("eco");
    expect(round13.buyPhases[fixture.awayTeamId]).toBe("eco");
  });

  it("allows one tactical timeout per half", () => {
    const state = createNewGame("Test Team", 789);
    const fixture = state.fixtures[0];
    const simulator = createMatchSimulatorForFixture(state, fixture, 789);
    const first = simulator.callTimeout({ teamId: state.userTeamId, aggression: 70, siteFocus: "A" });
    const second = simulator.callTimeout({ teamId: state.userTeamId, aggression: 80, siteFocus: "B" });

    expect(first?.type).toBe("Timeout");
    expect(second).toBeNull();
  });
});
