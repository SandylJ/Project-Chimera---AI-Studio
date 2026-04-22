// Clickpocalypse-style party auto-explorer — type model
// See CLICKPOCALYPSE_DESIGN.md for the design behind these types.

export type ClassId = 'knight' | 'priest' | 'mage' | 'rogue' | 'ranger' | 'barbarian';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'celestial';

export type EquipSlot = 'weapon' | 'offhand' | 'head' | 'body' | 'legs' | 'feet' | 'neck' | 'ring';

export type StatKey = 'str' | 'dex' | 'int' | 'con' | 'spd' | 'luck';

export interface Stats {
  str: number;
  dex: number;
  int: number;
  con: number;
  spd: number;
  luck: number;
}

export type ItemType =
  | 'weapon' | 'armor' | 'trinket' | 'potion' | 'consumable' | 'material' | 'currency' | 'relic';

export interface Item {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity;
  type: ItemType;
  slot?: EquipSlot;
  stats?: Partial<Stats>;
  weaponPower?: number;
  armor?: number;
  value: number;
  description?: string;
  healOnUse?: number;
  manaOnUse?: number;
  levelReq?: number;
  classReq?: ClassId[];
}

export interface AbilityEffect {
  kind: 'damage' | 'heal' | 'buff' | 'debuff' | 'stun' | 'taunt' | 'cleave' | 'aoe_damage' | 'dot' | 'shield';
  power: number; // multiplier applied to (scaling stat) or flat value if flat=true
  flat?: boolean;
  scaling: StatKey;
  duration?: number; // ms for buff/dot/shield
  stat?: StatKey; // stat boosted/lowered for buff/debuff
  tick?: number; // ms between dot ticks
}

export type AbilityTarget =
  | 'lowest_hp_enemy'
  | 'highest_hp_enemy'
  | 'random_enemy'
  | 'all_enemies'
  | 'lowest_hp_ally'
  | 'all_allies'
  | 'self';

export interface Ability {
  id: string;
  name: string;
  icon: string;
  classId: ClassId;
  levelReq: number;
  cooldown: number; // ms
  manaCost: number;
  effects: AbilityEffect[];
  description: string;
  targeting: AbilityTarget;
}

export interface HeroClass {
  id: ClassId;
  name: string;
  icon: string;
  color: string;
  role: 'tank' | 'healer' | 'dps' | 'support';
  description: string;
  baseStats: Stats;
  baseHP: number;
  baseMP: number;
  hpPerLevel: number;
  mpPerLevel: number;
  statGrowth: Stats; // per-level gains
  startingAbilities: string[];
  recruitCost: number;
  unlockedByDefault: boolean;
}

export type HeroState = 'alive' | 'downed' | 'dead';

export type AttackVisual =
  | 'melee' | 'ranged'
  | 'spell_fire' | 'spell_frost' | 'spell_heal' | 'spell_light' | 'spell_shadow'
  | 'spell_aoe' | 'buff_self';

export interface Hero {
  id: string;
  classId: ClassId;
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseStats: Stats;
  equipment: Partial<Record<EquipSlot, string>>;
  // Enchant tier per equipped slot (0 if unenchanted). Resets when the slot
  // empties. +N grants +15% power/armor per tier.
  enchants: Partial<Record<EquipSlot, number>>;
  abilities: string[];
  cooldowns: Record<string, number>;
  attackTimer: number;
  state: HeroState;
  bench: boolean;
  abilityPoints: number;
  shield: number; // temp absorb
  buffs: Array<{ id: string; stat: StatKey; power: number; remaining: number; }>;
  // Transient: visual hint of the most-recent action (drives projectile / attack fx)
  lastAction?: { targetId: string; kind: AttackVisual; abilityId?: string; at: number };
  // Transient: last time this hero took damage, for hit-flash UI
  lastHitAt?: number;
}

export interface Monster {
  id: string;
  name: string;
  icon: string;
  level: number;
  hp: number;
  damage: number;
  defense: number;
  speed: number; // attacks per sec * 1000 -> used as 1000/speed for attack interval
  xpReward: number;
  goldReward: [number, number];
  lootTable: { itemId: string; chance: number; qty?: [number, number] }[];
  tags?: Array<'undead' | 'beast' | 'humanoid' | 'demon' | 'dragon' | 'elemental' | 'boss'>;
  boss?: boolean;
  abilityId?: string; // reserved for future monster abilities
}

export interface MonsterInstance {
  id: string; // instance id
  monsterId: string;
  hp: number;
  maxHp: number;
  attackTimer: number;
  dots: Array<{ id: string; remaining: number; tick: number; nextTick: number; dmg: number }>;
  stunRemaining: number;
  // Transient: visual hint of the most-recent attack (drives attack fx)
  lastAttack?: { targetHeroId: string; at: number };
}

export type TileKind =
  | 'empty'
  | 'monster'
  | 'chest'
  | 'trap'
  | 'shrine'
  | 'fountain'
  | 'fork'
  | 'merchant'
  | 'boss'
  | 'exit'
  | 'entrance';

export interface Tile {
  x: number;
  y: number;
  kind: TileKind;
  revealed: boolean;
  cleared: boolean;
  encounter?: { monsters: MonsterInstance[] };
  loot?: Array<{ itemId: string; qty: number }>;
  flavorText?: string;
}

export interface Dungeon {
  id: string;
  defId: string; // reference to DungeonDef
  name: string;
  icon: string;
  floor: number;
  width: number;
  height: number;
  tiles: Tile[];
  partyPos: { x: number; y: number };
  path: Array<{ x: number; y: number }>;
  pathIndex: number;
  moveTimer: number;
  status: 'active' | 'victory' | 'retreat' | 'wipe';
  monsterPool: string[];
  bossId: string;
  entryTime: number;
  // When victory fires, engine sets this and defers the town return by ~2.5s
  // so the UI can play a celebration before the dungeon disappears.
  victoryAt?: number;
}

export interface DungeonDef {
  id: string;
  name: string;
  icon: string;
  description: string;
  minLevel: number;
  baseWidth: number;
  baseHeight: number;
  monsterPool: string[];
  bossId: string;
  rewards: { gp: [number, number]; essenceOnBoss: number; guaranteedLoot?: string };
}

export interface LogEntry {
  id: string;
  t: number;
  kind: 'combat' | 'loot' | 'level' | 'move' | 'decision' | 'system' | 'death' | 'heal' | 'victory' | 'retreat';
  text: string;
  rarity?: Rarity;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  disabled?: boolean;
  disabledReason?: string;
}

export interface ActiveDecision {
  id: string;
  title: string;
  description: string;
  icon: string;
  options: DecisionOption[];
  expiresAt: number;
  defaultOptionId: string;
  // payload used by resolver
  kind: 'fountain' | 'fork' | 'chest' | 'merchant';
  context?: any;
}

export interface Stash {
  items: Record<string, number>;
  gold: number;
  essence: number;
  bountyMarks: number;
}

// Permanent party-wide bonuses purchased with essence at the Shrine.
// Level is stored; cost scales with level. Applied globally in combat/loot.
export type BlessingId =
  | 'might'         // +dmg
  | 'warding'       // +armor
  | 'fortune'       // +gold
  | 'wisdom'        // +xp
  | 'luck'          // +crit/drops
  | 'vigor';        // +max HP %

export interface ShopRotation {
  // Unix day index (floor(Date.now() / 86400000)) used to seed stock.
  day: number;
  featured: string[];
  scrolls: string[]; // scroll ids (consumables with special effects)
  bundles: Array<{ id: string; label: string; items: Array<[string, number]>; price: number }>;
}

export type BountyKind = 'kill_count' | 'earn_gold' | 'find_items' | 'clear_dungeon' | 'best_combo';

export interface Bounty {
  id: string;
  kind: BountyKind;
  label: string;
  description: string;
  target: number;
  claimed: boolean;
  reward: { gold?: number; essence?: number; itemId?: string; itemQty?: number };
  // Context for tracking
  dungeonId?: string; // for clear_dungeon
}

export interface BountyBoard {
  day: number;
  bounties: Bounty[];
  // Snapshot values at board rollover; bounty progress = current - snapshot.
  snapshot: {
    totalMonstersKilled: number;
    totalGoldEarned: number;
    itemsCollected: number;
    dungeonsCleared: Record<string, number>;
    bestKillCombo: number;
  };
  // Dungeons cleared on this board (for clear_dungeon tracking by id)
  dungeonClearCount: Record<string, number>;
  // Items collected on this board (total new drops added to stash)
  itemsCollected: number;
}

export interface OfflineReport {
  duration: number; // ms
  tilesCleared: number;
  monstersKilled: number;
  xpGained: number;
  goldGained: number;
  itemsFound: number;
}

// ========== Town skills — idle background progression ==========
export type SkillId =
  | 'mining' | 'woodcutting' | 'smithing' | 'crafting' | 'herblore'
  | 'fishing' | 'cooking' | 'farming'
  | 'runecrafting' | 'thieving' | 'agility';

export interface ActiveTask {
  skillId: SkillId;
  actionId: string;
  progress: number;  // ms elapsed toward current cycle
  duration: number;  // ms required per cycle
}

export interface TownWorker {
  id: string;
  name: string;
  activeTask?: ActiveTask;
}

export interface TownState {
  unlockedWorkers: number;
  workers: TownWorker[];
}

export interface GameState {
  version: number;
  heroes: Hero[];
  stash: Stash;
  activeDungeon?: Dungeon;
  currentLog: LogEntry[];
  unlockedDungeons: string[];
  unlockedClasses: ClassId[];
  activeDecision?: ActiveDecision;
  speed: 1 | 2 | 4;
  paused: boolean;
  lastTick: number;
  totalPlaytime: number;
  dungeonsCompleted: Record<string, number>;
  totalMonstersKilled: number;
  totalGoldEarned: number;
  achievements: string[];
  autoSellRarities: Rarity[];
  collectionLog: string[];
  pendingOfflineReport?: OfflineReport;
  tutorialStep: number; // 0 = not started, 1+ steps
  // Combo / streak feedback
  killCombo: number;
  lastKillAt: number;
  bestKillCombo: number;
  // Permanent party-wide bonuses purchased with essence at the Shrine.
  blessings: Partial<Record<BlessingId, number>>;
  // Rotating daily shop stock / scrolls / bundles (regenerated each day).
  shopRotation?: ShopRotation;
  // Daily bounty board — 3 rotating goals per day with claimable rewards.
  bountyBoard?: BountyBoard;
  // Town skills — idle workers training Mining / Woodcutting / etc.
  town: TownState;
  skills: Partial<Record<SkillId, { level: number; xp: number }>>;
}
