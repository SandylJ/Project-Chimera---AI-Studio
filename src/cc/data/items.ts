import { Item } from '../types';

function mk(partial: Item): Item { return partial; }

export const ITEMS: Record<string, Item> = {
  // ========== CURRENCIES / MATERIALS (tradable loot) ==========
  gold_nugget: mk({ id: 'gold_nugget', name: 'Gold Nugget', icon: '🪙', rarity: 'common', type: 'currency', value: 5 }),
  bone_shard: mk({ id: 'bone_shard', name: 'Bone Shard', icon: '🦴', rarity: 'common', type: 'material', value: 3 }),
  slime_gel: mk({ id: 'slime_gel', name: 'Slime Gel', icon: '🟢', rarity: 'common', type: 'material', value: 2 }),
  goblin_ear: mk({ id: 'goblin_ear', name: 'Goblin Ear', icon: '👂', rarity: 'common', type: 'material', value: 4 }),
  spider_silk: mk({ id: 'spider_silk', name: 'Spider Silk', icon: '🕸️', rarity: 'uncommon', type: 'material', value: 12 }),
  ice_shard: mk({ id: 'ice_shard', name: 'Ice Shard', icon: '🔹', rarity: 'uncommon', type: 'material', value: 18 }),
  demon_horn: mk({ id: 'demon_horn', name: 'Demon Horn', icon: '🐃', rarity: 'rare', type: 'material', value: 60 }),
  dragon_scale: mk({ id: 'dragon_scale', name: 'Dragon Scale', icon: '🐲', rarity: 'epic', type: 'material', value: 200 }),
  celestial_dust: mk({ id: 'celestial_dust', name: 'Celestial Dust', icon: '✨', rarity: 'legendary', type: 'material', value: 800 }),

  // ========== POTIONS ==========
  healing_potion: mk({ id: 'healing_potion', name: 'Healing Potion', icon: '🧪', rarity: 'common', type: 'potion', value: 25, healOnUse: 40, description: 'Restores 40 HP.' }),
  greater_healing_potion: mk({ id: 'greater_healing_potion', name: 'Greater Healing Potion', icon: '🧴', rarity: 'uncommon', type: 'potion', value: 75, healOnUse: 150, description: 'Restores 150 HP.' }),
  mana_potion: mk({ id: 'mana_potion', name: 'Mana Potion', icon: '💧', rarity: 'common', type: 'potion', value: 30, manaOnUse: 30, description: 'Restores 30 MP.' }),
  elixir_of_life: mk({ id: 'elixir_of_life', name: 'Elixir of Life', icon: '🍷', rarity: 'rare', type: 'potion', value: 300, healOnUse: 999, manaOnUse: 999, description: 'Full HP and MP.' }),

  // ========== WEAPONS ==========
  rusty_sword: mk({ id: 'rusty_sword', name: 'Rusty Sword', icon: '⚔️', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 3, stats: { str: 1 }, value: 8 }),
  iron_sword: mk({ id: 'iron_sword', name: 'Iron Sword', icon: '🗡️', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 6, stats: { str: 2 }, value: 35 }),
  steel_longsword: mk({ id: 'steel_longsword', name: 'Steel Longsword', icon: '⚔️', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 12, stats: { str: 4 }, value: 150 }),
  knight_blade: mk({ id: 'knight_blade', name: "Knight's Blade", icon: '🗡️', rarity: 'rare', type: 'weapon', slot: 'weapon', weaponPower: 24, stats: { str: 8, con: 3 }, value: 600, levelReq: 8 }),
  holy_avenger: mk({ id: 'holy_avenger', name: 'Holy Avenger', icon: '🗡️', rarity: 'epic', type: 'weapon', slot: 'weapon', weaponPower: 42, stats: { str: 14, con: 6, luck: 4 }, value: 2500, levelReq: 18 }),
  dragonbone_sword: mk({ id: 'dragonbone_sword', name: 'Dragonbone Sword', icon: '⚔️', rarity: 'legendary', type: 'weapon', slot: 'weapon', weaponPower: 80, stats: { str: 25, con: 10, luck: 8 }, value: 10000, levelReq: 35 }),

  oak_staff: mk({ id: 'oak_staff', name: 'Oak Staff', icon: '🪄', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 2, stats: { int: 3 }, value: 30, classReq: ['mage', 'priest'] }),
  crystal_staff: mk({ id: 'crystal_staff', name: 'Crystal Staff', icon: '🔮', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 5, stats: { int: 8, dex: 2 }, value: 180, classReq: ['mage', 'priest'] }),
  archon_staff: mk({ id: 'archon_staff', name: 'Archon Staff', icon: '🪄', rarity: 'epic', type: 'weapon', slot: 'weapon', weaponPower: 18, stats: { int: 22, luck: 5 }, value: 3200, levelReq: 18, classReq: ['mage', 'priest'] }),

  short_bow: mk({ id: 'short_bow', name: 'Short Bow', icon: '🏹', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 4, stats: { dex: 2 }, value: 40, classReq: ['ranger'] }),
  yew_longbow: mk({ id: 'yew_longbow', name: 'Yew Longbow', icon: '🏹', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 10, stats: { dex: 6 }, value: 220, classReq: ['ranger'] }),
  elven_bow: mk({ id: 'elven_bow', name: 'Elven Bow', icon: '🏹', rarity: 'rare', type: 'weapon', slot: 'weapon', weaponPower: 22, stats: { dex: 12, spd: 4 }, value: 900, levelReq: 10, classReq: ['ranger'] }),

  iron_dagger: mk({ id: 'iron_dagger', name: 'Iron Dagger', icon: '🗡️', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 3, stats: { dex: 3, spd: 1 }, value: 20, classReq: ['rogue'] }),
  poisoned_dagger: mk({ id: 'poisoned_dagger', name: 'Poisoned Dagger', icon: '🗡️', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 8, stats: { dex: 6, luck: 3 }, value: 180, classReq: ['rogue'] }),
  shadowfang: mk({ id: 'shadowfang', name: 'Shadowfang', icon: '🗡️', rarity: 'rare', type: 'weapon', slot: 'weapon', weaponPower: 18, stats: { dex: 12, spd: 5, luck: 6 }, value: 850, levelReq: 10, classReq: ['rogue'] }),

  woodcutter_axe: mk({ id: 'woodcutter_axe', name: "Woodcutter's Axe", icon: '🪓', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 5, stats: { str: 2 }, value: 25, classReq: ['barbarian'] }),
  warhammer: mk({ id: 'warhammer', name: 'Warhammer', icon: '🔨', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 14, stats: { str: 6, con: 2 }, value: 200, classReq: ['barbarian', 'knight'] }),
  crimson_greataxe: mk({ id: 'crimson_greataxe', name: 'Crimson Greataxe', icon: '🪓', rarity: 'rare', type: 'weapon', slot: 'weapon', weaponPower: 28, stats: { str: 14, luck: 4 }, value: 1100, levelReq: 10, classReq: ['barbarian'] }),

  // ========== ARMOR ==========
  cloth_robe: mk({ id: 'cloth_robe', name: 'Cloth Robe', icon: '🥼', rarity: 'common', type: 'armor', slot: 'body', armor: 2, stats: { int: 1 }, value: 15 }),
  leather_vest: mk({ id: 'leather_vest', name: 'Leather Vest', icon: '🦺', rarity: 'common', type: 'armor', slot: 'body', armor: 4, stats: { dex: 1, con: 1 }, value: 30 }),
  chain_hauberk: mk({ id: 'chain_hauberk', name: 'Chain Hauberk', icon: '👕', rarity: 'uncommon', type: 'armor', slot: 'body', armor: 10, stats: { con: 4 }, value: 140 }),
  plate_armor: mk({ id: 'plate_armor', name: 'Plate Armor', icon: '🛡️', rarity: 'rare', type: 'armor', slot: 'body', armor: 24, stats: { con: 10, str: 3 }, value: 700, levelReq: 10 }),
  dragonplate: mk({ id: 'dragonplate', name: 'Dragonplate', icon: '🛡️', rarity: 'legendary', type: 'armor', slot: 'body', armor: 60, stats: { con: 24, str: 8, luck: 6 }, value: 8500, levelReq: 30 }),

  leather_cap: mk({ id: 'leather_cap', name: 'Leather Cap', icon: '🎩', rarity: 'common', type: 'armor', slot: 'head', armor: 2, value: 18 }),
  iron_helm: mk({ id: 'iron_helm', name: 'Iron Helm', icon: '⛑️', rarity: 'uncommon', type: 'armor', slot: 'head', armor: 6, stats: { con: 2 }, value: 90 }),
  crown_of_valor: mk({ id: 'crown_of_valor', name: 'Crown of Valor', icon: '👑', rarity: 'epic', type: 'armor', slot: 'head', armor: 14, stats: { con: 8, luck: 4 }, value: 1800, levelReq: 20 }),

  leather_boots: mk({ id: 'leather_boots', name: 'Leather Boots', icon: '🥾', rarity: 'common', type: 'armor', slot: 'feet', armor: 1, stats: { spd: 1 }, value: 12 }),
  swift_boots: mk({ id: 'swift_boots', name: 'Swift Boots', icon: '🥾', rarity: 'rare', type: 'armor', slot: 'feet', armor: 3, stats: { spd: 5, dex: 3 }, value: 450, levelReq: 8 }),

  wooden_shield: mk({ id: 'wooden_shield', name: 'Wooden Shield', icon: '🛡️', rarity: 'common', type: 'armor', slot: 'offhand', armor: 3, stats: { con: 1 }, value: 18, classReq: ['knight'] }),
  kite_shield: mk({ id: 'kite_shield', name: 'Kite Shield', icon: '🛡️', rarity: 'uncommon', type: 'armor', slot: 'offhand', armor: 8, stats: { con: 3 }, value: 110, classReq: ['knight'] }),
  bulwark_shield: mk({ id: 'bulwark_shield', name: 'Bulwark Shield', icon: '🛡️', rarity: 'epic', type: 'armor', slot: 'offhand', armor: 20, stats: { con: 10, str: 4 }, value: 2100, levelReq: 18, classReq: ['knight'] }),

  // ========== TRINKETS ==========
  lucky_charm: mk({ id: 'lucky_charm', name: 'Lucky Charm', icon: '🍀', rarity: 'uncommon', type: 'trinket', slot: 'neck', stats: { luck: 4 }, value: 120 }),
  ring_of_power: mk({ id: 'ring_of_power', name: 'Ring of Power', icon: '💍', rarity: 'rare', type: 'trinket', slot: 'ring', stats: { str: 4, int: 4 }, value: 500 }),
  amulet_of_vigor: mk({ id: 'amulet_of_vigor', name: 'Amulet of Vigor', icon: '📿', rarity: 'epic', type: 'trinket', slot: 'neck', stats: { con: 12, luck: 3 }, value: 1800, levelReq: 15 }),
  celestial_band: mk({ id: 'celestial_band', name: 'Celestial Band', icon: '💎', rarity: 'celestial', type: 'trinket', slot: 'ring', stats: { str: 10, dex: 10, int: 10, con: 10, spd: 10, luck: 10 }, value: 50000, levelReq: 50 }),
};

// Loot pools by dungeon tier (indexed by monster level)
export const TIER_LOOT_POOLS: { maxLevel: number; items: string[] }[] = [
  { maxLevel: 5, items: ['rusty_sword', 'cloth_robe', 'leather_cap', 'leather_boots', 'wooden_shield', 'healing_potion', 'mana_potion', 'oak_staff', 'short_bow', 'iron_dagger', 'woodcutter_axe'] },
  { maxLevel: 12, items: ['iron_sword', 'leather_vest', 'chain_hauberk', 'iron_helm', 'kite_shield', 'crystal_staff', 'yew_longbow', 'poisoned_dagger', 'warhammer', 'greater_healing_potion', 'lucky_charm'] },
  { maxLevel: 25, items: ['steel_longsword', 'knight_blade', 'shadowfang', 'elven_bow', 'crimson_greataxe', 'plate_armor', 'swift_boots', 'ring_of_power', 'elixir_of_life'] },
  { maxLevel: 40, items: ['holy_avenger', 'archon_staff', 'bulwark_shield', 'crown_of_valor', 'amulet_of_vigor'] },
  { maxLevel: 9999, items: ['dragonbone_sword', 'dragonplate', 'celestial_band'] },
];
