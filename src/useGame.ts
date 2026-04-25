import { useEffect, useRef, useState, useCallback } from 'react';
import { BlessingId, Bounty, BountyBoard, BountyKind, ClassId, EquipSlot, GameState, Hero, Rarity, ShopRotation, StatKey } from './types';
import { CLASSES } from './data/classes';
import { ABILITIES } from './data/abilities';
import { DUNGEON_DEFS } from './data/dungeons';
import { ITEMS } from './data/items';
import { randomNameFor, randomWorkerName } from './data/names';
import { tickGame } from './engine/tick';
import {
  mkId, pushLog, recomputeHeroMaxHPMP, effectiveStats, canEquip,
  enchantCost, enchantTier, blessingLevel, blessingCost, MAX_ENCHANT,
} from './engine/util';
import { applyDamageToMonster } from './engine/combat';
import { generateDungeon } from './engine/dungeonGen';
import { resolveDecision as engineResolveDecision } from './engine/decisions';
import { addToStash, removeFromStash, sellValue } from './engine/loot';
import { simulateOffline } from './engine/offline';
import { workerHireCost } from './engine/skilling';

const SAVE_KEY = 'cc_save_v1';
const TICK_MS = 100;
const SAVE_MS = 5000;
const STATE_VERSION = 1;

function createHero(classId: ClassId, usedNames: Set<string>): Hero {
  const c = CLASSES[classId];
  const stats = { ...c.baseStats };
  const hero: Hero = {
    id: mkId('h'),
    classId,
    name: randomNameFor(classId, usedNames),
    level: 1,
    xp: 0,
    hp: c.baseHP,
    maxHp: c.baseHP,
    mp: c.baseMP,
    maxMp: c.baseMP,
    baseStats: stats,
    equipment: {},
    enchants: {},
    abilities: [...c.startingAbilities],
    cooldowns: {},
    attackTimer: 1000,
    state: 'alive',
    bench: false,
    abilityPoints: 0,
    shield: 0,
    buffs: [],
  };
  recomputeHeroMaxHPMP(hero);
  hero.hp = hero.maxHp;
  hero.mp = hero.maxMp;
  return hero;
}

function createInitialState(): GameState {
  const used = new Set<string>();
  const knight = createHero('knight', used); used.add(knight.name);
  const priest = createHero('priest', used); used.add(priest.name);
  // Give them starter weapons
  knight.equipment.weapon = 'rusty_sword';
  priest.equipment.weapon = 'oak_staff';

  const state: GameState = {
    version: STATE_VERSION,
    heroes: [knight, priest],
    stash: { items: {}, gold: 100, essence: 0, bountyMarks: 0 },
    currentLog: [],
    unlockedDungeons: ['sewer_warrens'],
    unlockedClasses: ['knight', 'priest'],
    speed: 1,
    paused: false,
    lastTick: Date.now(),
    totalPlaytime: 0,
    dungeonsCompleted: {},
    totalMonstersKilled: 0,
    totalGoldEarned: 0,
    achievements: [],
    autoSellRarities: [],
    collectionLog: [],
    tutorialStep: 0,
    killCombo: 0,
    lastKillAt: 0,
    bestKillCombo: 0,
    blessings: {},
    shopRotation: rollShopRotation(dayIndex()),
    bountyBoard: rollBountyBoard(dayIndex(), 0, 0),
    town: {
      workers: [
        { id: 'w1', name: 'Peasant Jon' },
        { id: 'w2', name: 'Miller Sam' },
        { id: 'w3', name: 'Smithy Dan' },
      ],
    },
    skills: {},
  };
  // starter consumables
  state.stash.items['healing_potion'] = 3;
  state.stash.items['mana_potion'] = 2;

  pushLog(state, 'system', '✨ A new party gathers at the tavern. Their legend begins.');
  return state;
}

function loadFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.version !== STATE_VERSION) return null;
    return migrate(parsed);
  } catch (e) {
    console.error('Failed to load save, starting fresh:', e);
    return null;
  }
}

// Fill in any fields missing from older save shapes so we never crash on
// `undefined.toLocaleString()` etc. Non-destructive.
function migrate(s: Partial<GameState>): GameState {
  const filled: GameState = {
    version: STATE_VERSION,
    heroes: (s.heroes ?? []).map(migrateHero),
    stash: {
      items: s.stash?.items ?? {},
      gold: s.stash?.gold ?? 0,
      essence: s.stash?.essence ?? 0,
      bountyMarks: s.stash?.bountyMarks ?? 0,
    },
    activeDungeon: s.activeDungeon,
    currentLog: s.currentLog ?? [],
    unlockedDungeons: s.unlockedDungeons?.length ? s.unlockedDungeons : ['sewer_warrens'],
    unlockedClasses: s.unlockedClasses?.length ? s.unlockedClasses : ['knight', 'priest'],
    activeDecision: s.activeDecision,
    speed: (s.speed === 1 || s.speed === 2 || s.speed === 4) ? s.speed : 1,
    paused: s.paused ?? false,
    lastTick: s.lastTick ?? Date.now(),
    totalPlaytime: s.totalPlaytime ?? 0,
    dungeonsCompleted: s.dungeonsCompleted ?? {},
    totalMonstersKilled: s.totalMonstersKilled ?? 0,
    totalGoldEarned: s.totalGoldEarned ?? 0,
    achievements: s.achievements ?? [],
    autoSellRarities: s.autoSellRarities ?? [],
    collectionLog: s.collectionLog ?? [],
    pendingOfflineReport: s.pendingOfflineReport,
    tutorialStep: s.tutorialStep ?? 0,
    killCombo: s.killCombo ?? 0,
    lastKillAt: s.lastKillAt ?? 0,
    bestKillCombo: s.bestKillCombo ?? 0,
    blessings: s.blessings ?? {},
    shopRotation: s.shopRotation && s.shopRotation.day === dayIndex()
      ? s.shopRotation
      : rollShopRotation(dayIndex()),
    bountyBoard: s.bountyBoard && s.bountyBoard.day === dayIndex()
      ? s.bountyBoard
      : rollBountyBoard(
          dayIndex(),
          s.totalMonstersKilled ?? 0,
          s.totalGoldEarned ?? 0,
        ),
    town: s.town ?? {
      workers: [
        { id: 'w1', name: 'Peasant Jon' },
        { id: 'w2', name: 'Miller Sam' },
        { id: 'w3', name: 'Smithy Dan' },
      ],
    },
    skills: s.skills ?? {},
  };
  // Validate activeDungeon shape — if it's malformed, drop it to send the
  // player back to the town picker rather than crashing BattleView.
  if (filled.activeDungeon) {
    const d = filled.activeDungeon;
    if (!Array.isArray(d.tiles) || d.tiles.length === 0 || !d.partyPos || !d.path) {
      console.warn('Save had malformed activeDungeon, dropping it.');
      filled.activeDungeon = undefined;
    }
  }
  return filled;
}

function migrateHero(h: Partial<Hero> & { id: string }): Hero {
  return {
    id: h.id,
    classId: h.classId ?? 'knight',
    name: h.name ?? 'Unknown',
    level: h.level ?? 1,
    xp: h.xp ?? 0,
    hp: h.hp ?? 1,
    maxHp: h.maxHp ?? 1,
    mp: h.mp ?? 0,
    maxMp: h.maxMp ?? 0,
    baseStats: h.baseStats ?? { str: 1, dex: 1, int: 1, con: 1, spd: 1, luck: 1 },
    equipment: h.equipment ?? {},
    enchants: h.enchants ?? {},
    abilities: h.abilities ?? [],
    cooldowns: h.cooldowns ?? {},
    attackTimer: h.attackTimer ?? 1000,
    state: h.state ?? 'alive',
    bench: h.bench ?? false,
    abilityPoints: h.abilityPoints ?? 0,
    shield: h.shield ?? 0,
    buffs: h.buffs ?? [],
  };
}

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

// Deterministic rotation from a day seed so "today's shop" is stable.
function rollShopRotation(day: number): ShopRotation {
  const rng = mulberry32(day ^ 0x9E37);
  const allEquip = Object.values(ITEMS).filter(i => i.slot && !i.classReq);
  const scrolls = [
    'scroll_town_portal', 'scroll_identify', 'scroll_xp', 'scroll_bless', 'scroll_haste',
    'scroll_fireball', 'scroll_bone_heal', 'scroll_soul_barrier', 'scroll_astral',
    // Thieving-produced loot containers use the same single-click-to-use mechanic
    'jewel_case', 'thieves_cache', 'stolen_scroll',
  ];
  const pool = [...allEquip].sort((a, b) => a.value - b.value);
  // Three tiers of featured gear — pull from a shared pool so ids are unique.
  const used = new Set<string>();
  const pick = (tier: 'low' | 'mid' | 'high'): string[] => {
    const slice = (tier === 'low' ? pool.slice(0, 12)
                : tier === 'mid' ? pool.slice(6, 22)
                : pool.slice(18)).filter(i => !used.has(i.id));
    const out: string[] = [];
    for (let i = 0; i < 4 && slice.length; i++) {
      const idx = Math.floor(rng() * slice.length);
      const chosen = slice[idx];
      out.push(chosen.id);
      used.add(chosen.id);
      slice.splice(idx, 1);
    }
    return out;
  };
  return {
    day,
    featured: [...pick('low'), ...pick('mid'), ...pick('high')],
    scrolls,
    bundles: [
      { id: 'bundle_heal_small', label: 'Healer Pouch', items: [['healing_potion', 5], ['mana_potion', 3]], price: 180 },
      { id: 'bundle_heal_big',   label: 'Crusader Pack', items: [['greater_healing_potion', 4], ['mana_potion', 4], ['scroll_town_portal', 1]], price: 500 },
      { id: 'bundle_explore',    label: 'Dungeoneer Kit', items: [['scroll_identify', 3], ['scroll_xp', 1], ['healing_potion', 4]], price: 700 },
    ],
  };
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rollBountyBoard(day: number, killsSoFar: number, goldSoFar: number): BountyBoard {
  const rng = mulberry32((day ^ 0xB000) >>> 0);
  const kindPool: BountyKind[] = ['kill_count', 'earn_gold', 'find_items', 'best_combo'];
  const used = new Set<BountyKind>();
  const bounties: Bounty[] = [];
  const dungeonIds = Object.keys(DUNGEON_DEFS);
  for (let i = 0; i < 3; i++) {
    // 25% chance of clear_dungeon bounty for slot 0; else pick unique kind
    let kind: BountyKind;
    if (i === 0 && rng() < 0.5) {
      kind = 'clear_dungeon';
    } else {
      const pool = kindPool.filter(k => !used.has(k));
      kind = pool[Math.floor(rng() * pool.length)];
      used.add(kind);
    }
    bounties.push(makeBounty(kind, rng, dungeonIds));
  }
  return {
    day,
    bounties,
    snapshot: {
      totalMonstersKilled: killsSoFar,
      totalGoldEarned: goldSoFar,
      itemsCollected: 0,
      dungeonsCleared: {},
      bestKillCombo: 0,
    },
    dungeonClearCount: {},
    itemsCollected: 0,
  };
}

function makeBounty(kind: BountyKind, rng: () => number, dungeonIds: string[]): Bounty {
  switch (kind) {
    case 'kill_count': {
      const target = 30 + Math.floor(rng() * 50);
      return {
        id: `b_kill_${target}`, kind, target,
        label: `⚔ Slay ${target} foes`,
        description: `Defeat any ${target} monsters today.`,
        claimed: false,
        reward: { gold: target * 6 + 100 },
      };
    }
    case 'earn_gold': {
      const target = 500 + Math.floor(rng() * 1500);
      return {
        id: `b_gold_${target}`, kind, target,
        label: `🪙 Earn ${target} gold`,
        description: `Earn ${target} gold from loot today.`,
        claimed: false,
        reward: { essence: 5 + Math.floor(target / 400) },
      };
    }
    case 'find_items': {
      const target = 10 + Math.floor(rng() * 20);
      return {
        id: `b_items_${target}`, kind, target,
        label: `📦 Loot ${target} items`,
        description: `Collect ${target} items from drops today.`,
        claimed: false,
        reward: { itemId: 'scroll_identify', itemQty: 2 },
      };
    }
    case 'best_combo': {
      const target = 5 + Math.floor(rng() * 10);
      return {
        id: `b_combo_${target}`, kind, target,
        label: `🔥 Reach ×${target} combo`,
        description: `Kill ${target} monsters within the combo window.`,
        claimed: false,
        reward: { itemId: 'scroll_haste', itemQty: 1, gold: 200 },
      };
    }
    case 'clear_dungeon': {
      const dungeonId = dungeonIds[Math.floor(rng() * Math.min(3, dungeonIds.length))];
      return {
        id: `b_clear_${dungeonId}`, kind, target: 1, dungeonId,
        label: `🏆 Clear a dungeon`,
        description: `Complete any floor of a dungeon today.`,
        claimed: false,
        reward: { essence: 15, gold: 500 },
      };
    }
  }
}

// Current progress for a bounty, given the live state.
export function bountyProgress(state: GameState, b: Bounty): number {
  const board = state.bountyBoard;
  if (!board) return 0;
  switch (b.kind) {
    case 'kill_count': return Math.max(0, state.totalMonstersKilled - board.snapshot.totalMonstersKilled);
    case 'earn_gold':  return Math.max(0, state.totalGoldEarned - board.snapshot.totalGoldEarned);
    case 'find_items': return board.itemsCollected;
    case 'best_combo': return state.bestKillCombo;
    case 'clear_dungeon':
      return Object.values(board.dungeonClearCount).reduce((a, v) => a + v, 0);
  }
}

function saveToStorage(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...state, lastTick: Date.now() }));
  } catch {}
}

export function useCcGame() {
  const [state, setState] = useState<GameState>(() => {
    const saved = loadFromStorage();
    if (saved) {
      // offline progress
      const away = Date.now() - (saved.lastTick ?? Date.now());
      const report = simulateOffline(saved, away);
      if (report) saved.pendingOfflineReport = report;
      saved.lastTick = Date.now();
      return saved;
    }
    return createInitialState();
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Tick loop
  useEffect(() => {
    let lastTs = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = now - lastTs;
      lastTs = now;
      const s = stateRef.current;
      // Mutate then shallow-copy at top to trigger React update.
      tickGame(s, dt);
      setState({ ...s });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // Periodic save
  useEffect(() => {
    const id = window.setInterval(() => {
      saveToStorage(stateRef.current);
    }, SAVE_MS);
    return () => window.clearInterval(id);
  }, []);

  // Save on unload
  useEffect(() => {
    const onBeforeUnload = () => saveToStorage(stateRef.current);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  // ============ actions ============

  const mutate = useCallback((fn: (s: GameState) => void) => {
    const s = stateRef.current;
    fn(s);
    setState({ ...s });
  }, []);

  const enterDungeon = useCallback((defId: string) => {
    mutate(s => {
      if (s.activeDungeon) return;
      const def = DUNGEON_DEFS[defId];
      if (!def) return;
      if (!s.unlockedDungeons.includes(defId)) return;
      const floor = (s.dungeonsCompleted[defId] ?? 0) + 1;
      s.activeDungeon = generateDungeon(def, floor);
      pushLog(s, 'system', `⚔ Entering ${def.name} — floor ${floor}`);
    });
  }, [mutate]);

  // Spend shortcut_tokens (Agility-skill output) to skip the next floor of
  // a dungeon you've already entered. Cost scales with floor number; the
  // gate is an Agility-level requirement keyed off the dungeon's tier so
  // you can't buy your way past content you can't survive.
  const skipDungeonFloor = useCallback((defId: string) => {
    mutate(s => {
      const def = DUNGEON_DEFS[defId];
      if (!def) return;
      if (!s.unlockedDungeons.includes(defId)) {
        pushLog(s, 'system', '❌ Dungeon not unlocked yet.');
        return;
      }
      if (s.activeDungeon) {
        pushLog(s, 'system', '❌ Already in a dungeon — retreat first.');
        return;
      }
      const cleared = s.dungeonsCompleted[defId] ?? 0;
      if (cleared < 1) {
        pushLog(s, 'system', '❌ Clear floor 1 the old-fashioned way before using shortcuts.');
        return;
      }
      const floorBeingSkipped = cleared + 1;
      // Agility gate: half the dungeon's minLevel (e.g. min lvl 30 dungeon
      // needs Agility 15 to use shortcuts).
      const agilityReq = Math.max(1, Math.floor(def.minLevel / 2));
      const agilityLvl = s.skills.agility?.level ?? 1;
      if (agilityLvl < agilityReq) {
        pushLog(s, 'system', `❌ Need Agility ${agilityReq} to take this shortcut (have ${agilityLvl}).`);
        return;
      }
      const tokenCost = Math.max(1, Math.floor(floorBeingSkipped / 2));
      if ((s.stash.items['shortcut_token'] ?? 0) < tokenCost) {
        pushLog(s, 'system', `❌ Need ${tokenCost}× Shortcut Token (have ${s.stash.items['shortcut_token'] ?? 0}).`);
        return;
      }
      removeFromStash(s, 'shortcut_token', tokenCost);
      s.dungeonsCompleted[defId] = floorBeingSkipped;
      // Skip is pure progression — no GP / XP / loot. The reward is access
      // to the next floor without a fight.
      pushLog(s, 'victory', `🏃 Shortcut! Skipped ${def.name} floor ${floorBeingSkipped} (-${tokenCost} tokens)`, 'rare');
    });
  }, [mutate]);

  const retreatToTown = useCallback(() => {
    mutate(s => {
      if (!s.activeDungeon) return;
      s.activeDungeon = undefined;
      pushLog(s, 'retreat', '🚪 Party returns to town.');
    });
  }, [mutate]);

  const equipItem = useCallback((heroId: string, itemId: string) => {
    mutate(s => {
      const hero = s.heroes.find(h => h.id === heroId);
      const item = ITEMS[itemId];
      if (!hero || !item || !item.slot) return;
      const check = canEquip(hero, item);
      if (!check.ok) {
        pushLog(s, 'system', `❌ Cannot equip ${item.name}: ${check.reason}`);
        return;
      }
      if ((s.stash.items[itemId] ?? 0) < 1) return;
      // swap with currently equipped
      const prev = hero.equipment[item.slot];
      if (prev) {
        s.stash.items[prev] = (s.stash.items[prev] ?? 0) + 1;
      }
      removeFromStash(s, itemId, 1);
      hero.equipment[item.slot] = itemId;
      // Enchants are tied to the specific equipped item — reset on swap.
      if (hero.enchants) delete hero.enchants[item.slot];
      recomputeHeroMaxHPMP(hero, s);
    });
  }, [mutate]);

  const unequipItem = useCallback((heroId: string, slot: EquipSlot) => {
    mutate(s => {
      const hero = s.heroes.find(h => h.id === heroId);
      if (!hero) return;
      const itemId = hero.equipment[slot];
      if (!itemId) return;
      s.stash.items[itemId] = (s.stash.items[itemId] ?? 0) + 1;
      delete hero.equipment[slot];
      if (hero.enchants) delete hero.enchants[slot];
      recomputeHeroMaxHPMP(hero, s);
    });
  }, [mutate]);

  const sellItem = useCallback((itemId: string, qty: number) => {
    mutate(s => {
      const have = s.stash.items[itemId] ?? 0;
      const actual = Math.min(qty, have);
      if (actual <= 0) return;
      const gold = sellValue(itemId, actual);
      removeFromStash(s, itemId, actual);
      s.stash.gold += gold;
      s.totalGoldEarned += gold;
      pushLog(s, 'loot', `🪙 Sold ${actual}× ${ITEMS[itemId]?.name} for ${gold} gp.`);
    });
  }, [mutate]);

  // Table of buffs granted by specific potions. Keeps the stat buff
  // system orthogonal to item definitions — potions can still carry
  // `healOnUse` / `manaOnUse` for immediate numbers, and drop an entry
  // here for the lingering stat boost.
  const POTION_BUFFS: Record<string, { buffs: Array<{ stat: StatKey; power: number }>; duration: number; selfDamage?: number }> = {
    attack_potion:   { buffs: [{ stat: 'str', power: 0.15 }], duration: 45000 },
    defense_potion:  { buffs: [{ stat: 'con', power: 0.15 }], duration: 45000 },
    strength_potion: { buffs: [{ stat: 'str', power: 0.25 }], duration: 45000 },
    magic_potion:    { buffs: [{ stat: 'int', power: 0.25 }], duration: 45000 },
    ranging_potion:  { buffs: [{ stat: 'dex', power: 0.25 }], duration: 45000 },
    super_attack:    { buffs: [{ stat: 'str', power: 0.40 }], duration: 60000 },
    super_defense:   { buffs: [{ stat: 'con', power: 0.40 }], duration: 60000 },
    super_strength:  { buffs: [{ stat: 'str', power: 0.45 }], duration: 60000 },
    super_magic:     { buffs: [{ stat: 'int', power: 0.45 }], duration: 60000 },
    super_ranging:   { buffs: [{ stat: 'dex', power: 0.45 }], duration: 60000 },
    stamina_potion:  { buffs: [{ stat: 'spd', power: 0.30 }], duration: 60000 },
    agility_potion:  { buffs: [{ stat: 'spd', power: 0.30 }, { stat: 'dex', power: 0.30 }], duration: 60000 },
    weapon_poison:   { buffs: [{ stat: 'luck', power: 0.25 }], duration: 60000 },
    divine_potion:   { buffs: [{ stat: 'str', power: 0.5 }, { stat: 'dex', power: 0.5 }, { stat: 'int', power: 0.5 }, { stat: 'con', power: 0.5 }, { stat: 'spd', power: 0.5 }, { stat: 'luck', power: 0.5 }], duration: 180000 },
    overload_potion: { buffs: [{ stat: 'str', power: 0.5 }, { stat: 'dex', power: 0.5 }, { stat: 'int', power: 0.5 }, { stat: 'con', power: 0.5 }, { stat: 'spd', power: 0.5 }, { stat: 'luck', power: 0.5 }], duration: 90000, selfDamage: 50 },
  };

  // Apply every available buff potion in stash to every alive active
  // hero — pre-dungeon prep button. Each potion id is consumed once per
  // hero (so a stack of 4 attack potions buffs 4 heroes), capped at the
  // size of the active alive party. No mana/HP regen is rolled in;
  // that's still up to quickHealParty / quickHealHero.
  const useAllBuffs = useCallback(() => {
    mutate(s => {
      const heroes = s.heroes.filter(h => !h.bench && h.state === 'alive');
      if (heroes.length === 0) {
        pushLog(s, 'system', 'No active heroes to buff.');
        return;
      }
      let applied = 0;
      for (const id of Object.keys(POTION_BUFFS)) {
        const buffDef = POTION_BUFFS[id];
        for (const h of heroes) {
          if ((s.stash.items[id] ?? 0) < 1) break;
          for (const b of buffDef.buffs) {
            h.buffs.push({ id: mkId('buff'), stat: b.stat, power: b.power, remaining: buffDef.duration });
          }
          if (buffDef.selfDamage) h.hp = Math.max(1, h.hp - buffDef.selfDamage);
          removeFromStash(s, id, 1);
          applied++;
        }
      }
      if (applied > 0) pushLog(s, 'heal', `🧪 Pre-buff applied ${applied} potion${applied === 1 ? '' : 's'}.`, 'rare');
      else pushLog(s, 'system', 'No buff potions in stash.');
    });
  }, [mutate]);

  const useConsumable = useCallback((heroId: string, itemId: string) => {
    mutate(s => {
      const h = s.heroes.find(x => x.id === heroId);
      const it = ITEMS[itemId];
      if (!h || !it) return;
      if ((s.stash.items[itemId] ?? 0) < 1) return;
      if (it.healOnUse) h.hp = Math.min(h.maxHp, h.hp + it.healOnUse);
      if (it.manaOnUse) h.mp = Math.min(h.maxMp, h.mp + it.manaOnUse);
      const buffDef = POTION_BUFFS[itemId];
      if (buffDef) {
        for (const b of buffDef.buffs) {
          h.buffs.push({ id: mkId('buff'), stat: b.stat, power: b.power, remaining: buffDef.duration });
        }
        if (buffDef.selfDamage) {
          h.hp = Math.max(1, h.hp - buffDef.selfDamage);
        }
      }
      removeFromStash(s, itemId, 1);
      pushLog(s, 'heal', `${h.name} uses ${it.name}.`);
    });
  }, [mutate]);

  const recruitHero = useCallback((classId: ClassId) => {
    mutate(s => {
      const c = CLASSES[classId];
      if (!c) return;
      if (s.stash.gold < c.recruitCost) {
        pushLog(s, 'system', `❌ Need ${c.recruitCost} gp to recruit a ${c.name}.`);
        return;
      }
      s.stash.gold -= c.recruitCost;
      const used = new Set(s.heroes.map(h => h.name));
      const hero = createHero(classId, used);
      // bench if active roster is full
      const activeCount = s.heroes.filter(h => !h.bench).length;
      if (activeCount >= 4) hero.bench = true;
      s.heroes.push(hero);
      if (!s.unlockedClasses.includes(classId)) s.unlockedClasses.push(classId);
      pushLog(s, 'system', `🎉 ${hero.name} the ${c.name} joins the party!`);
    });
  }, [mutate]);

  const toggleBench = useCallback((heroId: string) => {
    mutate(s => {
      const h = s.heroes.find(x => x.id === heroId);
      if (!h) return;
      const activeCount = s.heroes.filter(x => !x.bench).length;
      if (h.bench && activeCount >= 4) {
        pushLog(s, 'system', `❌ Active party is full (max 4).`);
        return;
      }
      h.bench = !h.bench;
    });
  }, [mutate]);

  const reviveHero = useCallback((heroId: string) => {
    mutate(s => {
      const h = s.heroes.find(x => x.id === heroId);
      if (!h) return;
      const cost = 100 + h.level * 20;
      if (s.stash.gold < cost) {
        pushLog(s, 'system', `❌ Need ${cost} gp to revive.`);
        return;
      }
      s.stash.gold -= cost;
      h.state = 'alive';
      h.hp = h.maxHp;
      h.mp = h.maxMp;
      pushLog(s, 'heal', `✨ ${h.name} revived at the temple!`);
    });
  }, [mutate]);

  const healParty = useCallback(() => {
    mutate(s => {
      const cost = s.heroes.filter(h => !h.bench).reduce((a, h) => a + Math.floor((h.maxHp - h.hp) * 0.5 + (h.maxMp - h.mp) * 0.3), 0);
      if (cost === 0) return;
      if (s.stash.gold < cost) {
        pushLog(s, 'system', `❌ Need ${cost} gp to rest at the inn.`);
        return;
      }
      s.stash.gold -= cost;
      for (const h of s.heroes) {
        if (h.bench || h.state !== 'alive') continue;
        h.hp = h.maxHp;
        h.mp = h.maxMp;
      }
      pushLog(s, 'heal', `🛌 Party rests at the inn. (-${cost} gp)`);
    });
  }, [mutate]);

  const buyAbility = useCallback((heroId: string, abilityId: string) => {
    mutate(s => {
      const h = s.heroes.find(x => x.id === heroId);
      const ab = ABILITIES[abilityId];
      if (!h || !ab) return;
      if (ab.classId !== h.classId) return;
      if (h.level < ab.levelReq) return;
      if (h.abilities.includes(abilityId)) return;
      if (h.abilityPoints < 1) return;
      h.abilityPoints--;
      h.abilities.push(abilityId);
      pushLog(s, 'level', `⭐ ${h.name} learned ${ab.name}!`);
    });
  }, [mutate]);

  const buyShopItem = useCallback((itemId: string) => {
    mutate(s => {
      const it = ITEMS[itemId];
      if (!it) return;
      if (s.stash.gold < it.value) {
        pushLog(s, 'system', `❌ Not enough gold.`);
        return;
      }
      s.stash.gold -= it.value;
      addToStash(s, itemId, 1);
      pushLog(s, 'loot', `🛒 Bought ${it.name}.`);
    });
  }, [mutate]);

  const resolveDecision = useCallback((optionId: string) => {
    mutate(s => {
      engineResolveDecision(s, optionId);
    });
  }, [mutate]);

  const setSpeed = useCallback((speed: 1 | 2 | 4) => {
    mutate(s => { s.speed = speed; });
  }, [mutate]);

  const togglePause = useCallback(() => {
    mutate(s => { s.paused = !s.paused; });
  }, [mutate]);

  const setAutoSell = useCallback((rarity: Rarity, on: boolean) => {
    mutate(s => {
      s.autoSellRarities = on
        ? Array.from(new Set([...s.autoSellRarities, rarity]))
        : s.autoSellRarities.filter(r => r !== rarity);
    });
  }, [mutate]);

  const dismissOfflineReport = useCallback(() => {
    mutate(s => { s.pendingOfflineReport = undefined; });
  }, [mutate]);

  const resetGame = useCallback(() => {
    if (!confirm('Reset everything? This deletes your save.')) return;
    localStorage.removeItem(SAVE_KEY);
    setState(createInitialState());
  }, []);

  const advanceTutorial = useCallback(() => {
    mutate(s => { s.tutorialStep = s.tutorialStep + 1; });
  }, [mutate]);

  // Auto-equip the best item from stash into each active hero's empty or
  // clearly-inferior slots. Non-destructive — returns swapped items to stash.
  const autoEquipBest = useCallback(() => {
    mutate(s => {
      const active = s.heroes.filter(h => !h.bench);
      let equipped = 0;
      const slots: EquipSlot[] = ['weapon', 'offhand', 'head', 'body', 'legs', 'feet', 'neck', 'ring'];
      for (const h of active) {
        for (const slot of slots) {
          // Find the best available item for this slot
          let bestId: string | undefined;
          let bestScore = -1;
          for (const [id, qty] of Object.entries(s.stash.items)) {
            if (qty <= 0) continue;
            const it = ITEMS[id];
            if (!it || it.slot !== slot) continue;
            if (it.classReq && !it.classReq.includes(h.classId)) continue;
            if (it.levelReq && h.level < it.levelReq) continue;
            const stats = it.stats ?? {};
            const statSum = (stats.str ?? 0) + (stats.dex ?? 0) + (stats.int ?? 0) + (stats.con ?? 0) + (stats.spd ?? 0) + (stats.luck ?? 0);
            const score = (it.weaponPower ?? 0) + (it.armor ?? 0) + statSum * 1.2;
            if (score > bestScore) {
              bestScore = score;
              bestId = id;
            }
          }
          if (!bestId) continue;
          // Compare with currently-equipped
          const curId = h.equipment[slot];
          if (curId) {
            const cur = ITEMS[curId];
            const curStats = cur?.stats ?? {};
            const curSum = (curStats.str ?? 0) + (curStats.dex ?? 0) + (curStats.int ?? 0) + (curStats.con ?? 0) + (curStats.spd ?? 0) + (curStats.luck ?? 0);
            const curScore = (cur?.weaponPower ?? 0) + (cur?.armor ?? 0) + curSum * 1.2;
            if (curScore >= bestScore) continue;
          }
          // Do the swap
          if (curId) {
            s.stash.items[curId] = (s.stash.items[curId] ?? 0) + 1;
          }
          s.stash.items[bestId] = (s.stash.items[bestId] ?? 0) - 1;
          if (s.stash.items[bestId] <= 0) delete s.stash.items[bestId];
          h.equipment[slot] = bestId;
          recomputeHeroMaxHPMP(h);
          equipped++;
        }
      }
      if (equipped > 0) pushLog(s, 'system', `🛡 Auto-equipped ${equipped} upgrade${equipped === 1 ? '' : 's'}.`);
      else pushLog(s, 'system', `🛡 No better gear available.`);
    });
  }, [mutate]);

  // Count equipped Graceful-set pieces on a hero. Each piece grants
  // 10% chance to skip food consumption (max 50% at full set), so a
  // well-trained Agility player wrings more healing out of the same
  // cooked shark stack.
  const gracefulPieces = (h: Hero): number => {
    const gracefulIds = new Set(['graceful_hood','graceful_top','graceful_legs','graceful_boots','graceful_cape']);
    let count = 0;
    for (const id of Object.values(h.equipment)) if (id && gracefulIds.has(id)) count++;
    return count;
  };

  // Use party's potions (and cooked food) to top off HP/MP. Healing pool is
  // now any stashed item with healOnUse > 0 — so cooked fish from the Cooking
  // skill feeds combat directly.
  const quickHealParty = useCallback(() => {
    mutate(s => {
      const active = s.heroes.filter(h => !h.bench && h.state === 'alive');
      let used = 0;
      let saved = 0;
      // Build heal pool: all stashed items with healOnUse, sorted biggest-first.
      const healPool = Object.keys(s.stash.items)
        .filter(id => (s.stash.items[id] ?? 0) > 0 && (ITEMS[id]?.healOnUse ?? 0) > 0)
        .sort((a, b) => (ITEMS[b].healOnUse ?? 0) - (ITEMS[a].healOnUse ?? 0));
      for (const h of active) {
        if (h.hp >= h.maxHp * 0.95) continue;
        const skipChance = Math.min(0.5, 0.1 * gracefulPieces(h));
        for (const pid of healPool) {
          if ((s.stash.items[pid] ?? 0) <= 0) continue;
          const pot = ITEMS[pid];
          if (!pot) continue;
          h.hp = Math.min(h.maxHp, h.hp + (pot.healOnUse ?? 0));
          if (pot.manaOnUse) h.mp = Math.min(h.maxMp, h.mp + pot.manaOnUse);
          // Graceful roll: on success, the food is not consumed.
          if (skipChance > 0 && Math.random() < skipChance) {
            saved++;
          } else {
            s.stash.items[pid] = (s.stash.items[pid] ?? 0) - 1;
            if (s.stash.items[pid] <= 0) delete s.stash.items[pid];
          }
          used++;
          if (h.hp >= h.maxHp * 0.95) break;
        }
      }
      // Mana potions on casters
      for (const h of active) {
        if (h.mp >= h.maxMp * 0.9) continue;
        while ((s.stash.items['mana_potion'] ?? 0) > 0 && h.mp < h.maxMp * 0.9) {
          const pot = ITEMS['mana_potion'];
          h.mp = Math.min(h.maxMp, h.mp + (pot.manaOnUse ?? 0));
          s.stash.items['mana_potion'] = (s.stash.items['mana_potion'] ?? 0) - 1;
          if (s.stash.items['mana_potion'] <= 0) delete s.stash.items['mana_potion'];
          used++;
        }
      }
      if (used > 0) {
        const savedMsg = saved > 0 ? ` — Graceful preserved ${saved}.` : '';
        pushLog(s, 'heal', `🧪 Used ${used} potion${used === 1 ? '' : 's'} across the party.${savedMsg}`);
      }
      else pushLog(s, 'system', `🧪 No potions needed or available.`);
    });
  }, [mutate]);

  // Auto-sell common/uncommon items in stash (fast "collect item sales" card)
  const sellJunk = useCallback(() => {
    mutate(s => {
      let gold = 0;
      let sold = 0;
      for (const [id, qty] of Object.entries(s.stash.items)) {
        const it = ITEMS[id];
        if (!it) continue;
        if (it.slot) continue; // don't sell equipment
        if (it.type === 'potion') continue; // don't sell potions
        if (it.rarity === 'common' || it.rarity === 'uncommon') {
          gold += Math.floor(it.value * qty * 0.5);
          sold += qty;
          delete s.stash.items[id];
        }
      }
      if (sold === 0) {
        pushLog(s, 'system', `No junk to sell.`);
        return;
      }
      s.stash.gold += gold;
      s.totalGoldEarned += gold;
      pushLog(s, 'loot', `💰 Sold ${sold} junk item${sold === 1 ? '' : 's'} for ${gold} gp.`);
    });
  }, [mutate]);

  // Upgrade the enchant on a hero's equipped slot. Costs gold + materials.
  const upgradeEquip = useCallback((heroId: string, slot: EquipSlot) => {
    mutate(s => {
      const hero = s.heroes.find(h => h.id === heroId);
      if (!hero) return;
      const cost = enchantCost(hero, slot);
      if (!cost) {
        pushLog(s, 'system', '❌ Nothing to upgrade in that slot.');
        return;
      }
      if (s.stash.gold < cost.gold) {
        pushLog(s, 'system', `❌ Need ${cost.gold}g for this enchant.`);
        return;
      }
      for (const m of cost.materials) {
        if ((s.stash.items[m.id] ?? 0) < m.qty) {
          pushLog(s, 'system', `❌ Need ${m.qty}× ${ITEMS[m.id]?.name ?? m.id}.`);
          return;
        }
      }
      s.stash.gold -= cost.gold;
      for (const m of cost.materials) {
        s.stash.items[m.id] = (s.stash.items[m.id] ?? 0) - m.qty;
        if (s.stash.items[m.id] <= 0) delete s.stash.items[m.id];
      }
      hero.enchants ||= {};
      const newTier = enchantTier(hero, slot) + 1;
      hero.enchants[slot] = newTier;
      recomputeHeroMaxHPMP(hero, s);
      const itemName = ITEMS[hero.equipment[slot]!]?.name ?? 'gear';
      pushLog(s, 'loot', `🔨 ${hero.name}'s ${itemName} enchanted to +${newTier}!`, newTier >= 5 ? 'epic' : 'rare');
    });
  }, [mutate]);

  // Spend essence for a permanent party-wide blessing level.
  const buyBlessing = useCallback((id: BlessingId) => {
    mutate(s => {
      const lvl = blessingLevel(s, id);
      const cost = blessingCost(lvl);
      if (s.stash.essence < cost) {
        pushLog(s, 'system', `❌ Need ${cost}⟡ essence.`);
        return;
      }
      s.stash.essence -= cost;
      s.blessings ||= {};
      s.blessings[id] = lvl + 1;
      // vigor changes maxHp — recompute
      if (id === 'vigor') {
        for (const h of s.heroes) recomputeHeroMaxHPMP(h, s);
      }
      pushLog(s, 'victory', `✨ Shrine blessing: ${id} → Lv${lvl + 1}`, 'legendary');
    });
  }, [mutate]);

  // Consume a scroll. Effects depend on id.
  const useScroll = useCallback((itemId: string) => {
    mutate(s => {
      if ((s.stash.items[itemId] ?? 0) < 1) return;
      const it = ITEMS[itemId];
      if (!it) return;
      switch (itemId) {
        case 'scroll_town_portal': {
          if (!s.activeDungeon) {
            pushLog(s, 'system', 'Not in a dungeon.');
            return;
          }
          s.activeDungeon = undefined;
          for (const h of s.heroes) {
            if (h.state === 'alive') { h.hp = h.maxHp; h.mp = h.maxMp; }
          }
          pushLog(s, 'retreat', '🌀 Town Portal whisks the party home!', 'rare');
          break;
        }
        case 'scroll_identify': {
          if (!s.activeDungeon) { pushLog(s, 'system', 'Only in dungeons.'); return; }
          const d = s.activeDungeon;
          const hidden = d.tiles.filter(t => !t.revealed);
          let revealed = 0;
          for (let i = 0; i < 2 && hidden.length; i++) {
            const t = hidden.splice(Math.floor(Math.random() * hidden.length), 1)[0];
            t.revealed = true;
            revealed++;
          }
          pushLog(s, 'system', `📜 Scroll of Identify reveals ${revealed} tiles.`);
          break;
        }
        case 'scroll_xp': {
          const active = s.heroes.filter(h => !h.bench && h.state === 'alive');
          for (const h of active) { h.xp += 500; }
          pushLog(s, 'level', `📖 Insight grants +500 XP to each hero.`, 'rare');
          break;
        }
        case 'scroll_bless': {
          const active = s.heroes.filter(h => !h.bench && h.state === 'alive');
          for (const h of active) {
            for (const stat of ['str','dex','int','con','spd','luck'] as const) {
              h.buffs.push({ id: mkId('buff'), stat, power: 0.25, remaining: 60000 });
            }
          }
          pushLog(s, 'heal', '📃 Party blessed — +25% all stats 60s.', 'rare');
          break;
        }
        case 'scroll_haste': {
          const active = s.heroes.filter(h => !h.bench && h.state === 'alive');
          for (const h of active) {
            h.buffs.push({ id: mkId('buff'), stat: 'spd', power: 1.0, remaining: 45000 });
          }
          pushLog(s, 'heal', '⚡ Haste! Double speed 45s.', 'rare');
          break;
        }
        case 'scroll_fireball': {
          if (!s.activeDungeon) { pushLog(s, 'system', 'Only in dungeons.'); return; }
          // Damage every enemy in the current tile's encounter.
          const tile = s.activeDungeon.tiles.find(t => t.x === s.activeDungeon!.partyPos.x && t.y === s.activeDungeon!.partyPos.y);
          if (!tile?.encounter?.monsters.length) { pushLog(s, 'system', '🔥 No enemies to scorch.'); return; }
          for (const m of tile.encounter.monsters) {
            m.hp = Math.max(0, m.hp - 600);
          }
          pushLog(s, 'combat', '🔥 Fireball scroll scorches the room for 600 dmg!', 'rare');
          break;
        }
        case 'scroll_bone_heal': {
          // Revive one downed/dead hero to full.
          const target = s.heroes.find(h => !h.bench && (h.state === 'downed' || h.state === 'dead'));
          if (!target) { pushLog(s, 'system', 'No downed allies to mend.'); return; }
          target.state = 'alive';
          target.hp = target.maxHp;
          target.mp = target.maxMp;
          pushLog(s, 'heal', `🩸 Mending scroll revives ${target.name} to full!`, 'epic');
          break;
        }
        case 'scroll_soul_barrier': {
          const active = s.heroes.filter(h => !h.bench && h.state === 'alive');
          for (const h of active) { h.shield = (h.shield ?? 0) + 500; }
          pushLog(s, 'heal', '👻 Soul Barrier: party gains 500 shield.', 'epic');
          break;
        }
        case 'scroll_astral': {
          if (!s.activeDungeon) { pushLog(s, 'system', 'Only in dungeons.'); return; }
          for (const t of s.activeDungeon.tiles) t.revealed = true;
          pushLog(s, 'system', '✨ Astral scroll reveals the entire dungeon.', 'epic');
          break;
        }
        case 'jewel_case': {
          const gems = ['uncut_sapphire','uncut_emerald','uncut_ruby','uncut_diamond','uncut_dragonstone'];
          const pick = gems[Math.floor(Math.random() * gems.length)];
          s.stash.items[pick] = (s.stash.items[pick] ?? 0) + 1;
          pushLog(s, 'loot', `💎 Jewel case contained a ${ITEMS[pick]?.name}!`, 'rare');
          break;
        }
        case 'thieves_cache': {
          // Random spread of 2-4 thieving-themed goodies.
          const pool = ['silk_scraps','silk_fine','poison_vial_raw','gold_trinket','foraged_herb','stolen_key','jewel_case'];
          const count = 2 + Math.floor(Math.random() * 3);
          const picked: string[] = [];
          for (let i = 0; i < count; i++) {
            const id = pool[Math.floor(Math.random() * pool.length)];
            s.stash.items[id] = (s.stash.items[id] ?? 0) + 1;
            picked.push(ITEMS[id]?.name || id);
          }
          const bonusGold = 50 + Math.floor(Math.random() * 150);
          s.stash.gold += bonusGold;
          s.totalGoldEarned += bonusGold;
          pushLog(s, 'loot', `🎁 Cache yielded ${picked.join(', ')} and ${bonusGold}g.`, 'rare');
          break;
        }
        case 'stolen_scroll': {
          // Reroll as one of the real scrolls — playing dice with stolen ink.
          const realScrolls = ['scroll_town_portal','scroll_identify','scroll_xp','scroll_bless','scroll_haste'];
          const pick = realScrolls[Math.floor(Math.random() * realScrolls.length)];
          s.stash.items[pick] = (s.stash.items[pick] ?? 0) + 1;
          pushLog(s, 'loot', `📜 Stolen scroll turned out to be ${ITEMS[pick]?.name}.`, 'rare');
          break;
        }
        case 'tome_of_mastery': {
          // +500 XP across every town skill at once.
          const skillIds: Array<keyof typeof s.skills> = [
            'mining','woodcutting','smithing','crafting','herblore',
            'fishing','cooking','farming','runecrafting','thieving','agility',
          ];
          for (const id of skillIds) {
            if (!s.skills[id]) s.skills[id] = { level: 1, xp: 0 };
            s.skills[id]!.xp += 500;
          }
          pushLog(s, 'level', `📚 Tome of Mastery: +500 XP to every skill!`, 'epic');
          break;
        }
        default: break;
      }
      s.stash.items[itemId] = (s.stash.items[itemId] ?? 0) - 1;
      if (s.stash.items[itemId] <= 0) delete s.stash.items[itemId];
    });
  }, [mutate]);

  // Buy a shop bundle — spend gold, add bundled items.
  const buyShopBundle = useCallback((bundleId: string) => {
    mutate(s => {
      const rot = s.shopRotation;
      if (!rot) return;
      const b = rot.bundles.find(x => x.id === bundleId);
      if (!b) return;
      if (s.stash.gold < b.price) {
        pushLog(s, 'system', `❌ Need ${b.price}g for ${b.label}.`);
        return;
      }
      s.stash.gold -= b.price;
      for (const [id, qty] of b.items) addToStash(s, id, qty);
      pushLog(s, 'loot', `🛒 Bought ${b.label}.`, 'uncommon');
    });
  }, [mutate]);

  // Auto-spend ability points: for each hero with points, learn the
  // cheapest next ability they qualify for (lowest levelReq, not yet owned).
  const spendAllAP = useCallback(() => {
    mutate(s => {
      let learned = 0;
      for (const h of s.heroes) {
        while (h.abilityPoints > 0) {
          const tree = (ABILITIES ? Object.values(ABILITIES) : []).filter(a => a.classId === h.classId);
          const pool = tree
            .filter(a => !h.abilities.includes(a.id) && h.level >= a.levelReq)
            .sort((a, b) => a.levelReq - b.levelReq);
          if (pool.length === 0) break;
          h.abilityPoints--;
          h.abilities.push(pool[0].id);
          learned++;
          pushLog(s, 'level', `⭐ ${h.name} learned ${pool[0].name}!`);
        }
      }
      if (learned === 0) pushLog(s, 'system', 'No eligible abilities to learn.');
    });
  }, [mutate]);

  // Auto-enchant: pick the equipped slot with the cheapest next-tier cost
  // that we can afford, and enchant it. Great as a one-click sink.
  const autoEnchantCheapest = useCallback(() => {
    mutate(s => {
      const slots: EquipSlot[] = ['weapon', 'offhand', 'head', 'body', 'legs', 'feet', 'neck', 'ring'];
      type Option = { hero: Hero; slot: EquipSlot; gold: number };
      const options: Option[] = [];
      for (const h of s.heroes) {
        if (h.bench) continue;
        for (const slot of slots) {
          if (!h.equipment[slot]) continue;
          const cost = enchantCost(h, slot);
          if (!cost) continue;
          if (s.stash.gold < cost.gold) continue;
          if (!cost.materials.every(m => (s.stash.items[m.id] ?? 0) >= m.qty)) continue;
          options.push({ hero: h, slot, gold: cost.gold });
        }
      }
      if (options.length === 0) {
        pushLog(s, 'system', 'No affordable enchants right now.');
        return;
      }
      options.sort((a, b) => a.gold - b.gold);
      const best = options[0];
      const cost = enchantCost(best.hero, best.slot)!;
      s.stash.gold -= cost.gold;
      for (const m of cost.materials) {
        s.stash.items[m.id] = (s.stash.items[m.id] ?? 0) - m.qty;
        if (s.stash.items[m.id] <= 0) delete s.stash.items[m.id];
      }
      best.hero.enchants ||= {};
      const newTier = enchantTier(best.hero, best.slot) + 1;
      best.hero.enchants[best.slot] = newTier;
      recomputeHeroMaxHPMP(best.hero, s);
      const itemName = ITEMS[best.hero.equipment[best.slot]!]?.name ?? 'gear';
      pushLog(s, 'loot', `🔨 ${best.hero.name}'s ${itemName} enchanted to +${newTier}!`, newTier >= 5 ? 'epic' : 'rare');
    });
  }, [mutate]);

  // Heal one specific hero using the best available heal item (including
  // cooked food from the Cooking skill).
  const quickHealHero = useCallback((heroId: string) => {
    mutate(s => {
      const h = s.heroes.find(x => x.id === heroId);
      if (!h || h.state !== 'alive') return;
      if (h.hp >= h.maxHp) return;
      const healPool = Object.keys(s.stash.items)
        .filter(id => (s.stash.items[id] ?? 0) > 0 && (ITEMS[id]?.healOnUse ?? 0) > 0)
        .sort((a, b) => (ITEMS[b].healOnUse ?? 0) - (ITEMS[a].healOnUse ?? 0));
      for (const pid of healPool) {
        const pot = ITEMS[pid];
        if (!pot) continue;
        h.hp = Math.min(h.maxHp, h.hp + (pot.healOnUse ?? 0));
        if (pot.manaOnUse) h.mp = Math.min(h.maxMp, h.mp + pot.manaOnUse);
        s.stash.items[pid] = (s.stash.items[pid] ?? 0) - 1;
        if (s.stash.items[pid] <= 0) delete s.stash.items[pid];
        pushLog(s, 'heal', `🧪 ${h.name} consumes ${pot.name}.`);
        return;
      }
      pushLog(s, 'system', `No healing items available for ${h.name}.`);
    });
  }, [mutate]);

  // Claim a completed daily bounty
  const claimBounty = useCallback((bountyId: string) => {
    mutate(s => {
      const board = s.bountyBoard;
      if (!board) return;
      const b = board.bounties.find(x => x.id === bountyId);
      if (!b || b.claimed) return;
      const progress = bountyProgress(s, b);
      if (progress < b.target) {
        pushLog(s, 'system', '❌ Bounty not yet complete.');
        return;
      }
      b.claimed = true;
      if (b.reward.gold) {
        s.stash.gold += b.reward.gold;
        s.totalGoldEarned += b.reward.gold;
      }
      if (b.reward.essence) s.stash.essence += b.reward.essence;
      if (b.reward.itemId && b.reward.itemQty) addToStash(s, b.reward.itemId, b.reward.itemQty);
      pushLog(s, 'victory', `🎯 Bounty complete: ${b.label}!`, 'legendary');
    });
  }, [mutate]);

  // Click monster → bonus damage (classic CC2 interaction)
  const clickMonster = useCallback((monsterId: string) => {
    mutate(s => {
      const d = s.activeDungeon;
      if (!d) return;
      const tile = d.tiles.find(t => t.x === d.partyPos.x && t.y === d.partyPos.y);
      if (!tile?.encounter) return;
      const m = tile.encounter.monsters.find(x => x.id === monsterId);
      if (!m || m.hp <= 0) return;
      // Base click damage scales with total party STR/DEX/INT
      const active = s.heroes.filter(h => !h.bench && h.state === 'alive');
      if (active.length === 0) return;
      const totalPower = active.reduce((a, h) => {
        const st = effectiveStats(h);
        return a + Math.max(st.str, st.dex, st.int);
      }, 0);
      const base = 4 + Math.floor(totalPower * 0.08);
      // small crit chance
      const isCrit = Math.random() < 0.1;
      const dmg = isCrit ? base * 2 : base;
      applyDamageToMonster(s, m, dmg, 'YOU');
      if (isCrit) pushLog(s, 'combat', `🎯 Critical click! ${dmg} dmg`, 'rare');
    });
  }, [mutate]);

  // ========== Town skills ==========
  // repeatTimes: 0 / undefined = infinite. >0 = mass-craft N cycles.
  const setActiveTask = useCallback((skillId: string, actionId: string, duration: number, workerId?: string, repeatTimes?: number) => {
    mutate(s => {
      let worker = workerId
        ? s.town.workers.find(w => w.id === workerId)
        : s.town.workers.find(w => !w.activeTask);
      if (!worker) {
        pushLog(s, 'system', 'No available workers to assign task.');
        return;
      }
      worker.activeTask = {
        skillId: skillId as any,
        actionId,
        duration,
        progress: 0,
        ...(repeatTimes && repeatTimes > 0 ? { repeatRemaining: repeatTimes } : {}),
      };
    });
  }, [mutate]);

  const clearActiveTask = useCallback((workerId: string) => {
    mutate(s => {
      const w = s.town.workers.find(w => w.id === workerId);
      if (w) w.activeTask = undefined;
    });
  }, [mutate]);

  // Flip the auto-repeat flag on a worker's active task. With it ON, the
  // worker keeps the assignment when mats run out and resumes the moment
  // they reappear (e.g. from a Mining worker producing ore for Smithing).
  const toggleAutoRepeat = useCallback((workerId: string) => {
    mutate(s => {
      const w = s.town.workers.find(w => w.id === workerId);
      if (!w?.activeTask) return;
      w.activeTask.autoRepeat = !w.activeTask.autoRepeat;
      // Clear stall state so the UI flips back to "running" right away
      // when toggling on while mats are present.
      if (!w.activeTask.autoRepeat) w.activeTask.stalled = false;
    });
  }, [mutate]);

  const hireWorker = useCallback(() => {
    mutate(s => {
      const cost = workerHireCost(s.town.workers.length);
      if (s.stash.gold < cost) {
        pushLog(s, 'system', `Not enough gold to hire a worker (Need ${cost}g).`);
        return;
      }
      s.stash.gold -= cost;
      const taken = new Set(s.town.workers.map(w => w.name));
      const name = randomWorkerName(taken);
      s.town.workers.push({
        id: `w${Date.now()}_${Math.floor(Math.random() * 999)}`,
        name,
      });
      pushLog(s, 'system', `🎉 ${name} joins the town for ${cost}g!`);
    });
  }, [mutate]);

  return {
    state,
    enterDungeon,
    skipDungeonFloor,
    retreatToTown,
    equipItem,
    unequipItem,
    sellItem,
    useConsumable,
    recruitHero,
    toggleBench,
    reviveHero,
    healParty,
    buyAbility,
    buyShopItem,
    resolveDecision,
    setSpeed,
    togglePause,
    setAutoSell,
    dismissOfflineReport,
    resetGame,
    advanceTutorial,
    clickMonster,
    autoEquipBest,
    quickHealParty,
    sellJunk,
    upgradeEquip,
    buyBlessing,
    useScroll,
    buyShopBundle,
    claimBounty,
    spendAllAP,
    autoEnchantCheapest,
    quickHealHero,
    useAllBuffs,
    setActiveTask,
    clearActiveTask,
    toggleAutoRepeat,
    hireWorker,
  };
}
