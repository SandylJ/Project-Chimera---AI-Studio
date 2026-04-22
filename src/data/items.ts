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
// dungeon runs feed the Skills page directly.
export const SKILL_MATERIAL_POOLS: { maxLevel: number; items: string[] }[] = [
  { maxLevel: 5,  items: ['logs', 'copper_ore', 'tin_ore', 'raw_shrimp', 'herbs', 'flax', 'feathers', 'monster_hide', 'vial_of_water'] },
  { maxLevel: 12, items: ['oak_logs', 'iron_ore', 'raw_sardine', 'herbs', 'monster_hide', 'thread', 'uncut_sapphire', 'vial_of_water', 'wheat'] },
  { maxLevel: 20, items: ['willow_logs', 'silver_ore', 'raw_trout', 'toadflax', 'leather', 'uncut_emerald', 'iron_ore', 'coal'] },
  { maxLevel: 30, items: ['maple_logs', 'coal', 'raw_salmon', 'ranarr', 'leather', 'uncut_ruby', 'silver_ore', 'gold_ore'] },
  { maxLevel: 45, items: ['yew_logs', 'gold_ore', 'raw_lobster', 'avantoe', 'hard_leather', 'uncut_diamond', 'mithril_ore', 'glowing_mushroom'] },
  { maxLevel: 60, items: ['magic_logs', 'mithril_ore', 'raw_swordfish', 'kwuarm', 'hard_leather', 'uncut_diamond', 'adamant_ore', 'raw_monkfish'] },
  { maxLevel: 75, items: ['elder_logs', 'adamant_ore', 'raw_shark', 'cadantine', 'dragon_leather', 'runite_ore', 'raw_manta_ray'] },
  { maxLevel: 9999, items: ['magic_logs', 'runite_ore', 'dragonite_ore', 'raw_manta_ray', 'raw_anglerfish', 'raw_dark_crab', 'cadantine', 'dragon_leather'] },
];
