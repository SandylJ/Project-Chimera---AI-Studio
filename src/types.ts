export type SkillId = 
  | 'mining' | 'woodcutting' | 'fishing' | 'hunting' | 'farming'
  | 'smithing' | 'cooking' | 'herblore' | 'crafting'
  | 'attack' | 'strength' | 'defense' | 'magic' | 'ranged'
  | 'empire' | 'raids';

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  value: number;
  type: 'resource' | 'equipment' | 'food' | 'potion' | 'currency' | 'edict';
  equipmentSlot?: EquipmentSlot;
  stats?: {
    attack?: number;
    strength?: number;
    defense?: number;
    magic?: number;
    ranged?: number;
    speed?: number;
  };
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
  inputs?: { itemId: string; quantity: number }[];
  outputs: { itemId: string; quantity: number; chance: number }[];
  isMonster?: boolean;
  weakness?: SkillId;
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

export type EquipmentSlot = 'weapon' | 'shield' | 'head' | 'body' | 'legs' | 'feet' | 'hands' | 'neck' | 'ring';

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
}

export interface PlayerState {
  gp: number;
  celestialEssence: number;
  skills: Record<SkillId, PlayerSkill>;
  inventory: InventoryItem[];
  equipment: Equipment;
  activeEdicts: string[];
  ascensions: Record<SkillId, number>; // Number of times each skill has ascended
  activeAction?: {
    actionId: string;
    startTime: number;
    progress: number;
    actualDuration: number;
  };
  showNotifications?: boolean;
}
