export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'combat' | 'gathering' | 'artisan' | 'wealth' | 'exploration' | 'mastery';
  tier: 'bronze' | 'silver' | 'gold' | 'imperial';
  check: (state: AchievementCheckState) => boolean;
}

// Subset of PlayerState fields needed for achievement checks
export interface AchievementCheckState {
  skills: Record<string, { level: number; xp: number }>;
  gp: number;
  celestialEssence: number;
  inventory: { itemId: string; quantity: number }[];
  collectionLog: string[];
  totalActions: Record<string, number>;
  totalItemsGained: Record<string, number>;
  killCount: Record<string, number>;
  quests: Record<string, { status: string }>;
  ascensions: Record<string, number>;
  bountyMarks: number;
  totalBountiesCompleted: number;
  socketedGems: Record<string, string[]>;
  petsUnlocked: string[];
}

const totalLevel = (s: AchievementCheckState) =>
  Object.values(s.skills).reduce((acc, sk) => acc + sk.level, 0);

const totalKills = (s: AchievementCheckState) =>
  Object.values(s.killCount).reduce((acc, k) => acc + k, 0);

const completedQuests = (s: AchievementCheckState) =>
  Object.values(s.quests).filter(q => q.status === 'completed').length;

const totalAscensions = (s: AchievementCheckState) =>
  Object.values(s.ascensions).reduce((acc, a) => acc + a, 0);

const skillAt = (s: AchievementCheckState, id: string, level: number) =>
  s.skills[id]?.level >= level;

export const ACHIEVEMENTS: Achievement[] = [
  // === GATHERING ===
  { id: 'first_ore', name: 'Pickaxe Apprentice', description: 'Reach level 10 Mining', icon: '⛏️', category: 'gathering', tier: 'bronze',
    check: s => skillAt(s, 'mining', 10) },
  { id: 'lumberjack', name: 'Lumberjack', description: 'Reach level 25 Woodcutting', icon: '🪓', category: 'gathering', tier: 'bronze',
    check: s => skillAt(s, 'woodcutting', 25) },
  { id: 'master_angler', name: 'Master Angler', description: 'Reach level 50 Fishing', icon: '🎣', category: 'gathering', tier: 'silver',
    check: s => skillAt(s, 'fishing', 50) },
  { id: 'gather_master', name: 'Gathering Master', description: 'Reach level 75 in all gathering skills', icon: '🌿', category: 'gathering', tier: 'gold',
    check: s => ['mining', 'woodcutting', 'fishing', 'hunting', 'farming'].every(id => skillAt(s, id, 75)) },
  { id: 'nature_god', name: 'One With Nature', description: 'Reach level 99 in all gathering skills', icon: '🌍', category: 'gathering', tier: 'imperial',
    check: s => ['mining', 'woodcutting', 'fishing', 'hunting', 'farming'].every(id => skillAt(s, id, 99)) },

  // === COMBAT ===
  { id: 'first_blood', name: 'First Blood', description: 'Slay 10 monsters', icon: '⚔️', category: 'combat', tier: 'bronze',
    check: s => totalKills(s) >= 10 },
  { id: 'centurion', name: 'Centurion', description: 'Slay 100 monsters', icon: '🗡️', category: 'combat', tier: 'silver',
    check: s => totalKills(s) >= 100 },
  { id: 'slaughter', name: 'Slaughter', description: 'Slay 1,000 monsters', icon: '💀', category: 'combat', tier: 'gold',
    check: s => totalKills(s) >= 1000 },
  { id: 'genocide', name: 'Extinction Event', description: 'Slay 10,000 monsters', icon: '☠️', category: 'combat', tier: 'imperial',
    check: s => totalKills(s) >= 10000 },
  { id: 'bounty_hunter', name: 'Bounty Hunter', description: 'Complete 10 bounty contracts', icon: '🏅', category: 'combat', tier: 'silver',
    check: s => s.totalBountiesCompleted >= 10 },
  { id: 'bounty_master', name: 'Bounty Master', description: 'Complete 50 bounty contracts', icon: '🎖️', category: 'combat', tier: 'gold',
    check: s => s.totalBountiesCompleted >= 50 },
  { id: 'combat_elite', name: 'Combat Elite', description: 'Reach level 80 in Attack, Strength, and Defense', icon: '🛡️', category: 'combat', tier: 'gold',
    check: s => ['attack', 'strength', 'defense'].every(id => skillAt(s, id, 80)) },

  // === ARTISAN ===
  { id: 'apprentice_smith', name: 'Apprentice Smith', description: 'Reach level 20 Smithing', icon: '🔨', category: 'artisan', tier: 'bronze',
    check: s => skillAt(s, 'smithing', 20) },
  { id: 'master_chef', name: 'Master Chef', description: 'Reach level 50 Cooking', icon: '👨‍🍳', category: 'artisan', tier: 'silver',
    check: s => skillAt(s, 'cooking', 50) },
  { id: 'alchemist', name: 'Alchemist', description: 'Reach level 75 Herblore', icon: '⚗️', category: 'artisan', tier: 'gold',
    check: s => skillAt(s, 'herblore', 75) },
  { id: 'artisan_master', name: 'Artisan Master', description: 'Reach level 99 in all artisan skills', icon: '🏗️', category: 'artisan', tier: 'imperial',
    check: s => ['smithing', 'cooking', 'herblore', 'crafting', 'runecrafting'].every(id => skillAt(s, id, 99)) },

  // === WEALTH ===
  { id: 'first_thousand', name: 'First Thousand', description: 'Accumulate 1,000 GP', icon: '🪙', category: 'wealth', tier: 'bronze',
    check: s => s.gp >= 1000 },
  { id: 'wealthy', name: 'Wealthy', description: 'Accumulate 100,000 GP', icon: '💰', category: 'wealth', tier: 'silver',
    check: s => s.gp >= 100000 },
  { id: 'millionaire', name: 'Millionaire', description: 'Accumulate 1,000,000 GP', icon: '💎', category: 'wealth', tier: 'gold',
    check: s => s.gp >= 1000000 },
  { id: 'tycoon', name: 'Imperial Tycoon', description: 'Accumulate 10,000,000 GP', icon: '👑', category: 'wealth', tier: 'imperial',
    check: s => s.gp >= 10000000 },
  { id: 'essence_collector', name: 'Essence Collector', description: 'Accumulate 1,000 Celestial Essence', icon: '✨', category: 'wealth', tier: 'silver',
    check: s => s.celestialEssence >= 1000 },

  // === EXPLORATION ===
  { id: 'quest_starter', name: 'Quest Starter', description: 'Complete your first quest', icon: '📜', category: 'exploration', tier: 'bronze',
    check: s => completedQuests(s) >= 1 },
  { id: 'adventurer', name: 'Adventurer', description: 'Complete 10 quests', icon: '🗺️', category: 'exploration', tier: 'silver',
    check: s => completedQuests(s) >= 10 },
  { id: 'quest_cape', name: 'Quest Cape', description: 'Complete all 28 quests', icon: '🏆', category: 'exploration', tier: 'imperial',
    check: s => completedQuests(s) >= 28 },
  { id: 'collector_10', name: 'Budding Collector', description: 'Discover 10 unique items in the collection log', icon: '📖', category: 'exploration', tier: 'bronze',
    check: s => s.collectionLog.length >= 10 },
  { id: 'collector_50', name: 'Avid Collector', description: 'Discover 50 unique items in the collection log', icon: '📚', category: 'exploration', tier: 'silver',
    check: s => s.collectionLog.length >= 50 },
  { id: 'collector_100', name: 'Master Collector', description: 'Discover 100 unique items in the collection log', icon: '🏛️', category: 'exploration', tier: 'gold',
    check: s => s.collectionLog.length >= 100 },
  { id: 'gem_socketer', name: 'Gem Crafter', description: 'Socket your first gem', icon: '💎', category: 'exploration', tier: 'bronze',
    check: s => Object.values(s.socketedGems).some(g => g.length > 0) },

  // === MASTERY ===
  { id: 'first_99', name: 'First Ninety-Nine', description: 'Reach level 99 in any skill', icon: '🌟', category: 'mastery', tier: 'gold',
    check: s => Object.values(s.skills).some(sk => sk.level >= 99) },
  { id: 'total_500', name: 'Rising Power', description: 'Reach 500 total level', icon: '📊', category: 'mastery', tier: 'bronze',
    check: s => totalLevel(s) >= 500 },
  { id: 'total_1000', name: 'Formidable', description: 'Reach 1,000 total level', icon: '📊', category: 'mastery', tier: 'silver',
    check: s => totalLevel(s) >= 1000 },
  { id: 'total_1500', name: 'Legendary', description: 'Reach 1,500 total level', icon: '📊', category: 'mastery', tier: 'gold',
    check: s => totalLevel(s) >= 1500 },
  { id: 'total_max', name: 'Maxed', description: 'Reach level 99 in all 21 skills', icon: '🏆', category: 'mastery', tier: 'imperial',
    check: s => Object.values(s.skills).every(sk => sk.level >= 99) },
  { id: 'first_ascension', name: 'Transcendence', description: 'Ascend a skill for the first time', icon: '🔄', category: 'mastery', tier: 'gold',
    check: s => totalAscensions(s) >= 1 },
  { id: 'five_ascensions', name: 'Ascendant Lord', description: 'Ascend 5 different skills', icon: '⚡', category: 'mastery', tier: 'imperial',
    check: s => Object.values(s.ascensions).filter(a => a > 0).length >= 5 },

  // === PETS ===
  { id: 'first_pet', name: 'New Best Friend', description: 'Obtain your first pet', icon: '🐾', category: 'exploration', tier: 'gold',
    check: s => s.petsUnlocked.length >= 1 },
  { id: 'pet_collector_5', name: 'Pet Collector', description: 'Obtain 5 different pets', icon: '🐾', category: 'exploration', tier: 'gold',
    check: s => s.petsUnlocked.length >= 5 },
  { id: 'pet_master', name: 'Pet Master', description: 'Obtain all 21 skill pets', icon: '👑', category: 'mastery', tier: 'imperial',
    check: s => s.petsUnlocked.length >= 21 },
];
