import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Tile, MonsterInstance, Hero, Rarity } from '../types';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';
import { ABILITIES } from '../data/abilities';
import { themeFor, DungeonTheme } from '../visuals/dungeonTheme';
import { ClassSprite } from '../visuals/sprites';
import { MonsterSpriteArt } from '../visuals/monsterSprites';

/* ============================================================
   Top-down 2D tile map view — CC2 / Pokemon style.
   Heroes walk across a grid of pixel-art tiles; camera pans to
   follow the party. Combat happens on the current tile with
   monsters standing around the party.
   ============================================================ */

const TILE = 64;

// 2x2 hero cluster offsets inside a tile. Shared between party render and FX.
const HERO_OFFSETS: Array<{ dx: number; dy: number }> = [
  { dx: -18, dy: -8 },
  { dx:  18, dy: -8 },
  { dx: -18, dy: 12 },
  { dx:  18, dy: 12 },
];

function heroWorldPos(i: number, partyTileX: number, partyTileY: number): { x: number; y: number } {
  const o = HERO_OFFSETS[i] ?? { dx: 0, dy: 0 };
  return {
    x: partyTileX * TILE + TILE / 2 + o.dx,
    y: partyTileY * TILE + TILE / 2 + o.dy,
  };
}

interface Props {
  state: GameState;
  clickMonster?: (id: string) => void;
}

interface Float {
  id: string;
  targetId: string;
  text: string;
  color: string;
  big?: boolean;
  crit?: boolean;
  bornAt: number;
}

export const PixelMapView: React.FC<Props> = ({ state, clickMonster }) => {
  const dungeon = state.activeDungeon!;
  const theme = themeFor(dungeon.defId);
  const tile = dungeon.tiles.find(t => t.x === dungeon.partyPos.x && t.y === dungeon.partyPos.y)!;
  const heroes = state.heroes.filter(h => !h.bench);
  const enemies = tile.encounter?.monsters ?? [];

  // ---- animation tick ----
  const [, setNow] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => { setNow(Date.now()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const now = Date.now();

  // ---- smooth party position ----
  // The engine's partyPos snaps between grid tiles. We interpolate visually.
  const prevPosRef = useRef<{ x: number; y: number; at: number }>({ x: dungeon.partyPos.x, y: dungeon.partyPos.y, at: 0 });
  const posAnimRef = useRef<{ fromX: number; fromY: number; toX: number; toY: number; startAt: number } | null>(null);
  useEffect(() => {
    const prev = prevPosRef.current;
    if (prev.x !== dungeon.partyPos.x || prev.y !== dungeon.partyPos.y) {
      posAnimRef.current = {
        fromX: prev.x, fromY: prev.y,
        toX: dungeon.partyPos.x, toY: dungeon.partyPos.y,
        startAt: Date.now(),
      };
      prevPosRef.current = { x: dungeon.partyPos.x, y: dungeon.partyPos.y, at: Date.now() };
    }
  }, [dungeon.partyPos.x, dungeon.partyPos.y]);

  // Interpolate current party x/y. Walk takes a visibly-meaningful chunk of
  // the idle move cycle so the party actually looks like it's journeying.
  const anim = posAnimRef.current;
  const WALK_MS = 720;
  const partyX = anim && (now - anim.startAt) < WALK_MS
    ? anim.fromX + (anim.toX - anim.fromX) * easeOut((now - anim.startAt) / WALK_MS)
    : dungeon.partyPos.x;
  const partyY = anim && (now - anim.startAt) < WALK_MS
    ? anim.fromY + (anim.toY - anim.fromY) * easeOut((now - anim.startAt) / WALK_MS)
    : dungeon.partyPos.y;
  const walking = anim && (now - anim.startAt) < WALK_MS;
  const walkDir = walking && anim
    ? (anim.toX > anim.fromX ? 'right' :
       anim.toX < anim.fromX ? 'left'  :
       anim.toY > anim.fromY ? 'down'  : 'up')
    : 'idle';

  // ---- HP diff for damage floats ----
  const prevHpRef = useRef<Record<string, number>>({});
  const [floats, setFloats] = useState<Float[]>([]);
  useEffect(() => {
    const nw = Date.now();
    const all: Array<{ id: string; hp: number; maxHp: number }> = [];
    for (const h of state.heroes) all.push({ id: h.id, hp: h.hp, maxHp: h.maxHp });
    for (const m of enemies) all.push({ id: m.id, hp: m.hp, maxHp: m.maxHp });
    const newFloats: Float[] = [];
    for (const c of all) {
      const prev = prevHpRef.current[c.id];
      if (prev === undefined) continue;
      const diff = c.hp - prev;
      if (Math.abs(diff) < 0.5) continue;
      const isCrit = diff < 0 && Math.abs(diff) > c.maxHp * 0.18;
      newFloats.push({
        id: `f_${nw}_${c.id}_${Math.random()}`,
        targetId: c.id,
        text: diff < 0 ? `-${Math.abs(Math.round(diff))}` : `+${Math.round(diff)}`,
        color: diff < 0 ? (isCrit ? '#ff4040' : '#ffe0b0') : '#7FE2A0',
        big: isCrit, crit: isCrit, bornAt: nw,
      });
    }
    if (newFloats.length) setFloats(f => [...f.slice(-50), ...newFloats]);
    const next: Record<string, number> = {};
    for (const h of state.heroes) next[h.id] = h.hp;
    for (const m of enemies) next[m.id] = m.hp;
    prevHpRef.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  useEffect(() => {
    const id = window.setInterval(() => {
      const nw = Date.now();
      setFloats(fs => fs.filter(f => nw - f.bornAt < 1200));
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  // Map dimensions
  const W = dungeon.width;
  const H = dungeon.height;

  // Camera: center viewport on party
  const [viewportSize, setViewportSize] = useState({ w: 900, h: 600 });
  const viewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const update = () => {
      if (viewRef.current) {
        setViewportSize({ w: viewRef.current.clientWidth, h: viewRef.current.clientHeight });
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cameraX = -(partyX * TILE + TILE / 2) + viewportSize.w / 2;
  const cameraY = -(partyY * TILE + TILE / 2) + viewportSize.h / 2;

  // Enemy positions on current tile (scatter around party center)
  const enemyPositions = useMemo(() => {
    return enemies.map((m, i) => {
      const angle = (i / Math.max(1, enemies.length)) * Math.PI * 2;
      const r = 36 + (i % 2) * 10;
      return {
        id: m.id,
        dx: Math.cos(angle) * r + 20,
        dy: Math.sin(angle) * r * 0.7,
      };
    });
  }, [enemies.length, dungeon.partyPos.x, dungeon.partyPos.y]);

  return (
    <div ref={viewRef} className="relative w-full h-full overflow-hidden" style={{ background: '#050403' }}>
      {/* Ambient sparkle layer (behind world) */}
      <AmbientOverlay theme={theme} />

      {/* The scrollable world */}
      <div
        className="absolute"
        style={{
          left: cameraX,
          top: cameraY,
          width: W * TILE,
          height: H * TILE,
          transition: walking ? `transform 0s` : undefined,
          imageRendering: 'pixelated',
        }}
      >
        {/* Every tile */}
        {dungeon.tiles.map(t => (
          <TileCell key={`${t.x},${t.y}`} tile={t} theme={theme} dungeon={dungeon} />
        ))}

        {/* Path connectors — highlight visited path with a subtle golden glow.
            Tiles visited more recently glow slightly brighter. */}
        {dungeon.path.slice(0, dungeon.pathIndex + 1).map((p, i) => {
          const recency = dungeon.pathIndex - i;
          const strength = recency === 0 ? 30 : recency === 1 ? 22 : 14;
          return (
            <div key={`p${i}`}
                 className="absolute pointer-events-none"
                 style={{
                   left: p.x * TILE, top: p.y * TILE,
                   width: TILE, height: TILE,
                   background: `radial-gradient(circle, ${theme.accentColor}${strength.toString(16).padStart(2, '0')} 0%, transparent 65%)`,
                 }} />
          );
        })}

        {/* Tiny footprint marks on visited path tiles (last 4) */}
        {dungeon.path.slice(Math.max(0, dungeon.pathIndex - 3), dungeon.pathIndex + 1).map((p, idx, arr) => {
          const age = arr.length - 1 - idx; // 0 = current, higher = older
          if (age === 0) return null; // current tile gets the party, no prints
          const opacity = Math.max(0, 0.25 - age * 0.05);
          return (
            <React.Fragment key={`fp${p.x}_${p.y}`}>
              <span className="absolute pointer-events-none"
                    style={{
                      left: p.x * TILE + TILE * 0.32,
                      top:  p.y * TILE + TILE * 0.62,
                      fontSize: 10,
                      opacity,
                      filter: `drop-shadow(0 0 2px ${theme.accentColor})`,
                      color: theme.accentColor,
                    }}>•</span>
              <span className="absolute pointer-events-none"
                    style={{
                      left: p.x * TILE + TILE * 0.58,
                      top:  p.y * TILE + TILE * 0.55,
                      fontSize: 10,
                      opacity,
                      filter: `drop-shadow(0 0 2px ${theme.accentColor})`,
                      color: theme.accentColor,
                    }}>•</span>
            </React.Fragment>
          );
        })}

        {/* Monsters on the current tile */}
        {enemies.map(m => {
          const pos = enemyPositions.find(p => p.id === m.id);
          if (!pos) return null;
          return (
            <MonsterOnTile
              key={m.id}
              monster={m}
              tileX={dungeon.partyPos.x}
              tileY={dungeon.partyPos.y}
              dx={pos.dx}
              dy={pos.dy}
              now={now}
              onClick={clickMonster ? () => clickMonster(m.id) : undefined}
            />
          );
        })}

        {/* Party sprite(s) — up to 4 heroes clustered on the current tile */}
        <PartyOnTile
          heroes={heroes}
          tileX={partyX}
          tileY={partyY}
          now={now}
          walking={walking}
          walkDir={walkDir}
        />

        {/* Walking dust kicked up behind party */}
        {walking && (
          <WalkingDust partyX={partyX} partyY={partyY} walkDir={walkDir} now={now} />
        )}

        {/* Tile arrival pulse */}
        <TileArriveRing
          tileX={dungeon.partyPos.x}
          tileY={dungeon.partyPos.y}
          arriveAt={prevPosRef.current.at}
          now={now}
        />

        {/* Attack FX — projectiles / slashes / spells driven by hero.lastAction + monster.lastAttack */}
        <AttackFxLayer
          heroes={heroes}
          enemies={enemies}
          enemyPositions={enemyPositions}
          partyX={partyX}
          partyY={partyY}
          now={now}
        />

        {/* Death FX — flying corpses + loot arcs when monsters die */}
        <DeathFxLayer
          enemies={enemies}
          enemyPositions={enemyPositions}
          partyX={partyX}
          partyY={partyY}
          now={now}
        />

        {/* Tile-resolve FX — chests/shrines/fountains burst when cleared */}
        <TileResolveFxLayer dungeon={dungeon} now={now} />

        {/* Ability cast announcer */}
        <AbilityCastAnnouncer heroes={heroes} partyX={partyX} partyY={partyY} now={now} />

        {/* Damage / heal floats */}
        {floats.map(f => {
          // find target (hero or enemy) position
          const heroIdx = heroes.findIndex(h => h.id === f.targetId);
          const enemy = enemies.find(m => m.id === f.targetId);
          let x = partyX * TILE + TILE / 2;
          let y = partyY * TILE + TILE / 2;
          if (heroIdx >= 0) {
            const offsets = [
              { dx: -14, dy: 0 }, { dx: 14, dy: 0 }, { dx: -14, dy: 16 }, { dx: 14, dy: 16 },
            ];
            const o = offsets[heroIdx] ?? { dx: 0, dy: 0 };
            x += o.dx; y += o.dy - 20;
          } else if (enemy) {
            const pos = enemyPositions.find(p => p.id === enemy.id);
            if (pos) { x += pos.dx; y += pos.dy - 20; }
          }
          return <DamageFloat key={f.id} float={f} x={x} y={y} now={now} />;
        })}
      </div>

      {/* HUD overlays (screen space, above the world) */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-2 px-3 py-1 bg-black/70 rounded-lg border"
           style={{ borderColor: theme.accentColor + '80', color: theme.accentColor }}>
        <span className="text-xl">{dungeon.icon}</span>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {dungeon.name}
          </div>
          <div className="text-[10px] text-[#B8A890]">Room {dungeon.pathIndex + 1} / {dungeon.path.length} · Floor {dungeon.floor}</div>
        </div>
      </div>

      {/* Mini-map top-right */}
      <MiniMap dungeon={dungeon} theme={theme} />

      {/* Encounter banner */}
      {enemies.length > 0 && (
        <EncounterBanner enemies={enemies} />
      )}

      {/* Idle footsteps ring between tiles */}
      {enemies.length === 0 && dungeon.moveTimer > 0 && dungeon.status === 'active' && !walking && (
        <AdvancingRing moveTimer={dungeon.moveTimer} color={theme.accentColor} />
      )}
    </div>
  );
};

// ============ Single Tile ============

const TileCell: React.FC<{ tile: Tile; theme: DungeonTheme; dungeon: any }> = ({ tile, theme, dungeon }) => {
  // Only render tiles that are "in play" (on path or revealed)
  const inPath = dungeon.path.some((p: any) => p.x === tile.x && p.y === tile.y);
  const revealed = tile.revealed || inPath;
  if (!revealed && !(tile.kind === 'monster' || tile.kind === 'chest')) return null;
  if (!inPath && !tile.revealed) return null;

  // Walkable — draw floor. Monsters/chests/etc. off path draw too if revealed.
  return (
    <div className="absolute"
         style={{
           left: tile.x * TILE,
           top: tile.y * TILE,
           width: TILE, height: TILE,
         }}>
      {/* Floor */}
      <div className="absolute inset-0"
           style={{
             background: `
               radial-gradient(circle at 30% 30%, ${theme.floorLight}55 0%, transparent 60%),
               linear-gradient(135deg, ${theme.floorMid} 0%, ${theme.floorDark} 100%)
             `,
             boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3)',
             border: `1px solid ${theme.wallDark}80`,
           }} />
      {/* Speckle texture */}
      <div className="absolute inset-0 opacity-40"
           style={{
             backgroundImage: `
               radial-gradient(circle at 20% 25%, ${theme.wallDark}50 0.7px, transparent 2px),
               radial-gradient(circle at 65% 55%, ${theme.wallDark}50 0.5px, transparent 2px),
               radial-gradient(circle at 80% 30%, ${theme.floorLight}40 0.4px, transparent 1.5px),
               radial-gradient(circle at 40% 80%, ${theme.wallDark}50 0.6px, transparent 2px)
             `,
           }} />
      {/* Persistent flavor doodad — seeded by tile coords so stable across frames */}
      {tile.kind === 'empty' && !tile.cleared && (
        <TileFlavor tile={tile} theme={theme} />
      )}
      {/* Kind-specific decoration */}
      <TileDecor tile={tile} theme={theme} />
      {/* Fog of war on tiles not yet revealed */}
      {!tile.revealed && (
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
      )}
    </div>
  );
};

const TileDecor: React.FC<{ tile: Tile; theme: DungeonTheme }> = ({ tile, theme }) => {
  if (tile.cleared && tile.kind !== 'entrance' && tile.kind !== 'boss') {
    // Subtle marker on cleared tiles — small footprint
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-25 text-xl"
           style={{ color: theme.accentColor }}>
        ◦
      </div>
    );
  }
  const map: Partial<Record<Tile['kind'], { icon: string; color: string; anim?: string }>> = {
    entrance: { icon: '🚪', color: '#B8A890' },
    boss:     { icon: '👑', color: '#ff5050', anim: 'glowPulse 1.2s ease-in-out infinite' },
    chest:    { icon: '📦', color: '#D4A943', anim: 'chestWiggle 2.2s ease-in-out infinite' },
    trap:     { icon: '⚠',  color: '#ff6060' },
    shrine:   { icon: '⛩',  color: '#7FE2A0', anim: 'glowPulse 2.4s ease-in-out infinite' },
    fountain: { icon: '⛲',  color: '#6EA9E4', anim: 'fountainBob 2.5s ease-in-out infinite' },
    fork:     { icon: '🛤',  color: '#F2E6A8' },
    merchant: { icon: '🧳',  color: '#F2B84B', anim: 'chestWiggle 3s ease-in-out infinite' },
    exit:     { icon: '🚪', color: '#B8A890' },
  };
  const d = map[tile.kind];
  if (!d) return null;
  // Boss or high-value tiles also get an outward beacon glow
  const beacon = (tile.kind === 'boss' || tile.kind === 'chest' || tile.kind === 'shrine' || tile.kind === 'fountain' || tile.kind === 'merchant');
  return (
    <>
      {beacon && !tile.cleared && (
        <div className="absolute inset-0 pointer-events-none"
             style={{
               borderRadius: 4,
               background: `radial-gradient(circle, ${d.color}20 0%, transparent 65%)`,
               animation: 'glowPulse 2.2s ease-in-out infinite',
               ['--glow' as any]: d.color,
             }} />
      )}
      <div className="absolute inset-0 flex items-center justify-center"
           style={{
             filter: `drop-shadow(0 0 6px ${d.color}) drop-shadow(0 2px 2px rgba(0,0,0,0.8))`,
             animation: d.anim,
             ['--glow' as any]: d.color,
           }}>
        <span style={{ fontSize: 34 }}>{d.icon}</span>
      </div>
    </>
  );
};

// ============ Tile flavor (small persistent decoration) ============

function seededRand(x: number, y: number, salt: number): number {
  const n = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233 + salt * 37.719) * 43758.5453;
  return n - Math.floor(n);
}

const TileFlavor: React.FC<{ tile: Tile; theme: DungeonTheme }> = ({ tile, theme }) => {
  // Emit nothing most of the time; ~30% tiles get a flavor doodad
  const roll = seededRand(tile.x, tile.y, 1);
  if (roll > 0.33) return null;
  // Pick a bgEmoji from the theme at random (stable)
  const list = theme.bgEmoji;
  const emoji = list[Math.floor(seededRand(tile.x, tile.y, 7) * list.length)];
  // Position within the tile
  const px = 8 + seededRand(tile.x, tile.y, 2) * (TILE - 20);
  const py = 8 + seededRand(tile.x, tile.y, 3) * (TILE - 22);
  const size = 10 + seededRand(tile.x, tile.y, 4) * 10;
  const rot = (seededRand(tile.x, tile.y, 5) - 0.5) * 30;
  return (
    <span className="absolute pointer-events-none select-none"
          style={{
            left: px, top: py,
            fontSize: size,
            opacity: 0.5,
            transform: `rotate(${rot}deg)`,
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.7))',
          }}>
      {emoji}
    </span>
  );
};

// ============ Party on Tile ============

const PartyOnTile: React.FC<{
  heroes: Hero[]; tileX: number; tileY: number; now: number; walking: boolean; walkDir: string;
}> = ({ heroes, tileX, tileY, now, walking }) => {
  return (
    <>
      {heroes.slice(0, 4).map((h, i) => {
        const o = HERO_OFFSETS[i];
        const bob = walking ? Math.sin((now / 120) + i) * 3 : Math.sin((now / 500) + i) * 1.2;
        // Attack lunge: when this hero has just attacked, lunge toward target side
        const actAge = h.lastAction ? now - h.lastAction.at : Infinity;
        const lungeT = actAge < 260 ? 1 - actAge / 260 : 0;
        // Ranged/spell: no physical lunge (they stay put and fire). Melee lunges forward.
        const isMelee = h.lastAction?.kind === 'melee';
        const lungeX = isMelee ? Math.sin(lungeT * Math.PI) * 10 : 0;
        const lungeY = isMelee ? -Math.sin(lungeT * Math.PI) * 2 : 0;
        const lx = tileX * TILE + TILE / 2 + o.dx + lungeX;
        const ly = tileY * TILE + TILE / 2 + o.dy + bob + lungeY;
        const cls = CLASSES[h.classId];
        const hasBuff = h.buffs.length > 0;
        const hpPct = Math.max(0, (h.hp / Math.max(1, h.maxHp)) * 100);
        const mpPct = h.maxMp > 0 ? Math.max(0, (h.mp / h.maxMp) * 100) : 0;
        // Hit flash: if hero took damage within ~260ms, tint red
        const hitAge = h.lastHitAt ? now - h.lastHitAt : Infinity;
        const flashT = hitAge < 260 ? 1 - hitAge / 260 : 0;
        // Color grade the HP bar (green → yellow → red)
        const barColor =
          hpPct > 66 ? '#55d86b' :
          hpPct > 33 ? '#e9cc3a' :
                       '#e04040';
        const lowHp = hpPct < 30 && h.state === 'alive';
        const downed = h.state !== 'alive';
        return (
          <div key={h.id}
               className="absolute"
               style={{
                 left: lx, top: ly,
                 transform: 'translate(-50%, -100%)',
                 filter: downed
                   ? 'grayscale(1) opacity(0.5)'
                   : flashT > 0
                     ? `drop-shadow(0 0 8px rgba(255,80,80,${flashT})) drop-shadow(0 2px 2px rgba(0,0,0,0.85))`
                     : 'drop-shadow(0 2px 2px rgba(0,0,0,0.85))',
                 zIndex: 10 + i,
               }}>
            {/* Big differentiated nameplate */}
            <div className="absolute left-1/2 -translate-x-1/2"
                 style={{
                   bottom: 'calc(100% - 2px)',
                   minWidth: 68,
                   transform: `translate(-50%, 0) ${flashT > 0 ? `translateX(${(Math.random() - 0.5) * 4 * flashT}px)` : ''}`,
                 }}>
              {/* Name / level chip */}
              <div className="flex items-center justify-between gap-1 px-1 py-[1px] rounded-sm leading-none border"
                   style={{
                     background: 'rgba(8,6,5,0.88)',
                     borderColor: cls.color + 'aa',
                     boxShadow: lowHp ? '0 0 6px #ff4040aa' : undefined,
                   }}>
                <span className="text-[8px] font-black tracking-wide"
                      style={{ color: cls.color, fontFamily: "'JetBrains Mono', monospace", textShadow: '0 1px 0 #000' }}>
                  {h.name.slice(0, 6).toUpperCase()}
                </span>
                <span className="text-[7px] text-[#f2e08a] font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  L{h.level}
                </span>
              </div>
              {/* HP bar with numbers */}
              <div className="relative mt-0.5 h-[6px] rounded-sm overflow-hidden"
                   style={{
                     background: '#0a0606',
                     border: '1px solid #000',
                     boxShadow: flashT > 0 ? `0 0 6px rgba(255,60,60,${flashT})` : undefined,
                   }}>
                <div className="absolute inset-y-0 left-0"
                     style={{
                       width: hpPct + '%',
                       background: `linear-gradient(180deg, ${barColor} 0%, ${darken(barColor, 0.4)} 100%)`,
                       transition: 'width 180ms ease-out',
                       boxShadow: `inset 0 1px 0 ${lighten(barColor, 0.3)}`,
                     }} />
                {flashT > 0 && (
                  <div className="absolute inset-0 pointer-events-none"
                       style={{ background: 'rgba(255,255,255,0.65)', opacity: flashT }} />
                )}
                <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-white leading-none"
                     style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000, 0 1px 0 #000' }}>
                  {Math.max(0, Math.ceil(h.hp))}/{h.maxHp}
                </div>
              </div>
              {/* MP bar (thin) */}
              {h.maxMp > 0 && (
                <div className="relative mt-0.5 h-[3px] rounded-sm overflow-hidden"
                     style={{ background: '#0a0606', border: '1px solid #000' }}>
                  <div className="absolute inset-y-0 left-0"
                       style={{
                         width: mpPct + '%',
                         background: 'linear-gradient(180deg, #5aa0ff 0%, #205090 100%)',
                         transition: 'width 180ms ease-out',
                       }} />
                </div>
              )}
            </div>
            {/* Sprite */}
            <ClassSprite classId={h.classId} size={42} />
            {/* Shield ring */}
            {h.shield > 0 && (
              <div className="absolute inset-x-0 bottom-0 h-8 rounded-full pointer-events-none"
                   style={{
                     boxShadow: 'inset 0 0 10px #6EA9E4aa, 0 0 8px #6EA9E480',
                     border: '1.5px solid #6EA9E4',
                     animation: 'ambientFloat 1.4s ease-in-out infinite alternate',
                   }} />
            )}
            {/* Active buff glow */}
            {hasBuff && (
              <div className="absolute pointer-events-none"
                   style={{
                     left: '50%', top: '50%',
                     width: 46, height: 46,
                     borderRadius: '50%',
                     transform: 'translate(-50%, -50%)',
                     boxShadow: '0 0 12px #f2e08a80, inset 0 0 8px #f2e08a60',
                     animation: 'glowPulse 1.8s ease-in-out infinite',
                     ['--glow' as any]: '#f2e08a',
                   }} />
            )}
            {/* Status icons bubble — shield / buffs / low-hp */}
            {(h.shield > 0 || hasBuff || lowHp) && !downed && (
              <div className="absolute flex gap-0.5 pointer-events-none"
                   style={{
                     left: '100%', top: -4,
                     transform: 'translate(-20%, 0)',
                   }}>
                {h.shield > 0 && (
                  <span className="text-[10px] leading-none px-0.5 rounded-sm bg-black/80 border border-[#6EA9E4]"
                        style={{ color: '#6EA9E4', textShadow: '0 0 3px #6EA9E4' }}
                        title={`Shield ${Math.ceil(h.shield)}`}>🛡</span>
                )}
                {hasBuff && (
                  <span className="text-[10px] leading-none px-0.5 rounded-sm bg-black/80 border border-[#f2e08a]"
                        style={{ color: '#f2e08a', textShadow: '0 0 3px #f2c846' }}
                        title={`${h.buffs.length} buff(s)`}>⬆</span>
                )}
                {lowHp && (
                  <span className="text-[10px] leading-none px-0.5 rounded-sm bg-black/80 border border-[#E86E6E] animate-pulse"
                        style={{ color: '#E86E6E', textShadow: '0 0 3px #E86E6E' }}
                        title="Low HP">⚠</span>
                )}
              </div>
            )}
            {/* Hit overlay tint */}
            {flashT > 0 && (
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: 'rgba(255,60,60,0.55)', mixBlendMode: 'screen', opacity: flashT }} />
            )}
            {/* Ability point badge */}
            {h.abilityPoints > 0 && (
              <div className="absolute -top-[2px] right-0 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black bg-[#D4A943] text-black animate-pulse shadow-md"
                   title="Unspent ability points">+</div>
            )}
            {/* Downed overlay */}
            {downed && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black text-[#E86E6E] bg-black/80 px-1 rounded"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>DOWN</span>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

function lighten(hex: string, pct: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lr = Math.min(255, Math.round(r + (255 - r) * pct));
  const lg = Math.min(255, Math.round(g + (255 - g) * pct));
  const lb = Math.min(255, Math.round(b + (255 - b) * pct));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

function darken(hex: string, pct: number): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lr = Math.max(0, Math.round(r * (1 - pct)));
  const lg = Math.max(0, Math.round(g * (1 - pct)));
  const lb = Math.max(0, Math.round(b * (1 - pct)));
  return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
}

// ============ Monster on Tile ============

const MonsterOnTile: React.FC<{
  monster: MonsterInstance; tileX: number; tileY: number; dx: number; dy: number;
  now: number; onClick?: () => void;
}> = ({ monster, tileX, tileY, dx, dy, now, onClick }) => {
  const def = MONSTERS[monster.monsterId];
  if (!def) return null;
  const hue = hashHue(monster.id);
  const bob = Math.sin((now / 400) + hue) * 2;
  // Idle drift — tiny lateral sway (not a lunge). Faster for lower-level minions.
  const driftX = Math.sin((now / 700) + hue * 2) * 3;
  const isBoss = def.boss;
  const attackAge = monster.lastAttack ? now - monster.lastAttack.at : Infinity;
  const lungeT = attackAge < 260 ? 1 - attackAge / 260 : 0;
  const lungeX = -Math.sin(lungeT * Math.PI) * 14;
  const size = isBoss ? 68 : 46;
  const hpPct = Math.max(0, (monster.hp / Math.max(1, monster.maxHp)) * 100);
  const stunned = monster.stunRemaining > 0;
  const dying = monster.hp <= 0;
  const lx = tileX * TILE + TILE / 2 + dx;
  const ly = tileY * TILE + TILE / 2 + dy;
  // Hit flash — hp just ticked this frame? Handled via damage floats; here we just color-grade
  const barColor =
    hpPct > 66 ? '#d83232' :
    hpPct > 33 ? '#ff6e3e' :
                 '#ffc048';
  return (
    <div className={`absolute ${onClick ? 'cursor-crosshair' : ''}`}
         onClick={onClick}
         style={{
           left: lx, top: ly,
           transform: `translate(-50%, -100%) translate(${lungeX + driftX}px, ${bob}px)`,
           filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.85))',
           transition: lungeT > 0 ? 'transform 110ms ease-out' : 'transform 120ms ease-out',
           animation: dying ? 'fadeOut 0.5s forwards' : 'popIn 0.45s ease-out',
           zIndex: 20,
         }}>
      {/* Big nameplate + HP bar (rendered in world orientation so not mirrored) */}
      <div className="absolute left-1/2 -translate-x-1/2"
           style={{ bottom: 'calc(100% + 2px)', minWidth: isBoss ? 90 : 60, pointerEvents: 'none' }}>
        {isBoss && (
          <div className="text-[8px] text-center font-black uppercase tracking-widest text-[#ff9060] leading-none mb-0.5"
               style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 1px 0 #000, 0 0 6px #ff5040' }}>
            👑 {def.name}
          </div>
        )}
        {!isBoss && (
          <div className="text-[7px] text-center text-[#ffd0a0] leading-none mb-0.5"
               style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 1px 0 #000' }}>
            {def.name} <span className="text-[#ffa060]">L{def.level}</span>
          </div>
        )}
        <div className="relative h-[5px] rounded-sm overflow-hidden"
             style={{
               background: '#0a0606',
               border: `1px solid ${isBoss ? '#ff4040' : '#000'}`,
               boxShadow: isBoss ? '0 0 6px #ff504080' : undefined,
             }}>
          <div className="absolute inset-y-0 left-0"
               style={{
                 width: hpPct + '%',
                 background: `linear-gradient(180deg, ${barColor} 0%, ${darken(barColor, 0.45)} 100%)`,
                 transition: 'width 180ms ease-out',
                 boxShadow: `inset 0 1px 0 ${lighten(barColor, 0.35)}`,
               }} />
          <div className="absolute inset-0 flex items-center justify-center text-[7px] font-black text-white leading-none"
               style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000, 0 1px 0 #000' }}>
            {Math.max(0, Math.ceil(monster.hp))}/{monster.maxHp}
          </div>
        </div>
      </div>
      <div className="relative" style={{ transform: 'scaleX(-1)' }}>
        <MonsterSpriteArt monsterId={monster.monsterId} icon={def.icon} size={size} level={def.level} />
        {stunned && (
          <div className="absolute -top-4 left-1/2 text-[8px] font-black bg-black/80 px-1 rounded text-[#F2E6A8] border border-[#F2E6A8]/60"
               style={{
                 transform: 'translateX(-50%) scaleX(-1)',
                 fontFamily: "'JetBrains Mono', monospace",
                 animation: 'stunStar 0.5s ease-in-out infinite alternate',
               }}>
            💫 STUN
          </div>
        )}
        {/* DoT indicator — green bubbles if poisoned */}
        {monster.dots.length > 0 && (
          <div className="absolute -top-4 right-0 text-[10px] font-black bg-black/80 px-0.5 rounded border border-[#7FE2A0]/60"
               style={{
                 transform: 'scaleX(-1)',
                 color: '#7FE2A0',
                 fontFamily: "'JetBrains Mono', monospace",
                 textShadow: '0 0 3px #7FE2A0',
               }}>
            ☠
          </div>
        )}
      </div>
    </div>
  );
};

// ============ Damage Float ============

const DamageFloat: React.FC<{ float: Float; x: number; y: number; now: number }> = ({ float, x, y, now }) => {
  const age = now - float.bornAt;
  const t = Math.min(1, age / 1100);
  const dy = -40 * t;
  const dx = ((parseInt(float.id.slice(-3), 36) % 10) - 5) * 3 * t;
  const opacity = 1 - t;
  const scale = 1 + (float.big ? 0.5 : 0.25) * Math.max(0, 1 - t * 2);
  return (
    <div className="absolute pointer-events-none z-40"
         style={{
           left: x, top: y,
           transform: `translate(calc(-50% + ${dx}px), ${dy}px) scale(${scale})`,
           opacity,
         }}>
      <span className={`font-black ${float.big ? 'text-3xl' : 'text-lg'} leading-none block text-center`}
            style={{
              color: float.color,
              textShadow: `0 0 6px ${float.color}cc, 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
        {float.text}
        {float.crit && <span className="text-[9px] block leading-none mt-0.5">CRIT!</span>}
      </span>
    </div>
  );
};

// ============ Mini Map ============

const MiniMap: React.FC<{ dungeon: any; theme: DungeonTheme }> = ({ dungeon, theme }) => {
  const CELL = 10;
  const W = dungeon.width * CELL;
  const H = dungeon.height * CELL;
  const iconFor = (kind: string): string => {
    switch (kind) {
      case 'boss': return '👑';
      case 'chest': return '📦';
      case 'trap': return '⚠';
      case 'shrine': return '⛩';
      case 'fountain': return '⛲';
      case 'fork': return '🛤';
      case 'merchant': return '🧳';
      case 'entrance': return '🚪';
      case 'exit': return '🚪';
      case 'monster': return '•';
      default: return '';
    }
  };
  return (
    <div className="absolute top-2 right-2 z-20 p-1.5 bg-black/75 rounded-lg border border-[#3D3328]">
      <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest mb-1 text-center"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Map · F{dungeon.floor}
      </div>
      <div className="relative" style={{ width: W, height: H }}>
        {dungeon.tiles.map((t: any) => {
          const inPath = dungeon.path.some((p: any) => p.x === t.x && p.y === t.y);
          if (!inPath && !t.revealed) return null;
          const isHere = t.x === dungeon.partyPos.x && t.y === dungeon.partyPos.y;
          const liveEncounter = !!(t.encounter && t.encounter.monsters.length > 0);
          const color =
            isHere             ? theme.accentColor :
            t.kind === 'boss'  ? '#ff4040' :
            liveEncounter      ? '#d84040' :
            t.cleared          ? '#4a4034' :
                                 '#7A6E60';
          const icon = iconFor(t.kind);
          return (
            <div key={`${t.x},${t.y}`}
                 className="absolute flex items-center justify-center text-[8px] leading-none"
                 style={{
                   left: t.x * CELL, top: t.y * CELL,
                   width: CELL - 1, height: CELL - 1,
                   background: color + (t.cleared && !isHere ? 'aa' : 'dd'),
                   border: isHere ? `1px solid ${theme.accentColor}` : undefined,
                   boxShadow: isHere ? `0 0 6px ${theme.accentColor}` :
                              (liveEncounter && !isHere ? '0 0 3px #ff604080' : undefined),
                   borderRadius: 2,
                   opacity: t.revealed || isHere ? 1 : 0.55,
                   animation: liveEncounter && !isHere ? 'glowPulse 1.6s ease-in-out infinite' : undefined,
                   ['--glow' as any]: '#ff4040',
                 }}>
              {icon && (
                <span style={{
                  fontSize: icon === '•' ? 8 : 7,
                  opacity: 0.9,
                  filter: isHere ? 'drop-shadow(0 0 1px #000)' : undefined,
                }}>{icon}</span>
              )}
            </div>
          );
        })}
        {/* Path next-tile indicator: faint dot on upcoming path */}
        {dungeon.path[dungeon.pathIndex + 1] && (() => {
          const n = dungeon.path[dungeon.pathIndex + 1];
          return (
            <div className="absolute pointer-events-none"
                 style={{
                   left: n.x * CELL, top: n.y * CELL,
                   width: CELL - 1, height: CELL - 1,
                   border: `1px dashed ${theme.accentColor}`,
                   borderRadius: 2,
                   opacity: 0.55,
                 }} />
          );
        })()}
      </div>
    </div>
  );
};

// ============ Encounter banner ============

const EncounterBanner: React.FC<{ enemies: MonsterInstance[] }> = ({ enemies }) => {
  const counts = new Map<string, { alive: number; total: number; name: string; level: number }>();
  for (const e of enemies) {
    const d = MONSTERS[e.monsterId];
    if (!d) continue;
    const cur = counts.get(d.id) ?? { alive: 0, total: 0, name: d.name, level: d.level };
    cur.total++;
    if (e.hp > 0) cur.alive++;
    counts.set(d.id, cur);
  }
  return (
    <div className="absolute left-1/2 bottom-3 -translate-x-1/2 z-20 px-4 py-1.5 rounded-md"
         style={{
           background: 'rgba(0, 80, 160, 0.85)',
           border: '1px solid rgba(180,220,255,0.85)',
           boxShadow: '0 2px 10px rgba(0,0,0,0.7)',
           minWidth: 320,
         }}>
      <div className="text-[11px] font-bold uppercase tracking-widest text-white text-center leading-tight"
           style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 1px 0 #000' }}>
        An Encounter!
      </div>
      {Array.from(counts.values()).map(g => (
        <div key={g.name} className="text-xs text-white leading-tight text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <span className="font-bold">{g.alive}/{g.total}</span> {g.name}{g.total > 1 ? 's' : ''}{' '}
          <span className="text-[10px] opacity-80">(Lvl. {g.level})</span>
        </div>
      ))}
    </div>
  );
};

// ============ Advancing footstep ring ============

const AdvancingRing: React.FC<{ moveTimer: number; color: string }> = ({ moveTimer, color }) => {
  const t = 1 - Math.min(1, moveTimer / 3500);
  const sec = Math.max(0, moveTimer / 1000);
  return (
    <div className="absolute left-1/2 bottom-16 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
      <div className="relative w-12 h-12">
        <svg width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0">
          <circle cx="24" cy="24" r="18" stroke="#00000080" strokeWidth="3" fill="none" />
          <circle cx="24" cy="24" r="18"
                  stroke={color} strokeWidth="3" fill="none"
                  strokeDasharray={`${Math.PI * 36}`}
                  strokeDashoffset={`${Math.PI * 36 * (1 - t)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                  style={{ transition: 'stroke-dashoffset 100ms linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg">👣</div>
      </div>
      <div className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black/75 rounded-full"
           style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
        Advancing · {sec.toFixed(1)}s
      </div>
    </div>
  );
};

// ============ Ambient overlay ============

const AmbientOverlay: React.FC<{ theme: DungeonTheme }> = ({ theme }) => {
  // Theme-aware particle counts and styling
  const kind = theme.ambientKind;
  const count = kind === 'snow' ? 45 : kind === 'embers' ? 40 : kind === 'stars' ? 60 : 30;
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 8,
    dur: 3 + Math.random() * 5,
    delay: Math.random() * 4,
  })), [theme, count]);

  // Atmosphere layer — subtle color wash
  const washColor = theme.fogColor;

  return (
    <>
      {/* Colored fog wash */}
      <div className="absolute inset-0 pointer-events-none z-[5]"
           style={{ background: `radial-gradient(ellipse at 50% 40%, ${washColor} 0%, transparent 75%)` }} />

      {/* Theme-specific particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {particles.map(p => {
          if (kind === 'snow') {
            return (
              <span key={p.id} className="absolute"
                    style={{
                      left: `${p.x}%`, top: `-2%`,
                      fontSize: 8 + p.size / 2,
                      color: '#e0f4ff',
                      opacity: 0.75,
                      filter: 'drop-shadow(0 0 2px #fff)',
                      animation: `snowFall ${8 + p.dur}s linear infinite`,
                      animationDelay: `${p.delay}s`,
                    }}>❄</span>
            );
          }
          if (kind === 'embers') {
            return (
              <div key={p.id} className="absolute rounded-full"
                   style={{
                     left: `${p.x}%`, top: `${80 + Math.random() * 20}%`,
                     width: p.size * 0.7, height: p.size * 0.7,
                     background: `radial-gradient(circle, #ffdc60 0%, #ff6030 60%, transparent 90%)`,
                     boxShadow: '0 0 6px #ff6030',
                     animation: `emberRise ${p.dur + 4}s ease-out infinite`,
                     animationDelay: `${p.delay}s`,
                   }} />
            );
          }
          if (kind === 'bubbles') {
            return (
              <div key={p.id} className="absolute rounded-full"
                   style={{
                     left: `${p.x}%`, top: `${90 + Math.random() * 10}%`,
                     width: p.size, height: p.size,
                     background: `radial-gradient(circle at 30% 30%, #ffffff80 0%, ${theme.accentColor}30 60%, transparent 90%)`,
                     border: `1px solid ${theme.accentColor}60`,
                     animation: `bubbleRise ${p.dur + 6}s ease-in-out infinite`,
                     animationDelay: `${p.delay}s`,
                   }} />
            );
          }
          if (kind === 'sparks') {
            return (
              <span key={p.id} className="absolute"
                    style={{
                      left: `${p.x}%`, top: `${p.y}%`,
                      fontSize: p.size / 2 + 6,
                      color: theme.accentColor,
                      filter: `drop-shadow(0 0 6px ${theme.accentColor})`,
                      animation: `sparkTwinkle ${p.dur}s ease-in-out infinite alternate`,
                      animationDelay: `${p.delay}s`,
                    }}>✦</span>
            );
          }
          if (kind === 'shadow') {
            return (
              <div key={p.id} className="absolute rounded-full"
                   style={{
                     left: `${p.x}%`, top: `${p.y}%`,
                     width: p.size * 1.5, height: p.size * 1.5,
                     background: `radial-gradient(circle, ${theme.accentColor}25 0%, transparent 70%)`,
                     filter: 'blur(3px)',
                     animation: `ambientFloat ${p.dur + 2}s ease-in-out infinite alternate`,
                     animationDelay: `${p.delay}s`,
                   }} />
            );
          }
          if (kind === 'stars') {
            return (
              <span key={p.id} className="absolute"
                    style={{
                      left: `${p.x}%`, top: `${p.y}%`,
                      fontSize: 6 + p.size / 3,
                      color: theme.accentColor,
                      filter: `drop-shadow(0 0 4px ${theme.accentColor})`,
                      animation: `sparkTwinkle ${p.dur * 1.5}s ease-in-out infinite alternate`,
                      animationDelay: `${p.delay}s`,
                    }}>·</span>
            );
          }
          if (kind === 'leaves') {
            return (
              <span key={p.id} className="absolute"
                    style={{
                      left: `${p.x}%`, top: `-2%`,
                      fontSize: 10,
                      color: theme.accentColor,
                      animation: `leafFall ${10 + p.dur}s linear infinite`,
                      animationDelay: `${p.delay}s`,
                    }}>🍂</span>
            );
          }
          if (kind === 'webs') {
            return (
              <span key={p.id} className="absolute"
                    style={{
                      left: `${p.x}%`, top: `${p.y}%`,
                      fontSize: 6 + p.size / 2,
                      color: theme.accentColor,
                      opacity: 0.28,
                      filter: `drop-shadow(0 0 2px ${theme.accentColor})`,
                      animation: `ambientFloat ${p.dur + 3}s ease-in-out infinite alternate`,
                      animationDelay: `${p.delay}s`,
                    }}>·</span>
            );
          }
          // fallback: generic floating motes
          return (
            <div key={p.id} className="absolute rounded-full"
                 style={{
                   left: `${p.x}%`, top: `${p.y}%`,
                   width: p.size, height: p.size,
                   background: theme.accentColor,
                   opacity: 0.1,
                   animation: `ambientFloat ${p.dur}s ease-in-out infinite alternate`,
                   animationDelay: `${p.delay}s`,
                   filter: 'blur(1px)',
                 }} />
          );
        })}
      </div>
    </>
  );
};

// ============ Walking dust ============

const WalkingDust: React.FC<{ partyX: number; partyY: number; walkDir: string; now: number }> = ({ partyX, partyY, walkDir, now }) => {
  // Spawn a new dust puff every ~90ms while walking.
  const dusts = useRef<Array<{ id: number; bornAt: number; x: number; y: number }>>([]);
  const lastSpawnRef = useRef(0);
  if (now - lastSpawnRef.current > 90) {
    lastSpawnRef.current = now;
    // Spawn behind the party's walk direction
    const behindX = walkDir === 'right' ? -10 : walkDir === 'left' ? 10 : (Math.random() - 0.5) * 10;
    const behindY = walkDir === 'down' ? -10 : walkDir === 'up' ? 10 : 10;
    dusts.current.push({
      id: now,
      bornAt: now,
      x: partyX * TILE + TILE / 2 + behindX + (Math.random() - 0.5) * 8,
      y: partyY * TILE + TILE / 2 + behindY + (Math.random() - 0.5) * 4,
    });
    // Keep last 12
    if (dusts.current.length > 12) dusts.current.splice(0, dusts.current.length - 12);
  }
  // Cull old
  dusts.current = dusts.current.filter(d => now - d.bornAt < 600);
  return (
    <>
      {dusts.current.map(d => (
        <div key={d.id} className="absolute pointer-events-none"
             style={{
               left: d.x, top: d.y,
               width: 14, height: 10,
               background: 'radial-gradient(ellipse, rgba(160,140,100,0.55) 0%, transparent 75%)',
               animation: 'walkDust 0.55s ease-out forwards',
               zIndex: 5,
             }} />
      ))}
    </>
  );
};

// ============ Tile arrive ring ============

const TileArriveRing: React.FC<{ tileX: number; tileY: number; arriveAt: number; now: number }> = ({ tileX, tileY, arriveAt, now }) => {
  const age = now - arriveAt;
  if (arriveAt === 0 || age > 650) return null;
  return (
    <div className="absolute pointer-events-none"
         style={{
           left: tileX * TILE, top: tileY * TILE,
           width: TILE, height: TILE,
           border: '2px solid #F2E6A8',
           borderRadius: 4,
           animation: 'tileArriveRing 0.6s ease-out forwards',
           boxShadow: '0 0 12px #F2E6A880',
           zIndex: 8,
         }} />
  );
};

// ============ Attack FX Layer ============

interface AttackFx {
  id: string;
  kind: 'melee' | 'ranged' | 'spell_fire' | 'spell_frost' | 'spell_heal' | 'spell_light' | 'spell_shadow' | 'spell_aoe' | 'buff_self';
  sourceX: number; sourceY: number;
  targetX: number; targetY: number;
  bornAt: number;
  duration: number;
}

const AttackFxLayer: React.FC<{
  heroes: Hero[]; enemies: MonsterInstance[];
  enemyPositions: Array<{ id: string; dx: number; dy: number }>;
  partyX: number; partyY: number; now: number;
}> = ({ heroes, enemies, enemyPositions, partyX, partyY, now }) => {
  // Track last-seen attack timestamps to detect new events
  const lastHeroActRef = useRef<Record<string, number>>({});
  const lastMonAtkRef = useRef<Record<string, number>>({});
  const [fx, setFx] = useState<AttackFx[]>([]);

  // Detect new hero attacks
  useEffect(() => {
    const nw = Date.now();
    const newFx: AttackFx[] = [];
    heroes.forEach((h, i) => {
      if (!h.lastAction) return;
      const prev = lastHeroActRef.current[h.id] ?? 0;
      if (h.lastAction.at <= prev) return;
      lastHeroActRef.current[h.id] = h.lastAction.at;
      // Source = hero position
      const src = heroWorldPos(i, partyX, partyY);
      // Target: find enemy or ally
      let tgtX = src.x, tgtY = src.y - 20;
      const enemyPos = enemyPositions.find(p => p.id === h.lastAction!.targetId);
      if (enemyPos) {
        tgtX = partyX * TILE + TILE / 2 + enemyPos.dx;
        tgtY = partyY * TILE + TILE / 2 + enemyPos.dy;
      } else {
        const allyIdx = heroes.findIndex(x => x.id === h.lastAction!.targetId);
        if (allyIdx >= 0) {
          const ap = heroWorldPos(allyIdx, partyX, partyY);
          tgtX = ap.x; tgtY = ap.y;
        }
      }
      const kind = h.lastAction.kind as AttackFx['kind'];
      const dur = kind === 'melee' ? 260 :
                  kind === 'spell_heal' ? 700 :
                  kind === 'spell_aoe' ? 520 :
                  kind === 'buff_self' ? 600 : 380;
      newFx.push({
        id: `hfx_${h.id}_${h.lastAction.at}`,
        kind, sourceX: src.x, sourceY: src.y - 22,
        targetX: tgtX, targetY: tgtY - 6,
        bornAt: nw, duration: dur,
      });
    });
    // Detect new monster attacks
    enemies.forEach(m => {
      if (!m.lastAttack) return;
      const prev = lastMonAtkRef.current[m.id] ?? 0;
      if (m.lastAttack.at <= prev) return;
      lastMonAtkRef.current[m.id] = m.lastAttack.at;
      const ePos = enemyPositions.find(p => p.id === m.id);
      if (!ePos) return;
      const src = { x: partyX * TILE + TILE / 2 + ePos.dx, y: partyY * TILE + TILE / 2 + ePos.dy };
      const heroIdx = heroes.findIndex(h => h.id === m.lastAttack!.targetHeroId);
      if (heroIdx < 0) return;
      const tgt = heroWorldPos(heroIdx, partyX, partyY);
      newFx.push({
        id: `mfx_${m.id}_${m.lastAttack.at}`,
        kind: 'melee',
        sourceX: src.x, sourceY: src.y - 14,
        targetX: tgt.x, targetY: tgt.y - 6,
        bornAt: nw, duration: 260,
      });
    });
    if (newFx.length) setFx(f => [...f.slice(-40), ...newFx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroes, enemies]);

  // Cull
  useEffect(() => {
    const id = window.setInterval(() => {
      const nw = Date.now();
      setFx(list => list.filter(e => nw - e.bornAt < e.duration + 80));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {fx.map(e => <AttackFxDraw key={e.id} e={e} now={now} />)}
    </>
  );
};

const AttackFxDraw: React.FC<{ e: AttackFx; now: number }> = ({ e, now }) => {
  const age = now - e.bornAt;
  if (age > e.duration) return null;
  const dx = e.targetX - e.sourceX;
  const dy = e.targetY - e.sourceY;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const dist = Math.hypot(dx, dy);

  if (e.kind === 'melee') {
    // Slash arc at target
    return (
      <>
        <div className="absolute pointer-events-none"
             style={{
               left: e.targetX, top: e.targetY,
               width: 44, height: 6,
               background: 'linear-gradient(90deg, transparent 0%, #ffffffcc 50%, transparent 100%)',
               filter: 'drop-shadow(0 0 4px #fff)',
               animation: `slashArc ${e.duration}ms ease-out forwards`,
               ['--angle' as any]: `${angle - 18}deg`,
               zIndex: 35,
             }} />
        <div className="absolute pointer-events-none"
             style={{
               left: e.targetX, top: e.targetY,
               width: 44, height: 5,
               background: 'linear-gradient(90deg, transparent 0%, #ffb848dd 50%, transparent 100%)',
               filter: 'drop-shadow(0 0 3px #ffa050)',
               animation: `slashArc ${e.duration}ms ease-out forwards`,
               animationDelay: '30ms',
               ['--angle' as any]: `${angle + 18}deg`,
               zIndex: 35,
             }} />
      </>
    );
  }

  if (e.kind === 'ranged') {
    // Arrow projectile traveling
    return (
      <div className="absolute pointer-events-none"
           style={{
             left: e.sourceX, top: e.sourceY,
             width: 16, height: 3,
             background: 'linear-gradient(90deg, transparent 0%, #f0d8b0 40%, #ffffff 80%, #8a6838 100%)',
             transform: `translate(-50%, -50%) rotate(${angle}deg)`,
             filter: 'drop-shadow(0 0 2px #000)',
             animation: `projectileZip ${e.duration}ms ease-out forwards`,
             ['--dx' as any]: `${dx}px`,
             ['--dy' as any]: `${dy}px`,
             zIndex: 35,
           }} />
    );
  }

  const spellColor =
    e.kind === 'spell_fire' ? '#ff8030' :
    e.kind === 'spell_frost' ? '#7be0ff' :
    e.kind === 'spell_heal' ? '#9aff9a' :
    e.kind === 'spell_light' ? '#ffe580' :
    e.kind === 'spell_shadow' ? '#b06ee0' :
    e.kind === 'spell_aoe' ? '#c070ff' :
    '#ffd060';

  if (e.kind === 'spell_heal') {
    return (
      <div className="absolute pointer-events-none"
           style={{
             left: e.targetX, top: e.targetY,
             fontSize: 18,
             color: spellColor,
             textShadow: `0 0 8px ${spellColor}, 0 0 16px ${spellColor}`,
             animation: `healRise ${e.duration}ms ease-out forwards`,
             zIndex: 35,
           }}>✦</div>
    );
  }

  if (e.kind === 'buff_self') {
    return (
      <div className="absolute pointer-events-none"
           style={{
             left: e.sourceX, top: e.sourceY,
             width: 50, height: 50,
             border: `2px solid ${spellColor}`,
             borderRadius: '50%',
             boxShadow: `0 0 14px ${spellColor}, inset 0 0 14px ${spellColor}80`,
             animation: `buffRing ${e.duration}ms ease-out forwards`,
             zIndex: 35,
           }} />
    );
  }

  if (e.kind === 'spell_aoe') {
    // Expanding ring centered on target (or source if no target)
    return (
      <div className="absolute pointer-events-none"
           style={{
             left: e.targetX, top: e.targetY,
             width: 80, height: 80,
             borderRadius: '50%',
             background: `radial-gradient(circle, ${spellColor}90 0%, ${spellColor}40 50%, transparent 80%)`,
             boxShadow: `0 0 20px ${spellColor}`,
             animation: `spellBurst ${e.duration}ms ease-out forwards`,
             zIndex: 35,
           }} />
    );
  }

  // spell_fire / spell_frost / spell_light / spell_shadow:
  // Projectile + explosion at target
  const projT = Math.min(1, age / (e.duration * 0.6));
  const projDone = projT >= 1;
  return (
    <>
      {!projDone && (
        <div className="absolute pointer-events-none"
             style={{
               left: e.sourceX, top: e.sourceY,
               width: 14, height: 14,
               borderRadius: '50%',
               background: `radial-gradient(circle, #fff 0%, ${spellColor} 50%, transparent 80%)`,
               boxShadow: `0 0 10px ${spellColor}, 0 0 20px ${spellColor}80`,
               transform: `translate(-50%, -50%) translate(${dx * projT}px, ${dy * projT}px)`,
               zIndex: 35,
             }} />
      )}
      {projDone && age - (e.duration * 0.6) < 260 && (
        <div className="absolute pointer-events-none"
             style={{
               left: e.targetX, top: e.targetY,
               width: 44, height: 44,
               borderRadius: '50%',
               background: `radial-gradient(circle, ${spellColor} 0%, ${spellColor}80 40%, transparent 70%)`,
               boxShadow: `0 0 18px ${spellColor}`,
               animation: `spellBurst 260ms ease-out forwards`,
               zIndex: 35,
             }} />
      )}
    </>
  );
};

// ============ Death FX Layer ============

interface DeathFx {
  id: string;
  x: number; y: number;
  icon: string;
  bornAt: number;
  coins: Array<{ id: string; tx: number; ty: number; dr: number; emoji: string; delay: number }>;
  boss: boolean;
  xpGain: number;
  goldGain: number;
}

const DeathFxLayer: React.FC<{
  enemies: MonsterInstance[];
  enemyPositions: Array<{ id: string; dx: number; dy: number }>;
  partyX: number; partyY: number; now: number;
}> = ({ enemies, enemyPositions, partyX, partyY, now }) => {
  const prevRef = useRef<Record<string, { hp: number; maxHp: number }>>({});
  const [deaths, setDeaths] = useState<DeathFx[]>([]);

  useEffect(() => {
    const newDeaths: DeathFx[] = [];
    const seen = new Set<string>();
    for (const m of enemies) {
      seen.add(m.id);
      const p = prevRef.current[m.id];
      if (p && p.hp > 0 && m.hp <= 0) {
        // Just died on this frame
        const ePos = enemyPositions.find(x => x.id === m.id);
        const def = MONSTERS[m.monsterId];
        if (ePos && def) {
          const x = partyX * TILE + TILE / 2 + ePos.dx;
          const y = partyY * TILE + TILE / 2 + ePos.dy;
          const boss = !!def.boss;
          // Generate 3-7 coin/item particles that fly toward top-right
          const n = boss ? 10 : 4;
          const coins = Array.from({ length: n }, (_, i) => ({
            id: `c_${m.id}_${i}`,
            // target offset: top-right corner of screen relative to world position
            // we just fly them up-right by a big amount
            tx: 260 + Math.random() * 180,
            ty: -220 - Math.random() * 120,
            dr: 360 + Math.random() * 360,
            emoji: Math.random() > 0.8 ? (boss ? '💎' : '✨') : '🪙',
            delay: i * 40,
          }));
          newDeaths.push({
            id: `d_${m.id}_${Date.now()}`,
            x, y,
            icon: def.icon,
            bornAt: Date.now(),
            coins,
            boss,
            xpGain: def.xpReward,
            goldGain: Math.floor((def.goldReward[0] + def.goldReward[1]) / 2),
          });
        }
      }
      prevRef.current[m.id] = { hp: m.hp, maxHp: m.maxHp };
    }
    // Also catch any monster that was in prev list but is gone (hp<=0 filtered out of array)
    for (const id of Object.keys(prevRef.current)) {
      if (!seen.has(id)) {
        // Was tracked, now gone. If we didn't already fire death on it, fire now
        const already = newDeaths.find(d => d.id.startsWith(`d_${id}_`));
        if (!already && prevRef.current[id].hp > 0) {
          // We don't have a position anymore — place at party center
          const x = partyX * TILE + TILE / 2;
          const y = partyY * TILE + TILE / 2;
          newDeaths.push({
            id: `d_${id}_${Date.now()}`,
            x, y,
            icon: '💥',
            bornAt: Date.now(),
            coins: Array.from({ length: 3 }, (_, i) => ({
              id: `c_${id}_${i}`,
              tx: 260 + Math.random() * 140,
              ty: -220 - Math.random() * 80,
              dr: 360 + Math.random() * 360,
              emoji: '🪙',
              delay: i * 40,
            })),
            boss: false,
            xpGain: 0,
            goldGain: 0,
          });
        }
        delete prevRef.current[id];
      }
    }
    if (newDeaths.length) setDeaths(d => [...d.slice(-20), ...newDeaths]);
  }, [enemies, enemyPositions, partyX, partyY]);

  // Cull
  useEffect(() => {
    const id = window.setInterval(() => {
      const nw = Date.now();
      setDeaths(ds => ds.filter(d => nw - d.bornAt < 1400));
    }, 250);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {deaths.map(d => {
        const age = now - d.bornAt;
        return (
          <React.Fragment key={d.id}>
            {/* Smoke poof */}
            <div className="absolute pointer-events-none"
                 style={{
                   left: d.x, top: d.y,
                   width: d.boss ? 90 : 56, height: d.boss ? 90 : 56,
                   borderRadius: '50%',
                   background: `radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(180,160,140,0.45) 40%, transparent 75%)`,
                   filter: 'blur(1px)',
                   animation: 'deathPoof 700ms ease-out forwards',
                   zIndex: 25,
                 }} />
            {/* Corpse fly-off */}
            {age < 900 && (
              <div className="absolute pointer-events-none"
                   style={{
                     left: d.x, top: d.y,
                     fontSize: d.boss ? 44 : 28,
                     animation: 'corpseFlyoff 900ms ease-in forwards',
                     ['--dx' as any]: `${(Math.random() - 0.5) * 80}px`,
                     ['--dy' as any]: `${-40 - Math.random() * 40}px`,
                     ['--dr' as any]: `${(Math.random() - 0.5) * 480}deg`,
                     filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.85))',
                     zIndex: 22,
                   }}>
                {d.icon}
              </div>
            )}
            {/* Loot coin arcs */}
            {d.coins.map(c => (
              <span key={c.id} className="absolute pointer-events-none"
                    style={{
                      left: d.x, top: d.y,
                      fontSize: d.boss ? 22 : 16,
                      filter: `drop-shadow(0 0 6px ${c.emoji === '💎' ? '#22D3EE' : c.emoji === '✨' ? '#fff6b0' : '#F2C846'})`,
                      animation: `lootArc 1100ms cubic-bezier(0.4, 0.1, 0.6, 1) forwards`,
                      animationDelay: `${c.delay}ms`,
                      ['--tx' as any]: `${c.tx}px`,
                      ['--ty' as any]: `${c.ty}px`,
                      ['--dr' as any]: `${c.dr}deg`,
                      zIndex: 30,
                    }}>
                {c.emoji}
              </span>
            ))}
            {/* Reward floats — XP + gold */}
            {d.xpGain > 0 && age < 1100 && (
              <div key={`${d.id}_xp`} className="absolute pointer-events-none"
                   style={{
                     left: d.x - 4, top: d.y - 28,
                     transform: `translate(-50%, ${-age * 0.04}px)`,
                     opacity: Math.max(0, 1 - age / 1000),
                     zIndex: 32,
                   }}>
                <span className="text-[11px] font-black"
                      style={{
                        color: '#f2e08a',
                        textShadow: '0 0 4px #d4a943, 1px 1px 0 #000, -1px 1px 0 #000, 1px -1px 0 #000, -1px -1px 0 #000',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                  +{d.xpGain} XP
                </span>
              </div>
            )}
            {d.goldGain > 0 && age < 1100 && (
              <div key={`${d.id}_gp`} className="absolute pointer-events-none"
                   style={{
                     left: d.x + 4, top: d.y - 14,
                     transform: `translate(-50%, ${-age * 0.03}px)`,
                     opacity: Math.max(0, 1 - age / 1000),
                     zIndex: 32,
                   }}>
                <span className="text-[10px] font-black"
                      style={{
                        color: '#ffd860',
                        textShadow: '0 0 4px #d4a943, 1px 1px 0 #000, -1px 1px 0 #000',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                  +{d.goldGain}g
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ============ Ability Cast Announcer ============

interface CastAnnounce {
  id: string;
  heroId: string;
  heroIdx: number;
  abilityName: string;
  abilityIcon: string;
  color: string;
  bornAt: number;
}

const AbilityCastAnnouncer: React.FC<{
  heroes: Hero[]; partyX: number; partyY: number; now: number;
}> = ({ heroes, partyX, partyY, now }) => {
  const lastRef = useRef<Record<string, number>>({});
  const [casts, setCasts] = useState<CastAnnounce[]>([]);

  useEffect(() => {
    const newCasts: CastAnnounce[] = [];
    heroes.forEach((h, i) => {
      if (!h.lastAction?.abilityId) return;
      const prev = lastRef.current[h.id] ?? 0;
      if (h.lastAction.at <= prev) return;
      lastRef.current[h.id] = h.lastAction.at;
      const ab = ABILITIES[h.lastAction.abilityId];
      if (!ab) return;
      const kind = h.lastAction.kind;
      const color =
        kind === 'spell_fire'   ? '#ff8030' :
        kind === 'spell_frost'  ? '#7be0ff' :
        kind === 'spell_heal'   ? '#9aff9a' :
        kind === 'spell_light'  ? '#ffe580' :
        kind === 'spell_shadow' ? '#b06ee0' :
        kind === 'spell_aoe'    ? '#c070ff' :
        kind === 'buff_self'    ? '#f2e08a' :
        kind === 'ranged'       ? '#7FE2A0' :
                                  '#E8E0D4';
      newCasts.push({
        id: `c_${h.id}_${h.lastAction.at}`,
        heroId: h.id,
        heroIdx: i,
        abilityName: ab.name,
        abilityIcon: ab.icon,
        color,
        bornAt: Date.now(),
      });
    });
    if (newCasts.length) setCasts(c => [...c.slice(-15), ...newCasts]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroes]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const nw = Date.now();
      setCasts(cs => cs.filter(c => nw - c.bornAt < 1200));
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {casts.map(c => {
        const pos = heroWorldPos(c.heroIdx, partyX, partyY);
        const age = now - c.bornAt;
        if (age > 1100) return null;
        const t = age / 1100;
        const dy = -26 * t - 12;
        const opacity = t < 0.15 ? t / 0.15 : 1 - Math.max(0, (t - 0.7) / 0.3);
        return (
          <div key={c.id}
               className="absolute pointer-events-none z-40"
               style={{
                 left: pos.x, top: pos.y - 40,
                 transform: `translate(-50%, ${dy}px)`,
                 opacity,
               }}>
            <div className="px-2 py-0.5 rounded-sm border flex items-center gap-1"
                 style={{
                   background: 'rgba(0,0,0,0.85)',
                   borderColor: c.color,
                   boxShadow: `0 0 8px ${c.color}`,
                 }}>
              <span className="text-[12px]" style={{ filter: `drop-shadow(0 0 3px ${c.color})` }}>
                {c.abilityIcon}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider"
                    style={{
                      color: c.color,
                      fontFamily: "'JetBrains Mono', monospace",
                      textShadow: `0 0 4px ${c.color}, 0 1px 0 #000`,
                    }}>
                {c.abilityName}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
};

// ============ Tile Resolve FX Layer ============

interface TileResolveFx {
  id: string;
  x: number; y: number;
  kind: 'chest' | 'shrine' | 'fountain' | 'trap' | 'merchant' | 'fork';
  bornAt: number;
}

const TileResolveFxLayer: React.FC<{ dungeon: any; now: number }> = ({ dungeon, now }) => {
  const prevClearedRef = useRef<Record<string, boolean>>({});
  const [fx, setFx] = useState<TileResolveFx[]>([]);

  useEffect(() => {
    const newFx: TileResolveFx[] = [];
    for (const t of dungeon.tiles) {
      const key = `${t.x},${t.y}`;
      const was = prevClearedRef.current[key] ?? false;
      const now2 = !!t.cleared;
      if (!was && now2) {
        // Just cleared — fire FX for reward tiles
        if (['chest', 'shrine', 'fountain', 'trap', 'merchant', 'fork'].includes(t.kind)) {
          newFx.push({
            id: `r_${key}_${Date.now()}`,
            x: t.x * TILE + TILE / 2,
            y: t.y * TILE + TILE / 2,
            kind: t.kind,
            bornAt: Date.now(),
          });
        }
      }
      prevClearedRef.current[key] = now2;
    }
    if (newFx.length) setFx(f => [...f.slice(-15), ...newFx]);
  }, [dungeon.tiles, dungeon.pathIndex]);

  // Cull
  useEffect(() => {
    const id = window.setInterval(() => {
      const nw = Date.now();
      setFx(list => list.filter(e => nw - e.bornAt < 1500));
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      {fx.map(e => {
        const age = now - e.bornAt;
        const color =
          e.kind === 'chest'    ? '#F2C846' :
          e.kind === 'shrine'   ? '#9aff9a' :
          e.kind === 'fountain' ? '#6EA9E4' :
          e.kind === 'trap'     ? '#E86E6E' :
          e.kind === 'merchant' ? '#F2B84B' :
                                  '#F2E6A8';
        // Sparkle burst particles
        const particles = 10;
        return (
          <React.Fragment key={e.id}>
            {/* Expanding ring */}
            <div className="absolute pointer-events-none"
                 style={{
                   left: e.x, top: e.y,
                   width: 90, height: 90,
                   borderRadius: '50%',
                   background: `radial-gradient(circle, ${color}aa 0%, ${color}40 30%, transparent 70%)`,
                   boxShadow: `0 0 32px ${color}`,
                   animation: 'spellBurst 1s ease-out forwards',
                   zIndex: 18,
                 }} />
            {/* Sparkles */}
            {age < 1200 && Array.from({ length: particles }).map((_, i) => {
              const ang = (i / particles) * Math.PI * 2;
              const tx = Math.cos(ang) * 50;
              const ty = Math.sin(ang) * 50 - 10;
              return (
                <span key={i} className="absolute pointer-events-none"
                      style={{
                        left: e.x, top: e.y,
                        fontSize: 14,
                        filter: `drop-shadow(0 0 6px ${color})`,
                        animation: `lootArc 1000ms ease-out forwards`,
                        ['--tx' as any]: `${tx}px`,
                        ['--ty' as any]: `${ty}px`,
                        ['--dr' as any]: `${(Math.random() - 0.5) * 360}deg`,
                        zIndex: 28,
                      }}>
                  {e.kind === 'chest' ? (Math.random() > 0.5 ? '🪙' : '💎') :
                   e.kind === 'shrine' ? '✨' :
                   e.kind === 'fountain' ? '💧' :
                   e.kind === 'trap' ? '⚠' :
                   e.kind === 'merchant' ? '🎁' : '✨'}
                </span>
              );
            })}
            {/* Label */}
            {age < 900 && (
              <div className="absolute pointer-events-none"
                   style={{
                     left: e.x, top: e.y - 36,
                     transform: 'translate(-50%, 0)',
                     animation: 'healRise 900ms ease-out forwards',
                     zIndex: 29,
                   }}>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: 'rgba(0,0,0,0.75)',
                        color,
                        fontFamily: "'JetBrains Mono', monospace",
                        textShadow: `0 0 6px ${color}`,
                        border: `1px solid ${color}`,
                      }}>
                  {e.kind === 'chest'    ? 'CHEST OPENED' :
                   e.kind === 'shrine'   ? 'SHRINE BLESSING' :
                   e.kind === 'fountain' ? 'FOUNTAIN' :
                   e.kind === 'trap'     ? 'TRAP!' :
                   e.kind === 'merchant' ? 'MERCHANT' : 'FORK'}
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

// ============ helpers ============

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return (h % 1000) / 100;
}
