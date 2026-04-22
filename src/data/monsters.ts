import { Monster } from '../types';

function mk(m: Monster): Monster { return m; }

export const MONSTERS: Record<string, Monster> = {
  // Tier 1 — Sewer Warrens
  sewer_rat: mk({ id: 'sewer_rat', name: 'Sewer Rat', icon: '🐀', level: 1, hp: 12, damage: 2, defense: 0, speed: 1300, xpReward: 6, goldReward: [1, 3], lootTable: [{ itemId: 'bone_shard', chance: 0.2 }], tags: ['beast'] }),
  green_slime: mk({ id: 'green_slime', name: 'Green Slime', icon: '🟢', level: 2, hp: 18, damage: 3, defense: 1, speed: 1600, xpReward: 10, goldReward: [2, 5], lootTable: [{ itemId: 'slime_gel', chance: 0.5 }, { itemId: 'healing_potion', chance: 0.08 }], tags: ['beast'] }),
  giant_spider: mk({ id: 'giant_spider', name: 'Giant Spider', icon: '🕷️', level: 3, hp: 24, damage: 4, defense: 1, speed: 1200, xpReward: 14, goldReward: [3, 7], lootTable: [{ itemId: 'spider_silk', chance: 0.25 }], tags: ['beast'] }),
  sewer_tyrant: mk({ id: 'sewer_tyrant', name: 'Sewer Tyrant', icon: '🐊', level: 4, hp: 120, damage: 7, defense: 3, speed: 1700, xpReward: 80, goldReward: [20, 40], lootTable: [{ itemId: 'rusty_sword', chance: 0.8 }, { itemId: 'leather_vest', chance: 0.5 }, { itemId: 'greater_healing_potion', chance: 0.6 }], boss: true, tags: ['beast', 'boss'] }),

  // Tier 2 — Goblin Camp
  goblin_scout: mk({ id: 'goblin_scout', name: 'Goblin Scout', icon: '👺', level: 5, hp: 32, damage: 5, defense: 2, speed: 1200, xpReward: 22, goldReward: [4, 10], lootTable: [{ itemId: 'goblin_ear', chance: 0.4 }, { itemId: 'iron_dagger', chance: 0.04 }], tags: ['humanoid'] }),
  goblin_raider: mk({ id: 'goblin_raider', name: 'Goblin Raider', icon: '👹', level: 7, hp: 48, damage: 8, defense: 3, speed: 1400, xpReward: 32, goldReward: [7, 15], lootTable: [{ itemId: 'goblin_ear', chance: 0.6 }, { itemId: 'iron_sword', chance: 0.05 }, { itemId: 'healing_potion', chance: 0.12 }], tags: ['humanoid'] }),
  goblin_shaman: mk({ id: 'goblin_shaman', name: 'Goblin Shaman', icon: '🧙‍♂️', level: 8, hp: 40, damage: 12, defense: 1, speed: 1800, xpReward: 42, goldReward: [10, 20], lootTable: [{ itemId: 'mana_potion', chance: 0.35 }, { itemId: 'oak_staff', chance: 0.04 }], tags: ['humanoid'] }),
  goblin_warlord: mk({ id: 'goblin_warlord', name: 'Goblin Warlord', icon: '🤴', level: 10, hp: 280, damage: 14, defense: 6, speed: 1600, xpReward: 160, goldReward: [60, 100], lootTable: [{ itemId: 'steel_longsword', chance: 0.5 }, { itemId: 'iron_helm', chance: 0.6 }, { itemId: 'lucky_charm', chance: 0.3 }], boss: true, tags: ['humanoid', 'boss'] }),

  // Tier 3 — Ancient Crypt
  skeleton: mk({ id: 'skeleton', name: 'Skeleton', icon: '💀', level: 10, hp: 60, damage: 10, defense: 4, speed: 1500, xpReward: 45, goldReward: [10, 18], lootTable: [{ itemId: 'bone_shard', chance: 0.8 }, { itemId: 'rusty_sword', chance: 0.1 }], tags: ['undead'] }),
  zombie: mk({ id: 'zombie', name: 'Zombie', icon: '🧟', level: 11, hp: 82, damage: 12, defense: 3, speed: 2000, xpReward: 50, goldReward: [8, 16], lootTable: [{ itemId: 'bone_shard', chance: 0.6 }, { itemId: 'healing_potion', chance: 0.18 }], tags: ['undead'] }),
  wraith: mk({ id: 'wraith', name: 'Wraith', icon: '👻', level: 13, hp: 70, damage: 16, defense: 2, speed: 1300, xpReward: 64, goldReward: [14, 22], lootTable: [{ itemId: 'mana_potion', chance: 0.4 }, { itemId: 'lucky_charm', chance: 0.04 }], tags: ['undead'] }),
  lich_king: mk({ id: 'lich_king', name: 'Lich King', icon: '☠️', level: 15, hp: 480, damage: 22, defense: 8, speed: 1500, xpReward: 320, goldReward: [120, 180], lootTable: [{ itemId: 'crystal_staff', chance: 0.5 }, { itemId: 'chain_hauberk', chance: 0.5 }, { itemId: 'elixir_of_life', chance: 0.3 }], boss: true, tags: ['undead', 'boss'] }),

  // Tier 4 — Spider Hollow
  web_weaver: mk({ id: 'web_weaver', name: 'Web Weaver', icon: '🕷️', level: 15, hp: 100, damage: 18, defense: 5, speed: 1400, xpReward: 75, goldReward: [18, 28], lootTable: [{ itemId: 'spider_silk', chance: 0.5 }], tags: ['beast'] }),
  venom_crawler: mk({ id: 'venom_crawler', name: 'Venom Crawler', icon: '🦂', level: 17, hp: 125, damage: 22, defense: 6, speed: 1100, xpReward: 95, goldReward: [22, 36], lootTable: [{ itemId: 'spider_silk', chance: 0.4 }, { itemId: 'poisoned_dagger', chance: 0.04 }], tags: ['beast'] }),
  broodmother: mk({ id: 'broodmother', name: 'Broodmother', icon: '🕸️', level: 20, hp: 720, damage: 28, defense: 10, speed: 1400, xpReward: 500, goldReward: [200, 300], lootTable: [{ itemId: 'shadowfang', chance: 0.4 }, { itemId: 'plate_armor', chance: 0.4 }, { itemId: 'swift_boots', chance: 0.3 }], boss: true, tags: ['beast', 'boss'] }),

  // Tier 5 — Ice Caverns
  frost_wolf: mk({ id: 'frost_wolf', name: 'Frost Wolf', icon: '🐺', level: 22, hp: 160, damage: 26, defense: 7, speed: 1100, xpReward: 120, goldReward: [30, 45], lootTable: [{ itemId: 'ice_shard', chance: 0.4 }], tags: ['beast'] }),
  ice_golem: mk({ id: 'ice_golem', name: 'Ice Golem', icon: '🧊', level: 25, hp: 260, damage: 32, defense: 14, speed: 2200, xpReward: 180, goldReward: [50, 70], lootTable: [{ itemId: 'ice_shard', chance: 0.7 }, { itemId: 'iron_helm', chance: 0.2 }], tags: ['elemental'] }),
  frost_queen: mk({ id: 'frost_queen', name: 'Frost Queen', icon: '👸', level: 28, hp: 1100, damage: 40, defense: 14, speed: 1300, xpReward: 800, goldReward: [300, 450], lootTable: [{ itemId: 'elven_bow', chance: 0.3 }, { itemId: 'knight_blade', chance: 0.3 }, { itemId: 'ring_of_power', chance: 0.4 }], boss: true, tags: ['elemental', 'boss'] }),

  // Tier 6 — Volcanic Forge
  fire_imp: mk({ id: 'fire_imp', name: 'Fire Imp', icon: '👿', level: 30, hp: 220, damage: 38, defense: 8, speed: 1000, xpReward: 220, goldReward: [50, 75], lootTable: [{ itemId: 'demon_horn', chance: 0.25 }], tags: ['demon'] }),
  lava_brute: mk({ id: 'lava_brute', name: 'Lava Brute', icon: '🌋', level: 32, hp: 340, damage: 44, defense: 14, speed: 1800, xpReward: 280, goldReward: [70, 100], lootTable: [{ itemId: 'demon_horn', chance: 0.3 }, { itemId: 'warhammer', chance: 0.06 }], tags: ['demon'] }),
  infernal_lord: mk({ id: 'infernal_lord', name: 'Infernal Lord', icon: '🔥', level: 35, hp: 1800, damage: 56, defense: 20, speed: 1400, xpReward: 1400, goldReward: [600, 900], lootTable: [{ itemId: 'holy_avenger', chance: 0.3 }, { itemId: 'archon_staff', chance: 0.3 }, { itemId: 'crimson_greataxe', chance: 0.3 }], boss: true, tags: ['demon', 'boss'] }),

  // Tier 7 — Sunken Temple
  deep_serpent: mk({ id: 'deep_serpent', name: 'Deep Serpent', icon: '🐍', level: 40, hp: 460, damage: 58, defense: 18, speed: 1200, xpReward: 420, goldReward: [100, 140], lootTable: [{ itemId: 'ice_shard', chance: 0.2 }, { itemId: 'demon_horn', chance: 0.2 }], tags: ['beast'] }),
  tidal_guardian: mk({ id: 'tidal_guardian', name: 'Tidal Guardian', icon: '🔱', level: 42, hp: 620, damage: 64, defense: 24, speed: 1700, xpReward: 520, goldReward: [140, 200], lootTable: [{ itemId: 'bulwark_shield', chance: 0.1 }, { itemId: 'amulet_of_vigor', chance: 0.08 }], tags: ['elemental'] }),
  kraken_spawn: mk({ id: 'kraken_spawn', name: 'Kraken Spawn', icon: '🐙', level: 45, hp: 3200, damage: 80, defense: 26, speed: 1500, xpReward: 2600, goldReward: [1200, 1600], lootTable: [{ itemId: 'crown_of_valor', chance: 0.3 }, { itemId: 'amulet_of_vigor', chance: 0.3 }, { itemId: 'dragon_scale', chance: 0.5 }], boss: true, tags: ['beast', 'boss'] }),

  // Tier 8 — Dragon's Lair
  drake_whelp: mk({ id: 'drake_whelp', name: 'Drake Whelp', icon: '🦎', level: 55, hp: 780, damage: 90, defense: 26, speed: 1100, xpReward: 700, goldReward: [180, 260], lootTable: [{ itemId: 'dragon_scale', chance: 0.4 }], tags: ['dragon'] }),
  wyrm_guardian: mk({ id: 'wyrm_guardian', name: 'Wyrm Guardian', icon: '🐉', level: 58, hp: 1100, damage: 110, defense: 32, speed: 1500, xpReward: 1000, goldReward: [260, 360], lootTable: [{ itemId: 'dragon_scale', chance: 0.6 }, { itemId: 'celestial_dust', chance: 0.05 }], tags: ['dragon'] }),
  ancient_wyrm: mk({ id: 'ancient_wyrm', name: 'Ancient Wyrm', icon: '🐲', level: 62, hp: 8800, damage: 160, defense: 42, speed: 1600, xpReward: 6000, goldReward: [3000, 4000], lootTable: [{ itemId: 'dragonbone_sword', chance: 0.4 }, { itemId: 'dragonplate', chance: 0.4 }, { itemId: 'celestial_band', chance: 0.05 }, { itemId: 'celestial_dust', chance: 0.9 }], boss: true, tags: ['dragon', 'boss'] }),

  // Tier 9 — Abyss Gate (endgame scaling)
  void_stalker: mk({ id: 'void_stalker', name: 'Void Stalker', icon: '👁️', level: 70, hp: 1400, damage: 160, defense: 40, speed: 1100, xpReward: 1600, goldReward: [400, 600], lootTable: [{ itemId: 'celestial_dust', chance: 0.25 }], tags: ['demon'] }),
  abyssal_horror: mk({ id: 'abyssal_horror', name: 'Abyssal Horror', icon: '😱', level: 75, hp: 2200, damage: 200, defense: 50, speed: 1500, xpReward: 2400, goldReward: [700, 1000], lootTable: [{ itemId: 'celestial_dust', chance: 0.4 }], tags: ['demon'] }),
  abyss_sovereign: mk({ id: 'abyss_sovereign', name: 'Abyss Sovereign', icon: '👹', level: 80, hp: 20000, damage: 280, defense: 70, speed: 1400, xpReward: 14000, goldReward: [6000, 10000], lootTable: [{ itemId: 'celestial_band', chance: 0.2 }, { itemId: 'celestial_dust', chance: 1.0, qty: [3, 6] }], boss: true, tags: ['demon', 'boss'] }),
};
