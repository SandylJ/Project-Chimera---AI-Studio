import { Hero, GameState } from '../types';
import { CLASSES } from '../data/classes';
import { CLASS_ABILITY_TREE } from '../data/abilities';
import { pushLog, xpForLevel, recomputeHeroMaxHPMP } from './util';

export function awardXp(state: GameState, hero: Hero, xp: number): void {
  if (hero.state === 'dead') return;
  hero.xp += xp;
  while (hero.xp >= xpForLevel(hero.level)) {
    hero.xp -= xpForLevel(hero.level);
    levelUp(state, hero);
  }
}

export function levelUp(state: GameState, hero: Hero): void {
  hero.level++;
  const c = CLASSES[hero.classId];
  hero.baseStats.str += c.statGrowth.str;
  hero.baseStats.dex += c.statGrowth.dex;
  hero.baseStats.int += c.statGrowth.int;
  hero.baseStats.con += c.statGrowth.con;
  hero.baseStats.spd += c.statGrowth.spd;
  hero.baseStats.luck += c.statGrowth.luck;
  // Round small growth
  hero.baseStats.str = Math.round(hero.baseStats.str * 10) / 10;
  hero.baseStats.dex = Math.round(hero.baseStats.dex * 10) / 10;
  hero.baseStats.int = Math.round(hero.baseStats.int * 10) / 10;
  hero.baseStats.con = Math.round(hero.baseStats.con * 10) / 10;
  hero.baseStats.spd = Math.round(hero.baseStats.spd * 10) / 10;
  hero.baseStats.luck = Math.round(hero.baseStats.luck * 10) / 10;
  hero.abilityPoints++;
  recomputeHeroMaxHPMP(hero);
  // full heal on level up
  hero.hp = hero.maxHp;
  hero.mp = hero.maxMp;
  pushLog(state, 'level', `⬆ ${hero.name} reached level ${hero.level}! (+1 Ability Point)`);
  // Auto-learn available abilities the class has at this level and hero hasn't learned yet
  const tree = CLASS_ABILITY_TREE[hero.classId] ?? [];
  for (const abId of tree) {
    // ABILITIES import from within engine would be circular — keep this simple and let the UI handle unlock.
    // (Player spends ability points manually, but starting ones are auto-unlocked at creation.)
    if (!hero.abilities.includes(abId)) {
      // ability auto-offered via ability points — do nothing here
    }
  }
}

export function xpToNext(hero: Hero): number {
  return xpForLevel(hero.level);
}
