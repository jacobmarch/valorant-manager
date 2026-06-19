import type { Fixture, MatchResult, PlayerMatchStat, Team } from '../types/models';
import { createSeededRng } from './rng';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function teamRating(team: Team): number {
  const playerRatings = team.players.map(({ attributes }) => {
    const skill = attributes.aim * 0.28 + attributes.gameSense * 0.22 + attributes.utility * 0.18 + attributes.clutch * 0.14 + attributes.communication * 0.1 + attributes.consistency * 0.08;
    const moraleBoost = (attributes.morale - 70) * 0.08;
    const fatiguePenalty = attributes.fatigue * 0.12;
    return skill + moraleBoost - fatiguePenalty;
  });

  return playerRatings.reduce((total, rating) => total + rating, 0) / playerRatings.length;
}

function createBoxScore(team: Team, roundsWon: number, roundsLost: number, won: boolean, seed: string): PlayerMatchStat[] {
  const rng = createSeededRng(seed);
  const totalRounds = roundsWon + roundsLost;

  return team.players.map((player) => {
    const rating =
      player.attributes.aim * 0.36 +
      player.attributes.gameSense * 0.18 +
      player.attributes.clutch * 0.16 +
      player.attributes.utility * 0.12 +
      player.attributes.consistency * 0.1 +
      player.attributes.communication * 0.08;

    // Model performance as per-round rates so kills scale with match length.
    // Skill shifts the rate, the winning side frags a little more, and a wide
    // random swing keeps a roster from clustering around the same number.
    const skillFactor = (rating - 55) * 0.006;
    const killSwing = (rng.next() - 0.5) * 0.36;
    const killsPerRound = 0.62 + skillFactor + (won ? 0.08 : 0) + killSwing;
    const kills = clamp(Math.round(killsPerRound * totalRounds), 5, 33);

    const consistencyFactor = (60 - player.attributes.consistency) * 0.002;
    const deathSwing = (rng.next() - 0.5) * 0.2;
    const deathsPerRound = 0.72 + (won ? -0.07 : 0.05) + consistencyFactor + deathSwing;
    const deaths = clamp(Math.round(deathsPerRound * totalRounds), 5, 28);

    const assists = clamp(Math.round(roundsWon * 0.4 + player.attributes.utility / 20 + rng.next() * 4), 1, 18);
    const acs = clamp(Math.round(kills * 10 + assists * 3 - deaths * 2 + (won ? 18 : 0)), 90, 420);

    return {
      playerId: player.id,
      teamId: team.id,
      kills,
      deaths,
      assists,
      acs
    };
  });
}

export function simulateMatch(fixture: Fixture, teams: Team[], seed = fixture.id): MatchResult {
  const homeTeam = teams.find((team) => team.id === fixture.homeTeamId);
  const awayTeam = teams.find((team) => team.id === fixture.awayTeamId);

  if (!homeTeam || !awayTeam) {
    throw new Error(`Cannot simulate fixture ${fixture.id}: team not found.`);
  }

  const rng = createSeededRng(seed);
  const homeRating = teamRating(homeTeam);
  const awayRating = teamRating(awayTeam);
  let homeRounds = 0;
  let awayRounds = 0;

  // First to 13 wins. If the score reaches 12-12 the match goes to overtime,
  // which must be won by two rounds (e.g. 14-12, 16-14) — never 13-12.
  const isDecided = () =>
    (homeRounds >= 13 || awayRounds >= 13) && Math.abs(homeRounds - awayRounds) >= 2;

  while (!isDecided()) {
    const fatigueSwing = (rng.next() - 0.5) * 12;
    const clutchBoost = Math.max(homeRounds, awayRounds) >= 10 ? 3 : 0;
    const homeWinChance = clamp(0.5 + (homeRating - awayRating + fatigueSwing + clutchBoost) / 100, 0.18, 0.82);

    if (rng.next() <= homeWinChance) {
      homeRounds += 1;
    } else {
      awayRounds += 1;
    }
  }

  const winnerTeamId = homeRounds > awayRounds ? homeTeam.id : awayTeam.id;
  const winnerName = winnerTeamId === homeTeam.id ? homeTeam.name : awayTeam.name;
  const homeWon = winnerTeamId === homeTeam.id;

  return {
    id: `result-${fixture.id}`,
    fixtureId: fixture.id,
    seasonYear: fixture.seasonYear,
    fixtureType: fixture.type,
    playoffRound: fixture.playoffRound,
    day: fixture.day,
    matchday: fixture.matchday,
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeRounds,
    awayRounds,
    winnerTeamId,
    boxScore: [
      ...createBoxScore(homeTeam, homeRounds, awayRounds, homeWon, `${seed}-home`),
      ...createBoxScore(awayTeam, awayRounds, homeRounds, !homeWon, `${seed}-away`)
    ],
    summary: `${homeTeam.name} ${homeRounds}-${awayRounds} ${awayTeam.name}. ${winnerName} wins.`
  };
}
