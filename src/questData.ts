import { Quest } from './types';

export const QUESTS: Quest[] = [
  // ============================================================
  // GATHERING QUESTS
  // ============================================================
  {
    id: 'quest_first_strike',
    name: 'First Strike',
    description: 'Learn the basics of mining by gathering copper and tin ore to smelt your first bronze bar.',
    icon: '⛏️',
    difficulty: 'novice',
    category: 'gathering',
    prerequisites: [],
    objectives: [
      { id: 'fs_1', description: 'Mine 25 Copper Ore', type: 'gather', target: 25, itemId: 'copper_ore' },
      { id: 'fs_2', description: 'Mine 25 Tin Ore', type: 'gather', target: 25, itemId: 'tin_ore' },
      { id: 'fs_3', description: 'Reach Mining level 5', type: 'reach_level', target: 5, skillId: 'mining' },
    ],
    rewards: [
      { type: 'xp', skillId: 'mining', quantity: 500 },
      { type: 'item', itemId: 'iron_pickaxe', quantity: 1 },
      { type: 'gp', quantity: 250 },
    ],
    flavorText: 'Every empire begins with a single swing of the pickaxe.',
  },

  {
    id: 'quest_timber',
    name: 'Timber!',
    description: 'Prove yourself as a woodcutter by felling trees across the starter forests.',
    icon: '🪓',
    difficulty: 'novice',
    category: 'gathering',
    prerequisites: [],
    objectives: [
      { id: 'tb_1', description: 'Chop 50 Logs', type: 'gather', target: 50, itemId: 'logs' },
      { id: 'tb_2', description: 'Chop 25 Oak Logs', type: 'gather', target: 25, itemId: 'oak_logs' },
      { id: 'tb_3', description: 'Reach Woodcutting level 10', type: 'reach_level', target: 10, skillId: 'woodcutting' },
    ],
    rewards: [
      { type: 'xp', skillId: 'woodcutting', quantity: 750 },
      { type: 'item', itemId: 'steel_axe', quantity: 1 },
      { type: 'gp', quantity: 300 },
    ],
    flavorText: 'The forest does not mourn the fallen tree. It simply grows another.',
  },

  {
    id: 'quest_gone_fishing',
    name: 'Gone Fishing',
    description: 'Cast your line and haul in a variety of fish from the starter waters.',
    icon: '🎣',
    difficulty: 'novice',
    category: 'gathering',
    prerequisites: [],
    objectives: [
      { id: 'gf_1', description: 'Catch 30 Raw Shrimp', type: 'gather', target: 30, itemId: 'raw_shrimp' },
      { id: 'gf_2', description: 'Catch 20 Raw Sardine', type: 'gather', target: 20, itemId: 'raw_sardine' },
      { id: 'gf_3', description: 'Catch 10 Raw Trout', type: 'gather', target: 10, itemId: 'raw_trout' },
    ],
    rewards: [
      { type: 'xp', skillId: 'fishing', quantity: 600 },
      { type: 'item', itemId: 'fishing_rod', quantity: 1 },
      { type: 'gp', quantity: 200 },
    ],
    flavorText: 'Patience is the angler\'s greatest weapon. That and bait.',
  },

  {
    id: 'quest_deep_vein',
    name: 'The Deep Vein',
    description: 'Delve into the mid-level mines. Extract iron, coal, and steel ore to feed the forges of the empire.',
    icon: '🏔️',
    difficulty: 'intermediate',
    category: 'gathering',
    prerequisites: [
      { type: 'quest', questId: 'quest_first_strike', quantity: 1 },
      { type: 'skill_level', skillId: 'mining', quantity: 15 },
    ],
    objectives: [
      { id: 'dv_1', description: 'Mine 100 Iron Ore', type: 'gather', target: 100, itemId: 'iron_ore' },
      { id: 'dv_2', description: 'Mine 75 Coal', type: 'gather', target: 75, itemId: 'coal' },
      { id: 'dv_3', description: 'Mine 50 Steel Ore', type: 'gather', target: 50, itemId: 'steel_ore' },
      { id: 'dv_4', description: 'Reach Mining level 30', type: 'reach_level', target: 30, skillId: 'mining' },
    ],
    rewards: [
      { type: 'xp', skillId: 'mining', quantity: 3000 },
      { type: 'item', itemId: 'mithril_pickaxe', quantity: 1 },
      { type: 'gp', quantity: 2000 },
    ],
    flavorText: 'The deeper you dig, the richer the earth becomes - and the darker.',
  },

  {
    id: 'quest_ancient_groves',
    name: 'The Ancient Groves',
    description: 'Journey beyond the common forests into groves where yew and magic trees have grown for millennia.',
    icon: '🌳',
    difficulty: 'experienced',
    category: 'gathering',
    prerequisites: [
      { type: 'quest', questId: 'quest_timber', quantity: 1 },
      { type: 'skill_level', skillId: 'woodcutting', quantity: 40 },
    ],
    objectives: [
      { id: 'ag_1', description: 'Chop 100 Yew Logs', type: 'gather', target: 100, itemId: 'yew_logs' },
      { id: 'ag_2', description: 'Chop 50 Magic Logs', type: 'gather', target: 50, itemId: 'magic_logs' },
      { id: 'ag_3', description: 'Reach Woodcutting level 55', type: 'reach_level', target: 55, skillId: 'woodcutting' },
    ],
    rewards: [
      { type: 'xp', skillId: 'woodcutting', quantity: 8000 },
      { type: 'item', itemId: 'dragon_axe', quantity: 1 },
      { type: 'unlock_action', actionId: 'chop_elder', quantity: 1 },
    ],
    flavorText: 'The elder trees remember when the gods still walked among us.',
  },

  // ============================================================
  // ARTISAN QUESTS
  // ============================================================
  {
    id: 'quest_smiths_apprentice',
    name: 'The Smith\'s Apprentice',
    description: 'Master the fundamentals of the forge. Smelt bronze bars and hammer out your first blade.',
    icon: '🔨',
    difficulty: 'novice',
    category: 'artisan',
    prerequisites: [
      { type: 'quest', questId: 'quest_first_strike', quantity: 1 },
    ],
    objectives: [
      { id: 'sa_1', description: 'Mine 50 Copper Ore', type: 'gather', target: 50, itemId: 'copper_ore' },
      { id: 'sa_2', description: 'Smelt 25 Bronze Bars', type: 'craft', target: 25, itemId: 'bronze_bar', actionId: 'smelt_bronze' },
      { id: 'sa_3', description: 'Smith a Bronze Sword', type: 'craft', target: 1, itemId: 'bronze_sword', actionId: 'smith_bronze_sword' },
    ],
    rewards: [
      { type: 'xp', skillId: 'smithing', quantity: 500 },
      { type: 'item', itemId: 'iron_bar', quantity: 10 },
      { type: 'gp', quantity: 500 },
    ],
    flavorText: 'The forge remembers every blade it has birthed. This one will be yours.',
  },

  {
    id: 'quest_iron_will',
    name: 'Iron Will',
    description: 'Graduate from bronze to iron and steel. The empire\'s soldiers need proper equipment.',
    icon: '🗡️',
    difficulty: 'intermediate',
    category: 'artisan',
    prerequisites: [
      { type: 'quest', questId: 'quest_smiths_apprentice', quantity: 1 },
      { type: 'skill_level', skillId: 'smithing', quantity: 15 },
    ],
    objectives: [
      { id: 'iw_1', description: 'Smelt 50 Iron Bars', type: 'craft', target: 50, itemId: 'iron_bar', actionId: 'smelt_iron' },
      { id: 'iw_2', description: 'Smelt 30 Steel Bars', type: 'craft', target: 30, itemId: 'steel_bar', actionId: 'smelt_steel' },
      { id: 'iw_3', description: 'Smith a Steel Sword', type: 'craft', target: 1, itemId: 'steel_sword', actionId: 'smith_steel_sword' },
      { id: 'iw_4', description: 'Reach Smithing level 25', type: 'reach_level', target: 25, skillId: 'smithing' },
    ],
    rewards: [
      { type: 'xp', skillId: 'smithing', quantity: 3000 },
      { type: 'item', itemId: 'mithril_bar', quantity: 10 },
      { type: 'gp', quantity: 2500 },
    ],
    flavorText: 'Iron bends before it breaks. Steel simply refuses.',
  },

  {
    id: 'quest_master_chef',
    name: 'Master Chef',
    description: 'From humble shrimp to exquisite swordfish - prove your culinary mastery.',
    icon: '👨‍🍳',
    difficulty: 'experienced',
    category: 'artisan',
    prerequisites: [
      { type: 'quest', questId: 'quest_gone_fishing', quantity: 1 },
      { type: 'skill_level', skillId: 'cooking', quantity: 30 },
    ],
    objectives: [
      { id: 'mc_1', description: 'Cook 200 fish of any kind', type: 'craft', target: 200, actionId: 'cook_shrimp' },
      { id: 'mc_2', description: 'Cook 50 Lobsters', type: 'craft', target: 50, itemId: 'cooked_lobster', actionId: 'cook_lobster' },
      { id: 'mc_3', description: 'Brew 25 Potions', type: 'craft', target: 25, actionId: 'brew_attack_potion' },
      { id: 'mc_4', description: 'Reach Cooking level 50', type: 'reach_level', target: 50, skillId: 'cooking' },
    ],
    rewards: [
      { type: 'xp', skillId: 'cooking', quantity: 10000 },
      { type: 'xp', skillId: 'herblore', quantity: 5000 },
      { type: 'item', itemId: 'cooked_shark', quantity: 50 },
      { type: 'gp', quantity: 5000 },
    ],
    flavorText: 'A well-fed army conquers kingdoms. A starving one collapses in the field.',
  },

  {
    id: 'quest_jewel_crafter',
    name: 'The Jewel Crafter',
    description: 'Cut gems and forge them into rings and amulets fit for royalty.',
    icon: '💎',
    difficulty: 'intermediate',
    category: 'artisan',
    prerequisites: [
      { type: 'skill_level', skillId: 'crafting', quantity: 20 },
    ],
    objectives: [
      { id: 'jc_1', description: 'Gather 20 Uncut Sapphires', type: 'gather', target: 20, itemId: 'uncut_sapphire' },
      { id: 'jc_2', description: 'Gather 10 Uncut Emeralds', type: 'gather', target: 10, itemId: 'uncut_emerald' },
      { id: 'jc_3', description: 'Craft 5 Sapphire Rings', type: 'craft', target: 5, itemId: 'sapphire_ring' },
      { id: 'jc_4', description: 'Craft 3 Emerald Amulets', type: 'craft', target: 3, itemId: 'emerald_amulet' },
    ],
    rewards: [
      { type: 'xp', skillId: 'crafting', quantity: 4000 },
      { type: 'item', itemId: 'uncut_ruby', quantity: 10 },
      { type: 'item', itemId: 'gold_bar', quantity: 20 },
      { type: 'gp', quantity: 3000 },
    ],
    flavorText: 'A rough stone holds no beauty. The crafter reveals what was always within.',
  },

  {
    id: 'quest_herbalists_path',
    name: 'The Herbalist\'s Path',
    description: 'Gather herbs, brew potions, and unlock the secrets of alchemical enhancement.',
    icon: '🧪',
    difficulty: 'intermediate',
    category: 'artisan',
    prerequisites: [
      { type: 'skill_level', skillId: 'herblore', quantity: 15 },
      { type: 'skill_level', skillId: 'farming', quantity: 10 },
    ],
    objectives: [
      { id: 'hp_1', description: 'Gather 50 Herbs', type: 'gather', target: 50, itemId: 'herbs' },
      { id: 'hp_2', description: 'Brew 20 Attack Potions', type: 'craft', target: 20, itemId: 'attack_potion', actionId: 'brew_attack_potion' },
      { id: 'hp_3', description: 'Brew 20 Strength Potions', type: 'craft', target: 20, itemId: 'strength_potion', actionId: 'brew_strength_potion' },
      { id: 'hp_4', description: 'Reach Herblore level 25', type: 'reach_level', target: 25, skillId: 'herblore' },
    ],
    rewards: [
      { type: 'xp', skillId: 'herblore', quantity: 4000 },
      { type: 'item', itemId: 'super_defense', quantity: 10 },
      { type: 'item', itemId: 'spirit_herb', quantity: 5 },
      { type: 'gp', quantity: 2000 },
    ],
    flavorText: 'Nature provides the cure. The herbalist merely learns to listen.',
  },

  {
    id: 'quest_rune_mysteries',
    name: 'Rune Mysteries',
    description: 'Unlock the arcane art of runecrafting by gathering essence and binding elemental runes.',
    icon: '🔮',
    difficulty: 'intermediate',
    category: 'artisan',
    prerequisites: [
      { type: 'skill_level', skillId: 'runecrafting', quantity: 10 },
      { type: 'skill_level', skillId: 'magic', quantity: 10 },
    ],
    objectives: [
      { id: 'rm_1', description: 'Gather 100 Rune Essence', type: 'gather', target: 100, itemId: 'rune_essence' },
      { id: 'rm_2', description: 'Craft 50 Air Runes', type: 'craft', target: 50, itemId: 'air_rune' },
      { id: 'rm_3', description: 'Craft 50 Fire Runes', type: 'craft', target: 50, itemId: 'fire_rune' },
      { id: 'rm_4', description: 'Craft 25 Chaos Runes', type: 'craft', target: 25, itemId: 'chaos_rune' },
    ],
    rewards: [
      { type: 'xp', skillId: 'runecrafting', quantity: 5000 },
      { type: 'xp', skillId: 'magic', quantity: 2500 },
      { type: 'item', itemId: 'death_rune', quantity: 50 },
      { type: 'item', itemId: 'nature_rune', quantity: 50 },
    ],
    flavorText: 'The altar hums with power older than language. You begin to understand.',
  },

  // ============================================================
  // COMBAT QUESTS
  // ============================================================
  {
    id: 'quest_rat_catcher',
    name: 'The Rat Catcher',
    description: 'Clear the cellar of oversized vermin. Every warrior starts somewhere.',
    icon: '🐀',
    difficulty: 'novice',
    category: 'combat',
    prerequisites: [],
    objectives: [
      { id: 'rc_1', description: 'Kill 30 Rats', type: 'kill', target: 30, actionId: 'hunt_rat' },
      { id: 'rc_2', description: 'Collect 10 Rat Tails', type: 'gather', target: 10, itemId: 'rat_tail' },
      { id: 'rc_3', description: 'Reach Attack level 5', type: 'reach_level', target: 5, skillId: 'attack' },
    ],
    rewards: [
      { type: 'xp', skillId: 'attack', quantity: 300 },
      { type: 'xp', skillId: 'strength', quantity: 300 },
      { type: 'item', itemId: 'iron_sword', quantity: 1 },
      { type: 'gp', quantity: 150 },
    ],
    flavorText: 'They said it would be easy. They never mentioned the size of the rats.',
  },

  {
    id: 'quest_bone_collector',
    name: 'Bone Collector',
    description: 'The temple requires bones for sacred rites. Hunt the undead and deliver their remains.',
    icon: '🦴',
    difficulty: 'novice',
    category: 'combat',
    prerequisites: [
      { type: 'quest', questId: 'quest_rat_catcher', quantity: 1 },
    ],
    objectives: [
      { id: 'bc_1', description: 'Kill 20 Skeletons', type: 'kill', target: 20, actionId: 'hunt_skeleton' },
      { id: 'bc_2', description: 'Collect 50 Bones', type: 'gather', target: 50, itemId: 'bones' },
      { id: 'bc_3', description: 'Collect 10 Big Bones', type: 'gather', target: 10, itemId: 'big_bones' },
      { id: 'bc_4', description: 'Reach Prayer level 10', type: 'reach_level', target: 10, skillId: 'prayer' },
    ],
    rewards: [
      { type: 'xp', skillId: 'prayer', quantity: 2000 },
      { type: 'xp', skillId: 'attack', quantity: 1000 },
      { type: 'item', itemId: 'ancient_bone', quantity: 5 },
      { type: 'gp', quantity: 750 },
    ],
    flavorText: 'The dead do not rest easy in these lands. Neither should you.',
  },

  {
    id: 'quest_slayer_initiate',
    name: 'Slayer Initiate',
    description: 'Join the Slayer Guild and prove you can take down assigned targets.',
    icon: '💀',
    difficulty: 'intermediate',
    category: 'combat',
    prerequisites: [
      { type: 'quest', questId: 'quest_bone_collector', quantity: 1 },
      { type: 'skill_level', skillId: 'attack', quantity: 15 },
      { type: 'skill_level', skillId: 'slayer', quantity: 5 },
    ],
    objectives: [
      { id: 'si_1', description: 'Slay 25 Cave Crawlers', type: 'kill', target: 25, actionId: 'slay_crawler' },
      { id: 'si_2', description: 'Slay 20 Rockslugs', type: 'kill', target: 20, actionId: 'slay_rockslug' },
      { id: 'si_3', description: 'Slay 15 Cockatrices', type: 'kill', target: 15, actionId: 'slay_cockatrice' },
      { id: 'si_4', description: 'Reach Slayer level 20', type: 'reach_level', target: 20, skillId: 'slayer' },
    ],
    rewards: [
      { type: 'xp', skillId: 'slayer', quantity: 5000 },
      { type: 'item', itemId: 'combat_token', quantity: 25 },
      { type: 'gp', quantity: 5000 },
      { type: 'unlock_action', actionId: 'slay_basilisk', quantity: 1 },
    ],
    flavorText: 'The guild master nods. "You\'ll do. Don\'t die on the first assignment."',
  },

  {
    id: 'quest_dragon_slayer',
    name: 'Dragon Slayer',
    description: 'Face the dragons that terrorize the frontier. Collect their bones and scales as proof of your conquest.',
    icon: '🐉',
    difficulty: 'master',
    category: 'combat',
    prerequisites: [
      { type: 'quest', questId: 'quest_slayer_initiate', quantity: 1 },
      { type: 'skill_level', skillId: 'attack', quantity: 50 },
      { type: 'skill_level', skillId: 'defense', quantity: 40 },
      { type: 'skill_level', skillId: 'slayer', quantity: 40 },
    ],
    objectives: [
      { id: 'ds_1', description: 'Kill 100 Dragons', type: 'kill', target: 100, actionId: 'hunt_dragon_str' },
      { id: 'ds_2', description: 'Collect 50 Dragon Bones', type: 'gather', target: 50, itemId: 'dragon_bones' },
      { id: 'ds_3', description: 'Collect 25 Dragon Scales', type: 'gather', target: 25, itemId: 'dragon_scale' },
      { id: 'ds_4', description: 'Slay the Dragon Lord', type: 'kill', target: 1, actionId: 'slay_dragon_lord' },
    ],
    rewards: [
      { type: 'xp', skillId: 'attack', quantity: 25000 },
      { type: 'xp', skillId: 'slayer', quantity: 15000 },
      { type: 'item', itemId: 'dragonite_bar', quantity: 10 },
      { type: 'unlock_action', actionId: 'boss_dragon_lord', quantity: 1 },
      { type: 'gp', quantity: 50000 },
    ],
    flavorText: 'The dragon opens one ancient eye. It has been waiting for someone worthy.',
  },

  {
    id: 'quest_abyssal_depths',
    name: 'The Abyssal Depths',
    description: 'Descend into the Abyss and face the demons that dwell in the space between worlds.',
    icon: '🕳️',
    difficulty: 'master',
    category: 'combat',
    prerequisites: [
      { type: 'quest', questId: 'quest_slayer_initiate', quantity: 1 },
      { type: 'skill_level', skillId: 'slayer', quantity: 50 },
      { type: 'skill_level', skillId: 'magic', quantity: 40 },
    ],
    objectives: [
      { id: 'ad_1', description: 'Slay 50 Abyssal Demons', type: 'kill', target: 50, actionId: 'slay_abyssal_demon' },
      { id: 'ad_2', description: 'Collect an Abyssal Whip', type: 'gather', target: 1, itemId: 'abyssal_whip' },
      { id: 'ad_3', description: 'Collect 10 Abyssal Heads', type: 'gather', target: 10, itemId: 'abyssal_head' },
      { id: 'ad_4', description: 'Reach Slayer level 60', type: 'reach_level', target: 60, skillId: 'slayer' },
    ],
    rewards: [
      { type: 'xp', skillId: 'slayer', quantity: 20000 },
      { type: 'xp', skillId: 'magic', quantity: 10000 },
      { type: 'item', itemId: 'blood_rune', quantity: 100 },
      { type: 'gp', quantity: 30000 },
    ],
    flavorText: 'The Abyss stares back. It always has.',
  },

  {
    id: 'quest_void_walker',
    name: 'Void Walker',
    description: 'Enter the Void Citadel and confront horrors that exist outside reality itself.',
    icon: '🌀',
    difficulty: 'grandmaster',
    category: 'combat',
    prerequisites: [
      { type: 'quest', questId: 'quest_dragon_slayer', quantity: 1 },
      { type: 'quest', questId: 'quest_abyssal_depths', quantity: 1 },
      { type: 'skill_level', skillId: 'attack', quantity: 70 },
      { type: 'skill_level', skillId: 'strength', quantity: 70 },
      { type: 'skill_level', skillId: 'defense', quantity: 70 },
      { type: 'skill_level', skillId: 'slayer', quantity: 70 },
    ],
    objectives: [
      { id: 'vw_1', description: 'Complete the Void Citadel raid', type: 'kill', target: 5, actionId: 'raid_void_citadel' },
      { id: 'vw_2', description: 'Slay the Void Reaper', type: 'kill', target: 1, actionId: 'slay_void_reaper' },
      { id: 'vw_3', description: 'Collect 25 Void Essence', type: 'gather', target: 25, itemId: 'void_essence' },
      { id: 'vw_4', description: 'Forge a Void Blade', type: 'craft', target: 1, itemId: 'void_blade' },
    ],
    rewards: [
      { type: 'xp', skillId: 'attack', quantity: 50000 },
      { type: 'xp', skillId: 'slayer', quantity: 50000 },
      { type: 'celestial_essence', quantity: 100 },
      { type: 'unlock_action', actionId: 'raid_void_citadel_hard', quantity: 1 },
      { type: 'gp', quantity: 250000 },
    ],
    flavorText: 'Beyond the veil there is no light, no dark - only hunger. You step through anyway.',
  },

  // ============================================================
  // EXPLORATION QUESTS
  // ============================================================
  {
    id: 'quest_light_fingers',
    name: 'Light Fingers',
    description: 'Learn the art of thievery from the guild\'s most infamous pickpocket.',
    icon: '🤏',
    difficulty: 'novice',
    category: 'exploration',
    prerequisites: [
      { type: 'skill_level', skillId: 'thieving', quantity: 5 },
    ],
    objectives: [
      { id: 'lf_1', description: 'Steal 25 Coin Purses', type: 'gather', target: 25, itemId: 'coin_purse' },
      { id: 'lf_2', description: 'Steal 10 Silk', type: 'gather', target: 10, itemId: 'silk' },
      { id: 'lf_3', description: 'Reach Thieving level 15', type: 'reach_level', target: 15, skillId: 'thieving' },
    ],
    rewards: [
      { type: 'xp', skillId: 'thieving', quantity: 1500 },
      { type: 'item', itemId: 'lockpick', quantity: 5 },
      { type: 'gp', quantity: 1000 },
    ],
    flavorText: 'The guild master flips a coin. It vanishes. "Lesson one," she says.',
  },

  {
    id: 'quest_rooftop_runner',
    name: 'Rooftop Runner',
    description: 'Master the agility courses atop the city\'s skyline and earn the Mark of Grace.',
    icon: '🏃',
    difficulty: 'intermediate',
    category: 'exploration',
    prerequisites: [
      { type: 'skill_level', skillId: 'agility', quantity: 15 },
    ],
    objectives: [
      { id: 'rr_1', description: 'Collect 50 Marks of Grace', type: 'gather', target: 50, itemId: 'mark_of_grace' },
      { id: 'rr_2', description: 'Reach Agility level 30', type: 'reach_level', target: 30, skillId: 'agility' },
    ],
    rewards: [
      { type: 'xp', skillId: 'agility', quantity: 5000 },
      { type: 'item', itemId: 'graceful_hood', quantity: 1 },
      { type: 'item', itemId: 'graceful_boots', quantity: 1 },
      { type: 'gp', quantity: 3000 },
    ],
    flavorText: 'From up here, the city looks like a game board. You intend to win.',
  },

  {
    id: 'quest_grand_exchange',
    name: 'The Grand Exchange',
    description: 'Amass wealth and prove yourself as a merchant of the empire.',
    icon: '💰',
    difficulty: 'intermediate',
    category: 'exploration',
    prerequisites: [
      { type: 'gp', quantity: 25000 },
    ],
    objectives: [
      { id: 'ge_1', description: 'Accumulate 100,000 GP', type: 'earn_gp', target: 100000 },
      { id: 'ge_2', description: 'Reach Empire level 10', type: 'reach_level', target: 10, skillId: 'empire' },
    ],
    rewards: [
      { type: 'gp', quantity: 25000 },
      { type: 'xp', skillId: 'empire', quantity: 10000 },
      { type: 'celestial_essence', quantity: 10 },
    ],
    flavorText: 'Gold speaks all languages and opens all doors.',
  },

  {
    id: 'quest_the_great_hunt',
    name: 'The Great Hunt',
    description: 'Track and hunt the most dangerous beasts across every frontier of the empire.',
    icon: '🏹',
    difficulty: 'experienced',
    category: 'exploration',
    prerequisites: [
      { type: 'skill_level', skillId: 'ranged', quantity: 30 },
      { type: 'skill_level', skillId: 'hunting', quantity: 20 },
    ],
    objectives: [
      { id: 'gh_1', description: 'Hunt 30 Wolves', type: 'kill', target: 30, actionId: 'hunt_wolf' },
      { id: 'gh_2', description: 'Hunt 20 Boars', type: 'kill', target: 20, actionId: 'hunt_boar' },
      { id: 'gh_3', description: 'Collect 10 Mammoth Tusks', type: 'gather', target: 10, itemId: 'mammoth_tusk' },
      { id: 'gh_4', description: 'Collect 15 Wolf Furs', type: 'gather', target: 15, itemId: 'wolf_fur' },
    ],
    rewards: [
      { type: 'xp', skillId: 'ranged', quantity: 8000 },
      { type: 'xp', skillId: 'hunting', quantity: 5000 },
      { type: 'item', itemId: 'yew_shortbow', quantity: 1 },
      { type: 'item', itemId: 'dragon_hide', quantity: 5 },
      { type: 'gp', quantity: 8000 },
    ],
    flavorText: 'The mammoth charges. Your hands are steady. This is what you trained for.',
  },

  {
    id: 'quest_farming_fortune',
    name: 'A Farming Fortune',
    description: 'Transform barren land into a flourishing agricultural estate.',
    icon: '🌾',
    difficulty: 'intermediate',
    category: 'exploration',
    prerequisites: [
      { type: 'skill_level', skillId: 'farming', quantity: 15 },
    ],
    objectives: [
      { id: 'ff_1', description: 'Harvest 50 Wheat', type: 'gather', target: 50, itemId: 'wheat' },
      { id: 'ff_2', description: 'Harvest 30 Grapes', type: 'gather', target: 30, itemId: 'grapes' },
      { id: 'ff_3', description: 'Bake 20 Bread', type: 'craft', target: 20, itemId: 'bread' },
      { id: 'ff_4', description: 'Reach Farming level 30', type: 'reach_level', target: 30, skillId: 'farming' },
    ],
    rewards: [
      { type: 'xp', skillId: 'farming', quantity: 5000 },
      { type: 'item', itemId: 'watermelon_seeds', quantity: 20 },
      { type: 'item', itemId: 'magic_seeds', quantity: 3 },
      { type: 'gp', quantity: 4000 },
    ],
    flavorText: 'The earth gives freely to those who tend it with patience.',
  },

  // ============================================================
  // SPECIAL QUESTS
  // ============================================================
  {
    id: 'quest_graceful_shadow',
    name: 'The Graceful Shadow',
    description: 'Collect the full Graceful outfit by mastering the rooftop courses of every district.',
    icon: '🥷',
    difficulty: 'experienced',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_rooftop_runner', quantity: 1 },
      { type: 'skill_level', skillId: 'agility', quantity: 50 },
    ],
    objectives: [
      { id: 'gs_1', description: 'Collect 250 Marks of Grace', type: 'gather', target: 250, itemId: 'mark_of_grace' },
      { id: 'gs_2', description: 'Equip the Graceful Hood', type: 'equip', target: 1, itemId: 'graceful_hood' },
      { id: 'gs_3', description: 'Equip the Graceful Top', type: 'equip', target: 1, itemId: 'graceful_top' },
      { id: 'gs_4', description: 'Equip the Graceful Legs', type: 'equip', target: 1, itemId: 'graceful_legs' },
    ],
    rewards: [
      { type: 'xp', skillId: 'agility', quantity: 15000 },
      { type: 'item', itemId: 'graceful_cape', quantity: 1 },
      { type: 'item', itemId: 'graceful_gloves', quantity: 1 },
      { type: 'celestial_essence', quantity: 25 },
    ],
    flavorText: 'You move like smoke. The guards never see you. They never will.',
  },

  {
    id: 'quest_dragonite_forge',
    name: 'The Dragonite Forge',
    description: 'Discover the lost art of forging dragonite - metal infused with dragon fire itself.',
    icon: '🔥',
    difficulty: 'master',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_dragon_slayer', quantity: 1 },
      { type: 'quest', questId: 'quest_iron_will', quantity: 1 },
      { type: 'skill_level', skillId: 'smithing', quantity: 60 },
    ],
    objectives: [
      { id: 'df_1', description: 'Collect 50 Dragonite Ore', type: 'gather', target: 50, itemId: 'dragonite_ore' },
      { id: 'df_2', description: 'Smelt 25 Dragonite Bars', type: 'craft', target: 25, itemId: 'dragonite_bar' },
      { id: 'df_3', description: 'Forge a Dragonite Sword', type: 'craft', target: 1, itemId: 'dragonite_sword' },
      { id: 'df_4', description: 'Forge a Dragonite Shield', type: 'craft', target: 1, itemId: 'dragonite_shield' },
    ],
    rewards: [
      { type: 'xp', skillId: 'smithing', quantity: 30000 },
      { type: 'unlock_action', actionId: 'smith_dragon_platebody', quantity: 1 },
      { type: 'celestial_essence', quantity: 50 },
      { type: 'gp', quantity: 75000 },
    ],
    flavorText: 'The metal glows white-hot, then shifts to violet. The old masters were right.',
  },

  {
    id: 'quest_crypt_raider',
    name: 'Crypt Raider',
    description: 'Brave the ancient crypts beneath the capital. The dead guard treasures from a forgotten age.',
    icon: '⚰️',
    difficulty: 'experienced',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_bone_collector', quantity: 1 },
      { type: 'skill_level', skillId: 'attack', quantity: 35 },
      { type: 'skill_level', skillId: 'prayer', quantity: 25 },
    ],
    objectives: [
      { id: 'cr_1', description: 'Complete the Crypt raid 3 times', type: 'kill', target: 3, actionId: 'raid_crypt' },
      { id: 'cr_2', description: 'Craft a Crypt Key', type: 'craft', target: 1, itemId: 'crypt_key', actionId: 'craft_crypt_key' },
      { id: 'cr_3', description: 'Collect 25 Ectoplasm', type: 'gather', target: 25, itemId: 'ectoplasm' },
    ],
    rewards: [
      { type: 'xp', skillId: 'attack', quantity: 10000 },
      { type: 'xp', skillId: 'prayer', quantity: 8000 },
      { type: 'unlock_action', actionId: 'raid_fortress', quantity: 1 },
      { type: 'gp', quantity: 15000 },
    ],
    flavorText: 'The sarcophagus lid scrapes open. Something inside has been counting the years.',
  },

  {
    id: 'quest_godsword_saga',
    name: 'The Godsword Saga',
    description: 'Recover the shattered blade of the gods and reforge it in divine fire.',
    icon: '⚔️',
    difficulty: 'grandmaster',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_dragonite_forge', quantity: 1 },
      { type: 'quest', questId: 'quest_void_walker', quantity: 1 },
      { type: 'skill_level', skillId: 'smithing', quantity: 80 },
      { type: 'skill_level', skillId: 'prayer', quantity: 60 },
    ],
    objectives: [
      { id: 'gss_1', description: 'Assemble a Godsword Blade', type: 'craft', target: 1, actionId: 'assemble_godsword_blade' },
      { id: 'gss_2', description: 'Forge the Armadyl Godsword', type: 'craft', target: 1, actionId: 'forge_armadyl_godsword' },
      { id: 'gss_3', description: 'Collect 100 Soul Runes', type: 'gather', target: 100, itemId: 'soul_rune' },
      { id: 'gss_4', description: 'Reach Prayer level 70', type: 'reach_level', target: 70, skillId: 'prayer' },
    ],
    rewards: [
      { type: 'xp', skillId: 'smithing', quantity: 75000 },
      { type: 'xp', skillId: 'prayer', quantity: 50000 },
      { type: 'celestial_essence', quantity: 200 },
      { type: 'gp', quantity: 500000 },
    ],
    flavorText: 'When the blade is made whole, the sky splits open. For a moment, you hear them singing.',
  },

  {
    id: 'quest_imperial_ambition',
    name: 'Imperial Ambition',
    description: 'Expand your empire through trade, taxation, and territorial conquest.',
    icon: '👑',
    difficulty: 'experienced',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_grand_exchange', quantity: 1 },
      { type: 'skill_level', skillId: 'empire', quantity: 20 },
    ],
    objectives: [
      { id: 'ia_1', description: 'Accumulate 500,000 GP', type: 'earn_gp', target: 500000 },
      { id: 'ia_2', description: 'Reach Empire level 35', type: 'reach_level', target: 35, skillId: 'empire' },
      { id: 'ia_3', description: 'Conquer 5 Territories', type: 'kill', target: 5, actionId: 'conquer_territory' },
    ],
    rewards: [
      { type: 'xp', skillId: 'empire', quantity: 25000 },
      { type: 'gp', quantity: 100000 },
      { type: 'celestial_essence', quantity: 50 },
      { type: 'unlock_action', actionId: 'establish_colony', quantity: 1 },
    ],
    flavorText: 'An empire is not built in a day. But today is a good day to start.',
  },

  {
    id: 'quest_leather_worker',
    name: 'The Leather Worker',
    description: 'Tan hides and craft leather armor for the empire\'s scouts and rangers.',
    icon: '🧥',
    difficulty: 'novice',
    category: 'artisan',
    prerequisites: [
      { type: 'skill_level', skillId: 'crafting', quantity: 5 },
    ],
    objectives: [
      { id: 'lw_1', description: 'Gather 20 Fur', type: 'gather', target: 20, itemId: 'fur' },
      { id: 'lw_2', description: 'Craft 10 Leather', type: 'craft', target: 10, itemId: 'leather' },
      { id: 'lw_3', description: 'Craft a Leather Body', type: 'craft', target: 1, itemId: 'leather_body' },
      { id: 'lw_4', description: 'Reach Crafting level 15', type: 'reach_level', target: 15, skillId: 'crafting' },
    ],
    rewards: [
      { type: 'xp', skillId: 'crafting', quantity: 1500 },
      { type: 'item', itemId: 'hard_leather', quantity: 10 },
      { type: 'gp', quantity: 500 },
    ],
    flavorText: 'Good leather stops a dagger. Great leather stops a sword. Yours will stop both.',
  },

  {
    id: 'quest_necrite_nightmare',
    name: 'The Necrite Nightmare',
    description: 'Mine the cursed necrite ore from the deepest shafts and forge armor that channels death itself.',
    icon: '☠️',
    difficulty: 'master',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_deep_vein', quantity: 1 },
      { type: 'skill_level', skillId: 'mining', quantity: 60 },
      { type: 'skill_level', skillId: 'smithing', quantity: 55 },
    ],
    objectives: [
      { id: 'nn_1', description: 'Mine 75 Necrite Ore', type: 'gather', target: 75, itemId: 'necrite_ore' },
      { id: 'nn_2', description: 'Smelt 40 Necrite Bars', type: 'craft', target: 40, itemId: 'necrite_bar' },
      { id: 'nn_3', description: 'Forge Necrite Armor (Body)', type: 'craft', target: 1, itemId: 'necrite_body' },
      { id: 'nn_4', description: 'Forge a Necrite Sword', type: 'craft', target: 1, itemId: 'necrite_sword' },
    ],
    rewards: [
      { type: 'xp', skillId: 'mining', quantity: 20000 },
      { type: 'xp', skillId: 'smithing', quantity: 20000 },
      { type: 'item', itemId: 'necrite_head', quantity: 1 },
      { type: 'item', itemId: 'necrite_legs', quantity: 1 },
      { type: 'gp', quantity: 40000 },
    ],
    flavorText: 'The ore pulses with a faint heartbeat. You tell yourself it is your own.',
  },

  {
    id: 'quest_zenyte_crown',
    name: 'The Zenyte Crown',
    description: 'Craft the rarest jewelry in existence from zenyte gems, reserved for emperors and demigods.',
    icon: '👑',
    difficulty: 'grandmaster',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_jewel_crafter', quantity: 1 },
      { type: 'skill_level', skillId: 'crafting', quantity: 75 },
      { type: 'skill_level', skillId: 'magic', quantity: 60 },
    ],
    objectives: [
      { id: 'zc_1', description: 'Craft a Torture Amulet', type: 'craft', target: 1, actionId: 'craft_torture_amulet' },
      { id: 'zc_2', description: 'Craft an Anguish Necklace', type: 'craft', target: 1, actionId: 'craft_anguish_necklace' },
      { id: 'zc_3', description: 'Craft a Tormented Bracelet', type: 'craft', target: 1, actionId: 'craft_tormented_bracelet' },
      { id: 'zc_4', description: 'Collect 50 Uncut Diamonds', type: 'gather', target: 50, itemId: 'uncut_diamond' },
    ],
    rewards: [
      { type: 'xp', skillId: 'crafting', quantity: 50000 },
      { type: 'xp', skillId: 'magic', quantity: 25000 },
      { type: 'celestial_essence', quantity: 150 },
      { type: 'gp', quantity: 200000 },
    ],
    flavorText: 'The zenyte gleams with trapped starlight. Some say it fell from a god\'s crown.',
  },

  {
    id: 'quest_spirit_caller',
    name: 'Spirit Caller',
    description: 'Brew the forbidden Spirit Potion and commune with the ancient dead to learn their secrets.',
    icon: '👻',
    difficulty: 'master',
    category: 'special',
    prerequisites: [
      { type: 'quest', questId: 'quest_herbalists_path', quantity: 1 },
      { type: 'quest', questId: 'quest_bone_collector', quantity: 1 },
      { type: 'skill_level', skillId: 'herblore', quantity: 50 },
      { type: 'skill_level', skillId: 'prayer', quantity: 40 },
    ],
    objectives: [
      { id: 'sc_1', description: 'Gather 25 Spirit Herbs', type: 'gather', target: 25, itemId: 'spirit_herb' },
      { id: 'sc_2', description: 'Brew 10 Spirit Potions', type: 'craft', target: 10, itemId: 'spirit_potion' },
      { id: 'sc_3', description: 'Brew 5 Overload Potions', type: 'craft', target: 5, itemId: 'overload_potion' },
      { id: 'sc_4', description: 'Grind 100 Bones', type: 'craft', target: 100, actionId: 'grind_bones' },
    ],
    rewards: [
      { type: 'xp', skillId: 'herblore', quantity: 25000 },
      { type: 'xp', skillId: 'prayer', quantity: 15000 },
      { type: 'item', itemId: 'saradomin_brew', quantity: 25 },
      { type: 'celestial_essence', quantity: 40 },
    ],
    flavorText: 'The spirits speak in riddles. But one thing is clear: they remember everything.',
  },

  {
    id: 'quest_chambers_of_xeric',
    name: 'Chambers of Xeric',
    description: 'Assemble a party and conquer the legendary raid dungeon beneath the mountain.',
    icon: '🏛️',
    difficulty: 'grandmaster',
    category: 'combat',
    prerequisites: [
      { type: 'quest', questId: 'quest_crypt_raider', quantity: 1 },
      { type: 'quest', questId: 'quest_dragon_slayer', quantity: 1 },
      { type: 'skill_level', skillId: 'attack', quantity: 75 },
      { type: 'skill_level', skillId: 'strength', quantity: 75 },
      { type: 'skill_level', skillId: 'defense', quantity: 70 },
      { type: 'skill_level', skillId: 'raids', quantity: 30 },
    ],
    objectives: [
      { id: 'cox_1', description: 'Complete the Dragon Lair raid', type: 'kill', target: 3, actionId: 'raid_dragon_lair' },
      { id: 'cox_2', description: 'Complete the Chambers of Xeric', type: 'kill', target: 1, actionId: 'raid_chambers_of_xeric' },
      { id: 'cox_3', description: 'Reach Raids level 50', type: 'reach_level', target: 50, skillId: 'raids' },
    ],
    rewards: [
      { type: 'xp', skillId: 'raids', quantity: 75000 },
      { type: 'xp', skillId: 'attack', quantity: 30000 },
      { type: 'unlock_action', actionId: 'raid_theatre_of_blood', quantity: 1 },
      { type: 'celestial_essence', quantity: 100 },
      { type: 'gp', quantity: 300000 },
    ],
    flavorText: 'Xeric built this place to break heroes. Today, a hero breaks it instead.',
  },

  {
    id: 'quest_fletchers_art',
    name: 'The Fletcher\'s Art',
    description: 'Master the craft of bowmaking - from rough shafts to deadly shortbows.',
    icon: '🏹',
    difficulty: 'intermediate',
    category: 'artisan',
    prerequisites: [
      { type: 'quest', questId: 'quest_timber', quantity: 1 },
      { type: 'skill_level', skillId: 'crafting', quantity: 10 },
    ],
    objectives: [
      { id: 'fa_1', description: 'Craft 50 Arrow Shafts', type: 'craft', target: 50, itemId: 'arrow_shafts' },
      { id: 'fa_2', description: 'Craft 25 Bronze Arrows', type: 'craft', target: 25, itemId: 'bronze_arrows' },
      { id: 'fa_3', description: 'Craft an Oak Shortbow', type: 'craft', target: 1, itemId: 'oak_shortbow' },
      { id: 'fa_4', description: 'Spin 20 Bowstrings', type: 'craft', target: 20, itemId: 'bowstring' },
    ],
    rewards: [
      { type: 'xp', skillId: 'crafting', quantity: 3000 },
      { type: 'item', itemId: 'willow_shortbow', quantity: 1 },
      { type: 'item', itemId: 'steel_arrows', quantity: 100 },
      { type: 'gp', quantity: 2000 },
    ],
    flavorText: 'A well-made bow sings when the string is drawn. Listen for the note.',
  },

  {
    id: 'quest_master_of_all',
    name: 'Master of All Trades',
    description: 'Prove your versatility by reaching competence in every gathering and artisan discipline.',
    icon: '🌟',
    difficulty: 'grandmaster',
    category: 'special',
    prerequisites: [
      { type: 'skill_level', skillId: 'mining', quantity: 50 },
      { type: 'skill_level', skillId: 'woodcutting', quantity: 50 },
      { type: 'skill_level', skillId: 'fishing', quantity: 50 },
      { type: 'skill_level', skillId: 'smithing', quantity: 50 },
      { type: 'skill_level', skillId: 'cooking', quantity: 50 },
      { type: 'skill_level', skillId: 'crafting', quantity: 50 },
    ],
    objectives: [
      { id: 'moa_1', description: 'Reach Mining level 60', type: 'reach_level', target: 60, skillId: 'mining' },
      { id: 'moa_2', description: 'Reach Woodcutting level 60', type: 'reach_level', target: 60, skillId: 'woodcutting' },
      { id: 'moa_3', description: 'Reach Fishing level 60', type: 'reach_level', target: 60, skillId: 'fishing' },
      { id: 'moa_4', description: 'Reach Smithing level 60', type: 'reach_level', target: 60, skillId: 'smithing' },
      { id: 'moa_5', description: 'Reach Cooking level 60', type: 'reach_level', target: 60, skillId: 'cooking' },
      { id: 'moa_6', description: 'Reach Crafting level 60', type: 'reach_level', target: 60, skillId: 'crafting' },
    ],
    rewards: [
      { type: 'xp', skillId: 'mining', quantity: 25000 },
      { type: 'xp', skillId: 'woodcutting', quantity: 25000 },
      { type: 'xp', skillId: 'fishing', quantity: 25000 },
      { type: 'xp', skillId: 'smithing', quantity: 25000 },
      { type: 'xp', skillId: 'cooking', quantity: 25000 },
      { type: 'xp', skillId: 'crafting', quantity: 25000 },
      { type: 'celestial_essence', quantity: 250 },
      { type: 'gp', quantity: 500000 },
    ],
    flavorText: 'Most spend a lifetime mastering one trade. You mastered them all before lunch.',
  },
];
