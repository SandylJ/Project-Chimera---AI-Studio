import { Dungeon, DungeonDef, Tile, TileKind, MonsterInstance } from '../types';
import { MONSTERS } from '../data/monsters';
import { mkId, rngInt, rngChoice, rollChance } from './util';

const KINDS_POOL: { kind: TileKind; weight: number }[] = [
  { kind: 'monster', weight: 55 },
  { kind: 'empty', weight: 15 },
  { kind: 'chest', weight: 10 },
  { kind: 'trap', weight: 7 },
  { kind: 'shrine', weight: 5 },
  { kind: 'fountain', weight: 4 },
  { kind: 'fork', weight: 2 },
  { kind: 'merchant', weight: 2 },
];

function pickKind(): TileKind {
  const totalW = KINDS_POOL.reduce((a, b) => a + b.weight, 0);
  let roll = Math.random() * totalW;
  for (const k of KINDS_POOL) {
    roll -= k.weight;
    if (roll <= 0) return k.kind;
  }
  return 'empty';
}

export function generateDungeon(def: DungeonDef, floor: number): Dungeon {
  const w = def.baseWidth + Math.min(3, Math.floor(floor / 2));
  const h = def.baseHeight + Math.min(3, Math.floor(floor / 3));

  // Build tile grid
  const tiles: Tile[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      tiles.push({
        x, y,
        kind: 'empty',
        revealed: false,
        cleared: false,
      });
    }
  }

  const tileAt = (x: number, y: number): Tile => tiles[y * w + x];

  // Entrance and boss
  const entryPos = { x: 0, y: Math.floor(h / 2) };
  const bossPos = { x: w - 1, y: Math.floor(h / 2) };
  tileAt(entryPos.x, entryPos.y).kind = 'entrance';
  tileAt(entryPos.x, entryPos.y).revealed = true;
  tileAt(entryPos.x, entryPos.y).cleared = true;
  tileAt(bossPos.x, bossPos.y).kind = 'boss';

  // Carve a main path (random walk from entry → boss)
  const path: { x: number; y: number }[] = [];
  path.push({ ...entryPos });
  let cx = entryPos.x, cy = entryPos.y;
  while (!(cx === bossPos.x && cy === bossPos.y)) {
    const goRight = rollChance(0.55);
    if (goRight && cx < w - 1) { cx++; }
    else if (cy < bossPos.y) { cy++; }
    else if (cy > bossPos.y) { cy--; }
    else { cx++; }
    cx = Math.max(0, Math.min(w - 1, cx));
    cy = Math.max(0, Math.min(h - 1, cy));
    // avoid re-entering last tile
    path.push({ x: cx, y: cy });
  }

  // Assign encounter kinds along path (skip entry + boss tiles)
  for (let i = 1; i < path.length - 1; i++) {
    const p = path[i];
    const t = tileAt(p.x, p.y);
    if (t.kind === 'entrance' || t.kind === 'boss') continue;
    t.kind = pickKind();
    populateTile(t, def, floor);
  }

  // Spawn boss
  const bossTile = tileAt(bossPos.x, bossPos.y);
  bossTile.encounter = { monsters: [spawnMonster(def.bossId, floor)] };

  // Also seed some off-path tiles with loot / monsters so exploration feels dense
  const offPathBudget = Math.floor(w * h * 0.15);
  for (let i = 0; i < offPathBudget; i++) {
    const x = rngInt(0, w - 1), y = rngInt(0, h - 1);
    const t = tileAt(x, y);
    if (t.kind !== 'empty' && t.kind !== 'entrance' && t.kind !== 'boss') continue;
    if (t.kind === 'empty') {
      t.kind = rollChance(0.5) ? 'monster' : 'chest';
      populateTile(t, def, floor);
    }
  }

  return {
    id: mkId('dungeon'),
    defId: def.id,
    name: def.name + (floor > 1 ? ` (F${floor})` : ''),
    icon: def.icon,
    floor,
    width: w,
    height: h,
    tiles,
    partyPos: { ...entryPos },
    path,
    pathIndex: 0,
    moveTimer: 2500,
    status: 'active',
    monsterPool: def.monsterPool,
    bossId: def.bossId,
    entryTime: Date.now(),
  };
}

function populateTile(t: Tile, def: DungeonDef, floor: number): void {
  if (t.kind === 'monster') {
    const count = rngInt(1, 3) + (floor > 5 ? 1 : 0);
    t.encounter = { monsters: [] };
    for (let i = 0; i < count; i++) {
      t.encounter.monsters.push(spawnMonster(rngChoice(def.monsterPool), floor));
    }
  }
  // Other kinds (chest/trap/shrine/fountain/fork/merchant) carry no pre-seeded data — resolved on arrival.
}

export function spawnMonster(monsterId: string, floor: number): MonsterInstance {
  const def = MONSTERS[monsterId];
  const scale = 1 + (floor - 1) * 0.15;
  const hp = Math.floor(def.hp * scale);
  return {
    id: mkId('m'),
    monsterId,
    hp,
    maxHp: hp,
    attackTimer: 1000 + Math.floor(Math.random() * 600),
    dots: [],
    stunRemaining: 0,
  };
}
