import { Item, SkillAction, SkillId, KingdomWorker, Quest, CollectionLogCategory } from './types';
import { QUESTS } from './questData';
import { COLLECTION_LOG_CATEGORIES } from './collectionLogData';

export { QUESTS, COLLECTION_LOG_CATEGORIES };

export const ITEMS: Record<string, Item> = {
  'raw_anchovies': { id: 'raw_anchovies', name: 'Raw Anchovies', description: 'Tiny fish.', icon: '🐟', value: 4, type: 'resource' },
  'cooked_anchovies': { id: 'cooked_anchovies', name: 'Cooked Anchovies', description: 'Heals 1 HP.', icon: '🍣', value: 10, type: 'food' },
  'raw_mackerel': { id: 'raw_mackerel', name: 'Raw Mackerel', description: 'Oily sea fish.', icon: '🐟', value: 25, type: 'resource' },
  'cooked_mackerel': { id: 'cooked_mackerel', name: 'Cooked Mackerel', description: 'Heals 6 HP.', icon: '🍣', value: 50, type: 'food' },
  'raw_cod': { id: 'raw_cod', name: 'Raw Cod', description: 'Common white fish.', icon: '🐟', value: 35, type: 'resource' },
  'cooked_cod': { id: 'cooked_cod', name: 'Cooked Cod', description: 'Heals 7 HP.', icon: '🍣', value: 70, type: 'food' },
  'raw_bass': { id: 'raw_bass', name: 'Raw Bass', description: 'Large freshwater fish.', icon: '🐟', value: 60, type: 'resource' },
  'cooked_bass': { id: 'cooked_bass', name: 'Cooked Bass', description: 'Heals 13 HP.', icon: '🍣', value: 120, type: 'food' },
  'raw_karambwan': { id: 'raw_karambwan', name: 'Raw Karambwan', description: 'A poisonous-looking octopus.', icon: '🐙', value: 150, type: 'resource' },
  'cooked_karambwan': { id: 'cooked_karambwan', name: 'Cooked Karambwan', description: 'Heals 18 HP, can be eaten quickly.', icon: '🍣', value: 350, type: 'food' },
  'raw_mantaray': { id: 'raw_mantaray', name: 'Raw Manta Ray', description: 'A giant flat fish.', icon: '🐟', value: 400, type: 'resource' },
  'cooked_mantaray': { id: 'cooked_mantaray', name: 'Cooked Manta Ray', description: 'Heals 45 HP.', icon: '🍣', value: 900, type: 'food' },
  'clay': { id: 'clay', name: 'Clay', description: 'Soft earth.', icon: '🧱', value: 5, type: 'resource' },
  'limestone': { id: 'limestone', name: 'Limestone', description: 'Used for construction.', icon: '🪨', value: 10, type: 'resource' },
  'granite': { id: 'granite', name: 'Granite', description: 'Very heavy stone.', icon: '🪨', value: 20, type: 'resource' },
  'sandstone': { id: 'sandstone', name: 'Sandstone', description: 'Easy to carve.', icon: '🪨', value: 15, type: 'resource' },
  'basalt': { id: 'basalt', name: 'Basalt', description: 'Dark volcanic rock.', icon: '🪨', value: 40, type: 'resource' },
  'marble': { id: 'marble', name: 'Marble', description: 'Beautiful white stone.', icon: '🪨', value: 100, type: 'resource' },
  'dry_logs': { id: 'dry_logs', name: 'Dry Logs', description: 'Easy to burn.', icon: '🪵', value: 3, type: 'resource' },
  'achey_logs': { id: 'achey_logs', name: 'Achey Logs', description: 'Used for ogre bows.', icon: '🪵', value: 10, type: 'resource' },
  'pine_logs': { id: 'pine_logs', name: 'Pine Logs', description: 'Smells like the forest.', icon: '🪵', value: 25, type: 'resource' },
  'eucalyptus_logs': { id: 'eucalyptus_logs', name: 'Eucalyptus Logs', description: 'Oily wood.', icon: '🪵', value: 90, type: 'resource' },
  'raw_chicken': { id: 'raw_chicken', name: 'Raw Chicken', description: 'Needs cooking.', icon: '🍗', value: 3, type: 'food' },
  'cooked_chicken': { id: 'cooked_chicken', name: 'Cooked Chicken', description: 'Heals 2 HP.', icon: '🍗', value: 10, type: 'food' },
  'raw_beef': { id: 'raw_beef', name: 'Raw Beef', description: 'Needs cooking.', icon: '🥩', value: 10, type: 'food' },
  'cooked_beef': { id: 'cooked_beef', name: 'Cooked Beef', description: 'Heals 5 HP.', icon: '🥩', value: 25, type: 'food' },
  'raw_bear_meat': { id: 'raw_bear_meat', name: 'Raw Bear Meat', description: 'Tough meat.', icon: '🥩', value: 20, type: 'food' },
  'cooked_bear_meat': { id: 'cooked_bear_meat', name: 'Cooked Bear Meat', description: 'Heals 12 HP.', icon: '🥩', value: 50, type: 'food' },
  'raw_rabbit': { id: 'raw_rabbit', name: 'Raw Rabbit', description: 'Small game meat.', icon: '🥩', value: 5, type: 'food' },
  'cooked_rabbit': { id: 'cooked_rabbit', name: 'Cooked Rabbit', description: 'Heals 3 HP.', icon: '🥩', value: 12, type: 'food' },
  'raw_boar_meat': { id: 'raw_boar_meat', name: 'Raw Boar Meat', description: 'Gamey meat.', icon: '🥩', value: 30, type: 'food' },
  'cooked_boar_meat': { id: 'cooked_boar_meat', name: 'Cooked Boar Meat', description: 'Heals 15 HP.', icon: '🥩', value: 75, type: 'food' },
  'raw_stag_meat': { id: 'raw_stag_meat', name: 'Raw Stag Meat', description: 'Lean venison.', icon: '🥩', value: 50, type: 'food' },
  'cooked_stag_meat': { id: 'cooked_stag_meat', name: 'Cooked Stag Meat', description: 'Heals 20 HP.', icon: '🥩', value: 150, type: 'food' },
  'wolf_bone': { id: 'wolf_bone', name: 'Wolf Bone', description: 'Sharp bone.', icon: '🦴', value: 15, type: 'resource' },
  'giant_bone': { id: 'giant_bone', name: 'Giant Bone', description: 'Huge bone.', icon: '🦴', value: 40, type: 'resource' },
  'demon_bone': { id: 'demon_bone', name: 'Demon Bone', description: 'Cursed bone.', icon: '🦴', value: 100, type: 'resource' },
  'vampire_dust': { id: 'vampire_dust', name: 'Vampire Dust', description: 'Remains of a vampire.', icon: '🌫️', value: 300, type: 'resource' },
  'hellhound_ash': { id: 'hellhound_ash', name: 'Hellhound Ash', description: 'Burnt remains.', icon: '🌋', value: 500, type: 'resource' },
  'abyssal_head': { id: 'abyssal_head', name: 'Abyssal Head', description: 'A trophy from the abyss.', icon: '👽', value: 5000, type: 'resource' },
  'imperial_sword': { id: 'imperial_sword', name: 'Imperial Sword', description: 'A blade of the empire.', icon: '⚔️', value: 25000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 65, strength: 35 } },
  'platinum_sword': { id: 'platinum_sword', name: 'Platinum Sword', description: 'A heavy, precious blade.', icon: '⚔️', value: 15000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 55, strength: 25 } },
  'obsidian_maul': { id: 'obsidian_maul', name: 'Obsidian Maul', description: 'A heavy volcanic hammer.', icon: '🔨', value: 35000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 10, strength: 70 } },
  'copper_ore': { id: 'copper_ore', name: 'Copper Ore', description: 'A common ore used for smelting.', icon: '🪨', value: 5, type: 'resource', skillHint: 'Mining / Smithing', farmHint: 'Copper Rocks', usageHint: 'Smelt with Tin to create Bronze Bars.' },
  'tin_ore': { id: 'tin_ore', name: 'Tin Ore', description: 'A common ore used for smelting.', icon: '🪨', value: 5, type: 'resource', skillHint: 'Mining / Smithing', farmHint: 'Tin Rocks', usageHint: 'Smelt with Copper to create Bronze Bars.' },
  'bronze_bar': { id: 'bronze_bar', name: 'Bronze Bar', description: 'A bar made from copper and tin.', icon: '🧱', value: 20, type: 'resource' },
  'bronze_sword': { id: 'bronze_sword', name: 'Bronze Sword', description: 'A basic sword.', icon: '⚔️', value: 50, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 5, strength: 2 } },
  'logs': { id: 'logs', name: 'Logs', description: 'Standard wood logs.', icon: '🪵', value: 5, type: 'resource', skillHint: 'Woodcutting / Crafting', farmHint: 'Chop Trees', usageHint: 'Can be fletched into shafts or used for construction.' },
  'raw_shrimp': { id: 'raw_shrimp', name: 'Raw Shrimp', description: 'Small shrimp, needs cooking.', icon: '🦐', value: 5, type: 'food', skillHint: 'Fishing / Cooking', farmHint: 'Net Fishing', usageHint: 'Cook these to restore a small amount of health.' },
  'cooked_shrimp': { id: 'cooked_shrimp', name: 'Cooked Shrimp', description: 'Restores 10 HP.', icon: '🍤', value: 15, type: 'food', skillHint: 'Cooking', farmHint: 'Cook Raw Shrimp', usageHint: 'Eat this to restore health during combat.' },
  'raw_sardine': { id: 'raw_sardine', name: 'Raw Sardine', description: 'Small oily fish.', icon: '🐟', value: 8, type: 'resource' },
  'cooked_sardine': { id: 'cooked_sardine', name: 'Cooked Sardine', description: 'Heals 3 HP.', icon: '🍣', value: 15, type: 'food' },
  'raw_herring': { id: 'raw_herring', name: 'Raw Herring', description: 'Common sea fish.', icon: '🐟', value: 12, type: 'resource' },
  'cooked_herring': { id: 'cooked_herring', name: 'Cooked Herring', description: 'Heals 4 HP.', icon: '🍣', value: 25, type: 'food' },
  'raw_pike': { id: 'raw_pike', name: 'Raw Pike', description: 'Freshwater predator.', icon: '🐟', value: 20, type: 'resource' },
  'cooked_pike': { id: 'cooked_pike', name: 'Cooked Pike', description: 'Heals 8 HP.', icon: '🍣', value: 40, type: 'food' },
  'raw_tuna': { id: 'raw_tuna', name: 'Raw Tuna', description: 'Large saltwater fish.', icon: '🐟', value: 50, type: 'resource' },
  'cooked_tuna': { id: 'cooked_tuna', name: 'Cooked Tuna', description: 'Heals 15 HP.', icon: '🍣', value: 100, type: 'food' },
  'raw_swordfish': { id: 'raw_swordfish', name: 'Raw Swordfish', description: 'A fish with a blade.', icon: '🐟', value: 120, type: 'resource' },
  'cooked_swordfish': { id: 'cooked_swordfish', name: 'Cooked Swordfish', description: 'Heals 30 HP.', icon: '🍣', value: 250, type: 'food' },
  'raw_monkfish': { id: 'raw_monkfish', name: 'Raw Monkfish', description: 'Ugly but delicious.', icon: '🐟', value: 200, type: 'resource' },
  'cooked_monkfish': { id: 'cooked_monkfish', name: 'Cooked Monkfish', description: 'Heals 40 HP.', icon: '🍣', value: 400, type: 'food' },
  'oak_logs': { id: 'oak_logs', name: 'Oak Logs', description: 'Sturdy oak logs.', icon: '🪵', value: 15, type: 'resource', skillHint: 'Woodcutting / Crafting', farmHint: 'Chop Oak Trees', usageHint: 'Used for better quality fletching.' },
  'iron_ore': { id: 'iron_ore', name: 'Iron Ore', description: 'A common ore for mid-tier gear.', icon: '🪨', value: 15, type: 'resource' },
  'coal': { id: 'coal', name: 'Coal', description: 'Used as fuel for smithing.', icon: '🌑', value: 15, type: 'resource' },
  'iron_bar': { id: 'iron_bar', name: 'Iron Bar', description: 'A bar made from iron ore.', icon: '🧱', value: 45, type: 'resource' },
  'iron_sword': { id: 'iron_sword', name: 'Iron Sword', description: 'A sturdy iron sword.', icon: '⚔️', value: 150, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 12, strength: 5 } },
  'steel_ore': { id: 'steel_ore', name: 'Steel Ore', description: 'Actually just coal, used with iron.', icon: '🪨', value: 25, type: 'resource' },
  'steel_bar': { id: 'steel_bar', name: 'Steel Bar', description: 'A strong bar made from iron and coal.', icon: '🧱', value: 100, type: 'resource' },
  'steel_sword': { id: 'steel_sword', name: 'Steel Sword', description: 'A powerful steel sword.', icon: '⚔️', value: 400, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 25, strength: 12 } },
  'mithril_ore': { id: 'mithril_ore', name: 'Mithril Ore', description: 'A lightweight, blue-tinted ore.', icon: '🪨', value: 50, type: 'resource' },
  'mithril_bar': { id: 'mithril_bar', name: 'Mithril Bar', description: 'A bar of pure mithril.', icon: '🧱', value: 250, type: 'resource' },
  'mithril_sword': { id: 'mithril_sword', name: 'Mithril Sword', description: 'A light and deadly blade.', icon: '⚔️', value: 1200, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 45, strength: 20 } },
  'adamant_ore': { id: 'adamant_ore', name: 'Adamant Ore', description: 'A hard, green ore.', icon: '🪨', value: 100, type: 'resource' },
  'adamant_bar': { id: 'adamant_bar', name: 'Adamant Bar', description: 'A bar of adamantite.', icon: '🧱', value: 600, type: 'resource' },
  'runite_ore': { id: 'runite_ore', name: 'Runite Ore', description: 'The rarest ore in the realm.', icon: '🪨', value: 500, type: 'resource' },
  'runite_bar': { id: 'runite_bar', name: 'Runite Bar', description: 'A bar of pure runite.', icon: '🧱', value: 3000, type: 'resource' },
  'silver_ore': { id: 'silver_ore', name: 'Silver Ore', description: 'A shiny white ore.', icon: '🪨', value: 30, type: 'resource' },
  'silver_bar': { id: 'silver_bar', name: 'Silver Bar', description: 'Pure silver.', icon: '🧱', value: 80, type: 'resource' },
  'platinum_ore': { id: 'platinum_ore', name: 'Platinum Ore', description: 'A very dense, precious ore.', icon: '🪨', value: 200, type: 'resource' },
  'platinum_bar': { id: 'platinum_bar', name: 'Platinum Bar', description: 'A bar of platinum.', icon: '🧱', value: 500, type: 'resource' },
  'obsidian': { id: 'obsidian', name: 'Obsidian', description: 'Volcanic glass.', icon: '🌑', value: 300, type: 'resource' },
  'gold_ore': { id: 'gold_ore', name: 'Gold Ore', description: 'Shiny and heavy.', icon: '🟡', value: 150, type: 'resource' },
  'gold_bar': { id: 'gold_bar', name: 'Gold Bar', description: 'Pure gold.', icon: '🟡', value: 400, type: 'resource' },
  'pearl': { id: 'pearl', name: 'Pearl', description: 'A beautiful sea gem.', icon: '⚪', value: 500, type: 'resource' },
  'ancient_bone': { id: 'ancient_bone', name: 'Ancient Bone', description: 'A relic from the past.', icon: '☠️', value: 1500, type: 'resource' },
  
  // Runecrafting & Magic
  'rune_essence': { id: 'rune_essence', name: 'Rune Essence', description: 'Uncharged magical stone.', icon: '🪨', value: 5, type: 'resource', skillHint: 'Mining / Runecrafting', farmHint: 'Mine Essence', usageHint: 'Craft into elemental runes.' },
  'air_rune': { id: 'air_rune', name: 'Air Rune', description: 'Used for basic wind spells.', icon: '🌪️', value: 10, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'mind_rune': { id: 'mind_rune', name: 'Mind Rune', description: 'Used for basic strike spells.', icon: '🧠', value: 15, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'water_rune': { id: 'water_rune', name: 'Water Rune', description: 'Used for water spells.', icon: '💧', value: 15, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'earth_rune': { id: 'earth_rune', name: 'Earth Rune', description: 'Used for earth spells.', icon: '🪨', value: 15, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'fire_rune': { id: 'fire_rune', name: 'Fire Rune', description: 'Used for fire spells.', icon: '🔥', value: 20, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'chaos_rune': { id: 'chaos_rune', name: 'Chaos Rune', description: 'Used for powerful bolt spells.', icon: '🌀', value: 50, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'death_rune': { id: 'death_rune', name: 'Death Rune', description: 'Used for deadly blast spells.', icon: '💀', value: 100, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'blood_rune': { id: 'blood_rune', name: 'Blood Rune', description: 'Used for ancient blood spells.', icon: '🩸', value: 200, type: 'resource', skillHint: 'Magic', usageHint: 'Consumed when casting magic spells.' },
  'nature_rune': { id: 'nature_rune', name: 'Nature Rune', description: 'Used for alchemy.', icon: '🌿', value: 60, type: 'resource', skillHint: 'Magic' },
  'law_rune': { id: 'law_rune', name: 'Law Rune', description: 'Used for teleportation.', icon: '⚖️', value: 80, type: 'resource', skillHint: 'Magic' },
  'cosmic_rune': { id: 'cosmic_rune', name: 'Cosmic Rune', description: 'Used for enchanting.', icon: '✨', value: 40, type: 'resource', skillHint: 'Magic' },
  'astral_rune': { id: 'astral_rune', name: 'Astral Rune', description: 'Used for lunar magic.', icon: '🌙', value: 70, type: 'resource', skillHint: 'Magic' },
  'soul_rune': { id: 'soul_rune', name: 'Soul Rune', description: 'Used for soul magic.', icon: '👻', value: 120, type: 'resource', skillHint: 'Magic' },
  
  // Thieving
  'coin_purse': { id: 'coin_purse', name: 'Coin Purse', description: 'A small bag of coins.', icon: '💰', value: 50, type: 'resource', skillHint: 'Thieving', usageHint: 'Sell for GP.' },
  'silk': { id: 'silk', name: 'Silk', description: 'Fine imported silk.', icon: '🧣', value: 100, type: 'resource', skillHint: 'Thieving', usageHint: 'Sell for GP.' },
  'lockpick': { id: 'lockpick', name: 'Lockpick', description: 'Used to crack safes.', icon: '🗝️', value: 250, type: 'resource', skillHint: 'Thieving', usageHint: 'Required to crack high-level safes.' },
  
  // Gems & Jewelry
  'uncut_sapphire': { id: 'uncut_sapphire', name: 'Uncut Sapphire', description: 'A raw sapphire.', icon: '💎', value: 100, type: 'resource' },
  'uncut_emerald': { id: 'uncut_emerald', name: 'Uncut Emerald', description: 'A raw emerald.', icon: '💎', value: 250, type: 'resource' },
  'uncut_ruby': { id: 'uncut_ruby', name: 'Uncut Ruby', description: 'A raw ruby.', icon: '💎', value: 500, type: 'resource' },
  'uncut_diamond': { id: 'uncut_diamond', name: 'Uncut Diamond', description: 'A raw diamond.', icon: '💎', value: 1000, type: 'resource' },
  'sapphire_ring': { id: 'sapphire_ring', name: 'Sapphire Ring', description: 'A beautiful ring.', icon: '💍', value: 500, type: 'equipment', equipmentSlot: 'ring', stats: { magic: 5 } },
  'emerald_amulet': { id: 'emerald_amulet', name: 'Emerald Amulet', description: 'A protective amulet.', icon: '📿', value: 1200, type: 'equipment', equipmentSlot: 'neck', stats: { defense: 10 } },
  'ruby_necklace': { id: 'ruby_necklace', name: 'Ruby Necklace', description: 'A necklace that glows with power.', icon: '📿', value: 2500, type: 'equipment', equipmentSlot: 'neck', stats: { strength: 15 } },
  'diamond_ring': { id: 'diamond_ring', name: 'Diamond Ring', description: 'A ring of pure brilliance.', icon: '💍', value: 6000, type: 'equipment', equipmentSlot: 'ring', stats: { magic: 20, defense: 10 } },
  'gold_ring': { id: 'gold_ring', name: 'Gold Ring', description: 'A simple gold ring.', icon: '💍', value: 800, type: 'equipment', equipmentSlot: 'ring', stats: { magic: 2 } },
  
  // Woodcutting & Fletching
  'willow_logs': { id: 'willow_logs', name: 'Willow Logs', description: 'Flexible willow logs.', icon: '🪵', value: 30, type: 'resource' },
  'maple_logs': { id: 'maple_logs', name: 'Maple Logs', description: 'Hard maple logs.', icon: '🪵', value: 60, type: 'resource' },
  'yew_logs': { id: 'yew_logs', name: 'Yew Logs', description: 'Ancient yew logs.', icon: '🪵', value: 150, type: 'resource' },
  'magic_logs': { id: 'magic_logs', name: 'Magic Logs', description: 'Logs that shimmer with energy.', icon: '🪵', value: 400, type: 'resource' },
  'blisterwood_logs': { id: 'blisterwood_logs', name: 'Blisterwood Logs', description: 'Vampire-slaying wood.', icon: '🪵', value: 180, type: 'resource' },
  'elder_logs': { id: 'elder_logs', name: 'Elder Logs', description: 'Logs from an ancient elder tree.', icon: '🪵', value: 500, type: 'resource' },
  'redwood_logs': { id: 'redwood_logs', name: 'Redwood Logs', description: 'Logs from a massive redwood tree.', icon: '🪵', value: 1000, type: 'resource' },
  'teak_logs': { id: 'teak_logs', name: 'Teak Logs', description: 'Hard teak wood.', icon: '🪵', value: 40, type: 'resource' },
  'mahogany_logs': { id: 'mahogany_logs', name: 'Mahogany Logs', description: 'Beautiful mahogany wood.', icon: '🪵', value: 80, type: 'resource' },
  'arctic_pine_logs': { id: 'arctic_pine_logs', name: 'Arctic Pine Logs', description: 'Cold-resistant pine.', icon: '🪵', value: 120, type: 'resource' },
  'flax': { id: 'flax', name: 'Flax', description: 'Can be spun into bowstring.', icon: '🌾', value: 5, type: 'resource', skillHint: 'Crafting', farmHint: 'Gather from Flax Fields' },
  'bowstring': { id: 'bowstring', name: 'Bowstring', description: 'Used to string bows.', icon: '🧵', value: 25, type: 'resource', skillHint: 'Crafting', farmHint: 'Spin from Flax' },
  'arrow_shafts': { id: 'arrow_shafts', name: 'Arrow Shafts', description: 'Used to make arrows.', icon: '🥢', value: 2, type: 'resource', skillHint: 'Crafting', farmHint: 'Fletch from Logs', usageHint: 'Combine with feathers and tips to make arrows.' },
  'feathers': { id: 'feathers', name: 'Feathers', description: 'Used for arrows.', icon: '🪶', value: 1, type: 'resource' },
  'bronze_arrows': { id: 'bronze_arrows', name: 'Bronze Arrows', description: 'Basic ammo.', icon: '🏹', value: 5, type: 'resource' },
  'iron_arrows': { id: 'iron_arrows', name: 'Iron Arrows', description: 'Sturdy ammo.', icon: '🏹', value: 12, type: 'resource' },
  'steel_arrows': { id: 'steel_arrows', name: 'Steel Arrows', description: 'Powerful ammo.', icon: '🏹', value: 25, type: 'resource' },
  'mithril_arrows': { id: 'mithril_arrows', name: 'Mithril Arrows', description: 'Lightweight ammo.', icon: '🏹', value: 60, type: 'resource' },
  'adamant_arrows': { id: 'adamant_arrows', name: 'Adamant Arrows', description: 'Devastating ammo.', icon: '🏹', value: 150, type: 'resource' },
  'runite_arrows': { id: 'runite_arrows', name: 'Runite Arrows', description: 'God-tier ammo.', icon: '🏹', value: 500, type: 'resource' },
  
  // Bows
  'shortbow_u': { id: 'shortbow_u', name: 'Unstrung Shortbow', description: 'An unstrung shortbow.', icon: '🏹', value: 10, type: 'resource' },
  'shortbow': { id: 'shortbow', name: 'Shortbow', description: 'A basic shortbow.', icon: '🏹', value: 50, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 10 } },
  'oak_shortbow_u': { id: 'oak_shortbow_u', name: 'Unstrung Oak Shortbow', description: 'An unstrung oak shortbow.', icon: '🏹', value: 20, type: 'resource' },
  'oak_shortbow': { id: 'oak_shortbow', name: 'Oak Shortbow', description: 'An oak shortbow.', icon: '🏹', value: 200, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 25 } },
  'willow_shortbow_u': { id: 'willow_shortbow_u', name: 'Unstrung Willow Shortbow', description: 'An unstrung willow shortbow.', icon: '🏹', value: 40, type: 'resource' },
  'willow_shortbow': { id: 'willow_shortbow', name: 'Willow Shortbow', description: 'A willow shortbow.', icon: '🏹', value: 400, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 40 } },
  'maple_shortbow_u': { id: 'maple_shortbow_u', name: 'Unstrung Maple Shortbow', description: 'An unstrung maple shortbow.', icon: '🏹', value: 80, type: 'resource' },
  'maple_shortbow': { id: 'maple_shortbow', name: 'Maple Shortbow', description: 'A maple shortbow.', icon: '🏹', value: 800, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 60 } },
  'yew_shortbow_u': { id: 'yew_shortbow_u', name: 'Unstrung Yew Shortbow', description: 'An unstrung yew shortbow.', icon: '🏹', value: 160, type: 'resource' },
  'yew_shortbow': { id: 'yew_shortbow', name: 'Yew Shortbow', description: 'A yew shortbow.', icon: '🏹', value: 1600, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 85 } },
  'magic_shortbow_u': { id: 'magic_shortbow_u', name: 'Unstrung Magic Shortbow', description: 'An unstrung magic shortbow.', icon: '🏹', value: 320, type: 'resource' },
  'magic_shortbow': { id: 'magic_shortbow', name: 'Magic Shortbow', description: 'A magic shortbow.', icon: '🏹', value: 3200, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 115 } },

  // Fishing & Cooking
  'raw_trout': { id: 'raw_trout', name: 'Raw Trout', description: 'A common river fish.', icon: '🐟', value: 15, type: 'resource' },
  'cooked_trout': { id: 'cooked_trout', name: 'Cooked Trout', description: 'Heals 5 HP.', icon: '🍣', value: 30, type: 'food' },
  'raw_salmon': { id: 'raw_salmon', name: 'Raw Salmon', description: 'A fatty river fish.', icon: '🐟', value: 30, type: 'resource' },
  'cooked_salmon': { id: 'cooked_salmon', name: 'Cooked Salmon', description: 'Heals 10 HP.', icon: '🍣', value: 60, type: 'food' },
  'raw_rainbow_trout': { id: 'raw_rainbow_trout', name: 'Raw Rainbow Trout', description: 'Colorful freshwater fish.', icon: '🐟', value: 20, type: 'resource' },
  'cooked_rainbow_trout': { id: 'cooked_rainbow_trout', name: 'Cooked Rainbow Trout', description: 'Heals 7 HP.', icon: '🍣', value: 45, type: 'food' },
  'raw_lobster': { id: 'raw_lobster', name: 'Raw Lobster', description: 'A prized crustacean.', icon: '🦞', value: 80, type: 'resource' },
  'cooked_lobster': { id: 'cooked_lobster', name: 'Cooked Lobster', description: 'Heals 25 HP.', icon: '🦞', value: 150, type: 'food' },
  'raw_shark': { id: 'raw_shark', name: 'Raw Shark', description: 'The ultimate catch.', icon: '🦈', value: 300, type: 'resource' },
  'cooked_shark': { id: 'cooked_shark', name: 'Cooked Shark', description: 'Heals 50 HP.', icon: '🦈', value: 600, type: 'food' },
  'raw_anglerfish': { id: 'raw_anglerfish', name: 'Raw Anglerfish', description: 'Deep sea fish.', icon: '🐟', value: 500, type: 'resource' },
  'cooked_anglerfish': { id: 'cooked_anglerfish', name: 'Cooked Anglerfish', description: 'Heals 22 HP, can boost max HP.', icon: '🍣', value: 1200, type: 'food' },
  'raw_dark_crab': { id: 'raw_dark_crab', name: 'Raw Dark Crab', description: 'Found in the deep wilderness.', icon: '🦀', value: 600, type: 'resource' },
  'cooked_dark_crab': { id: 'cooked_dark_crab', name: 'Cooked Dark Crab', description: 'Heals 22 HP.', icon: '🍣', value: 1500, type: 'food' },
  'dragon_meat': { id: 'dragon_meat', name: 'Dragon Meat', description: 'Legendary meat.', icon: '🥩', value: 500, type: 'food' },
  'cooked_dragon_meat': { id: 'cooked_dragon_meat', name: 'Cooked Dragon Meat', description: 'Heals 100 HP.', icon: '🍖', value: 1200, type: 'food' },

  // Hunting & Leatherworking
  'raw_meat': { id: 'raw_meat', name: 'Raw Meat', description: 'Needs cooking.', icon: '🥩', value: 5, type: 'food' },
  'fur': { id: 'fur', name: 'Fur', description: 'Soft animal fur.', icon: '🧶', value: 15, type: 'resource' },
  'fox_fur': { id: 'fox_fur', name: 'Fox Fur', description: 'Red fox fur.', icon: '🦊', value: 40, type: 'resource' },
  'boar_hide': { id: 'boar_hide', name: 'Boar Hide', description: 'Tough boar skin.', icon: '🐗', value: 60, type: 'resource' },
  'stag_antler': { id: 'stag_antler', name: 'Stag Antler', description: 'A sharp antler.', icon: '🦌', value: 100, type: 'resource' },
  'grizzly_claw': { id: 'grizzly_claw', name: 'Grizzly Claw', description: 'A massive claw.', icon: '🐻', value: 250, type: 'resource' },
  'mammoth_tusk': { id: 'mammoth_tusk', name: 'Mammoth Tusk', description: 'A giant ivory tusk.', icon: '🐘', value: 800, type: 'resource' },
  'wolf_fur': { id: 'wolf_fur', name: 'Wolf Fur', description: 'Thick wolf fur.', icon: '🐺', value: 100, type: 'resource' },
  'dragon_hide': { id: 'dragon_hide', name: 'Dragon Hide', description: 'Impenetrable hide.', icon: '🐲', value: 1000, type: 'resource' },
  'leather': { id: 'leather', name: 'Leather', description: 'Cured hide.', icon: '📜', value: 30, type: 'resource' },
  'leather_body': { id: 'leather_body', name: 'Leather Body', description: 'Basic armor.', icon: '👕', value: 100, type: 'equipment', equipmentSlot: 'body', stats: { defense: 5 } },
  'hard_leather': { id: 'hard_leather', name: 'Hard Leather', description: 'Reinforced hide.', icon: '📜', value: 80, type: 'resource' },
  'hard_leather_body': { id: 'hard_leather_body', name: 'Hard Leather Body', description: 'Sturdy armor.', icon: '👕', value: 350, type: 'equipment', equipmentSlot: 'body', stats: { defense: 15 } },
  'wolf_leather': { id: 'wolf_leather', name: 'Wolf Leather', description: 'Tough wolf leather.', icon: '📜', value: 250, type: 'resource' },
  'wolf_body': { id: 'wolf_body', name: 'Wolf Body', description: 'Warm and protective.', icon: '👕', value: 1200, type: 'equipment', equipmentSlot: 'body', stats: { defense: 35 } },
  'dragon_leather': { id: 'dragon_leather', name: 'Dragon Leather', description: 'The finest leather.', icon: '📜', value: 2000, type: 'resource' },
  'dragon_body': { id: 'dragon_body', name: 'Dragon Body', description: 'The ultimate leather armor.', icon: '👕', value: 10000, type: 'equipment', equipmentSlot: 'body', stats: { defense: 80 } },

  // Farming & Herblore
  'herbs': { id: 'herbs', name: 'Herbs', description: 'Wild herbs for potions.', icon: '🌿', value: 10, type: 'resource' },
  'vial_of_water': { id: 'vial_of_water', name: 'Vial of Water', description: 'Base for potions.', icon: '🧪', value: 5, type: 'resource' },
  'attack_potion': { id: 'attack_potion', name: 'Attack Potion', description: 'Boosts attack level.', icon: '🧪', value: 100, type: 'potion' },

  // ===== NEW: Unique Monster Signature Drops =====
  // Goblin uniques
  'goblin_mail': { id: 'goblin_mail', name: 'Goblin Mail', description: 'Crude but collectible armor from goblins.', icon: '👕', value: 25, type: 'equipment', rarity: 'uncommon', equipmentSlot: 'body', stats: { defense: 2 }, farmHint: 'Dropped by Goblins' },
  'goblin_champion_scroll': { id: 'goblin_champion_scroll', name: 'Goblin Champion Scroll', description: 'A rare challenge scroll from a goblin champion. Proof of your dominance.', icon: '📜', value: 50000, type: 'resource', rarity: 'legendary', farmHint: 'Extremely rare drop from Goblins (1/1000)' },

  // Wolf uniques
  'fang_necklace': { id: 'fang_necklace', name: 'Fang Necklace', description: 'A necklace strung with wolf fangs. Radiates primal energy.', icon: '📿', value: 5000, type: 'equipment', rarity: 'rare', equipmentSlot: 'neck', stats: { strength: 8, attack: 4 }, farmHint: 'Rare drop from Wolves' },
  'howl_essence': { id: 'howl_essence', name: 'Howl Essence', description: 'Crystallized wolf spirit. Used in primal crafting.', icon: '🌀', value: 500, type: 'resource', rarity: 'uncommon', usageHint: 'Combine with leather for Primal Armor pieces.' },

  // Zombie uniques
  'zombie_champion_scroll': { id: 'zombie_champion_scroll', name: 'Zombie Champion Scroll', description: 'A rotting scroll of undead challenge.', icon: '📜', value: 50000, type: 'resource', rarity: 'legendary', farmHint: 'Extremely rare drop from Zombies' },
  'undead_essence': { id: 'undead_essence', name: 'Undead Essence', description: 'Dark energy from the undead. Used in necromantic crafting.', icon: '💀', value: 200, type: 'resource', rarity: 'uncommon', usageHint: 'Used in Herblore for dark potions and Crafting for cursed items.' },

  // Dragon signature drops
  'draconic_visage': { id: 'draconic_visage', name: 'Draconic Visage', description: 'An ancient dragon face-plate. Can be smithed into a Dragonfire Shield.', icon: '🛡️', value: 500000, type: 'resource', rarity: 'legendary', skillHint: 'Smithing', usageHint: 'Smith into Dragonfire Shield (requires 90 Smithing).' },
  'dragon_claw_fragment': { id: 'dragon_claw_fragment', name: 'Dragon Claw Fragment', description: 'A shard of dragon talon. Collect 4 to forge Dragon Claws.', icon: '🦴', value: 25000, type: 'resource', rarity: 'rare', usageHint: 'Combine 4 fragments at 95 Smithing to forge Dragon Claws.' },
  'dragon_egg_shard': { id: 'dragon_egg_shard', name: 'Dragon Egg Shard', description: 'A fragment of a petrified dragon egg. Radiates ancient heat.', icon: '🥚', value: 75000, type: 'resource', rarity: 'epic', usageHint: 'Collect 3 shards to assemble a Dragon Egg at 99 Crafting.' },

  // Dragon crafted items
  'dragonfire_shield': { id: 'dragonfire_shield', name: 'Dragonfire Shield', description: 'A shield forged from a draconic visage. Absorbs dragonfire.', icon: '🛡️', value: 750000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'shield', stats: { defense: 60, strength: 10, magic: 10 }, farmHint: 'Smithed from Draconic Visage', socketable: true, sockets: 1 },
  'dragon_claws': { id: 'dragon_claws', name: 'Dragon Claws', description: 'Razor-sharp claws of pure dragonbone. Devastating special attack.', icon: '🦴', value: 350000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { attack: 80, strength: 60, speed: 0.2 }, farmHint: 'Smithed from 4 Dragon Claw Fragments', socketable: true, sockets: 2 },
  'dragon_egg': { id: 'dragon_egg', name: 'Dragon Egg', description: 'A reassembled petrified dragon egg. A trophy of immense value.', icon: '🥚', value: 1000000, type: 'resource', rarity: 'legendary', usageHint: 'Display trophy. Can be hatched at 99 Farming for Dragon Hatchling pet token.' },

  // Abyssal signature drops
  'abyssal_dagger': { id: 'abyssal_dagger', name: 'Abyssal Dagger', description: 'A dagger forged in the abyss. Attacks with otherworldly speed.', icon: '🗡️', value: 200000, type: 'equipment', rarity: 'epic', equipmentSlot: 'weapon', stats: { attack: 55, strength: 30, speed: 0.3 }, farmHint: 'Rare drop from Abyssal Demons' },
  'abyssal_bludgeon_piece': { id: 'abyssal_bludgeon_piece', name: 'Abyssal Bludgeon Piece', description: 'A fragment of the Abyssal Bludgeon. Collect 3 to assemble.', icon: '🔩', value: 100000, type: 'resource', rarity: 'epic', usageHint: 'Collect 3 pieces to assemble Abyssal Bludgeon at 90 Crafting.' },
  'abyssal_thread': { id: 'abyssal_thread', name: 'Abyssal Thread', description: 'Dark thread from the abyss. Used to weave powerful robes.', icon: '🧵', value: 5000, type: 'resource', rarity: 'rare', usageHint: 'Weave into Abyssal Robes at 85 Crafting.' },
  'abyssal_bludgeon': { id: 'abyssal_bludgeon', name: 'Abyssal Bludgeon', description: 'A massive weapon assembled from abyssal fragments.', icon: '🔨', value: 500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { attack: 30, strength: 95 }, farmHint: 'Assembled from 3 Abyssal Bludgeon Pieces', socketable: true, sockets: 1 },
  'abyssal_robe_top': { id: 'abyssal_robe_top', name: 'Abyssal Robe Top', description: 'Robes woven from the fabric of the abyss.', icon: '👘', value: 50000, type: 'equipment', rarity: 'rare', equipmentSlot: 'body', stats: { magic: 45, defense: 20 }, setBonus: { setId: 'abyssal', piecesRequired: 2, bonus: { magic: 15, speed: 0.1 } } },
  'abyssal_robe_legs': { id: 'abyssal_robe_legs', name: 'Abyssal Robe Legs', description: 'Dark leggings that shift like shadows.', icon: '👖', value: 50000, type: 'equipment', rarity: 'rare', equipmentSlot: 'legs', stats: { magic: 35, defense: 15 }, setBonus: { setId: 'abyssal', piecesRequired: 2, bonus: { magic: 15, speed: 0.1 } } },

  // Vampire signature drops
  'blood_diamond': { id: 'blood_diamond', name: 'Blood Diamond', description: 'A diamond stained with eternal blood. Pulses with dark energy.', icon: '💎', value: 50000, type: 'resource', rarity: 'epic', usageHint: 'Craft into Blood Diamond Ring at 80 Crafting (+luck, +hp).' },
  'vampire_fang': { id: 'vampire_fang', name: 'Vampire Fang', description: 'A sharp fang from a vampire. Used in dark potions.', icon: '🦷', value: 2000, type: 'resource', rarity: 'uncommon', usageHint: 'Used in Herblore for Vampyrism Potion.' },
  'blood_shard': { id: 'blood_shard', name: 'Blood Shard', description: 'A crystallized drop of ancient vampire blood. Incredibly valuable.', icon: '🩸', value: 250000, type: 'resource', rarity: 'legendary', usageHint: 'Attach to Amulet of Fury for Blood Fury variant.' },
  'sanguinesti_staff_piece': { id: 'sanguinesti_staff_piece', name: 'Sanguinesti Staff Piece', description: 'A component of the legendary blood staff. Collect 3 to assemble.', icon: '🔮', value: 500000, type: 'resource', rarity: 'legendary', usageHint: 'Collect 3 to assemble Sanguinesti Staff at 95 Crafting.' },
  'blood_diamond_ring': { id: 'blood_diamond_ring', name: 'Blood Diamond Ring', description: 'A ring set with a blood diamond. Drains life from foes.', icon: '💍', value: 100000, type: 'equipment', rarity: 'epic', equipmentSlot: 'ring', stats: { luck: 15, health: 20, strength: 5 } },
  'vampyrism_potion': { id: 'vampyrism_potion', name: 'Vampyrism Potion', description: 'Grants life steal for 100 actions. Heal 5% of damage dealt.', icon: '🧪', value: 15000, type: 'potion', rarity: 'rare' },
  'sanguinesti_staff': { id: 'sanguinesti_staff', name: 'Sanguinesti Staff', description: 'The legendary blood staff. Heals you as it damages enemies.', icon: '🔮', value: 2000000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { magic: 95, health: 30 }, farmHint: 'Assembled from 3 Sanguinesti Staff Pieces', socketable: true, sockets: 2 },

  // Hellhound signature drops
  'smouldering_stone': { id: 'smouldering_stone', name: 'Smouldering Stone', description: 'A stone that burns eternally. Used to upgrade tools.', icon: '🔥', value: 100000, type: 'resource', rarity: 'epic', usageHint: 'Combine with Dragon tools to create Infernal tools.' },
  'hellfire_metal': { id: 'hellfire_metal', name: 'Hellfire Metal', description: 'Metal tempered in hellfire. Extremely hot to the touch.', icon: '🔴', value: 10000, type: 'resource', rarity: 'rare', usageHint: 'Used in Smithing for Hellfire equipment.' },
  'infernal_thread': { id: 'infernal_thread', name: 'Infernal Thread', description: 'Thread spun from hellfire. Burns those unworthy.', icon: '🧵', value: 20000, type: 'resource', rarity: 'rare', usageHint: 'Used in Crafting for Infernal Robes.' },
  'hellfire_sword': { id: 'hellfire_sword', name: 'Hellfire Sword', description: 'A blade that burns with eternal flame.', icon: '⚔️', value: 200000, type: 'equipment', rarity: 'epic', equipmentSlot: 'weapon', stats: { attack: 65, strength: 45 }, farmHint: 'Smithed from Hellfire Metal' },

  // Void signature drops
  'void_sigil': { id: 'void_sigil', name: 'Void Sigil', description: 'A sigil from the void. Hums with emptiness.', icon: '🔣', value: 50000, type: 'resource', rarity: 'epic', usageHint: 'Combine 3 Void Sigils with Void Crystal at 90 Crafting for Void Knight pieces.' },
  'void_crystal': { id: 'void_crystal', name: 'Void Crystal', description: 'A crystal that absorbs light. Used in void crafting.', icon: '💠', value: 25000, type: 'resource', rarity: 'rare', usageHint: 'Core component for Void Knight equipment.' },
  'void_walker_emblem': { id: 'void_walker_emblem', name: 'Void Walker Emblem', description: 'Proof you survived the void. Opens the path to the Void Citadel.', icon: '🏅', value: 500000, type: 'resource', rarity: 'legendary', farmHint: 'Extremely rare drop from Void creatures' },

  // Boss signature drops
  'tanzanite_fang': { id: 'tanzanite_fang', name: 'Venomspine Fang', description: 'A fang from the Voidmother. Used to create the Venom Spitter.', icon: '🐍', value: 300000, type: 'resource', rarity: 'legendary', usageHint: 'Craft into Venom Spitter at 90 Crafting.' },
  'magic_fang': { id: 'magic_fang', name: 'Corrupted Fang', description: 'A venomous fang imbued with abyssal magic.', icon: '🐍', value: 300000, type: 'resource', rarity: 'legendary', usageHint: 'Craft into Trident of the Deep at 90 Crafting.' },
  'serpentine_scale': { id: 'serpentine_scale', name: 'Abyssal Scale', description: 'Scales from the Voidmother. Used for abyssal equipment.', icon: '🐍', value: 5000, type: 'resource', rarity: 'uncommon', usageHint: 'Craft into Abyssal Visage at 75 Crafting (20 scales).' },
  'vorkath_head': { id: 'vorkath_head', name: "Stormwarden's Crest", description: 'The severed crest of the Stormwarden. A legendary trophy.', icon: '🐲', value: 200000, type: 'resource', rarity: 'epic', usageHint: 'Mount as a trophy or use to upgrade gear.' },
  'dragonbone_necklace_piece': { id: 'dragonbone_necklace_piece', name: 'Dragonbone Necklace Piece', description: 'Part of a dragonbone necklace. Collect 2 to assemble.', icon: '📿', value: 50000, type: 'resource', rarity: 'rare' },
  'skeletal_visage': { id: 'skeletal_visage', name: 'Skeletal Visage', description: 'A spectral shield face. Smith into Skeletal Wyvern Shield.', icon: '🛡️', value: 400000, type: 'resource', rarity: 'legendary', usageHint: 'Smith into Ancient Wyvern Shield at 92 Smithing.' },
  'hydra_leather': { id: 'hydra_leather', name: 'Wyrm Hide', description: 'Hide from the Ashen Wyrm. Incredibly tough and fire-resistant.', icon: '📜', value: 30000, type: 'resource', rarity: 'rare', usageHint: 'Craft into Wyrm Grips at 85 Crafting.' },
  'hydra_fang': { id: 'hydra_fang', name: 'Wyrm Fang', description: 'A venomous fang from the Ashen Wyrm.', icon: '🦷', value: 50000, type: 'resource', rarity: 'epic' },
  'hydra_claw': { id: 'hydra_claw', name: 'Ashen Talon', description: 'A massive claw from the Elder Wyrm.', icon: '🦴', value: 500000, type: 'resource', rarity: 'legendary', usageHint: 'Attach to Imperial Lance at 95 Smithing.' },
  'hydra_heart': { id: 'hydra_heart', name: 'Molten Core', description: 'The still-burning core of the Elder Wyrm.', icon: '❤️', value: 1000000, type: 'resource', rarity: 'legendary', usageHint: 'Imbue into Sovereign Ring at 99 Crafting.' },
  'crystal_seed': { id: 'crystal_seed', name: 'Crystal Seed', description: 'An elven crystal seed. Can be shaped into weapons.', icon: '💎', value: 100000, type: 'resource', rarity: 'epic', usageHint: 'Craft into Crystal Bow or Crystal Shield at 85 Crafting.' },
  'elven_signet': { id: 'elven_signet', name: 'Elven Signet', description: 'A sacred elven ring. Grants favor with the elves.', icon: '💍', value: 300000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'ring', stats: { luck: 25, magic: 15, speed: 0.1 }, farmHint: 'Extremely rare drop from Elves' },
  'granite_maul_handle': { id: 'granite_maul_handle', name: 'Granite Maul Handle', description: 'A heavy granite handle. Combine with granite for Granite Maul.', icon: '🪨', value: 20000, type: 'resource', rarity: 'rare' },
  'gargoyle_heart': { id: 'gargoyle_heart', name: 'Gargoyle Heart', description: 'A stone heart that still beats. Dark and ancient.', icon: '🪨', value: 100000, type: 'resource', rarity: 'epic' },
  'cave_horror_fang': { id: 'cave_horror_fang', name: 'Cave Horror Fang', description: 'A twisted fang dripping with cave venom.', icon: '🦷', value: 10000, type: 'resource', rarity: 'rare' },
  'dust_battlestaff_piece': { id: 'dust_battlestaff_piece', name: 'Dust Battlestaff Piece', description: 'Part of a dust battlestaff. Collect 2 to assemble.', icon: '🔮', value: 50000, type: 'resource', rarity: 'rare' },
  'smoke_battlestaff_piece': { id: 'smoke_battlestaff_piece', name: 'Smoke Battlestaff Piece', description: 'Part of a smoke battlestaff. Collect 2 to assemble.', icon: '🔮', value: 50000, type: 'resource', rarity: 'rare' },

  // Raid signature drops
  'avernic_defender_hilt': { id: 'avernic_defender_hilt', name: 'Avernic Defender Hilt', description: 'Hilt from the Theatre of Blood. Upgrades Dragon Defender.', icon: '🛡️', value: 750000, type: 'resource', rarity: 'legendary' },
  'ghrazi_rapier': { id: 'ghrazi_rapier', name: 'Ghrazi Rapier', description: 'The fastest melee weapon. Thrusts with vampiric precision.', icon: '🗡️', value: 1500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { attack: 90, strength: 50, speed: 0.3 }, farmHint: 'Rare drop from Theatre of Blood', socketable: true, sockets: 2 },
  'twisted_bow_limb': { id: 'twisted_bow_limb', name: 'Twisted Bow Limb', description: 'A limb of the legendary Twisted Bow. Collect 2 to assemble.', icon: '🏹', value: 500000, type: 'resource', rarity: 'legendary' },
  'elder_maul_shaft': { id: 'elder_maul_shaft', name: 'Elder Maul Shaft', description: 'Shaft of the Elder Maul. Combine with Elder Maul Head.', icon: '🔨', value: 200000, type: 'resource', rarity: 'epic' },
  'kodai_insignia': { id: 'kodai_insignia', name: 'Kodai Insignia', description: 'Magical insignia from Chambers of Xeric.', icon: '🔮', value: 300000, type: 'resource', rarity: 'epic' },
  'twisted_bow': { id: 'twisted_bow', name: 'Twisted Bow', description: 'THE legendary bow. Stronger against high-magic foes.', icon: '🏹', value: 5000000, type: 'equipment', rarity: 'celestial', equipmentSlot: 'weapon', stats: { ranged: 120, speed: 0.2, luck: 10 }, farmHint: 'Assembled from 2 Twisted Bow Limbs', socketable: true, sockets: 3 },

  // Crafted boss gear
  'toxic_blowpipe': { id: 'toxic_blowpipe', name: 'Venom Spitter', description: 'A venomous ranged weapon crafted from Voidmother fang.', icon: '🐍', value: 500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { ranged: 80, speed: 0.4 } },
  'trident_of_swamp': { id: 'trident_of_swamp', name: 'Trident of the Deep', description: 'A powered staff dripping with abyssal venom.', icon: '🔱', value: 500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { magic: 85, speed: 0.2 } },
  'serpentine_helm': { id: 'serpentine_helm', name: 'Abyssal Visage', description: 'A helm crafted from abyssal scales. Provides venom immunity.', icon: '⛑️', value: 200000, type: 'equipment', rarity: 'epic', equipmentSlot: 'head', stats: { defense: 40, strength: 5 } },
  'ferocious_gloves': { id: 'ferocious_gloves', name: 'Wyrm Grips', description: 'Gloves of immense power crafted from wyrm hide.', icon: '🧤', value: 150000, type: 'equipment', rarity: 'epic', equipmentSlot: 'hands', stats: { attack: 20, strength: 20, defense: 10 } },
  'crystal_bow': { id: 'crystal_bow', name: 'Crystal Bow', description: 'An elven bow that fires arrows of light.', icon: '🏹', value: 250000, type: 'equipment', rarity: 'epic', equipmentSlot: 'weapon', stats: { ranged: 75, magic: 10 } },

  // Primal crafting chain (wolf -> leather -> armor)
  'primal_leather': { id: 'primal_leather', name: 'Primal Leather', description: 'Leather infused with primal wolf essence.', icon: '📜', value: 2000, type: 'resource', rarity: 'uncommon', usageHint: 'Craft into Primal armor at 60+ Crafting.' },
  'primal_body': { id: 'primal_body', name: 'Primal Body', description: 'Armor pulsing with primal energy.', icon: '👕', value: 15000, type: 'equipment', rarity: 'rare', equipmentSlot: 'body', stats: { defense: 45, strength: 10, speed: 0.05 } },
  'primal_legs': { id: 'primal_legs', name: 'Primal Legs', description: 'Leggings that enhance agility.', icon: '👖', value: 12000, type: 'equipment', rarity: 'rare', equipmentSlot: 'legs', stats: { defense: 35, speed: 0.1 } },

  // Enchanting chain (magic scrap -> enchanted items)
  'enchanted_ruby': { id: 'enchanted_ruby', name: 'Enchanted Ruby', description: 'A ruby infused with magical energy.', icon: '💎', value: 5000, type: 'resource', rarity: 'rare', usageHint: 'Used in high-level jewelry crafting.' },
  'enchanted_diamond': { id: 'enchanted_diamond', name: 'Enchanted Diamond', description: 'A diamond radiating pure magic.', icon: '💎', value: 15000, type: 'resource', rarity: 'epic' },

  // XP boost food chain
  'wilderness_stew': { id: 'wilderness_stew', name: 'Wilderness Stew', description: 'A hearty stew that boosts all skills temporarily.', icon: '🍲', value: 5000, type: 'food', rarity: 'rare', usageHint: '+10% XP for 20 actions when eaten.' },
  'dragon_feast': { id: 'dragon_feast', name: 'Dragon Feast', description: 'A legendary meal of dragon meat and rare spices.', icon: '🍖', value: 25000, type: 'food', rarity: 'epic', usageHint: '+25% XP and +15% speed for 50 actions.' },
  'strength_potion': { id: 'strength_potion', name: 'Strength Potion', description: 'Boosts strength level.', icon: '🧪', value: 250, type: 'potion' },
  'defense_potion': { id: 'defense_potion', name: 'Defense Potion', description: 'Boosts defense level.', icon: '🧪', value: 500, type: 'potion' },
  'energy_potion': { id: 'energy_potion', name: 'Energy Potion', description: 'Restores run energy.', icon: '🧪', value: 400, type: 'potion' },
  'super_defense': { id: 'super_defense', name: 'Super Defense', description: 'Greatly boosts defense.', icon: '🧪', value: 2000, type: 'potion' },
  'super_energy': { id: 'super_energy', name: 'Super Energy', description: 'Greatly restores run energy.', icon: '🧪', value: 1200, type: 'potion' },
  'saradomin_brew': { id: 'saradomin_brew', name: 'Saradomin Brew', description: 'Heals HP and boosts defense.', icon: '🧪', value: 5000, type: 'potion' },
  'bird_nest': { id: 'bird_nest', name: 'Bird Nest', description: 'Found in trees, contains seeds.', icon: '🪹', value: 50, type: 'resource' },
  'flax_seeds': { id: 'flax_seeds', name: 'Flax Seeds', description: 'Plant to grow flax.', icon: '🌱', value: 2, type: 'resource' },
  'wheat_seeds': { id: 'wheat_seeds', name: 'Wheat Seeds', description: 'Plant to grow wheat.', icon: '🌱', value: 1, type: 'resource' },
  'wheat': { id: 'wheat', name: 'Wheat', description: 'Can be milled into flour.', icon: '🌾', value: 5, type: 'resource' },
  'flour': { id: 'flour', name: 'Flour', description: 'Used for baking.', icon: '🥡', value: 10, type: 'resource' },
  'dough': { id: 'dough', name: 'Dough', description: 'Ready to be baked.', icon: '🥟', value: 15, type: 'resource' },
  'bread': { id: 'bread', name: 'Bread', description: 'Freshly baked bread.', icon: '🍞', value: 25, type: 'food' },
  'grape_seeds': { id: 'grape_seeds', name: 'Grape Seeds', description: 'Plant to grow grapes.', icon: '🌱', value: 5, type: 'resource' },
  'grapes': { id: 'grapes', name: 'Grapes', description: 'Juicy grapes.', icon: '🍇', value: 15, type: 'resource' },
  'wine': { id: 'wine', name: 'Wine', description: 'A fine vintage.', icon: '🍷', value: 50, type: 'food' },
  'potato_seeds': { id: 'potato_seeds', name: 'Potato Seeds', description: 'Plant these.', icon: '🌱', value: 2, type: 'resource' },
  'raw_potato': { id: 'raw_potato', name: 'Raw Potato', description: 'A humble vegetable.', icon: '🥔', value: 10, type: 'food' },
  'tomato_seeds': { id: 'tomato_seeds', name: 'Tomato Seeds', description: 'Grows juicy tomatoes.', icon: '🌱', value: 8, type: 'resource' },
  'raw_tomato': { id: 'raw_tomato', name: 'Raw Tomato', description: 'Red and ripe.', icon: '🍅', value: 20, type: 'food' },
  'cabbage_seeds': { id: 'cabbage_seeds', name: 'Cabbage Seeds', description: 'Grows leafy cabbage.', icon: '🌱', value: 12, type: 'resource' },
  'raw_cabbage': { id: 'raw_cabbage', name: 'Raw Cabbage', description: 'Good for soup.', icon: '🥬', value: 30, type: 'food' },
  'corn_seeds': { id: 'corn_seeds', name: 'Corn Seeds', description: 'Grows tall corn.', icon: '🌱', value: 25, type: 'resource' },
  'raw_corn': { id: 'raw_corn', name: 'Raw Corn', description: 'Sweet on the cob.', icon: '🌽', value: 60, type: 'food' },
  'watermelon_seeds': { id: 'watermelon_seeds', name: 'Watermelon Seeds', description: 'Grows heavy watermelons.', icon: '🌱', value: 100, type: 'resource' },
  'raw_watermelon': { id: 'raw_watermelon', name: 'Raw Watermelon', description: 'Refreshing.', icon: '🍉', value: 250, type: 'food' },
  'strawberry_seeds': { id: 'strawberry_seeds', name: 'Strawberry Seeds', description: 'Grows sweet strawberries.', icon: '🌱', value: 40, type: 'resource' },
  'raw_strawberry': { id: 'raw_strawberry', name: 'Raw Strawberry', description: 'Sweet and red.', icon: '🍓', value: 80, type: 'food' },
  'papaya_seeds': { id: 'papaya_seeds', name: 'Papaya Seeds', description: 'Grows tropical papaya.', icon: '🌱', value: 150, type: 'resource' },
  'raw_papaya': { id: 'raw_papaya', name: 'Raw Papaya', description: 'Tropical fruit.', icon: '🥭', value: 300, type: 'food' },
  'palm_seeds': { id: 'palm_seeds', name: 'Palm Seeds', description: 'Grows palm trees.', icon: '🌱', value: 400, type: 'resource' },
  'coconut': { id: 'coconut', name: 'Coconut', description: 'Hard-shelled fruit.', icon: '🥥', value: 500, type: 'food' },
  'dragonfruit_seeds': { id: 'dragonfruit_seeds', name: 'Dragonfruit Seeds', description: 'Grows exotic dragonfruit.', icon: '🌱', value: 800, type: 'resource' },
  'raw_dragonfruit': { id: 'raw_dragonfruit', name: 'Raw Dragonfruit', description: 'Exotic and vibrant.', icon: '🌵', value: 1500, type: 'food' },
  'onion_seeds': { id: 'onion_seeds', name: 'Onion Seeds', description: 'Grows sharp onions.', icon: '🌱', value: 5, type: 'resource' },
  'raw_onion': { id: 'raw_onion', name: 'Raw Onion', description: 'Watch your eyes.', icon: '🧅', value: 25, type: 'food' },
  'willow_seeds': { id: 'willow_seeds', name: 'Willow Seeds', description: 'Grows willow trees.', icon: '🌱', value: 100, type: 'resource' },
  'yew_seeds': { id: 'yew_seeds', name: 'Yew Seeds', description: 'Grows yew trees.', icon: '🌱', value: 500, type: 'resource' },
  'herb_seeds': { id: 'herb_seeds', name: 'Herb Seeds', description: 'Grows into herbs.', icon: '🌱', value: 20, type: 'resource' },
  'magic_seeds': { id: 'magic_seeds', name: 'Magic Seeds', description: 'Extremely rare seeds.', icon: '✨', value: 500, type: 'resource' },

  // Combat Tokens
  'mark_of_grace': { id: 'mark_of_grace', name: 'Mark of Grace', description: 'A token of agility prowess.', icon: '🏅', value: 100, type: 'resource' },
  'bronze_axe': { id: 'bronze_axe', name: 'Bronze Axe', description: 'A basic axe for woodcutting. Increases speed by 5%.', icon: '🪓', value: 100, type: 'tool', rarity: 'common', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.05, xpMultiplier: 1 } },
  'iron_axe': { id: 'iron_axe', name: 'Iron Axe', description: 'A stronger axe for woodcutting. Increases speed by 10%.', icon: '🪓', value: 500, type: 'tool', rarity: 'uncommon', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.1, xpMultiplier: 1 } },
  'steel_axe': { id: 'steel_axe', name: 'Steel Axe', description: 'A durable axe for woodcutting. Increases speed by 15% and XP by 5%.', icon: '🪓', value: 2000, type: 'tool', rarity: 'uncommon', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.15, xpMultiplier: 1.05 } },
  'mithril_axe': { id: 'mithril_axe', name: 'Mithril Axe', description: 'Lightweight and sharp. Increases speed by 20% and XP by 10%.', icon: '🪓', value: 8000, type: 'tool', rarity: 'rare', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.2, xpMultiplier: 1.1 } },
  'adamant_axe': { id: 'adamant_axe', name: 'Adamant Axe', description: 'Heavy and powerful. Increases speed by 25% and XP by 15%.', icon: '🪓', value: 25000, type: 'tool', rarity: 'rare', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.25, xpMultiplier: 1.15 } },
  'rune_axe': { id: 'rune_axe', name: 'Rune Axe', description: 'The finest woodcutting tool. Increases speed by 35% and XP by 20%.', icon: '🪓', value: 100000, type: 'tool', rarity: 'epic', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.35, xpMultiplier: 1.2 } },
  'dragon_axe': { id: 'dragon_axe', name: 'Dragon Axe', description: 'Forged in dragon fire. Increases speed by 50% and XP by 25%.', icon: '🪓', value: 500000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.5, xpMultiplier: 1.25 } },

  'bronze_pickaxe': { id: 'bronze_pickaxe', name: 'Bronze Pickaxe', description: 'A basic pickaxe for mining. Increases speed by 5%.', icon: '⛏️', value: 100, type: 'tool', rarity: 'common', toolBonus: { skillId: 'mining', speedMultiplier: 1.05, xpMultiplier: 1 } },
  'iron_pickaxe': { id: 'iron_pickaxe', name: 'Iron Pickaxe', description: 'A stronger pickaxe for mining. Increases speed by 10%.', icon: '⛏️', value: 500, type: 'tool', rarity: 'uncommon', toolBonus: { skillId: 'mining', speedMultiplier: 1.1, xpMultiplier: 1 } },
  'steel_pickaxe': { id: 'steel_pickaxe', name: 'Steel Pickaxe', description: 'A durable pickaxe for mining. Increases speed by 15% and XP by 5%.', icon: '⛏️', value: 2000, type: 'tool', rarity: 'uncommon', toolBonus: { skillId: 'mining', speedMultiplier: 1.15, xpMultiplier: 1.05 } },
  'mithril_pickaxe': { id: 'mithril_pickaxe', name: 'Mithril Pickaxe', description: 'Lightweight and sharp. Increases speed by 20% and XP by 10%.', icon: '⛏️', value: 8000, type: 'tool', rarity: 'rare', toolBonus: { skillId: 'mining', speedMultiplier: 1.2, xpMultiplier: 1.1 } },
  'adamant_pickaxe': { id: 'adamant_pickaxe', name: 'Adamant Pickaxe', description: 'Heavy and powerful. Increases speed by 25% and XP by 15%.', icon: '⛏️', value: 25000, type: 'tool', rarity: 'rare', toolBonus: { skillId: 'mining', speedMultiplier: 1.25, xpMultiplier: 1.15 } },
  'rune_pickaxe': { id: 'rune_pickaxe', name: 'Rune Pickaxe', description: 'The finest mining tool. Increases speed by 35% and XP by 20%.', icon: '⛏️', value: 100000, type: 'tool', rarity: 'epic', toolBonus: { skillId: 'mining', speedMultiplier: 1.35, xpMultiplier: 1.2 } },
  'dragon_pickaxe': { id: 'dragon_pickaxe', name: 'Dragon Pickaxe', description: 'Forged in dragon fire. Increases speed by 50% and XP by 25%.', icon: '⛏️', value: 500000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'mining', speedMultiplier: 1.5, xpMultiplier: 1.25 } },

  'small_fishing_net': { id: 'small_fishing_net', name: 'Small Fishing Net', description: 'Used for catching small fish. Increases speed by 5%.', icon: '🕸️', value: 50, type: 'tool', rarity: 'common', toolBonus: { skillId: 'fishing', speedMultiplier: 1.05, xpMultiplier: 1 } },
  'fishing_rod': { id: 'fishing_rod', name: 'Fishing Rod', description: 'Used for catching river fish. Increases speed by 10%.', icon: '🎣', value: 150, type: 'tool', rarity: 'uncommon', toolBonus: { skillId: 'fishing', speedMultiplier: 1.1, xpMultiplier: 1 } },
  'harpoon': { id: 'harpoon', name: 'Harpoon', description: 'Used for catching large fish. Increases speed by 15%.', icon: '🔱', value: 500, type: 'tool', rarity: 'uncommon', toolBonus: { skillId: 'fishing', speedMultiplier: 1.15, xpMultiplier: 1 } },
  'dragon_harpoon': { id: 'dragon_harpoon', name: 'Dragon Harpoon', description: 'The ultimate fishing tool. Increases speed by 40% and XP by 20%.', icon: '🔱', value: 250000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'fishing', speedMultiplier: 1.4, xpMultiplier: 1.2 } },

  'tinderbox': { id: 'tinderbox', name: 'Tinderbox', description: 'Used to light fires.', icon: '🔥', value: 50, type: 'tool', rarity: 'common' },
  'hammer': { id: 'hammer', name: 'Hammer', description: 'Essential for smithing.', icon: '🔨', value: 50, type: 'tool', rarity: 'common' },
  'chisel': { id: 'chisel', name: 'Chisel', description: 'Used for crafting gems and construction.', icon: '🪚', value: 50, type: 'tool', rarity: 'common' },
  'needle': { id: 'needle', name: 'Needle', description: 'Used for leatherworking.', icon: '🪡', value: 10, type: 'tool', rarity: 'common' },
  'thread': { id: 'thread', name: 'Thread', description: 'Used with a needle.', icon: '🧵', value: 1, type: 'resource', rarity: 'common' },

  'charcoal': { id: 'charcoal', name: 'Charcoal', description: 'High-quality fuel for smithing. Increases speed by 10%.', icon: '🌑', value: 20, type: 'resource', rarity: 'common', usageHint: 'Use in advanced smithing recipes.' },
  'magic_charcoal': { id: 'magic_charcoal', name: 'Magic Charcoal', description: 'Magically infused fuel. Increases speed by 25%.', icon: '✨', value: 100, type: 'resource', rarity: 'rare', usageHint: 'Required for dragonite and necrite smithing.' },
  'graceful_hood': { id: 'graceful_hood', name: 'Graceful Hood', description: 'Reduces weight and boosts run energy.', icon: '🧥', value: 5000, type: 'equipment', equipmentSlot: 'head', stats: { defense: 2 } },
  'graceful_cape': { id: 'graceful_cape', name: 'Graceful Cape', description: 'Reduces weight and boosts run energy.', icon: '🧥', value: 5000, type: 'equipment', equipmentSlot: 'cape', stats: { defense: 2 } },
  'graceful_top': { id: 'graceful_top', name: 'Graceful Top', description: 'Reduces weight and boosts run energy.', icon: '👕', value: 5000, type: 'equipment', equipmentSlot: 'body', stats: { defense: 5 } },
  'graceful_legs': { id: 'graceful_legs', name: 'Graceful Legs', description: 'Reduces weight and boosts run energy.', icon: '👖', value: 5000, type: 'equipment', equipmentSlot: 'legs', stats: { defense: 5 } },
  'graceful_gloves': { id: 'graceful_gloves', name: 'Graceful Gloves', description: 'Reduces weight and boosts run energy.', icon: '🧤', value: 5000, type: 'equipment', equipmentSlot: 'hands', stats: { defense: 1 } },
  'graceful_boots': { id: 'graceful_boots', name: 'Graceful Boots', description: 'Reduces weight and boosts run energy.', icon: '🥾', value: 5000, type: 'equipment', equipmentSlot: 'feet', stats: { defense: 1 } },
  'agility_potion': { id: 'agility_potion', name: 'Agility Potion', description: 'Boosts agility level.', icon: '🧪', value: 300, type: 'potion' },
  'toadflax': { id: 'toadflax', name: 'Toadflax', description: 'A medicinal herb.', icon: '🌿', value: 40, type: 'resource' },
  'toads_legs': { id: 'toads_legs', name: 'Toads Legs', description: 'Used in agility potions.', icon: '🐸', value: 20, type: 'resource' },
  'toadflax_seeds': { id: 'toadflax_seeds', name: 'Toadflax Seeds', description: 'Plant to grow toadflax.', icon: '🌱', value: 15, type: 'resource' },
  'combat_token': { id: 'combat_token', name: 'Combat Token', description: 'Proof of martial prowess.', icon: '🎖️', value: 0, type: 'resource' },
  'bones': { id: 'bones', name: 'Bones', description: 'Standard animal bones.', icon: '🦴', value: 5, type: 'resource', skillHint: 'Prayer', farmHint: 'Goblins, Rats, Skeletons', usageHint: 'Bury them for XP or use them in rituals.' },
  'rat_tail': { id: 'rat_tail', name: 'Rat Tail', description: 'Gross.', icon: '🐀', value: 5, type: 'resource', skillHint: 'Herblore', farmHint: 'Giant Rats', usageHint: 'Used in low-level potions.' },
  'skeleton_shard': { id: 'skeleton_shard', name: 'Skeleton Shard', description: 'A piece of bone.', icon: '🦴', value: 20, type: 'resource' },
  'ectoplasm': { id: 'ectoplasm', name: 'Ectoplasm', description: 'Ghostly goo.', icon: '👻', value: 50, type: 'resource' },
  'spider_venom': { id: 'spider_venom', name: 'Spider Venom', description: 'Highly toxic.', icon: '🧪', value: 80, type: 'resource' },
  'giant_toe': { id: 'giant_toe', name: 'Giant Toe', description: 'Used in giant-toe-soup.', icon: '🦶', value: 150, type: 'resource' },
  'demon_horn': { id: 'demon_horn', name: 'Demon Horn', description: 'Hot to the touch.', icon: '😈', value: 500, type: 'resource' },
  'gargoyle_granite': { id: 'gargoyle_granite', name: 'Gargoyle Granite', description: 'Extremely hard stone.', icon: '🪨', value: 800, type: 'resource' },
  'abyssal_whip': { id: 'abyssal_whip', name: 'Netherlash', description: 'A living weapon from the abyss.', icon: '🐍', value: 50000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 80, strength: 40 } },
  'big_bones': { id: 'big_bones', name: 'Big Bones', description: 'Large, heavy bones.', icon: '🦴', value: 30, type: 'resource' },
  'dragon_bones': { id: 'dragon_bones', name: 'Dragon Bones', description: 'Bones that hum with power.', icon: '🦴', value: 500, type: 'resource' },
  // goblin_mail defined in new items section below
  'zombie_brain': { id: 'zombie_brain', name: 'Zombie Brain', description: 'Surprisingly squishy.', icon: '🧠', value: 50, type: 'resource' },
  'ogre_tooth': { id: 'ogre_tooth', name: 'Ogre Tooth', description: 'A massive yellowed tooth.', icon: '🦷', value: 200, type: 'resource' },
  'elf_dust': { id: 'elf_dust', name: 'Elf Dust', description: 'Magical residue.', icon: '✨', value: 400, type: 'resource' },
  'dragon_scale': { id: 'dragon_scale', name: 'Dragon Scale', description: 'Harder than steel.', icon: '🛡️', value: 1000, type: 'resource' },
  'iron_dragon_scale': { id: 'iron_dragon_scale', name: 'Iron Dragon Scale', description: 'Metallic dragon scale.', icon: '🛡️', value: 1500, type: 'resource' },
  'steel_dragon_scale': { id: 'steel_dragon_scale', name: 'Steel Dragon Scale', description: 'Heavy metallic scale.', icon: '🛡️', value: 2500, type: 'resource' },
  'dragonite_ore': { id: 'dragonite_ore', name: 'Dragonite Ore', description: 'A glowing red ore.', icon: '🪨', value: 1000, type: 'resource' },
  'dragonite_bar': { id: 'dragonite_bar', name: 'Dragonite Bar', description: 'A bar of pure dragonite.', icon: '🧱', value: 5000, type: 'resource' },
  'dragonite_sword': { id: 'dragonite_sword', name: 'Dragonite Sword', description: 'A blade forged in dragon fire.', icon: '⚔️', value: 25000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 100, strength: 60 } },
  'dragonite_shield': { id: 'dragonite_shield', name: 'Dragonite Shield', description: 'A shield forged in dragon fire.', icon: '🛡️', value: 40000, type: 'equipment', equipmentSlot: 'shield', stats: { defense: 80 } },
  'necrite_ore': { id: 'necrite_ore', name: 'Necrite Ore', description: 'A dark, soul-chilling ore.', icon: '🪨', value: 2500, type: 'resource' },
  'necrite_bar': { id: 'necrite_bar', name: 'Necrite Bar', description: 'A bar of pure necrite.', icon: '🧱', value: 12000, type: 'resource' },
  'necrite_sword': { id: 'necrite_sword', name: 'Necrite Sword', description: 'A blade that hungers for souls.', icon: '⚔️', value: 75000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 150, strength: 100 } },
  'necrite_body': { id: 'necrite_body', name: 'Necrite Body', description: 'Armor that feels like a second skin.', icon: '👕', value: 150000, type: 'equipment', equipmentSlot: 'body', stats: { defense: 200 } },
  'necrite_legs': { id: 'necrite_legs', name: 'Necrite Legs', description: 'Leggings made from necrite.', icon: '👖', value: 100000, type: 'equipment', equipmentSlot: 'legs', stats: { defense: 180 } },
  'necrite_head': { id: 'necrite_head', name: 'Necrite Head', description: 'A helmet made from necrite.', icon: '🪖', value: 80000, type: 'equipment', equipmentSlot: 'head', stats: { defense: 150 } },
  'elder_shortbow_u': { id: 'elder_shortbow_u', name: 'Unstrung Elder Shortbow', description: 'An unstrung elder shortbow.', icon: '🏹', value: 640, type: 'resource' },
  'elder_shortbow': { id: 'elder_shortbow', name: 'Elder Shortbow', description: 'A bow of ancient power.', icon: '🏹', value: 15000, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 150 } },
  'redwood_shortbow_u': { id: 'redwood_shortbow_u', name: 'Unstrung Redwood Shortbow', description: 'An unstrung redwood shortbow.', icon: '🏹', value: 1280, type: 'resource' },
  'redwood_shortbow': { id: 'redwood_shortbow', name: 'Redwood Shortbow', description: 'A massive redwood bow.', icon: '🏹', value: 30000, type: 'equipment', equipmentSlot: 'weapon', stats: { ranged: 200 } },
  'wrath_rune': { id: 'wrath_rune', name: 'Wrath Rune', description: 'Used for the most destructive spells.', icon: '🔮', value: 1000, type: 'resource', skillHint: 'Magic' },
  'divine_essence': { id: 'divine_essence', name: 'Divine Essence', description: 'Essence touched by the gods.', icon: '✨', value: 2000, type: 'resource', skillHint: 'Mining / Runecrafting' },
  'spirit_herb': { id: 'spirit_herb', name: 'Spirit Herb', description: 'An herb that glows with a faint light.', icon: '🌿', value: 1000, type: 'resource' },
  'spirit_potion': { id: 'spirit_potion', name: 'Spirit Potion', description: 'A potion that boosts your spirit.', icon: '🧪', value: 5000, type: 'potion' },
  'dragon_slayer_potion': { id: 'dragon_slayer_potion', name: 'Dragon Slayer Potion', description: 'Increases damage against dragons.', icon: '🧪', value: 10000, type: 'potion' },
  'overload_potion': { id: 'overload_potion', name: 'Overload Potion', description: 'The ultimate combat boost.', icon: '🧪', value: 50000, type: 'potion' },
  'void_essence': { id: 'void_essence', name: 'Void Essence', description: 'Essence from the void.', icon: '🌑', value: 5000, type: 'resource' },
  'void_blade': { id: 'void_blade', name: 'Void Blade', description: 'A blade that cuts through reality.', icon: '⚔️', value: 500000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 200, strength: 150 } },
  'master_clue_scroll': { id: 'master_clue_scroll', name: 'Master Clue Scroll', description: 'A very difficult riddle.', icon: '📜', value: 10000, type: 'resource' },
  'clue_scroll_master': { id: 'clue_scroll_master', name: 'Master Clue Scroll', description: 'A very difficult riddle.', icon: '📜', value: 10000, type: 'resource' },
  'clue_reward_box': { id: 'clue_reward_box', name: 'Clue Reward Box', description: 'Contains treasures.', icon: '🎁', value: 50000, type: 'resource' },
  'ancient_relic': { id: 'ancient_relic', name: 'Ancient Relic', description: 'A mysterious artifact from a lost age.', icon: '🏺', value: 100000, type: 'resource' },
  'imperial_decree': { id: 'imperial_decree', name: 'Imperial Decree', description: 'A scroll that commands respect.', icon: '📜', value: 10000, type: 'resource' },
  'dragon_fruit': { id: 'dragon_fruit', name: 'Dragon Fruit', description: 'A fruit that tastes like fire.', icon: '🌵', value: 500, type: 'food' },
  'raid_master_cape': { id: 'raid_master_cape', name: 'Raid Master Cape', description: 'Worn by those who have conquered all.', icon: '🧥', value: 2500000, type: 'equipment', equipmentSlot: 'body', stats: { defense: 150, strength: 20, magic: 20, ranged: 20 } },
  'dragon_slayer_blade': { id: 'dragon_slayer_blade', name: 'Dragon Slayer Blade', description: 'Forged in dragon fire.', icon: '🗡️', value: 500000, type: 'equipment', equipmentSlot: 'weapon', stats: { attack: 120, strength: 80 } },

  'dragonite_body': { id: 'dragonite_body', name: 'Dragonite Body', description: 'Armor forged from dragonite.', icon: '👕', value: 80000, type: 'equipment', equipmentSlot: 'body', stats: { defense: 100 } },
  'mithril_dragon_scale': { id: 'mithril_dragon_scale', name: 'Mithril Dragon Scale', description: 'Lightweight metallic scale.', icon: '🛡️', value: 5000, type: 'resource' },
  'adamant_dragon_scale': { id: 'adamant_dragon_scale', name: 'Adamant Dragon Scale', description: 'Extremely hard metallic scale.', icon: '🛡️', value: 10000, type: 'resource' },
  'rune_dragon_scale': { id: 'rune_dragon_scale', name: 'Rune Dragon Scale', description: 'The ultimate metallic scale.', icon: '🛡️', value: 25000, type: 'resource' },
  'raid_relic': { id: 'raid_relic', name: 'Raid Relic', description: 'A trophy from a great battle.', icon: '🏆', value: 25000, type: 'resource' },
  'imperial_seal': { id: 'imperial_seal', name: 'Imperial Seal', description: 'Authority of the Empire.', icon: '📜', value: 5000, type: 'resource' },
  'gp': { id: 'gp', name: 'Gold Pieces', description: 'The currency of the realm.', icon: '💰', value: 1, type: 'resource' },
  'celestial_essence': { id: 'celestial_essence', name: 'Celestial Essence', description: 'Essence from the stars.', icon: '✨', value: 1000, type: 'currency' },

  // New High-Level Equipment
  'dragon_med_helm': { id: 'dragon_med_helm', name: 'Dragon Med Helm', description: 'A helmet forged from dragonkin metal.', icon: '🪖', value: 60000, type: 'equipment', equipmentSlot: 'head', rarity: 'rare', stats: { defense: 40 } },
  'dragon_sq_shield': { id: 'dragon_sq_shield', name: 'Dragon Sq Shield', description: 'A square shield made of dragon metal.', icon: '🛡️', value: 300000, type: 'equipment', equipmentSlot: 'shield', rarity: 'rare', stats: { defense: 50 } },
  'dragon_platebody': { id: 'dragon_platebody', name: 'Dragon Platebody', description: 'The ultimate dragon metal armor.', icon: '👕', value: 1000000, type: 'equipment', equipmentSlot: 'body', rarity: 'rare', stats: { defense: 120 } },
  'dragon_platelegs': { id: 'dragon_platelegs', name: 'Dragon Platelegs', description: 'Leggings forged from dragon metal.', icon: '👖', value: 800000, type: 'equipment', equipmentSlot: 'legs', rarity: 'rare', stats: { defense: 100 } },
  'zenyte_shard': { id: 'zenyte_shard', name: 'Zenyte Shard', description: 'A shard of the rarest gem.', icon: '💎', value: 500000, type: 'resource' },
  'uncut_zenyte': { id: 'uncut_zenyte', name: 'Uncut Zenyte', description: 'An uncut zenyte gem.', icon: '💎', value: 1000000, type: 'resource' },
  'torture_amulet': { id: 'torture_amulet', name: 'Amulet of Torture', description: 'The ultimate offensive amulet.', icon: '📿', value: 5000000, type: 'equipment', equipmentSlot: 'head', stats: { attack: 15, strength: 10 } },
  'anguish_necklace': { id: 'anguish_necklace', name: 'Necklace of Anguish', description: 'The ultimate ranged necklace.', icon: '📿', value: 5000000, type: 'equipment', equipmentSlot: 'head', stats: { ranged: 15 } },
  'tormented_bracelet': { id: 'tormented_bracelet', name: 'Tormented Bracelet', description: 'The ultimate magic bracelet.', icon: '🧤', value: 5000000, type: 'equipment', equipmentSlot: 'legs', stats: { magic: 10 } },

  // Slayer Items
  'crawler_meat': { id: 'crawler_meat', name: 'Crawler Meat', description: 'Tough and stringy meat from a cave crawler.', icon: '🥩', value: 15, type: 'resource', skillHint: 'Slayer' },
  'bug_shell': { id: 'bug_shell', name: 'Bug Shell', description: 'A hard shell from a cave bug.', icon: '🪲', value: 30, type: 'resource', skillHint: 'Slayer' },
  'rockslug_slime': { id: 'rockslug_slime', name: 'Rockslug Slime', description: 'Sticky slime from a rockslug.', icon: '💧', value: 60, type: 'resource', skillHint: 'Slayer' },
  'cockatrice_egg': { id: 'cockatrice_egg', name: 'Cockatrice Egg', description: 'A petrified egg from a cockatrice.', icon: '🥚', value: 120, type: 'resource', skillHint: 'Slayer' },
  'basilisk_jaw': { id: 'basilisk_jaw', name: 'Basilisk Jaw', description: 'The heavy jawbone of a basilisk.', icon: '🦴', value: 250, type: 'resource', skillHint: 'Slayer' },
  'kurask_horn': { id: 'kurask_horn', name: 'Kurask Horn', description: 'A sharp horn from a kurask.', icon: '🦏', value: 500, type: 'resource', skillHint: 'Slayer' },

  // Imperial Edicts (Empire Boosts)
  'edict_efficiency': { id: 'edict_efficiency', name: 'Edict of Efficiency', description: 'Increases action speed by 10%.', icon: '📜', value: 50000, type: 'edict' },
  'edict_prosperity': { id: 'edict_prosperity', name: 'Edict of Prosperity', description: 'Increases GP gains by 20%.', icon: '💰', value: 50000, type: 'edict' },
  'edict_wisdom': { id: 'edict_wisdom', name: 'Edict of Wisdom', description: 'Increases XP gains by 15%.', icon: '🧠', value: 50000, type: 'edict' },
  'edict_martial_law': { id: 'edict_martial_law', name: 'Edict of Martial Law', description: 'Increases combat speed by 15%.', icon: '⚔️', value: 75000, type: 'edict' },
  'edict_war': { id: 'edict_war', name: 'Edict of War', description: 'Unlocks advanced combat training and 10% strength boost.', icon: '⚔️', value: 50, type: 'edict' },

  // Potions
  'antipoison': { id: 'antipoison', name: 'Antipoison', description: 'Cures poison.', icon: '🧪', value: 150, type: 'potion' },
  'restore_potion': { id: 'restore_potion', name: 'Restore Potion', description: 'Restores lowered stats.', icon: '🧪', value: 300, type: 'potion' },
  'prayer_potion': { id: 'prayer_potion', name: 'Prayer Potion', description: 'Restores prayer points.', icon: '🧪', value: 800, type: 'potion' },
  'super_attack': { id: 'super_attack', name: 'Super Attack', description: 'Greatly boosts attack.', icon: '🧪', value: 1500, type: 'potion' },
  'super_strength': { id: 'super_strength', name: 'Super Strength', description: 'Greatly boosts strength.', icon: '🧪', value: 2500, type: 'potion' },

  // Construction Materials
  'obsidian_bar': { id: 'obsidian_bar', name: 'Obsidian Bar', description: 'A bar of refined volcanic glass.', icon: '🧱', value: 1000, type: 'resource' },
  'limestone_brick': { id: 'limestone_brick', name: 'Limestone Brick', description: 'Used for building.', icon: '🧱', value: 50, type: 'resource' },
  'marble_block': { id: 'marble_block', name: 'Marble Block', description: 'A polished block of marble.', icon: '🧱', value: 500, type: 'resource' },

  // Celestial Relics (Ascension Rewards)
  'relic_storm_eye': { id: 'relic_storm_eye', name: 'Eye of the Storm', description: '20% chance to double all loot.', icon: '👁️', value: 10, type: 'edict' },
  'relic_empire_heart': { id: 'relic_empire_heart', name: 'Heart of the Empire', description: 'Empire actions are 50% faster.', icon: '❤️', value: 15, type: 'edict' },
  'relic_void_blade': { id: 'relic_void_blade', name: 'Void Blade', description: '10% chance to instantly execute monsters.', icon: '🗡️', value: 25, type: 'edict' },
  'relic_eternal_wisdom': { id: 'relic_eternal_wisdom', name: 'Eternal Wisdom', description: 'All skills gain 25% more XP.', icon: '📜', value: 20, type: 'edict' },
  'relic_fortune_star': { id: 'relic_fortune_star', name: 'Fortune Star', description: '+50% luck from all sources. Find rarer drops.', icon: '⭐', value: 50, type: 'edict' },
  'relic_iron_will': { id: 'relic_iron_will', name: 'Iron Will', description: 'All combat actions 25% faster. Relentless offensive.', icon: '🛡️', value: 40, type: 'edict' },
  'relic_gatherers_grace': { id: 'relic_gatherers_grace', name: "Gatherer's Grace", description: 'All gathering actions 30% faster. Nature bends to your will.', icon: '🌿', value: 35, type: 'edict' },
  'relic_golden_touch': { id: 'relic_golden_touch', name: 'Golden Touch', description: 'All GP gains doubled. Everything you touch turns to gold.', icon: '👑', value: 75, type: 'edict' },
  'relic_timeless_mastery': { id: 'relic_timeless_mastery', name: 'Timeless Mastery', description: 'Ascension bonuses doubled. Transcend further each cycle.', icon: '♾️', value: 100, type: 'edict' },
  'relic_dragon_soul': { id: 'relic_dragon_soul', name: 'Relic: Dragon Soul', description: 'Increases damage against dragons by 50%.', icon: '🐉', value: 50, type: 'edict' },
  'relic_void_mastery': { id: 'relic_void_mastery', name: 'Relic: Void Mastery', description: 'Increases damage in raids by 30%.', icon: '🌑', value: 100, type: 'edict' },

  // Skill Capes (Level 99 Rewards)
  'cape_mining': { id: 'cape_mining', name: 'Mining Skillcape', description: 'A cape awarded for mastering Mining.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'mining', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of the earth.' },
  'cape_woodcutting': { id: 'cape_woodcutting', name: 'Woodcutting Skillcape', description: 'A cape awarded for mastering Woodcutting.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'woodcutting', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of the forests.' },
  'cape_fishing': { id: 'cape_fishing', name: 'Fishing Skillcape', description: 'A cape awarded for mastering Fishing.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'fishing', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of the seas.' },
  'cape_cooking': { id: 'cape_cooking', name: 'Cooking Skillcape', description: 'A cape awarded for mastering Cooking.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'cooking', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of the kitchen.' },
  'cape_smithing': { id: 'cape_smithing', name: 'Smithing Skillcape', description: 'A cape awarded for mastering Smithing.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'smithing', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of the forge.' },
  'cape_crafting': { id: 'cape_crafting', name: 'Crafting Skillcape', description: 'A cape awarded for mastering Crafting.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'crafting', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of creation.' },
  'cape_thieving': { id: 'cape_thieving', name: 'Thieving Skillcape', description: 'A cape awarded for mastering Thieving.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'thieving', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of the shadows.' },
  'cape_herblore': { id: 'cape_herblore', name: 'Herblore Skillcape', description: 'A cape awarded for mastering Herblore.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'herblore', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of alchemy.' },
  'cape_slayer': { id: 'cape_slayer', name: 'Slayer Skillcape', description: 'A cape awarded for mastering Slayer.', icon: '🧥', value: 99000, type: 'tool', rarity: 'legendary', toolBonus: { skillId: 'slayer', speedMultiplier: 1.5, xpMultiplier: 1.1 }, usageHint: 'Wear to show your mastery of monsters.' },

  // New Loot & Materials
  'monster_hide': { id: 'monster_hide', name: 'Monster Hide', description: 'Tough skin from various beasts.', icon: '📜', value: 10, type: 'resource' },
  'beast_claw': { id: 'beast_claw', name: 'Beast Claw', description: 'A sharp claw used in crafting.', icon: '💅', value: 25, type: 'resource' },
  'vial_of_blood': { id: 'vial_of_blood', name: 'Vial of Blood', description: 'A dark, viscous liquid.', icon: '🧪', value: 50, type: 'resource' },
  'dragon_scale_shard': { id: 'dragon_scale_shard', name: 'Dragon Scale Shard', description: 'A fragment of a dragon scale.', icon: '🛡️', value: 100, type: 'resource' },
  'magic_scrap': { id: 'magic_scrap', name: 'Magic Scrap', description: 'Torn pieces of enchanted cloth.', icon: '🧵', value: 30, type: 'resource' },
  'dark_energy_core': { id: 'dark_energy_core', name: 'Dark Energy Core', description: 'A pulsing core of pure darkness.', icon: '🌑', value: 500, type: 'resource' },
  'ancient_mechanism': { id: 'ancient_mechanism', name: 'Ancient Mechanism', description: 'A complex part from a lost machine.', icon: '⚙️', value: 1000, type: 'resource' },
  
  // Loot Boxes / Dopamine Items
  'bronze_loot_bag': { id: 'bronze_loot_bag', name: 'Bronze Loot Bag', description: 'A small bag of common loot.', icon: '💰', value: 100, type: 'resource', usageHint: 'Open for common materials and GP.' },
  'iron_loot_chest': { id: 'iron_loot_chest', name: 'Iron Loot Chest', description: 'A sturdy chest filled with mid-tier loot.', icon: '📦', value: 500, type: 'resource', usageHint: 'Open for ores, bars, and GP.' },
  'gold_treasure_coffer': { id: 'gold_treasure_coffer', name: 'Gold Treasure Coffer', description: 'A lavish coffer overflowing with riches.', icon: '💎', value: 2500, type: 'resource', usageHint: 'Open for gems, high-tier materials, and GP.' },
  'void_relic_casket': { id: 'void_relic_casket', name: 'Void Relic Casket', description: 'A mysterious casket from the void.', icon: '🖤', value: 10000, type: 'resource', usageHint: 'Open for rare void materials and legendary gear.' },

  // Keys & Access Items
  'crypt_key': { id: 'crypt_key', name: 'Crypt Key', description: 'Unlocks the Ancient Crypt raid.', icon: '🗝️', value: 1000, type: 'resource' },
  'fortress_sigil': { id: 'fortress_sigil', name: 'Fortress Sigil', description: 'Grants entry to the Orc Fortress.', icon: '🛡️', value: 5000, type: 'resource' },
  'dragon_lord_seal': { id: 'dragon_lord_seal', name: 'Dragon Lord Seal', description: 'Required to enter the Dragon Lair.', icon: '🐉', value: 25000, type: 'resource' },
  'void_citadel_pass': { id: 'void_citadel_pass', name: 'Void Citadel Pass', description: 'The only way into the Void Citadel.', icon: '🎟️', value: 100000, type: 'resource' },

  // Intermediate Crafting Components
  'reinforced_leather': { id: 'reinforced_leather', name: 'Reinforced Leather', description: 'Tough leather treated with oils.', icon: '🧥', value: 200, type: 'resource' },
  'enchanted_string': { id: 'enchanted_string', name: 'Enchanted String', description: 'String that hums with magic.', icon: '🧵', value: 500, type: 'resource' },
  'alchemical_catalyst': { id: 'alchemical_catalyst', name: 'Alchemical Catalyst', description: 'Speeds up chemical reactions.', icon: '🧪', value: 1000, type: 'resource' },
  'master_crafting_kit': { id: 'master_crafting_kit', name: 'Master Crafting Kit', description: 'Tools for the finest artisans.', icon: '🧰', value: 5000, type: 'resource' },
  
  // More Farming Loot
  'goblin_ear': { id: 'goblin_ear', name: 'Goblin Ear', description: 'A gruesome trophy.', icon: '👂', value: 5, type: 'resource' },
  'wolf_pelt': { id: 'wolf_pelt', name: 'Wolf Pelt', description: 'Warm and fuzzy.', icon: '🦊', value: 20, type: 'resource' },
  'dragon_fang': { id: 'dragon_fang', name: 'Dragon Fang', description: 'Sharp enough to cut through steel.', icon: '🦷', value: 200, type: 'resource' },
  'void_shard': { id: 'void_shard', name: 'Void Shard', description: 'A piece of the void itself.', icon: '✨', value: 500, type: 'resource' },
  
  // Intermediate Potions & Materials
  'agility_elixir': { id: 'agility_elixir', name: 'Agility Elixir', description: 'Makes you feel light as a feather.', icon: '🧪', value: 1000, type: 'potion' },
  'thief_brew': { id: 'thief_brew', name: 'Thief\'s Brew', description: 'Sharpens your senses for thieving.', icon: '🧪', value: 1500, type: 'potion' },
  'slayer_essence': { id: 'slayer_essence', name: 'Slayer Essence', description: 'Concentrated essence of monsters.', icon: '💧', value: 2000, type: 'resource' },
  'pure_mana_crystal': { id: 'pure_mana_crystal', name: 'Pure Mana Crystal', description: 'A crystal pulsing with magical energy.', icon: '💎', value: 5000, type: 'resource' },
  'kraken_tentacle': { id: 'kraken_tentacle', name: 'Kraken Tentacle', description: 'A writhing, powerful tentacle.', icon: '🐙', value: 10000, type: 'resource', rarity: 'rare' },
  'abyssal_tentacle': { id: 'abyssal_tentacle', name: 'Abyssal Tentacle', description: 'A fusion of void and sea. The ultimate whip.', icon: '🔱', value: 150000, type: 'equipment', equipmentSlot: 'weapon', rarity: 'legendary', stats: { attack: 120, strength: 80, speed: 1.2 } },

  // Gems for Socketing
  'ruby_gem': { id: 'ruby_gem', name: 'Ruby Gem', description: 'A fiery red gem.', icon: '💎', value: 5000, type: 'resource', isGem: true, gemBonus: { strength: 10 }, rarity: 'rare' },
  'sapphire_gem': { id: 'sapphire_gem', name: 'Sapphire Gem', description: 'A deep blue gem.', icon: '💎', value: 5000, type: 'resource', isGem: true, gemBonus: { magic: 10 }, rarity: 'rare' },
  'emerald_gem': { id: 'emerald_gem', name: 'Emerald Gem', description: 'A vibrant green gem.', icon: '💎', value: 5000, type: 'resource', isGem: true, gemBonus: { luck: 5 }, rarity: 'rare' },
  'diamond_gem': { id: 'diamond_gem', name: 'Diamond Gem', description: 'A brilliant clear gem.', icon: '💎', value: 15000, type: 'resource', isGem: true, gemBonus: { attack: 15, strength: 5 }, rarity: 'epic' },
  'void_gem': { id: 'void_gem', name: 'Void Gem', description: 'A gem that absorbs light.', icon: '🌑', value: 50000, type: 'resource', isGem: true, gemBonus: { luck: 25, speed: 0.1 }, rarity: 'legendary' },

  // Set Items: Void Set
  'void_helm': { id: 'void_helm', name: 'Void Helm', description: 'Part of the Void Set.', icon: '🪖', value: 25000, type: 'equipment', equipmentSlot: 'head', rarity: 'epic', setBonus: { setId: 'void_set', piecesRequired: 3, bonus: { luck: 50, attack: 20 } } },
  'void_body': { id: 'void_body', name: 'Void Body', description: 'Part of the Void Set.', icon: '🥋', value: 40000, type: 'equipment', equipmentSlot: 'body', rarity: 'epic', setBonus: { setId: 'void_set', piecesRequired: 3, bonus: { luck: 50, attack: 20 } } },
  'void_legs': { id: 'void_legs', name: 'Void Legs', description: 'Part of the Void Set.', icon: '👖', value: 35000, type: 'equipment', equipmentSlot: 'legs', rarity: 'epic', setBonus: { setId: 'void_set', piecesRequired: 3, bonus: { luck: 50, attack: 20 } } },

  // Luck Items
  'lucky_rabbit_foot': { id: 'lucky_rabbit_foot', name: 'Lucky Rabbit Foot', description: 'A charm that brings good fortune.', icon: '🐇', value: 2000, type: 'equipment', equipmentSlot: 'neck', rarity: 'uncommon', stats: { luck: 10 } },
  'ring_of_wealth': { id: 'ring_of_wealth', name: 'Ring of Wealth', description: 'Increases the chance of rare drops.', icon: '💍', value: 15000, type: 'equipment', equipmentSlot: 'ring', rarity: 'rare', stats: { luck: 25 } },
  'luck_potion': { id: 'luck_potion', name: 'Luck Potion', description: 'Temporarily boosts your luck.', icon: '🧪', value: 5000, type: 'potion', rarity: 'rare' },

  // Slayer Uniques & Boss Drops
  'black_mask': { id: 'black_mask', name: 'Black Mask', description: 'A mask that increases Slayer damage.', icon: '🎭', value: 150000, type: 'equipment', equipmentSlot: 'head', rarity: 'rare', stats: { attack: 10, defense: 5 } },
  'dragon_chainbody': { id: 'dragon_chainbody', name: 'Dragon Chainbody', description: 'A very rare and powerful chainmail.', icon: '⛓️', value: 500000, type: 'equipment', equipmentSlot: 'body', rarity: 'epic', stats: { defense: 80, attack: 5 } },
  'rune_boots': { id: 'rune_boots', name: 'Rune Boots', description: 'Strong boots made of runite.', icon: '👢', value: 25000, type: 'equipment', equipmentSlot: 'feet', rarity: 'uncommon', stats: { defense: 15, attack: 2 } },
  'occult_necklace': { id: 'occult_necklace', name: 'Nethertide Pendant', description: 'A necklace that channels forbidden arcane power.', icon: '📿', value: 300000, type: 'equipment', equipmentSlot: 'neck', rarity: 'epic', stats: { magic: 25, attack: 5 } },
  'primordial_boots': { id: 'primordial_boots', name: 'Ironwrought Greaves', description: 'The finest warrior boots, forged in hellfire.', icon: '👢', value: 1000000, type: 'equipment', equipmentSlot: 'feet', rarity: 'legendary', stats: { attack: 30, defense: 20 } },
  'pegasian_boots': { id: 'pegasian_boots', name: 'Windstrider Boots', description: 'Lightweight boots for the deadliest marksmen.', icon: '👢', value: 1000000, type: 'equipment', equipmentSlot: 'feet', rarity: 'legendary', stats: { ranged: 30, defense: 10 } },
  'eternal_boots': { id: 'eternal_boots', name: 'Eternal Boots', description: 'The best boots for a mage.', icon: '👢', value: 1000000, type: 'equipment', equipmentSlot: 'feet', rarity: 'legendary', stats: { magic: 30, defense: 10 } },
  'infernal_cape': { id: 'infernal_cape', name: 'Emberclaw Mantle', description: 'A cape that radiates the heat of Emberclaw itself.', icon: '🧥', value: 5000000, type: 'equipment', equipmentSlot: 'back', rarity: 'celestial', stats: { attack: 50, strength: 30, defense: 20 } },

  // High-Level Sets
  'justiciar_helm': { id: 'justiciar_helm', name: 'Justiciar Helm', description: 'Part of the Justiciar set.', icon: '🛡️', value: 1000000, type: 'equipment', equipmentSlot: 'head', rarity: 'legendary', setBonus: { setId: 'justiciar_set', piecesRequired: 3, bonus: { defense: 100, health: 50 } }, stats: { defense: 50 } },
  'justiciar_chest': { id: 'justiciar_chest', name: 'Justiciar Chest', description: 'Part of the Justiciar set.', icon: '🧥', value: 2000000, type: 'equipment', equipmentSlot: 'body', rarity: 'legendary', setBonus: { setId: 'justiciar_set', piecesRequired: 3, bonus: { defense: 100, health: 50 } }, stats: { defense: 120 } },
  'justiciar_legs': { id: 'justiciar_legs', name: 'Justiciar Legs', description: 'Part of the Justiciar set.', icon: '👖', value: 1500000, type: 'equipment', equipmentSlot: 'legs', rarity: 'legendary', setBonus: { setId: 'justiciar_set', piecesRequired: 3, bonus: { defense: 100, health: 50 } }, stats: { defense: 90 } },
  'ancestral_hat': { id: 'ancestral_hat', name: 'Ancestral Hat', description: 'Part of the Ancestral set.', icon: '🧙', value: 1200000, type: 'equipment', equipmentSlot: 'head', rarity: 'legendary', setBonus: { setId: 'ancestral_set', piecesRequired: 3, bonus: { magic: 150, speed: 0.1 } }, stats: { magic: 60 } },
  'ancestral_robe_top': { id: 'ancestral_robe_top', name: 'Ancestral Robe Top', description: 'Part of the Ancestral set.', icon: '👘', value: 2500000, type: 'equipment', equipmentSlot: 'body', rarity: 'legendary', setBonus: { setId: 'ancestral_set', piecesRequired: 3, bonus: { magic: 150, speed: 0.1 } }, stats: { magic: 100 } },
  'ancestral_robe_bottom': { id: 'ancestral_robe_bottom', name: 'Ancestral Robe Bottom', description: 'Part of the Ancestral set.', icon: '👗', value: 2000000, type: 'equipment', equipmentSlot: 'legs', rarity: 'legendary', setBonus: { setId: 'ancestral_set', piecesRequired: 3, bonus: { magic: 150, speed: 0.1 } }, stats: { magic: 80 } },

  // Trophies & Collection Items
  'dragon_lord_trophy': { id: 'dragon_lord_trophy', name: 'Dragon Lord Trophy', description: 'A massive head of the Dragon Lord.', icon: '🐲', value: 1000000, type: 'resource', rarity: 'legendary', usageHint: 'A symbol of your victory.' },
  'void_reaper_trophy': { id: 'void_reaper_trophy', name: 'Void Reaper Trophy', description: 'A fragment of the Void Reaper\'s essence.', icon: '💀', value: 2000000, type: 'resource', rarity: 'legendary', usageHint: 'A symbol of your victory.' },
  'imperial_crown': { id: 'imperial_crown', name: 'Imperial Crown', description: 'The crown of the first Emperor.', icon: '👑', value: 10000000, type: 'equipment', equipmentSlot: 'head', rarity: 'celestial', stats: { luck: 100, attack: 50, magic: 50, ranged: 50 } },

  // Junk & Salvageables
  'broken_shield': { id: 'broken_shield', name: 'Broken Shield', description: 'A damaged shield. Can be salvaged for metal.', icon: '🛡️', value: 50, type: 'equipment', equipmentSlot: 'offhand', rarity: 'common', usageHint: 'Salvage for Iron/Steel.', stats: { defense: 1 } },
  'rusty_sword': { id: 'rusty_sword', name: 'Rusty Sword', description: 'A corroded blade. Can be salvaged for metal.', icon: '🗡️', value: 30, type: 'equipment', equipmentSlot: 'weapon', rarity: 'common', usageHint: 'Salvage for Iron.', stats: { attack: 1 } },
  'ancient_parchment': { id: 'ancient_parchment', name: 'Ancient Parchment', description: 'Tattered paper with mysterious writing.', icon: '📜', value: 500, type: 'resource', rarity: 'uncommon', usageHint: 'Used in high-level Magic and Empire actions.' },
  'spirit_seed': { id: 'spirit_seed', name: 'Spirit Seed', description: 'A seed that pulses with life.', icon: '🌱', value: 5000, type: 'resource', rarity: 'rare', usageHint: 'Used in high-level Farming.' },

  // Global Rare Drops
  'celestial_shard': { id: 'celestial_shard', name: 'Celestial Shard', description: 'A fragment of a fallen star.', icon: '✨', value: 250000, type: 'resource', rarity: 'celestial' },

  // ===== ARCHFIEND BOSS SIGNATURE DROPS =====
  // The Hollow King
  'hollow_crown': { id: 'hollow_crown', name: 'Hollow Crown', description: 'The cursed crown of the Hollow King. Whispers of power echo within.', icon: '👑', value: 2000000, type: 'equipment', rarity: 'celestial', equipmentSlot: 'head', stats: { attack: 30, magic: 30, defense: 50, luck: 15 }, socketable: true, sockets: 2 },
  'hollow_scepter': { id: 'hollow_scepter', name: 'Hollow Scepter', description: 'The Hollow King\'s scepter. Commands the dead.', icon: '🏛️', value: 1500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { magic: 95, attack: 20, luck: 10 }, socketable: true, sockets: 2 },
  'kings_vestige': { id: 'kings_vestige', name: "King's Vestige", description: 'A fragment of the Hollow King\'s essence. Radiates dread.', icon: '💀', value: 500000, type: 'resource', rarity: 'legendary' },

  // Emberclaw
  'emberclaws_fang': { id: 'emberclaws_fang', name: "Emberclaw's Fang", description: 'A molten fang that never cools. Burns anything it touches.', icon: '🔥', value: 1800000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { attack: 85, strength: 55, speed: 0.2 }, socketable: true, sockets: 1 },
  'charred_crown': { id: 'charred_crown', name: 'Charred Crown', description: 'A crown of blackened bone from Emberclaw\'s mane.', icon: '🔥', value: 1200000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'head', stats: { strength: 30, defense: 35, attack: 15 } },
  'ember_core': { id: 'ember_core', name: 'Ember Core', description: 'The burning heart ripped from Emberclaw. Still aflame.', icon: '🌋', value: 800000, type: 'resource', rarity: 'legendary' },

  // Voidmother
  'voidmother_eye': { id: 'voidmother_eye', name: "Voidmother's Eye", description: 'An unblinking eye that sees through all illusions.', icon: '👁️', value: 1500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'neck', stats: { magic: 40, luck: 30, ranged: 15 } },
  'abyssal_membrane': { id: 'abyssal_membrane', name: 'Abyssal Membrane', description: 'A living shield grown from the Voidmother\'s flesh.', icon: '🛡️', value: 1200000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'shield', stats: { defense: 70, magic: 20, health: 15 } },

  // Stormwarden
  'stormwarden_crest_helm': { id: 'stormwarden_crest_helm', name: "Stormwarden's Crown", description: 'A crown of lightning. Crackles with static.', icon: '⚡', value: 1500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'head', stats: { ranged: 40, magic: 25, speed: 0.3, defense: 20 } },
  'tempest_lance': { id: 'tempest_lance', name: 'Tempest Lance', description: 'A weapon forged from Stormwarden\'s spine. Calls lightning on each strike.', icon: '⚡', value: 2000000, type: 'equipment', rarity: 'celestial', equipmentSlot: 'weapon', stats: { attack: 70, ranged: 50, strength: 40, speed: 0.2 }, socketable: true, sockets: 3 },

  // Ashen Wyrm / Elder Wyrm
  'ashen_plate': { id: 'ashen_plate', name: 'Ashen Plate', description: 'Body armor forged from the Elder Wyrm\'s scales. Nearly indestructible.', icon: '🔥', value: 2500000, type: 'equipment', rarity: 'celestial', equipmentSlot: 'body', stats: { defense: 80, strength: 20, attack: 15, health: 25 }, socketable: true, sockets: 2 },
  'wyrm_spine_bow': { id: 'wyrm_spine_bow', name: 'Wyrmspine Bow', description: 'A recurve bow carved from the Elder Wyrm\'s vertebrae.', icon: '🏹', value: 1800000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { ranged: 100, speed: 0.3, luck: 5 }, socketable: true, sockets: 2 },

  // ===== CONSTRUCTION MATERIALS & BUILDINGS =====
  'planks': { id: 'planks', name: 'Planks', description: 'Standard wooden planks for basic construction.', icon: '🪵', value: 50, type: 'resource' },
  'oak_planks': { id: 'oak_planks', name: 'Oak Planks', description: 'Sturdy oak planks for mid-tier building.', icon: '🪵', value: 200, type: 'resource', rarity: 'uncommon' },
  'teak_planks': { id: 'teak_planks', name: 'Teak Planks', description: 'High-quality teak for fine construction.', icon: '🪵', value: 500, type: 'resource', rarity: 'rare' },
  'stone_block': { id: 'stone_block', name: 'Stone Block', description: 'Carved stone for building foundations.', icon: '🧱', value: 100, type: 'resource' },
  'nails': { id: 'nails', name: 'Nails', description: 'Iron nails for holding things together.', icon: '📌', value: 10, type: 'resource' },

  // ===== BOUNTY MARK SHOP ITEMS =====
  'huntsmans_vizor': { id: 'huntsmans_vizor', name: "Huntsman's Vizor", description: 'A helm forged from bounty marks. Increases slayer XP and damage.', icon: '🎭', value: 500, type: 'equipment', rarity: 'epic', equipmentSlot: 'head', stats: { attack: 25, strength: 15, defense: 20, luck: 10 } },
  'bounty_ring': { id: 'bounty_ring', name: 'Contract Ring', description: 'A ring that marks you as a seasoned hunter. Boosts bounty mark gains.', icon: '💍', value: 300, type: 'equipment', rarity: 'rare', equipmentSlot: 'ring', stats: { luck: 20, attack: 10 } },
  'hunters_insignia': { id: 'hunters_insignia', name: "Hunter's Insignia", description: 'A cape marking your dedication to the Bounty Board. Feared by monsters.', icon: '🏅', value: 750, type: 'equipment', rarity: 'legendary', equipmentSlot: 'cape', stats: { attack: 20, strength: 20, defense: 15, speed: 0.1 } },

  // ===== PETS — Rare cosmetic companions =====
  'pet_rock_golem': { id: 'pet_rock_golem', name: 'Rock Golem', description: 'A tiny golem made of ore. Follows you devotedly.', icon: '🪨', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Mining' },
  'pet_beaver': { id: 'pet_beaver', name: 'Beaver', description: 'An industrious beaver. Loves the smell of sawdust.', icon: '🦫', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Woodcutting' },
  'pet_heron': { id: 'pet_heron', name: 'Heron', description: 'A majestic fishing companion. Incredibly patient.', icon: '🦅', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Fishing' },
  'pet_chinchompa': { id: 'pet_chinchompa', name: 'Baby Chinchompa', description: 'An explosive little ball of fluff.', icon: '🐹', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Hunting' },
  'pet_tangleroot': { id: 'pet_tangleroot', name: 'Tangleroot', description: 'A sentient plant that follows you around.', icon: '🌱', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Farming' },
  'pet_smithing_golem': { id: 'pet_smithing_golem', name: 'Smoldering Golem', description: 'A miniature golem forged in the hottest furnace.', icon: '🔥', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Smithing' },
  'pet_sous_chef': { id: 'pet_sous_chef', name: 'Sous Chef', description: 'A tiny chef that critiques everything you cook.', icon: '👨‍🍳', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Cooking' },
  'pet_herbi': { id: 'pet_herbi', name: 'Herbi', description: 'A herbivore that eats nothing but rare herbs.', icon: '🦎', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Herblore' },
  'pet_crafting_spider': { id: 'pet_crafting_spider', name: 'Golden Spider', description: 'Spins threads of pure gold. Very delicate.', icon: '🕷️', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Crafting' },
  'pet_rift_guardian': { id: 'pet_rift_guardian', name: 'Rift Guardian', description: 'A being of pure runic energy from another dimension.', icon: '🌀', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Runecrafting' },
  'pet_rocky': { id: 'pet_rocky', name: 'Rocky', description: 'A raccoon with sticky fingers. Suspiciously wealthy.', icon: '🦝', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Thieving' },
  'pet_squirrel': { id: 'pet_squirrel', name: 'Giant Squirrel', description: 'An absurdly nimble squirrel. Parkour champion.', icon: '🐿️', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Agility' },
  'pet_war_hound': { id: 'pet_war_hound', name: 'War Hound', description: 'A ferocious battle companion. Loyal to the death.', icon: '🐕', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Attack' },
  'pet_minotaur': { id: 'pet_minotaur', name: 'Mini Minotaur', description: 'A pint-sized minotaur with rage issues.', icon: '🐂', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Strength' },
  'pet_turtle': { id: 'pet_turtle', name: 'Ironshell', description: 'An ancient turtle whose shell is literally unbreakable.', icon: '🐢', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Defense' },
  'pet_phoenix': { id: 'pet_phoenix', name: 'Phoenix', description: 'A tiny phoenix that bursts into flame when excited.', icon: '🔥', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Magic' },
  'pet_hawk': { id: 'pet_hawk', name: 'Shadow Hawk', description: 'A raptor from the shadow realm. Deadly accurate.', icon: '🦅', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Ranged' },
  'pet_spirit_wolf': { id: 'pet_spirit_wolf', name: 'Spirit Wolf', description: 'A translucent wolf visible only to the devout.', icon: '🐺', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Prayer' },
  'pet_crown_prince': { id: 'pet_crown_prince', name: 'Crown Prince', description: 'A tiny royal who insists on being carried everywhere.', icon: '👶', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Empire' },
  'pet_shadow_drake': { id: 'pet_shadow_drake', name: 'Shadow Drake', description: 'A dragon whelpling born from darkness. Burns cold fire.', icon: '🐉', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Raids' },
  'pet_reaper': { id: 'pet_reaper', name: 'Lil Reaper', description: 'Death incarnate. Except tiny and kind of cute.', icon: '💀', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Slayer' },
  'pet_builder_golem': { id: 'pet_builder_golem', name: 'Builder Golem', description: 'A tiny clay golem that carries bricks twice its size.', icon: '🏗️', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Construction' },

  // ===== CLUE SCROLL ITEMS =====
  'clue_scroll_easy': { id: 'clue_scroll_easy', name: 'Clue Scroll (Easy)', description: 'A mysterious scroll with simple instructions. Open to receive a reward.', icon: '📜', value: 500, type: 'resource', rarity: 'uncommon' },
  'clue_scroll_medium': { id: 'clue_scroll_medium', name: 'Clue Scroll (Medium)', description: 'A scroll with moderately challenging clues. Better rewards await.', icon: '📜', value: 2000, type: 'resource', rarity: 'rare' },
  'clue_scroll_hard': { id: 'clue_scroll_hard', name: 'Clue Scroll (Hard)', description: 'A complex scroll promising valuable treasures.', icon: '📜', value: 10000, type: 'resource', rarity: 'epic' },
  'clue_scroll_elite': { id: 'clue_scroll_elite', name: 'Clue Scroll (Elite)', description: 'An ancient scroll. Only the worthy may claim its reward.', icon: '📜', value: 50000, type: 'resource', rarity: 'legendary' },

  // Clue-exclusive rewards
  'rangers_tunic': { id: 'rangers_tunic', name: "Ranger's Tunic", description: 'A tunic worn by legendary marksmen. Extremely rare.', icon: '👕', value: 500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'body', stats: { ranged: 50, speed: 0.3 } },
  'holy_sandals': { id: 'holy_sandals', name: 'Holy Sandals', description: 'Blessed footwear that enhances prayer.', icon: '👡', value: 200000, type: 'equipment', rarity: 'epic', equipmentSlot: 'feet', stats: { defense: 15, magic: 10, speed: 0.1 } },
  'gilded_platebody': { id: 'gilded_platebody', name: 'Gilded Platebody', description: 'Armor plated in pure gold. A trophy of clue hunting.', icon: '🥇', value: 1000000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'body', stats: { defense: 90, strength: 15 }, socketable: true, sockets: 1 },
  'third_age_amulet': { id: 'third_age_amulet', name: 'Third Age Amulet', description: 'An amulet from the Third Age. Priceless and ancient.', icon: '📿', value: 5000000, type: 'equipment', rarity: 'celestial', equipmentSlot: 'neck', stats: { attack: 30, strength: 20, defense: 30, magic: 30, ranged: 30, luck: 20 }, socketable: true, sockets: 2 },
  'bloodhound_pet': { id: 'bloodhound_pet', name: 'Bloodhound', description: 'An elite tracking dog. Only found in elite clue caskets.', icon: '🐕‍🦺', value: 0, type: 'resource', rarity: 'celestial', skillHint: 'Clue Scrolls' },
  'ornament_kit': { id: 'ornament_kit', name: 'Ornament Kit', description: 'Used to customize equipment with cosmetic flair.', icon: '🎨', value: 100000, type: 'resource', rarity: 'epic' },
  'treasure_chest': { id: 'treasure_chest', name: 'Buried Treasure', description: 'A chest overflowing with ancient coins.', icon: '🪙', value: 25000, type: 'resource', rarity: 'rare' },

  // ===== MID-GAME BOSS DROPS =====
  // Stoneguard Titan (lvl 50 boss)
  'titan_core': { id: 'titan_core', name: "Titan's Core", description: 'A pulsing stone heart ripped from the Stoneguard Titan.', icon: '🪨', value: 100000, type: 'resource', rarity: 'epic' },
  'titan_gauntlets': { id: 'titan_gauntlets', name: "Titan's Gauntlets", description: 'Gauntlets carved from living rock. Immense crushing power.', icon: '🧤', value: 250000, type: 'equipment', rarity: 'epic', equipmentSlot: 'hands', stats: { strength: 35, defense: 25, attack: 10 } },
  'earthshaker_maul': { id: 'earthshaker_maul', name: 'Earthshaker Maul', description: 'A colossal hammer that cracks the ground with each swing.', icon: '🔨', value: 500000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { strength: 75, attack: 40 }, socketable: true, sockets: 1 },

  // Shadowfang Alpha (lvl 70 boss)
  'shadow_fang': { id: 'shadow_fang', name: 'Shadow Fang', description: 'A fang that drips liquid darkness.', icon: '🦷', value: 50000, type: 'resource', rarity: 'rare' },
  'shadow_cloak': { id: 'shadow_cloak', name: 'Shadow Cloak', description: 'A cloak woven from pure shadow. Makes the wearer near-invisible.', icon: '🧥', value: 400000, type: 'equipment', rarity: 'epic', equipmentSlot: 'cape', stats: { speed: 0.3, luck: 15, defense: 10 } },
  'nightfang_daggers': { id: 'nightfang_daggers', name: 'Nightfang Daggers', description: 'Twin daggers that strike from the shadows. Impossibly fast.', icon: '🗡️', value: 750000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { attack: 65, speed: 0.5, luck: 10 }, socketable: true, sockets: 1 },

  // Tidecaller Leviathan (lvl 80 boss)
  'leviathan_scale': { id: 'leviathan_scale', name: 'Leviathan Scale', description: 'An iridescent scale from the deep. Harder than any metal.', icon: '🐚', value: 75000, type: 'resource', rarity: 'epic' },
  'trident_of_tides': { id: 'trident_of_tides', name: 'Trident of the Tides', description: 'Commands the ocean itself. Water bends to its will.', icon: '🔱', value: 1000000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'weapon', stats: { magic: 80, attack: 20, speed: 0.2 }, socketable: true, sockets: 2 },
  'leviathan_helm': { id: 'leviathan_helm', name: "Leviathan's Crown", description: 'A helm made from the Leviathan\'s skull plate. Terrifying.', icon: '👹', value: 600000, type: 'equipment', rarity: 'legendary', equipmentSlot: 'head', stats: { defense: 45, magic: 25, health: 20 } },
};

export const RARE_DROP_TABLE: { itemId: string; chance: number }[] = [
  { itemId: 'ruby_gem', chance: 0.05 },
  { itemId: 'sapphire_gem', chance: 0.05 },
  { itemId: 'emerald_gem', chance: 0.05 },
  { itemId: 'diamond_gem', chance: 0.02 },
  { itemId: 'void_gem', chance: 0.005 },
  { itemId: 'ancient_relic', chance: 0.001 },
  { itemId: 'celestial_shard', chance: 0.0001 },
  { itemId: 'godsword_shard_1', chance: 0.001 },
  { itemId: 'godsword_shard_2', chance: 0.001 },
  { itemId: 'godsword_shard_3', chance: 0.001 },
  { itemId: 'armadyl_hilt', chance: 0.0001 },
  { itemId: 'gp', chance: 0.1 },
  // Clue scroll drops from RDT
  { itemId: 'clue_scroll_easy', chance: 0.08 },
  { itemId: 'clue_scroll_medium', chance: 0.04 },
  { itemId: 'clue_scroll_hard', chance: 0.01 },
  { itemId: 'clue_scroll_elite', chance: 0.002 },
];

// ===== UNIQUE MONSTER DROP TABLES =====
// Each monster type has signature drops that ONLY come from them
// These roll SEPARATELY from the global RDT (stacks with it)
export const MONSTER_DROP_TABLES: Record<string, { itemId: string; quantity: number; chance: number }[]> = {
  // Goblins - cheap junk that adds up
  'farm_goblins': [
    { itemId: 'goblin_mail', quantity: 1, chance: 0.02 },
    { itemId: 'goblin_champion_scroll', quantity: 1, chance: 0.001 },
  ],
  // Wolves
  'farm_wolves': [
    { itemId: 'fang_necklace', quantity: 1, chance: 0.005 },
    { itemId: 'howl_essence', quantity: 1, chance: 0.03 },
  ],
  // Zombies
  'farm_zombies': [
    { itemId: 'zombie_champion_scroll', quantity: 1, chance: 0.001 },
    { itemId: 'undead_essence', quantity: 1, chance: 0.05 },
  ],
  // Dragons - the big money makers
  'farm_dragons': [
    { itemId: 'draconic_visage', quantity: 1, chance: 0.001 },
    { itemId: 'dragon_claw_fragment', quantity: 1, chance: 0.02 },
    { itemId: 'dragon_egg_shard', quantity: 1, chance: 0.005 },
  ],
  'hunt_dragon_mag': [
    { itemId: 'draconic_visage', quantity: 1, chance: 0.002 },
    { itemId: 'dragon_claw_fragment', quantity: 2, chance: 0.03 },
    { itemId: 'dragon_egg_shard', quantity: 1, chance: 0.01 },
  ],
  'hunt_dragon_ran': [
    { itemId: 'draconic_visage', quantity: 1, chance: 0.002 },
    { itemId: 'dragon_claw_fragment', quantity: 2, chance: 0.03 },
    { itemId: 'dragon_egg_shard', quantity: 1, chance: 0.01 },
  ],
  // Abyssal demons - whip chasers
  'hunt_abyssal_att': [
    { itemId: 'abyssal_dagger', quantity: 1, chance: 0.0005 },
    { itemId: 'abyssal_bludgeon_piece', quantity: 1, chance: 0.001 },
    { itemId: 'abyssal_thread', quantity: 1, chance: 0.02 },
  ],
  'slay_abyssal_demon': [
    { itemId: 'abyssal_dagger', quantity: 1, chance: 0.0005 },
    { itemId: 'abyssal_bludgeon_piece', quantity: 1, chance: 0.001 },
    { itemId: 'abyssal_thread', quantity: 1, chance: 0.02 },
  ],
  // Vampires
  'hunt_vampire_mag': [
    { itemId: 'blood_diamond', quantity: 1, chance: 0.005 },
    { itemId: 'vampire_fang', quantity: 1, chance: 0.03 },
    { itemId: 'blood_shard', quantity: 1, chance: 0.001 },
  ],
  'hunt_vampire_lord': [
    { itemId: 'blood_diamond', quantity: 1, chance: 0.01 },
    { itemId: 'vampire_fang', quantity: 2, chance: 0.05 },
    { itemId: 'blood_shard', quantity: 1, chance: 0.005 },
    { itemId: 'sanguinesti_staff_piece', quantity: 1, chance: 0.0005 },
  ],
  // Hellhounds
  'hunt_hellhound_ran': [
    { itemId: 'smouldering_stone', quantity: 1, chance: 0.003 },
    { itemId: 'hellfire_metal', quantity: 1, chance: 0.02 },
    { itemId: 'infernal_thread', quantity: 1, chance: 0.01 },
  ],
  // Void creatures
  'farm_void_monsters': [
    { itemId: 'void_sigil', quantity: 1, chance: 0.005 },
    { itemId: 'void_crystal', quantity: 1, chance: 0.01 },
    { itemId: 'void_walker_emblem', quantity: 1, chance: 0.001 },
  ],
  'hunt_void_ran': [
    { itemId: 'void_sigil', quantity: 1, chance: 0.01 },
    { itemId: 'void_crystal', quantity: 2, chance: 0.02 },
    { itemId: 'void_walker_emblem', quantity: 1, chance: 0.005 },
  ],
  // Cerberus
  'hunt_cerberus': [
    { itemId: 'smouldering_stone', quantity: 1, chance: 0.01 },
    { itemId: 'hellfire_metal', quantity: 2, chance: 0.05 },
  ],
  // Zulrah
  'hunt_zulrah': [
    { itemId: 'tanzanite_fang', quantity: 1, chance: 0.005 },
    { itemId: 'magic_fang', quantity: 1, chance: 0.005 },
    { itemId: 'serpentine_scale', quantity: 5, chance: 0.1 },
  ],
  // Vorkath
  'hunt_vorkath': [
    { itemId: 'vorkath_head', quantity: 1, chance: 0.02 },
    { itemId: 'dragonbone_necklace_piece', quantity: 1, chance: 0.01 },
    { itemId: 'skeletal_visage', quantity: 1, chance: 0.002 },
  ],
  // Hydra
  'hunt_hydra': [
    { itemId: 'hydra_leather', quantity: 1, chance: 0.02 },
    { itemId: 'hydra_fang', quantity: 1, chance: 0.01 },
  ],
  'hunt_alchemical_hydra': [
    { itemId: 'hydra_leather', quantity: 3, chance: 0.05 },
    { itemId: 'hydra_claw', quantity: 1, chance: 0.005 },
    { itemId: 'hydra_heart', quantity: 1, chance: 0.002 },
  ],
  // Elves
  'hunt_elf_att': [
    { itemId: 'crystal_seed', quantity: 1, chance: 0.01 },
    { itemId: 'elven_signet', quantity: 1, chance: 0.002 },
  ],
  // Gargoyles
  'hunt_gargoyle_att': [
    { itemId: 'granite_maul_handle', quantity: 1, chance: 0.005 },
    { itemId: 'gargoyle_heart', quantity: 1, chance: 0.002 },
  ],
  // Cave horror
  'slay_cave_horror': [
    { itemId: 'cave_horror_fang', quantity: 1, chance: 0.01 },
  ],
  // Dust devil
  'slay_dust_devil': [
    { itemId: 'dust_battlestaff_piece', quantity: 1, chance: 0.005 },
  ],
  // Smoke devil
  'slay_smoke_devil': [
    { itemId: 'smoke_battlestaff_piece', quantity: 1, chance: 0.005 },
  ],
  // Raids
  'raid_theatre_of_blood': [
    { itemId: 'avernic_defender_hilt', quantity: 1, chance: 0.01 },
    { itemId: 'ghrazi_rapier', quantity: 1, chance: 0.005 },
    { itemId: 'sanguinesti_staff_piece', quantity: 1, chance: 0.005 },
  ],
  'raid_chambers_of_xeric': [
    { itemId: 'twisted_bow_limb', quantity: 1, chance: 0.005 },
    { itemId: 'elder_maul_shaft', quantity: 1, chance: 0.008 },
    { itemId: 'kodai_insignia', quantity: 1, chance: 0.008 },
  ],
  // Mid-game boss unique drops
  'boss_stoneguard': [
    { itemId: 'titan_gauntlets', quantity: 1, chance: 0.01 },
    { itemId: 'earthshaker_maul', quantity: 1, chance: 0.003 },
    { itemId: 'titan_core', quantity: 1, chance: 0.05 },
  ],
  'boss_shadowfang': [
    { itemId: 'shadow_cloak', quantity: 1, chance: 0.008 },
    { itemId: 'nightfang_daggers', quantity: 1, chance: 0.003 },
    { itemId: 'shadow_fang', quantity: 2, chance: 0.05 },
  ],
  'boss_leviathan': [
    { itemId: 'trident_of_tides', quantity: 1, chance: 0.003 },
    { itemId: 'leviathan_helm', quantity: 1, chance: 0.005 },
    { itemId: 'leviathan_scale', quantity: 2, chance: 0.05 },
  ],
  // Archfiend unique drops
  'archfiend_hollow_king': [
    { itemId: 'hollow_crown', quantity: 1, chance: 0.002 },
    { itemId: 'hollow_scepter', quantity: 1, chance: 0.005 },
    { itemId: 'kings_vestige', quantity: 1, chance: 0.02 },
  ],
  'archfiend_emberclaw': [
    { itemId: 'emberclaws_fang', quantity: 1, chance: 0.005 },
    { itemId: 'charred_crown', quantity: 1, chance: 0.008 },
    { itemId: 'ember_core', quantity: 1, chance: 0.02 },
  ],
  'archfiend_voidmother': [
    { itemId: 'voidmother_eye', quantity: 1, chance: 0.005 },
    { itemId: 'abyssal_membrane', quantity: 1, chance: 0.008 },
  ],
  'archfiend_stormwarden': [
    { itemId: 'stormwarden_crest_helm', quantity: 1, chance: 0.005 },
    { itemId: 'tempest_lance', quantity: 1, chance: 0.002 },
  ],
  'archfiend_elder_wyrm': [
    { itemId: 'ashen_plate', quantity: 1, chance: 0.002 },
    { itemId: 'wyrm_spine_bow', quantity: 1, chance: 0.003 },
  ],
};

export const ACTIONS: SkillAction[] = [
  // Runecrafting
  { id: 'craft_air_rune', name: 'Craft Air Rune', skill: 'runecrafting', levelRequired: 1, xpReward: 10, duration: 2000, description: 'Harness the power of the wind.', inputs: [{ itemId: 'rune_essence', quantity: 1 }], outputs: [{ itemId: 'air_rune', quantity: 2, chance: 1 }] },
  { id: 'craft_mind_rune', name: 'Craft Mind Rune', skill: 'runecrafting', levelRequired: 5, xpReward: 15, duration: 2000, inputs: [{ itemId: 'rune_essence', quantity: 1 }], outputs: [{ itemId: 'mind_rune', quantity: 2, chance: 1 }] },
  { id: 'craft_water_rune', name: 'Craft Water Rune', skill: 'runecrafting', levelRequired: 10, xpReward: 20, duration: 2000, inputs: [{ itemId: 'rune_essence', quantity: 1 }], outputs: [{ itemId: 'water_rune', quantity: 2, chance: 1 }] },
  { id: 'craft_earth_rune', name: 'Craft Earth Rune', skill: 'runecrafting', levelRequired: 15, xpReward: 25, duration: 2000, inputs: [{ itemId: 'rune_essence', quantity: 1 }], outputs: [{ itemId: 'earth_rune', quantity: 2, chance: 1 }] },
  { id: 'craft_fire_rune', name: 'Craft Fire Rune', skill: 'runecrafting', levelRequired: 20, xpReward: 30, duration: 2000, inputs: [{ itemId: 'rune_essence', quantity: 1 }], outputs: [{ itemId: 'fire_rune', quantity: 2, chance: 1 }] },
  { id: 'craft_cosmic_rune', name: 'Craft Cosmic Rune', skill: 'runecrafting', levelRequired: 27, xpReward: 40, duration: 2200, inputs: [{ itemId: 'rune_essence', quantity: 2 }], outputs: [{ itemId: 'cosmic_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_chaos_rune', name: 'Craft Chaos Rune', skill: 'runecrafting', levelRequired: 35, xpReward: 50, duration: 2500, inputs: [{ itemId: 'rune_essence', quantity: 2 }], outputs: [{ itemId: 'chaos_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_astral_rune', name: 'Craft Astral Rune', skill: 'runecrafting', levelRequired: 40, xpReward: 55, duration: 2600, inputs: [{ itemId: 'rune_essence', quantity: 2 }], outputs: [{ itemId: 'astral_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_nature_rune', name: 'Craft Nature Rune', skill: 'runecrafting', levelRequired: 44, xpReward: 60, duration: 2800, inputs: [{ itemId: 'rune_essence', quantity: 2 }], outputs: [{ itemId: 'nature_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_death_rune', name: 'Craft Death Rune', skill: 'runecrafting', levelRequired: 50, xpReward: 75, duration: 3000, inputs: [{ itemId: 'rune_essence', quantity: 3 }], outputs: [{ itemId: 'death_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_law_rune', name: 'Craft Law Rune', skill: 'runecrafting', levelRequired: 54, xpReward: 85, duration: 3200, inputs: [{ itemId: 'rune_essence', quantity: 3 }], outputs: [{ itemId: 'law_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_blood_rune', name: 'Craft Blood Rune', skill: 'runecrafting', levelRequired: 65, xpReward: 100, duration: 3500, inputs: [{ itemId: 'rune_essence', quantity: 4 }], outputs: [{ itemId: 'blood_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_soul_rune', name: 'Craft Soul Rune', skill: 'runecrafting', levelRequired: 75, xpReward: 120, duration: 4000, inputs: [{ itemId: 'rune_essence', quantity: 4 }], outputs: [{ itemId: 'soul_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_wrath_rune', name: 'Craft Wrath Rune', skill: 'runecrafting', levelRequired: 95, xpReward: 1500, duration: 5000, inputs: [{ itemId: 'divine_essence', quantity: 1 }], outputs: [{ itemId: 'wrath_rune', quantity: 1, chance: 1 }] },
  { id: 'craft_multi_air', name: 'Craft 50x Air Rune', skill: 'runecrafting', levelRequired: 99, xpReward: 2000, duration: 2000, inputs: [{ itemId: 'divine_essence', quantity: 1 }], outputs: [{ itemId: 'air_rune', quantity: 50, chance: 1 }] },

  // Thieving
  { id: 'pickpocket_man', name: 'Pickpocket Man', skill: 'thieving', levelRequired: 1, xpReward: 15, duration: 2000, description: 'A simple target for a novice thief.', outputs: [{ itemId: 'coin_purse', quantity: 1, chance: 0.5 }] },
  { id: 'steal_tea', name: 'Steal Tea', skill: 'thieving', levelRequired: 5, xpReward: 20, duration: 2500, description: 'A quick grab from the market stall.', outputs: [{ itemId: 'coin_purse', quantity: 1, chance: 0.6 }] },
  { id: 'pickpocket_farmer', name: 'Pickpocket Farmer', skill: 'thieving', levelRequired: 10, xpReward: 25, duration: 2500, description: 'Farmers often carry seeds and small change.', outputs: [{ itemId: 'coin_purse', quantity: 1, chance: 0.7 }, { itemId: 'potato_seeds', quantity: 1, chance: 0.2 }] },
  { id: 'steal_silk', name: 'Steal Silk', skill: 'thieving', levelRequired: 15, xpReward: 35, duration: 3000, description: 'Fine silk is worth a pretty penny.', outputs: [{ itemId: 'silk', quantity: 1, chance: 0.8 }] },
  { id: 'pickpocket_warrior', name: 'Pickpocket Warrior', skill: 'thieving', levelRequired: 25, xpReward: 45, duration: 3500, description: 'Warriors carry combat supplies and gold.', outputs: [{ itemId: 'coin_purse', quantity: 2, chance: 0.5 }, { itemId: 'iron_ore', quantity: 1, chance: 0.1 }] },
  { id: 'pickpocket_guard', name: 'Pickpocket Guard', skill: 'thieving', levelRequired: 30, xpReward: 60, duration: 4000, description: 'Guards are alert, but their pockets are heavy.', outputs: [{ itemId: 'coin_purse', quantity: 2, chance: 0.6 }, { itemId: 'iron_ore', quantity: 1, chance: 0.2 }] },
  { id: 'steal_fur', name: 'Steal Fur', skill: 'thieving', levelRequired: 35, xpReward: 75, duration: 4500, description: 'Soft furs from the trader.', outputs: [{ itemId: 'coin_purse', quantity: 3, chance: 0.7 }] },
  { id: 'pickpocket_knight', name: 'Pickpocket Knight', skill: 'thieving', levelRequired: 45, xpReward: 90, duration: 5000, description: 'Knights carry high-quality ores and gold.', outputs: [{ itemId: 'coin_purse', quantity: 3, chance: 0.8 }, { itemId: 'steel_ore', quantity: 1, chance: 0.2 }] },
  { id: 'crack_safe', name: 'Crack Safe', skill: 'thieving', levelRequired: 50, xpReward: 120, duration: 6000, description: 'Requires a lockpick. Contains gems and gold.', inputs: [{ itemId: 'lockpick', quantity: 1 }], outputs: [{ itemId: 'coin_purse', quantity: 5, chance: 1 }, { itemId: 'uncut_ruby', quantity: 1, chance: 0.1 }] },
  { id: 'steal_silver', name: 'Steal Silver', skill: 'thieving', levelRequired: 60, xpReward: 150, duration: 6500, description: 'Shiny silver trinkets.', outputs: [{ itemId: 'coin_purse', quantity: 4, chance: 0.9 }] },
  { id: 'pickpocket_paladin', name: 'Pickpocket Paladin', skill: 'thieving', levelRequired: 70, xpReward: 200, duration: 7000, description: 'Paladins carry blessed items and mithril.', outputs: [{ itemId: 'coin_purse', quantity: 5, chance: 0.9 }, { itemId: 'mithril_ore', quantity: 1, chance: 0.3 }] },
  { id: 'steal_spices', name: 'Steal Spices', skill: 'thieving', levelRequired: 75, xpReward: 250, duration: 7500, description: 'Rare spices from distant lands.', outputs: [{ itemId: 'coin_purse', quantity: 6, chance: 1 }] },
  { id: 'pickpocket_hero', name: 'Pickpocket Hero', skill: 'thieving', levelRequired: 85, xpReward: 350, duration: 8000, description: 'Only a master thief would dare rob a hero.', outputs: [{ itemId: 'coin_purse', quantity: 8, chance: 1 }, { itemId: 'adamant_ore', quantity: 1, chance: 0.4 }, { itemId: 'runite_ore', quantity: 1, chance: 0.05 }] },
  { id: 'steal_gems', name: 'Steal Gems', skill: 'thieving', levelRequired: 95, xpReward: 500, duration: 10000, description: 'Requires a lockpick. The ultimate gem heist.', inputs: [{ itemId: 'lockpick', quantity: 1 }], outputs: [{ itemId: 'uncut_diamond', quantity: 1, chance: 0.5 }, { itemId: 'uncut_ruby', quantity: 1, chance: 0.8 }, { itemId: 'coin_purse', quantity: 10, chance: 1 }] },

  { id: 'pickpocket_elf', name: 'Pickpocket Elf', skill: 'thieving', levelRequired: 90, xpReward: 1200, duration: 5000, outputs: [
    { itemId: 'elf_dust', quantity: 2, chance: 0.5 },
    { itemId: 'coin_purse', quantity: 15, chance: 1 },
    { itemId: 'clue_scroll_master', quantity: 1, chance: 0.01 }
  ] },
  { id: 'pickpocket_tzhaar', name: 'Pickpocket TzHaar', skill: 'thieving', levelRequired: 95, xpReward: 2500, duration: 6000, outputs: [
    { itemId: 'obsidian', quantity: 1, chance: 0.2 },
    { itemId: 'coin_purse', quantity: 20, chance: 1 },
    { itemId: 'clue_scroll_master', quantity: 1, chance: 0.05 }
  ] },
  { id: 'solve_master_clue', name: 'Solve Master Clue', skill: 'thieving', levelRequired: 99, xpReward: 10000, duration: 30000, inputs: [{ itemId: 'clue_scroll_master', quantity: 1 }], outputs: [{ itemId: 'clue_reward_box', quantity: 1, chance: 1 }] },

  // Prayer
  { id: 'bury_bones', name: 'Bury Bones', skill: 'prayer', levelRequired: 1, xpReward: 15, duration: 1000, inputs: [{ itemId: 'bones', quantity: 1 }], outputs: [] },
  { id: 'bury_wolf_bones', name: 'Bury Wolf Bones', skill: 'prayer', levelRequired: 10, xpReward: 30, duration: 1000, inputs: [{ itemId: 'wolf_bone', quantity: 1 }], outputs: [] },
  { id: 'bury_big_bones', name: 'Bury Big Bones', skill: 'prayer', levelRequired: 15, xpReward: 45, duration: 1000, inputs: [{ itemId: 'big_bones', quantity: 1 }], outputs: [] },
  { id: 'bury_giant_bones', name: 'Bury Giant Bones', skill: 'prayer', levelRequired: 25, xpReward: 60, duration: 1000, inputs: [{ itemId: 'giant_bone', quantity: 1 }], outputs: [] },
  { id: 'offer_at_altar', name: 'Offer at Altar', skill: 'prayer', levelRequired: 35, xpReward: 100, duration: 3000, description: 'Offer bones at a holy altar for amplified prayer XP.', inputs: [{ itemId: 'giant_bone', quantity: 3 }], outputs: [{ itemId: 'celestial_essence', quantity: 1, chance: 0.05 }] },
  { id: 'bury_demon_bones', name: 'Bury Demon Bones', skill: 'prayer', levelRequired: 50, xpReward: 150, duration: 1000, inputs: [{ itemId: 'demon_bone', quantity: 1 }], outputs: [] },
  { id: 'bury_dragon_bones', name: 'Bury Dragon Bones', skill: 'prayer', levelRequired: 60, xpReward: 250, duration: 1500, inputs: [{ itemId: 'dragon_bones', quantity: 1 }], outputs: [] },
  { id: 'bury_ancient_bones', name: 'Bury Ancient Bones', skill: 'prayer', levelRequired: 70, xpReward: 300, duration: 1000, inputs: [{ itemId: 'ancient_bone', quantity: 1 }], outputs: [] },
  { id: 'sacred_offering', name: 'Sacred Offering', skill: 'prayer', levelRequired: 80, xpReward: 500, duration: 5000, description: 'A powerful ritual combining rare bones with prayer.', inputs: [{ itemId: 'ancient_bone', quantity: 2 }, { itemId: 'dragon_bones', quantity: 1 }], outputs: [{ itemId: 'celestial_essence', quantity: 3, chance: 0.15 }] },
  { id: 'divine_communion', name: 'Divine Communion', skill: 'prayer', levelRequired: 90, xpReward: 1000, duration: 8000, description: 'Channel the gods themselves. Immense spiritual power.', inputs: [{ itemId: 'ancient_bone', quantity: 5 }, { itemId: 'spirit_herb', quantity: 3 }], outputs: [{ itemId: 'celestial_essence', quantity: 10, chance: 0.25 }] },

  // Mining Progression
  { id: 'mine_copper', name: 'Mine Copper', skill: 'mining', levelRequired: 1, xpReward: 10, duration: 3000, description: 'Extract copper ore from the earth.', toolRequired: 'bronze_pickaxe', outputs: [
    { itemId: 'copper_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_sapphire', quantity: 1, chance: 0.01 },
  ] },
  { id: 'mine_tin', name: 'Mine Tin', skill: 'mining', levelRequired: 1, xpReward: 10, duration: 3000, description: 'Extract tin ore from the earth.', toolRequired: 'bronze_pickaxe', outputs: [
    { itemId: 'tin_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_sapphire', quantity: 1, chance: 0.01 },
  ] },
  { id: 'mine_essence', name: 'Mine Essence', skill: 'mining', levelRequired: 5, xpReward: 12, duration: 3200, outputs: [
    { itemId: 'rune_essence', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_clay', name: 'Mine Clay', skill: 'mining', levelRequired: 10, xpReward: 15, duration: 3500, outputs: [
    { itemId: 'clay', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_silver', name: 'Mine Silver', skill: 'mining', levelRequired: 15, xpReward: 20, duration: 4000, outputs: [
    { itemId: 'silver_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_sapphire', quantity: 1, chance: 0.02 }
  ] },
  { id: 'mine_limestone', name: 'Mine Limestone', skill: 'mining', levelRequired: 20, xpReward: 30, duration: 4500, outputs: [
    { itemId: 'limestone', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_iron', name: 'Mine Iron', skill: 'mining', levelRequired: 25, xpReward: 40, duration: 5000, outputs: [
    { itemId: 'iron_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_emerald', quantity: 1, chance: 0.01 }
  ] },
  { id: 'mine_coal_low', name: 'Mine Coal (Low Tier)', skill: 'mining', levelRequired: 30, xpReward: 50, duration: 5500, outputs: [
    { itemId: 'steel_ore', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_sandstone', name: 'Mine Sandstone', skill: 'mining', levelRequired: 35, xpReward: 55, duration: 6000, outputs: [
    { itemId: 'sandstone', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_coal', name: 'Mine Coal', skill: 'mining', levelRequired: 40, xpReward: 70, duration: 7000, outputs: [
    { itemId: 'steel_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_ruby', quantity: 1, chance: 0.01 }
  ] },
  { id: 'mine_granite', name: 'Mine Granite', skill: 'mining', levelRequired: 45, xpReward: 80, duration: 7500, outputs: [
    { itemId: 'granite', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_gold_low', name: 'Mine Gold (Low Tier)', skill: 'mining', levelRequired: 50, xpReward: 90, duration: 8000, outputs: [
    { itemId: 'gold_ore', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_gold', name: 'Mine Gold', skill: 'mining', levelRequired: 55, xpReward: 110, duration: 9000, outputs: [
    { itemId: 'gold_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_emerald', quantity: 1, chance: 0.03 }
  ] },
  { id: 'mine_mithril_low', name: 'Mine Mithril (Low Tier)', skill: 'mining', levelRequired: 60, xpReward: 125, duration: 9500, outputs: [
    { itemId: 'mithril_ore', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_mithril', name: 'Mine Mithril', skill: 'mining', levelRequired: 65, xpReward: 140, duration: 10000, outputs: [
    { itemId: 'mithril_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_sapphire', quantity: 1, chance: 0.05 }
  ] },
  { id: 'mine_basalt', name: 'Mine Basalt', skill: 'mining', levelRequired: 70, xpReward: 180, duration: 11000, outputs: [
    { itemId: 'basalt', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_platinum_low', name: 'Mine Platinum (Low Tier)', skill: 'mining', levelRequired: 75, xpReward: 200, duration: 11500, outputs: [
    { itemId: 'platinum_ore', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_platinum', name: 'Mine Platinum', skill: 'mining', levelRequired: 80, xpReward: 220, duration: 12000, outputs: [
    { itemId: 'platinum_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_ruby', quantity: 1, chance: 0.05 }
  ] },
  { id: 'mine_adamant', name: 'Mine Adamant', skill: 'mining', levelRequired: 85, xpReward: 300, duration: 15000, outputs: [
    { itemId: 'adamant_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.02 }
  ] },
  { id: 'mine_marble', name: 'Mine Marble', skill: 'mining', levelRequired: 90, xpReward: 450, duration: 18000, outputs: [
    { itemId: 'marble', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_runite', name: 'Mine Runite', skill: 'mining', levelRequired: 95, xpReward: 800, duration: 25000, outputs: [
    { itemId: 'runite_ore', quantity: 1, chance: 1 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.05 }
  ] },
  { id: 'mine_obsidian', name: 'Mine Obsidian', skill: 'mining', levelRequired: 99, xpReward: 1200, duration: 30000, outputs: [
    { itemId: 'obsidian', quantity: 1, chance: 1 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.1 }
  ] },
  
  { id: 'mine_dragonite', name: 'Mine Dragonite', skill: 'mining', levelRequired: 99, xpReward: 2500, duration: 40000, outputs: [
    { itemId: 'dragonite_ore', quantity: 1, chance: 1 },
    { itemId: 'divine_essence', quantity: 1, chance: 0.05 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.2 }
  ] },
  { id: 'mine_necrite', name: 'Mine Necrite', skill: 'mining', levelRequired: 99, xpReward: 3000, duration: 45000, outputs: [
    { itemId: 'necrite_ore', quantity: 1, chance: 1 },
    { itemId: 'divine_essence', quantity: 1, chance: 0.1 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.3 }
  ] },
  { id: 'mine_divine_essence', name: 'Mine Divine Essence', skill: 'mining', levelRequired: 99, xpReward: 5000, duration: 60000, outputs: [
    { itemId: 'divine_essence', quantity: 1, chance: 1 }
  ] },
  { id: 'mine_necrite_deep', name: 'Deep Mine Necrite', skill: 'mining', levelRequired: 99, xpReward: 5000, duration: 60000, secondarySkillRequired: { skill: 'slayer', level: 90 }, outputs: [
    { itemId: 'necrite_ore', quantity: 1, chance: 1 },
    { itemId: 'ancient_bone', quantity: 1, chance: 0.1 }
  ] },
  { id: 'mine_divine_essence_batch', name: 'Mine Divine Essence (Batch)', skill: 'mining', levelRequired: 90, xpReward: 500, duration: 10000, outputs: [
    { itemId: 'divine_essence', quantity: 5, chance: 1 }
  ] },
  
  // Woodcutting Progression
  { id: 'chop_logs', name: 'Chop Logs', skill: 'woodcutting', levelRequired: 1, xpReward: 10, duration: 3000, description: 'Chop down a standard tree.', toolRequired: 'bronze_axe', outputs: [
    { itemId: 'logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.05 }
  ] },
  { id: 'chop_dry', name: 'Chop Dead Tree', skill: 'woodcutting', levelRequired: 5, xpReward: 15, duration: 4000, outputs: [
    { itemId: 'dry_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.06 }
  ] },
  { id: 'chop_fruit', name: 'Chop Fruit Tree', skill: 'woodcutting', levelRequired: 10, xpReward: 22, duration: 4500, outputs: [
    { itemId: 'logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.07 }
  ] },
  { id: 'chop_oak', name: 'Chop Oak', skill: 'woodcutting', levelRequired: 15, xpReward: 30, duration: 5000, outputs: [
    { itemId: 'oak_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.08 }
  ] },
  { id: 'chop_achey', name: 'Chop Achey Tree', skill: 'woodcutting', levelRequired: 22, xpReward: 45, duration: 6000, outputs: [
    { itemId: 'achey_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.09 }
  ] },
  { id: 'chop_pine', name: 'Chop Pine', skill: 'woodcutting', levelRequired: 30, xpReward: 60, duration: 7000, outputs: [
    { itemId: 'pine_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.1 }
  ] },
  { id: 'chop_teak_low', name: 'Chop Teak (Low Tier)', skill: 'woodcutting', levelRequired: 35, xpReward: 70, duration: 7500, outputs: [
    { itemId: 'teak_logs', quantity: 1, chance: 1 }
  ] },
  { id: 'chop_willow', name: 'Chop Willow', skill: 'woodcutting', levelRequired: 40, xpReward: 80, duration: 8000, outputs: [
    { itemId: 'willow_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.11 }
  ] },
  { id: 'chop_mahogany_low', name: 'Chop Mahogany (Low Tier)', skill: 'woodcutting', levelRequired: 45, xpReward: 100, duration: 8500, outputs: [
    { itemId: 'mahogany_logs', quantity: 1, chance: 1 }
  ] },
  { id: 'chop_teak', name: 'Chop Teak', skill: 'woodcutting', levelRequired: 50, xpReward: 120, duration: 9000, outputs: [
    { itemId: 'teak_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.12 }
  ] },
  { id: 'chop_blisterwood', name: 'Chop Blisterwood', skill: 'woodcutting', levelRequired: 55, xpReward: 150, duration: 9500, outputs: [
    { itemId: 'blisterwood_logs', quantity: 1, chance: 1 }
  ] },
  { id: 'chop_mahogany', name: 'Chop Mahogany', skill: 'woodcutting', levelRequired: 60, xpReward: 180, duration: 10000, outputs: [
    { itemId: 'mahogany_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.13 }
  ] },
  { id: 'chop_eucalyptus_low', name: 'Chop Eucalyptus (Low Tier)', skill: 'woodcutting', levelRequired: 65, xpReward: 210, duration: 11000, outputs: [
    { itemId: 'eucalyptus_logs', quantity: 1, chance: 1 }
  ] },
  { id: 'chop_eucalyptus', name: 'Chop Eucalyptus', skill: 'woodcutting', levelRequired: 70, xpReward: 250, duration: 12000, outputs: [
    { itemId: 'eucalyptus_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.14 }
  ] },
  { id: 'chop_maple_low', name: 'Chop Maple (Low Tier)', skill: 'woodcutting', levelRequired: 75, xpReward: 300, duration: 13000, outputs: [
    { itemId: 'maple_logs', quantity: 1, chance: 1 }
  ] },
  { id: 'chop_maple', name: 'Chop Maple', skill: 'woodcutting', levelRequired: 80, xpReward: 350, duration: 14000, outputs: [
    { itemId: 'maple_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.15 }
  ] },
  { id: 'chop_elder_low', name: 'Chop Elder (Low Tier)', skill: 'woodcutting', levelRequired: 84, xpReward: 420, duration: 15000, outputs: [
    { itemId: 'elder_logs', quantity: 1, chance: 1 }
  ] },
  { id: 'chop_arctic_pine', name: 'Chop Arctic Pine', skill: 'woodcutting', levelRequired: 88, xpReward: 500, duration: 16000, outputs: [
    { itemId: 'arctic_pine_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.16 }
  ] },
  { id: 'chop_elder', name: 'Chop Elder', skill: 'woodcutting', levelRequired: 92, xpReward: 650, duration: 18000, outputs: [
    { itemId: 'elder_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.17 }
  ] },
  { id: 'chop_yew', name: 'Chop Yew', skill: 'woodcutting', levelRequired: 94, xpReward: 800, duration: 20000, outputs: [
    { itemId: 'yew_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.18 }
  ] },
  { id: 'chop_redwood', name: 'Chop Redwood', skill: 'woodcutting', levelRequired: 97, xpReward: 1200, duration: 25000, outputs: [
    { itemId: 'redwood_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.2 }
  ] },
  { id: 'chop_magic', name: 'Chop Magic', skill: 'woodcutting', levelRequired: 99, xpReward: 2000, duration: 35000, outputs: [
    { itemId: 'magic_logs', quantity: 1, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.25 }
  ] },
  
  // Fishing Progression
  { id: 'fish_shrimp', name: 'Fish Shrimp', skill: 'fishing', levelRequired: 1, xpReward: 10, duration: 4000, outputs: [{ itemId: 'raw_shrimp', quantity: 1, chance: 1 }] },
  { id: 'fish_sardine', name: 'Fish Sardine', skill: 'fishing', levelRequired: 5, xpReward: 15, duration: 4500, outputs: [{ itemId: 'raw_sardine', quantity: 1, chance: 1 }] },
  { id: 'fish_herring', name: 'Fish Herring', skill: 'fishing', levelRequired: 10, xpReward: 20, duration: 5000, outputs: [{ itemId: 'raw_herring', quantity: 1, chance: 1 }] },
  { id: 'fish_anchovies', name: 'Fish Anchovies', skill: 'fishing', levelRequired: 15, xpReward: 25, duration: 5500, outputs: [{ itemId: 'raw_anchovies', quantity: 1, chance: 1 }] },
  { id: 'fish_rainbow_trout', name: 'Fish Rainbow Trout', skill: 'fishing', levelRequired: 18, xpReward: 30, duration: 5800, outputs: [{ itemId: 'raw_rainbow_trout', quantity: 1, chance: 1 }] },
  { id: 'fish_pike', name: 'Fish Pike', skill: 'fishing', levelRequired: 22, xpReward: 35, duration: 6000, outputs: [{ itemId: 'raw_pike', quantity: 1, chance: 1 }] },
  { id: 'fish_mackerel', name: 'Fish Mackerel', skill: 'fishing', levelRequired: 30, xpReward: 50, duration: 6500, outputs: [{ itemId: 'raw_mackerel', quantity: 1, chance: 1 }] },
  { id: 'fish_trout', name: 'Fish Trout', skill: 'fishing', levelRequired: 38, xpReward: 70, duration: 7000, outputs: [{ itemId: 'raw_trout', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.02 }] },
  { id: 'fish_cod', name: 'Fish Cod', skill: 'fishing', levelRequired: 45, xpReward: 90, duration: 7500, outputs: [{ itemId: 'raw_cod', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.03 }] },
  { id: 'fish_tuna', name: 'Fish Tuna', skill: 'fishing', levelRequired: 55, xpReward: 120, duration: 8000, outputs: [{ itemId: 'raw_tuna', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.04 }] },
  { id: 'fish_bass', name: 'Fish Bass', skill: 'fishing', levelRequired: 65, xpReward: 160, duration: 9000, outputs: [{ itemId: 'raw_bass', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.05 }] },
  { id: 'fish_salmon', name: 'Fish Salmon', skill: 'fishing', levelRequired: 75, xpReward: 220, duration: 10000, outputs: [{ itemId: 'raw_salmon', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.06 }] },
  { id: 'fish_karambwan', name: 'Fish Karambwan', skill: 'fishing', levelRequired: 82, xpReward: 300, duration: 11000, outputs: [{ itemId: 'raw_karambwan', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.07 }] },
  { id: 'fish_swordfish', name: 'Fish Swordfish', skill: 'fishing', levelRequired: 88, xpReward: 400, duration: 13000, outputs: [{ itemId: 'raw_swordfish', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.08 }] },
  { id: 'fish_lobster', name: 'Fish Lobster', skill: 'fishing', levelRequired: 93, xpReward: 550, duration: 15000, outputs: [{ itemId: 'raw_lobster', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.1 }] },
  { id: 'fish_monkfish', name: 'Fish Monkfish', skill: 'fishing', levelRequired: 96, xpReward: 800, duration: 18000, outputs: [{ itemId: 'raw_monkfish', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.12 }] },
  { id: 'fish_mantaray', name: 'Fish Manta Ray', skill: 'fishing', levelRequired: 98, xpReward: 1200, duration: 22000, outputs: [{ itemId: 'raw_mantaray', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.15 }] },
  { id: 'fish_shark', name: 'Fish Shark', skill: 'fishing', levelRequired: 99, xpReward: 2000, duration: 30000, outputs: [{ itemId: 'raw_shark', quantity: 1, chance: 1 }, { itemId: 'pearl', quantity: 1, chance: 0.2 }] },
  
  // Hunting Progression
  { id: 'catch_toad', name: 'Catch Toad', skill: 'hunting', levelRequired: 1, xpReward: 10, duration: 3000, outputs: [{ itemId: 'toads_legs', quantity: 1, chance: 0.5 }] },
  { id: 'hunt_rabbit', name: 'Hunt Rabbit', skill: 'hunting', levelRequired: 1, xpReward: 15, duration: 4000, outputs: [
    { itemId: 'raw_meat', quantity: 1, chance: 1 },
    { itemId: 'fur', quantity: 1, chance: 0.5 }
  ] },
  { id: 'hunt_chicken', name: 'Hunt Chicken', skill: 'hunting', levelRequired: 5, xpReward: 20, duration: 4500, outputs: [
    { itemId: 'raw_chicken', quantity: 1, chance: 1 },
    { itemId: 'feathers', quantity: 10, chance: 1 }
  ] },
  { id: 'hunt_bird', name: 'Hunt Bird', skill: 'hunting', levelRequired: 8, xpReward: 25, duration: 5000, outputs: [
    { itemId: 'feathers', quantity: 15, chance: 1 },
    { itemId: 'bird_nest', quantity: 1, chance: 0.1 }
  ] },
  { id: 'hunt_cow', name: 'Hunt Cow', skill: 'hunting', levelRequired: 12, xpReward: 35, duration: 6000, outputs: [
    { itemId: 'raw_beef', quantity: 1, chance: 1 },
    { itemId: 'leather', quantity: 1, chance: 1 }
  ] },
  { id: 'hunt_fox', name: 'Hunt Fox', skill: 'hunting', levelRequired: 15, xpReward: 45, duration: 6500, outputs: [
    { itemId: 'fox_fur', quantity: 1, chance: 1 },
    { itemId: 'raw_meat', quantity: 1, chance: 0.5 }
  ] },
  { id: 'hunt_deer', name: 'Hunt Deer', skill: 'hunting', levelRequired: 22, xpReward: 60, duration: 8000, outputs: [
    { itemId: 'raw_meat', quantity: 2, chance: 1 },
    { itemId: 'fur', quantity: 2, chance: 1 }
  ] },
  { id: 'hunt_bear', name: 'Hunt Bear', skill: 'hunting', levelRequired: 35, xpReward: 100, duration: 10000, outputs: [
    { itemId: 'raw_bear_meat', quantity: 1, chance: 1 },
    { itemId: 'fur', quantity: 3, chance: 1 },
    { itemId: 'ancient_bone', quantity: 1, chance: 0.05 }
  ] },
  { id: 'hunt_grizzly', name: 'Hunt Grizzly', skill: 'hunting', levelRequired: 48, xpReward: 180, duration: 12000, outputs: [
    { itemId: 'raw_bear_meat', quantity: 2, chance: 1 },
    { itemId: 'grizzly_claw', quantity: 1, chance: 1 },
    { itemId: 'ancient_bone', quantity: 1, chance: 0.08 }
  ] },
  { id: 'hunt_boar', name: 'Hunt Boar', skill: 'hunting', levelRequired: 58, xpReward: 250, duration: 14000, outputs: [
    { itemId: 'raw_meat', quantity: 4, chance: 1 },
    { itemId: 'boar_hide', quantity: 1, chance: 1 }
  ] },
  { id: 'hunt_wolf', name: 'Hunt Wolf', skill: 'hunting', levelRequired: 68, xpReward: 400, duration: 16000, outputs: [
    { itemId: 'raw_meat', quantity: 6, chance: 1 },
    { itemId: 'wolf_fur', quantity: 3, chance: 1 },
    { itemId: 'ancient_bone', quantity: 1, chance: 0.1 }
  ] },
  { id: 'hunt_stag', name: 'Hunt Stag', skill: 'hunting', levelRequired: 78, xpReward: 600, duration: 18000, outputs: [
    { itemId: 'raw_meat', quantity: 8, chance: 1 },
    { itemId: 'stag_antler', quantity: 1, chance: 1 }
  ] },
  { id: 'hunt_dragon', name: 'Hunt Dragon', skill: 'hunting', levelRequired: 88, xpReward: 1500, duration: 25000, outputs: [
    { itemId: 'dragon_meat', quantity: 2, chance: 1 },
    { itemId: 'dragon_hide', quantity: 5, chance: 1 },
    { itemId: 'ancient_bone', quantity: 1, chance: 0.2 }
  ] },
  { id: 'hunt_mammoth', name: 'Hunt Mammoth', skill: 'hunting', levelRequired: 95, xpReward: 2500, duration: 35000, outputs: [
    { itemId: 'raw_meat', quantity: 15, chance: 1 },
    { itemId: 'mammoth_tusk', quantity: 1, chance: 1 },
    { itemId: 'ancient_bone', quantity: 2, chance: 0.5 }
  ] },

  // Farming Progression
  { id: 'farm_wheat', name: 'Farm Wheat', skill: 'farming', levelRequired: 1, xpReward: 15, duration: 8000, inputs: [{ itemId: 'wheat_seeds', quantity: 1 }], outputs: [{ itemId: 'wheat', quantity: 3, chance: 1 }] },
  { id: 'farm_potatoes', name: 'Farm Potatoes', skill: 'farming', levelRequired: 1, xpReward: 20, duration: 10000, inputs: [{ itemId: 'potato_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_potato', quantity: 3, chance: 1 }] },
  { id: 'farm_flax', name: 'Farm Flax', skill: 'farming', levelRequired: 3, xpReward: 25, duration: 11000, inputs: [{ itemId: 'flax_seeds', quantity: 1 }], outputs: [{ itemId: 'flax', quantity: 3, chance: 1 }] },
  { id: 'farm_onions', name: 'Farm Onions', skill: 'farming', levelRequired: 5, xpReward: 35, duration: 12000, inputs: [{ itemId: 'onion_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_onion', quantity: 4, chance: 1 }] },
  { id: 'farm_grapes', name: 'Farm Grapes', skill: 'farming', levelRequired: 8, xpReward: 45, duration: 13000, inputs: [{ itemId: 'grape_seeds', quantity: 1 }], outputs: [{ itemId: 'grapes', quantity: 4, chance: 1 }] },
  { id: 'farm_toadflax', name: 'Farm Toadflax', skill: 'farming', levelRequired: 38, xpReward: 150, duration: 15000, inputs: [{ itemId: 'toadflax_seeds', quantity: 1 }], outputs: [{ itemId: 'toadflax', quantity: 1, chance: 1 }] },
  { id: 'farm_tomatoes', name: 'Farm Tomatoes', skill: 'farming', levelRequired: 12, xpReward: 50, duration: 14000, inputs: [{ itemId: 'tomato_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_tomato', quantity: 4, chance: 1 }] },
  { id: 'farm_cabbage', name: 'Farm Cabbage', skill: 'farming', levelRequired: 20, xpReward: 70, duration: 16000, inputs: [{ itemId: 'cabbage_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_cabbage', quantity: 5, chance: 1 }] },
  { id: 'farm_herbs', name: 'Farm Herbs', skill: 'farming', levelRequired: 30, xpReward: 100, duration: 20000, inputs: [{ itemId: 'herb_seeds', quantity: 1 }], outputs: [{ itemId: 'herbs', quantity: 2, chance: 1 }] },
  { id: 'farm_strawberry', name: 'Farm Strawberry', skill: 'farming', levelRequired: 35, xpReward: 140, duration: 22000, inputs: [{ itemId: 'strawberry_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_strawberry', quantity: 5, chance: 1 }] },
  { id: 'farm_corn', name: 'Farm Corn', skill: 'farming', levelRequired: 42, xpReward: 180, duration: 25000, inputs: [{ itemId: 'corn_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_corn', quantity: 6, chance: 1 }] },
  { id: 'farm_papaya', name: 'Farm Papaya', skill: 'farming', levelRequired: 52, xpReward: 300, duration: 30000, inputs: [{ itemId: 'papaya_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_papaya', quantity: 3, chance: 1 }] },
  { id: 'farm_willow', name: 'Farm Willow Tree', skill: 'farming', levelRequired: 55, xpReward: 400, duration: 35000, inputs: [{ itemId: 'willow_seeds', quantity: 1 }], outputs: [{ itemId: 'willow_logs', quantity: 5, chance: 1 }] },
  { id: 'farm_watermelon', name: 'Farm Watermelon', skill: 'farming', levelRequired: 70, xpReward: 800, duration: 45000, inputs: [{ itemId: 'watermelon_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_watermelon', quantity: 3, chance: 1 }] },
  { id: 'farm_palm', name: 'Farm Palm Tree', skill: 'farming', levelRequired: 80, xpReward: 1200, duration: 55000, inputs: [{ itemId: 'palm_seeds', quantity: 1 }], outputs: [{ itemId: 'coconut', quantity: 5, chance: 1 }] },
  { id: 'farm_yew', name: 'Farm Yew Tree', skill: 'farming', levelRequired: 85, xpReward: 1500, duration: 60000, inputs: [{ itemId: 'yew_seeds', quantity: 1 }], outputs: [{ itemId: 'yew_logs', quantity: 5, chance: 1 }] },
  { id: 'farm_dragonfruit', name: 'Farm Dragonfruit', skill: 'farming', levelRequired: 92, xpReward: 2500, duration: 90000, inputs: [{ itemId: 'dragonfruit_seeds', quantity: 1 }], outputs: [{ itemId: 'raw_dragonfruit', quantity: 3, chance: 1 }] },
  { id: 'farm_magic', name: 'Farm Magic Tree', skill: 'farming', levelRequired: 99, xpReward: 3500, duration: 120000, inputs: [{ itemId: 'magic_seeds', quantity: 1 }], outputs: [{ itemId: 'magic_logs', quantity: 5, chance: 1 }] },

  // Smithing Progression
  { id: 'make_charcoal', name: 'Burn Charcoal', skill: 'smithing', levelRequired: 1, xpReward: 15, duration: 5000, description: 'Burn logs to create charcoal for smelting.', inputs: [{ itemId: 'logs', quantity: 2 }], outputs: [{ itemId: 'charcoal', quantity: 1, chance: 1 }] },
  { id: 'smelt_bronze', name: 'Smelt Bronze', skill: 'smithing', levelRequired: 1, xpReward: 15, duration: 5000, description: 'Combine copper and tin to make bronze.', inputs: [{ itemId: 'copper_ore', quantity: 1 }, { itemId: 'tin_ore', quantity: 1 }], outputs: [{ itemId: 'bronze_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_iron', name: 'Smelt Iron', skill: 'smithing', levelRequired: 15, xpReward: 35, duration: 7000, inputs: [{ itemId: 'iron_ore', quantity: 1 }], outputs: [{ itemId: 'iron_bar', quantity: 1, chance: 0.5 }] },
  { id: 'smelt_silver', name: 'Smelt Silver', skill: 'smithing', levelRequired: 25, xpReward: 45, duration: 8000, inputs: [{ itemId: 'silver_ore', quantity: 1 }], outputs: [{ itemId: 'silver_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_steel', name: 'Smelt Steel', skill: 'smithing', levelRequired: 35, xpReward: 70, duration: 10000, description: 'Smelt iron with charcoal for superior strength.', inputs: [{ itemId: 'iron_ore', quantity: 1 }, { itemId: 'charcoal', quantity: 2 }], outputs: [{ itemId: 'steel_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_gold', name: 'Smelt Gold', skill: 'smithing', levelRequired: 45, xpReward: 30, duration: 6000, inputs: [{ itemId: 'gold_ore', quantity: 1 }], outputs: [{ itemId: 'gold_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_mithril', name: 'Smelt Mithril', skill: 'smithing', levelRequired: 55, xpReward: 150, duration: 15000, inputs: [{ itemId: 'mithril_ore', quantity: 4 }, { itemId: 'steel_ore', quantity: 1 }], outputs: [{ itemId: 'mithril_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_platinum', name: 'Smelt Platinum', skill: 'smithing', levelRequired: 65, xpReward: 200, duration: 18000, inputs: [{ itemId: 'platinum_ore', quantity: 1 }], outputs: [{ itemId: 'platinum_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_adamant', name: 'Smelt Adamant', skill: 'smithing', levelRequired: 75, xpReward: 300, duration: 20000, inputs: [{ itemId: 'adamant_ore', quantity: 6 }, { itemId: 'steel_ore', quantity: 1 }], outputs: [{ itemId: 'adamant_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_runite', name: 'Smelt Runite', skill: 'smithing', levelRequired: 85, xpReward: 600, duration: 30000, inputs: [{ itemId: 'runite_ore', quantity: 8 }, { itemId: 'steel_ore', quantity: 1 }], outputs: [{ itemId: 'runite_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_obsidian', name: 'Refine Obsidian', skill: 'smithing', levelRequired: 95, xpReward: 1000, duration: 40000, inputs: [{ itemId: 'obsidian', quantity: 5 }], outputs: [{ itemId: 'obsidian_bar', quantity: 1, chance: 1 }] },
  
  { id: 'smelt_dragonite', name: 'Smelt Dragonite', skill: 'smithing', levelRequired: 99, xpReward: 2000, duration: 50000, inputs: [{ itemId: 'dragonite_ore', quantity: 5 }, { itemId: 'coal', quantity: 10 }], outputs: [{ itemId: 'dragonite_bar', quantity: 1, chance: 1 }] },
  { id: 'smelt_necrite', name: 'Smelt Necrite', skill: 'smithing', levelRequired: 99, xpReward: 5000, duration: 80000, inputs: [{ itemId: 'necrite_ore', quantity: 10 }, { itemId: 'coal', quantity: 20 }], outputs: [{ itemId: 'necrite_bar', quantity: 1, chance: 1 }] },
  { id: 'smith_dragonite_sword', name: 'Smith Dragonite Sword', skill: 'smithing', levelRequired: 99, xpReward: 5000, duration: 60000, inputs: [{ itemId: 'dragonite_bar', quantity: 3 }], outputs: [{ itemId: 'dragonite_sword', quantity: 1, chance: 1 }] },
  { id: 'smith_dragonite_body', name: 'Smith Dragonite Body', skill: 'smithing', levelRequired: 99, xpReward: 10000, duration: 120000, inputs: [{ itemId: 'dragonite_bar', quantity: 5 }], outputs: [{ itemId: 'dragonite_body', quantity: 1, chance: 1 }] },
  { id: 'smith_necrite_sword', name: 'Smith Necrite Sword', skill: 'smithing', levelRequired: 99, xpReward: 15000, duration: 180000, inputs: [{ itemId: 'necrite_bar', quantity: 5 }], outputs: [{ itemId: 'necrite_sword', quantity: 1, chance: 1 }] },
  { id: 'smith_necrite_body', name: 'Smith Necrite Body', skill: 'smithing', levelRequired: 99, xpReward: 30000, duration: 300000, inputs: [{ itemId: 'necrite_bar', quantity: 10 }], outputs: [{ itemId: 'necrite_body', quantity: 1, chance: 1 }] },

  // Crafting Progression
  { id: 'fletch_shafts', name: 'Fletch Shafts', skill: 'crafting', levelRequired: 1, xpReward: 5, duration: 2000, inputs: [{ itemId: 'logs', quantity: 1 }], outputs: [{ itemId: 'arrow_shafts', quantity: 15, chance: 1 }] },
  { id: 'spin_flax', name: 'Spin Flax', skill: 'crafting', levelRequired: 10, xpReward: 15, duration: 3000, inputs: [{ itemId: 'flax', quantity: 1 }], outputs: [{ itemId: 'bowstring', quantity: 1, chance: 1 }] },
  
  // Fletching Bows
  { id: 'fletch_shortbow_u', name: 'Fletch Shortbow (u)', skill: 'crafting', levelRequired: 5, xpReward: 5, duration: 3000, inputs: [{ itemId: 'logs', quantity: 1 }], outputs: [{ itemId: 'shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_shortbow', name: 'String Shortbow', skill: 'crafting', levelRequired: 5, xpReward: 5, duration: 2000, inputs: [{ itemId: 'shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'shortbow', quantity: 1, chance: 1 }] },
  { id: 'fletch_oak_shortbow_u', name: 'Fletch Oak Shortbow (u)', skill: 'crafting', levelRequired: 20, xpReward: 16.5, duration: 3500, inputs: [{ itemId: 'oak_logs', quantity: 1 }], outputs: [{ itemId: 'oak_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_oak_shortbow', name: 'String Oak Shortbow', skill: 'crafting', levelRequired: 20, xpReward: 16.5, duration: 2000, inputs: [{ itemId: 'oak_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'oak_shortbow', quantity: 1, chance: 1 }] },
  { id: 'fletch_willow_shortbow_u', name: 'Fletch Willow Shortbow (u)', skill: 'crafting', levelRequired: 35, xpReward: 33.3, duration: 4000, inputs: [{ itemId: 'willow_logs', quantity: 1 }], outputs: [{ itemId: 'willow_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_willow_shortbow', name: 'String Willow Shortbow', skill: 'crafting', levelRequired: 35, xpReward: 33.3, duration: 2000, inputs: [{ itemId: 'willow_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'willow_shortbow', quantity: 1, chance: 1 }] },
  { id: 'fletch_maple_shortbow_u', name: 'Fletch Maple Shortbow (u)', skill: 'crafting', levelRequired: 50, xpReward: 50, duration: 4500, inputs: [{ itemId: 'maple_logs', quantity: 1 }], outputs: [{ itemId: 'maple_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_maple_shortbow', name: 'String Maple Shortbow', skill: 'crafting', levelRequired: 50, xpReward: 50, duration: 2000, inputs: [{ itemId: 'maple_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'maple_shortbow', quantity: 1, chance: 1 }] },
  { id: 'fletch_yew_shortbow_u', name: 'Fletch Yew Shortbow (u)', skill: 'crafting', levelRequired: 65, xpReward: 67.5, duration: 5000, inputs: [{ itemId: 'yew_logs', quantity: 1 }], outputs: [{ itemId: 'yew_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_yew_shortbow', name: 'String Yew Shortbow', skill: 'crafting', levelRequired: 65, xpReward: 67.5, duration: 2000, inputs: [{ itemId: 'yew_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'yew_shortbow', quantity: 1, chance: 1 }] },
  { id: 'fletch_magic_shortbow_u', name: 'Fletch Magic Shortbow (u)', skill: 'crafting', levelRequired: 80, xpReward: 83.3, duration: 5500, inputs: [{ itemId: 'magic_logs', quantity: 1 }], outputs: [{ itemId: 'magic_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_magic_shortbow', name: 'String Magic Shortbow', skill: 'crafting', levelRequired: 80, xpReward: 83.3, duration: 2000, inputs: [{ itemId: 'magic_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'magic_shortbow', quantity: 1, chance: 1 }] },

  { id: 'fletch_elder_shortbow_u', name: 'Fletch Elder Shortbow (u)', skill: 'crafting', levelRequired: 92, xpReward: 120, duration: 6000, inputs: [{ itemId: 'elder_logs', quantity: 1 }], outputs: [{ itemId: 'elder_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_elder_shortbow', name: 'String Elder Shortbow', skill: 'crafting', levelRequired: 92, xpReward: 120, duration: 2000, inputs: [{ itemId: 'elder_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'elder_shortbow', quantity: 1, chance: 1 }] },
  { id: 'fletch_redwood_shortbow_u', name: 'Fletch Redwood Shortbow (u)', skill: 'crafting', levelRequired: 97, xpReward: 250, duration: 8000, inputs: [{ itemId: 'redwood_logs', quantity: 1 }], outputs: [{ itemId: 'redwood_shortbow_u', quantity: 1, chance: 1 }] },
  { id: 'string_redwood_shortbow', name: 'String Redwood Shortbow', skill: 'crafting', levelRequired: 97, xpReward: 250, duration: 2000, inputs: [{ itemId: 'redwood_shortbow_u', quantity: 1 }, { itemId: 'bowstring', quantity: 1 }], outputs: [{ itemId: 'redwood_shortbow', quantity: 1, chance: 1 }] },

  { id: 'make_bronze_arrows', name: 'Make Bronze Arrows', skill: 'crafting', levelRequired: 5, xpReward: 15, duration: 5000, inputs: [{ itemId: 'arrow_shafts', quantity: 15 }, { itemId: 'feathers', quantity: 15 }, { itemId: 'bronze_bar', quantity: 1 }], outputs: [{ itemId: 'bronze_arrows', quantity: 15, chance: 1 }] },
  { id: 'make_iron_arrows', name: 'Make Iron Arrows', skill: 'crafting', levelRequired: 20, xpReward: 30, duration: 6000, inputs: [{ itemId: 'arrow_shafts', quantity: 15 }, { itemId: 'feathers', quantity: 15 }, { itemId: 'iron_bar', quantity: 1 }], outputs: [{ itemId: 'iron_arrows', quantity: 15, chance: 1 }] },
  { id: 'make_lockpick', name: 'Make Lockpick', skill: 'crafting', levelRequired: 25, xpReward: 45, duration: 4000, inputs: [{ itemId: 'iron_bar', quantity: 1 }], outputs: [{ itemId: 'lockpick', quantity: 1, chance: 1 }] },
  { id: 'make_steel_arrows', name: 'Make Steel Arrows', skill: 'crafting', levelRequired: 40, xpReward: 60, duration: 8000, inputs: [{ itemId: 'arrow_shafts', quantity: 15 }, { itemId: 'feathers', quantity: 15 }, { itemId: 'steel_bar', quantity: 1 }], outputs: [{ itemId: 'steel_arrows', quantity: 15, chance: 1 }] },
  { id: 'make_mithril_arrows', name: 'Make Mithril Arrows', skill: 'crafting', levelRequired: 60, xpReward: 120, duration: 10000, inputs: [{ itemId: 'arrow_shafts', quantity: 15 }, { itemId: 'feathers', quantity: 15 }, { itemId: 'mithril_bar', quantity: 1 }], outputs: [{ itemId: 'mithril_arrows', quantity: 15, chance: 1 }] },
  { id: 'make_adamant_arrows', name: 'Make Adamant Arrows', skill: 'crafting', levelRequired: 80, xpReward: 300, duration: 15000, inputs: [{ itemId: 'arrow_shafts', quantity: 15 }, { itemId: 'feathers', quantity: 15 }, { itemId: 'adamant_bar', quantity: 1 }], outputs: [{ itemId: 'adamant_arrows', quantity: 15, chance: 1 }] },
  { id: 'make_runite_arrows', name: 'Make Runite Arrows', skill: 'crafting', levelRequired: 90, xpReward: 800, duration: 20000, inputs: [{ itemId: 'arrow_shafts', quantity: 15 }, { itemId: 'feathers', quantity: 15 }, { itemId: 'runite_bar', quantity: 1 }], outputs: [{ itemId: 'runite_arrows', quantity: 15, chance: 1 }] },
  
  { id: 'tan_leather', name: 'Tan Leather', skill: 'crafting', levelRequired: 1, xpReward: 10, duration: 3000, inputs: [{ itemId: 'fur', quantity: 1 }], outputs: [{ itemId: 'leather', quantity: 1, chance: 1 }] },
  { id: 'craft_leather_body', name: 'Craft Leather Body', skill: 'crafting', levelRequired: 10, xpReward: 50, duration: 8000, inputs: [{ itemId: 'leather', quantity: 3 }], outputs: [{ itemId: 'leather_body', quantity: 1, chance: 1 }] },
  { id: 'tan_hard_leather', name: 'Tan Hard Leather', skill: 'crafting', levelRequired: 25, xpReward: 40, duration: 6000, inputs: [{ itemId: 'fur', quantity: 3 }], outputs: [{ itemId: 'hard_leather', quantity: 1, chance: 1 }] },
  { id: 'craft_hard_leather_body', name: 'Craft Hard Leather Body', skill: 'crafting', levelRequired: 40, xpReward: 150, duration: 12000, inputs: [{ itemId: 'hard_leather', quantity: 5 }], outputs: [{ itemId: 'hard_leather_body', quantity: 1, chance: 1 }] },
  { id: 'tan_wolf_leather', name: 'Tan Wolf Leather', skill: 'crafting', levelRequired: 60, xpReward: 100, duration: 8000, inputs: [{ itemId: 'wolf_fur', quantity: 1 }], outputs: [{ itemId: 'wolf_leather', quantity: 1, chance: 1 }] },
  { id: 'craft_wolf_body', name: 'Craft Wolf Body', skill: 'crafting', levelRequired: 65, xpReward: 400, duration: 15000, inputs: [{ itemId: 'wolf_leather', quantity: 5 }], outputs: [{ itemId: 'wolf_body', quantity: 1, chance: 1 }] },
  { id: 'tan_dragon_leather', name: 'Tan Dragon Leather', skill: 'crafting', levelRequired: 80, xpReward: 500, duration: 12000, inputs: [{ itemId: 'dragon_hide', quantity: 1 }], outputs: [{ itemId: 'dragon_leather', quantity: 1, chance: 1 }] },
  { id: 'craft_dragon_body', name: 'Craft Dragon Body', skill: 'crafting', levelRequired: 85, xpReward: 2000, duration: 30000, inputs: [{ itemId: 'dragon_leather', quantity: 5 }], outputs: [{ itemId: 'dragon_body', quantity: 1, chance: 1 }] },

  { id: 'cut_sapphire', name: 'Cut Sapphire', skill: 'crafting', levelRequired: 20, xpReward: 50, duration: 4000, inputs: [{ itemId: 'uncut_sapphire', quantity: 1 }], outputs: [{ itemId: 'sapphire_ring', quantity: 1, chance: 0.5 }] },
  { id: 'cut_emerald', name: 'Cut Emerald', skill: 'crafting', levelRequired: 35, xpReward: 100, duration: 6000, inputs: [{ itemId: 'uncut_emerald', quantity: 1 }], outputs: [{ itemId: 'emerald_amulet', quantity: 1, chance: 0.5 }] },
  { id: 'cut_ruby', name: 'Cut Ruby', skill: 'crafting', levelRequired: 50, xpReward: 200, duration: 8000, inputs: [{ itemId: 'uncut_ruby', quantity: 1 }], outputs: [{ itemId: 'ruby_necklace', quantity: 1, chance: 0.5 }] },
  { id: 'cut_diamond', name: 'Cut Diamond', skill: 'crafting', levelRequired: 70, xpReward: 500, duration: 12000, inputs: [{ itemId: 'uncut_diamond', quantity: 1 }], outputs: [{ itemId: 'diamond_ring', quantity: 1, chance: 0.5 }] },
  { id: 'craft_gold_ring', name: 'Craft Gold Ring', skill: 'crafting', levelRequired: 40, xpReward: 100, duration: 8000, inputs: [{ itemId: 'gold_bar', quantity: 1 }], outputs: [{ itemId: 'gold_ring', quantity: 1, chance: 1 }] },

  // Cooking Progression
  { id: 'mill_wheat', name: 'Mill Wheat', skill: 'cooking', levelRequired: 1, xpReward: 5, duration: 2000, inputs: [{ itemId: 'wheat', quantity: 1 }], outputs: [{ itemId: 'flour', quantity: 1, chance: 1 }] },
  { id: 'make_dough', name: 'Make Dough', skill: 'cooking', levelRequired: 1, xpReward: 5, duration: 2000, inputs: [{ itemId: 'flour', quantity: 1 }], outputs: [{ itemId: 'dough', quantity: 1, chance: 1 }] },
  { id: 'bake_bread', name: 'Bake Bread', skill: 'cooking', levelRequired: 1, xpReward: 25, duration: 4000, inputs: [{ itemId: 'dough', quantity: 1 }], outputs: [{ itemId: 'bread', quantity: 1, chance: 1 }] },
  { id: 'make_wine', name: 'Make Wine', skill: 'cooking', levelRequired: 35, xpReward: 200, duration: 8000, inputs: [{ itemId: 'grapes', quantity: 1 }], outputs: [{ itemId: 'wine', quantity: 1, chance: 1 }] },
  { id: 'cook_shrimp', name: 'Cook Shrimp', skill: 'cooking', levelRequired: 1, xpReward: 15, duration: 4000, inputs: [{ itemId: 'raw_shrimp', quantity: 1 }], outputs: [{ itemId: 'cooked_shrimp', quantity: 1, chance: 1 }] },
  { id: 'cook_chicken', name: 'Cook Chicken', skill: 'cooking', levelRequired: 5, xpReward: 20, duration: 4500, inputs: [{ itemId: 'raw_chicken', quantity: 1 }], outputs: [{ itemId: 'cooked_chicken', quantity: 1, chance: 1 }] },
  { id: 'cook_beef', name: 'Cook Beef', skill: 'cooking', levelRequired: 10, xpReward: 30, duration: 5000, inputs: [{ itemId: 'raw_beef', quantity: 1 }], outputs: [{ itemId: 'cooked_beef', quantity: 1, chance: 1 }] },
  { id: 'cook_sardine', name: 'Cook Sardine', skill: 'cooking', levelRequired: 15, xpReward: 40, duration: 5500, inputs: [{ itemId: 'raw_sardine', quantity: 1 }], outputs: [{ itemId: 'cooked_sardine', quantity: 1, chance: 1 }] },
  { id: 'cook_rainbow_trout', name: 'Cook Rainbow Trout', skill: 'cooking', levelRequired: 18, xpReward: 45, duration: 5800, inputs: [{ itemId: 'raw_rainbow_trout', quantity: 1 }], outputs: [{ itemId: 'cooked_rainbow_trout', quantity: 1, chance: 1 }] },
  { id: 'cook_herring', name: 'Cook Herring', skill: 'cooking', levelRequired: 20, xpReward: 50, duration: 6000, inputs: [{ itemId: 'raw_herring', quantity: 1 }], outputs: [{ itemId: 'cooked_herring', quantity: 1, chance: 1 }] },
  { id: 'cook_anchovies', name: 'Cook Anchovies', skill: 'cooking', levelRequired: 25, xpReward: 60, duration: 6500, inputs: [{ itemId: 'raw_anchovies', quantity: 1 }], outputs: [{ itemId: 'cooked_anchovies', quantity: 1, chance: 1 }] },
  { id: 'cook_mackerel', name: 'Cook Mackerel', skill: 'cooking', levelRequired: 30, xpReward: 75, duration: 7000, inputs: [{ itemId: 'raw_mackerel', quantity: 1 }], outputs: [{ itemId: 'cooked_mackerel', quantity: 1, chance: 1 }] },
  { id: 'cook_trout', name: 'Cook Trout', skill: 'cooking', levelRequired: 38, xpReward: 100, duration: 7500, inputs: [{ itemId: 'raw_trout', quantity: 1 }], outputs: [{ itemId: 'cooked_trout', quantity: 1, chance: 1 }] },
  { id: 'cook_cod', name: 'Cook Cod', skill: 'cooking', levelRequired: 45, xpReward: 130, duration: 8000, inputs: [{ itemId: 'raw_cod', quantity: 1 }], outputs: [{ itemId: 'cooked_cod', quantity: 1, chance: 1 }] },
  { id: 'cook_pike', name: 'Cook Pike', skill: 'cooking', levelRequired: 52, xpReward: 160, duration: 8500, inputs: [{ itemId: 'raw_pike', quantity: 1 }], outputs: [{ itemId: 'cooked_pike', quantity: 1, chance: 1 }] },
  { id: 'cook_salmon', name: 'Cook Salmon', skill: 'cooking', levelRequired: 60, xpReward: 200, duration: 9000, inputs: [{ itemId: 'raw_salmon', quantity: 1 }], outputs: [{ itemId: 'cooked_salmon', quantity: 1, chance: 1 }] },
  { id: 'cook_tuna', name: 'Cook Tuna', skill: 'cooking', levelRequired: 68, xpReward: 250, duration: 10000, inputs: [{ itemId: 'raw_tuna', quantity: 1 }], outputs: [{ itemId: 'cooked_tuna', quantity: 1, chance: 1 }] },
  { id: 'cook_bass', name: 'Cook Bass', skill: 'cooking', levelRequired: 75, xpReward: 350, duration: 12000, inputs: [{ itemId: 'raw_bass', quantity: 1 }], outputs: [{ itemId: 'cooked_bass', quantity: 1, chance: 1 }] },
  { id: 'cook_lobster', name: 'Cook Lobster', skill: 'cooking', levelRequired: 82, xpReward: 500, duration: 14000, inputs: [{ itemId: 'raw_lobster', quantity: 1 }], outputs: [{ itemId: 'cooked_lobster', quantity: 1, chance: 1 }] },
  { id: 'cook_swordfish', name: 'Cook Swordfish', skill: 'cooking', levelRequired: 88, xpReward: 700, duration: 16000, inputs: [{ itemId: 'raw_swordfish', quantity: 1 }], outputs: [{ itemId: 'cooked_swordfish', quantity: 1, chance: 1 }] },
  { id: 'cook_monkfish', name: 'Cook Monkfish', skill: 'cooking', levelRequired: 93, xpReward: 1000, duration: 18000, inputs: [{ itemId: 'raw_monkfish', quantity: 1 }], outputs: [{ itemId: 'cooked_monkfish', quantity: 1, chance: 1 }] },
  { id: 'cook_karambwan', name: 'Cook Karambwan', skill: 'cooking', levelRequired: 96, xpReward: 1500, duration: 20000, inputs: [{ itemId: 'raw_karambwan', quantity: 1 }], outputs: [{ itemId: 'cooked_karambwan', quantity: 1, chance: 1 }] },
  { id: 'cook_mantaray', name: 'Cook Manta Ray', skill: 'cooking', levelRequired: 98, xpReward: 2500, duration: 25000, inputs: [{ itemId: 'raw_mantaray', quantity: 1 }], outputs: [{ itemId: 'cooked_mantaray', quantity: 1, chance: 1 }] },
  { id: 'cook_shark', name: 'Cook Shark', skill: 'cooking', levelRequired: 99, xpReward: 4000, duration: 30000, inputs: [{ itemId: 'raw_shark', quantity: 1 }], outputs: [{ itemId: 'cooked_shark', quantity: 1, chance: 1 }] },
  { id: 'cook_dragon', name: 'Cook Dragon Meat', skill: 'cooking', levelRequired: 99, xpReward: 5000, duration: 40000, inputs: [{ itemId: 'dragon_meat', quantity: 1 }], outputs: [{ itemId: 'cooked_dragon_meat', quantity: 1, chance: 1 }] },

  // Herblore Progression
  { id: 'gather_vial_of_water', name: 'Gather Vial of Water', skill: 'herblore', levelRequired: 1, xpReward: 5, duration: 2000, description: 'Fill a vial with fresh spring water.', outputs: [{ itemId: 'vial_of_water', quantity: 1, chance: 1 }] },
  { id: 'gather_herbs', name: 'Gather Herbs', skill: 'herblore', levelRequired: 1, xpReward: 10, duration: 4000, description: 'Search the fields for wild herbs.', outputs: [{ itemId: 'herbs', quantity: 1, chance: 1 }] },
  { id: 'make_attack_potion', name: 'Brew Attack Potion', skill: 'herblore', levelRequired: 5, xpReward: 40, duration: 8000, description: 'A basic potion to improve accuracy.', inputs: [{ itemId: 'herbs', quantity: 1 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'attack_potion', quantity: 1, chance: 1 }] },
  { id: 'make_antipoison', name: 'Brew Antipoison', skill: 'herblore', levelRequired: 15, xpReward: 70, duration: 9000, description: 'Neutralizes common toxins.', inputs: [{ itemId: 'herbs', quantity: 1 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'antipoison', quantity: 1, chance: 1 }] },
  { id: 'make_strength_potion', name: 'Brew Strength Potion', skill: 'herblore', levelRequired: 25, xpReward: 120, duration: 10000, description: 'Increases physical power.', inputs: [{ itemId: 'herbs', quantity: 2 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'strength_potion', quantity: 1, chance: 1 }] },
  { id: 'make_restore_potion', name: 'Brew Restore Potion', skill: 'herblore', levelRequired: 35, xpReward: 200, duration: 12000, description: 'Restores drained skill levels.', inputs: [{ itemId: 'herbs', quantity: 2 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'restore_potion', quantity: 1, chance: 1 }] },
  { id: 'make_agility_potion', name: 'Brew Agility Potion', skill: 'herblore', levelRequired: 34, xpReward: 180, duration: 11000, description: 'Improves reflexes and speed.', inputs: [{ itemId: 'toadflax', quantity: 1 }, { itemId: 'toads_legs', quantity: 1 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'agility_potion', quantity: 1, chance: 1 }] },
  { id: 'make_energy_potion', name: 'Brew Energy Potion', skill: 'herblore', levelRequired: 42, xpReward: 300, duration: 13000, description: 'Restores run energy.', inputs: [{ itemId: 'herbs', quantity: 3 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'energy_potion', quantity: 1, chance: 1 }] },
  { id: 'make_defense_potion', name: 'Brew Defense Potion', skill: 'herblore', levelRequired: 50, xpReward: 400, duration: 15000, description: 'Hardens the skin against attacks.', inputs: [{ itemId: 'herbs', quantity: 4 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'defense_potion', quantity: 1, chance: 1 }] },
  { id: 'make_super_defense', name: 'Brew Super Defense', skill: 'herblore', levelRequired: 58, xpReward: 600, duration: 16000, description: 'Significantly improves defense.', inputs: [{ itemId: 'herbs', quantity: 5 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'super_defense', quantity: 1, chance: 1 }] },
  { id: 'make_prayer_potion', name: 'Brew Prayer Potion', skill: 'herblore', levelRequired: 65, xpReward: 800, duration: 18000, description: 'Restores divine connection.', inputs: [{ itemId: 'herbs', quantity: 4 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'prayer_potion', quantity: 1, chance: 1 }] },
  { id: 'make_super_energy', name: 'Brew Super Energy', skill: 'herblore', levelRequired: 72, xpReward: 1200, duration: 20000, description: 'Restores massive run energy.', inputs: [{ itemId: 'herbs', quantity: 6 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'super_energy', quantity: 1, chance: 1 }] },
  { id: 'make_super_attack', name: 'Brew Super Attack', skill: 'herblore', levelRequired: 80, xpReward: 1500, duration: 22000, description: 'Significantly improves accuracy.', inputs: [{ itemId: 'herbs', quantity: 6 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'super_attack', quantity: 1, chance: 1 }] },
  { id: 'make_saradomin_brew', name: 'Brew Saradomin Brew', skill: 'herblore', levelRequired: 82, xpReward: 2000, duration: 24000, description: 'The ultimate healing potion.', inputs: [{ itemId: 'herbs', quantity: 8 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'saradomin_brew', quantity: 1, chance: 1 }] },
  { id: 'make_super_strength', name: 'Brew Super Strength', skill: 'herblore', levelRequired: 90, xpReward: 3000, duration: 25000, description: 'Significantly improves physical power.', inputs: [{ itemId: 'herbs', quantity: 8 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'super_strength', quantity: 1, chance: 1 }] },
  { id: 'make_spirit_potion', name: 'Brew Spirit Potion', skill: 'herblore', levelRequired: 92, xpReward: 4000, duration: 30000, description: 'Connects with the spirit realm.', inputs: [{ itemId: 'spirit_herb', quantity: 1 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'spirit_potion', quantity: 1, chance: 1 }] },
  { id: 'make_dragon_slayer', name: 'Brew Dragon Slayer Potion', skill: 'herblore', levelRequired: 95, xpReward: 6000, duration: 35000, description: 'Specifically designed for hunting dragons.', inputs: [{ itemId: 'dragon_scale', quantity: 1 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'dragon_slayer_potion', quantity: 1, chance: 1 }] },
  { id: 'make_luck_potion', name: 'Brew Luck Potion', skill: 'herblore', levelRequired: 85, xpReward: 4000, duration: 30000, description: 'A potion that brings good fortune.', inputs: [{ itemId: 'herbs', quantity: 10 }, { itemId: 'emerald_gem', quantity: 1 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'luck_potion', quantity: 1, chance: 1 }] },
  { id: 'make_overload', name: 'Brew Overload', skill: 'herblore', levelRequired: 99, xpReward: 15000, duration: 45000, description: 'The peak of alchemy. Boosts all combat stats.', inputs: [{ itemId: 'slayer_essence', quantity: 5 }, { itemId: 'pure_mana_crystal', quantity: 2 }, { itemId: 'alchemical_catalyst', quantity: 1 }], outputs: [{ itemId: 'overload_potion', quantity: 1, chance: 1 }] },
  { id: 'craft_abyssal_tentacle', name: 'Craft Abyssal Tentacle', skill: 'crafting', levelRequired: 95, xpReward: 20000, duration: 60000, description: 'Combine the power of the Abyssal Whip and the Kraken Tentacle.', inputs: [{ itemId: 'abyssal_whip', quantity: 1 }, { itemId: 'kraken_tentacle', quantity: 1 }, { itemId: 'master_crafting_kit', quantity: 1 }], outputs: [{ itemId: 'abyssal_tentacle', quantity: 1, chance: 1 }] },

  // Combat Training (Level 1-5)
  { id: 'train_attack', name: 'Dummy Practice (Attack)', skill: 'attack', levelRequired: 1, xpReward: 15, duration: 3000, outputs: [{ itemId: 'gp', quantity: 1, chance: 0.1 }] },
  { id: 'train_strength', name: 'Weight Lifting (Strength)', skill: 'strength', levelRequired: 1, xpReward: 15, duration: 3000, outputs: [{ itemId: 'gp', quantity: 1, chance: 0.1 }] },
  { id: 'train_defense', name: 'Shield Drills (Defense)', skill: 'defense', levelRequired: 1, xpReward: 15, duration: 3000, outputs: [{ itemId: 'gp', quantity: 1, chance: 0.1 }] },
  { id: 'train_magic', name: 'Spark Casting (Magic)', skill: 'magic', levelRequired: 1, xpReward: 20, duration: 4000, outputs: [{ itemId: 'gp', quantity: 1, chance: 0.1 }] },
  { id: 'train_ranged', name: 'Target Practice (Ranged)', skill: 'ranged', levelRequired: 1, xpReward: 20, duration: 4000, outputs: [{ itemId: 'gp', quantity: 1, chance: 0.1 }] },

  // Agility Progression
  { id: 'gnome_stronghold_course', name: 'Gnome Stronghold Course', skill: 'agility', levelRequired: 1, xpReward: 10, duration: 5000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.05 }] },
  { id: 'draynor_rooftop_course', name: 'Draynor Rooftop Course', skill: 'agility', levelRequired: 10, xpReward: 25, duration: 6000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.1 }] },
  { id: 'al_kharid_rooftop_course', name: 'Al Kharid Rooftop Course', skill: 'agility', levelRequired: 20, xpReward: 50, duration: 7000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.12 }] },
  { id: 'varrock_rooftop_course', name: 'Varrock Rooftop Course', skill: 'agility', levelRequired: 30, xpReward: 100, duration: 8000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.15 }] },
  { id: 'canifis_rooftop_course', name: 'Canifis Rooftop Course', skill: 'agility', levelRequired: 40, xpReward: 200, duration: 9000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.2 }] },
  { id: 'falador_rooftop_course', name: 'Falador Rooftop Course', skill: 'agility', levelRequired: 50, xpReward: 400, duration: 10000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.22 }] },
  { id: 'seers_village_rooftop_course', name: 'Seers Village Rooftop Course', skill: 'agility', levelRequired: 60, xpReward: 800, duration: 11000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.25 }] },
  { id: 'pollnivneach_rooftop_course', name: 'Pollnivneach Rooftop Course', skill: 'agility', levelRequired: 70, xpReward: 1500, duration: 12000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.28 }] },
  { id: 'rellekka_rooftop_course', name: 'Rellekka Rooftop Course', skill: 'agility', levelRequired: 80, xpReward: 3000, duration: 13000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.3 }] },
  { id: 'ardougne_rooftop_course', name: 'Ardougne Rooftop Course', skill: 'agility', levelRequired: 90, xpReward: 6000, duration: 15000, outputs: [{ itemId: 'mark_of_grace', quantity: 1, chance: 0.35 }] },

  // Monster Hunting (Level 5+)
  // Goblins: Weak to Melee (Attack/Strength)
  { id: 'hunt_goblin_att', name: 'Slay Goblin (Attack)', skill: 'attack', levelRequired: 5, xpReward: 40, duration: 5000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 10, chance: 0.5 },
    { itemId: 'goblin_mail', quantity: 1, chance: 0.1 },
    { itemId: 'rusty_sword', quantity: 1, chance: 0.05 }
  ] },
  { id: 'hunt_goblin_str', name: 'Slay Goblin (Strength)', skill: 'strength', levelRequired: 5, xpReward: 40, duration: 5000, isMonster: true, weakness: 'strength', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 10, chance: 0.5 },
    { itemId: 'goblin_mail', quantity: 1, chance: 0.1 },
    { itemId: 'rusty_sword', quantity: 1, chance: 0.05 }
  ] },
  { id: 'hunt_goblin_guard', name: 'Slay Goblin Guard', skill: 'attack', levelRequired: 7, xpReward: 50, duration: 5200, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 12, chance: 0.5 },
    { itemId: 'goblin_mail', quantity: 1, chance: 0.15 }
  ] },
  // Giant Rats: Level 8
  { id: 'hunt_rat_att', name: 'Slay Giant Rat (Attack)', skill: 'attack', levelRequired: 8, xpReward: 55, duration: 5500, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'rat_tail', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 15, chance: 0.5 }
  ] },
  { id: 'hunt_rat_str', name: 'Slay Giant Rat (Strength)', skill: 'strength', levelRequired: 8, xpReward: 55, duration: 5500, isMonster: true, weakness: 'strength', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'rat_tail', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 15, chance: 0.5 }
  ] },
  { id: 'hunt_rat_king', name: 'Slay Rat King', skill: 'strength', levelRequired: 10, xpReward: 70, duration: 5800, isMonster: true, weakness: 'strength', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'rat_tail', quantity: 2, chance: 1 },
    { itemId: 'gp', quantity: 30, chance: 0.8 }
  ] },
  // Skeletons: Level 11
  { id: 'hunt_skeleton_att', name: 'Slay Skeleton (Attack)', skill: 'attack', levelRequired: 11, xpReward: 75, duration: 6000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'skeleton_shard', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 25, chance: 0.5 },
    { itemId: 'broken_shield', quantity: 1, chance: 0.05 }
  ] },
  { id: 'hunt_skeleton_str', name: 'Slay Skeleton (Strength)', skill: 'strength', levelRequired: 11, xpReward: 75, duration: 6000, isMonster: true, weakness: 'strength', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'skeleton_shard', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 25, chance: 0.5 },
    { itemId: 'broken_shield', quantity: 1, chance: 0.05 }
  ] },
  { id: 'hunt_skeleton_archer', name: 'Slay Skeleton Archer', skill: 'ranged', levelRequired: 12, xpReward: 85, duration: 6500, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'skeleton_shard', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 35, chance: 0.6 }
  ] },
  { id: 'hunt_skeleton_mage', name: 'Slay Skeleton Mage', skill: 'magic', levelRequired: 13, xpReward: 90, duration: 7000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'skeleton_shard', quantity: 1, chance: 0.6 },
    { itemId: 'gp', quantity: 40, chance: 0.6 }
  ] },
  // Zombies: Weak to Magic (Level 15)
  { id: 'hunt_zombie_mag', name: 'Exorcise Zombie (Magic)', skill: 'magic', levelRequired: 15, xpReward: 100, duration: 8000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'air_rune', quantity: 2 }, { itemId: 'mind_rune', quantity: 1 }], outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'zombie_brain', quantity: 1, chance: 0.3 },
    { itemId: 'gp', quantity: 50, chance: 0.5 }
  ] },
  { id: 'hunt_zombie_ran', name: 'Snipe Zombie (Ranged)', skill: 'ranged', levelRequired: 15, xpReward: 80, duration: 10000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'bronze_arrows', quantity: 3 }], outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'zombie_brain', quantity: 1, chance: 0.2 },
    { itemId: 'gp', quantity: 40, chance: 0.5 }
  ] },
  { id: 'hunt_zombie_mage', name: 'Exorcise Zombie Mage', skill: 'magic', levelRequired: 16, xpReward: 110, duration: 8200, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'zombie_brain', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 55, chance: 0.6 }
  ] },
  { id: 'hunt_zombie_warrior', name: 'Slay Zombie Warrior', skill: 'attack', levelRequired: 17, xpReward: 120, duration: 8500, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'zombie_brain', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 60, chance: 0.6 }
  ] },
  // Ghosts: Level 18
  { id: 'hunt_ghost_mag', name: 'Banish Ghost (Magic)', skill: 'magic', levelRequired: 18, xpReward: 130, duration: 9000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'ectoplasm', quantity: 1, chance: 0.6 },
    { itemId: 'gp', quantity: 70, chance: 0.5 }
  ] },
  { id: 'hunt_ghost_warrior', name: 'Banish Ghostly Warrior', skill: 'strength', levelRequired: 19, xpReward: 140, duration: 9100, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'ectoplasm', quantity: 1, chance: 0.7 },
    { itemId: 'gp', quantity: 85, chance: 0.6 }
  ] },
  { id: 'hunt_ghost_knight', name: 'Duel Ghostly Knight', skill: 'attack', levelRequired: 20, xpReward: 150, duration: 9200, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'ectoplasm', quantity: 1, chance: 0.8 },
    { itemId: 'gp', quantity: 100, chance: 0.6 }
  ] },
  // Giant Spiders: Level 22
  { id: 'hunt_spider_ran', name: 'Snipe Spider (Ranged)', skill: 'ranged', levelRequired: 22, xpReward: 160, duration: 9500, isMonster: true, weakness: 'ranged', inputs: [{ itemId: 'iron_arrows', quantity: 2 }], outputs: [
    { itemId: 'spider_venom', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 90, chance: 0.5 }
  ] },
  { id: 'hunt_spiderling', name: 'Slay Giant Spiderling', skill: 'magic', levelRequired: 23, xpReward: 170, duration: 9600, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'spider_venom', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 100, chance: 0.6 }
  ] },
  { id: 'hunt_spider_jungle', name: 'Slay Jungle Spider', skill: 'strength', levelRequired: 24, xpReward: 180, duration: 9800, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'spider_venom', quantity: 1, chance: 0.6 },
    { itemId: 'gp', quantity: 110, chance: 0.6 }
  ] },
  // Wolves: Level 26
  { id: 'hunt_wolf_att', name: 'Hunt Wolf (Attack)', skill: 'attack', levelRequired: 26, xpReward: 200, duration: 10000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'wolf_bone', quantity: 1, chance: 1 },
    { itemId: 'wolf_fur', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 120, chance: 0.5 }
  ] },
  { id: 'hunt_wolf_pup', name: 'Hunt Wolf Pup', skill: 'ranged', levelRequired: 27, xpReward: 210, duration: 10200, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'wolf_bone', quantity: 1, chance: 1 },
    { itemId: 'wolf_fur', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 135, chance: 0.6 }
  ] },
  { id: 'hunt_wolf_dire', name: 'Hunt Dire Wolf', skill: 'strength', levelRequired: 28, xpReward: 220, duration: 10500, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'wolf_bone', quantity: 1, chance: 1 },
    { itemId: 'wolf_fur', quantity: 2, chance: 0.6 },
    { itemId: 'gp', quantity: 150, chance: 0.6 }
  ] },
  // Hill Giants: Level 30
  { id: 'hunt_giant_ran', name: 'Kite Hill Giant (Ranged)', skill: 'ranged', levelRequired: 30, xpReward: 240, duration: 11000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'giant_toe', quantity: 1, chance: 0.3 },
    { itemId: 'gp', quantity: 180, chance: 0.5 }
  ] },
  { id: 'hunt_giant_guard', name: 'Slay Hill Giant Guard', skill: 'strength', levelRequired: 31, xpReward: 260, duration: 11200, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'giant_toe', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 200, chance: 0.6 }
  ] },
  { id: 'hunt_giant_moss', name: 'Slay Moss Giant', skill: 'attack', levelRequired: 33, xpReward: 280, duration: 11500, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'giant_toe', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 220, chance: 0.6 }
  ] },
  { id: 'hunt_moss_shaman', name: 'Slay Moss Giant Shaman', skill: 'magic', levelRequired: 34, xpReward: 300, duration: 11800, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'giant_toe', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 250, chance: 0.7 }
  ] },
  // Ogres: Weak to Ranged (Level 35)
  { id: 'hunt_ogre_ran', name: 'Kite Ogre (Ranged)', skill: 'ranged', levelRequired: 35, xpReward: 250, duration: 12000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'ogre_tooth', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 200, chance: 0.5 }
  ] },
  { id: 'hunt_ogre_chieftain', name: 'Slay Ogre Chieftain', skill: 'attack', levelRequired: 36, xpReward: 300, duration: 12200, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'ogre_tooth', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 280, chance: 0.6 }
  ] },
  { id: 'hunt_ogre_str', name: 'Brawl Ogre (Strength)', skill: 'strength', levelRequired: 35, xpReward: 200, duration: 15000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'ogre_tooth', quantity: 1, chance: 0.3 },
    { itemId: 'gp', quantity: 150, chance: 0.5 }
  ] },
  { id: 'hunt_cyclops', name: 'Slay Cyclops', skill: 'attack', levelRequired: 38, xpReward: 320, duration: 12500, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 300, chance: 0.6 }
  ] },
  { id: 'hunt_cyclops_brute', name: 'Slay Cyclops Brute', skill: 'strength', levelRequired: 39, xpReward: 340, duration: 12800, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 350, chance: 0.7 }
  ] },
  // Lesser Demons: Level 40
  { id: 'hunt_demon_mag', name: 'Banish Demon (Magic)', skill: 'magic', levelRequired: 40, xpReward: 350, duration: 13000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'demon_bone', quantity: 1, chance: 1 },
    { itemId: 'demon_horn', quantity: 1, chance: 0.2 },
    { itemId: 'gp', quantity: 400, chance: 0.5 }
  ] },
  { id: 'hunt_demon_mage', name: 'Banish Lesser Demon Mage', skill: 'magic', levelRequired: 41, xpReward: 370, duration: 13200, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'demon_bone', quantity: 1, chance: 1 },
    { itemId: 'demon_horn', quantity: 1, chance: 0.25 },
    { itemId: 'gp', quantity: 450, chance: 0.6 }
  ] },
  { id: 'hunt_demon_greater', name: 'Slay Greater Demon', skill: 'strength', levelRequired: 43, xpReward: 400, duration: 13500, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'demon_bone', quantity: 1, chance: 1 },
    { itemId: 'demon_horn', quantity: 1, chance: 0.3 },
    { itemId: 'gp', quantity: 500, chance: 0.6 }
  ] },
  { id: 'hunt_demon_lord', name: 'Slay Greater Demon Lord', skill: 'attack', levelRequired: 44, xpReward: 430, duration: 13800, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'cooked_tuna', quantity: 1 }], outputs: [
    { itemId: 'demon_bone', quantity: 1, chance: 1 },
    { itemId: 'demon_horn', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 550, chance: 0.7 }
  ] },
  // Gargoyles: Level 45
  { id: 'hunt_gargoyle_att', name: 'Smash Gargoyle (Attack)', skill: 'attack', levelRequired: 45, xpReward: 450, duration: 14000, isMonster: true, weakness: 'attack', secondarySkillRequired: { skill: 'slayer', level: 45 }, outputs: [
    { itemId: 'gargoyle_granite', quantity: 1, chance: 0.3 },
    { itemId: 'gp', quantity: 600, chance: 0.5 }
  ] },
  { id: 'hunt_gargoyle_sentinel', name: 'Smash Gargoyle Sentinel', skill: 'strength', levelRequired: 46, xpReward: 480, duration: 14100, isMonster: true, weakness: 'attack', secondarySkillRequired: { skill: 'slayer', level: 46 }, outputs: [
    { itemId: 'gargoyle_granite', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 650, chance: 0.6 }
  ] },
  { id: 'hunt_dragon_iron', name: 'Slay Iron Dragon', skill: 'magic', levelRequired: 48, xpReward: 500, duration: 14200, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'iron_dragon_scale', quantity: 1, chance: 0.8 },
    { itemId: 'gp', quantity: 700, chance: 0.6 }
  ] },
  { id: 'hunt_iron_dragon_hatch', name: 'Slay Iron Dragon Hatchling', skill: 'ranged', levelRequired: 49, xpReward: 520, duration: 14300, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'iron_dragon_scale', quantity: 1, chance: 0.6 },
    { itemId: 'gp', quantity: 650, chance: 0.6 }
  ] },
  // Dark Wizards: Level 50
  { id: 'hunt_wizard_ran', name: 'Snipe Wizard (Ranged)', skill: 'ranged', levelRequired: 50, xpReward: 550, duration: 14500, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'gp', quantity: 800, chance: 1 },
    { itemId: 'vial_of_water', quantity: 5, chance: 0.5 }
  ] },
  { id: 'hunt_wizard_apprentice', name: 'Snipe Wizard Apprentice', skill: 'magic', levelRequired: 51, xpReward: 580, duration: 14800, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'gp', quantity: 900, chance: 1 },
    { itemId: 'vial_of_water', quantity: 3, chance: 0.6 }
  ] },
  { id: 'hunt_dragon_steel', name: 'Slay Steel Dragon', skill: 'magic', levelRequired: 53, xpReward: 650, duration: 15500, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'steel_dragon_scale', quantity: 1, chance: 0.8 },
    { itemId: 'gp', quantity: 1200, chance: 0.6 }
  ] },
  { id: 'hunt_steel_dragon_hatch', name: 'Slay Steel Dragon Hatchling', skill: 'ranged', levelRequired: 54, xpReward: 680, duration: 15800, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'steel_dragon_scale', quantity: 1, chance: 0.6 },
    { itemId: 'gp', quantity: 1100, chance: 0.6 }
  ] },
  // Elves: Weak to Melee (Level 55)
  { id: 'hunt_elf_att', name: 'Duel Elf (Attack)', skill: 'attack', levelRequired: 55, xpReward: 600, duration: 15000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'elf_dust', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 1000, chance: 0.5 }
  ] },
  { id: 'hunt_elf_mag', name: 'Counter-Spell Elf (Magic)', skill: 'magic', levelRequired: 55, xpReward: 500, duration: 18000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'elf_dust', quantity: 1, chance: 0.4 },
    { itemId: 'gp', quantity: 800, chance: 0.5 }
  ] },
  { id: 'hunt_elf_archer', name: 'Duel Elf Archer', skill: 'ranged', levelRequired: 58, xpReward: 700, duration: 15500, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'elf_dust', quantity: 1, chance: 0.6 },
    { itemId: 'gp', quantity: 1200, chance: 0.6 }
  ] },
  // Orc Warriors: Level 60
  { id: 'hunt_orc_mag', name: 'Blast Orc (Magic)', skill: 'magic', levelRequired: 60, xpReward: 800, duration: 16000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 1500, chance: 0.5 }
  ] },
  { id: 'hunt_orc_warlord', name: 'Slay Orc Warlord', skill: 'attack', levelRequired: 63, xpReward: 950, duration: 16500, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 1800, chance: 0.6 }
  ] },
  // Mountain Trolls: Level 65
  { id: 'hunt_troll_att', name: 'Slay Troll (Attack)', skill: 'attack', levelRequired: 65, xpReward: 1000, duration: 17000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 2000, chance: 0.5 }
  ] },
  { id: 'hunt_troll_ice', name: 'Slay Ice Troll', skill: 'strength', levelRequired: 68, xpReward: 1200, duration: 17500, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'big_bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 2500, chance: 0.6 }
  ] },
  // Vampires: Level 70
  { id: 'hunt_vampire_mag', name: 'Purge Vampire (Magic)', skill: 'magic', levelRequired: 70, xpReward: 1300, duration: 18000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'vampire_dust', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 3000, chance: 0.5 }
  ] },
  { id: 'hunt_vampire_lord', name: 'Slay Vampire Lord', skill: 'attack', levelRequired: 73, xpReward: 1500, duration: 19000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'vampire_dust', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 3500, chance: 0.6 }
  ] },
  // Hellhounds: Level 75
  { id: 'hunt_hellhound_ran', name: 'Pierce Hellhound (Ranged)', skill: 'ranged', levelRequired: 75, xpReward: 1600, duration: 20000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'hellhound_ash', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 4000, chance: 0.5 }
  ] },
  { id: 'hunt_dragon_mithril', name: 'Slay Mithril Dragon', skill: 'magic', levelRequired: 78, xpReward: 1800, duration: 22000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'mithril_dragon_scale', quantity: 1, chance: 0.8 },
    { itemId: 'gp', quantity: 4500, chance: 0.6 }
  ] },
  // Dragons: Weak to Magic/Ranged (Level 80)
  { id: 'hunt_dragon_mag', name: 'Blast Dragon (Magic)', skill: 'magic', levelRequired: 80, xpReward: 2000, duration: 25000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'cooked_swordfish', quantity: 1 }, { itemId: 'death_rune', quantity: 2 }, { itemId: 'blood_rune', quantity: 1 }], outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'dragon_scale', quantity: 2, chance: 0.8 },
    { itemId: 'gp', quantity: 5000, chance: 1 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.1 }
  ] },
  { id: 'hunt_dragon_ran', name: 'Pierce Dragon (Ranged)', skill: 'ranged', levelRequired: 80, xpReward: 2000, duration: 25000, isMonster: true, weakness: 'ranged', inputs: [{ itemId: 'cooked_swordfish', quantity: 1 }, { itemId: 'mithril_arrows', quantity: 5 }], outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'dragon_scale', quantity: 2, chance: 0.8 },
    { itemId: 'gp', quantity: 5000, chance: 1 },
    { itemId: 'uncut_diamond', quantity: 1, chance: 0.1 }
  ] },
  { id: 'hunt_dragon_adamant', name: 'Slay Adamant Dragon', skill: 'magic', levelRequired: 83, xpReward: 2500, duration: 24000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'cooked_monkfish', quantity: 1 }, { itemId: 'death_rune', quantity: 3 }, { itemId: 'blood_rune', quantity: 2 }], outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'adamant_dragon_scale', quantity: 1, chance: 0.8 },
    { itemId: 'gp', quantity: 6000, chance: 0.6 }
  ] },
  // Abyssal Demons: Level 85
  { id: 'hunt_abyssal_att', name: 'Slay Abyssal Demon (Attack)', skill: 'attack', levelRequired: 85, xpReward: 3000, duration: 22000, isMonster: true, weakness: 'attack', secondarySkillRequired: { skill: 'slayer', level: 85 }, inputs: [{ itemId: 'cooked_monkfish', quantity: 2 }], outputs: [
    { itemId: 'abyssal_head', quantity: 1, chance: 0.05 },
    { itemId: 'abyssal_whip', quantity: 1, chance: 0.001 },
    { itemId: 'gp', quantity: 7000, chance: 1 }
  ] },
  { id: 'hunt_dragon_rune', name: 'Slay Rune Dragon', skill: 'magic', levelRequired: 88, xpReward: 4000, duration: 26000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'cooked_mantaray', quantity: 1 }, { itemId: 'death_rune', quantity: 4 }, { itemId: 'blood_rune', quantity: 3 }], outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'rune_dragon_scale', quantity: 1, chance: 0.8 },
    { itemId: 'gp', quantity: 9000, chance: 0.6 }
  ] },
  // Ancient Guardians: Level 90
  { id: 'hunt_guardian_mag', name: 'Shatter Guardian (Magic)', skill: 'magic', levelRequired: 90, xpReward: 4500, duration: 28000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'ancient_bone', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 10000, chance: 1 }
  ] },
  { id: 'hunt_void_reaver', name: 'Slay Void Reaver', skill: 'attack', levelRequired: 93, xpReward: 5500, duration: 29000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'raid_relic', quantity: 1, chance: 0.005 },
    { itemId: 'gp', quantity: 12000, chance: 1 }
  ] },
  // Void Horrors: Level 95
  { id: 'hunt_void_ran', name: 'Pierce Void Horror (Ranged)', skill: 'ranged', levelRequired: 95, xpReward: 6000, duration: 30000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'raid_relic', quantity: 1, chance: 0.01 },
    { itemId: 'gp', quantity: 15000, chance: 1 }
  ] },
  { id: 'hunt_void_spinner', name: 'Slay Void Spinner', skill: 'magic', levelRequired: 98, xpReward: 8000, duration: 32000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'raid_relic', quantity: 1, chance: 0.02 },
    { itemId: 'gp', quantity: 20000, chance: 1 }
  ] },
  // Meta Skills: Empire (Management & Passive Gains)
  { id: 'tax_collection', name: 'Collect Taxes', skill: 'empire', levelRequired: 1, xpReward: 50, duration: 10000, outputs: [{ itemId: 'gp', quantity: 250, chance: 1 }] },
  { id: 'resource_levy', name: 'Levy Resources', skill: 'empire', levelRequired: 10, xpReward: 120, duration: 15000, outputs: [
    { itemId: 'logs', quantity: 10, chance: 0.5 },
    { itemId: 'copper_ore', quantity: 10, chance: 0.5 },
    { itemId: 'gp', quantity: 500, chance: 1 }
  ] },
  { id: 'inspect_garrison', name: 'Inspect Garrison', skill: 'empire', levelRequired: 20, xpReward: 200, duration: 20000, description: 'Review your military outpost for readiness.', outputs: [
    { itemId: 'gp', quantity: 1000, chance: 1 },
    { itemId: 'iron_bar', quantity: 3, chance: 0.3 }
  ] },
  { id: 'imperial_trade', name: 'Oversee Trade Route', skill: 'empire', levelRequired: 30, xpReward: 400, duration: 30000, outputs: [
    { itemId: 'gp', quantity: 2500, chance: 1 },
    { itemId: 'imperial_seal', quantity: 1, chance: 0.05 }
  ] },
  { id: 'diplomatic_envoy', name: 'Send Diplomatic Envoy', skill: 'empire', levelRequired: 40, xpReward: 650, duration: 40000, description: 'Negotiate alliances with neighboring kingdoms.', outputs: [
    { itemId: 'gp', quantity: 5000, chance: 1 },
    { itemId: 'imperial_seal', quantity: 1, chance: 0.1 }
  ] },
  { id: 'build_monument', name: 'Commission Monument', skill: 'empire', levelRequired: 50, xpReward: 1000, duration: 50000, description: 'Erect a monument to inspire your people.', outputs: [
    { itemId: 'gp', quantity: 7500, chance: 1 },
    { itemId: 'celestial_essence', quantity: 5, chance: 0.15 }
  ] },
  { id: 'conquer_territory', name: 'Expand Borders', skill: 'empire', levelRequired: 60, xpReward: 1500, duration: 60000, outputs: [
    { itemId: 'gp', quantity: 10000, chance: 1 },
    { itemId: 'imperial_seal', quantity: 1, chance: 0.2 }
  ] },
  { id: 'establish_academy', name: 'Establish Academy', skill: 'empire', levelRequired: 70, xpReward: 3000, duration: 90000, description: 'Found a centre of learning. Knowledge is power.', outputs: [
    { itemId: 'gp', quantity: 25000, chance: 1 },
    { itemId: 'imperial_seal', quantity: 1, chance: 0.3 }
  ] },
  { id: 'imperial_decree', name: 'Issue Imperial Decree', skill: 'empire', levelRequired: 80, xpReward: 5000, duration: 120000, outputs: [
    { itemId: 'gp', quantity: 50000, chance: 1 },
    { itemId: 'imperial_seal', quantity: 2, chance: 0.5 }
  ] },
  { id: 'crown_champion', name: 'Crown a Champion', skill: 'empire', levelRequired: 88, xpReward: 8000, duration: 180000, description: 'Appoint a legendary warrior to defend the realm.', outputs: [
    { itemId: 'gp', quantity: 100000, chance: 1 },
    { itemId: 'imperial_seal', quantity: 3, chance: 0.4 },
    { itemId: 'celestial_essence', quantity: 10, chance: 0.2 }
  ] },
  { id: 'establish_colony', name: 'Establish Colony', skill: 'empire', levelRequired: 95, xpReward: 15000, duration: 300000, outputs: [
    { itemId: 'gp', quantity: 250000, chance: 1 },
    { itemId: 'ancient_relic', quantity: 1, chance: 0.1 }
  ] },

  // Slayer (Monster Hunting)
  { id: 'slay_crawler', name: 'Slay Cave Crawler', skill: 'slayer', levelRequired: 1, xpReward: 25, duration: 4000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'crawler_meat', quantity: 1, chance: 1 },
    { itemId: 'bones', quantity: 1, chance: 1 }
  ] },
  { id: 'slay_bug', name: 'Slay Cave Bug', skill: 'slayer', levelRequired: 5, xpReward: 45, duration: 5000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'bug_shell', quantity: 1, chance: 1 },
    { itemId: 'bronze_arrows', quantity: 15, chance: 0.5 }
  ] },
  { id: 'slay_rockslug', name: 'Slay Rockslug', skill: 'slayer', levelRequired: 15, xpReward: 80, duration: 7000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'rockslug_slime', quantity: 1, chance: 1 },
    { itemId: 'iron_ore', quantity: 3, chance: 0.8 },
    { itemId: 'coal', quantity: 2, chance: 0.5 }
  ] },
  { id: 'slay_cockatrice', name: 'Slay Cockatrice', skill: 'slayer', levelRequired: 25, xpReward: 150, duration: 9000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'cockatrice_egg', quantity: 1, chance: 1 },
    { itemId: 'bones', quantity: 2, chance: 1 },
    { itemId: 'iron_sword', quantity: 1, chance: 0.1 }
  ] },
  { id: 'slay_basilisk', name: 'Slay Basilisk', skill: 'slayer', levelRequired: 40, xpReward: 300, duration: 12000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'basilisk_jaw', quantity: 1, chance: 1 },
    { itemId: 'bones', quantity: 3, chance: 1 },
    { itemId: 'mithril_ore', quantity: 5, chance: 0.5 }
  ] },
  { id: 'slay_kurask', name: 'Slay Kurask', skill: 'slayer', levelRequired: 70, xpReward: 800, duration: 18000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'kurask_horn', quantity: 1, chance: 1 },
    { itemId: 'bones', quantity: 5, chance: 1 },
    { itemId: 'adamant_ore', quantity: 3, chance: 0.4 },
    { itemId: 'runite_arrows', quantity: 20, chance: 0.3 }
  ] },
  { id: 'slay_abyssal_demon', name: 'Slay Abyssal Demon', skill: 'slayer', levelRequired: 85, xpReward: 2000, duration: 25000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'abyssal_whip', quantity: 1, chance: 0.002 },
    { itemId: 'runite_ore', quantity: 2, chance: 0.2 },
    { itemId: 'blood_rune', quantity: 50, chance: 0.5 }
  ] },
  { id: 'slay_dragon_lord', name: 'Slay The Dragon Lord', skill: 'slayer', levelRequired: 99, xpReward: 50000, duration: 300000, isMonster: true, weakness: 'ranged', inputs: [{ itemId: 'dragon_slayer_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 5 }], outputs: [
    { itemId: 'dragon_lord_trophy', quantity: 1, chance: 1 },
    { itemId: 'dragonite_ore', quantity: 50, chance: 1 },
    { itemId: 'clue_scroll_master', quantity: 1, chance: 0.5 }
  ] },
  { id: 'slay_void_reaper', name: 'Slay Void Reaper', skill: 'slayer', levelRequired: 99, xpReward: 100000, duration: 600000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'void_reaper_trophy', quantity: 1, chance: 1 },
    { itemId: 'void_essence', quantity: 10, chance: 1 },
    { itemId: 'void_blade', quantity: 1, chance: 0.01 }
  ] },

  // Meta Skills: Raids (High-Level Challenges)
  { id: 'raid_crypt', name: 'Raid Ancient Crypt', skill: 'raids', levelRequired: 1, xpReward: 500, duration: 60000, outputs: [
    { itemId: 'gp', quantity: 5000, chance: 1 },
    { itemId: 'ancient_bone', quantity: 2, chance: 0.5 },
    { itemId: 'raid_relic', quantity: 1, chance: 0.01 }
  ] },
  { id: 'raid_fortress', name: 'Storm Orc Fortress', skill: 'raids', levelRequired: 40, xpReward: 2500, duration: 120000, outputs: [
    { itemId: 'gp', quantity: 25000, chance: 1 },
    { itemId: 'adamant_bar', quantity: 5, chance: 0.5 },
    { itemId: 'raid_relic', quantity: 1, chance: 0.05 }
  ] },
  { id: 'raid_dragon_lair', name: 'Dragon Lord Lair', skill: 'raids', levelRequired: 80, xpReward: 10000, duration: 300000, outputs: [
    { itemId: 'gp', quantity: 100000, chance: 1 },
    { itemId: 'runite_bar', quantity: 10, chance: 0.5 },
    { itemId: 'raid_relic', quantity: 1, chance: 0.2 }
  ] },
  { id: 'raid_void_citadel', name: 'Storm Void Citadel', skill: 'raids', levelRequired: 99, xpReward: 50000, duration: 600000, outputs: [
    { itemId: 'gp', quantity: 500000, chance: 1 },
    { itemId: 'necrite_bar', quantity: 5, chance: 0.5 },
    { itemId: 'ancient_relic', quantity: 1, chance: 0.5 }
  ] },
  { id: 'raid_void_citadel_hard', name: 'Storm Void Citadel (Hard)', skill: 'raids', levelRequired: 99, xpReward: 250000, duration: 1200000, isMonster: true, weakness: 'magic', inputs: [{ itemId: 'overload_potion', quantity: 2 }, { itemId: 'cooked_mantaray', quantity: 20 }], outputs: [
    { itemId: 'void_essence', quantity: 50, chance: 1 },
    { itemId: 'imperial_crown', quantity: 1, chance: 0.001 },
    { itemId: 'clue_reward_box', quantity: 1, chance: 0.1 }
  ] },

  // Magic Special Actions
  { id: 'high_alchemy', name: 'High Alchemy', skill: 'magic', levelRequired: 55, xpReward: 65, duration: 1500, description: 'Turn items into gold.', inputs: [{ itemId: 'nature_rune', quantity: 1 }, { itemId: 'logs', quantity: 1 }], outputs: [{ itemId: 'gp', quantity: 100, chance: 1 }] },
  { id: 'enchant_sapphire', name: 'Enchant Sapphire Ring', skill: 'magic', levelRequired: 7, xpReward: 17.5, duration: 2000, description: 'Infuse a sapphire ring with magic.', secondarySkillRequired: { skill: 'crafting', level: 20 }, inputs: [{ itemId: 'cosmic_rune', quantity: 1 }, { itemId: 'sapphire_ring', quantity: 1 }], outputs: [{ itemId: 'sapphire_ring', quantity: 1, chance: 1 }] },
  
  // Bosses
  { id: 'boss_dragon_lord', name: 'Hunt The Hollow King', skill: 'slayer', levelRequired: 95, xpReward: 25000, duration: 120000, isMonster: true, isBoss: true, weakness: 'magic', inputs: [{ itemId: 'cooked_shark', quantity: 5 }], outputs: [
    { itemId: 'dragon_lord_trophy', quantity: 1, chance: 1 },
    { itemId: 'dragonite_ore', quantity: 50, chance: 1 },
    { itemId: 'dragon_slayer_blade', quantity: 1, chance: 0.05 }
  ] },
  { id: 'boss_void_reaper', name: 'Hunt Void Sovereign', skill: 'slayer', levelRequired: 99, xpReward: 100000, duration: 300000, isMonster: true, isBoss: true, weakness: 'ranged', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'void_essence', quantity: 10, chance: 1 },
    { itemId: 'ancient_relic', quantity: 1, chance: 0.2 },
    { itemId: 'void_blade', quantity: 1, chance: 0.01 }
  ] },
  { id: 'smith_dragon_med_helm', name: 'Smith Dragon Med Helm', skill: 'smithing', levelRequired: 92, xpReward: 5000, duration: 15000, inputs: [{ itemId: 'dragonite_bar', quantity: 2 }], outputs: [{ itemId: 'dragon_med_helm', quantity: 1, chance: 1 }] },
  { id: 'smith_dragon_sq_shield', name: 'Smith Dragon Sq Shield', skill: 'smithing', levelRequired: 95, xpReward: 10000, duration: 20000, inputs: [{ itemId: 'dragonite_bar', quantity: 5 }], outputs: [{ itemId: 'dragon_sq_shield', quantity: 1, chance: 1 }] },
  { id: 'smith_dragon_platebody', name: 'Smith Dragon Platebody', skill: 'smithing', levelRequired: 99, xpReward: 25000, duration: 30000, inputs: [{ itemId: 'dragonite_bar', quantity: 10 }], outputs: [{ itemId: 'dragon_platebody', quantity: 1, chance: 1 }] },
  { id: 'smith_dragon_platelegs', name: 'Smith Dragon Platelegs', skill: 'smithing', levelRequired: 98, xpReward: 20000, duration: 25000, inputs: [{ itemId: 'dragonite_bar', quantity: 8 }], outputs: [{ itemId: 'dragon_platelegs', quantity: 1, chance: 1 }] },

  { id: 'cut_zenyte', name: 'Cut Zenyte', skill: 'crafting', levelRequired: 98, xpReward: 5000, duration: 5000, inputs: [{ itemId: 'uncut_zenyte', quantity: 1 }], outputs: [{ itemId: 'zenyte_shard', quantity: 1, chance: 1 }] },
  { id: 'craft_torture_amulet', name: 'Craft Amulet of Torture', skill: 'crafting', levelRequired: 99, xpReward: 15000, duration: 20000, inputs: [{ itemId: 'zenyte_shard', quantity: 1 }, { itemId: 'gold_bar', quantity: 1 }], outputs: [{ itemId: 'torture_amulet', quantity: 1, chance: 1 }] },
  { id: 'craft_anguish_necklace', name: 'Craft Necklace of Anguish', skill: 'crafting', levelRequired: 99, xpReward: 15000, duration: 20000, inputs: [{ itemId: 'zenyte_shard', quantity: 1 }, { itemId: 'gold_bar', quantity: 1 }], outputs: [{ itemId: 'anguish_necklace', quantity: 1, chance: 1 }] },
  { id: 'craft_tormented_bracelet', name: 'Craft Tormented Bracelet', skill: 'crafting', levelRequired: 99, xpReward: 15000, duration: 20000, inputs: [{ itemId: 'zenyte_shard', quantity: 1 }, { itemId: 'gold_bar', quantity: 1 }], outputs: [{ itemId: 'tormented_bracelet', quantity: 1, chance: 1 }] },

  { id: 'hunt_vorkath', name: 'Hunt Stormwarden', skill: 'slayer', levelRequired: 95, xpReward: 50000, duration: 120000, isMonster: true, isBoss: true, weakness: 'ranged', inputs: [{ itemId: 'dragon_slayer_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 5 }], outputs: [
    { itemId: 'dragon_bones', quantity: 5, chance: 1 },
    { itemId: 'dragon_scale', quantity: 10, chance: 1 },
    { itemId: 'dragonite_ore', quantity: 5, chance: 0.5 },
    { itemId: 'dragon_med_helm', quantity: 1, chance: 0.05 }
  ] },
  { id: 'hunt_zulrah', name: 'Hunt Voidmother', skill: 'slayer', levelRequired: 92, xpReward: 40000, duration: 100000, isMonster: true, isBoss: true, weakness: 'magic', inputs: [{ itemId: 'antipoison', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 5 }], outputs: [
    { itemId: 'spider_venom', quantity: 5, chance: 1 },
    { itemId: 'uncut_zenyte', quantity: 1, chance: 0.01 },
    { itemId: 'spirit_seed', quantity: 1, chance: 0.1 }
  ] },
  { id: 'hunt_cerberus', name: 'Hunt Emberclaw', skill: 'slayer', levelRequired: 91, xpReward: 35000, duration: 90000, isMonster: true, isBoss: true, weakness: 'attack', inputs: [{ itemId: 'prayer_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 5 }], outputs: [
    { itemId: 'bones', quantity: 10, chance: 1 },
    { itemId: 'primordial_boots', quantity: 1, chance: 0.01 },
    { itemId: 'pegasian_boots', quantity: 1, chance: 0.01 },
    { itemId: 'eternal_boots', quantity: 1, chance: 0.01 }
  ] },

  { id: 'raid_theatre_of_blood', name: 'Raid the Crimson Sanctum', skill: 'raids', levelRequired: 95, xpReward: 150000, duration: 600000, isMonster: true, weakness: 'attack', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 15 }], outputs: [
    { itemId: 'ancient_relic', quantity: 1, chance: 0.5 },
    { itemId: 'raid_relic', quantity: 5, chance: 1 },
    { itemId: 'infernal_cape', quantity: 1, chance: 0.01 }
  ] },
  { id: 'smith_dragonite_body', name: 'Smith Dragonite Body', skill: 'smithing', levelRequired: 99, xpReward: 30000, duration: 35000, inputs: [{ itemId: 'dragonite_bar', quantity: 15 }], outputs: [{ itemId: 'dragonite_body', quantity: 1, chance: 1 }] },

  { id: 'raid_chambers_of_xeric', name: 'Raid the Imperial Vault', skill: 'raids', levelRequired: 90, xpReward: 100000, duration: 450000, isMonster: true, weakness: 'ranged', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'ancient_relic', quantity: 1, chance: 0.3 },
    { itemId: 'raid_relic', quantity: 3, chance: 1 },
    { itemId: 'dragon_sq_shield', quantity: 1, chance: 0.05 }
  ] },
  { id: 'raid_theatre_of_blood_hard', name: 'Raid the Crimson Sanctum (Hard)', skill: 'raids', levelRequired: 99, xpReward: 300000, duration: 900000, isMonster: true, weakness: 'attack', inputs: [{ itemId: 'overload_potion', quantity: 2 }, { itemId: 'cooked_mantaray', quantity: 25 }], outputs: [
    { itemId: 'ancient_relic', quantity: 2, chance: 1 },
    { itemId: 'raid_relic', quantity: 10, chance: 1 },
    { itemId: 'infernal_cape', quantity: 1, chance: 0.05 }
  ] },

  { id: 'hunt_hydra', name: 'Hunt Ashen Wyrm', skill: 'slayer', levelRequired: 95, xpReward: 45000, duration: 110000, isMonster: true, isBoss: true, weakness: 'ranged', inputs: [{ itemId: 'cooked_mantaray', quantity: 5 }], outputs: [
    { itemId: 'bones', quantity: 10, chance: 1 },
    { itemId: 'dragon_bones', quantity: 2, chance: 0.5 },
    { itemId: 'mithril_dragon_scale', quantity: 5, chance: 1 }
  ] },
  { id: 'hunt_alchemical_hydra', name: 'Hunt Elder Wyrm', skill: 'slayer', levelRequired: 99, xpReward: 120000, duration: 300000, isMonster: true, isBoss: true, weakness: 'ranged', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'dragon_bones', quantity: 10, chance: 1 },
    { itemId: 'rune_dragon_scale', quantity: 5, chance: 1 },
    { itemId: 'primordial_boots', quantity: 1, chance: 0.05 }
  ] },

  // Mastery Actions (Level 99)
  { id: 'mastery_mining', name: 'Mastery: Mining', skill: 'mining', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Mining Skillcape.', outputs: [{ itemId: 'cape_mining', quantity: 1, chance: 1 }] },
  { id: 'mastery_woodcutting', name: 'Mastery: Woodcutting', skill: 'woodcutting', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Woodcutting Skillcape.', outputs: [{ itemId: 'cape_woodcutting', quantity: 1, chance: 1 }] },
  { id: 'mastery_fishing', name: 'Mastery: Fishing', skill: 'fishing', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Fishing Skillcape.', outputs: [{ itemId: 'cape_fishing', quantity: 1, chance: 1 }] },
  { id: 'mastery_cooking', name: 'Mastery: Cooking', skill: 'cooking', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Cooking Skillcape.', outputs: [{ itemId: 'cape_cooking', quantity: 1, chance: 1 }] },
  { id: 'mastery_smithing', name: 'Mastery: Smithing', skill: 'smithing', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Smithing Skillcape.', outputs: [{ itemId: 'cape_smithing', quantity: 1, chance: 1 }] },
  { id: 'mastery_crafting', name: 'Mastery: Crafting', skill: 'crafting', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Crafting Skillcape.', outputs: [{ itemId: 'cape_crafting', quantity: 1, chance: 1 }] },
  { id: 'mastery_thieving', name: 'Mastery: Thieving', skill: 'thieving', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Thieving Skillcape.', outputs: [{ itemId: 'cape_thieving', quantity: 1, chance: 1 }] },
  { id: 'mastery_herblore', name: 'Mastery: Herblore', skill: 'herblore', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Herblore Skillcape.', outputs: [{ itemId: 'cape_herblore', quantity: 1, chance: 1 }] },
  { id: 'mastery_slayer', name: 'Mastery: Slayer', skill: 'slayer', levelRequired: 99, xpReward: 10000, duration: 60000, description: 'Claim your Slayer Skillcape.', outputs: [{ itemId: 'cape_slayer', quantity: 1, chance: 1 }] },

  // New Farming/Grinding Actions
  { id: 'farm_goblins', name: 'Farm Goblins', skill: 'slayer', levelRequired: 1, xpReward: 25, duration: 3000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'gp', quantity: 50, chance: 1 },
    { itemId: 'goblin_ear', quantity: 1, chance: 0.8 },
    { itemId: 'monster_hide', quantity: 1, chance: 0.5 },
    { itemId: 'bronze_loot_bag', quantity: 1, chance: 0.1 }
  ] },
  { id: 'farm_wolves', name: 'Farm Wolves', skill: 'slayer', levelRequired: 10, xpReward: 50, duration: 4000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'wolf_pelt', quantity: 1, chance: 0.6 },
    { itemId: 'beast_claw', quantity: 1, chance: 0.4 },
    { itemId: 'monster_hide', quantity: 2, chance: 0.3 }
  ] },
  { id: 'farm_zombies', name: 'Farm Zombies', skill: 'slayer', levelRequired: 20, xpReward: 100, duration: 5000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'zombie_brain', quantity: 1, chance: 0.7 },
    { itemId: 'vial_of_blood', quantity: 1, chance: 0.5 },
    { itemId: 'magic_scrap', quantity: 1, chance: 0.2 },
    { itemId: 'iron_loot_chest', quantity: 1, chance: 0.05 }
  ] },
  { id: 'farm_dragons', name: 'Farm Green Dragons', skill: 'slayer', levelRequired: 50, xpReward: 500, duration: 10000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'dragon_bones', quantity: 1, chance: 1 },
    { itemId: 'dragon_fang', quantity: 1, chance: 0.4 },
    { itemId: 'dragon_scale_shard', quantity: 3, chance: 0.8 },
    { itemId: 'dragon_lord_seal', quantity: 1, chance: 0.01 }
  ] },
  { id: 'farm_void_monsters', name: 'Farm Void Horrors', skill: 'slayer', levelRequired: 80, xpReward: 2000, duration: 15000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'void_shard', quantity: 2, chance: 0.9 },
    { itemId: 'dark_energy_core', quantity: 1, chance: 0.3 },
    { itemId: 'void_relic_casket', quantity: 1, chance: 0.02 }
  ] },

  // New Herblore & Crafting Loops
  { id: 'brew_agility_elixir', name: 'Brew Agility Elixir', skill: 'herblore', levelRequired: 40, xpReward: 500, duration: 5000, inputs: [{ itemId: 'spirit_herb', quantity: 2 }, { itemId: 'wolf_pelt', quantity: 1 }], outputs: [{ itemId: 'agility_elixir', quantity: 1, chance: 1 }] },
  { id: 'brew_thief_brew', name: 'Brew Thief\'s Brew', skill: 'herblore', levelRequired: 55, xpReward: 800, duration: 6000, inputs: [{ itemId: 'spirit_herb', quantity: 3 }, { itemId: 'goblin_ear', quantity: 5 }], outputs: [{ itemId: 'thief_brew', quantity: 1, chance: 1 }] },
  { id: 'refine_slayer_essence', name: 'Refine Slayer Essence', skill: 'herblore', levelRequired: 75, xpReward: 2000, duration: 10000, inputs: [{ itemId: 'vial_of_blood', quantity: 5 }, { itemId: 'zombie_brain', quantity: 2 }], outputs: [{ itemId: 'slayer_essence', quantity: 1, chance: 1 }] },
  
  { id: 'craft_master_kit', name: 'Craft Master Crafting Kit', skill: 'crafting', levelRequired: 85, xpReward: 5000, duration: 20000, inputs: [{ itemId: 'ancient_mechanism', quantity: 2 }, { itemId: 'necrite_bar', quantity: 1 }], outputs: [{ itemId: 'master_crafting_kit', quantity: 1, chance: 1 }] },
  { id: 'forge_mana_crystal', name: 'Forge Pure Mana Crystal', skill: 'runecrafting', levelRequired: 90, xpReward: 10000, duration: 30000, inputs: [{ itemId: 'divine_essence', quantity: 10 }, { itemId: 'void_shard', quantity: 5 }], outputs: [{ itemId: 'pure_mana_crystal', quantity: 1, chance: 1 }] },

  // Repurposing & Crafting Loops
  { id: 'craft_reinforced_leather', name: 'Craft Reinforced Leather', skill: 'crafting', levelRequired: 30, xpReward: 150, duration: 5000, inputs: [{ itemId: 'monster_hide', quantity: 5 }, { itemId: 'vial_of_blood', quantity: 1 }], outputs: [{ itemId: 'reinforced_leather', quantity: 1, chance: 1 }] },
  { id: 'craft_enchanted_string', name: 'Craft Enchanted String', skill: 'crafting', levelRequired: 45, xpReward: 300, duration: 6000, inputs: [{ itemId: 'magic_scrap', quantity: 10 }, { itemId: 'cosmic_rune', quantity: 5 }], outputs: [{ itemId: 'enchanted_string', quantity: 1, chance: 1 }] },
  { id: 'create_alchemical_catalyst', name: 'Create Alchemical Catalyst', skill: 'herblore', levelRequired: 60, xpReward: 1000, duration: 10000, inputs: [{ itemId: 'spirit_herb', quantity: 5 }, { itemId: 'dark_energy_core', quantity: 1 }], outputs: [{ itemId: 'alchemical_catalyst', quantity: 1, chance: 1 }] },
  
  // Key Crafting
  { id: 'craft_crypt_key', name: 'Craft Crypt Key', skill: 'crafting', levelRequired: 20, xpReward: 500, duration: 5000, inputs: [{ itemId: 'iron_bar', quantity: 2 }, { itemId: 'magic_scrap', quantity: 5 }], outputs: [{ itemId: 'crypt_key', quantity: 1, chance: 1 }] },
  { id: 'craft_fortress_sigil', name: 'Craft Fortress Sigil', skill: 'crafting', levelRequired: 50, xpReward: 2000, duration: 10000, inputs: [{ itemId: 'steel_bar', quantity: 5 }, { itemId: 'ancient_mechanism', quantity: 1 }], outputs: [{ itemId: 'fortress_sigil', quantity: 1, chance: 1 }] },

  // Loot Box Opening (Instant Actions)
  { id: 'open_bronze_bag', name: 'Open Bronze Loot Bag', skill: 'thieving', levelRequired: 1, xpReward: 10, duration: 500, inputs: [{ itemId: 'bronze_loot_bag', quantity: 1 }], outputs: [{ itemId: 'gp', quantity: 250, chance: 1 }, { itemId: 'monster_hide', quantity: 5, chance: 0.5 }] },
  { id: 'open_iron_chest', name: 'Open Iron Loot Chest', skill: 'thieving', levelRequired: 30, xpReward: 50, duration: 500, inputs: [{ itemId: 'iron_loot_chest', quantity: 1 }], outputs: [{ itemId: 'gp', quantity: 1500, chance: 1 }, { itemId: 'iron_bar', quantity: 10, chance: 0.8 }, { itemId: 'uncut_ruby', quantity: 2, chance: 0.2 }] },
  { id: 'open_gold_coffer', name: 'Open Gold Treasure Coffer', skill: 'thieving', levelRequired: 70, xpReward: 250, duration: 500, inputs: [{ itemId: 'gold_treasure_coffer', quantity: 1 }], outputs: [{ itemId: 'gp', quantity: 10000, chance: 1 }, { itemId: 'runite_bar', quantity: 5, chance: 0.9 }, { itemId: 'uncut_diamond', quantity: 3, chance: 0.5 }] },
  { id: 'open_void_casket', name: 'Open Void Relic Casket', skill: 'thieving', levelRequired: 99, xpReward: 1000, duration: 500, inputs: [{ itemId: 'void_relic_casket', quantity: 1 }], outputs: [{ itemId: 'gp', quantity: 50000, chance: 1 }, { itemId: 'void_essence', quantity: 20, chance: 1 }, { itemId: 'necrite_bar', quantity: 10, chance: 0.5 }, { itemId: 'void_blade', quantity: 1, chance: 0.05 }] },

  // Mid-Tier Farming & Slaying
  { id: 'hunt_abyssal_demons', name: 'Slay Abyssal Demons', skill: 'slayer', levelRequired: 85, xpReward: 800, duration: 15000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'gp', quantity: 1500, chance: 1 },
    { itemId: 'abyssal_whip', quantity: 1, chance: 0.002 },
    { itemId: 'necrite_ore', quantity: 5, chance: 0.1 },
    { itemId: 'dragonite_ore', quantity: 10, chance: 0.2 },
  ]},
  { id: 'hunt_ancient_wyverns', name: 'Hunt Ancient Wyverns', skill: 'slayer', levelRequired: 75, xpReward: 600, duration: 12000, isMonster: true, weakness: 'ranged', outputs: [
    { itemId: 'gp', quantity: 1000, chance: 1 },
    { itemId: 'dragon_med_helm', quantity: 1, chance: 0.01 },
    { itemId: 'dragonite_ore', quantity: 15, chance: 0.3 },
  ]},
  { id: 'raid_kraken_den', name: 'Raid Kraken Den', skill: 'raids', levelRequired: 70, xpReward: 5000, duration: 300000, isBoss: true, weakness: 'magic', inputs: [{ itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'gp', quantity: 25000, chance: 1 },
    { itemId: 'kraken_tentacle', quantity: 1, chance: 0.05 },
    { itemId: 'master_crafting_kit', quantity: 1, chance: 0.2 },
  ]},
  // New Slayer Tasks
  { id: 'slay_cave_horror', name: 'Slay Cave Horror', skill: 'slayer', levelRequired: 58, xpReward: 400, duration: 12000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'black_mask', quantity: 1, chance: 0.002 },
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 500, chance: 0.5 }
  ] },
  { id: 'slay_dust_devil', name: 'Slay Dust Devil', skill: 'slayer', levelRequired: 65, xpReward: 600, duration: 14000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'dragon_chainbody', quantity: 1, chance: 0.0005 },
    { itemId: 'bones', quantity: 1, chance: 1 },
    { itemId: 'gp', quantity: 800, chance: 0.8 }
  ] },
  { id: 'slay_nechryael', name: 'Slay Nechryael', skill: 'slayer', levelRequired: 80, xpReward: 1200, duration: 18000, isMonster: true, weakness: 'attack', outputs: [
    { itemId: 'rune_boots', quantity: 1, chance: 0.05 },
    { itemId: 'death_rune', quantity: 10, chance: 0.5 },
    { itemId: 'gp', quantity: 1500, chance: 1 }
  ] },
  { id: 'slay_smoke_devil', name: 'Slay Smoke Devil', skill: 'slayer', levelRequired: 93, xpReward: 3000, duration: 22000, isMonster: true, weakness: 'magic', outputs: [
    { itemId: 'occult_necklace', quantity: 1, chance: 0.01 },
    { itemId: 'smoke_essence', quantity: 1, chance: 0.5 },
    { itemId: 'gp', quantity: 5000, chance: 1 }
  ] },

  // New Farming & Herblore Loops
  { id: 'farm_spirit_tree', name: 'Farm Spirit Tree', skill: 'farming', levelRequired: 83, xpReward: 15000, duration: 360000, inputs: [{ itemId: 'spirit_seed', quantity: 1 }], outputs: [{ itemId: 'spirit_herb', quantity: 10, chance: 1 }] },
  { id: 'grind_bones', name: 'Grind Bones', skill: 'herblore', levelRequired: 10, xpReward: 20, duration: 2000, inputs: [{ itemId: 'bones', quantity: 1 }], outputs: [{ itemId: 'bone_meal', quantity: 1, chance: 1 }] },
  { id: 'brew_holy_potion', name: 'Brew Holy Potion', skill: 'herblore', levelRequired: 70, xpReward: 1000, duration: 10000, inputs: [{ itemId: 'bone_meal', quantity: 5 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'prayer_potion', quantity: 2, chance: 1 }] },

  // New Crafting Combinations
  { id: 'assemble_godsword_blade', name: 'Assemble Imperial Blade', skill: 'crafting', levelRequired: 80, xpReward: 5000, duration: 30000, inputs: [{ itemId: 'godsword_shard_1', quantity: 1 }, { itemId: 'godsword_shard_2', quantity: 1 }, { itemId: 'godsword_shard_3', quantity: 1 }], outputs: [{ itemId: 'godsword_blade', quantity: 1, chance: 1 }] },
  { id: 'forge_armadyl_godsword', name: 'Forge Sovereign Greatsword', skill: 'smithing', levelRequired: 90, xpReward: 20000, duration: 60000, inputs: [{ itemId: 'godsword_blade', quantity: 1 }, { itemId: 'armadyl_hilt', quantity: 1 }], outputs: [{ itemId: 'armadyl_godsword', quantity: 1, chance: 1 }] },

  // ===== NEW: Signature Drop Crafting Chains =====
  // Dragon crafting chain
  { id: 'smith_dragonfire_shield', name: 'Smith Dragonfire Shield', skill: 'smithing', levelRequired: 90, xpReward: 15000, duration: 30000, description: 'Forge a shield from the face of a dragon.', inputs: [{ itemId: 'draconic_visage', quantity: 1 }, { itemId: 'dragonite_bar', quantity: 5 }], outputs: [{ itemId: 'dragonfire_shield', quantity: 1, chance: 1 }] },
  { id: 'forge_dragon_claws', name: 'Forge Dragon Claws', skill: 'smithing', levelRequired: 95, xpReward: 25000, duration: 45000, description: 'Forge devastating claws from dragon fragments.', inputs: [{ itemId: 'dragon_claw_fragment', quantity: 4 }, { itemId: 'dragonite_bar', quantity: 2 }], outputs: [{ itemId: 'dragon_claws', quantity: 1, chance: 1 }] },
  { id: 'assemble_dragon_egg', name: 'Assemble Dragon Egg', skill: 'crafting', levelRequired: 99, xpReward: 50000, duration: 60000, description: 'Piece together a petrified dragon egg.', inputs: [{ itemId: 'dragon_egg_shard', quantity: 3 }], outputs: [{ itemId: 'dragon_egg', quantity: 1, chance: 1 }] },

  // Abyssal crafting chain
  { id: 'assemble_abyssal_bludgeon', name: 'Assemble Abyssal Bludgeon', skill: 'crafting', levelRequired: 90, xpReward: 20000, duration: 30000, description: 'Piece together the abyssal weapon.', inputs: [{ itemId: 'abyssal_bludgeon_piece', quantity: 3 }], outputs: [{ itemId: 'abyssal_bludgeon', quantity: 1, chance: 1 }] },
  { id: 'weave_abyssal_robe_top', name: 'Weave Abyssal Robe Top', skill: 'crafting', levelRequired: 85, xpReward: 8000, duration: 20000, description: 'Weave robes from abyssal thread.', inputs: [{ itemId: 'abyssal_thread', quantity: 5 }, { itemId: 'silk', quantity: 10 }], outputs: [{ itemId: 'abyssal_robe_top', quantity: 1, chance: 1 }] },
  { id: 'weave_abyssal_robe_legs', name: 'Weave Abyssal Robe Legs', skill: 'crafting', levelRequired: 85, xpReward: 8000, duration: 20000, inputs: [{ itemId: 'abyssal_thread', quantity: 5 }, { itemId: 'silk', quantity: 10 }], outputs: [{ itemId: 'abyssal_robe_legs', quantity: 1, chance: 1 }] },

  // Vampire crafting chain
  { id: 'craft_blood_diamond_ring', name: 'Craft Blood Diamond Ring', skill: 'crafting', levelRequired: 80, xpReward: 5000, duration: 15000, inputs: [{ itemId: 'blood_diamond', quantity: 1 }, { itemId: 'gold_bar', quantity: 1 }], outputs: [{ itemId: 'blood_diamond_ring', quantity: 1, chance: 1 }] },
  { id: 'brew_vampyrism_potion', name: 'Brew Vampyrism Potion', skill: 'herblore', levelRequired: 80, xpReward: 3000, duration: 10000, inputs: [{ itemId: 'vampire_fang', quantity: 3 }, { itemId: 'vial_of_blood', quantity: 2 }, { itemId: 'blood_rune', quantity: 5 }], outputs: [{ itemId: 'vampyrism_potion', quantity: 1, chance: 1 }] },
  { id: 'assemble_sanguinesti_staff', name: 'Assemble Sanguinesti Staff', skill: 'crafting', levelRequired: 95, xpReward: 30000, duration: 45000, inputs: [{ itemId: 'sanguinesti_staff_piece', quantity: 3 }, { itemId: 'blood_rune', quantity: 100 }], outputs: [{ itemId: 'sanguinesti_staff', quantity: 1, chance: 1 }] },

  // Hellfire crafting chain
  { id: 'smith_hellfire_sword', name: 'Smith Hellfire Sword', skill: 'smithing', levelRequired: 85, xpReward: 10000, duration: 25000, inputs: [{ itemId: 'hellfire_metal', quantity: 5 }, { itemId: 'dragonite_bar', quantity: 2 }], outputs: [{ itemId: 'hellfire_sword', quantity: 1, chance: 1 }] },

  // Zulrah crafting chain
  { id: 'craft_toxic_blowpipe', name: 'Craft Venom Spitter', skill: 'crafting', levelRequired: 90, xpReward: 12000, duration: 20000, inputs: [{ itemId: 'tanzanite_fang', quantity: 1 }], outputs: [{ itemId: 'toxic_blowpipe', quantity: 1, chance: 1 }] },
  { id: 'craft_trident_of_swamp', name: 'Craft Trident of the Swamp', skill: 'crafting', levelRequired: 90, xpReward: 12000, duration: 20000, inputs: [{ itemId: 'magic_fang', quantity: 1 }, { itemId: 'death_rune', quantity: 50 }], outputs: [{ itemId: 'trident_of_swamp', quantity: 1, chance: 1 }] },
  { id: 'craft_serpentine_helm', name: 'Craft Abyssal Visage', skill: 'crafting', levelRequired: 75, xpReward: 5000, duration: 15000, inputs: [{ itemId: 'serpentine_scale', quantity: 20 }], outputs: [{ itemId: 'serpentine_helm', quantity: 1, chance: 1 }] },

  // Hydra crafting chain
  { id: 'craft_ferocious_gloves', name: 'Craft Wyrm Grips', skill: 'crafting', levelRequired: 85, xpReward: 8000, duration: 15000, inputs: [{ itemId: 'hydra_leather', quantity: 3 }], outputs: [{ itemId: 'ferocious_gloves', quantity: 1, chance: 1 }] },

  // Elven crafting
  { id: 'shape_crystal_bow', name: 'Shape Crystal Bow', skill: 'crafting', levelRequired: 85, xpReward: 10000, duration: 25000, inputs: [{ itemId: 'crystal_seed', quantity: 1 }], outputs: [{ itemId: 'crystal_bow', quantity: 1, chance: 1 }] },

  // Twisted Bow assembly
  { id: 'assemble_twisted_bow', name: 'Assemble Twisted Bow', skill: 'crafting', levelRequired: 99, xpReward: 100000, duration: 120000, description: 'Assemble THE legendary bow.', inputs: [{ itemId: 'twisted_bow_limb', quantity: 2 }, { itemId: 'magic_logs', quantity: 50 }, { itemId: 'bowstring', quantity: 10 }], outputs: [{ itemId: 'twisted_bow', quantity: 1, chance: 1 }] },

  // Primal crafting chain (howl essence + wolf materials -> armor)
  { id: 'tan_primal_leather', name: 'Tan Primal Leather', skill: 'crafting', levelRequired: 55, xpReward: 500, duration: 8000, inputs: [{ itemId: 'wolf_leather', quantity: 2 }, { itemId: 'howl_essence', quantity: 1 }], outputs: [{ itemId: 'primal_leather', quantity: 1, chance: 1 }] },
  { id: 'craft_primal_body', name: 'Craft Primal Body', skill: 'crafting', levelRequired: 60, xpReward: 2000, duration: 12000, inputs: [{ itemId: 'primal_leather', quantity: 5 }], outputs: [{ itemId: 'primal_body', quantity: 1, chance: 1 }] },
  { id: 'craft_primal_legs', name: 'Craft Primal Legs', skill: 'crafting', levelRequired: 60, xpReward: 2000, duration: 12000, inputs: [{ itemId: 'primal_leather', quantity: 4 }], outputs: [{ itemId: 'primal_legs', quantity: 1, chance: 1 }] },

  // Enchanting chain
  { id: 'enchant_ruby', name: 'Enchant Ruby', skill: 'magic', levelRequired: 49, xpReward: 200, duration: 3000, inputs: [{ itemId: 'uncut_ruby', quantity: 1 }, { itemId: 'cosmic_rune', quantity: 3 }], outputs: [{ itemId: 'enchanted_ruby', quantity: 1, chance: 1 }] },
  { id: 'enchant_diamond', name: 'Enchant Diamond', skill: 'magic', levelRequired: 68, xpReward: 500, duration: 4000, inputs: [{ itemId: 'uncut_diamond', quantity: 1 }, { itemId: 'cosmic_rune', quantity: 5 }], outputs: [{ itemId: 'enchanted_diamond', quantity: 1, chance: 1 }] },

  // Advanced cooking
  { id: 'cook_wilderness_stew', name: 'Cook Wilderness Stew', skill: 'cooking', levelRequired: 75, xpReward: 2000, duration: 15000, description: 'A legendary stew made from wild ingredients.', inputs: [{ itemId: 'cooked_bear_meat', quantity: 2 }, { itemId: 'herbs', quantity: 5 }, { itemId: 'vial_of_water', quantity: 1 }], outputs: [{ itemId: 'wilderness_stew', quantity: 1, chance: 1 }] },
  { id: 'cook_dragon_feast', name: 'Cook Dragon Feast', skill: 'cooking', levelRequired: 95, xpReward: 10000, duration: 30000, description: 'A feast fit for a dragon slayer.', inputs: [{ itemId: 'cooked_dragon_meat', quantity: 3 }, { itemId: 'cooked_mantaray', quantity: 2 }, { itemId: 'spirit_herb', quantity: 3 }], outputs: [{ itemId: 'dragon_feast', quantity: 1, chance: 1 }] },

  // ===== MID-GAME BOSSES =====
  { id: 'boss_stoneguard', name: 'Boss: Stoneguard Titan', skill: 'slayer', levelRequired: 50, xpReward: 8000, duration: 60000, isMonster: true, isBoss: true, weakness: 'strength', description: 'A massive golem awakened from ancient ruins. Impervious to blades — crush it.', inputs: [{ itemId: 'cooked_swordfish', quantity: 5 }], outputs: [
    { itemId: 'gp', quantity: 15000, chance: 1 },
    { itemId: 'titan_core', quantity: 1, chance: 0.08 },
  ] },
  { id: 'boss_shadowfang', name: 'Boss: Shadowfang Alpha', skill: 'slayer', levelRequired: 70, xpReward: 20000, duration: 80000, isMonster: true, isBoss: true, weakness: 'ranged', description: 'The alpha of a shadow wolf pack. Strikes from darkness with blinding speed.', inputs: [{ itemId: 'cooked_shark', quantity: 5 }], outputs: [
    { itemId: 'gp', quantity: 30000, chance: 1 },
    { itemId: 'shadow_fang', quantity: 1, chance: 0.1 },
  ] },
  { id: 'boss_leviathan', name: 'Boss: Tidecaller Leviathan', skill: 'slayer', levelRequired: 80, xpReward: 35000, duration: 100000, isMonster: true, isBoss: true, weakness: 'magic', description: 'A colossal sea serpent that controls the tides. Its roar creates tidal waves.', inputs: [{ itemId: 'antipoison', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 5 }], outputs: [
    { itemId: 'gp', quantity: 50000, chance: 1 },
    { itemId: 'leviathan_scale', quantity: 1, chance: 0.08 },
  ] },

  // ===== ARCHFIEND ENCOUNTERS =====
  { id: 'archfiend_hollow_king', name: 'Archfiend: The Hollow King', skill: 'slayer', levelRequired: 90, xpReward: 60000, duration: 180000, isMonster: true, isBoss: true, weakness: 'magic', description: 'A skeletal monarch who refuses to relinquish his throne. Commands legions of the dead.', inputs: [{ itemId: 'prayer_potion', quantity: 2 }, { itemId: 'cooked_mantaray', quantity: 8 }], outputs: [
    { itemId: 'kings_vestige', quantity: 1, chance: 0.3 },
    { itemId: 'gp', quantity: 25000, chance: 1 },
    { itemId: 'ancient_relic', quantity: 1, chance: 0.1 },
    { itemId: 'dragon_bones', quantity: 10, chance: 1 },
  ] },
  { id: 'archfiend_emberclaw', name: 'Archfiend: Emberclaw', skill: 'slayer', levelRequired: 93, xpReward: 75000, duration: 200000, isMonster: true, isBoss: true, weakness: 'ranged', description: 'A primordial beast of living flame. Its claws melt steel on contact.', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'ember_core', quantity: 1, chance: 0.25 },
    { itemId: 'gp', quantity: 35000, chance: 1 },
    { itemId: 'dragon_bones', quantity: 15, chance: 1 },
    { itemId: 'dragonite_ore', quantity: 10, chance: 0.5 },
  ] },
  { id: 'archfiend_voidmother', name: 'Archfiend: Voidmother', skill: 'slayer', levelRequired: 95, xpReward: 85000, duration: 240000, isMonster: true, isBoss: true, weakness: 'attack', description: 'An ancient abyssal entity that births horrors from the void. Her gaze paralyzes the weak.', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'antipoison', quantity: 2 }, { itemId: 'cooked_mantaray', quantity: 10 }], outputs: [
    { itemId: 'gp', quantity: 40000, chance: 1 },
    { itemId: 'void_essence', quantity: 15, chance: 1 },
    { itemId: 'dragon_bones', quantity: 10, chance: 1 },
  ] },
  { id: 'archfiend_stormwarden', name: 'Archfiend: Stormwarden', skill: 'slayer', levelRequired: 97, xpReward: 95000, duration: 250000, isMonster: true, isBoss: true, weakness: 'magic', description: 'A draconic guardian of the sky peaks. Commands lightning and wind.', inputs: [{ itemId: 'overload_potion', quantity: 1 }, { itemId: 'cooked_mantaray', quantity: 12 }], outputs: [
    { itemId: 'gp', quantity: 45000, chance: 1 },
    { itemId: 'dragonite_ore', quantity: 20, chance: 1 },
    { itemId: 'dragon_bones', quantity: 20, chance: 1 },
  ] },
  { id: 'archfiend_elder_wyrm', name: 'Archfiend: The Ashen Wyrm', skill: 'slayer', levelRequired: 99, xpReward: 150000, duration: 360000, isMonster: true, isBoss: true, weakness: 'ranged', description: 'The eldest and most devastating of all wyrms. Its breath reduces stone to ash.', inputs: [{ itemId: 'overload_potion', quantity: 2 }, { itemId: 'cooked_mantaray', quantity: 15 }, { itemId: 'prayer_potion', quantity: 2 }], outputs: [
    { itemId: 'gp', quantity: 75000, chance: 1 },
    { itemId: 'dragonite_ore', quantity: 30, chance: 1 },
    { itemId: 'dragon_bones', quantity: 30, chance: 1 },
    { itemId: 'void_essence', quantity: 10, chance: 0.5 },
  ] },

  // ===== CONSTRUCTION =====
  { id: 'saw_planks', name: 'Saw Planks', skill: 'construction', levelRequired: 1, xpReward: 30, duration: 5000, description: 'Saw logs into basic planks.', inputs: [{ itemId: 'logs', quantity: 3 }], outputs: [{ itemId: 'planks', quantity: 2, chance: 1 }, { itemId: 'nails', quantity: 5, chance: 0.5 }] },
  { id: 'carve_stone', name: 'Carve Stone Blocks', skill: 'construction', levelRequired: 10, xpReward: 60, duration: 8000, description: 'Carve raw stone into building blocks.', inputs: [{ itemId: 'copper_ore', quantity: 5 }], outputs: [{ itemId: 'stone_block', quantity: 3, chance: 1 }] },
  { id: 'saw_oak_planks', name: 'Saw Oak Planks', skill: 'construction', levelRequired: 20, xpReward: 120, duration: 8000, description: 'Process oak logs into sturdy planks.', inputs: [{ itemId: 'oak_logs', quantity: 3 }], outputs: [{ itemId: 'oak_planks', quantity: 2, chance: 1 }, { itemId: 'nails', quantity: 10, chance: 0.5 }] },
  { id: 'build_workshop', name: 'Build Workshop', skill: 'construction', levelRequired: 15, xpReward: 200, duration: 30000, description: 'A basic workshop for crafting. Produces components over time.', inputs: [{ itemId: 'planks', quantity: 10 }, { itemId: 'nails', quantity: 20 }, { itemId: 'stone_block', quantity: 5 }], outputs: [{ itemId: 'gp', quantity: 500, chance: 1 }] },
  { id: 'build_watchtower', name: 'Build Watchtower', skill: 'construction', levelRequired: 30, xpReward: 500, duration: 45000, description: 'A tower overlooking your domain. Increases security and trade.', inputs: [{ itemId: 'oak_planks', quantity: 15 }, { itemId: 'stone_block', quantity: 20 }, { itemId: 'nails', quantity: 30 }], outputs: [{ itemId: 'gp', quantity: 2500, chance: 1 }, { itemId: 'imperial_seal', quantity: 1, chance: 0.1 }] },
  { id: 'saw_teak_planks', name: 'Saw Teak Planks', skill: 'construction', levelRequired: 40, xpReward: 250, duration: 10000, description: 'Process teak logs into premium planks.', inputs: [{ itemId: 'teak_logs', quantity: 3 }], outputs: [{ itemId: 'teak_planks', quantity: 2, chance: 1 }] },
  { id: 'build_chapel', name: 'Build Chapel', skill: 'construction', levelRequired: 50, xpReward: 1000, duration: 60000, description: 'A holy place of worship. Amplifies prayer training.', inputs: [{ itemId: 'teak_planks', quantity: 20 }, { itemId: 'stone_block', quantity: 30 }, { itemId: 'gold_bar', quantity: 5 }], outputs: [{ itemId: 'gp', quantity: 10000, chance: 1 }, { itemId: 'celestial_essence', quantity: 5, chance: 0.3 }] },
  { id: 'quarry_marble', name: 'Quarry Marble', skill: 'construction', levelRequired: 60, xpReward: 400, duration: 15000, description: 'Extract and polish marble blocks.', inputs: [{ itemId: 'stone_block', quantity: 5 }], outputs: [{ itemId: 'marble_block', quantity: 1, chance: 1 }] },
  { id: 'build_grand_hall', name: 'Build Grand Hall', skill: 'construction', levelRequired: 70, xpReward: 2500, duration: 90000, description: 'A magnificent hall for hosting feasts and councils.', inputs: [{ itemId: 'teak_planks', quantity: 30 }, { itemId: 'marble_block', quantity: 10 }, { itemId: 'gold_bar', quantity: 10 }], outputs: [{ itemId: 'gp', quantity: 50000, chance: 1 }, { itemId: 'imperial_seal', quantity: 2, chance: 0.3 }] },
  { id: 'build_treasury_vault', name: 'Build Treasury Vault', skill: 'construction', levelRequired: 80, xpReward: 5000, duration: 120000, description: 'A fortified vault to protect your wealth. Generates passive income.', inputs: [{ itemId: 'marble_block', quantity: 20 }, { itemId: 'mithril_bar', quantity: 10 }, { itemId: 'gold_bar', quantity: 20 }], outputs: [{ itemId: 'gp', quantity: 100000, chance: 1 }, { itemId: 'celestial_essence', quantity: 10, chance: 0.2 }] },
  { id: 'build_throne_room', name: 'Build Throne Room', skill: 'construction', levelRequired: 90, xpReward: 10000, duration: 180000, description: 'The ultimate symbol of power. A throne worthy of an emperor.', inputs: [{ itemId: 'marble_block', quantity: 40 }, { itemId: 'adamantite_bar', quantity: 10 }, { itemId: 'gold_bar', quantity: 50 }], outputs: [{ itemId: 'gp', quantity: 250000, chance: 1 }, { itemId: 'celestial_essence', quantity: 25, chance: 0.5 }] },
];

export const KINGDOM_WORKERS: KingdomWorker[] = [
  {
    id: 'worker_miner',
    name: 'Kingdom Miner',
    description: 'A humble miner who extracts gold for the treasury.',
    baseCost: 1000,
    costMultiplier: 1.15,
    bonusType: 'gp',
    bonusValue: 5,
    primarySkillId: 'mining',
    requirements: [
      { skillId: 'mining', level: 20 },
      { skillId: 'woodcutting', level: 10 }
    ]
  },
  {
    id: 'worker_blacksmith',
    name: 'Kingdom Blacksmith',
    description: 'Smelts ores into bars to fund the empire.',
    baseCost: 5000,
    costMultiplier: 1.15,
    bonusType: 'gp',
    bonusValue: 25,
    primarySkillId: 'smithing',
    requirements: [
      { skillId: 'smithing', level: 20 },
      { skillId: 'mining', level: 20 }
    ]
  },
  {
    id: 'worker_lumberjack',
    name: 'Kingdom Lumberjack',
    description: 'Chops wood to sell for the kingdom.',
    baseCost: 12000,
    costMultiplier: 1.15,
    bonusType: 'gp',
    bonusValue: 60,
    primarySkillId: 'woodcutting',
    requirements: [
      { skillId: 'woodcutting', level: 20 },
      { skillId: 'mining', level: 15 }
    ]
  },
  {
    id: 'worker_carpenter',
    name: 'Royal Carpenter',
    description: 'Crafts fine furniture, providing passive Crafting XP.',
    baseCost: 30000,
    costMultiplier: 1.2,
    bonusType: 'xp',
    bonusValue: 15,
    primarySkillId: 'crafting',
    requirements: [
      { skillId: 'crafting', level: 25 },
      { skillId: 'woodcutting', level: 25 }
    ]
  },
  {
    id: 'worker_fisherman',
    name: 'Kingdom Fisherman',
    description: 'Supplies the kingdom with fresh seafood.',
    baseCost: 75000,
    costMultiplier: 1.2,
    bonusType: 'gp',
    bonusValue: 150,
    primarySkillId: 'fishing',
    requirements: [
      { skillId: 'fishing', level: 30 },
      { skillId: 'cooking', level: 20 }
    ]
  },
  {
    id: 'worker_chef',
    name: 'Royal Chef',
    description: 'Prepares grand feasts, providing passive Cooking XP.',
    baseCost: 150000,
    costMultiplier: 1.2,
    bonusType: 'xp',
    bonusValue: 40,
    primarySkillId: 'cooking',
    requirements: [
      { skillId: 'cooking', level: 35 },
      { skillId: 'fishing', level: 30 }
    ]
  },
  {
    id: 'worker_knight',
    name: 'Kingdom Knight',
    description: 'Protects the realm and trains your Strength.',
    baseCost: 300000,
    costMultiplier: 1.2,
    bonusType: 'xp',
    bonusValue: 100,
    primarySkillId: 'strength',
    requirements: [
      { skillId: 'strength', level: 40 },
      { skillId: 'attack', level: 40 },
      { skillId: 'defense', level: 40 }
    ]
  },
  {
    id: 'worker_scholar',
    name: 'Royal Scholar',
    description: 'Studies ancient texts, providing passive XP to Magic.',
    baseCost: 750000,
    costMultiplier: 1.25,
    bonusType: 'xp',
    bonusValue: 250,
    primarySkillId: 'magic',
    requirements: [
      { skillId: 'magic', level: 50 },
      { skillId: 'crafting', level: 40 }
    ]
  },
  {
    id: 'worker_priest',
    name: 'High Priest',
    description: 'Prays for the kingdom, generating Celestial Essence.',
    baseCost: 2000000,
    costMultiplier: 1.3,
    bonusType: 'celestial_essence',
    bonusValue: 0.05,
    primarySkillId: 'prayer',
    requirements: [
      { skillId: 'prayer', level: 60 },
      { skillId: 'magic', level: 50 }
    ]
  },
  {
    id: 'worker_general',
    name: 'Grand General',
    description: 'Commands the infantry, providing massive Strength XP.',
    baseCost: 10000000,
    costMultiplier: 1.35,
    bonusType: 'xp',
    bonusValue: 1000,
    primarySkillId: 'strength',
    requirements: [
      { skillId: 'strength', level: 80 },
      { skillId: 'attack', level: 70 },
      { skillId: 'defense', level: 70 }
    ]
  },
  {
    id: 'worker_archmage',
    name: 'Imperial Archmage',
    description: 'Masters the arcane, generating significant Magic XP and Essence.',
    baseCost: 50000000,
    costMultiplier: 1.4,
    bonusType: 'celestial_essence',
    bonusValue: 0.5,
    primarySkillId: 'magic',
    requirements: [
      { skillId: 'magic', level: 95 },
      { skillId: 'prayer', level: 80 }
    ]
  }
];

export const LEVEL_XP = (level: number) => {
  if (level <= 1) return 0;
  // OSRS-inspired exponential curve: L80 ≈ 30%, L88 ≈ 50%, L95 ≈ 74% of max
  // Early levels feel fast, 80-100 is the real endgame grind
  let total = 0;
  for (let x = 1; x < level; x++) {
    total += Math.floor(x * x * 2 + 100 * Math.pow(2, x / 9.5));
  }
  return Math.floor(total / 2);
};

// Pre-compute XP thresholds for fast lookup
const _XP_TABLE: number[] = [];
for (let i = 0; i <= 100; i++) _XP_TABLE[i] = LEVEL_XP(i);

export const XP_TO_LEVEL = (xp: number) => {
  // Binary search for performance with exponential curve
  let low = 1, high = 100;
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (_XP_TABLE[mid] <= xp) low = mid;
    else high = mid - 1;
  }
  return low;
};

// ===== PET SYSTEM =====
// Each skill has a pet. Base chance ~1/3000 per action, halved at higher levels.
export const SKILL_PETS: Record<SkillId, string> = {
  mining: 'pet_rock_golem',
  woodcutting: 'pet_beaver',
  fishing: 'pet_heron',
  hunting: 'pet_chinchompa',
  farming: 'pet_tangleroot',
  smithing: 'pet_smithing_golem',
  cooking: 'pet_sous_chef',
  herblore: 'pet_herbi',
  crafting: 'pet_crafting_spider',
  runecrafting: 'pet_rift_guardian',
  thieving: 'pet_rocky',
  agility: 'pet_squirrel',
  attack: 'pet_war_hound',
  strength: 'pet_minotaur',
  defense: 'pet_turtle',
  magic: 'pet_phoenix',
  ranged: 'pet_hawk',
  prayer: 'pet_spirit_wolf',
  empire: 'pet_crown_prince',
  raids: 'pet_shadow_drake',
  slayer: 'pet_reaper',
  construction: 'pet_builder_golem',
};

export const PET_BASE_CHANCE = 1 / 3000; // ~1 in 3000 actions

// ===== CLUE SCROLL REWARD TABLES =====
export const CLUE_REWARDS: Record<string, { itemId: string; quantity: number; chance: number }[]> = {
  clue_scroll_easy: [
    { itemId: 'gp', quantity: 5000, chance: 0.5 },
    { itemId: 'gp', quantity: 15000, chance: 0.25 },
    { itemId: 'holy_sandals', chance: 0.02, quantity: 1 },
    { itemId: 'ornament_kit', chance: 0.05, quantity: 1 },
    { itemId: 'treasure_chest', chance: 0.15, quantity: 1 },
    { itemId: 'clue_scroll_medium', chance: 0.03, quantity: 1 },
  ],
  clue_scroll_medium: [
    { itemId: 'gp', quantity: 25000, chance: 0.4 },
    { itemId: 'gp', quantity: 75000, chance: 0.2 },
    { itemId: 'rangers_tunic', chance: 0.01, quantity: 1 },
    { itemId: 'ornament_kit', chance: 0.08, quantity: 1 },
    { itemId: 'treasure_chest', chance: 0.2, quantity: 1 },
    { itemId: 'clue_scroll_hard', chance: 0.05, quantity: 1 },
  ],
  clue_scroll_hard: [
    { itemId: 'gp', quantity: 100000, chance: 0.35 },
    { itemId: 'gp', quantity: 300000, chance: 0.15 },
    { itemId: 'gilded_platebody', chance: 0.008, quantity: 1 },
    { itemId: 'rangers_tunic', chance: 0.03, quantity: 1 },
    { itemId: 'ornament_kit', chance: 0.1, quantity: 1 },
    { itemId: 'clue_scroll_elite', chance: 0.03, quantity: 1 },
  ],
  clue_scroll_elite: [
    { itemId: 'gp', quantity: 500000, chance: 0.3 },
    { itemId: 'gp', quantity: 1500000, chance: 0.1 },
    { itemId: 'third_age_amulet', chance: 0.003, quantity: 1 },
    { itemId: 'gilded_platebody', chance: 0.02, quantity: 1 },
    { itemId: 'bloodhound_pet', chance: 0.005, quantity: 1 },
    { itemId: 'ornament_kit', chance: 0.15, quantity: 1 },
  ],
};
