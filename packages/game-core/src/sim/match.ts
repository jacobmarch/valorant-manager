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
  return team.players.map((player) => {
    const rating =
      player.attributes.aim * 0.36 +
      player.attributes.gameSense * 0.18 +
      player.attributes.clutch * 0.16 +
      player.attributes.utility * 0.12 +
      player.attributes.consistency * 0.1 +
      player.attributes.communication * 0.08;
    const variance = (rng.next() - 0.5) * 8;
    const kills = clamp(Math.round(roundsWon * 1.15 + roundsLost * 0.35 + rating / 12 + variance), 4, 32);
    const deaths = clamp(Math.round(roundsLost * 0.95 + roundsWon * 0.2 + (100 - player.attributes.consistency) / 15), 3, 28);
    const assists = clamp(Math.round(roundsWon * 0.45 + player.attributes.utility / 18 + rng.next() * 5), 1, 18);
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

  while (homeRounds < 13 && awayRounds < 13) {
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
