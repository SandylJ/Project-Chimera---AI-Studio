import { Hero, Stats, StatKey, Item, Monster, GameState, LogEntry, Rarity, BlessingId, EquipSlot } from '../types';
import { ITEMS } from '../data/items';
import { CLASSES } from '../data/classes';

// ============ Enchants / Blessings ============

// Per-tier multiplier for weapon/armor/stat values from item enchants.
const ENCHANT_MULT = 0.15; // +15% per tier
export const MAX_ENCHANT = 10;

export function enchantTier(hero: Hero, slot: EquipSlot): number {
  return hero.enchants?.[slot] ?? 0;
}

export function enchantMultiplier(tier: number): number {
  return 1 + tier * ENCHANT_MULT;
}

// Next-tier enchant cost: scales with tier and item value.
export function enchantCost(hero: Hero, slot: EquipSlot): { gold: number; materials: Array<{ id: string; qty: number }> } | null {
  const itemId = hero.equipment[slot];
  if (!itemId) return null;
  const tier = enchantTier(hero, slot);
  if (tier >= MAX_ENCHANT) return null;
  const item = ITEMS[itemId];
  if (!item) return null;
  const nextTier = tier + 1;
  const baseGold = Math.floor(item.value * 0.6 * Math.pow(1.8, nextTier));
  // Materials scale with item rarity and tier
  const materials = requiredMaterials(item.rarity, nextTier);
  return { gold: Math.max(20, baseGold), materials };
}

function requiredMaterials(rarity: Rarity, tier: number): Array<{ id: string; qty: number }> {
  const rarityRank = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'celestial'].indexOf(rarity);
  const list: Array<{ id: string; qty: number }> = [];
  // Tier 1-3: slime gel / bone shard / goblin ear
  if (tier <= 3) {
    list.push({ id: 'slime_gel', qty: 2 + tier });
    list.push({ id: 'bone_shard', qty: 1 + tier });
  }
  // Tier 4-6: spider silk + ice shard
  if (tier >= 4 && tier <= 6) {
    list.push({ id: 'spider_silk', qty: tier - 2 });
    list.push({ id: 'bone_shard', qty: tier });
  }
  // Tier 7+: demon horn + dragon scale
  if (tier >= 7) {
    list.push({ id: 'demon_horn', qty: tier - 5 });
    if (tier >= 9) list.push({ id: 'dragon_scale', qty: tier - 7 });
    if (tier >= 10) list.push({ id: 'celestial_dust', qty: 1 });
  }
  // Higher-rarity items cost more of the same mats
  if (rarityRank >= 3) {
    for (const m of list) m.qty = Math.ceil(m.qty * 1.5);
  }
  return list;
}

// Apply enchant multiplier to a weapon's base power for an equipped hero.
export function enchantedWeaponPower(hero: Hero): number {
  const id = hero.equipment.weapon;
  if (!id) return 0;
  const base = ITEMS[id]?.weaponPower ?? 0;
  return Math.floor(base * enchantMultiplier(enchantTier(hero, 'weapon')));
}

// Apply enchant multiplier to each equipped armor slot.
export function enchantedArmor(hero: Hero): number {
  let arm = 0;
  for (const slot of Object.keys(hero.equipment) as Array<keyof typeof hero.equipment>) {
    const id = hero.equipment[slot];
    if (!id) continue;
    const item = ITEMS[id];
    if (!item?.armor) continue;
    arm += Math.floor(item.armor * enchantMultiplier(enchantTier(hero, slot as EquipSlot)));
  }
  return arm;
}

// ============ Blessings ============

export function blessingLevel(state: GameState, id: BlessingId): number {
  return state.blessings?.[id] ?? 0;
}

// Cost to buy the next level of a blessing.
export function blessingCost(level: number): number {
  return Math.floor(5 + Math.pow(level + 1, 1.9) * 4);
}

// Blessing effect multipliers (consumed by engine).
export function blessingBonus(state: GameState | undefined, id: BlessingId): number {
  if (!state) return 0;
  const lvl = blessingLevel(state, id);
  // Each level = +3% for combat ones, +4% for gold/xp, +2% luck/vigor cap
  switch (id) {
    case 'might': return lvl * 0.03;
    case 'warding': return lvl * 0.03;
    case 'fortune': return lvl * 0.04;
    case 'wisdom': return lvl * 0.04;
    case 'luck': return lvl * 0.02;
    case 'vigor': return lvl * 0.025;
  }
}

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
  return enchantedArmor(hero);
}

export function weaponPower(hero: Hero): number {
  return enchantedWeaponPower(hero);
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

export function recomputeHeroMaxHPMP(hero: Hero, state?: GameState): void {
  const stats = effectiveStats(hero);
  const vigor = blessingBonus(state, 'vigor');
  const newMaxHp = Math.floor(maxHpFor(hero.classId, hero.level, stats.con) * (1 + vigor));
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
