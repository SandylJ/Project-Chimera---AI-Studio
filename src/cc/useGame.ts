import { useEffect, useRef, useState, useCallback } from 'react';
import { ClassId, EquipSlot, GameState, Hero, Rarity } from './types';
import { CLASSES } from './data/classes';
import { ABILITIES } from './data/abilities';
import { DUNGEON_DEFS } from './data/dungeons';
import { ITEMS } from './data/items';
import { randomNameFor } from './data/names';
import { tickGame } from './engine/tick';
import {
  mkId, pushLog, recomputeHeroMaxHPMP, effectiveStats, canEquip,
} from './engine/util';
import { generateDungeon } from './engine/dungeonGen';
import { resolveDecision as engineResolveDecision } from './engine/decisions';
import { addToStash, removeFromStash, sellValue } from './engine/loot';
import { simulateOffline } from './engine/offline';

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
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== STATE_VERSION) return null;
    return parsed;
  } catch {
    return null;
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
      recomputeHeroMaxHPMP(hero);
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
      recomputeHeroMaxHPMP(hero);
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

  const useConsumable = useCallback((heroId: string, itemId: string) => {
    mutate(s => {
      const h = s.heroes.find(x => x.id === heroId);
      const it = ITEMS[itemId];
      if (!h || !it) return;
      if ((s.stash.items[itemId] ?? 0) < 1) return;
      if (it.healOnUse) h.hp = Math.min(h.maxHp, h.hp + it.healOnUse);
      if (it.manaOnUse) h.mp = Math.min(h.maxMp, h.mp + it.manaOnUse);
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

  return {
    state,
    enterDungeon,
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
  };
}
