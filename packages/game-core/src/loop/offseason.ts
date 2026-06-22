import type { Player, PlayerAttributes, Team } from '../types/models';
import { createSeededRng, type Rng } from '../sim/rng';

// The skill attributes that develop and decline with age. Morale, fatigue and
// potential are intentionally excluded: the first two are seasonal condition,
// and potential is the ceiling a prospect develops toward.
const SKILL_KEYS: Array<keyof PlayerAttributes> = ['aim', 'gameSense', 'utility', 'clutch', 'communication', 'consistency'];

const SKILL_MIN = 30;
const SKILL_MAX = 99;

// Career arc. Players grow until their peak, plateau briefly, then decline by an
// amount that grows every year toward retirement.
const PEAK_AGE = 24; // skills develop up to (and including) this age
const DECLINE_START_AGE = 27; // skills start eroding the year after the plateau
const RETIREMENT_AGE = 30; // retirement first becomes possible
const FORCED_RETIREMENT_AGE = 39; // by here a player is certain to hang it up

// Prospects who replace retirees enter their careers young.
const PROSPECT_MIN_AGE = 17;
const PROSPECT_MAX_AGE = 20;

const prospectHandles = [
  'Nova', 'Echo', 'Volt', 'Frost', 'Ghost', 'Jet', 'Sable', 'Onyx', 'Quartz', 'Lynx',
  'Ember', 'Cobalt', 'Hawk', 'Riven', 'Surge', 'Talon', 'Vex', 'Wren', 'Zephyr', 'Apex'
];

const prospectNames = [
  'Kai Morgan', 'Jonas Reed', 'Theo Vance', 'Milo Hart', 'Asher Cole',
  'Felix Ward', 'Rhys Dalton', 'Ezra Lane', 'Cyrus Pope', 'Devon Hayes'
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng.next() * items.length)];
}

function randomInt(min: number, max: number, rng: Rng): number {
  return min + Math.floor(rng.next() * (max - min + 1));
}

// Chance a player retires this off-season. Zero until RETIREMENT_AGE, then
// climbs every year and reaches certainty by FORCED_RETIREMENT_AGE.
export function retirementChance(age: number): number {
  if (age < RETIREMENT_AGE) return 0;
  if (age >= FORCED_RETIREMENT_AGE) return 1;
  return clamp((age - RETIREMENT_AGE + 1) * 0.12, 0, 1);
}

// Age a single skill value by one off-season. Young players develop toward their
// potential; past their peak they decline by an amount that grows with age, so
// the drop-off accelerates the closer they get to retirement.
function ageSkill(value: number, age: number, potential: number, rng: Rng): number {
  if (age <= PEAK_AGE) {
    const headroom = Math.max(0, potential - value);
    if (headroom <= 0) return value;
    const gain = (rng.next() < potential / 130 ? 2 : 1);
    return clamp(value + Math.min(gain, headroom), SKILL_MIN, SKILL_MAX);
  }

  if (age < DECLINE_START_AGE) return value; // brief plateau between peak and decline

  const yearsDeclining = age - DECLINE_START_AGE + 1;
  const decline = yearsDeclining * 0.7 + rng.next() * 1.5;
  return clamp(value - Math.round(decline), SKILL_MIN, SKILL_MAX);
}

function progressPlayer(player: Player, rng: Rng): Player {
  const age = player.age + 1;
  const attributes: PlayerAttributes = { ...player.attributes };
  for (const key of SKILL_KEYS) {
    attributes[key] = ageSkill(attributes[key], age, attributes.potential, rng);
  }
  return { ...player, age, attributes };
}

function createProspect(previous: Player, seasonYear: number, rng: Rng): Player {
  const base = randomInt(52, 70, rng);
  const skill = () => clamp(base + randomInt(-8, 10, rng), SKILL_MIN, 82);

  return {
    id: `${previous.teamId}-p${seasonYear}-${Math.floor(rng.next() * 1e9).toString(36)}`,
    teamId: previous.teamId,
    name: pick(prospectNames, rng),
    handle: pick(prospectHandles, rng),
    role: previous.role,
    age: randomInt(PROSPECT_MIN_AGE, PROSPECT_MAX_AGE, rng),
    attributes: {
      aim: skill(),
      gameSense: skill(),
      utility: skill(),
      clutch: skill(),
      communication: skill(),
      consistency: skill(),
      potential: clamp(base + randomInt(12, 30, rng), SKILL_MIN, 95),
      morale: 70,
      fatigue: 8
    }
  };
}

function ageTeam(team: Team, seasonYear: number, rng: Rng): Team {
  return {
    ...team,
    players: team.players.map((player) => {
      const aged = progressPlayer(player, rng);
      return rng.next() < retirementChance(aged.age) ? createProspect(player, seasonYear, rng) : aged;
    })
  };
}

// Run the off-season for every team: each surviving player ages a year and has
// their skills developed or declined accordingly, and any player who retires is
// replaced by a fresh young prospect in the same role.
export function runOffseason(teams: Team[], seasonYear: number, seed: string): Team[] {
  const rng = createSeededRng(seed);
  return teams.map((team) => ageTeam(team, seasonYear, rng));
}
