import type { Player, PlayerRole, Team } from '../types/models';

const roles: PlayerRole[] = ['duelist', 'initiator', 'controller', 'sentinel', 'flex'];

const teamSeeds = [
  { id: 'team-neon-foxes', city: 'Seattle', name: 'Neon Foxes', shortName: 'NFX', colors: ['#38bdf8', '#f472b6'], handles: ['Spark', 'Vector', 'Mist', 'Anchor', 'Pulse'] },
  { id: 'team-ascent-kings', city: 'Austin', name: 'Ascent Kings', shortName: 'ASK', colors: ['#f97316', '#fde68a'], handles: ['Crown', 'Rook', 'Blaze', 'Latch', 'Scope'] },
  { id: 'team-lotus-guard', city: 'Chicago', name: 'Lotus Guard', shortName: 'LTG', colors: ['#22c55e', '#a7f3d0'], handles: ['Bloom', 'Thorn', 'Moss', 'Glade', 'Stone'] },
  { id: 'team-haven-harbor', city: 'Boston', name: 'Haven Harbor', shortName: 'HVH', colors: ['#60a5fa', '#c4b5fd'], handles: ['Dock', 'Buoy', 'Signal', 'Tide', 'Beacon'] },
  { id: 'team-bind-bandits', city: 'Phoenix', name: 'Bind Bandits', shortName: 'BND', colors: ['#ef4444', '#fed7aa'], handles: ['Quickdraw', 'Fuse', 'Dust', 'Rift', 'Ace'] },
  { id: 'team-split-shadows', city: 'New York', name: 'Split Shadows', shortName: 'SPS', colors: ['#8b5cf6', '#111827'], handles: ['Shade', 'Vanish', 'Cipher', 'Raven', 'Wraith'] },
  { id: 'team-pearl-pioneers', city: 'Miami', name: 'Pearl Pioneers', shortName: 'PRL', colors: ['#14b8a6', '#f0fdfa'], handles: ['Coral', 'Drift', 'Wave', 'Keel', 'Reef'] },
  { id: 'team-sunset-ronin', city: 'Los Angeles', name: 'Sunset Ronin', shortName: 'SSR', colors: ['#fb7185', '#7c2d12'], handles: ['Katana', 'Tempo', 'Flash', 'Zen', 'Koi'] }
] as const;

const baseNames = ['Mason Lee', 'Noah Carter', 'Eli Brooks', 'Owen Price', 'Leo Stone'];

function attribute(seed: number, offset: number): number {
  return Math.max(45, Math.min(92, 58 + ((seed * 13 + offset * 7) % 34)));
}

function createPlayer(teamId: string, teamIndex: number, playerIndex: number, handle: string): Player {
  const seed = teamIndex * 11 + playerIndex * 5;
  return {
    id: `${teamId}-player-${playerIndex + 1}`,
    teamId,
    name: baseNames[(teamIndex + playerIndex) % baseNames.length],
    handle,
    role: roles[playerIndex],
    age: 18 + ((teamIndex + playerIndex) % 9),
    attributes: {
      aim: attribute(seed, 1),
      gameSense: attribute(seed, 2),
      utility: attribute(seed, 3),
      clutch: attribute(seed, 4),
      communication: attribute(seed, 5),
      consistency: attribute(seed, 6),
      potential: attribute(seed, 7),
      morale: 70,
      fatigue: 8
    }
  };
}

export function createSampleTeams(): Team[] {
  return teamSeeds.map((team, teamIndex) => ({
    id: team.id,
    city: team.city,
    name: team.name,
    shortName: team.shortName,
    colors: {
      primary: team.colors[0],
      secondary: team.colors[1]
    },
    players: team.handles.map((handle, playerIndex) => createPlayer(team.id, teamIndex, playerIndex, handle))
  }));
}
