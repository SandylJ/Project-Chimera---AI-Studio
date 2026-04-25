import { GameState, Tile, Dungeon } from '../types';
import {
  pushLog, aliveActiveHeroes, rollChance,
} from './util';
import { rollChestLoot } from './loot';
import { currentTile } from './combat';
import { DUNGEON_DEFS } from '../data/dungeons';
import { triggerDecision } from './decisions';

const BASE_MOVE_MS = 3500;

export function tickExploration(state: GameState, dt: number): void {
  const dungeon = state.activeDungeon;
  if (!dungeon) return;
  // Victory celebration in progress — wait out the ~2.5s then return to town.
  if (dungeon.status === 'victory') {
    if (dungeon.victoryAt && Date.now() - dungeon.victoryAt > 2500) {
      onReturnToTown(state);
    }
    return;
  }
  if (dungeon.status !== 'active') return;
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
  // (Removed auto-retreat on low HP — it was kicking players straight back
  //  to town when re-entering after a wipe with the party still wounded.
  //  Now the player decides when to retreat with the ← TOWN button, and
  //  a real wipe is the only auto-exit.)

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
  state.stash.essence += def.rewards.essenceOnBoss;
  // Bounty: mark this dungeon as cleared today
  if (state.bountyBoard) {
    state.bountyBoard.dungeonClearCount[d.defId] = (state.bountyBoard.dungeonClearCount[d.defId] ?? 0) + 1;
  }
  if (def.rewards.guaranteedLoot) {
    const itemId = def.rewards.guaranteedLoot;
    state.stash.items[itemId] = (state.stash.items[itemId] ?? 0) + 1;
    if (!state.collectionLog.includes(itemId)) state.collectionLog.push(itemId);
    pushLog(state, 'loot', `🎖 Guaranteed drop: ${itemId}`, 'rare');
  }
  unlockNextDungeon(state, def.id);
  // Defer the town return so the UI can play a celebration.
  d.victoryAt = Date.now();
  // Fully heal party now so victory feels clean
  for (const h of state.heroes) {
    if (h.state === 'alive') { h.hp = h.maxHp; h.mp = h.maxMp; }
  }
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
  // Back in town the party patches itself up: downed heroes stand again,
  // and any wounded alive hero gets a full heal (the town fountain at work).
  // This prevents the re-entry loop where low HP caused an instant retreat.
  for (const h of state.heroes) {
    if (h.state === 'downed') h.state = 'alive';
    if (h.state === 'alive') {
      h.hp = h.maxHp;
      h.mp = h.maxMp;
    }
    h.buffs = [];
    h.shield = 0;
    h.cooldowns = {};
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
