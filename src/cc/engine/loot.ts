import { GameState, Monster, Rarity } from '../types';
import { MONSTERS } from '../data/monsters';
import { ITEMS, TIER_LOOT_POOLS } from '../data/items';
import { pushLog, rngInt, rngChoice, rollChance } from './util';

export function rollMonsterLoot(state: GameState, monster: Monster, luckBonus = 0): void {
  // GP
  const gold = rngInt(monster.goldReward[0], monster.goldReward[1]);
  state.stash.gold += gold;
  state.totalGoldEarned += gold;

  // Drop table
  for (const entry of monster.lootTable) {
    const c = entry.chance * (1 + luckBonus);
    if (rollChance(c)) {
      const q = entry.qty ? rngInt(entry.qty[0], entry.qty[1]) : 1;
      addToStash(state, entry.itemId, q);
      logLoot(state, entry.itemId, q);
    }
  }

  // Bonus rare drop from tier pool (scales with luck)
  const rareRoll = 0.04 + luckBonus * 0.1;
  if (rollChance(rareRoll)) {
    const pool = pickTierPool(monster.level);
    const itemId = rngChoice(pool);
    addToStash(state, itemId, 1);
    logLoot(state, itemId, 1);
  }
}

export function rollChestLoot(state: GameState, dungeonLevel: number, rogueBonus: boolean): void {
  const rolls = rogueBonus ? 3 : 2;
  const pool = pickTierPool(dungeonLevel);
  for (let i = 0; i < rolls; i++) {
    const itemId = rngChoice(pool);
    addToStash(state, itemId, 1);
    logLoot(state, itemId, 1);
  }
  const gold = rngInt(20, 60) * Math.max(1, Math.floor(dungeonLevel / 4));
  state.stash.gold += gold;
  state.totalGoldEarned += gold;
  pushLog(state, 'loot', `Chest yields ${gold} gp.`, 'uncommon');
}

export function rollBossLoot(state: GameState, monster: Monster, guaranteedId: string | undefined, essenceReward: number): void {
  rollMonsterLoot(state, monster, 0.8);
  if (guaranteedId) {
    addToStash(state, guaranteedId, 1);
    logLoot(state, guaranteedId, 1);
  }
  if (essenceReward > 0) {
    state.stash.essence += essenceReward;
    pushLog(state, 'loot', `⟡ +${essenceReward} Celestial Essence`, 'legendary');
  }
}

export function addToStash(state: GameState, itemId: string, qty: number): void {
  if (!ITEMS[itemId]) return;
  const existing = state.stash.items[itemId] ?? 0;
  const rarity = ITEMS[itemId].rarity;
  // Bounty progress: count every drop even if auto-sold.
  if (state.bountyBoard) state.bountyBoard.itemsCollected += qty;
  // Auto-sell check
  if (state.autoSellRarities.includes(rarity)) {
    const gold = ITEMS[itemId].value * qty;
    state.stash.gold += gold;
    state.totalGoldEarned += gold;
    return;
  }
  state.stash.items[itemId] = existing + qty;
  // Collection log
  if (!state.collectionLog.includes(itemId)) {
    state.collectionLog.push(itemId);
  }
}

export function removeFromStash(state: GameState, itemId: string, qty: number): boolean {
  const existing = state.stash.items[itemId] ?? 0;
  if (existing < qty) return false;
  const next = existing - qty;
  if (next <= 0) delete state.stash.items[itemId];
  else state.stash.items[itemId] = next;
  return true;
}

function pickTierPool(level: number): string[] {
  for (const tier of TIER_LOOT_POOLS) {
    if (level <= tier.maxLevel) return tier.items;
  }
  return TIER_LOOT_POOLS[TIER_LOOT_POOLS.length - 1].items;
}

function logLoot(state: GameState, itemId: string, qty: number): void {
  const it = ITEMS[itemId];
  if (!it) return;
  const verb = qty > 1 ? `${qty}×` : '';
  pushLog(state, 'loot', `${it.icon} Looted ${verb} ${it.name}`, it.rarity);
}

export function rarityOf(itemId: string): Rarity | undefined {
  return ITEMS[itemId]?.rarity;
}

export function sellValue(itemId: string, qty: number): number {
  const it = ITEMS[itemId];
  if (!it) return 0;
  return Math.floor(it.value * qty * 0.5);
}
