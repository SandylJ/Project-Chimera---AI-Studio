export type SkillId =
  | 'mining' | 'woodcutting' | 'fishing' | 'hunting' | 'farming'
  | 'smithing' | 'cooking' | 'herblore' | 'crafting' | 'runecrafting'
  | 'thieving' | 'agility' | 'attack' | 'strength' | 'defense' | 'magic' | 'ranged'
  | 'prayer' | 'empire' | 'raids' | 'slayer' | 'construction';

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  value: number;
  type: 'resource' | 'equipment' | 'food' | 'potion' | 'currency' | 'edict' | 'tool';
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'celestial';
  equipmentSlot?: EquipmentSlot;
  toolBonus?: {
    skillId: SkillId;
    speedMultiplier: number;
    xpMultiplier: number;
  };
  stats?: {
    attack?: number;
    strength?: number;
    defense?: number;
    magic?: number;
    ranged?: number;
    speed?: number;
    luck?: number;
    health?: number;
  };
  setBonus?: {
    setId: string;
    piecesRequired: number;
    bonus: Partial<Item['stats']>;
  };
  socketable?: boolean;
  sockets?: number;
  isGem?: boolean;
  gemBonus?: Partial<Item['stats']>;
  skillHint?: string;
  farmHint?: string;
  usageHint?: string;
  // New: quest requirement flag
  questRequired?: string; // questId required to use/equip this item
}

export interface SkillAction {
  id: string;
  name: string;
  skill: SkillId;
  levelRequired: number;
  xpReward: number;
  duration: number; // in milliseconds
  description?: string;
  inputs?: { itemId: string; quantity: number }[];
  outputs: { itemId: string; quantity: number; chance: number }[];
  isMonster?: boolean;
  isBoss?: boolean;
  weakness?: SkillId;
  toolRequired?: string;
  secondarySkillRequired?: { skill: SkillId; level: number };
  // New: quest gating
  questRequired?: string; // questId required to access this action
  // New: unique monster drop table (overrides global RDT)
  uniqueDropTable?: { itemId: string; quantity: number; chance: number; }[];
}

export interface PlayerSkill {
  id: SkillId;
  level: number;
  xp: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export type EquipmentSlot = 'weapon' | 'shield' | 'head' | 'body' | 'legs' | 'feet' | 'hands' | 'neck' | 'ring' | 'cape' | 'back' | 'offhand';

export interface Equipment {
  weapon?: string;
  shield?: string;
  head?: string;
  body?: string;
  legs?: string;
  feet?: string;
  hands?: string;
  neck?: string;
  ring?: string;
  cape?: string;
  back?: string;
  offhand?: string;
}

export interface Buff {
  id: string;
  name: string;
  type: 'speed' | 'combat' | 'xp';
  multiplier: number;
  remainingActions: number;
}

export interface KingdomWorker {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  bonusType: 'xp' | 'gp' | 'celestial_essence';
  bonusValue: number;
  primarySkillId: SkillId;
  requirements: { skillId: SkillId; level: number }[];
}

// ===== NEW SYSTEMS =====

// Quest System
export type QuestStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface QuestRequirement {
  type: 'skill_level' | 'item' | 'quest' | 'kill_count' | 'craft_count' | 'gp';
  skillId?: SkillId;
  itemId?: string;
  questId?: string;
  actionId?: string; // for kill/craft count tracking
  quantity: number;
}

export interface QuestReward {
  type: 'xp' | 'item' | 'gp' | 'celestial_essence' | 'unlock_action' | 'unlock_area';
  skillId?: SkillId;
  itemId?: string;
  actionId?: string;
  quantity: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'gather' | 'craft' | 'kill' | 'reach_level' | 'equip' | 'earn_gp';
  target: number;
  current?: number; // tracked in player state
  itemId?: string;
  skillId?: SkillId;
  actionId?: string;
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'novice' | 'intermediate' | 'experienced' | 'master' | 'grandmaster';
  category: 'combat' | 'gathering' | 'artisan' | 'exploration' | 'special';
  prerequisites: QuestRequirement[];
  objectives: QuestObjective[];
  rewards: QuestReward[];
  flavorText?: string; // lore/story snippet
}

// Collection Log
export interface CollectionLogCategory {
  id: string;
  name: string;
  icon: string;
  items: string[]; // itemIds
}

// Bank Tab
export interface BankTab {
  id: string;
  name: string;
  icon: string;
  filter: (item: Item) => boolean;
}

// Bounty Hunting System
export type BountyTier = 'iron' | 'gold' | 'imperial';

export interface BountyContract {
  monsterId: string; // actionId of the monster to hunt
  monsterName: string;
  killsRequired: number;
  killsCompleted: number;
  tier: BountyTier;
  bountyMarkReward: number;
  bonusXp: number;
  assignedAt: number;
}

// Player State - expanded
export interface PlayerState {
  gp: number;
  celestialEssence: number;
  skills: Record<SkillId, PlayerSkill>;
  inventory: InventoryItem[];
  equipment: Equipment;
  activeEdicts: string[];
  ascensions: Record<SkillId, number>;
  buffs: Buff[];
  kingdom: Record<string, number>;
  activeAction?: {
    actionId: string;
    startTime: number;
    progress: number;
    actualDuration: number;
  };
  showNotifications?: boolean;
  // New systems
  quests: Record<string, QuestProgress>;
  collectionLog: string[]; // itemIds ever obtained
  totalActions: Record<string, number>; // actionId -> count (for quest tracking)
  totalItemsGained: Record<string, number>; // itemId -> lifetime total
  bankTab: string; // active bank tab id
  killCount: Record<string, number>; // monsterId (actionId) -> kills
  // Bounty Hunting
  bountyContract?: BountyContract;
  bountyStreak: number;
  bountyMarks: number;
  totalBountiesCompleted: number;
  // Gem Socketing — maps equipped item slot to array of socketed gem itemIds
  socketedGems: Record<string, string[]>;
  // Dry streak protection — consecutive monster kills without rare+ drop
  dryStreak: number;
  // Pets
  activePet?: string; // itemId of active pet
  petsUnlocked: string[]; // itemIds of all pets ever obtained
  // Auto-sell
  autoSellItems: string[]; // itemIds to auto-sell on pickup
  // Prestige
  prestigeLevel: number; // number of times prestiged
  prestigeTokens: number; // earned on prestige, spent on permanent upgrades
}

export interface QuestProgress {
  questId: string;
  status: QuestStatus;
  objectiveProgress: Record<string, number>; // objectiveId -> current count
  completedAt?: number;
  startedAt?: number;
}
