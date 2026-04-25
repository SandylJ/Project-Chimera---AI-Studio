// Daily-rotation primitives: shop stock + bounty board.
// Both pure, day-seeded — same day-index gives the same rotation, so a
// player who plays for 8h sees a stable shop / board until midnight UTC.
import { Bounty, BountyBoard, BountyKind, ShopRotation } from '../types';
import { ITEMS } from '../data/items';
import { DUNGEON_DEFS } from '../data/dungeons';

export function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

// Mulberry32 PRNG — deterministic from the seed. Used to make the
// daily rotation reproducible.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Featured shop stock for the day. Three tiers of equipment by value
// plus a fixed scroll list and three fixed bundles.
export function rollShopRotation(day: number): ShopRotation {
  const rng = mulberry32(day ^ 0x9E37);
  const allEquip = Object.values(ITEMS).filter(i => i.slot && !i.classReq);
  const scrolls = [
    'scroll_town_portal', 'scroll_identify', 'scroll_xp', 'scroll_bless', 'scroll_haste',
    'scroll_fireball', 'scroll_bone_heal', 'scroll_soul_barrier', 'scroll_astral',
    'jewel_case', 'thieves_cache', 'stolen_scroll',
  ];
  const pool = [...allEquip].sort((a, b) => a.value - b.value);
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
      { id: 'bundle_heal_small', label: 'Healer Pouch',  items: [['healing_potion', 5], ['mana_potion', 3]], price: 180 },
      { id: 'bundle_heal_big',   label: 'Crusader Pack', items: [['greater_healing_potion', 4], ['mana_potion', 4], ['scroll_town_portal', 1]], price: 500 },
      { id: 'bundle_explore',    label: 'Dungeoneer Kit', items: [['scroll_identify', 3], ['scroll_xp', 1], ['healing_potion', 4]], price: 700 },
    ],
  };
}

export function rollBountyBoard(day: number, killsSoFar: number, goldSoFar: number): BountyBoard {
  const rng = mulberry32((day ^ 0xB000) >>> 0);
  const kindPool: BountyKind[] = ['kill_count', 'earn_gold', 'find_items', 'best_combo'];
  const used = new Set<BountyKind>();
  const bounties: Bounty[] = [];
  const dungeonIds = Object.keys(DUNGEON_DEFS);
  for (let i = 0; i < 3; i++) {
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
