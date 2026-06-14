import { createPlayer, type Player } from "../models/player";
import { createSeededRng, type Rng } from "../sim/rng";

const FIRST_NAMES = [
  "Alex",
  "Mika",
  "Noah",
  "Kai",
  "Leo",
  "Rin",
  "Sam",
  "Ilya",
  "Tae",
  "Arda",
  "Mateo",
  "Yuki"
];

const HANDLES = [
  "Vandal",
  "Flash",
  "Anchor",
  "Clutch",
  "Dash",
  "Smoke",
  "Recon",
  "Phantom",
  "Pixel",
  "Tempo",
  "Orbit",
  "Crosshair"
];

export function generatePlayer(index: number, rng: Rng, prefix = ""): Player {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const handle = HANDLES[Math.floor(rng() * HANDLES.length)];
  const tag = prefix ? `${prefix} ` : "";
  return createPlayer(`${tag}${first} "${handle}"`, rng);
}

export function generateRoster(prefix: string, seed: number, size = 6): Player[] {
  const rng = createSeededRng(seed);
  return Array.from({ length: size }, (_, index) => generatePlayer(index, rng, prefix));
}

export function generateFreeAgents(seed: number, size = 24): Player[] {
  const rng = createSeededRng(seed);
  return Array.from({ length: size }, (_, index) => generatePlayer(index, rng, "FA"));
}
