import type { Player, PlayerRole, Team } from '../types/models';
import { createSeededRng, type Rng } from '../sim/rng';

const roles: PlayerRole[] = ['duelist', 'initiator', 'controller', 'sentinel', 'flex'];

// VCT Americas — the current 12-team partner league. Only the team identities are
// real; every player (handle, real name, attributes, age) is generated per save.
// Future regions (EMEA, Pacific, China) can be added as additional leagues.
const teamSeeds = [
  { id: 'team-100-thieves', name: '100 Thieves', shortName: '100T', colors: ['#e2231a', '#000000'] },
  { id: 'team-cloud9', name: 'Cloud9', shortName: 'C9', colors: ['#00aeef', '#ffffff'] },
  { id: 'team-evil-geniuses', name: 'Evil Geniuses', shortName: 'EG', colors: ['#003da5', '#ffd200'] },
  { id: 'team-envy', name: 'Envy', shortName: 'NV', colors: ['#0ea5e9', '#111111'] },
  { id: 'team-furia', name: 'FURIA', shortName: 'FUR', colors: ['#000000', '#f4d03f'] },
  { id: 'team-g2-esports', name: 'G2 Esports', shortName: 'G2', colors: ['#1f2937', '#f43f5e'] },
  { id: 'team-kru-esports', name: 'KRÜ Esports', shortName: 'KRÜ', colors: ['#1e293b', '#22d3ee'] },
  { id: 'team-leviatan', name: 'Leviatán', shortName: 'LEV', colors: ['#111827', '#fbbf24'] },
  { id: 'team-loud', name: 'LOUD', shortName: 'LOUD', colors: ['#16a34a', '#000000'] },
  { id: 'team-mibr', name: 'MIBR', shortName: 'MIBR', colors: ['#facc15', '#111111'] },
  { id: 'team-nrg', name: 'NRG', shortName: 'NRG', colors: ['#111111', '#dc2626'] },
  { id: 'team-sentinels', name: 'Sentinels', shortName: 'SEN', colors: ['#e4002b', '#000000'] }
] as const;

const firstNames = [
  'Mason', 'Noah', 'Eli', 'Owen', 'Leo', 'Kai', 'Jonas', 'Theo', 'Milo', 'Asher',
  'Felix', 'Rhys', 'Ezra', 'Cyrus', 'Devon', 'Luca', 'Ivan', 'Arlo', 'Reid', 'Soren'
];
const lastNames = [
  'Lee', 'Carter', 'Brooks', 'Price', 'Stone', 'Morgan', 'Reed', 'Vance', 'Hart', 'Cole',
  'Ward', 'Dalton', 'Lane', 'Pope', 'Hayes', 'Quinn', 'Foster', 'Mercer', 'Nash', 'Cross'
];

// Gamer-tag building blocks; combined into a handle so every save gets fresh,
// varied player handles rather than a fixed list.
const handlePrefixes = [
  'Nova', 'Echo', 'Volt', 'Frost', 'Ghost', 'Jet', 'Sable', 'Onyx', 'Quartz', 'Lynx',
  'Ember', 'Cobalt', 'Hawk', 'Riven', 'Surge', 'Talon', 'Vex', 'Wren', 'Zephyr', 'Apex',
  'Drift', 'Pulse', 'Razor', 'Crux', 'Halo', 'Nyx', 'Rune', 'Sol', 'Tide', 'Zen'
];
const handleSuffixes = ['', '', '', 'x', 'z', 'fps', 'ttv', '7', '9', '0'];

function randomInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng.next() * (max - min + 1));
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng.next() * items.length)];
}

// Generate a handle that hasn't been used yet this league, so no two players
// share a tag. Falls back to a numeric suffix if the base is already taken.
function uniqueHandle(used: Set<string>, rng: Rng): string {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const handle = `${pick(handlePrefixes, rng)}${pick(handleSuffixes, rng)}`;
    if (!used.has(handle)) {
      used.add(handle);
      return handle;
    }
  }
  let handle = `${pick(handlePrefixes, rng)}${randomInt(10, 999, rng)}`;
  while (used.has(handle)) {
    handle = `${pick(handlePrefixes, rng)}${randomInt(10, 999, rng)}`;
  }
  used.add(handle);
  return handle;
}

// Build one player around a randomly chosen core rating so teams vary in
// strength each save: skill attributes scatter around that core, and potential
// sits above the player's current ability.
function createPlayer(teamId: string, playerIndex: number, handle: string, rng: Rng): Player {
  const core = randomInt(52, 84, rng);
  const skill = () => Math.max(45, Math.min(92, core + randomInt(-9, 9, rng)));

  return {
    id: `${teamId}-player-${playerIndex + 1}`,
    teamId,
    name: `${pick(firstNames, rng)} ${pick(lastNames, rng)}`,
    handle,
    role: roles[playerIndex],
    // Capped below the retirement age so the opening roster survives its first
    // off-season intact (retirement only kicks in from 30).
    age: randomInt(18, 28, rng),
    attributes: {
      aim: skill(),
      gameSense: skill(),
      utility: skill(),
      clutch: skill(),
      communication: skill(),
      consistency: skill(),
      potential: Math.min(95, core + randomInt(6, 26, rng)),
      morale: 70,
      fatigue: 8
    }
  };
}

// `seed` makes generation deterministic for tests; callers that want a fresh
// roster every save (the default) pass a random seed.
export function createSampleTeams(seed: string = `${Date.now()}-${Math.random()}`): Team[] {
  const rng = createSeededRng(seed);
  const usedHandles = new Set<string>();

  return teamSeeds.map((team) => ({
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    region: 'Americas',
    colors: {
      primary: team.colors[0],
      secondary: team.colors[1]
    },
    players: roles.map((_, playerIndex) => createPlayer(team.id, playerIndex, uniqueHandle(usedHandles, rng), rng))
  }));
}
