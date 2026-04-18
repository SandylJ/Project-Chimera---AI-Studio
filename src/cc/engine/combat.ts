import { Hero, MonsterInstance, GameState, Ability, AbilityEffect, Tile, Stats, StatKey } from '../types';
import { MONSTERS } from '../data/monsters';
import { ABILITIES } from '../data/abilities';
import {
  effectiveStats, totalArmor, weaponPower, heroAttackIntervalMs, monsterAttackIntervalMs,
  aliveActiveHeroes, pushLog, mkId, rollChance,
} from './util';
import { rollMonsterLoot } from './loot';
import { awardXp } from './progression';

export interface CombatContext {
  tile: Tile;
  heroes: Hero[]; // active heroes in battle
  monsters: MonsterInstance[];
}

export function tickCombat(state: GameState, dt: number): void {
  const dungeon = state.activeDungeon;
  if (!dungeon) return;
  const tile = currentTile(state);
  if (!tile?.encounter) return;
  const heroes = aliveActiveHeroes(state);
  if (heroes.length === 0) return;

  // Tick hero buff expiries + cooldowns + attack timer
  for (const h of heroes) {
    // buff decay
    h.buffs = h.buffs.filter(b => {
      b.remaining -= dt;
      return b.remaining > 0;
    });
    // cooldowns
    for (const k of Object.keys(h.cooldowns)) {
      h.cooldowns[k] = Math.max(0, h.cooldowns[k] - dt);
    }
    h.attackTimer = Math.max(0, h.attackTimer - dt);
  }

  // Tick monster DoTs, stuns, timers
  for (const m of tile.encounter.monsters) {
    if (m.hp <= 0) continue;
    m.stunRemaining = Math.max(0, m.stunRemaining - dt);
    m.attackTimer = Math.max(0, m.attackTimer - dt);
    for (const dot of m.dots) {
      dot.remaining = Math.max(0, dot.remaining - dt);
      dot.nextTick -= dt;
      if (dot.nextTick <= 0 && m.hp > 0) {
        const dmg = Math.max(1, Math.floor(dot.dmg));
        m.hp -= dmg;
        dot.nextTick = dot.tick;
      }
    }
    m.dots = m.dots.filter(d => d.remaining > 0);
    if (m.hp <= 0) onMonsterKilled(state, m);
  }

  // HERO ACTIONS
  for (const hero of heroes) {
    if (hero.state !== 'alive') continue;
    if (hero.attackTimer > 0) continue;
    // Try abilities first
    const used = tryUseAbility(state, hero, tile);
    if (!used) {
      // Basic attack
      const target = pickLowestHpEnemy(tile);
      if (target) {
        const dmg = heroBasicAttackDamage(hero);
        applyDamageToMonster(state, target, dmg, hero.name);
      }
    }
    hero.attackTimer = heroAttackIntervalMs(hero);
  }

  // MONSTER ACTIONS
  for (const m of tile.encounter.monsters) {
    if (m.hp <= 0) continue;
    if (m.stunRemaining > 0) continue;
    if (m.attackTimer > 0) continue;
    const def = MONSTERS[m.monsterId];
    if (!def) continue;
    // Target a random alive hero (weighted toward taunt-holders — simplified: active shield = taunt)
    const targets = aliveActiveHeroes(state);
    if (targets.length === 0) return;
    const taunters = targets.filter(t => t.shield > 0);
    const target = taunters.length > 0
      ? taunters[Math.floor(Math.random() * taunters.length)]
      : targets[Math.floor(Math.random() * targets.length)];
    const rawDmg = def.damage;
    const defStats = effectiveStats(target);
    const armor = totalArmor(target);
    const reduction = armor * 0.4 + defStats.con * 0.3;
    let dmg = Math.max(1, Math.floor(rawDmg - reduction));
    applyDamageToHero(state, target, dmg);
    m.attackTimer = monsterAttackIntervalMs(def);
  }

  // Clean kills
  tile.encounter.monsters = tile.encounter.monsters.filter(m => m.hp > 0);
  if (tile.encounter.monsters.length === 0) {
    tile.cleared = true;
    delete tile.encounter;
  }
}

// ============ Ability casting ============

function tryUseAbility(state: GameState, hero: Hero, tile: Tile): boolean {
  // Walk hero.abilities, pick highest-priority usable
  const enemies = tile.encounter?.monsters ?? [];
  if (enemies.length === 0) return false;
  const sorted = [...hero.abilities].sort((a, b) => {
    const A = ABILITIES[a]; const B = ABILITIES[b];
    return (B?.levelReq ?? 0) - (A?.levelReq ?? 0);
  });
  for (const abId of sorted) {
    const ab = ABILITIES[abId];
    if (!ab) continue;
    if ((hero.cooldowns[abId] ?? 0) > 0) continue;
    if (hero.mp < ab.manaCost) continue;
    // Healer only uses heal if ally below threshold
    const heals = ab.effects.some(e => e.kind === 'heal');
    if (heals && !anyAllyWounded(state, 0.7)) continue;
    const cast = castAbility(state, hero, ab, tile);
    if (cast) return true;
  }
  return false;
}

function castAbility(state: GameState, hero: Hero, ab: Ability, tile: Tile): boolean {
  const enemies = tile.encounter?.monsters ?? [];
  const stats = effectiveStats(hero);
  hero.mp -= ab.manaCost;
  hero.cooldowns[ab.id] = ab.cooldown;

  // Resolve target(s) per targeting
  let targets: MonsterInstance[] = [];
  let allies: Hero[] = [];
  switch (ab.targeting) {
    case 'highest_hp_enemy':
      targets = enemies.length ? [enemies.reduce((a, b) => a.hp > b.hp ? a : b)] : [];
      break;
    case 'lowest_hp_enemy':
      targets = enemies.length ? [enemies.reduce((a, b) => a.hp < b.hp ? a : b)] : [];
      break;
    case 'random_enemy':
      targets = enemies.length ? [enemies[Math.floor(Math.random() * enemies.length)]] : [];
      break;
    case 'all_enemies':
      targets = enemies.slice();
      break;
    case 'lowest_hp_ally': {
      const pool = aliveActiveHeroes(state).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
      allies = pool.length ? [pool[0]] : [];
      break;
    }
    case 'all_allies':
      allies = aliveActiveHeroes(state);
      break;
    case 'self':
      allies = [hero];
      break;
  }

  for (const eff of ab.effects) {
    applyEffect(state, hero, stats, eff, ab, targets, allies);
  }

  pushLog(state, 'combat', `${hero.name} casts ${ab.name} ${ab.icon}`, undefined);
  return true;
}

function applyEffect(
  state: GameState,
  caster: Hero,
  stats: Stats,
  eff: AbilityEffect,
  ab: Ability,
  targets: MonsterInstance[],
  allies: Hero[],
): void {
  const scalingValue = stats[eff.scaling];
  const base = eff.flat ? eff.power : eff.power * scalingValue;
  switch (eff.kind) {
    case 'damage':
    case 'aoe_damage': {
      for (const m of targets) {
        if (m.hp <= 0) continue;
        let dmg = Math.max(1, Math.floor(base));
        // crit
        if (rollChance(0.05 + stats.luck * 0.01)) {
          dmg = Math.floor(dmg * 1.6);
        }
        applyDamageToMonster(state, m, dmg, caster.name);
      }
      break;
    }
    case 'heal': {
      for (const a of allies) {
        if (a.state !== 'alive') continue;
        const amt = Math.floor(base);
        const before = a.hp;
        a.hp = Math.min(a.maxHp, a.hp + amt);
        const healed = a.hp - before;
        if (healed > 0) {
          pushLog(state, 'heal', `${caster.name} heals ${a.name} +${healed}`);
        }
      }
      break;
    }
    case 'shield': {
      for (const a of allies) {
        a.shield = (a.shield || 0) + Math.floor(base);
      }
      break;
    }
    case 'stun': {
      for (const m of targets) {
        m.stunRemaining = Math.max(m.stunRemaining, eff.duration ?? 1000);
      }
      break;
    }
    case 'dot': {
      for (const m of targets) {
        m.dots.push({
          id: mkId('dot'),
          remaining: eff.duration ?? 4000,
          tick: eff.tick ?? 1000,
          nextTick: eff.tick ?? 1000,
          dmg: base,
        });
      }
      break;
    }
    case 'buff': {
      for (const a of allies) {
        a.buffs.push({
          id: mkId('buff'),
          stat: eff.stat ?? 'str',
          power: eff.power,
          remaining: eff.duration ?? 8000,
        });
      }
      break;
    }
    case 'taunt':
    case 'cleave':
    case 'debuff':
      // reserved for future
      break;
  }
}

// ============ Damage resolution ============

export function heroBasicAttackDamage(hero: Hero): number {
  const stats = effectiveStats(hero);
  const weapon = weaponPower(hero);
  // Physical class = str, magic class = int, dex for rogue/ranger
  const scalingStat = scalingStatFor(hero);
  const scale = stats[scalingStat];
  const base = weapon + scale * 1.2;
  let dmg = Math.floor(base);
  if (rollChance(0.05 + stats.luck * 0.008)) dmg = Math.floor(dmg * 1.7);
  return Math.max(1, dmg);
}

function scalingStatFor(hero: Hero): StatKey {
  switch (hero.classId) {
    case 'mage':
    case 'priest':
      return 'int';
    case 'rogue':
    case 'ranger':
      return 'dex';
    default:
      return 'str';
  }
}

export function applyDamageToMonster(state: GameState, m: MonsterInstance, rawDmg: number, attackerName: string): void {
  const def = MONSTERS[m.monsterId];
  const armor = def ? def.defense : 0;
  const dmg = Math.max(1, Math.floor(rawDmg - armor * 0.4));
  m.hp -= dmg;
  if (m.hp <= 0) {
    m.hp = 0;
    onMonsterKilled(state, m);
  }
}

export function applyDamageToHero(state: GameState, hero: Hero, dmg: number): void {
  let remaining = dmg;
  if (hero.shield > 0) {
    const absorbed = Math.min(hero.shield, remaining);
    hero.shield -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) {
    hero.hp -= remaining;
  }
  if (hero.hp <= 0) {
    hero.hp = 0;
    hero.state = 'downed'; // can be revived at temple; not permadead for now
    pushLog(state, 'death', `💀 ${hero.name} falls!`);
  }
}

export function onMonsterKilled(state: GameState, m: MonsterInstance): void {
  const def = MONSTERS[m.monsterId];
  if (!def) return;
  state.totalMonstersKilled++;
  // XP: split evenly across alive heroes in encounter
  const alive = aliveActiveHeroes(state);
  if (alive.length > 0) {
    const xpEach = Math.ceil(def.xpReward / alive.length);
    for (const h of alive) awardXp(state, h, xpEach);
  }
  // Loot
  const luck = alive.reduce((acc, h) => acc + effectiveStats(h).luck, 0) * 0.003;
  rollMonsterLoot(state, def, luck);
  pushLog(state, 'combat', `${def.icon} ${def.name} defeated!`);
}

// ============ Helpers ============

export function currentTile(state: GameState): Tile | undefined {
  const d = state.activeDungeon;
  if (!d) return undefined;
  return d.tiles.find(t => t.x === d.partyPos.x && t.y === d.partyPos.y);
}

function pickLowestHpEnemy(tile: Tile): MonsterInstance | undefined {
  const m = tile.encounter?.monsters ?? [];
  if (m.length === 0) return undefined;
  return m.reduce((a, b) => a.hp < b.hp ? a : b);
}

function anyAllyWounded(state: GameState, threshold: number): boolean {
  return aliveActiveHeroes(state).some(h => h.hp / h.maxHp < threshold);
}
