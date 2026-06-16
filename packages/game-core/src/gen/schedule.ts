import type { Fixture, Team } from '../types/models';

export function createDoubleRoundRobinSchedule(teams: Team[], seasonYear = 1, startDay = 1): Fixture[] {
  if (teams.length !== 8) {
    throw new Error('Sample league requires exactly 8 teams.');
  }

  const teamIds = teams.map((team) => team.id);
  const firstLeg: Array<Array<[string, string]>> = [];
  let rotation = [...teamIds];

  for (let round = 0; round < teamIds.length - 1; round += 1) {
    const fixtures: Array<[string, string]> = [];

    for (let index = 0; index < teamIds.length / 2; index += 1) {
      const left = rotation[index];
      const right = rotation[rotation.length - 1 - index];
      const flipHome = (round + index) % 2 === 1;
      fixtures.push(flipHome ? [right, left] : [left, right]);
    }

    firstLeg.push(fixtures);
    rotation = [rotation[0], rotation[rotation.length - 1], ...rotation.slice(1, -1)];
  }

  const secondLeg = firstLeg.map((round) => round.map(([home, away]) => [away, home] as [string, string]));
  return [...firstLeg, ...secondLeg].flatMap((round, roundIndex) =>
    round.map(([homeTeamId, awayTeamId], fixtureIndex) => ({
      id: `s${seasonYear}-regular-md${roundIndex + 1}-fixture${fixtureIndex + 1}`,
      seasonYear,
      type: 'regular' as const,
      day: startDay + roundIndex,
      matchday: roundIndex + 1,
      homeTeamId,
      awayTeamId
    }))
  );
}
