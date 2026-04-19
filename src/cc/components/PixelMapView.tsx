import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Tile, MonsterInstance, Hero, Rarity } from '../types';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { ITEMS } from '../data/items';
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

  // Interpolate current party x/y
  const anim = posAnimRef.current;
  const WALK_MS = 500;
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

        {/* Path connectors — highlight visited path with a subtle golden glow */}
        {dungeon.path.slice(0, dungeon.pathIndex + 1).map((p, i) => (
          <div key={`p${i}`}
               className="absolute pointer-events-none"
               style={{
                 left: p.x * TILE, top: p.y * TILE,
                 width: TILE, height: TILE,
                 background: `radial-gradient(circle, ${theme.accentColor}18 0%, transparent 60%)`,
               }} />
        ))}

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
    // Subtle marker on cleared tiles
    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-30 text-2xl">
        ·
      </div>
    );
  }
  const map: Partial<Record<Tile['kind'], { icon: string; color: string }>> = {
    entrance: { icon: '🚪', color: '#B8A890' },
    boss:     { icon: '👑', color: '#ff5050' },
    chest:    { icon: '📦', color: '#D4A943' },
    trap:     { icon: '⚠',  color: '#ff6060' },
    shrine:   { icon: '⛩',  color: '#7FE2A0' },
    fountain: { icon: '⛲',  color: '#6EA9E4' },
    fork:     { icon: '🛤',  color: '#F2E6A8' },
    merchant: { icon: '🧳',  color: '#F2B84B' },
    exit:     { icon: '🚪', color: '#B8A890' },
  };
  const d = map[tile.kind];
  if (!d) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center"
         style={{ filter: `drop-shadow(0 0 6px ${d.color}) drop-shadow(0 2px 2px rgba(0,0,0,0.8))` }}>
      <span style={{ fontSize: 34 }}>{d.icon}</span>
    </div>
  );
};

// ============ Party on Tile ============

const PartyOnTile: React.FC<{
  heroes: Hero[]; tileX: number; tileY: number; now: number; walking: boolean; walkDir: string;
}> = ({ heroes, tileX, tileY, now, walking }) => {
  // 4-hero 2x2 cluster within the tile — spread a bit wider so each plate has room.
  const offsets = [
    { dx: -18, dy: -8 },
    { dx:  18, dy: -8 },
    { dx: -18, dy: 12 },
    { dx:  18, dy: 12 },
  ];
  return (
    <>
      {heroes.slice(0, 4).map((h, i) => {
        const o = offsets[i];
        const bob = walking ? Math.sin((now / 120) + i) * 3 : Math.sin((now / 500) + i) * 1.2;
        const lx = tileX * TILE + TILE / 2 + o.dx;
        const ly = tileY * TILE + TILE / 2 + o.dy + bob;
        const cls = CLASSES[h.classId];
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
  const bob = Math.sin((now / 400) + hashHue(monster.id)) * 2;
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
           transform: `translate(-50%, -100%) translate(${lungeX}px, ${bob}px)`,
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
               style={{ transform: 'translateX(-50%) scaleX(-1)', fontFamily: "'JetBrains Mono', monospace" }}>
            STUNNED!
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
  const CELL = 6;
  const W = dungeon.width * CELL;
  const H = dungeon.height * CELL;
  return (
    <div className="absolute top-2 right-2 z-20 p-1.5 bg-black/70 rounded-lg border border-[#3D3328]">
      <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest mb-1 text-center"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Map · F{dungeon.floor}
      </div>
      <div className="relative" style={{ width: W, height: H }}>
        {dungeon.tiles.map((t: any) => {
          const inPath = dungeon.path.some((p: any) => p.x === t.x && p.y === t.y);
          if (!inPath && !t.revealed) return null;
          const isHere = t.x === dungeon.partyPos.x && t.y === dungeon.partyPos.y;
          const color =
            isHere           ? theme.accentColor :
            t.kind === 'boss'? '#ff4040' :
            t.cleared        ? '#5a5040' :
                               '#B8A890';
          return (
            <div key={`${t.x},${t.y}`}
                 className="absolute rounded-sm"
                 style={{
                   left: t.x * CELL, top: t.y * CELL,
                   width: CELL - 1, height: CELL - 1,
                   background: color,
                   boxShadow: isHere ? `0 0 6px ${theme.accentColor}` : undefined,
                 }} />
          );
        })}
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
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100,
    size: 3 + Math.random() * 8, dur: 3 + Math.random() * 5,
  })), [theme]);
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full"
             style={{
               left: `${p.x}%`, top: `${p.y}%`,
               width: p.size, height: p.size,
               background: theme.accentColor,
               opacity: 0.08,
               animation: `ambientFloat ${p.dur}s ease-in-out infinite alternate`,
               filter: 'blur(1px)',
             }} />
      ))}
    </div>
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
