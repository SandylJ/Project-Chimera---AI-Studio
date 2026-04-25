import { GameState, SkillId, TownWorker } from '../types';
import { pushLog } from './util';
import { addToStash, removeFromStash } from './loot';

// Map from skill id to the cape that boosts it. Used by tickSkilling to
// look up whether any active hero is wearing a matching cape (passive
// boost to that skill's town output rate).
export const CAPE_BY_SKILL: Record<SkillId, string> = {
  mining: 'mining_cape',
  woodcutting: 'woodcutting_cape',
  smithing: 'smithing_cape',
  crafting: 'crafting_cape',
  herblore: 'herblore_cape',
  fishing: 'fishing_cape',
  cooking: 'cooking_cape',
  farming: 'farming_cape',
  runecrafting: 'runecrafting_cape',
  thieving: 'thieving_cape',
  agility: 'agility_cape',
};

// Returns extra doubleChance contributed by capes equipped on active
// heroes for the given skill: the matching skill cape (+25%) and/or the
// Cape of Completion (+10% to all skills, stacks).
function capeBonusForSkill(state: GameState, skillId: SkillId): number {
  let bonus = 0;
  const skillCapeId = CAPE_BY_SKILL[skillId];
  for (const h of state.heroes) {
    if (h.bench) continue;
    const neck = h.equipment.neck;
    if (!neck) continue;
    if (neck === skillCapeId) bonus = Math.max(bonus, 0.25);
    if (neck === 'cape_of_completion') bonus = Math.max(bonus, bonus + 0.10);
  }
  return bonus;
}

// The skill a worker has run the most cycles on. ≥30 cycles required to
// "lock in" a specialization so a worker that briefly tried Mining
// doesn't get pinned there. Returns null if no specialization yet.
const SPECIALIZATION_MIN_CYCLES = 30;
export function dominantSkill(worker: TownWorker): SkillId | null {
  const counts = worker.cyclesPerSkill;
  if (!counts) return null;
  let bestId: SkillId | null = null;
  let bestN = 0;
  for (const [id, n] of Object.entries(counts) as [SkillId, number][]) {
    if (n > bestN) { bestN = n; bestId = id; }
  }
  return bestN >= SPECIALIZATION_MIN_CYCLES ? bestId : null;
}

// ============================================================
// Skill milestones — passive perks unlocked at level breakpoints.
// Derived purely from current level, so no save migration required.
// ============================================================

export type SkillMilestoneId = 'apprentice' | 'adept' | 'expert' | 'master' | 'grandmaster';

export const SKILL_MILESTONES: Array<{
  id: SkillMilestoneId;
  level: number;
  title: string;
  blurb: string;
}> = [
  { id: 'apprentice',  level: 10, title: 'Apprentice',  blurb: '−10% action time'        },
  { id: 'adept',       level: 25, title: 'Adept',       blurb: '15% chance to double output' },
  { id: 'expert',      level: 50, title: 'Expert',      blurb: '10% chance to skip an input' },
  { id: 'master',      level: 75, title: 'Master',      blurb: '+25% XP'                 },
  { id: 'grandmaster', level: 99, title: 'Grandmaster', blurb: 'all milestone bonuses doubled + Mastery Mark drops' },
];

export interface SkillBonuses {
  speedMul: number;     // multiply duration by this — <1 means faster
  doubleChance: number; // 0..1 chance per cycle to 2× outputs
  skipChance: number;   // 0..1 chance per cycle to skip inputs
  xpMul: number;        // multiply xp gain by this
  masterDrop: number;   // 0..1 chance per cycle of bonus mastery_mark
}

export function getSkillBonuses(level: number): SkillBonuses {
  const reached = (n: number) => level >= n;
  const gm = reached(99);
  const mul = gm ? 2 : 1; // Grandmaster: double everything
  return {
    speedMul:     reached(10) ? (1 - 0.10 * mul) : 1,
    doubleChance: reached(25) ? (0.15 * mul) : 0,
    skipChance:   reached(50) ? (0.10 * mul) : 0,
    xpMul:        reached(75) ? (1 + 0.25 * mul) : 1,
    masterDrop:   gm ? 0.05 : 0,
  };
}

export function reachedMilestones(level: number): SkillMilestoneId[] {
  return SKILL_MILESTONES.filter(m => level >= m.level).map(m => m.id);
}

// Grant XP to a town skill from any source — town worker cycles, slayer
// trickle, scrolls, etc. Handles level-up + milestone announcements.
// Wisdom Potion: while skillXpBoostUntil is in the future, all incoming
// town-skill XP is multiplied by 1.5.
export function awardSkillXp(state: GameState, skillId: SkillId, xp: number): void {
  if (xp <= 0) return;
  const wisdomActive = (state.skillXpBoostUntil ?? 0) > Date.now();
  const final = wisdomActive ? Math.floor(xp * 1.5) : xp;
  if (!state.skills[skillId]) state.skills[skillId] = { level: 1, xp: 0 };
  const sk = state.skills[skillId]!;
  sk.xp += final;
  while (sk.level < 99 && sk.xp >= xpForLevel(sk.level + 1)) {
    sk.level++;
    pushLog(state, 'level', `⬆ ${capitalize(skillId)} reached level ${sk.level}!`);
    const ms = SKILL_MILESTONES.find(m => m.level === sk.level);
    if (ms) pushLog(state, 'level', `✨ ${capitalize(skillId)} ${ms.title}: ${ms.blurb}`, 'epic');
  }
}

// Slayer XP: every monster kill grants a small pool of town-skill XP,
// split evenly across whichever skills currently have workers assigned.
// If nothing's assigned, picks one random skill so the system still
// fires for combat-only players. Scales with monster level.
export function awardSlayerXp(state: GameState, monsterLevel: number, isBoss: boolean): void {
  const total = Math.max(1, Math.floor(monsterLevel * (isBoss ? 2.0 : 0.5)));
  const assigned = new Set<SkillId>();
  for (const w of state.town.workers) {
    if (w.activeTask) assigned.add(w.activeTask.skillId);
  }
  const targets: SkillId[] = assigned.size > 0
    ? Array.from(assigned)
    : [ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)]];
  const each = Math.max(1, Math.ceil(total / targets.length));
  for (const id of targets) awardSkillXp(state, id, each);
}

// Cost to hire the next worker. Doubles per worker past the starter 3.
export function workerHireCost(currentCount: number): number {
  return 1000 * Math.pow(2, Math.max(0, currentCount - 3));
}

// ============================================================
// Total skill level — sum of every trained skill. Drives
// "Town tier" passive bonuses that reward all-rounder players.
// ============================================================

export const ALL_SKILLS: SkillId[] = [
  'mining', 'woodcutting', 'smithing', 'crafting', 'herblore',
  'fishing', 'cooking', 'farming',
  'runecrafting', 'thieving', 'agility',
];

export interface TownTier {
  total: number;
  title: string;
  blurb: string;
}

export const TOWN_TIERS: TownTier[] = [
  { total: 100,  title: 'Apprentice Town', blurb: '+5% gold drops' },
  { total: 250,  title: 'Skilled Town',    blurb: '+5% gold, +5% skill XP' },
  { total: 500,  title: 'Master Town',     blurb: '+10% gold, +5% xp, +10% essence' },
  { total: 750,  title: 'Legendary Town',  blurb: '+10% gold, +10% essence' },
  { total: 1000, title: 'Mythic Town',     blurb: '+20% gold, +15% xp, +30% essence' },
];

export function totalSkillLevel(state: { skills: Partial<Record<SkillId, { level: number; xp: number }>> }): number {
  let n = 0;
  for (const id of ALL_SKILLS) n += state.skills[id]?.level ?? 1;
  return n;
}

export interface TownBonuses {
  goldMul: number;
  xpMul: number;
  essenceMul: number;
}

// Reverse index: which skill+action produces a given itemId? Builds once.
// First-match wins so the cheapest/lowest-level recipe shows up — actions
// are listed roughly in unlock order in the SKILL_ACTIONS tables.
let _producerIndex: Record<string, { skillId: SkillId; actionId: string; name: string; levelReq: number }> | null = null;

export function producerForItem(itemId: string): { skillId: SkillId; actionId: string; name: string; levelReq: number } | null {
  if (!_producerIndex) {
    _producerIndex = {};
    for (const skillId of Object.keys(SKILL_ACTIONS) as SkillId[]) {
      for (const a of SKILL_ACTIONS[skillId]) {
        if (!a.outputs) continue;
        for (const outId of Object.keys(a.outputs)) {
          // Skip pass-through outputs (e.g. tinderbox returned with charcoal)
          // — those aren't truly the "producer" of the tool.
          if (a.inputs && a.inputs[outId]) continue;
          if (_producerIndex[outId]) continue;
          _producerIndex[outId] = { skillId, actionId: a.id, name: a.name, levelReq: a.levelReq };
        }
      }
    }
  }
  return _producerIndex[itemId] ?? null;
}

export function townBonuses(total: number): TownBonuses {
  let gold = 1, xp = 1, ess = 1;
  if (total >= 100)  gold += 0.05;
  if (total >= 250)  { gold += 0.05; xp += 0.05; }
  if (total >= 500)  { gold += 0.10; xp += 0.05; ess += 0.10; }
  if (total >= 750)  { gold += 0.10; ess += 0.10; }
  if (total >= 1000) { gold += 0.20; xp += 0.15; ess += 0.30; }
  return { goldMul: gold, xpMul: xp, essenceMul: ess };
}

// Define the available actions for each skill.
export interface SkillActionDef {
  id: string;
  name: string;
  levelReq: number;
  duration: number;  // base ms per completed cycle
  xpReward: number;
  inputs?: Record<string, number>;
  outputs?: Record<string, number>;
}

export const SKILL_ACTIONS: Record<string, SkillActionDef[]> = {
  mining: [
    { id: 'mine_copper',   name: 'Mine Copper',    levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { copper_ore: 1 } },
    { id: 'mine_tin',      name: 'Mine Tin',       levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { tin_ore: 1 } },
    { id: 'mine_iron',     name: 'Mine Iron',      levelReq: 15, duration: 5000, xpReward: 35,  outputs: { iron_ore: 1 } },
    { id: 'mine_silver',   name: 'Mine Silver',    levelReq: 20, duration: 5500, xpReward: 40,  outputs: { silver_ore: 1 } },
    { id: 'mine_coal',     name: 'Mine Coal',      levelReq: 30, duration: 6500, xpReward: 50,  outputs: { coal: 1 } },
    { id: 'mine_gold',     name: 'Mine Gold',      levelReq: 40, duration: 8000, xpReward: 65,  outputs: { gold_ore: 1 } },
    { id: 'mine_gems',     name: 'Mine Gem Rocks', levelReq: 40, duration: 12000,xpReward: 90,  outputs: { uncut_sapphire: 1 } },
    { id: 'mine_mithril',  name: 'Mine Mithril',   levelReq: 55, duration: 10000,xpReward: 80,  outputs: { mithril_ore: 1 } },
    { id: 'mine_adamant',  name: 'Mine Adamant',   levelReq: 70, duration: 13000,xpReward: 120, outputs: { adamant_ore: 1 } },
    { id: 'mine_runite',   name: 'Mine Runite',    levelReq: 85, duration: 22000,xpReward: 250, outputs: { runite_ore: 1 } },
    { id: 'mine_dragonite',name: 'Mine Dragonite', levelReq: 95, duration: 30000,xpReward: 420, outputs: { dragonite_ore: 1 } },
    // ---- Essence (feeds Runecrafting) ----
    { id: 'mine_rune_essence', name: 'Mine Rune Essence', levelReq: 30, duration: 4500, xpReward: 28, outputs: { rune_essence: 2 } },
    { id: 'mine_pure_essence', name: 'Mine Pure Essence', levelReq: 55, duration: 7000, xpReward: 55, outputs: { pure_essence: 1 } },
    // ---- Extra gem rocks (separate from general mine_gems) ----
    { id: 'mine_emerald_rock',     name: 'Mine Emerald Rock',     levelReq: 45, duration: 13000, xpReward: 100, outputs: { uncut_emerald: 1 } },
    { id: 'mine_ruby_rock',        name: 'Mine Ruby Rock',        levelReq: 55, duration: 15000, xpReward: 135, outputs: { uncut_ruby: 1 } },
    { id: 'mine_diamond_rock',     name: 'Mine Diamond Rock',     levelReq: 70, duration: 18000, xpReward: 200, outputs: { uncut_diamond: 1 } },
    { id: 'mine_dragonstone_rock', name: 'Mine Dragonstone Rock', levelReq: 80, duration: 22000, xpReward: 320, outputs: { uncut_dragonstone: 1 } },
    { id: 'mine_onyx_rock',        name: 'Mine Onyx Rock',        levelReq: 92, duration: 32000, xpReward: 500, outputs: { uncut_onyx: 1 } },
  ],

  woodcutting: [
    { id: 'chop_logs',     name: 'Chop Regular Logs', levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { logs: 1 } },
    { id: 'chop_oak',      name: 'Chop Oak',         levelReq: 15, duration: 5000, xpReward: 37,  outputs: { oak_logs: 1 } },
    { id: 'chop_willow',   name: 'Chop Willow',      levelReq: 30, duration: 7000, xpReward: 67,  outputs: { willow_logs: 1 } },
    { id: 'chop_teak',     name: 'Chop Teak',        levelReq: 35, duration: 7500, xpReward: 85,  outputs: { teak_logs: 1 } },
    { id: 'chop_maple',    name: 'Chop Maple',       levelReq: 45, duration: 9000, xpReward: 100, outputs: { maple_logs: 1 } },
    { id: 'chop_mahogany', name: 'Chop Mahogany',    levelReq: 50, duration: 10000,xpReward: 125, outputs: { mahogany_logs: 1 } },
    { id: 'chop_yew',      name: 'Chop Yew',         levelReq: 60, duration: 11000,xpReward: 175, outputs: { yew_logs: 1 } },
    { id: 'chop_magic',    name: 'Chop Magic',       levelReq: 75, duration: 14000,xpReward: 250, outputs: { magic_logs: 1 } },
    { id: 'chop_elder',    name: 'Chop Elder',       levelReq: 90, duration: 22000,xpReward: 425, outputs: { elder_logs: 1 } },
    { id: 'chop_arctic_pine', name: 'Chop Arctic Pine', levelReq: 80, duration: 18000, xpReward: 300, outputs: { arctic_pine_logs: 1 } },
    { id: 'chop_redwood',  name: 'Chop Redwood',     levelReq: 92, duration: 26000, xpReward: 500, outputs: { redwood_logs: 1 } },
    // ---- Converts logs into charcoal (used for high-tier smelting) ----
    { id: 'burn_oak_charcoal',    name: 'Burn Oak to Charcoal',    levelReq: 20, duration: 4000, xpReward: 20, inputs: { oak_logs: 2, tinderbox: 1 }, outputs: { charcoal: 1, tinderbox: 1 } },
    { id: 'burn_maple_charcoal',  name: 'Burn Maple to Charcoal',  levelReq: 48, duration: 5500, xpReward: 60, inputs: { maple_logs: 2, tinderbox: 1 }, outputs: { charcoal: 2, tinderbox: 1 } },
    { id: 'burn_yew_charcoal',    name: 'Burn Yew to Charcoal',    levelReq: 65, duration: 7500, xpReward: 100, inputs: { yew_logs: 2, tinderbox: 1 }, outputs: { charcoal: 3, tinderbox: 1 } },
  ],

  smithing: [
    // ---- Smelt bars ----
    { id: 'smelt_bronze',   name: 'Smelt Bronze Bar',  levelReq: 1,  duration: 2500, xpReward: 6,  inputs: { copper_ore: 1, tin_ore: 1 }, outputs: { bronze_bar: 1 } },
    { id: 'smelt_iron',     name: 'Smelt Iron Bar',    levelReq: 15, duration: 3000, xpReward: 12, inputs: { iron_ore: 1 },               outputs: { iron_bar: 1 } },
    { id: 'smelt_silver',   name: 'Smelt Silver Bar',  levelReq: 20, duration: 3500, xpReward: 14, inputs: { silver_ore: 1 },             outputs: { silver_bar: 1 } },
    { id: 'smelt_steel',    name: 'Smelt Steel Bar',   levelReq: 30, duration: 4000, xpReward: 17, inputs: { iron_ore: 1, coal: 2 },      outputs: { steel_bar: 1 } },
    { id: 'smelt_gold',     name: 'Smelt Gold Bar',    levelReq: 40, duration: 4500, xpReward: 22, inputs: { gold_ore: 1 },               outputs: { gold_bar: 1 } },
    { id: 'smelt_mithril',  name: 'Smelt Mithril Bar', levelReq: 50, duration: 5000, xpReward: 30, inputs: { mithril_ore: 1, coal: 4 },   outputs: { mithril_bar: 1 } },
    { id: 'smelt_adamant',  name: 'Smelt Adamant Bar', levelReq: 70, duration: 6000, xpReward: 37, inputs: { adamant_ore: 1, coal: 6 },   outputs: { adamant_bar: 1 } },
    { id: 'smelt_runite',   name: 'Smelt Runite Bar',  levelReq: 85, duration: 8000, xpReward: 50, inputs: { runite_ore: 1, coal: 8 },    outputs: { runite_bar: 1 } },
    { id: 'smelt_dragonite',name: 'Smelt Dragonite Bar',levelReq:95, duration: 12000,xpReward: 80, inputs: { dragonite_ore: 1, coal: 12 },outputs: { dragonite_bar: 1 } },

    // ---- Bronze set ----
    { id: 'smith_bronze_sword',    name: 'Smith Bronze Sword',    levelReq: 1,  duration: 4000, xpReward: 12, inputs: { bronze_bar: 1 }, outputs: { bronze_sword: 1 } },
    { id: 'smith_bronze_helm',     name: 'Smith Bronze Helm',     levelReq: 3,  duration: 4500, xpReward: 16, inputs: { bronze_bar: 2 }, outputs: { bronze_helm: 1 } },
    { id: 'smith_bronze_platelegs',name: 'Smith Bronze Platelegs',levelReq: 8,  duration: 5500, xpReward: 24, inputs: { bronze_bar: 3 }, outputs: { bronze_platelegs: 1 } },
    { id: 'smith_bronze_platebody',name: 'Smith Bronze Platebody',levelReq: 12, duration: 7000, xpReward: 32, inputs: { bronze_bar: 4 }, outputs: { bronze_platebody: 1 } },
    // ---- Iron set ----
    { id: 'smith_iron_sword',      name: 'Smith Iron Sword',      levelReq: 15, duration: 5000, xpReward: 25, inputs: { iron_bar: 1 }, outputs: { iron_sword: 1 } },
    { id: 'smith_iron_helm',       name: 'Smith Iron Helm',       levelReq: 20, duration: 6500, xpReward: 32, inputs: { iron_bar: 2 }, outputs: { iron_helm: 1 } },
    { id: 'smith_iron_platelegs',  name: 'Smith Iron Platelegs',  levelReq: 24, duration: 8000, xpReward: 48, inputs: { iron_bar: 3 }, outputs: { iron_platelegs: 1 } },
    { id: 'smith_iron_platebody',  name: 'Smith Iron Platebody',  levelReq: 28, duration: 10000,xpReward: 64, inputs: { iron_bar: 4 }, outputs: { iron_platebody: 1 } },
    // ---- Steel set ----
    { id: 'smith_steel_sword',     name: 'Smith Steel Longsword', levelReq: 30, duration: 6000, xpReward: 37, inputs: { steel_bar: 2 }, outputs: { steel_longsword: 1 } },
    { id: 'smith_steel_helm',      name: 'Smith Steel Helm',      levelReq: 35, duration: 7500, xpReward: 42, inputs: { steel_bar: 2 }, outputs: { steel_helm: 1 } },
    { id: 'smith_steel_platelegs', name: 'Smith Steel Platelegs', levelReq: 40, duration: 10000,xpReward: 65, inputs: { steel_bar: 3 }, outputs: { steel_platelegs: 1 } },
    { id: 'smith_steel_platebody', name: 'Smith Steel Platebody', levelReq: 45, duration: 13000,xpReward: 90, inputs: { steel_bar: 4 }, outputs: { steel_platebody: 1 } },
    // ---- Mithril set ----
    { id: 'smith_mithril_sword',   name: 'Smith Mithril Longsword',  levelReq: 50, duration: 7000, xpReward: 50, inputs: { mithril_bar: 2 }, outputs: { mithril_sword: 1 } },
    { id: 'smith_mithril_helm',    name: 'Smith Mithril Helm',       levelReq: 55, duration: 8500, xpReward: 60, inputs: { mithril_bar: 2 }, outputs: { mithril_helm: 1 } },
    { id: 'smith_mithril_platelegs',name:'Smith Mithril Platelegs',  levelReq: 60, duration: 11000,xpReward: 85, inputs: { mithril_bar: 3 }, outputs: { mithril_platelegs: 1 } },
    { id: 'smith_mithril_platebody',name:'Smith Mithril Platebody',  levelReq: 65, duration: 15000,xpReward: 110,inputs: { mithril_bar: 4 }, outputs: { mithril_platebody: 1 } },
    // ---- Adamant set ----
    { id: 'smith_adamant_sword',   name: 'Smith Adamant Longsword',  levelReq: 70, duration: 8000, xpReward: 65, inputs: { adamant_bar: 2 }, outputs: { adamant_sword: 1 } },
    { id: 'smith_adamant_helm',    name: 'Smith Adamant Helm',       levelReq: 75, duration: 10000,xpReward: 75, inputs: { adamant_bar: 2 }, outputs: { adamant_helm: 1 } },
    { id: 'smith_adamant_platelegs',name:'Smith Adamant Platelegs',  levelReq: 80, duration: 13000,xpReward: 105,inputs: { adamant_bar: 3 }, outputs: { adamant_platelegs: 1 } },
    { id: 'smith_adamant_platebody',name:'Smith Adamant Platebody',  levelReq: 84, duration: 18000,xpReward: 140,inputs: { adamant_bar: 4 }, outputs: { adamant_platebody: 1 } },
    // ---- Runite set ----
    { id: 'smith_runite_sword',    name: 'Smith Runite Longsword',   levelReq: 85, duration: 10000,xpReward: 85, inputs: { runite_bar: 2 }, outputs: { runite_sword: 1 } },
    { id: 'smith_runite_helm',     name: 'Smith Runite Helm',        levelReq: 88, duration: 13000,xpReward: 100,inputs: { runite_bar: 2 }, outputs: { runite_helm: 1 } },
    { id: 'smith_runite_platelegs',name: 'Smith Runite Platelegs',   levelReq: 92, duration: 17000,xpReward: 140,inputs: { runite_bar: 3 }, outputs: { runite_platelegs: 1 } },
    { id: 'smith_runite_platebody',name: 'Smith Runite Platebody',   levelReq: 99, duration: 24000,xpReward: 200,inputs: { runite_bar: 4 }, outputs: { runite_platebody: 1 } },
    // ---- Dragonite smith set (endgame, bar already smelted above) ----
    { id: 'smith_dragonite_sword',name: 'Smith Dragonite Longsword', levelReq: 95, duration: 14000,xpReward: 140,inputs: { dragonite_bar: 2 }, outputs: { dragonite_sword: 1 } },
    { id: 'smith_dragonite_helm', name: 'Smith Dragonite Helm',      levelReq: 96, duration: 16000,xpReward: 160,inputs: { dragonite_bar: 2 }, outputs: { dragonite_helm: 1 } },
    { id: 'smith_dragonite_platelegs', name: 'Smith Dragonite Platelegs', levelReq: 97, duration: 20000, xpReward: 210, inputs: { dragonite_bar: 3 }, outputs: { dragonite_platelegs: 1 } },
    { id: 'smith_dragonite_platebody', name: 'Smith Dragonite Platebody', levelReq: 99, duration: 28000, xpReward: 280, inputs: { dragonite_bar: 4 }, outputs: { dragonite_platebody: 1 } },
    // ---- Rune-etched / chaos / death forged (cross-skill with Runecrafting) ----
    { id: 'forge_chaos_bar',      name: 'Forge Chaos Bar',           levelReq: 70, duration: 7000, xpReward: 110, inputs: { mithril_bar: 2, chaos_rune: 3, coal: 4 }, outputs: { chaos_bar: 1 } },
    { id: 'forge_death_bar',      name: 'Forge Death Bar',           levelReq: 90, duration: 11000,xpReward: 220, inputs: { runite_bar: 2, death_rune: 2, coal: 6 }, outputs: { death_bar: 1 } },
    { id: 'smith_rune_etched_sword', name: 'Smith Rune-Etched Sword',levelReq: 65, duration: 12000,xpReward: 180,inputs: { runite_bar: 1, chaos_rune: 5, nature_rune: 3 }, outputs: { rune_etched_sword: 1 } },
    { id: 'smith_chaos_blade',    name: 'Smith Chaos Blade',         levelReq: 85, duration: 16000,xpReward: 320,inputs: { chaos_bar: 2, death_rune: 8, onyx: 1 }, outputs: { chaos_blade: 1 } },
    { id: 'smith_death_hammer',   name: 'Smith Death Hammer',        levelReq: 92, duration: 20000,xpReward: 420,inputs: { death_bar: 2, blood_rune: 20, ruby: 2 }, outputs: { death_hammer: 1 } },
    // ---- Basic tools (cheap, level-1 smithing) ----
    { id: 'smith_chisel',         name: 'Smith Chisel',              levelReq: 3,  duration: 2500, xpReward: 10, inputs: { bronze_bar: 1 }, outputs: { chisel: 1 } },
    { id: 'smith_knife',          name: 'Smith Crafting Knife',      levelReq: 2,  duration: 2500, xpReward: 9,  inputs: { bronze_bar: 1 }, outputs: { knife: 1 } },
  ],

  crafting: [
    // ---- Cut gems ----
    { id: 'cut_sapphire',   name: 'Cut Sapphire',   levelReq: 20, duration: 2500, xpReward: 30,  inputs: { uncut_sapphire: 1 }, outputs: { sapphire: 1 } },
    { id: 'cut_emerald',    name: 'Cut Emerald',    levelReq: 27, duration: 2500, xpReward: 40,  inputs: { uncut_emerald: 1 },  outputs: { emerald: 1 } },
    { id: 'cut_ruby',       name: 'Cut Ruby',       levelReq: 34, duration: 3000, xpReward: 60,  inputs: { uncut_ruby: 1 },     outputs: { ruby: 1 } },
    { id: 'cut_diamond',    name: 'Cut Diamond',    levelReq: 43, duration: 3500, xpReward: 90,  inputs: { uncut_diamond: 1 },  outputs: { diamond: 1 } },
    // ---- Cloth / bowstring / thread (feeds talismans + sewing) ----
    { id: 'spin_thread',    name: 'Spin Thread',    levelReq: 1,  duration: 1200, xpReward: 6,   inputs: { flax: 1 },            outputs: { thread: 2 } },
    { id: 'spin_silk',      name: 'Spin Silk Thread',levelReq: 8,  duration: 1800, xpReward: 14, inputs: { silk_scraps: 2 },     outputs: { thread: 3 } },
    { id: 'spin_flax',      name: 'Spin Bowstring', levelReq: 10, duration: 1500, xpReward: 15,  inputs: { flax: 1 },            outputs: { bowstring: 1 } },
    // ---- Tanning / leatherwork (removes leather bottleneck) ----
    { id: 'tan_hide',       name: 'Tan Monster Hide',levelReq: 5,  duration: 3000, xpReward: 16, inputs: { monster_hide: 2, knife: 1 }, outputs: { leather: 1, knife: 1 } },
    { id: 'tan_hard_leather',name:'Tan Hard Leather', levelReq: 25, duration: 4000, xpReward: 50, inputs: { leather: 2, fire_rune: 1, knife: 1 }, outputs: { hard_leather: 1, knife: 1 } },
    { id: 'tan_dragon_leather',name:'Tan Dragon Leather',levelReq:60,duration: 8000, xpReward: 220,inputs: { dragon_scale: 1, nature_rune: 2, knife: 1 }, outputs: { dragon_leather: 1, knife: 1 } },
    // ---- Armor ----
    { id: 'craft_leather_vest',name:'Craft Leather Vest',levelReq: 8, duration: 4500, xpReward: 22, inputs: { leather: 3, thread: 1 }, outputs: { leather_vest: 1 } },
    { id: 'craft_cloth_robe',  name:'Craft Cloth Robe',  levelReq: 5, duration: 4000, xpReward: 25, inputs: { spider_silk: 3 },         outputs: { cloth_robe: 1 } },
    // ---- Fletching (bows + staves) ----
    { id: 'fletch_short_bow',  name:'Fletch Short Bow',  levelReq: 10, duration: 5000, xpReward: 35, inputs: { logs: 2, bowstring: 1 },        outputs: { short_bow: 1 } },
    { id: 'fletch_oak_staff',  name:'Fletch Oak Staff',  levelReq: 15, duration: 6000, xpReward: 45, inputs: { oak_logs: 2, bone_shard: 1 },   outputs: { oak_staff: 1 } },
    { id: 'fletch_yew_longbow',name:'Fletch Yew Longbow',levelReq: 40, duration: 8000, xpReward: 90, inputs: { yew_logs: 2, bowstring: 2 },    outputs: { yew_longbow: 1 } },
    { id: 'fletch_elven_bow',  name:'Fletch Elven Bow',  levelReq: 55, duration: 10000,xpReward: 130,inputs: { magic_logs: 2, bowstring: 2, emerald: 1 }, outputs: { elven_bow: 1 } },
    { id: 'craft_archon_staff',name:'Craft Archon Staff',levelReq: 65, duration: 12000,xpReward: 180,inputs: { magic_logs: 2, demon_horn: 2, sapphire: 1 }, outputs: { archon_staff: 1 } },
    // ---- Jewelry ----
    { id: 'craft_sapphire_ring',  name:'Craft Sapphire Ring',  levelReq: 25, duration: 4000, xpReward: 55,  inputs: { silver_bar: 1, sapphire: 1 }, outputs: { sapphire_ring: 1 } },
    { id: 'craft_emerald_ring',   name:'Craft Emerald Ring',   levelReq: 32, duration: 4500, xpReward: 78,  inputs: { silver_bar: 1, emerald: 1 },  outputs: { emerald_ring: 1 } },
    { id: 'craft_ruby_ring',      name:'Craft Ruby Ring',      levelReq: 40, duration: 5500, xpReward: 115, inputs: { gold_bar: 1, ruby: 1 },       outputs: { ruby_ring: 1 } },
    { id: 'craft_diamond_ring',   name:'Craft Diamond Ring',   levelReq: 50, duration: 7000, xpReward: 180, inputs: { gold_bar: 1, diamond: 1 },    outputs: { diamond_ring: 1 } },
    { id: 'craft_sapphire_amulet',name:'Craft Sapphire Amulet',levelReq: 28, duration: 4500, xpReward: 65,  inputs: { silver_bar: 2, sapphire: 1 }, outputs: { sapphire_amulet: 1 } },
    { id: 'craft_emerald_amulet', name:'Craft Emerald Amulet', levelReq: 35, duration: 5000, xpReward: 95,  inputs: { silver_bar: 2, emerald: 1 },  outputs: { emerald_amulet: 1 } },
    { id: 'craft_ruby_amulet',    name:'Craft Ruby Amulet',    levelReq: 44, duration: 6500, xpReward: 150, inputs: { gold_bar: 2, ruby: 1 },       outputs: { ruby_amulet: 1 } },
    { id: 'craft_diamond_amulet', name:'Craft Diamond Amulet', levelReq: 55, duration: 8000, xpReward: 240, inputs: { gold_bar: 2, diamond: 1 },    outputs: { diamond_amulet: 1 } },
    // ---- Tools ----
    { id: 'craft_tinderbox',      name: 'Craft Tinderbox',     levelReq: 1,  duration: 2000, xpReward: 8,   inputs: { logs: 1 }, outputs: { tinderbox: 1 } },
    { id: 'craft_pestle_mortar',  name: 'Craft Pestle & Mortar',levelReq: 15, duration: 4000, xpReward: 40, inputs: { gold_bar: 1 }, outputs: { pestle_and_mortar: 1 } },
    { id: 'craft_lockpick',       name: 'Craft Lockpick',      levelReq: 20, duration: 3500, xpReward: 35, inputs: { silver_bar: 1, silk_scraps: 2 }, outputs: { lockpick: 1 } },
    // ---- High-tier gem cuts ----
    { id: 'cut_dragonstone',      name: 'Cut Dragonstone',     levelReq: 55, duration: 4500, xpReward: 140, inputs: { uncut_dragonstone: 1, chisel: 1 }, outputs: { dragonstone: 1, chisel: 1 } },
    { id: 'cut_onyx',             name: 'Cut Onyx',            levelReq: 80, duration: 6000, xpReward: 280, inputs: { uncut_onyx: 1, chisel: 1 }, outputs: { onyx: 1, chisel: 1 } },
    { id: 'craft_dragonstone_ring',name:'Craft Dragonstone Ring',levelReq: 60, duration: 9000, xpReward: 320, inputs: { gold_bar: 2, dragonstone: 1 }, outputs: { dragonstone_ring: 1 } },
    { id: 'craft_onyx_ring',      name: 'Craft Onyx Ring',     levelReq: 85, duration: 12000,xpReward: 520, inputs: { gold_bar: 3, onyx: 1, soul_rune: 5 }, outputs: { onyx_ring: 1 } },
    // ---- Talismans (feed Runecrafting) ----
    { id: 'craft_air_talisman',   name: 'Craft Air Talisman',   levelReq: 1,  duration: 3500, xpReward: 10, inputs: { thread: 1, copper_ore: 1 }, outputs: { air_talisman: 1 } },
    { id: 'craft_mind_talisman',  name: 'Craft Mind Talisman',  levelReq: 2,  duration: 3500, xpReward: 12, inputs: { thread: 1, tin_ore: 1 },    outputs: { mind_talisman: 1 } },
    { id: 'craft_water_talisman', name: 'Craft Water Talisman', levelReq: 5,  duration: 3800, xpReward: 16, inputs: { thread: 1, iron_ore: 1 },   outputs: { water_talisman: 1 } },
    { id: 'craft_earth_talisman', name: 'Craft Earth Talisman', levelReq: 9,  duration: 4000, xpReward: 22, inputs: { thread: 1, iron_ore: 2 },   outputs: { earth_talisman: 1 } },
    { id: 'craft_fire_talisman',  name: 'Craft Fire Talisman',  levelReq: 14, duration: 4500, xpReward: 30, inputs: { thread: 2, coal: 1 },       outputs: { fire_talisman: 1 } },
    { id: 'craft_body_talisman',  name: 'Craft Body Talisman',  levelReq: 20, duration: 5000, xpReward: 42, inputs: { thread: 2, silver_ore: 1 }, outputs: { body_talisman: 1 } },
    { id: 'craft_cosmic_talisman',name: 'Craft Cosmic Talisman',levelReq: 27, duration: 5500, xpReward: 60, inputs: { silk_scraps: 2, silver_ore: 1 }, outputs: { cosmic_talisman: 1 } },
    { id: 'craft_chaos_talisman', name: 'Craft Chaos Talisman', levelReq: 35, duration: 6000, xpReward: 95, inputs: { silk_scraps: 3, gold_ore: 1, demon_horn: 1 }, outputs: { chaos_talisman: 1 } },
    { id: 'craft_nature_talisman',name: 'Craft Nature Talisman',levelReq: 44, duration: 6500, xpReward: 130, inputs: { silk_fine: 1, ranarr: 1, gold_ore: 1 }, outputs: { nature_talisman: 1 } },
    { id: 'craft_law_talisman',   name: 'Craft Law Talisman',   levelReq: 54, duration: 7000, xpReward: 180, inputs: { silk_fine: 1, mithril_ore: 1, diamond: 1 }, outputs: { law_talisman: 1 } },
    { id: 'craft_death_talisman', name: 'Craft Death Talisman', levelReq: 65, duration: 8000, xpReward: 240, inputs: { silk_fine: 2, bone_shard: 10, ruby: 1 }, outputs: { death_talisman: 1 } },
    { id: 'craft_blood_talisman', name: 'Craft Blood Talisman', levelReq: 77, duration: 9000, xpReward: 320, inputs: { silk_fine: 2, dragon_scale: 1, ruby: 2 }, outputs: { blood_talisman: 1 } },
    { id: 'craft_soul_talisman',  name: 'Craft Soul Talisman',  levelReq: 90, duration: 12000,xpReward: 500, inputs: { silk_fine: 3, soul_gem: 1, dragon_scale: 2 }, outputs: { soul_talisman: 1 } },
    // ---- Silk weaving ----
    { id: 'weave_silk',           name: 'Weave Fine Silk',     levelReq: 30, duration: 4500, xpReward: 50, inputs: { silk_scraps: 5, thread: 2 }, outputs: { silk_fine: 1 } },
    // ---- Rogue outfit (crafting from thieving outputs) ----
    { id: 'craft_rogue_mask',     name: 'Craft Rogue Mask',    levelReq: 45, duration: 9000, xpReward: 150, inputs: { silk_fine: 2, hard_leather: 2, poison_vial_raw: 1 }, outputs: { rogue_mask: 1 } },
    { id: 'craft_rogue_top',      name: 'Craft Rogue Vest',    levelReq: 47, duration: 10000,xpReward: 180, inputs: { silk_fine: 3, hard_leather: 3, poison_vial_raw: 1 }, outputs: { rogue_top: 1 } },
    { id: 'craft_rogue_legs',     name: 'Craft Rogue Breeches',levelReq: 46, duration: 10000,xpReward: 170, inputs: { silk_fine: 3, hard_leather: 2, poison_vial_raw: 1 }, outputs: { rogue_legs: 1 } },
    { id: 'craft_rogue_gloves',   name: 'Craft Rogue Gloves',  levelReq: 45, duration: 7000, xpReward: 110, inputs: { silk_fine: 1, hard_leather: 1 }, outputs: { rogue_gloves: 1 } },
    { id: 'craft_rogue_boots',    name: 'Craft Rogue Boots',   levelReq: 45, duration: 7000, xpReward: 110, inputs: { silk_fine: 1, hard_leather: 2 }, outputs: { rogue_boots: 1 } },
    // ---- Graceful outfit (agility-cross-skill) ----
    { id: 'craft_graceful_hood',  name: 'Craft Graceful Hood', levelReq: 56, duration: 10000,xpReward: 200, inputs: { marks_of_grace: 20, silk_fine: 2 }, outputs: { graceful_hood: 1 } },
    { id: 'craft_graceful_top',   name: 'Craft Graceful Top',  levelReq: 58, duration: 12000,xpReward: 240, inputs: { marks_of_grace: 30, silk_fine: 3 }, outputs: { graceful_top: 1 } },
    { id: 'craft_graceful_legs',  name: 'Craft Graceful Legs', levelReq: 58, duration: 12000,xpReward: 240, inputs: { marks_of_grace: 28, silk_fine: 3 }, outputs: { graceful_legs: 1 } },
    { id: 'craft_graceful_boots', name: 'Craft Graceful Boots',levelReq: 56, duration: 10000,xpReward: 200, inputs: { marks_of_grace: 18, silk_fine: 2 }, outputs: { graceful_boots: 1 } },
    { id: 'craft_graceful_cape',  name: 'Craft Graceful Cape', levelReq: 75, duration: 16000,xpReward: 440, inputs: { marks_of_grace: 60, silk_fine: 5, nature_rune: 10 }, outputs: { graceful_cape: 1 } },
    // ---- Enchanted jewelry (crafting × runecrafting) ----
    { id: 'enchant_sapphire_ring',name: 'Enchant Sapphire Ring', levelReq: 30, duration: 4000, xpReward: 90,  inputs: { sapphire_ring: 1, cosmic_rune: 1 }, outputs: { enchanted_sapphire_ring: 1 } },
    { id: 'enchant_emerald_ring', name: 'Enchant Emerald Ring',  levelReq: 40, duration: 5000, xpReward: 130, inputs: { emerald_ring: 1, nature_rune: 3 },  outputs: { enchanted_emerald_ring: 1 } },
    { id: 'enchant_ruby_amulet',  name: 'Enchant Ruby Amulet',   levelReq: 50, duration: 6500, xpReward: 200, inputs: { ruby_amulet: 1, blood_rune: 1 },    outputs: { enchanted_ruby_amulet: 1 } },
    { id: 'enchant_diamond_amulet',name:'Enchant Diamond Amulet',levelReq: 65, duration: 9000, xpReward: 350, inputs: { diamond_amulet: 1, soul_rune: 1 },  outputs: { enchanted_diamond_amulet: 1 } },
    // ---- Bows + Staves expanded ----
    { id: 'fletch_composite_bow', name: 'Fletch Composite Bow',levelReq: 25, duration: 6000, xpReward: 65,  inputs: { maple_logs: 2, bowstring: 1, knife: 1 }, outputs: { composite_bow: 1, knife: 1 } },
    { id: 'fletch_crystal_bow',   name: 'Fletch Crystal Bow',  levelReq: 60, duration: 13000,xpReward: 260, inputs: { magic_logs: 2, bowstring: 2, uncut_diamond: 1, nature_rune: 5, knife: 1 }, outputs: { crystal_bow: 1, knife: 1 } },
    { id: 'fletch_battlestaff',   name: 'Fletch Battlestaff',  levelReq: 30, duration: 7000, xpReward: 90,  inputs: { willow_logs: 2, air_rune: 5, water_rune: 5, earth_rune: 5, fire_rune: 5 }, outputs: { battlestaff: 1 } },
    { id: 'fletch_mystic_staff',  name: 'Fletch Mystic Staff', levelReq: 55, duration: 11000,xpReward: 220, inputs: { magic_logs: 2, cosmic_rune: 5, law_rune: 3, sapphire: 1 }, outputs: { mystic_staff: 1 } },
    { id: 'fletch_ancient_staff', name: 'Fletch Ancient Staff',levelReq: 85, duration: 18000,xpReward: 500, inputs: { magic_logs: 3, blood_rune: 10, soul_rune: 5, diamond: 1 }, outputs: { ancient_staff: 1 } },
    // ---- Endgame armor (sinks for dragon_leather, blood_diamond, dragon_hoard_scrap) ----
    { id: 'craft_dragonhide_body',name:'Craft Dragonhide Body',levelReq: 65, duration: 13000,xpReward: 380, inputs: { dragon_leather: 3, thread: 3, knife: 1 }, outputs: { dragonhide_body: 1, knife: 1 } },
    { id: 'craft_dragonhide_chaps',name:'Craft Dragonhide Chaps',levelReq:63, duration: 11000,xpReward: 310, inputs: { dragon_leather: 2, thread: 2, knife: 1 }, outputs: { dragonhide_chaps: 1, knife: 1 } },
    { id: 'craft_bloodcrown',     name:'Craft Bloodcrown',    levelReq: 72, duration: 15000,xpReward: 440, inputs: { blood_diamond: 1, gold_bar: 3, blood_rune: 5 }, outputs: { bloodcrown: 1 } },
    { id: 'craft_dragonhoard_cape',name:'Craft Dragonhoard Cape',levelReq:88,duration: 22000,xpReward: 720, inputs: { dragon_hoard_scrap: 1, silk_fine: 3, nature_rune: 20 }, outputs: { dragonhoard_cape: 1 } },
    { id: 'craft_dragonhoard_plate',name:'Craft Dragonhoard Plate',levelReq:95,duration: 30000,xpReward: 1100,inputs: { dragon_hoard_scrap: 2, runite_bar: 5, soul_rune: 3 }, outputs: { dragonhoard_plate: 1 } },
    // ---- Early agility trinkets (closes the marks_of_grace usage gap) ----
    { id: 'craft_grace_bracelet', name:'Craft Grace Bracelet',levelReq: 20, duration: 5000, xpReward: 60, inputs: { marks_of_grace: 10, silver_bar: 1, thread: 2 }, outputs: { grace_bracelet: 1 } },
    { id: 'craft_stamina_gloves', name:'Craft Stamina Gloves',levelReq: 25, duration: 5500, xpReward: 80, inputs: { marks_of_grace: 15, hard_leather: 1, silk_scraps: 2 }, outputs: { stamina_gloves: 1 } },
    { id: 'craft_runners_cape',   name:'Craft Runners Cape',  levelReq: 35, duration: 7000, xpReward: 130,inputs: { marks_of_grace: 25, silk_fine: 1, thread: 3 }, outputs: { runners_cape: 1 } },
    // ---- Mastery tier (mastery_mark sinks — Grandmaster + endgame Agility) ----
    { id: 'craft_masters_signet', name:"Craft Master's Signet",levelReq: 80, duration: 22000,xpReward: 900,  inputs: { mastery_mark: 5, dragonstone: 1, gold_bar: 2, cosmic_rune: 5 }, outputs: { masters_signet: 1 } },
    { id: 'craft_masters_robe',   name:"Craft Master's Robe",  levelReq: 88, duration: 32000,xpReward: 1500, inputs: { mastery_mark: 8, silk_fine: 5, dragon_leather: 3, soul_rune: 5 }, outputs: { masters_robe: 1 } },
    { id: 'craft_masters_crown',  name:"Craft Master's Crown", levelReq: 92, duration: 38000,xpReward: 1800, inputs: { mastery_mark: 12, onyx: 1, dragon_hoard_scrap: 2, blood_rune: 10, gold_bar: 3 }, outputs: { masters_crown: 1 } },
    { id: 'scribe_tome_of_mastery',name:'Scribe Tome of Mastery',levelReq: 75, duration: 18000,xpReward: 600, inputs: { mastery_mark: 3, magic_logs: 5, cosmic_rune: 5, nature_rune: 5 }, outputs: { tome_of_mastery: 1 } },
    // ---- Skill capes (one per skill — see CAPE_BY_SKILL for the bonus map) ----
    { id: 'craft_mining_cape',       name:'Craft Mining Cape',       levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, runite_ore: 10, dragonite_ore: 2, silk_fine: 3 }, outputs: { mining_cape: 1 } },
    { id: 'craft_woodcutting_cape',  name:'Craft Woodcutting Cape',  levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, magic_logs: 8, elder_logs: 4, silk_fine: 3 }, outputs: { woodcutting_cape: 1 } },
    { id: 'craft_smithing_cape',     name:'Craft Smithing Cape',     levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, runite_bar: 6, dragonite_bar: 2, silk_fine: 3 }, outputs: { smithing_cape: 1 } },
    { id: 'craft_crafting_cape',     name:'Craft Crafting Cape',     levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, silk_fine: 8, dragon_leather: 4, gold_bar: 3 }, outputs: { crafting_cape: 1 } },
    { id: 'craft_herblore_cape',     name:'Craft Herblore Cape',     levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, torstol: 4, spirit_herb: 1, silk_fine: 3 }, outputs: { herblore_cape: 1 } },
    { id: 'craft_fishing_cape',      name:'Craft Fishing Cape',      levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, raw_anglerfish: 4, raw_dark_crab: 2, silk_fine: 3 }, outputs: { fishing_cape: 1 } },
    { id: 'craft_cooking_cape',      name:'Craft Cooking Cape',      levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, cooked_dark_crab: 3, divine_wine: 1, silk_fine: 3 }, outputs: { cooking_cape: 1 } },
    { id: 'craft_farming_cape',      name:'Craft Farming Cape',      levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, torstol: 6, dwarf_weed: 4, silk_fine: 3 }, outputs: { farming_cape: 1 } },
    { id: 'craft_runecrafting_cape', name:'Craft Runecrafting Cape', levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, astral_rune: 1, soul_rune: 5, silk_fine: 3 }, outputs: { runecrafting_cape: 1 } },
    { id: 'craft_thieving_cape',     name:'Craft Thieving Cape',     levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, soul_gem: 1, silk_fine: 6, gold_trinket: 3 }, outputs: { thieving_cape: 1 } },
    { id: 'craft_agility_cape',      name:'Craft Agility Cape',      levelReq: 90, duration: 30000, xpReward: 1200, inputs: { mastery_mark: 4, marks_of_grace: 80, silk_fine: 3 }, outputs: { agility_cape: 1 } },
    // Capstone — fuses every skill cape into one.
    { id: 'craft_cape_of_completion',name:'Craft Cape of Completion',levelReq: 99, duration: 60000, xpReward: 5000, inputs: { mastery_mark: 20, mining_cape: 1, woodcutting_cape: 1, smithing_cape: 1, crafting_cape: 1, herblore_cape: 1, fishing_cape: 1, cooking_cape: 1, farming_cape: 1, runecrafting_cape: 1, thieving_cape: 1, agility_cape: 1 }, outputs: { cape_of_completion: 1 } },
  ],

  herblore: [
    { id: 'mix_attack_pot',   name: 'Mix Attack Potion',   levelReq: 3,  duration: 2000, xpReward: 25,  inputs: { herbs: 1,    vial_of_water: 1 }, outputs: { attack_potion: 1 } },
    { id: 'mix_defense_pot',  name: 'Mix Defense Potion',  levelReq: 6,  duration: 2000, xpReward: 30,  inputs: { herbs: 2,    vial_of_water: 1 }, outputs: { defense_potion: 1 } },
    { id: 'mix_health_pot',   name: 'Mix Healing Potion',  levelReq: 10, duration: 2500, xpReward: 40,  inputs: { herbs: 2,    vial_of_water: 1 }, outputs: { healing_potion: 1 } },
    { id: 'mix_mana_pot',     name: 'Mix Mana Potion',     levelReq: 15, duration: 3000, xpReward: 50,  inputs: { herbs: 2,    vial_of_water: 1, glowing_mushroom: 1 }, outputs: { mana_potion: 1 } },
    { id: 'mix_strength_pot', name: 'Mix Strength Potion', levelReq: 22, duration: 3200, xpReward: 65,  inputs: { toadflax: 1, vial_of_water: 1 }, outputs: { strength_potion: 1 } },
    { id: 'mix_magic_pot',    name: 'Mix Magic Potion',    levelReq: 28, duration: 3500, xpReward: 78,  inputs: { ranarr: 1,   vial_of_water: 1, glowing_mushroom: 1 }, outputs: { magic_potion: 1 } },
    { id: 'mix_ranging_pot',  name: 'Mix Ranging Potion',  levelReq: 28, duration: 3500, xpReward: 78,  inputs: { ranarr: 1,   vial_of_water: 1, feathers: 5 }, outputs: { ranging_potion: 1 } },
    { id: 'mix_super_attack', name: 'Mix Super Attack',    levelReq: 40, duration: 4500, xpReward: 120, inputs: { avantoe: 1,  vial_of_water: 1, ruby: 1 }, outputs: { super_attack: 1 } },
    { id: 'mix_super_defense',name: 'Mix Super Defense',   levelReq: 48, duration: 5000, xpReward: 140, inputs: { kwuarm: 1,   vial_of_water: 1, diamond: 1 }, outputs: { super_defense: 1 } },
    { id: 'mix_prayer_pot',   name: 'Mix Prayer Potion',   levelReq: 55, duration: 5500, xpReward: 175, inputs: { ranarr: 1,   vial_of_water: 1, bone_shard: 3 }, outputs: { prayer_potion: 1 } },
    { id: 'mix_saradomin',    name: 'Mix Saradomin Brew',  levelReq: 72, duration: 7000, xpReward: 260, inputs: { cadantine: 1,vial_of_water: 1, celestial_dust: 1 }, outputs: { saradomin_brew: 1 } },
    { id: 'mix_elixir_life',  name: 'Mix Elixir of Life',  levelReq: 85, duration: 10000,xpReward: 400, inputs: { cadantine: 1,vial_of_water: 1, dragon_scale: 1, diamond: 1 }, outputs: { elixir_of_life: 1 } },
    // ---- Stamina / Agility cross-skill ----
    { id: 'mix_stamina_potion',name:'Mix Stamina Potion',  levelReq: 20, duration: 2800, xpReward: 55,  inputs: { stamina_herb: 1, vial_of_water: 1 }, outputs: { stamina_potion: 1 } },
    { id: 'mix_agility_potion',name:'Mix Agility Potion',  levelReq: 35, duration: 4000, xpReward: 115, inputs: { stamina_herb: 2, toadflax: 1, vial_of_water: 1 }, outputs: { agility_potion: 1 } },
    // ---- Thieving cross-skill ----
    { id: 'mix_anti_poison',  name: 'Mix Anti-Poison',     levelReq: 18, duration: 3000, xpReward: 55, inputs: { poison_vial_raw: 1, vial_of_water: 1, herbs: 2 }, outputs: { anti_poison: 1 } },
    { id: 'mix_weapon_poison',name: 'Mix Weapon Poison',   levelReq: 40, duration: 5000, xpReward: 130,inputs: { poison_vial: 1, kwuarm: 1, vial_of_water: 1 }, outputs: { weapon_poison: 1 } },
    // ---- Super potions (endgame farming tier) ----
    { id: 'mix_super_strength',name:'Mix Super Strength',  levelReq: 55, duration: 6000, xpReward: 210, inputs: { wildblood: 1, vial_of_water: 1, ruby: 1 }, outputs: { super_strength: 1 } },
    { id: 'mix_super_magic',  name: 'Mix Super Magic',     levelReq: 58, duration: 6000, xpReward: 220, inputs: { snapdragon: 1, vial_of_water: 1, diamond: 1 }, outputs: { super_magic: 1 } },
    { id: 'mix_super_ranging',name: 'Mix Super Ranging',   levelReq: 62, duration: 6500, xpReward: 240, inputs: { dwarf_weed: 1, vial_of_water: 1, feathers: 10 }, outputs: { super_ranging: 1 } },
    // ---- Imbued / Divine / Overload ----
    { id: 'mix_imbued_healing',name:'Mix Imbued Healing',  levelReq: 65, duration: 7000, xpReward: 280, inputs: { healing_potion: 1, blood_rune: 5 }, outputs: { imbued_healing_potion: 1 } },
    { id: 'mix_guthix_rest',  name: 'Mix Guthix Rest',     levelReq: 50, duration: 5500, xpReward: 160, inputs: { ranarr: 1, herbs: 2, vial_of_water: 1 }, outputs: { guthix_rest: 1 } },
    { id: 'mix_divine_potion',name: 'Mix Divine Potion',   levelReq: 90, duration: 14000,xpReward: 520, inputs: { torstol: 1, cadantine: 1, soul_rune: 3 }, outputs: { divine_potion: 1 } },
    { id: 'mix_overload',     name: 'Mix Overload',        levelReq: 95, duration: 20000,xpReward: 900, inputs: { torstol: 1, spirit_herb: 1, super_strength: 1, super_magic: 1, super_ranging: 1 }, outputs: { overload_potion: 1 } },
    // ---- Fish-oil based potions (ties Fishing into Herblore) ----
    { id: 'mix_fisher_draught',name:'Mix Fisher Draught',  levelReq: 38, duration: 4200, xpReward: 110, inputs: { fish_oil: 1, herbs: 2, vial_of_water: 1 }, outputs: { greater_healing_potion: 1 } },
    { id: 'mix_kraken_oil',   name: 'Mix Kraken Oil',      levelReq: 70, duration: 7500, xpReward: 300, inputs: { fish_oil: 2, cadantine: 1, vial_of_water: 1 }, outputs: { imbued_healing_potion: 1 } },
    // Brews a self-buff that boosts town skill XP gain for 5 minutes.
    { id: 'mix_wisdom_potion',name: 'Mix Wisdom Potion',   levelReq: 60, duration: 7000, xpReward: 240, inputs: { ranarr: 1, cadantine: 1, cosmic_rune: 5, vial_of_water: 1 }, outputs: { wisdom_potion: 1 } },
  ],

  fishing: [
    { id: 'net_shrimp',       name: 'Net Shrimp',         levelReq: 1,  duration: 3500, xpReward: 10,  outputs: { raw_shrimp: 1 } },
    { id: 'bait_sardine',     name: 'Bait Sardine',       levelReq: 5,  duration: 4500, xpReward: 20,  outputs: { raw_sardine: 1 } },
    { id: 'flyfish_trout',    name: 'Flyfish Trout',      levelReq: 20, duration: 5500, xpReward: 50,  outputs: { raw_trout: 1 } },
    { id: 'flyfish_salmon',   name: 'Flyfish Salmon',     levelReq: 30, duration: 6500, xpReward: 70,  outputs: { raw_salmon: 1 } },
    { id: 'bait_tuna',        name: 'Bait Tuna',          levelReq: 35, duration: 7000, xpReward: 80,  outputs: { raw_tuna: 1 } },
    { id: 'cage_lobster',     name: 'Cage Lobster',       levelReq: 40, duration: 8000, xpReward: 90,  outputs: { raw_lobster: 1 } },
    { id: 'harpoon_swordfish',name: 'Harpoon Swordfish',  levelReq: 50, duration: 9000, xpReward: 100, outputs: { raw_swordfish: 1 } },
    { id: 'net_monkfish',     name: 'Net Monkfish',       levelReq: 62, duration: 11000,xpReward: 120, outputs: { raw_monkfish: 1 } },
    { id: 'harpoon_shark',    name: 'Harpoon Shark',      levelReq: 76, duration: 15000,xpReward: 110, outputs: { raw_shark: 1 } },
    { id: 'net_manta_ray',    name: 'Net Manta Ray',      levelReq: 81, duration: 18000,xpReward: 150, outputs: { raw_manta_ray: 1 } },
    { id: 'harpoon_anglerfish',name:'Harpoon Anglerfish', levelReq: 82, duration: 20000,xpReward: 160, outputs: { raw_anglerfish: 1 } },
    { id: 'cage_dark_crab',   name: 'Cage Dark Crab',     levelReq: 85, duration: 22000,xpReward: 170, outputs: { raw_dark_crab: 1 } },
    // ---- Bait-assisted (cross-skill: feathers from Farming, silk from Thieving) ----
    { id: 'bait_leaping_trout',name:'Bait Leaping Trout',  levelReq: 20, duration: 4500, xpReward: 65,  inputs: { feathers: 1 }, outputs: { raw_trout: 2 } },
    { id: 'bait_karambwan',   name: 'Bait Karambwan',     levelReq: 65, duration: 12000,xpReward: 150, inputs: { silk_scraps: 1 }, outputs: { raw_karambwan: 1 } },
    // ---- Rare rendering from high-tier catches ----
    { id: 'render_fish_oil',  name: 'Render Fish Oil',    levelReq: 40, duration: 4000, xpReward: 80, inputs: { raw_lobster: 1 }, outputs: { fish_oil: 1 } },
    { id: 'render_shark_oil', name: 'Render Shark Oil',   levelReq: 80, duration: 6000, xpReward: 180, inputs: { raw_shark: 1 }, outputs: { fish_oil: 3 } },
  ],

  farming: [
    // Free grows — slow, no inputs, steady yield of cooking/herblore reagents.
    { id: 'grow_wheat',      name: 'Grow Wheat',       levelReq: 1,  duration: 8000,  xpReward: 12,  outputs: { wheat: 1 } },
    { id: 'mill_flour',      name: 'Mill Flour',       levelReq: 3,  duration: 3000,  xpReward: 10,  inputs: { wheat: 2 },  outputs: { flour: 1 } },
    { id: 'harvest_flax',    name: 'Harvest Flax',     levelReq: 5,  duration: 6000,  xpReward: 18,  outputs: { flax: 1 } },
    { id: 'fill_vials',      name: 'Fill Water Vials', levelReq: 1,  duration: 2000,  xpReward: 5,   outputs: { vial_of_water: 1 } },
    { id: 'gather_feathers', name: 'Gather Feathers',  levelReq: 5,  duration: 5000,  xpReward: 14,  outputs: { feathers: 3 } },
    { id: 'grow_herbs',      name: 'Grow Herbs',       levelReq: 10, duration: 9000,  xpReward: 32,  outputs: { herbs: 1 } },
    { id: 'grow_mushrooms',  name: 'Grow Glow Shrooms',levelReq: 18, duration: 10000, xpReward: 50,  outputs: { glowing_mushroom: 1 } },
    { id: 'grow_toadflax',   name: 'Grow Toadflax',    levelReq: 25, duration: 12000, xpReward: 75,  outputs: { toadflax: 1 } },
    { id: 'grow_ranarr',     name: 'Grow Ranarr',      levelReq: 32, duration: 15000, xpReward: 110, outputs: { ranarr: 1 } },
    { id: 'grow_avantoe',    name: 'Grow Avantoe',     levelReq: 45, duration: 18000, xpReward: 160, outputs: { avantoe: 1 } },
    { id: 'grow_kwuarm',     name: 'Grow Kwuarm',      levelReq: 55, duration: 22000, xpReward: 220, outputs: { kwuarm: 1 } },
    { id: 'grow_cadantine',  name: 'Grow Cadantine',   levelReq: 70, duration: 28000, xpReward: 320, outputs: { cadantine: 1 } },
    // ---- Allotment crops (for cooking) ----
    { id: 'grow_potato',     name: 'Grow Potato',      levelReq: 2,  duration: 8000,  xpReward: 16,  outputs: { potato: 2 } },
    { id: 'grow_onion',      name: 'Grow Onion',       levelReq: 5,  duration: 8500,  xpReward: 20,  outputs: { onion: 2 } },
    { id: 'grow_cabbage',    name: 'Grow Cabbage',     levelReq: 7,  duration: 9500,  xpReward: 28,  outputs: { cabbage: 2 } },
    { id: 'grow_pumpkin',    name: 'Grow Pumpkin',     levelReq: 15, duration: 14000, xpReward: 55,  outputs: { pumpkin: 1 } },
    // ---- Fruit / tree crops (long grows, high yield) ----
    { id: 'grow_apple_tree', name: 'Grow Apple Tree',  levelReq: 30, duration: 25000, xpReward: 130, outputs: { apple: 4 } },
    { id: 'grow_watermelon', name: 'Grow Watermelon',  levelReq: 40, duration: 18000, xpReward: 150, outputs: { watermelon: 2 } },
    // ---- Endgame herbs (feed super potions) ----
    { id: 'grow_snapdragon', name: 'Grow Snapdragon',  levelReq: 38, duration: 18000, xpReward: 170, outputs: { snapdragon: 1 } },
    { id: 'grow_wildblood',  name: 'Grow Wildblood',   levelReq: 50, duration: 22000, xpReward: 230, outputs: { wildblood: 1 } },
    { id: 'grow_dwarf_weed', name: 'Grow Dwarf Weed',  levelReq: 65, duration: 28000, xpReward: 320, outputs: { dwarf_weed: 1 } },
    { id: 'grow_torstol',    name: 'Grow Torstol',     levelReq: 75, duration: 35000, xpReward: 450, outputs: { torstol: 1 } },
    { id: 'grow_spirit_herb',name: 'Grow Spirit Herb', levelReq: 88, duration: 50000, xpReward: 800, inputs: { bone_shard: 5, nature_rune: 3 }, outputs: { spirit_herb: 1 } },
    // ---- Poisonous crops (widens the poison supply chain) ----
    { id: 'grow_poison_ivy', name: 'Grow Poison Ivy',  levelReq: 28, duration: 14000, xpReward: 90,  outputs: { poison_vial_raw: 1, foraged_herb: 1 } },
    { id: 'grow_nightshade', name: 'Grow Deadly Nightshade', levelReq: 52, duration: 20000, xpReward: 200, outputs: { poison_vial_raw: 2, toadflax: 1 } },
  ],

  cooking: [
    { id: 'cook_shrimp',      name: 'Cook Shrimp',        levelReq: 1,  duration: 2000, xpReward: 30,  inputs: { raw_shrimp: 1 },   outputs: { cooked_shrimp: 1 } },
    { id: 'cook_sardine',     name: 'Cook Sardine',       levelReq: 1,  duration: 2000, xpReward: 40,  inputs: { raw_sardine: 1 },  outputs: { cooked_sardine: 1 } },
    { id: 'cook_trout',       name: 'Cook Trout',         levelReq: 15, duration: 2500, xpReward: 70,  inputs: { raw_trout: 1 },    outputs: { cooked_trout: 1 } },
    { id: 'bake_bread',       name: 'Bake Bread',         levelReq: 14, duration: 3000, xpReward: 40,  inputs: { flour: 2, vial_of_water: 1 }, outputs: { bread: 1 } },
    { id: 'cook_salmon',      name: 'Cook Salmon',        levelReq: 25, duration: 2800, xpReward: 90,  inputs: { raw_salmon: 1 },   outputs: { cooked_salmon: 1 } },
    { id: 'cook_tuna',        name: 'Cook Tuna',          levelReq: 30, duration: 3000, xpReward: 110, inputs: { raw_tuna: 1 },     outputs: { cooked_tuna: 1 } },
    { id: 'cook_lobster',     name: 'Cook Lobster',       levelReq: 40, duration: 3500, xpReward: 120, inputs: { raw_lobster: 1 },  outputs: { cooked_lobster: 1 } },
    { id: 'bake_meat_pie',    name: 'Bake Meat Pie',      levelReq: 42, duration: 4500, xpReward: 150, inputs: { flour: 2, bone_shard: 2, vial_of_water: 1 }, outputs: { meat_pie: 1 } },
    { id: 'cook_swordfish',   name: 'Cook Swordfish',     levelReq: 45, duration: 4000, xpReward: 140, inputs: { raw_swordfish: 1 },outputs: { cooked_swordfish: 1 } },
    { id: 'cook_monkfish',    name: 'Cook Monkfish',      levelReq: 62, duration: 4500, xpReward: 180, inputs: { raw_monkfish: 1 }, outputs: { cooked_monkfish: 1 } },
    { id: 'cook_stew',        name: 'Cook Hearty Stew',   levelReq: 70, duration: 6000, xpReward: 280, inputs: { raw_shark: 1, herbs: 2, vial_of_water: 1 }, outputs: { hearty_stew: 1 } },
    { id: 'cook_shark',       name: 'Cook Shark',         levelReq: 80, duration: 5000, xpReward: 210, inputs: { raw_shark: 1 },    outputs: { cooked_shark: 1 } },
    { id: 'cook_manta_ray',   name: 'Cook Manta Ray',     levelReq: 91, duration: 5500, xpReward: 260, inputs: { raw_manta_ray: 1 },outputs: { cooked_manta_ray: 1 } },
    { id: 'cook_anglerfish',  name: 'Cook Anglerfish',    levelReq: 92, duration: 5500, xpReward: 280, inputs: { raw_anglerfish: 1 },outputs: { cooked_anglerfish: 1 } },
    { id: 'cook_dark_crab',   name: 'Cook Dark Crab',     levelReq: 95, duration: 6000, xpReward: 320, inputs: { raw_dark_crab: 1 },outputs: { cooked_dark_crab: 1 } },
    // ---- Farming-cross baked goods ----
    { id: 'cook_apple_pie',   name: 'Bake Apple Pie',     levelReq: 22, duration: 3500, xpReward: 85,  inputs: { flour: 2, apple: 2, vial_of_water: 1 }, outputs: { apple_pie: 1 } },
    { id: 'cook_pumpkin_pie', name: 'Bake Pumpkin Pie',   levelReq: 48, duration: 5000, xpReward: 180, inputs: { flour: 2, pumpkin: 1, vial_of_water: 1 }, outputs: { pumpkin_pie: 1 } },
    { id: 'cook_watermelon_slice',name:'Slice Watermelon',levelReq: 35, duration: 2000, xpReward: 40, inputs: { watermelon: 1, knife: 1 }, outputs: { watermelon_slice: 2, knife: 1 } },
    { id: 'cook_cabbage_stew',name: 'Cook Cabbage Stew',  levelReq: 10, duration: 2800, xpReward: 50, inputs: { cabbage: 1, onion: 1, potato: 1, vial_of_water: 1 }, outputs: { cabbage_stew: 1 } },
    { id: 'cook_spicy_stew',  name: 'Cook Spicy Stew',    levelReq: 55, duration: 5500, xpReward: 220,inputs: { raw_monkfish: 1, kwuarm: 1, vial_of_water: 1 }, outputs: { spicy_stew: 1 } },
    { id: 'cook_rogue_stew',  name: 'Cook Rogue Stew',    levelReq: 40, duration: 4500, xpReward: 170,inputs: { raw_lobster: 1, foraged_herb: 2, poison_vial_raw: 1 }, outputs: { rogue_stew: 1 } },
    { id: 'brew_apple_cider', name: 'Brew Apple Cider',   levelReq: 22, duration: 4000, xpReward: 85, inputs: { apple: 3, vial_of_water: 2 }, outputs: { apple_cider: 1 } },
    { id: 'brew_divine_wine', name: 'Brew Divine Wine',   levelReq: 85, duration: 14000,xpReward: 620,inputs: { spirit_herb: 1, cadantine: 1, torstol: 1, vial_of_water: 3 }, outputs: { divine_wine: 1 } },
    { id: 'cook_karambwan',   name: 'Cook Karambwan',     levelReq: 65, duration: 4200, xpReward: 220,inputs: { raw_karambwan: 1 }, outputs: { cooked_karambwan: 1 } },
  ],

  // ============================================================
  // NEW SKILL: Runecrafting — essence + talismans → runes
  // Cross-wired into: Herblore (imbued potions), Smithing (chaos/death
  // forging + rune-etched weapons), Crafting (enchanted jewelry, staves,
  // graceful cape), Farming (spirit_herb), combat consumable scrolls.
  // ============================================================
  runecrafting: [
    { id: 'craft_air_rune',    name: 'Craft Air Runes',    levelReq: 1,  duration: 3500, xpReward: 12, inputs: { rune_essence: 1, air_talisman: 1 },   outputs: { air_rune: 5, air_talisman: 1 } },
    { id: 'craft_mind_rune',   name: 'Craft Mind Runes',   levelReq: 2,  duration: 3500, xpReward: 14, inputs: { rune_essence: 1, mind_talisman: 1 },  outputs: { mind_rune: 5, mind_talisman: 1 } },
    { id: 'craft_water_rune',  name: 'Craft Water Runes',  levelReq: 5,  duration: 3800, xpReward: 18, inputs: { rune_essence: 1, water_talisman: 1 }, outputs: { water_rune: 5, water_talisman: 1 } },
    { id: 'craft_earth_rune',  name: 'Craft Earth Runes',  levelReq: 9,  duration: 4000, xpReward: 22, inputs: { rune_essence: 1, earth_talisman: 1 }, outputs: { earth_rune: 5, earth_talisman: 1 } },
    { id: 'craft_fire_rune',   name: 'Craft Fire Runes',   levelReq: 14, duration: 4200, xpReward: 28, inputs: { rune_essence: 1, fire_talisman: 1 },  outputs: { fire_rune: 5, fire_talisman: 1 } },
    { id: 'craft_body_rune',   name: 'Craft Body Runes',   levelReq: 20, duration: 4600, xpReward: 36, inputs: { rune_essence: 1, body_talisman: 1 },  outputs: { body_rune: 4, body_talisman: 1 } },
    { id: 'craft_cosmic_rune', name: 'Craft Cosmic Runes', levelReq: 27, duration: 5000, xpReward: 50, inputs: { pure_essence: 1, cosmic_talisman: 1 }, outputs: { cosmic_rune: 3, cosmic_talisman: 1 } },
    { id: 'craft_chaos_rune',  name: 'Craft Chaos Runes',  levelReq: 35, duration: 5500, xpReward: 72, inputs: { pure_essence: 1, chaos_talisman: 1 },  outputs: { chaos_rune: 2, chaos_talisman: 1 } },
    { id: 'craft_nature_rune', name: 'Craft Nature Runes', levelReq: 44, duration: 6000, xpReward: 100,inputs: { pure_essence: 1, nature_talisman: 1 }, outputs: { nature_rune: 2, nature_talisman: 1 } },
    { id: 'craft_law_rune',    name: 'Craft Law Runes',    levelReq: 54, duration: 7000, xpReward: 140,inputs: { pure_essence: 1, law_talisman: 1 },    outputs: { law_rune: 2, law_talisman: 1 } },
    { id: 'craft_death_rune',  name: 'Craft Death Runes',  levelReq: 65, duration: 8500, xpReward: 200,inputs: { pure_essence: 1, death_talisman: 1 },  outputs: { death_rune: 1, death_talisman: 1 } },
    { id: 'craft_blood_rune',  name: 'Craft Blood Runes',  levelReq: 77, duration: 11000,xpReward: 310,inputs: { pure_essence: 1, blood_talisman: 1 },  outputs: { blood_rune: 1, blood_talisman: 1 } },
    { id: 'craft_soul_rune',   name: 'Craft Soul Runes',   levelReq: 90, duration: 15000,xpReward: 480,inputs: { pure_essence: 1, soul_talisman: 1 },   outputs: { soul_rune: 1, soul_talisman: 1 } },
    { id: 'craft_astral_rune', name: 'Craft Astral Rune',  levelReq: 95, duration: 22000,xpReward: 820,inputs: { soul_rune: 1, blood_rune: 1, death_rune: 1, cosmic_rune: 3 }, outputs: { astral_rune: 1 } },
    // ---- Combo runes (fuse 2 basic → 1 combo with boosted effect) ----
    { id: 'fuse_mist_rune',    name: 'Fuse Mist Rune',     levelReq: 6,  duration: 3500, xpReward: 20, inputs: { air_rune: 2, water_rune: 2 }, outputs: { mist_rune: 2 } },
    { id: 'fuse_dust_rune',    name: 'Fuse Dust Rune',     levelReq: 10, duration: 3500, xpReward: 26, inputs: { air_rune: 2, earth_rune: 2 }, outputs: { dust_rune: 2 } },
    { id: 'fuse_mud_rune',     name: 'Fuse Mud Rune',      levelReq: 13, duration: 4000, xpReward: 32, inputs: { water_rune: 2, earth_rune: 2 },outputs: { mud_rune: 2 } },
    { id: 'fuse_smoke_rune',   name: 'Fuse Smoke Rune',    levelReq: 15, duration: 4000, xpReward: 36, inputs: { fire_rune: 2, air_rune: 2 },   outputs: { smoke_rune: 2 } },
    { id: 'fuse_steam_rune',   name: 'Fuse Steam Rune',    levelReq: 19, duration: 4500, xpReward: 44, inputs: { fire_rune: 2, water_rune: 2 }, outputs: { steam_rune: 2 } },
    { id: 'fuse_lava_rune',    name: 'Fuse Lava Rune',     levelReq: 23, duration: 4500, xpReward: 52, inputs: { fire_rune: 2, earth_rune: 2 }, outputs: { lava_rune: 2 } },
    // ---- Combat scrolls scribed from runes ----
    { id: 'scribe_fireball',   name: 'Scribe Fireball Scroll',   levelReq: 40, duration: 8000, xpReward: 220, inputs: { fire_rune: 50, chaos_rune: 20 }, outputs: { scroll_fireball: 1 } },
    { id: 'scribe_mending',    name: 'Scribe Mending Scroll',    levelReq: 55, duration: 10000,xpReward: 320, inputs: { blood_rune: 40, body_rune: 20 }, outputs: { scroll_bone_heal: 1 } },
    { id: 'scribe_soul_barrier',name:'Scribe Soul Barrier Scroll',levelReq: 70, duration: 14000,xpReward: 460, inputs: { soul_rune: 30, law_rune: 30 }, outputs: { scroll_soul_barrier: 1 } },
    { id: 'scribe_astral',     name: 'Scribe Astral Scroll',     levelReq: 85, duration: 18000,xpReward: 700, inputs: { astral_rune: 1, cosmic_rune: 40 }, outputs: { scroll_astral: 1 } },
  ],

  // ============================================================
  // NEW SKILL: Thieving — steal coins, silk, poisons, rare trinkets.
  // Feeds: Crafting (silk_fine, rogue outfit), Herblore (poisons),
  // Cooking (foraged_herb, rogue_stew), Runecrafting (soul_gem).
  // ============================================================
  thieving: [
    { id: 'pickpocket_man',    name: 'Pickpocket Villager',levelReq: 1,  duration: 4000, xpReward: 14, outputs: { gold_nugget: 1, silk_scraps: 1 } },
    { id: 'forage_woods',      name: 'Forage the Woods',   levelReq: 8,  duration: 5000, xpReward: 22, outputs: { foraged_herb: 2, feathers: 1 } },
    { id: 'rob_stall',         name: 'Rob Market Stall',   levelReq: 5,  duration: 4500, xpReward: 18, outputs: { gold_nugget: 2, foraged_herb: 1 } },
    { id: 'pickpocket_farmer', name: 'Pickpocket Farmer',  levelReq: 15, duration: 6000, xpReward: 36, outputs: { gold_nugget: 3, wheat: 1, feathers: 2 } },
    { id: 'pickpocket_guard',  name: 'Pickpocket Guard',   levelReq: 25, duration: 7500, xpReward: 60, outputs: { gold_nugget: 5, silk_scraps: 2, stolen_key: 1 } },
    { id: 'distill_poison',    name: 'Distill Poison',     levelReq: 30, duration: 5500, xpReward: 75, inputs: { poison_vial_raw: 3, herbs: 2, vial_of_water: 1 }, outputs: { poison_vial: 1 } },
    { id: 'crack_chest',       name: 'Crack Locked Chest', levelReq: 35, duration: 9000, xpReward: 120,inputs: { stolen_key: 1, lockpick: 1 }, outputs: { gold_nugget: 10, jewel_case: 1, poison_vial_raw: 1, lockpick: 1 } },
    { id: 'pickpocket_noble',  name: 'Pickpocket Noble',   levelReq: 45, duration: 10000,xpReward: 160, outputs: { gold_nugget: 15, gold_trinket: 1, silk_fine: 1 } },
    { id: 'pickpocket_paladin',name: 'Pickpocket Paladin', levelReq: 55, duration: 12000,xpReward: 220, outputs: { gold_nugget: 22, silk_fine: 1, jewel_case: 1 } },
    { id: 'heist_manor',       name: 'Heist the Manor',    levelReq: 65, duration: 15000,xpReward: 320, inputs: { lockpick: 1, stolen_key: 1 }, outputs: { gold_nugget: 50, blood_diamond: 1, jewel_case: 1, lockpick: 1 } },
    { id: 'shadow_vault',      name: 'Raid Shadow Vault',  levelReq: 75, duration: 20000,xpReward: 480, inputs: { lockpick: 1, stolen_key: 2 }, outputs: { gold_nugget: 90, soul_gem: 1, stolen_scroll: 1, lockpick: 1 } },
    { id: 'dragon_den',        name: "Rob Dragon's Den",   levelReq: 88, duration: 32000,xpReward: 820, outputs: { gold_nugget: 180, dragon_hoard_scrap: 1, dragon_scale: 1 } },
  ],

  // ============================================================
  // NEW SKILL: Agility — training-ground skill. Produces Marks of
  // Grace (→ Graceful gear), Stamina Herbs (→ Herblore), and
  // Shortcut Tokens (future: dungeon shortcuts). Grace gear reduces
  // party food consumption; stamina boosts move speed.
  // ============================================================
  agility: [
    { id: 'basic_course',      name: 'Basic Obstacle Course', levelReq: 1,  duration: 6000, xpReward: 20,  outputs: { marks_of_grace: 1 } },
    { id: 'forest_course',     name: 'Forest Course',         levelReq: 10, duration: 8000, xpReward: 45,  outputs: { marks_of_grace: 2, stamina_herb: 1 } },
    { id: 'cliffside_course',  name: 'Cliffside Course',      levelReq: 25, duration: 10500,xpReward: 85,  outputs: { marks_of_grace: 3, stamina_herb: 2 } },
    { id: 'rooftop_thieves',   name: 'Rooftop Thieves Run',   levelReq: 35, duration: 12000,xpReward: 130, outputs: { marks_of_grace: 5, shortcut_token: 1 } },
    { id: 'canyon_jump',       name: 'Canyon Jump Circuit',   levelReq: 50, duration: 14000,xpReward: 200, outputs: { marks_of_grace: 7, stamina_herb: 3, shortcut_token: 1 } },
    { id: 'shadow_runs',       name: 'Shadow Runs',           levelReq: 70, duration: 18000,xpReward: 340, outputs: { marks_of_grace: 10, shortcut_token: 2, stamina_herb: 5 } },
    { id: 'spirit_leap',       name: 'Spirit Leap',           levelReq: 85, duration: 25000,xpReward: 560, outputs: { marks_of_grace: 15, mastery_mark: 1 } },
    { id: 'ascendance_trial',  name: 'Ascendance Trial',      levelReq: 95, duration: 40000,xpReward: 1100,inputs: { shortcut_token: 5 }, outputs: { mastery_mark: 3, marks_of_grace: 25 } },
  ],
};

function hasRequiredInputs(state: GameState, inputs?: Record<string, number>): boolean {
  if (!inputs) return true;
  for (const [itemId, qty] of Object.entries(inputs)) {
    if (qty > 0 && (state.stash.items[itemId] || 0) < qty) return false;
  }
  return true;
}

export function xpForLevel(level: number): number {
  // Simple cubic — lvl 2 ≈ 100xp, lvl 99 ≈ 12M.
  if (level <= 1) return 0;
  return Math.floor(0.25 * Math.pow(level, 3) * 50);
}

export function tickSkilling(state: GameState, dt: number) {
  if (!state.town || !state.town.workers) return;

  for (const worker of state.town.workers) {
    if (!worker.activeTask) continue;
    const task = worker.activeTask;
    const defs = SKILL_ACTIONS[task.skillId] || [];
    const actionDef = defs.find(d => d.id === task.actionId);

    if (!actionDef) {
      worker.activeTask = undefined;
      continue;
    }
    if (!hasRequiredInputs(state, actionDef.inputs)) {
      if (task.autoRepeat) {
        // Idle, don't accrue progress, don't drop the assignment. The UI
        // shows a "waiting for materials" indicator via task.stalled.
        task.stalled = true;
        continue;
      }
      pushLog(state, 'system', `${worker.name} ran out of materials for ${actionDef.name}.`);
      worker.activeTask = undefined;
      continue;
    }
    task.stalled = false;

    const bonuses = getSkillBonuses(state.skills[task.skillId]?.level || 1);
    // task.duration starts at the action's base ms; once a cycle fires we
    // pin it to the level-scaled cycleMs so the UI progress bar tracks
    // the real pace and re-tunes when the worker levels up.
    const baseDuration = actionDef.duration;
    // Specialization: a worker's dominant skill (most cycles run) shaves
    // an extra 8% off cycle time on that skill only. Encourages keeping
    // a worker on the same skill instead of shuffling them every action.
    const dom = dominantSkill(worker);
    const specMul = dom === task.skillId ? 0.92 : 1;
    const cycleMs = Math.max(200, baseDuration * bonuses.speedMul * specMul);
    task.duration = cycleMs;

    task.progress += dt;
    while (task.progress >= cycleMs) {
      task.progress -= cycleMs;

      if (actionDef.inputs) {
        const skip = bonuses.skipChance > 0 && Math.random() < bonuses.skipChance;
        if (!skip) {
          for (const [id, qty] of Object.entries(actionDef.inputs)) {
            if (qty > 0) removeFromStash(state, id, qty);
          }
        }
      }
      if (actionDef.outputs) {
        const totalDoubleChance = bonuses.doubleChance + capeBonusForSkill(state, task.skillId);
        const doubled = totalDoubleChance > 0 && Math.random() < totalDoubleChance;
        const mult = doubled ? 2 : 1;
        for (const [id, qty] of Object.entries(actionDef.outputs)) {
          addToStash(state, id, qty * mult);
        }
      }
      if (bonuses.masterDrop > 0 && Math.random() < bonuses.masterDrop) {
        addToStash(state, 'mastery_mark', 1);
      }

      // Track this cycle for worker specialization.
      worker.cyclesPerSkill ||= {};
      worker.cyclesPerSkill[task.skillId] = (worker.cyclesPerSkill[task.skillId] ?? 0) + 1;

      // Mass-craft countdown: stop once the requested number of cycles
      // has been produced.
      if (typeof task.repeatRemaining === 'number' && task.repeatRemaining > 0) {
        task.repeatRemaining--;
        if (task.repeatRemaining <= 0) {
          pushLog(state, 'system', `${worker.name} finished the requested batch of ${actionDef.name}.`);
          worker.activeTask = undefined;
          break;
        }
      }

      const town = townBonuses(totalSkillLevel(state));
      awardSkillXp(state, task.skillId, Math.floor(actionDef.xpReward * bonuses.xpMul * town.xpMul));

      if (!hasRequiredInputs(state, actionDef.inputs)) {
        if (task.autoRepeat) {
          task.stalled = true;
          break;
        }
        pushLog(state, 'system', `${worker.name} ran out of materials for ${actionDef.name}.`);
        worker.activeTask = undefined;
        break;
      }
    }
  }
}

// Effective duration for display — applied milestone speed bonus per skill.
export function effectiveDuration(state: GameState, skillId: SkillId, baseDuration: number): number {
  const lvl = state.skills[skillId]?.level || 1;
  return Math.max(200, baseDuration * getSkillBonuses(lvl).speedMul);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
