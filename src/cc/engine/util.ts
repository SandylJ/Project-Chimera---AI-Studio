import { Hero, Stats, StatKey, Item, Monster, GameState, LogEntry, Rarity } from '../types';
import { ITEMS } from '../data/items';
import { CLASSES } from '../data/classes';

// ============ IDs / RNG ============

let _idCounter = 0;
export function mkId(prefix = 'id'): string {
  _idCounter++;
  return `${prefix}_${Date.now().toString(36)}_${_idCounter.toString(36)}`;
}

export function rngInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function rngChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rollChance(chance: number): boolean {
  return Math.random() < chance;
}

// ============ Stats / Effective Stats ============

const EMPTY_STATS: Stats = { str: 0, dex: 0, int: 0, con: 0, spd: 0, luck: 0 };

export function addStats(a: Partial<Stats>, b: Partial<Stats>): Stats {
  return {
    str: (a.str ?? 0) + (b.str ?? 0),
    dex: (a.dex ?? 0) + (b.dex ?? 0),
    int: (a.int ?? 0) + (b.int ?? 0),
    con: (a.con ?? 0) + (b.con ?? 0),
    spd: (a.spd ?? 0) + (b.spd ?? 0),
    luck: (a.luck ?? 0) + (b.luck ?? 0),
  };
}

export function effectiveStats(hero: Hero): Stats {
  let total: Stats = { ...hero.baseStats };
  for (const slot of Object.keys(hero.equipment) as Array<keyof typeof hero.equipment>) {
    const itemId = hero.equipment[slot];
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (!item?.stats) continue;
    total = addStats(total, item.stats);
  }
  // apply active stat buffs
  for (const buff of hero.buffs) {
    if (buff.stat) {
      const base = total[buff.stat];
      total[buff.stat] = Math.floor(base * (1 + buff.power));
    }
  }
  return total;
}

export function totalArmor(hero: Hero): number {
  let armor = 0;
  for (const slot of Object.keys(hero.equipment) as Array<keyof typeof hero.equipment>) {
    const itemId = hero.equipment[slot];
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (item?.armor) armor += item.armor;
  }
  return armor;
}

export function weaponPower(hero: Hero): number {
  const w = hero.equipment.weapon;
  if (!w) return 0;
  return ITEMS[w]?.weaponPower ?? 0;
}

export function heroAttackIntervalMs(hero: Hero): number {
  const stats = effectiveStats(hero);
  const spd = Math.max(1, stats.spd);
  // base 2000ms at spd 5 → 400ms per spd point reduction, floor at 600
  return Math.max(600, 2600 - spd * 90);
}

export function monsterAttackIntervalMs(m: Monster): number {
  return Math.max(400, m.speed);
}

// ============ HP / MP ============

export function maxHpFor(classId: Hero['classId'], level: number, conStat: number): number {
  const c = CLASSES[classId];
  return Math.floor(c.baseHP + (level - 1) * c.hpPerLevel + conStat * 2);
}

export function maxMpFor(classId: Hero['classId'], level: number, intStat: number): number {
  const c = CLASSES[classId];
  return Math.floor(c.baseMP + (level - 1) * c.mpPerLevel + intStat * 1.5);
}

export function recomputeHeroMaxHPMP(hero: Hero): void {
  const stats = effectiveStats(hero);
  const newMaxHp = maxHpFor(hero.classId, hero.level, stats.con);
  const newMaxMp = maxMpFor(hero.classId, hero.level, stats.int);
  // preserve ratio to avoid snapping
  const ratio = hero.maxHp > 0 ? hero.hp / hero.maxHp : 1;
  hero.maxHp = newMaxHp;
  hero.maxMp = newMaxMp;
  if (hero.state === 'alive') {
    hero.hp = Math.min(newMaxHp, Math.max(1, Math.floor(newMaxHp * ratio)));
  }
  if (hero.mp > newMaxMp) hero.mp = newMaxMp;
}

// ============ XP ============

export function xpForLevel(level: number): number {
  // OSRS-ish curve, but gentler. Total XP to reach (level+1) from level.
  return Math.floor(40 * Math.pow(level, 1.7) + 20 * level);
}

export function xpToNext(hero: Hero): number {
  return xpForLevel(hero.level);
}

// ============ Logging ============

export function pushLog(state: GameState, kind: LogEntry['kind'], text: string, rarity?: Rarity): void {
  const entry: LogEntry = {
    id: mkId('log'),
    t: Date.now(),
    kind,
    text,
    rarity,
  };
  state.currentLog.unshift(entry);
  if (state.currentLog.length > 200) state.currentLog.length = 200;
}

export function rarityColor(r: Rarity): string {
  switch (r) {
    case 'common': return '#E8E0D4';
    case 'uncommon': return '#7FE2A0';
    case 'rare': return '#6EA9E4';
    case 'epic': return '#C58BE8';
    case 'legendary': return '#F2B84B';
    case 'celestial': return '#FF6EE6';
  }
}

export function canEquip(hero: Hero, item: Item): { ok: boolean; reason?: string } {
  if (!item.slot) return { ok: false, reason: 'not equipment' };
  if (item.levelReq && hero.level < item.levelReq) return { ok: false, reason: `requires level ${item.levelReq}` };
  if (item.classReq && !item.classReq.includes(hero.classId)) {
    return { ok: false, reason: `class: ${item.classReq.join(', ')}` };
  }
  return { ok: true };
}

export function activeHeroes(state: GameState): Hero[] {
  return state.heroes.filter(h => !h.bench);
}

export function aliveActiveHeroes(state: GameState): Hero[] {
  return state.heroes.filter(h => !h.bench && h.state === 'alive');
}
