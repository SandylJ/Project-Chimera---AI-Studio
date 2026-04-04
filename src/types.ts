export type SkillId = 
  | 'mining' | 'woodcutting' | 'fishing' | 'hunting' | 'farming'
  | 'smithing' | 'cooking' | 'herblore' | 'crafting' | 'runecrafting'
  | 'thieving' | 'agility' | 'attack' | 'strength' | 'defense' | 'magic' | 'ranged'
  | 'prayer' | 'empire' | 'raids' | 'slayer';

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
    luck?: number; // Increases rare drop chances
    health?: number; // Increases survivability
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
  skillHint?: string; // Which skill is this used for?
  farmHint?: string;  // Where can you get this?
  usageHint?: string; // What can you do with it?
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
  toolRequired?: string; // itemId
  secondarySkillRequired?: { skill: SkillId; level: number };
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
  primarySkillId: SkillId; // Used for hiring limits
  requirements: { skillId: SkillId; level: number }[];
}

export interface PlayerState {
  gp: number;
  celestialEssence: number;
  skills: Record<SkillId, PlayerSkill>;
  inventory: InventoryItem[];
  equipment: Equipment;
  activeEdicts: string[];
  ascensions: Record<SkillId, number>; // Number of times each skill has ascended
  buffs: Buff[];
  kingdom: Record<string, number>; // workerId -> count
  activeAction?: {
    actionId: string;
    startTime: number;
    progress: number;
    actualDuration: number;
  };
  showNotifications?: boolean;
}
