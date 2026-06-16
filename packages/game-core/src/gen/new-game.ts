import type { GameState, TeamId } from '../types/models';
import { createSampleTeams } from '../data/sample-league';
import { getStandings } from '../loop/selectors';
import { createDoubleRoundRobinSchedule } from './schedule';

interface NewGameOptions {
  managerName?: string;
  userTeamId?: TeamId;
}

export function createNewGame(options: NewGameOptions = {}): GameState {
  const teams = createSampleTeams();
  const selectedTeamId = options.userTeamId && teams.some((team) => team.id === options.userTeamId) ? options.userTeamId : teams[0].id;

  return {
    version: 2,
    createdAt: new Date().toISOString(),
    managerName: options.managerName?.trim() || 'Manager',
    seasonYear: 1,
    seasonPhase: 'regularSeason',
    currentDay: 1,
    userTeamId: selectedTeamId,
    teams,
    schedule: createDoubleRoundRobinSchedule(teams, 1),
    matchHistory: [],
    standings: getStandings(teams, []),
    seasonHistory: []
  };
}
