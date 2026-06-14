import { GAME_CONFIG } from "../config";
import { createFixture, createStandings } from "../models/league";
import type { Player } from "../models/player";
import { createTeam, type Team } from "../models/team";
import { type GameState } from "../models/game-state";
import { generateFreeAgents, generateRoster } from "./players";

const TEAM_DATA = [
  ["Sentinels", "SEN", "Americas"],
  ["Cloud9", "C9", "Americas"],
  ["100 Thieves", "100T", "Americas"],
  ["NRG", "NRG", "Americas"],
  ["Fnatic", "FNC", "EMEA"],
  ["Team Liquid", "TL", "EMEA"],
  ["Paper Rex", "PRX", "Pacific"],
  ["DRX", "DRX", "Pacific"],
  ["EDward Gaming", "EDG", "China"],
  ["Bilibili Gaming", "BLG", "China"]
] as const;

export function createNewGame(teamName = "Valorant FC", seed = 2026): GameState {
  const teams: Team[] = [];
  const players: Player[] = [];

  TEAM_DATA.forEach(([name, shortName, region], index) => {
    const isUserTeam = index === 0;
    const roster = generateRoster(shortName, seed + index * 137, 6);
    players.push(...roster);
    teams.push(
      createTeam(
        isUserTeam ? teamName : name,
        isUserTeam ? "VM" : shortName,
        region,
        roster,
        isUserTeam ? "You" : "AI Coach",
        isUserTeam ? GAME_CONFIG.startingBudget : 450_000
      )
    );
  });

  return {
    calendar: { week: 1, day: "Monday" },
    userTeamId: teams[0].id,
    teams,
    players,
    freeAgents: generateFreeAgents(seed + 9000, 24),
    fixtures: generateRoundRobinFixtures(teams),
    standings: createStandings(teams.map((team) => team.id)),
    matchHistory: [],
    news: [
      {
        title: "Preseason begins",
        description: "Your roster reports for the first week of training."
      }
    ]
  };
}

export function generateRoundRobinFixtures(teams: Team[]) {
  const fixtures = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      fixtures.push(createFixture(fixtures.length + 1, teams[i].id, teams[j].id));
    }
  }
  return fixtures;
}
