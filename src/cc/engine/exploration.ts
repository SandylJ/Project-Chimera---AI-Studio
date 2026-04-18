import { GameState, Tile, Dungeon, Hero } from '../types';
import {
  pushLog, aliveActiveHeroes, mkId, rngInt, rollChance, effectiveStats,
} from './util';
import { rollChestLoot, rollBossLoot } from './loot';
import { currentTile } from './combat';
import { DUNGEON_DEFS } from '../data/dungeons';
import { triggerDecision } from './decisions';

const BASE_MOVE_MS = 3500;

export function tickExploration(state: GameState, dt: number): void {
  const dungeon = state.activeDungeon;
  if (!dungeon || dungeon.status !== 'active') return;
  const tile = currentTile(state);
  if (!tile) return;

  // If tile has encounter, combat is handling it — don't move.
  if (tile.encounter && tile.encounter.monsters.length > 0) return;

  // If tile not yet resolved (just arrived), resolve it now.
  if (!tile.cleared) {
    resolveTile(state, tile);
    // after resolution some tiles trigger a decision that pauses movement
    if (state.activeDecision) return;
    tile.cleared = true;
  }

  // Check victory / retreat conditions
  if (dungeon.status !== 'active') return;
  if (tile.kind === 'boss' && tile.cleared) {
    dungeon.status = 'victory';
    onDungeonVictory(state);
    return;
  }

  // Check wipe
  const alive = aliveActiveHeroes(state);
  if (alive.length === 0) {
    dungeon.status = 'wipe';
    onPartyWipe(state);
    return;
  }

  // Low HP auto-retreat (no healer, party avg HP < 25%)
  const avgRatio = alive.reduce((a, h) => a + h.hp / h.maxHp, 0) / alive.length;
  const hasHealer = alive.some(h => h.classId === 'priest' && h.mp >= 8);
  if (avgRatio < 0.25 && !hasHealer) {
    dungeon.status = 'retreat';
    pushLog(state, 'retreat', '🚪 Party retreats to town to recover!');
    onReturnToTown(state);
    return;
  }

  // Advance move timer
  dungeon.moveTimer -= dt;
  if (dungeon.moveTimer > 0) return;

  // Pick next tile along path to boss
  const next = findNextMoveTile(dungeon);
  if (!next) return;

  dungeon.partyPos = { x: next.x, y: next.y };
  const nt = tileAt(dungeon, next.x, next.y);
  nt.revealed = true;
  revealNeighbors(dungeon, next.x, next.y);
  dungeon.moveTimer = BASE_MOVE_MS;
  pushLog(state, 'move', `Party advances to ${kindLabel(nt.kind)} [${next.x},${next.y}]`);
}

function findNextMoveTile(d: Dungeon): { x: number; y: number } | undefined {
  // advance along pre-planned path
  const nextIdx = d.pathIndex + 1;
  if (nextIdx >= d.path.length) return undefined;
  const next = d.path[nextIdx];
  d.pathIndex = nextIdx;
  return next;
}

function tileAt(d: Dungeon, x: number, y: number): Tile {
  return d.tiles[y * d.width + x];
}

function revealNeighbors(d: Dungeon, x: number, y: number): void {
  for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= d.width || ny >= d.height) continue;
    tileAt(d, nx, ny).revealed = true;
  }
}

export function resolveTile(state: GameState, tile: Tile): void {
  const dungeon = state.activeDungeon!;
  const alive = aliveActiveHeroes(state);
  switch (tile.kind) {
    case 'monster':
      // Encounter already populated — combat tick will handle it.
      return;
    case 'chest': {
      const rogue = alive.find(h => h.classId === 'rogue');
      const tier = DUNGEON_DEFS[dungeon.defId].minLevel;
      rollChestLoot(state, tier + dungeon.floor * 2, !!rogue);
      pushLog(state, 'loot', rogue ? '🗝️ Rogue picks the chest clean!' : '📦 Chest opens!');
      break;
    }
    case 'trap': {
      const rogue = alive.find(h => h.classId === 'rogue');
      if (rogue && rollChance(0.7)) {
        pushLog(state, 'system', `🧤 ${rogue.name} disarms the trap!`);
      } else {
        const dmg = 10 + Math.floor(dungeon.floor * 8 + DUNGEON_DEFS[dungeon.defId].minLevel * 2);
        for (const h of alive) {
          h.hp = Math.max(1, h.hp - Math.floor(dmg * (0.6 + Math.random() * 0.5)));
        }
        pushLog(state, 'system', `⚠ Trap! Party takes damage.`);
      }
      break;
    }
    case 'shrine': {
      for (const h of alive) {
        h.hp = h.maxHp;
        h.mp = h.maxMp;
      }
      pushLog(state, 'heal', '⛩️ Shrine restores the party fully!');
      break;
    }
    case 'fountain':
      triggerDecision(state, 'fountain');
      return; // don't mark cleared yet
    case 'fork':
      triggerDecision(state, 'fork');
      return;
    case 'merchant':
      triggerDecision(state, 'merchant');
      return;
    case 'boss':
      // Encounter already populated in dungeonGen.
      return;
    case 'entrance':
      return;
    case 'empty':
    case 'exit':
    default:
      return;
  }
}

function kindLabel(kind: Tile['kind']): string {
  switch (kind) {
    case 'monster': return 'enemies';
    case 'chest': return 'a chest';
    case 'trap': return 'a trap';
    case 'shrine': return 'a shrine';
    case 'fountain': return 'a fountain';
    case 'fork': return 'a fork in the path';
    case 'merchant': return 'a merchant';
    case 'boss': return 'the boss chamber';
    case 'entrance': return 'the entrance';
    default: return 'a tile';
  }
}

export function onDungeonVictory(state: GameState): void {
  const d = state.activeDungeon!;
  const def = DUNGEON_DEFS[d.defId];
  pushLog(state, 'victory', `🏆 ${def.name} cleared (floor ${d.floor})!`, 'legendary');
  state.dungeonsCompleted[d.defId] = Math.max(state.dungeonsCompleted[d.defId] ?? 0, d.floor);
  // Boss loot (resolved in combat.onMonsterKilled was basic; add guaranteed + essence here)
  // We look up the boss monster def to award essence + guaranteed loot.
  // (Basic loot already rolled on kill.)
  // Small bump: add guaranteed item & essence.
  const monsterDef = { id: def.bossId } as any;
  // Just use rollBossLoot with zero rolls for loot (basic was already done), but we want essence + guaranteed.
  // Implementation: call rollBossLoot but note it also adds its own rolls — so we'll just do essence + guaranteed directly.
  state.stash.essence += def.rewards.essenceOnBoss;
  if (def.rewards.guaranteedLoot) {
    const itemId = def.rewards.guaranteedLoot;
    state.stash.items[itemId] = (state.stash.items[itemId] ?? 0) + 1;
    if (!state.collectionLog.includes(itemId)) state.collectionLog.push(itemId);
    pushLog(state, 'loot', `🎖 Guaranteed drop: ${itemId}`, 'rare');
  }
  // Unlock next dungeon
  unlockNextDungeon(state, def.id);
  onReturnToTown(state);
}

export function onPartyWipe(state: GameState): void {
  pushLog(state, 'death', '☠ THE PARTY HAS FALLEN. Carried back to town, barely breathing.');
  // Penalty: all downed heroes remain downed (must be revived at temple), or take gold hit
  const penalty = Math.floor(state.stash.gold * 0.2);
  state.stash.gold = Math.max(0, state.stash.gold - penalty);
  pushLog(state, 'system', `💸 -${penalty} gp lost in the retreat.`);
  onReturnToTown(state);
}

export function onReturnToTown(state: GameState): void {
  state.activeDungeon = undefined;
  // revive lightly — downed heroes come back at 20% HP (dead stay dead, need temple)
  for (const h of state.heroes) {
    if (h.state === 'downed') {
      h.state = 'alive';
      h.hp = Math.max(1, Math.floor(h.maxHp * 0.2));
      h.mp = Math.max(0, Math.floor(h.maxMp * 0.2));
    }
  }
}

function unlockNextDungeon(state: GameState, currentId: string): void {
  const idx = Object.keys(DUNGEON_DEFS).indexOf(currentId);
  const order = Object.keys(DUNGEON_DEFS);
  if (idx >= 0 && idx < order.length - 1) {
    const next = order[idx + 1];
    if (!state.unlockedDungeons.includes(next)) {
      state.unlockedDungeons.push(next);
      pushLog(state, 'system', `🗺️ Unlocked: ${DUNGEON_DEFS[next].name}!`, 'legendary');
    }
  }
}
