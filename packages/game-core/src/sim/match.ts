import type { Fixture, MapScore, MatchResult, PlayerMatchStat, Team } from '../types/models';
import { createSeededRng, type Rng } from './rng';

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

// Simulate a single map, round by round. First to 13 wins; reaching 12-12
// forces overtime that must be won by two rounds (e.g. 14-12) — never 13-12.
function simulateMap(homeRating: number, awayRating: number, rng: Rng): { homeRounds: number; awayRounds: number } {
  let homeRounds = 0;
  let awayRounds = 0;

  const isDecided = () => (homeRounds >= 13 || awayRounds >= 13) && Math.abs(homeRounds - awayRounds) >= 2;

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

  return { homeRounds, awayRounds };
}

// Aggregate the per-map box scores into one series box score: kills, deaths
// and assists are summed, ACS is a round-weighted average across maps.
function aggregateSeriesBoxScore(maps: MapScore[]): PlayerMatchStat[] {
  const totals = new Map<
    string,
    { teamId: string; kills: number; deaths: number; assists: number; acsWeighted: number; rounds: number }
  >();
  const order: string[] = [];

  for (const map of maps) {
    const mapRounds = map.homeRounds + map.awayRounds;
    for (const stat of map.boxScore) {
      let acc = totals.get(stat.playerId);
      if (!acc) {
        acc = { teamId: stat.teamId, kills: 0, deaths: 0, assists: 0, acsWeighted: 0, rounds: 0 };
        totals.set(stat.playerId, acc);
        order.push(stat.playerId);
      }
      acc.kills += stat.kills;
      acc.deaths += stat.deaths;
      acc.assists += stat.assists;
      acc.acsWeighted += stat.acs * mapRounds;
      acc.rounds += mapRounds;
    }
  }

  return order.map((playerId) => {
    const acc = totals.get(playerId)!;
    return {
      playerId,
      teamId: acc.teamId,
      kills: acc.kills,
      deaths: acc.deaths,
      assists: acc.assists,
      acs: acc.rounds > 0 ? Math.round(acc.acsWeighted / acc.rounds) : 0
    };
  });
}

// Maps needed to win the series: the playoff Grand Final is best-of-five
// (first to 3), every other match is best-of-three (first to 2).
function mapsToWin(fixture: Fixture): number {
  return fixture.type === 'playoff' && fixture.playoffRound === 'final' ? 3 : 2;
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
  const target = mapsToWin(fixture);

  const maps: MapScore[] = [];
  let homeMaps = 0;
  let awayMaps = 0;
  let homeRounds = 0;
  let awayRounds = 0;

  while (homeMaps < target && awayMaps < target) {
    const { homeRounds: mapHome, awayRounds: mapAway } = simulateMap(homeRating, awayRating, rng);
    const homeWonMap = mapHome > mapAway;
    const mapIndex = maps.length;

    maps.push({
      homeRounds: mapHome,
      awayRounds: mapAway,
      boxScore: [
        ...createBoxScore(homeTeam, mapHome, mapAway, homeWonMap, `${seed}-home-m${mapIndex}`),
        ...createBoxScore(awayTeam, mapAway, mapHome, !homeWonMap, `${seed}-away-m${mapIndex}`)
      ]
    });

    homeRounds += mapHome;
    awayRounds += mapAway;
    if (homeWonMap) {
      homeMaps += 1;
    } else {
      awayMaps += 1;
    }
  }

  const winnerTeamId = homeMaps > awayMaps ? homeTeam.id : awayTeam.id;
  const winnerName = winnerTeamId === homeTeam.id ? homeTeam.name : awayTeam.name;

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
    homeMaps,
    awayMaps,
    homeRounds,
    awayRounds,
    maps,
    winnerTeamId,
    boxScore: aggregateSeriesBoxScore(maps),
    summary: `${homeTeam.name} ${homeMaps}-${awayMaps} ${awayTeam.name}. ${winnerName} wins.`
  };
}
