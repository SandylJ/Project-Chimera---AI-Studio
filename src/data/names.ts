// Randomized hero names by class flavor.

export const KNIGHT_NAMES = ['Sir Aldric', 'Dame Ysolde', 'Sir Gareth', 'Dame Mira', 'Sir Cedric', 'Dame Thalia', 'Sir Roderic'];
export const PRIEST_NAMES = ['Brother Thom', 'Sister Mae', 'Father Kellan', 'Mother Vessa', 'Cleric Orin', 'Oracle Sera'];
export const MAGE_NAMES = ['Zephyra', 'Vex', 'Eldrin', 'Myrrha', 'Caelen', 'Nix', 'Isolde'];
export const ROGUE_NAMES = ['Jax', 'Lira', 'Quin', 'Shiv', 'Ash', 'Raven', 'Kite'];
export const RANGER_NAMES = ['Tallis', 'Wren', 'Kael', 'Sable', 'Bram', 'Fenn'];
export const BARBARIAN_NAMES = ['Thrall', 'Gormak', 'Urza', 'Kaga', 'Brakk', 'Vrok'];

import type { ClassId } from '../types';

const MAP: Record<ClassId, string[]> = {
  knight: KNIGHT_NAMES,
  priest: PRIEST_NAMES,
  mage: MAGE_NAMES,
  rogue: ROGUE_NAMES,
  ranger: RANGER_NAMES,
  barbarian: BARBARIAN_NAMES,
};

export function randomNameFor(classId: ClassId, avoid: Set<string> = new Set()): string {
  const pool = MAP[classId];
  for (let i = 0; i < 10; i++) {
    const n = pool[Math.floor(Math.random() * pool.length)];
    if (!avoid.has(n)) return n;
  }
  return pool[Math.floor(Math.random() * pool.length)] + ' ' + Math.floor(Math.random() * 99);
}
