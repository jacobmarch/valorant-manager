import type { Fixture, PlayoffBracket, StandingsRow } from '../types/models';

export function createPlayoffBracket(standings: StandingsRow[], seasonYear: number): PlayoffBracket {
  return {
    seasonYear,
    seeds: standings.slice(0, 4).map((row, index) => ({
      seed: index + 1,
      teamId: row.teamId
    }))
  };
}

export function createSemifinalFixtures(bracket: PlayoffBracket, day: number): Fixture[] {
  const seed = (seedNumber: number) => {
    const entry = bracket.seeds.find((candidate) => candidate.seed === seedNumber);
    if (!entry) {
      throw new Error(`Missing playoff seed ${seedNumber}.`);
    }
    return entry;
  };

  const firstSeed = seed(1);
  const secondSeed = seed(2);
  const thirdSeed = seed(3);
  const fourthSeed = seed(4);

  return [
    {
      id: `s${bracket.seasonYear}-playoff-semi-1`,
      seasonYear: bracket.seasonYear,
      type: 'playoff',
      playoffRound: 'semifinal',
      day,
      matchday: day,
      homeTeamId: firstSeed.teamId,
      awayTeamId: fourthSeed.teamId,
      homeSeed: firstSeed.seed,
      awaySeed: fourthSeed.seed
    },
    {
      id: `s${bracket.seasonYear}-playoff-semi-2`,
      seasonYear: bracket.seasonYear,
      type: 'playoff',
      playoffRound: 'semifinal',
      day,
      matchday: day,
      homeTeamId: secondSeed.teamId,
      awayTeamId: thirdSeed.teamId,
      homeSeed: secondSeed.seed,
      awaySeed: thirdSeed.seed
    }
  ];
}

export function createFinalFixture(bracket: PlayoffBracket, semifinalFixtures: Fixture[], day: number): Fixture {
  const semifinalWinners = semifinalFixtures
    .filter((fixture) => fixture.playoffRound === 'semifinal' && fixture.result)
    .map((fixture) => fixture.result!.winnerTeamId);

  if (semifinalWinners.length !== 2) {
    throw new Error('Cannot create playoff final before both semifinals are complete.');
  }

  return {
    id: `s${bracket.seasonYear}-playoff-final`,
    seasonYear: bracket.seasonYear,
    type: 'playoff',
    playoffRound: 'final',
    day,
    matchday: day,
    homeTeamId: semifinalWinners[0],
    awayTeamId: semifinalWinners[1]
  };
}
