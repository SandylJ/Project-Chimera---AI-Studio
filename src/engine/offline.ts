import { GameState, OfflineReport } from '../types';
import { pushLog } from './util';

const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000; // 8h

// Very simple offline sim: estimate tiles cleared during away time and apply batch rewards.
// Does NOT advance combat tick-for-tick (that would be expensive).
export function simulateOffline(state: GameState, awayMs: number): OfflineReport | undefined {
  const dt = Math.min(awayMs, MAX_OFFLINE_MS);
  if (dt < 30_000) return undefined; // under 30s, don't bother
  if (!state.activeDungeon) {
    // no dungeon to advance — just return the idle report
    return {
      duration: dt,
      tilesCleared: 0,
      monstersKilled: 0,
      xpGained: 0,
      goldGained: 0,
      itemsFound: 0,
    };
  }

  // Assume 8s per tile on average (move + light combat)
  const tilesCleared = Math.floor(dt / 8000);
  const estMonsters = Math.floor(tilesCleared * 1.3);
  const avgGold = 15;
  const avgXp = 30;

  const goldGained = estMonsters * avgGold;
  const xpGained = estMonsters * avgXp;

  state.stash.gold += goldGained;
  state.totalGoldEarned += goldGained;

  // Distribute xp
  const heroes = state.heroes.filter(h => !h.bench && h.state !== 'dead');
  if (heroes.length > 0) {
    const xpEach = Math.floor(xpGained / heroes.length);
    for (const h of heroes) {
      h.xp += xpEach;
      // don't bother with full level-up loop; give them the XP, they can level next real tick
    }
  }

  state.totalMonstersKilled += estMonsters;

  pushLog(state, 'system', `💤 Offline: ${tilesCleared} tiles, ${estMonsters} kills, +${goldGained} gp`);

  return {
    duration: dt,
    tilesCleared,
    monstersKilled: estMonsters,
    xpGained,
    goldGained,
    itemsFound: 0,
  };
}
