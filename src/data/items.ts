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

  // ========== SCROLLS (consumables with party-wide effects) ==========
  scroll_town_portal: mk({ id: 'scroll_town_portal', name: 'Scroll of Town Portal', icon: '🌀', rarity: 'uncommon', type: 'consumable', value: 120, description: 'Instantly retreat to town from inside a dungeon.' }),
  scroll_identify:    mk({ id: 'scroll_identify', name: 'Scroll of Identify', icon: '📜', rarity: 'uncommon', type: 'consumable', value: 60, description: 'Reveals 2 random unrevealed tiles in the current dungeon.' }),
  scroll_xp:          mk({ id: 'scroll_xp', name: 'Scroll of Insight', icon: '📖', rarity: 'rare', type: 'consumable', value: 250, description: 'Grants the active party 500 XP each.' }),
  scroll_bless:       mk({ id: 'scroll_bless', name: 'Scroll of Blessing', icon: '📃', rarity: 'rare', type: 'consumable', value: 300, description: 'Buffs all party stats +25% for 60s.' }),
  scroll_haste:       mk({ id: 'scroll_haste', name: 'Scroll of Haste', icon: '⚡', rarity: 'rare', type: 'consumable', value: 220, description: 'Double movement + attack speed for 45s.' }),

  // ========== POTION BUNDLES (virtual — purchased only) ==========
  // The shop "bundle" buttons don't need a real item row; see bundle code in Town.

  // ========== TRINKETS ==========
  lucky_charm: mk({ id: 'lucky_charm', name: 'Lucky Charm', icon: '🍀', rarity: 'uncommon', type: 'trinket', slot: 'neck', stats: { luck: 4 }, value: 120 }),
  ring_of_power: mk({ id: 'ring_of_power', name: 'Ring of Power', icon: '💍', rarity: 'rare', type: 'trinket', slot: 'ring', stats: { str: 4, int: 4 }, value: 500 }),
  amulet_of_vigor: mk({ id: 'amulet_of_vigor', name: 'Amulet of Vigor', icon: '📿', rarity: 'epic', type: 'trinket', slot: 'neck', stats: { con: 12, luck: 3 }, value: 1800, levelReq: 15 }),
  celestial_band: mk({ id: 'celestial_band', name: 'Celestial Band', icon: '💎', rarity: 'celestial', type: 'trinket', slot: 'ring', stats: { str: 10, dex: 10, int: 10, con: 10, spd: 10, luck: 10 }, value: 50000, levelReq: 50 }),

  // ========== MINING — ORES ==========
  copper_ore: mk({ id: 'copper_ore', name: 'Copper Ore', icon: '🟠', rarity: 'common', type: 'material', value: 3 }),
  tin_ore:    mk({ id: 'tin_ore',    name: 'Tin Ore',    icon: '⚪', rarity: 'common', type: 'material', value: 3 }),
  iron_ore:   mk({ id: 'iron_ore',   name: 'Iron Ore',   icon: '🟤', rarity: 'common', type: 'material', value: 10 }),
  coal:       mk({ id: 'coal',       name: 'Coal',       icon: '⚫', rarity: 'common', type: 'material', value: 18 }),
  silver_ore: mk({ id: 'silver_ore', name: 'Silver Ore', icon: '⚙️', rarity: 'uncommon', type: 'material', value: 35 }),
  gold_ore:   mk({ id: 'gold_ore',   name: 'Gold Ore',   icon: '🟡', rarity: 'uncommon', type: 'material', value: 45 }),
  mithril_ore:mk({ id: 'mithril_ore',name: 'Mithril Ore',icon: '🟣', rarity: 'rare', type: 'material', value: 90 }),
  adamant_ore:mk({ id: 'adamant_ore',name: 'Adamant Ore',icon: '🟢', rarity: 'rare', type: 'material', value: 180 }),
  runite_ore: mk({ id: 'runite_ore', name: 'Runite Ore', icon: '🔷', rarity: 'epic', type: 'material', value: 500 }),
  dragonite_ore: mk({ id: 'dragonite_ore', name: 'Dragonite Ore', icon: '🐲', rarity: 'legendary', type: 'material', value: 1200 }),

  // ========== SMITHING — BARS ==========
  bronze_bar: mk({ id: 'bronze_bar', name: 'Bronze Bar', icon: '🟠', rarity: 'common', type: 'material', value: 12 }),
  iron_bar:   mk({ id: 'iron_bar',   name: 'Iron Bar',   icon: '🟤', rarity: 'common', type: 'material', value: 28 }),
  steel_bar:  mk({ id: 'steel_bar',  name: 'Steel Bar',  icon: '⚙️', rarity: 'uncommon', type: 'material', value: 70 }),
  silver_bar: mk({ id: 'silver_bar', name: 'Silver Bar', icon: '⚙️', rarity: 'uncommon', type: 'material', value: 80 }),
  gold_bar:   mk({ id: 'gold_bar',   name: 'Gold Bar',   icon: '🟡', rarity: 'uncommon', type: 'material', value: 110 }),
  mithril_bar:mk({ id: 'mithril_bar',name: 'Mithril Bar',icon: '🟣', rarity: 'rare', type: 'material', value: 220 }),
  adamant_bar:mk({ id: 'adamant_bar',name: 'Adamant Bar',icon: '🟢', rarity: 'rare', type: 'material', value: 480 }),
  runite_bar: mk({ id: 'runite_bar', name: 'Runite Bar', icon: '🔷', rarity: 'epic', type: 'material', value: 1300 }),
  dragonite_bar: mk({ id: 'dragonite_bar', name: 'Dragonite Bar', icon: '🐉', rarity: 'legendary', type: 'material', value: 3000 }),

  // ========== WOODCUTTING — LOGS ==========
  logs:        mk({ id: 'logs',        name: 'Logs',         icon: '🪵', rarity: 'common', type: 'material', value: 4 }),
  oak_logs:    mk({ id: 'oak_logs',    name: 'Oak Logs',     icon: '🪵', rarity: 'common', type: 'material', value: 14 }),
  willow_logs: mk({ id: 'willow_logs', name: 'Willow Logs',  icon: '🪵', rarity: 'uncommon', type: 'material', value: 40 }),
  teak_logs:   mk({ id: 'teak_logs',   name: 'Teak Logs',    icon: '🪵', rarity: 'uncommon', type: 'material', value: 55 }),
  maple_logs:  mk({ id: 'maple_logs',  name: 'Maple Logs',   icon: '🍁', rarity: 'rare', type: 'material', value: 100 }),
  mahogany_logs: mk({ id: 'mahogany_logs', name: 'Mahogany Logs', icon: '🪵', rarity: 'rare', type: 'material', value: 140 }),
  yew_logs:    mk({ id: 'yew_logs',    name: 'Yew Logs',     icon: '🌲', rarity: 'epic', type: 'material', value: 260 }),
  magic_logs:  mk({ id: 'magic_logs',  name: 'Magic Logs',   icon: '🌟', rarity: 'legendary', type: 'material', value: 650 }),
  elder_logs:  mk({ id: 'elder_logs',  name: 'Elder Logs',   icon: '🌳', rarity: 'legendary', type: 'material', value: 1400 }),

  // ========== FISHING — RAW FISH ==========
  raw_shrimp:   mk({ id: 'raw_shrimp',   name: 'Raw Shrimp',   icon: '🦐', rarity: 'common', type: 'material', value: 2 }),
  raw_sardine:  mk({ id: 'raw_sardine',  name: 'Raw Sardine',  icon: '🐟', rarity: 'common', type: 'material', value: 5 }),
  raw_trout:    mk({ id: 'raw_trout',    name: 'Raw Trout',    icon: '🐟', rarity: 'common', type: 'material', value: 18 }),
  raw_salmon:   mk({ id: 'raw_salmon',   name: 'Raw Salmon',   icon: '🐟', rarity: 'uncommon', type: 'material', value: 35 }),
  raw_tuna:     mk({ id: 'raw_tuna',     name: 'Raw Tuna',     icon: '🐟', rarity: 'uncommon', type: 'material', value: 50 }),
  raw_lobster:  mk({ id: 'raw_lobster',  name: 'Raw Lobster',  icon: '🦞', rarity: 'rare', type: 'material', value: 80 }),
  raw_swordfish:mk({ id: 'raw_swordfish',name: 'Raw Swordfish',icon: '🐠', rarity: 'rare', type: 'material', value: 150 }),
  raw_monkfish: mk({ id: 'raw_monkfish', name: 'Raw Monkfish', icon: '🐟', rarity: 'rare', type: 'material', value: 220 }),
  raw_shark:    mk({ id: 'raw_shark',    name: 'Raw Shark',    icon: '🦈', rarity: 'epic', type: 'material', value: 400 }),
  raw_manta_ray:mk({ id: 'raw_manta_ray',name: 'Raw Manta Ray',icon: '🐟', rarity: 'epic', type: 'material', value: 600 }),
  raw_anglerfish:mk({ id: 'raw_anglerfish',name:'Raw Anglerfish',icon: '🐡', rarity: 'legendary', type: 'material', value: 1000 }),
  raw_dark_crab:mk({ id: 'raw_dark_crab',name: 'Raw Dark Crab',icon: '🦀', rarity: 'legendary', type: 'material', value: 1400 }),

  // ========== COOKING — COOKED FOOD (heals party) ==========
  cooked_shrimp:   mk({ id: 'cooked_shrimp',   name: 'Cooked Shrimp',   icon: '🍤', rarity: 'common', type: 'potion', value: 6,  healOnUse: 12,  description: 'Restores 12 HP.' }),
  cooked_sardine:  mk({ id: 'cooked_sardine',  name: 'Cooked Sardine',  icon: '🍢', rarity: 'common', type: 'potion', value: 14, healOnUse: 20,  description: 'Restores 20 HP.' }),
  cooked_trout:    mk({ id: 'cooked_trout',    name: 'Cooked Trout',    icon: '🍖', rarity: 'common', type: 'potion', value: 40, healOnUse: 45,  description: 'Restores 45 HP.' }),
  cooked_salmon:   mk({ id: 'cooked_salmon',   name: 'Cooked Salmon',   icon: '🍱', rarity: 'uncommon', type: 'potion', value: 80, healOnUse: 75, description: 'Restores 75 HP.' }),
  cooked_tuna:     mk({ id: 'cooked_tuna',     name: 'Cooked Tuna',     icon: '🍣', rarity: 'uncommon', type: 'potion', value: 110, healOnUse: 95, description: 'Restores 95 HP.' }),
  cooked_lobster:  mk({ id: 'cooked_lobster',  name: 'Cooked Lobster',  icon: '🦞', rarity: 'rare', type: 'potion', value: 180, healOnUse: 140, description: 'Restores 140 HP.' }),
  cooked_swordfish:mk({ id: 'cooked_swordfish',name: 'Cooked Swordfish',icon: '🍴', rarity: 'rare', type: 'potion', value: 300, healOnUse: 200, description: 'Restores 200 HP.' }),
  cooked_monkfish: mk({ id: 'cooked_monkfish', name: 'Cooked Monkfish', icon: '🍲', rarity: 'rare', type: 'potion', value: 420, healOnUse: 260, description: 'Restores 260 HP.' }),
  cooked_shark:    mk({ id: 'cooked_shark',    name: 'Cooked Shark',    icon: '🦈', rarity: 'epic', type: 'potion', value: 700, healOnUse: 380, description: 'Restores 380 HP.' }),
  cooked_manta_ray:mk({ id: 'cooked_manta_ray',name: 'Cooked Manta Ray',icon: '🍱', rarity: 'epic', type: 'potion', value: 950, healOnUse: 500, description: 'Restores 500 HP.' }),
  cooked_anglerfish:mk({ id: 'cooked_anglerfish', name: 'Cooked Anglerfish', icon: '🐡', rarity: 'legendary', type: 'potion', value: 1500, healOnUse: 700, description: 'Restores 700 HP.' }),
  cooked_dark_crab: mk({ id: 'cooked_dark_crab', name: 'Cooked Dark Crab', icon: '🦀', rarity: 'legendary', type: 'potion', value: 2000, healOnUse: 900, description: 'Restores 900 HP.' }),
  // Baked goods from farmed ingredients
  bread: mk({ id: 'bread', name: 'Bread', icon: '🍞', rarity: 'common', type: 'potion', value: 25, healOnUse: 30, description: 'Restores 30 HP.' }),
  meat_pie: mk({ id: 'meat_pie', name: 'Meat Pie', icon: '🥧', rarity: 'uncommon', type: 'potion', value: 80, healOnUse: 90, description: 'Restores 90 HP.' }),
  hearty_stew: mk({ id: 'hearty_stew', name: 'Hearty Stew', icon: '🍲', rarity: 'rare', type: 'potion', value: 240, healOnUse: 180, description: 'Restores 180 HP and 40 MP.', manaOnUse: 40 }),

  // ========== FARMING / HERBLORE — RAW INGREDIENTS ==========
  herbs:            mk({ id: 'herbs',            name: 'Herbs',              icon: '🌿', rarity: 'common', type: 'material', value: 8 }),
  toadflax:         mk({ id: 'toadflax',         name: 'Toadflax',           icon: '🌿', rarity: 'uncommon', type: 'material', value: 22 }),
  ranarr:           mk({ id: 'ranarr',           name: 'Ranarr Weed',        icon: '🌿', rarity: 'uncommon', type: 'material', value: 55 }),
  avantoe:          mk({ id: 'avantoe',          name: 'Avantoe',            icon: '🌿', rarity: 'rare', type: 'material', value: 110 }),
  kwuarm:           mk({ id: 'kwuarm',           name: 'Kwuarm',             icon: '🌿', rarity: 'rare', type: 'material', value: 240 }),
  cadantine:        mk({ id: 'cadantine',        name: 'Cadantine',          icon: '🌿', rarity: 'epic', type: 'material', value: 500 }),
  vial_of_water:    mk({ id: 'vial_of_water',    name: 'Vial of Water',      icon: '🫙', rarity: 'common', type: 'material', value: 5 }),
  glowing_mushroom: mk({ id: 'glowing_mushroom', name: 'Glowing Mushroom',   icon: '🍄', rarity: 'uncommon', type: 'material', value: 28 }),
  wheat:            mk({ id: 'wheat',            name: 'Wheat',              icon: '🌾', rarity: 'common', type: 'material', value: 6 }),
  flour:            mk({ id: 'flour',            name: 'Flour',              icon: '🫓', rarity: 'common', type: 'material', value: 12 }),

  // ========== HERBLORE — POTIONS (combat buffs) ==========
  attack_potion:   mk({ id: 'attack_potion',   name: 'Attack Potion',   icon: '🔴', rarity: 'common', type: 'potion', value: 55, description: '+15% STR for 45s on use.' }),
  defense_potion:  mk({ id: 'defense_potion',  name: 'Defense Potion',  icon: '🔵', rarity: 'common', type: 'potion', value: 60, description: '+15% CON for 45s on use.' }),
  strength_potion: mk({ id: 'strength_potion', name: 'Strength Potion', icon: '🟠', rarity: 'uncommon', type: 'potion', value: 120, description: '+25% STR for 45s on use.' }),
  magic_potion:    mk({ id: 'magic_potion',    name: 'Magic Potion',    icon: '🟣', rarity: 'uncommon', type: 'potion', value: 140, description: '+25% INT for 45s on use.' }),
  ranging_potion:  mk({ id: 'ranging_potion',  name: 'Ranging Potion',  icon: '🟢', rarity: 'uncommon', type: 'potion', value: 140, description: '+25% DEX for 45s on use.' }),
  super_attack:    mk({ id: 'super_attack',    name: 'Super Attack',    icon: '🔴', rarity: 'rare', type: 'potion', value: 320, description: '+40% STR for 60s on use.' }),
  super_defense:   mk({ id: 'super_defense',   name: 'Super Defense',   icon: '🔵', rarity: 'rare', type: 'potion', value: 340, description: '+40% CON for 60s on use.' }),
  prayer_potion:   mk({ id: 'prayer_potion',   name: 'Prayer Potion',   icon: '🕯️', rarity: 'rare', type: 'potion', value: 450, manaOnUse: 150, description: 'Restores 150 MP.' }),
  saradomin_brew:  mk({ id: 'saradomin_brew',  name: 'Saradomin Brew',  icon: '🍷', rarity: 'epic', type: 'potion', value: 900, healOnUse: 450, description: 'Massive heal: 450 HP.' }),

  // ========== CRAFTING — HIDES / CLOTH / GEMS ==========
  monster_hide:  mk({ id: 'monster_hide',  name: 'Monster Hide',  icon: '🟫', rarity: 'common', type: 'material', value: 6 }),
  leather:       mk({ id: 'leather',       name: 'Leather',       icon: '🟫', rarity: 'common', type: 'material', value: 15 }),
  hard_leather:  mk({ id: 'hard_leather',  name: 'Hard Leather',  icon: '🟫', rarity: 'uncommon', type: 'material', value: 40 }),
  dragon_leather:mk({ id: 'dragon_leather',name: 'Dragon Leather',icon: '🟥', rarity: 'rare', type: 'material', value: 180 }),
  thread:        mk({ id: 'thread',        name: 'Thread',        icon: '🧵', rarity: 'common', type: 'material', value: 3 }),
  flax:          mk({ id: 'flax',          name: 'Flax',          icon: '🌾', rarity: 'common', type: 'material', value: 6 }),
  bowstring:     mk({ id: 'bowstring',     name: 'Bowstring',     icon: '🪢', rarity: 'common', type: 'material', value: 18 }),
  feathers:      mk({ id: 'feathers',      name: 'Feathers',      icon: '🪶', rarity: 'common', type: 'material', value: 2 }),
  uncut_sapphire:mk({ id: 'uncut_sapphire',name: 'Uncut Sapphire',icon: '🔷', rarity: 'uncommon', type: 'material', value: 50 }),
  uncut_emerald: mk({ id: 'uncut_emerald', name: 'Uncut Emerald', icon: '💚', rarity: 'uncommon', type: 'material', value: 80 }),
  uncut_ruby:    mk({ id: 'uncut_ruby',    name: 'Uncut Ruby',    icon: '❤️', rarity: 'rare', type: 'material', value: 180 }),
  uncut_diamond: mk({ id: 'uncut_diamond', name: 'Uncut Diamond', icon: '💎', rarity: 'epic', type: 'material', value: 500 }),
  sapphire:      mk({ id: 'sapphire',      name: 'Sapphire',      icon: '🔷', rarity: 'uncommon', type: 'material', value: 140 }),
  emerald:       mk({ id: 'emerald',       name: 'Emerald',       icon: '💚', rarity: 'uncommon', type: 'material', value: 220 }),
  ruby:          mk({ id: 'ruby',          name: 'Ruby',          icon: '❤️', rarity: 'rare', type: 'material', value: 480 }),
  diamond:       mk({ id: 'diamond',       name: 'Diamond',       icon: '💎', rarity: 'epic', type: 'material', value: 1200 }),

  // ========== SMITHING — BRONZE → RUNITE GEAR SETS ==========
  // Bronze tier (lvl 1)
  bronze_sword:     mk({ id: 'bronze_sword',     name: 'Bronze Sword',     icon: '⚔️', rarity: 'common', type: 'weapon', slot: 'weapon', weaponPower: 4,  stats: { str: 1 }, value: 25 }),
  bronze_helm:      mk({ id: 'bronze_helm',      name: 'Bronze Helm',      icon: '⛑️', rarity: 'common', type: 'armor',  slot: 'head',   armor: 2, value: 30 }),
  bronze_platelegs: mk({ id: 'bronze_platelegs', name: 'Bronze Platelegs', icon: '👖', rarity: 'common', type: 'armor',  slot: 'legs',   armor: 3, value: 40 }),
  bronze_platebody: mk({ id: 'bronze_platebody', name: 'Bronze Platebody', icon: '🥋', rarity: 'common', type: 'armor',  slot: 'body',   armor: 5, value: 60 }),
  // Iron tier (lvl 15) — iron_helm already defined above in HELMETS
  iron_platelegs:   mk({ id: 'iron_platelegs',   name: 'Iron Platelegs',   icon: '👖', rarity: 'uncommon', type: 'armor', slot: 'legs', armor: 7, stats: { con: 2 }, value: 180, levelReq: 5 }),
  iron_platebody:   mk({ id: 'iron_platebody',   name: 'Iron Platebody',   icon: '🥋', rarity: 'uncommon', type: 'armor', slot: 'body', armor: 12, stats: { con: 3 }, value: 260, levelReq: 5 }),
  // Steel tier (lvl 30)
  steel_helm:       mk({ id: 'steel_helm',       name: 'Steel Helm',       icon: '⛑️', rarity: 'uncommon', type: 'armor', slot: 'head', armor: 8, stats: { con: 3 }, value: 380, levelReq: 10 }),
  steel_platelegs:  mk({ id: 'steel_platelegs',  name: 'Steel Platelegs',  icon: '👖', rarity: 'uncommon', type: 'armor', slot: 'legs', armor: 11, stats: { con: 3 }, value: 520, levelReq: 10 }),
  steel_platebody:  mk({ id: 'steel_platebody',  name: 'Steel Platebody',  icon: '🥋', rarity: 'rare', type: 'armor', slot: 'body', armor: 18, stats: { con: 5 }, value: 820, levelReq: 10 }),
  // Mithril tier (lvl 50)
  mithril_sword:    mk({ id: 'mithril_sword',    name: 'Mithril Longsword',icon: '🗡️', rarity: 'rare', type: 'weapon', slot: 'weapon', weaponPower: 30, stats: { str: 10, con: 3 }, value: 1600, levelReq: 14 }),
  mithril_helm:     mk({ id: 'mithril_helm',     name: 'Mithril Helm',     icon: '⛑️', rarity: 'rare', type: 'armor',  slot: 'head',   armor: 11, stats: { con: 5 }, value: 1000, levelReq: 14 }),
  mithril_platelegs:mk({ id: 'mithril_platelegs',name: 'Mithril Platelegs',icon: '👖', rarity: 'rare', type: 'armor',  slot: 'legs',   armor: 15, stats: { con: 5 }, value: 1400, levelReq: 14 }),
  mithril_platebody:mk({ id: 'mithril_platebody',name: 'Mithril Platebody',icon: '🥋', rarity: 'rare', type: 'armor',  slot: 'body',   armor: 24, stats: { con: 8 }, value: 2200, levelReq: 14 }),
  // Adamant tier (lvl 70)
  adamant_sword:    mk({ id: 'adamant_sword',    name: 'Adamant Longsword',icon: '🗡️', rarity: 'epic', type: 'weapon', slot: 'weapon', weaponPower: 50, stats: { str: 18, con: 6 }, value: 4200, levelReq: 22 }),
  adamant_helm:     mk({ id: 'adamant_helm',     name: 'Adamant Helm',     icon: '⛑️', rarity: 'epic', type: 'armor',  slot: 'head',   armor: 16, stats: { con: 8 }, value: 2600, levelReq: 22 }),
  adamant_platelegs:mk({ id: 'adamant_platelegs',name: 'Adamant Platelegs',icon: '👖', rarity: 'epic', type: 'armor',  slot: 'legs',   armor: 22, stats: { con: 9 }, value: 3600, levelReq: 22 }),
  adamant_platebody:mk({ id: 'adamant_platebody',name: 'Adamant Platebody',icon: '🥋', rarity: 'epic', type: 'armor',  slot: 'body',   armor: 34, stats: { con: 14 }, value: 5800, levelReq: 22 }),
  // Runite tier (lvl 85+)
  runite_sword:     mk({ id: 'runite_sword',     name: 'Runite Longsword', icon: '🗡️', rarity: 'legendary', type: 'weapon', slot: 'weapon', weaponPower: 78, stats: { str: 30, con: 10, luck: 4 }, value: 12000, levelReq: 32 }),
  runite_helm:      mk({ id: 'runite_helm',      name: 'Runite Helm',      icon: '⛑️', rarity: 'legendary', type: 'armor',  slot: 'head',   armor: 24, stats: { con: 12 }, value: 7200, levelReq: 32 }),
  runite_platelegs: mk({ id: 'runite_platelegs', name: 'Runite Platelegs', icon: '👖', rarity: 'legendary', type: 'armor',  slot: 'legs',   armor: 32, stats: { con: 14 }, value: 10000, levelReq: 32 }),
  runite_platebody: mk({ id: 'runite_platebody', name: 'Runite Platebody', icon: '🥋', rarity: 'legendary', type: 'armor',  slot: 'body',   armor: 48, stats: { con: 22 }, value: 15000, levelReq: 32 }),

  // ========== CRAFTING — JEWELRY (gems + silver/gold bars) ==========
  sapphire_ring:   mk({ id: 'sapphire_ring',   name: 'Sapphire Ring',   icon: '💍', rarity: 'uncommon', type: 'trinket', slot: 'ring', stats: { int: 3, luck: 1 }, value: 380 }),
  emerald_ring:    mk({ id: 'emerald_ring',    name: 'Emerald Ring',    icon: '💍', rarity: 'rare', type: 'trinket', slot: 'ring', stats: { dex: 4, luck: 2 }, value: 820 }),
  ruby_ring:       mk({ id: 'ruby_ring',       name: 'Ruby Ring',       icon: '💍', rarity: 'rare', type: 'trinket', slot: 'ring', stats: { str: 6, con: 2 }, value: 1400 }),
  diamond_ring:    mk({ id: 'diamond_ring',    name: 'Diamond Ring',    icon: '💍', rarity: 'epic', type: 'trinket', slot: 'ring', stats: { str: 5, dex: 5, int: 5, luck: 3 }, value: 3200 }),
  sapphire_amulet: mk({ id: 'sapphire_amulet', name: 'Sapphire Amulet', icon: '📿', rarity: 'uncommon', type: 'trinket', slot: 'neck', stats: { int: 5 }, value: 500 }),
  emerald_amulet:  mk({ id: 'emerald_amulet',  name: 'Emerald Amulet',  icon: '📿', rarity: 'rare', type: 'trinket', slot: 'neck', stats: { dex: 6, spd: 3 }, value: 1050 }),
  ruby_amulet:     mk({ id: 'ruby_amulet',     name: 'Ruby Amulet',     icon: '📿', rarity: 'rare', type: 'trinket', slot: 'neck', stats: { str: 8 }, value: 1800 }),
  diamond_amulet:  mk({ id: 'diamond_amulet',  name: 'Diamond Amulet',  icon: '📿', rarity: 'epic', type: 'trinket', slot: 'neck', stats: { str: 4, int: 4, con: 8, luck: 4 }, value: 4200 }),

  // ========== MINING — HIGH-TIER GEMS & ESSENCE ==========
  rune_essence:    mk({ id: 'rune_essence',    name: 'Rune Essence',    icon: '🔮', rarity: 'uncommon', type: 'material', value: 8, description: 'Raw essence for runecrafting.' }),
  pure_essence:    mk({ id: 'pure_essence',    name: 'Pure Essence',    icon: '💠', rarity: 'rare', type: 'material', value: 22, description: 'Refined essence for high-tier runes.' }),
  uncut_dragonstone: mk({ id: 'uncut_dragonstone', name: 'Uncut Dragonstone', icon: '🔶', rarity: 'epic', type: 'material', value: 950 }),
  uncut_onyx:      mk({ id: 'uncut_onyx',      name: 'Uncut Onyx',      icon: '⬛', rarity: 'legendary', type: 'material', value: 2800 }),
  dragonstone:     mk({ id: 'dragonstone',     name: 'Dragonstone',     icon: '🔶', rarity: 'epic', type: 'material', value: 2400 }),
  onyx:            mk({ id: 'onyx',            name: 'Onyx',            icon: '⬛', rarity: 'legendary', type: 'material', value: 7200 }),

  // ========== WOODCUTTING / SMITHING — CHARCOAL ==========
  charcoal:        mk({ id: 'charcoal',        name: 'Charcoal',        icon: '🖤', rarity: 'common', type: 'material', value: 12, description: 'Slow-burned logs. Reduces coal use in smelts.' }),
  arctic_pine_logs:mk({ id: 'arctic_pine_logs',name: 'Arctic Pine Logs',icon: '🌲', rarity: 'legendary', type: 'material', value: 900 }),
  redwood_logs:    mk({ id: 'redwood_logs',    name: 'Redwood Logs',    icon: '🌳', rarity: 'legendary', type: 'material', value: 1800 }),

  // ========== TOOLS (crafted utilities, cosmetic slot / inventory) ==========
  chisel:          mk({ id: 'chisel',          name: 'Chisel',          icon: '🔧', rarity: 'common', type: 'material', value: 30, description: 'Needed to cut gems. Kept in stash.' }),
  knife:           mk({ id: 'knife',           name: 'Crafting Knife',  icon: '🔪', rarity: 'common', type: 'material', value: 25, description: 'Used in fletching and leatherwork.' }),
  tinderbox:       mk({ id: 'tinderbox',       name: 'Tinderbox',       icon: '🪨', rarity: 'common', type: 'material', value: 20, description: 'Lights fires — charcoal production.' }),
  pestle_and_mortar: mk({ id: 'pestle_and_mortar', name: 'Pestle & Mortar', icon: '🥣', rarity: 'uncommon', type: 'material', value: 120, description: 'Grinds rare components for herblore.' }),
  lockpick:        mk({ id: 'lockpick',        name: 'Lockpick',        icon: '🗝️', rarity: 'uncommon', type: 'material', value: 80, description: 'Opens stolen chests.' }),

  // ========== RUNECRAFTING — TALISMANS (crafted, tier gate) ==========
  air_talisman:    mk({ id: 'air_talisman',    name: 'Air Talisman',    icon: '🌫️', rarity: 'common', type: 'material', value: 20 }),
  mind_talisman:   mk({ id: 'mind_talisman',   name: 'Mind Talisman',   icon: '🧠', rarity: 'common', type: 'material', value: 25 }),
  water_talisman:  mk({ id: 'water_talisman',  name: 'Water Talisman',  icon: '🌊', rarity: 'common', type: 'material', value: 30 }),
  earth_talisman:  mk({ id: 'earth_talisman',  name: 'Earth Talisman',  icon: '⛰️', rarity: 'common', type: 'material', value: 35 }),
  fire_talisman:   mk({ id: 'fire_talisman',   name: 'Fire Talisman',   icon: '🔥', rarity: 'uncommon', type: 'material', value: 45 }),
  body_talisman:   mk({ id: 'body_talisman',   name: 'Body Talisman',   icon: '🫁', rarity: 'uncommon', type: 'material', value: 55 }),
  cosmic_talisman: mk({ id: 'cosmic_talisman', name: 'Cosmic Talisman', icon: '🌌', rarity: 'uncommon', type: 'material', value: 80 }),
  chaos_talisman:  mk({ id: 'chaos_talisman',  name: 'Chaos Talisman',  icon: '🌀', rarity: 'rare', type: 'material', value: 140 }),
  nature_talisman: mk({ id: 'nature_talisman', name: 'Nature Talisman', icon: '🍃', rarity: 'rare', type: 'material', value: 200 }),
  law_talisman:    mk({ id: 'law_talisman',    name: 'Law Talisman',    icon: '⚖️', rarity: 'rare', type: 'material', value: 280 }),
  death_talisman:  mk({ id: 'death_talisman',  name: 'Death Talisman',  icon: '💀', rarity: 'epic', type: 'material', value: 520 }),
  blood_talisman:  mk({ id: 'blood_talisman',  name: 'Blood Talisman',  icon: '🩸', rarity: 'epic', type: 'material', value: 900 }),
  soul_talisman:   mk({ id: 'soul_talisman',   name: 'Soul Talisman',   icon: '👻', rarity: 'legendary', type: 'material', value: 1600 }),

  // ========== RUNECRAFTING — RUNES ==========
  air_rune:        mk({ id: 'air_rune',        name: 'Air Rune',        icon: '💨', rarity: 'common', type: 'material', value: 4 }),
  mind_rune:       mk({ id: 'mind_rune',       name: 'Mind Rune',       icon: '🌀', rarity: 'common', type: 'material', value: 5 }),
  water_rune:      mk({ id: 'water_rune',      name: 'Water Rune',      icon: '💧', rarity: 'common', type: 'material', value: 6 }),
  earth_rune:      mk({ id: 'earth_rune',      name: 'Earth Rune',      icon: '🌱', rarity: 'common', type: 'material', value: 7 }),
  fire_rune:       mk({ id: 'fire_rune',       name: 'Fire Rune',       icon: '🔥', rarity: 'common', type: 'material', value: 8 }),
  body_rune:       mk({ id: 'body_rune',       name: 'Body Rune',       icon: '🫁', rarity: 'uncommon', type: 'material', value: 12 }),
  cosmic_rune:     mk({ id: 'cosmic_rune',     name: 'Cosmic Rune',     icon: '🌌', rarity: 'uncommon', type: 'material', value: 25 }),
  chaos_rune:      mk({ id: 'chaos_rune',      name: 'Chaos Rune',      icon: '⚡', rarity: 'rare', type: 'material', value: 45 }),
  nature_rune:     mk({ id: 'nature_rune',     name: 'Nature Rune',     icon: '🌿', rarity: 'rare', type: 'material', value: 60 }),
  law_rune:        mk({ id: 'law_rune',        name: 'Law Rune',        icon: '⚖️', rarity: 'rare', type: 'material', value: 90 }),
  death_rune:      mk({ id: 'death_rune',      name: 'Death Rune',      icon: '💀', rarity: 'epic', type: 'material', value: 200 }),
  blood_rune:      mk({ id: 'blood_rune',      name: 'Blood Rune',      icon: '🩸', rarity: 'epic', type: 'material', value: 400 }),
  soul_rune:       mk({ id: 'soul_rune',       name: 'Soul Rune',       icon: '👻', rarity: 'legendary', type: 'material', value: 700 }),
  astral_rune:     mk({ id: 'astral_rune',     name: 'Astral Rune',     icon: '✨', rarity: 'legendary', type: 'material', value: 1200, description: 'Forged from fused runes under starlight.' }),
  // Combined runes
  mist_rune:       mk({ id: 'mist_rune',       name: 'Mist Rune',       icon: '🌫️', rarity: 'uncommon', type: 'material', value: 15 }),
  dust_rune:       mk({ id: 'dust_rune',       name: 'Dust Rune',       icon: '💨', rarity: 'uncommon', type: 'material', value: 16 }),
  mud_rune:        mk({ id: 'mud_rune',        name: 'Mud Rune',        icon: '🟫', rarity: 'uncommon', type: 'material', value: 18 }),
  smoke_rune:      mk({ id: 'smoke_rune',      name: 'Smoke Rune',      icon: '🌪️', rarity: 'uncommon', type: 'material', value: 20 }),
  steam_rune:      mk({ id: 'steam_rune',      name: 'Steam Rune',      icon: '♨️', rarity: 'uncommon', type: 'material', value: 22 }),
  lava_rune:       mk({ id: 'lava_rune',       name: 'Lava Rune',       icon: '🌋', rarity: 'uncommon', type: 'material', value: 24 }),

  // ========== RUNECRAFTING — SCROLLS (runes → combat scrolls) ==========
  scroll_fireball:    mk({ id: 'scroll_fireball',    name: 'Scroll of Fireball',    icon: '🔥', rarity: 'rare', type: 'consumable', value: 350, description: 'Massive fire blast — 600 dmg to all enemies.' }),
  scroll_bone_heal:   mk({ id: 'scroll_bone_heal',   name: 'Scroll of Mending',     icon: '🩸', rarity: 'rare', type: 'consumable', value: 400, description: 'Revive a downed hero and fully heal.' }),
  scroll_soul_barrier:mk({ id: 'scroll_soul_barrier',name: 'Scroll of Soul Barrier',icon: '👻', rarity: 'epic', type: 'consumable', value: 650, description: 'Grants 500 shield to all party for 60s.' }),
  scroll_astral:      mk({ id: 'scroll_astral',      name: 'Astral Scroll',         icon: '✨', rarity: 'epic', type: 'consumable', value: 800, description: 'Reveals every tile in the current dungeon.' }),

  // ========== THIEVING — OUTPUTS ==========
  silk_scraps:     mk({ id: 'silk_scraps',     name: 'Silk Scraps',     icon: '🧶', rarity: 'common', type: 'material', value: 10 }),
  silk_fine:       mk({ id: 'silk_fine',       name: 'Fine Silk',       icon: '🪡', rarity: 'uncommon', type: 'material', value: 55 }),
  foraged_herb:    mk({ id: 'foraged_herb',    name: 'Foraged Herb',    icon: '🌾', rarity: 'common', type: 'material', value: 12, description: 'Random herb found mid-heist.' }),
  poison_vial_raw: mk({ id: 'poison_vial_raw', name: 'Raw Poison Vial', icon: '🫙', rarity: 'uncommon', type: 'material', value: 60 }),
  poison_vial:     mk({ id: 'poison_vial',     name: 'Poison Vial',     icon: '☠️', rarity: 'rare', type: 'material', value: 180, description: 'Weaponized toxin — used in advanced herblore.' }),
  stolen_key:      mk({ id: 'stolen_key',      name: 'Stolen Key',      icon: '🗝️', rarity: 'uncommon', type: 'material', value: 40, description: 'Opens thieves-chest events.' }),
  jewel_case:      mk({ id: 'jewel_case',      name: 'Jewel Case',      icon: '📦', rarity: 'rare', type: 'consumable', value: 200, description: 'Contains a random uncut gem.' }),
  gold_trinket:    mk({ id: 'gold_trinket',    name: 'Gold Trinket',    icon: '🧿', rarity: 'uncommon', type: 'material', value: 150 }),
  stolen_scroll:   mk({ id: 'stolen_scroll',   name: 'Stolen Scroll',   icon: '📜', rarity: 'rare', type: 'consumable', value: 280, description: 'Mystery scroll — random effect when used.' }),
  blood_diamond:   mk({ id: 'blood_diamond',   name: 'Blood Diamond',   icon: '🔴', rarity: 'epic', type: 'material', value: 900 }),
  soul_gem:        mk({ id: 'soul_gem',        name: 'Soul Gem',        icon: '💜', rarity: 'legendary', type: 'material', value: 2400, description: 'A trapped soul for endgame runecrafting.' }),
  dragon_hoard_scrap: mk({ id: 'dragon_hoard_scrap', name: 'Dragon Hoard Scrap', icon: '🐲', rarity: 'legendary', type: 'material', value: 3000 }),
  thieves_cache:   mk({ id: 'thieves_cache',   name: "Thieves' Cache",  icon: '🎁', rarity: 'rare', type: 'consumable', value: 250, description: 'Random stash of loot when used.' }),
  // Rogue outfit (crafting uses silk + poison, gives dodge/crit bonus when full set equipped — effect gated via items only for now)
  rogue_mask:      mk({ id: 'rogue_mask',      name: 'Rogue Mask',      icon: '🥷', rarity: 'rare', type: 'armor', slot: 'head', armor: 4, stats: { dex: 6, luck: 3 }, value: 600, levelReq: 12 }),
  rogue_top:       mk({ id: 'rogue_top',       name: 'Rogue Vest',      icon: '🎽', rarity: 'rare', type: 'armor', slot: 'body', armor: 8, stats: { dex: 8, spd: 3 }, value: 900, levelReq: 12 }),
  rogue_legs:      mk({ id: 'rogue_legs',      name: 'Rogue Breeches',  icon: '👖', rarity: 'rare', type: 'armor', slot: 'legs', armor: 6, stats: { dex: 6, spd: 3 }, value: 750, levelReq: 12 }),
  rogue_gloves:    mk({ id: 'rogue_gloves',    name: 'Rogue Gloves',    icon: '🧤', rarity: 'rare', type: 'armor', slot: 'offhand', armor: 2, stats: { dex: 5, luck: 2 }, value: 500, levelReq: 12, classReq: ['rogue'] }),
  rogue_boots:     mk({ id: 'rogue_boots',     name: 'Rogue Boots',     icon: '🥾', rarity: 'rare', type: 'armor', slot: 'feet', armor: 2, stats: { spd: 6, dex: 3 }, value: 480, levelReq: 12 }),

  // ========== AGILITY — OUTPUTS ==========
  marks_of_grace:  mk({ id: 'marks_of_grace',  name: 'Marks of Grace',  icon: '🪽', rarity: 'uncommon', type: 'currency', value: 15, description: 'Earned from agility courses. Used for graceful gear.' }),
  stamina_herb:    mk({ id: 'stamina_herb',    name: 'Stamina Herb',    icon: '🌱', rarity: 'uncommon', type: 'material', value: 22, description: 'Improves stamina potions.' }),
  shortcut_token:  mk({ id: 'shortcut_token',  name: 'Shortcut Token',  icon: '🏃', rarity: 'rare', type: 'material', value: 120, description: 'Used to unlock dungeon shortcuts.' }),
  mastery_mark:    mk({ id: 'mastery_mark',    name: 'Mastery Mark',    icon: '🎖️', rarity: 'legendary', type: 'currency', value: 500, description: 'Endgame agility currency.' }),
  graceful_hood:   mk({ id: 'graceful_hood',   name: 'Graceful Hood',   icon: '🎩', rarity: 'epic', type: 'armor', slot: 'head', armor: 3, stats: { spd: 5, con: 3 }, value: 1400, levelReq: 16, description: 'Reduces party food consumption.' }),
  graceful_top:    mk({ id: 'graceful_top',    name: 'Graceful Top',    icon: '🎽', rarity: 'epic', type: 'armor', slot: 'body', armor: 6, stats: { spd: 6, con: 4 }, value: 1900, levelReq: 16 }),
  graceful_legs:   mk({ id: 'graceful_legs',   name: 'Graceful Legs',   icon: '👖', rarity: 'epic', type: 'armor', slot: 'legs', armor: 4, stats: { spd: 5, con: 3 }, value: 1600, levelReq: 16 }),
  graceful_boots:  mk({ id: 'graceful_boots',  name: 'Graceful Boots',  icon: '🥿', rarity: 'epic', type: 'armor', slot: 'feet', armor: 2, stats: { spd: 8, dex: 3 }, value: 1500, levelReq: 16 }),
  graceful_cape:   mk({ id: 'graceful_cape',   name: 'Graceful Cape',   icon: '🧣', rarity: 'legendary', type: 'armor', slot: 'neck', armor: 2, stats: { spd: 8, con: 6, luck: 4 }, value: 3000, levelReq: 24 }),
  stamina_potion:  mk({ id: 'stamina_potion',  name: 'Stamina Potion',  icon: '🟢', rarity: 'uncommon', type: 'potion', value: 140, description: '+30% party move speed for 60s.' }),
  agility_potion:  mk({ id: 'agility_potion',  name: 'Agility Potion',  icon: '🏃', rarity: 'rare', type: 'potion', value: 260, description: '+30% DEX & SPD for 60s.' }),

  // ========== FARMING — EXPANSION (allotment + fruit + endgame herbs) ==========
  potato:          mk({ id: 'potato',          name: 'Potato',          icon: '🥔', rarity: 'common', type: 'material', value: 6 }),
  onion:           mk({ id: 'onion',           name: 'Onion',           icon: '🧅', rarity: 'common', type: 'material', value: 7 }),
  cabbage:         mk({ id: 'cabbage',         name: 'Cabbage',         icon: '🥬', rarity: 'common', type: 'material', value: 9 }),
  pumpkin:         mk({ id: 'pumpkin',         name: 'Pumpkin',         icon: '🎃', rarity: 'uncommon', type: 'material', value: 30 }),
  apple:           mk({ id: 'apple',           name: 'Apple',           icon: '🍎', rarity: 'common', type: 'material', value: 10 }),
  watermelon:      mk({ id: 'watermelon',      name: 'Watermelon',      icon: '🍉', rarity: 'uncommon', type: 'material', value: 35 }),
  snapdragon:      mk({ id: 'snapdragon',      name: 'Snapdragon',      icon: '🌷', rarity: 'rare', type: 'material', value: 180 }),
  wildblood:       mk({ id: 'wildblood',       name: 'Wildblood',       icon: '🌺', rarity: 'rare', type: 'material', value: 280 }),
  dwarf_weed:      mk({ id: 'dwarf_weed',      name: 'Dwarf Weed',      icon: '🌿', rarity: 'epic', type: 'material', value: 600 }),
  torstol:         mk({ id: 'torstol',         name: 'Torstol',         icon: '🌹', rarity: 'epic', type: 'material', value: 1100 }),
  spirit_herb:     mk({ id: 'spirit_herb',     name: 'Spirit Herb',     icon: '👻', rarity: 'legendary', type: 'material', value: 2200, description: 'Blooms only at shrines. Endgame herblore.' }),

  // ========== COOKING — EXPANSION ==========
  apple_pie:       mk({ id: 'apple_pie',       name: 'Apple Pie',       icon: '🥧', rarity: 'uncommon', type: 'potion', value: 100, healOnUse: 100, description: 'Restores 100 HP.' }),
  pumpkin_pie:     mk({ id: 'pumpkin_pie',     name: 'Pumpkin Pie',     icon: '🥧', rarity: 'rare', type: 'potion', value: 220, healOnUse: 180, manaOnUse: 30, description: 'Restores 180 HP and 30 MP.' }),
  cabbage_stew:    mk({ id: 'cabbage_stew',    name: 'Cabbage Stew',    icon: '🍲', rarity: 'common', type: 'potion', value: 50, healOnUse: 60, description: 'Humble heal: 60 HP.' }),
  spicy_stew:      mk({ id: 'spicy_stew',      name: 'Spicy Stew',      icon: '🌶️', rarity: 'rare', type: 'potion', value: 320, healOnUse: 250, manaOnUse: 60, description: 'Restores 250 HP and 60 MP.' }),
  rogue_stew:      mk({ id: 'rogue_stew',      name: "Rogue's Stew",    icon: '🍲', rarity: 'rare', type: 'potion', value: 380, healOnUse: 220, description: '+10% crit for 45s on use.' }),
  apple_cider:     mk({ id: 'apple_cider',     name: 'Apple Cider',     icon: '🍺', rarity: 'uncommon', type: 'potion', value: 90, healOnUse: 70, manaOnUse: 20, description: 'Restores 70 HP and 20 MP.' }),
  divine_wine:     mk({ id: 'divine_wine',     name: 'Divine Wine',     icon: '🍷', rarity: 'legendary', type: 'potion', value: 2200, healOnUse: 600, manaOnUse: 300, description: 'Restores 600 HP and 300 MP.' }),
  watermelon_slice: mk({ id: 'watermelon_slice', name: 'Watermelon Slice', icon: '🍉', rarity: 'uncommon', type: 'potion', value: 75, healOnUse: 65, description: 'Refreshing. Restores 65 HP.' }),

  // ========== HERBLORE — EXPANSION ==========
  anti_poison:     mk({ id: 'anti_poison',     name: 'Anti-Poison',     icon: '🟢', rarity: 'uncommon', type: 'potion', value: 180, description: 'Cures poison and grants 60s immunity.' }),
  weapon_poison:   mk({ id: 'weapon_poison',   name: 'Weapon Poison',   icon: '☠️', rarity: 'rare', type: 'potion', value: 360, description: 'Coats party weapons: +25% crit chance for 60s.' }),
  super_strength:  mk({ id: 'super_strength',  name: 'Super Strength',  icon: '🟥', rarity: 'rare', type: 'potion', value: 420, description: '+45% STR for 60s on use.' }),
  super_magic:     mk({ id: 'super_magic',     name: 'Super Magic',     icon: '🟪', rarity: 'rare', type: 'potion', value: 420, description: '+45% INT for 60s on use.' }),
  super_ranging:   mk({ id: 'super_ranging',   name: 'Super Ranging',   icon: '🟩', rarity: 'rare', type: 'potion', value: 420, description: '+45% DEX for 60s on use.' }),
  overload_potion: mk({ id: 'overload_potion', name: 'Overload Potion', icon: '🌟', rarity: 'legendary', type: 'potion', value: 2800, description: '+50% to all stats for 90s — caution: costs 50 HP on use.' }),
  divine_potion:   mk({ id: 'divine_potion',   name: 'Divine Potion',   icon: '💫', rarity: 'legendary', type: 'potion', value: 2600, description: 'Perma-50% stat boost until next dungeon ends.' }),
  imbued_healing_potion: mk({ id: 'imbued_healing_potion', name: 'Imbued Healing Potion', icon: '🧬', rarity: 'epic', type: 'potion', value: 900, healOnUse: 600, description: 'Infused with blood runes. Restores 600 HP.' }),
  guthix_rest:     mk({ id: 'guthix_rest',     name: 'Guthix Rest',     icon: '🍵', rarity: 'rare', type: 'potion', value: 300, healOnUse: 200, manaOnUse: 80, description: 'Tea of balance: 200 HP + 80 MP.' }),

  // ========== SMITHING — EXPANSION (dragonite + rune-etched) ==========
  dragonite_sword:     mk({ id: 'dragonite_sword',     name: 'Dragonite Longsword',icon: '🐉', rarity: 'legendary', type: 'weapon', slot: 'weapon', weaponPower: 110, stats: { str: 40, con: 12, luck: 6 }, value: 22000, levelReq: 42 }),
  dragonite_helm:      mk({ id: 'dragonite_helm',      name: 'Dragonite Helm',     icon: '🐲', rarity: 'legendary', type: 'armor',  slot: 'head',   armor: 32, stats: { con: 16 }, value: 14000, levelReq: 42 }),
  dragonite_platelegs: mk({ id: 'dragonite_platelegs', name: 'Dragonite Platelegs',icon: '🐲', rarity: 'legendary', type: 'armor',  slot: 'legs',   armor: 42, stats: { con: 18 }, value: 18000, levelReq: 42 }),
  dragonite_platebody: mk({ id: 'dragonite_platebody', name: 'Dragonite Platebody',icon: '🐲', rarity: 'legendary', type: 'armor',  slot: 'body',   armor: 62, stats: { con: 28 }, value: 26000, levelReq: 42 }),
  chaos_bar:           mk({ id: 'chaos_bar',           name: 'Chaos-Infused Bar',  icon: '🌀', rarity: 'epic', type: 'material', value: 1800 }),
  death_bar:           mk({ id: 'death_bar',           name: 'Death-Forged Bar',   icon: '💀', rarity: 'legendary', type: 'material', value: 4500 }),
  rune_etched_sword:   mk({ id: 'rune_etched_sword',   name: 'Rune-Etched Sword',  icon: '⚔️', rarity: 'epic', type: 'weapon', slot: 'weapon', weaponPower: 64, stats: { str: 22, int: 8, con: 6 }, value: 7500, levelReq: 28 }),
  chaos_blade:         mk({ id: 'chaos_blade',         name: 'Chaos Blade',        icon: '⚡', rarity: 'legendary', type: 'weapon', slot: 'weapon', weaponPower: 96, stats: { str: 34, dex: 10, luck: 8 }, value: 16500, levelReq: 38 }),
  death_hammer:        mk({ id: 'death_hammer',        name: 'Death Hammer',       icon: '🔨', rarity: 'legendary', type: 'weapon', slot: 'weapon', weaponPower: 104, stats: { str: 38, con: 14 }, value: 20000, levelReq: 40, classReq: ['barbarian', 'knight'] }),

  // ========== CRAFTING — ENCHANTED & ENDGAME ==========
  enchanted_sapphire_ring:  mk({ id: 'enchanted_sapphire_ring',  name: 'Enchanted Sapphire Ring', icon: '💍', rarity: 'rare', type: 'trinket', slot: 'ring', stats: { int: 8, luck: 4 }, value: 1100 }),
  enchanted_emerald_ring:   mk({ id: 'enchanted_emerald_ring',   name: 'Enchanted Emerald Ring',  icon: '💍', rarity: 'epic', type: 'trinket', slot: 'ring', stats: { dex: 10, luck: 6 }, value: 2200 }),
  enchanted_ruby_amulet:    mk({ id: 'enchanted_ruby_amulet',    name: 'Enchanted Ruby Amulet',   icon: '📿', rarity: 'epic', type: 'trinket', slot: 'neck', stats: { str: 14, con: 4 }, value: 3600 }),
  enchanted_diamond_amulet: mk({ id: 'enchanted_diamond_amulet', name: 'Enchanted Diamond Amulet',icon: '📿', rarity: 'legendary', type: 'trinket', slot: 'neck', stats: { str: 10, int: 10, con: 12, luck: 6 }, value: 8500, levelReq: 25 }),
  dragonstone_ring:         mk({ id: 'dragonstone_ring',         name: 'Dragonstone Ring',        icon: '💍', rarity: 'epic', type: 'trinket', slot: 'ring', stats: { str: 8, int: 8, con: 8 }, value: 5500 }),
  onyx_ring:                mk({ id: 'onyx_ring',                name: 'Onyx Ring',               icon: '🕳️', rarity: 'legendary', type: 'trinket', slot: 'ring', stats: { str: 12, dex: 12, int: 12, con: 12, spd: 6, luck: 6 }, value: 22000, levelReq: 40 }),
  battlestaff:              mk({ id: 'battlestaff',              name: 'Battlestaff',             icon: '🪄', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 10, stats: { int: 10, str: 4 }, value: 380, classReq: ['mage', 'priest'] }),
  mystic_staff:             mk({ id: 'mystic_staff',             name: 'Mystic Staff',            icon: '🪄', rarity: 'rare', type: 'weapon', slot: 'weapon', weaponPower: 18, stats: { int: 16, luck: 3 }, value: 1400, classReq: ['mage', 'priest'] }),
  ancient_staff:            mk({ id: 'ancient_staff',            name: 'Ancient Staff',           icon: '🪄', rarity: 'legendary', type: 'weapon', slot: 'weapon', weaponPower: 42, stats: { int: 32, luck: 8 }, value: 12000, levelReq: 30, classReq: ['mage', 'priest'] }),
  composite_bow:            mk({ id: 'composite_bow',            name: 'Composite Bow',           icon: '🏹', rarity: 'uncommon', type: 'weapon', slot: 'weapon', weaponPower: 14, stats: { dex: 10, spd: 2 }, value: 420, classReq: ['ranger'] }),
  crystal_bow:              mk({ id: 'crystal_bow',              name: 'Crystal Bow',             icon: '🏹', rarity: 'epic', type: 'weapon', slot: 'weapon', weaponPower: 34, stats: { dex: 22, spd: 5, luck: 3 }, value: 5800, levelReq: 20, classReq: ['ranger'] }),

  // ========== CRAFTING — ENDGAME GEAR (sinks for rare mats) ==========
  dragonhide_body:  mk({ id: 'dragonhide_body',  name: 'Dragonhide Body',  icon: '🦎', rarity: 'epic', type: 'armor', slot: 'body', armor: 26, stats: { dex: 12, con: 6 }, value: 4200, levelReq: 22, classReq: ['ranger', 'rogue'] }),
  dragonhide_chaps: mk({ id: 'dragonhide_chaps', name: 'Dragonhide Chaps', icon: '🦎', rarity: 'epic', type: 'armor', slot: 'legs', armor: 18, stats: { dex: 8, con: 4 }, value: 2800, levelReq: 22, classReq: ['ranger', 'rogue'] }),
  bloodcrown:       mk({ id: 'bloodcrown',       name: 'Bloodcrown',       icon: '👑', rarity: 'legendary', type: 'armor', slot: 'head', armor: 20, stats: { str: 10, con: 12, luck: 6 }, value: 9500, levelReq: 26 }),
  dragonhoard_plate:mk({ id: 'dragonhoard_plate',name: 'Dragonhoard Plate',icon: '🐉', rarity: 'celestial', type: 'armor', slot: 'body', armor: 78, stats: { str: 18, con: 36, luck: 10 }, value: 48000, levelReq: 45 }),
  dragonhoard_cape: mk({ id: 'dragonhoard_cape', name: 'Dragonhoard Cape', icon: '🧣', rarity: 'celestial', type: 'armor', slot: 'neck', armor: 4, stats: { str: 12, dex: 12, con: 12, luck: 10 }, value: 38000, levelReq: 40 }),

  // ========== EARLY AGILITY REWARDS (closes the 55-level marks-of-grace wait) ==========
  grace_bracelet:   mk({ id: 'grace_bracelet',  name: 'Grace Bracelet',  icon: '🔗', rarity: 'uncommon', type: 'trinket', slot: 'ring', stats: { spd: 3, dex: 2 }, value: 450, description: 'Woven with Marks of Grace.' }),
  stamina_gloves:   mk({ id: 'stamina_gloves',  name: 'Stamina Gloves',  icon: '🧤', rarity: 'rare', type: 'armor', slot: 'offhand', armor: 2, stats: { spd: 4, con: 2 }, value: 820, levelReq: 8, description: 'Keeps the party wind up.' }),
  runners_cape:     mk({ id: 'runners_cape',    name: "Runner's Cape",   icon: '🎒', rarity: 'rare', type: 'armor', slot: 'neck', armor: 1, stats: { spd: 5, dex: 3 }, value: 950, levelReq: 10 }),

  // ========== FISHING — BAIT-ASSISTED HIGH-TIER CATCH ==========
  raw_karambwan:    mk({ id: 'raw_karambwan',   name: 'Raw Karambwan',   icon: '🐟', rarity: 'rare', type: 'material', value: 180 }),
  cooked_karambwan: mk({ id: 'cooked_karambwan',name: 'Cooked Karambwan',icon: '🍢', rarity: 'rare', type: 'potion', value: 380, healOnUse: 240, description: 'Restores 240 HP.' }),
  fish_oil:         mk({ id: 'fish_oil',        name: 'Fish Oil',        icon: '🫠', rarity: 'uncommon', type: 'material', value: 40, description: 'Rendered from deep-sea catches. Used in herblore.' }),

  // ========== MASTERY TIER (mastery_mark sinks — true endgame) ==========
  // Crafted with Mastery Marks (Grandmaster milestone drops + Agility
  // ascendance). Celestial-rarity gear scaled past dragonhoard.
  masters_robe:    mk({ id: 'masters_robe',    name: "Master's Robe",    icon: '🥻', rarity: 'celestial', type: 'armor',  slot: 'body', armor: 56, stats: { str: 16, dex: 16, int: 24, con: 24, luck: 8 }, value: 64000, levelReq: 50, description: 'Woven by a Grandmaster of every craft.' }),
  masters_crown:   mk({ id: 'masters_crown',   name: "Master's Crown",   icon: '👑', rarity: 'celestial', type: 'armor',  slot: 'head', armor: 28, stats: { str: 12, dex: 12, int: 12, con: 12, spd: 8, luck: 8 }, value: 58000, levelReq: 50 }),
  masters_signet:  mk({ id: 'masters_signet',  name: "Master's Signet",  icon: '💍', rarity: 'celestial', type: 'trinket', slot: 'ring', stats: { str: 10, dex: 10, int: 10, con: 10, spd: 6, luck: 12 }, value: 46000, levelReq: 45 }),
  tome_of_mastery: mk({ id: 'tome_of_mastery', name: 'Tome of Mastery',  icon: '📚', rarity: 'legendary', type: 'consumable', value: 9000, description: 'Grants +500 XP to every town skill.' }),
};

// Loot pools by dungeon tier (indexed by monster level)
export const TIER_LOOT_POOLS: { maxLevel: number; items: string[] }[] = [
  { maxLevel: 5, items: ['rusty_sword', 'cloth_robe', 'leather_cap', 'leather_boots', 'wooden_shield', 'healing_potion', 'mana_potion', 'oak_staff', 'short_bow', 'iron_dagger', 'woodcutter_axe'] },
  { maxLevel: 12, items: ['iron_sword', 'leather_vest', 'chain_hauberk', 'iron_helm', 'kite_shield', 'crystal_staff', 'yew_longbow', 'poisoned_dagger', 'warhammer', 'greater_healing_potion', 'lucky_charm'] },
  { maxLevel: 25, items: ['steel_longsword', 'knight_blade', 'shadowfang', 'elven_bow', 'crimson_greataxe', 'plate_armor', 'swift_boots', 'ring_of_power', 'elixir_of_life'] },
  { maxLevel: 40, items: ['holy_avenger', 'archon_staff', 'bulwark_shield', 'crown_of_valor', 'amulet_of_vigor'] },
  { maxLevel: 9999, items: ['dragonbone_sword', 'dragonplate', 'celestial_band'] },
];

// Skill material drop pools — monsters drop tier-appropriate raw mats so
// dungeon runs feed the Skills page directly. Rune essence and stray
// silk scraps drop across mid tiers so combat feeds Runecrafting +
// Thieving chains even if the player never assigns those workers.
export const SKILL_MATERIAL_POOLS: { maxLevel: number; items: string[] }[] = [
  { maxLevel: 5,  items: ['logs', 'copper_ore', 'tin_ore', 'raw_shrimp', 'herbs', 'flax', 'feathers', 'monster_hide', 'vial_of_water'] },
  { maxLevel: 12, items: ['oak_logs', 'iron_ore', 'raw_sardine', 'herbs', 'monster_hide', 'thread', 'uncut_sapphire', 'vial_of_water', 'wheat', 'silk_scraps', 'foraged_herb'] },
  { maxLevel: 20, items: ['willow_logs', 'silver_ore', 'raw_trout', 'toadflax', 'leather', 'uncut_emerald', 'iron_ore', 'coal', 'rune_essence', 'air_rune', 'earth_rune'] },
  { maxLevel: 30, items: ['maple_logs', 'coal', 'raw_salmon', 'ranarr', 'leather', 'uncut_ruby', 'silver_ore', 'gold_ore', 'rune_essence', 'fire_rune', 'silk_scraps', 'stamina_herb'] },
  { maxLevel: 45, items: ['yew_logs', 'gold_ore', 'raw_lobster', 'avantoe', 'hard_leather', 'uncut_diamond', 'mithril_ore', 'glowing_mushroom', 'pure_essence', 'cosmic_rune', 'silk_fine', 'marks_of_grace'] },
  { maxLevel: 60, items: ['magic_logs', 'mithril_ore', 'raw_swordfish', 'kwuarm', 'hard_leather', 'uncut_diamond', 'adamant_ore', 'raw_monkfish', 'pure_essence', 'chaos_rune', 'silk_fine', 'poison_vial_raw'] },
  { maxLevel: 75, items: ['elder_logs', 'adamant_ore', 'raw_shark', 'cadantine', 'dragon_leather', 'runite_ore', 'raw_manta_ray', 'law_rune', 'nature_rune', 'blood_diamond', 'mastery_mark'] },
  { maxLevel: 9999, items: ['magic_logs', 'runite_ore', 'dragonite_ore', 'raw_manta_ray', 'raw_anglerfish', 'raw_dark_crab', 'cadantine', 'dragon_leather', 'death_rune', 'blood_rune', 'soul_rune', 'astral_rune', 'dragon_hoard_scrap'] },
];
