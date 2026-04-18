import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Hero, MonsterInstance, Tile, Rarity } from '../types';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { ABILITIES } from '../data/abilities';
import { ITEMS } from '../data/items';
import { themeFor, DungeonTheme } from '../visuals/dungeonTheme';
import { effectiveStats, totalArmor, weaponPower } from '../engine/util';

/* ============================================================
   Isometric Clickpocalypse-style Battle View
   - Tilted floor via CSS 3D (rotateX)
   - Back walls as tall planes attached to the back edges
   - Sprites counter-rotate to face the camera
   - Roster + spells + inventory grid in bottom panel
   ============================================================ */

interface Float {
  id: string;
  targetId: string;
  text: string;
  color: string;
  big?: boolean;
  crit?: boolean;
  bornAt: number;
}

interface Flash {
  targetId: string;
  until: number;
  kind: 'dmg' | 'heal' | 'crit';
}

interface DroppedLoot {
  id: string;
  itemId: string;
  x: number;     // % across room floor
  y: number;     // % down room floor
  bornAt: number;
}

interface SpriteSlot {
  x: number;     // % across room floor (0..100)
  y: number;     // % down room floor (0..100)
}

interface Props {
  state: GameState;
  clickMonster?: (monsterId: string) => void;
  autoEquipBest?: () => void;
  quickHealParty?: () => void;
  reviveHero?: (heroId: string) => void;
}

// Deterministic scatter so sprite positions don't jitter between renders
function stableRand(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h % 1000) / 1000;
}

export const BattleView: React.FC<Props> = ({ state, clickMonster, autoEquipBest, quickHealParty, reviveHero }) => {
  const dungeon = state.activeDungeon!;
  const theme = themeFor(dungeon.defId);
  const tile = dungeon.tiles.find(t => t.x === dungeon.partyPos.x && t.y === dungeon.partyPos.y)!;

  const heroes = state.heroes.filter(h => !h.bench);
  const enemies = tile.encounter?.monsters ?? [];

  // ---- Live animation tick ----
  const [, setNowTick] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => { setNowTick(Date.now()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const nowTick = Date.now();

  // ---- HP diffing for floats/flashes/loot pops ----
  const prevHpRef = useRef<Record<string, { hp: number; maxHp: number }>>({});
  const prevTileKey = useRef<string>('');
  const [floats, setFloats] = useState<Float[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [floorLoot, setFloorLoot] = useState<DroppedLoot[]>([]);
  const [bossBanner, setBossBanner] = useState<{ name: string; until: number } | null>(null);
  const [tileTag, setTileTag] = useState<string | null>(null);

  useEffect(() => {
    const now = Date.now();
    const newFloats: Float[] = [];
    const newFlashes: Flash[] = [];
    const all: Array<{ id: string; hp: number; maxHp: number }> = [];
    for (const h of state.heroes) all.push({ id: h.id, hp: h.hp, maxHp: h.maxHp });
    for (const m of enemies) all.push({ id: m.id, hp: m.hp, maxHp: m.maxHp });

    for (const c of all) {
      const prev = prevHpRef.current[c.id];
      if (prev === undefined) continue;
      const diff = c.hp - prev.hp;
      if (Math.abs(diff) < 0.5) continue;
      const isCrit = diff < 0 && Math.abs(diff) > prev.maxHp * 0.18;
      if (diff < 0) {
        newFloats.push({
          id: `f_${now}_${c.id}_${Math.random()}`,
          targetId: c.id,
          text: `-${Math.abs(Math.round(diff))}`,
          color: isCrit ? '#ff4040' : '#ffe0b0',
          big: isCrit, crit: isCrit, bornAt: now,
        });
        newFlashes.push({ targetId: c.id, until: now + 180, kind: isCrit ? 'crit' : 'dmg' });
        // loot drop when a monster goes to 0
        if (prev.hp > 0 && c.hp <= 0) {
          const mon = enemies.find(m => m.id === c.id);
          if (mon) {
            const def = MONSTERS[mon.monsterId];
            if (def) {
              // Pick one loot table entry to visualize on floor (rough)
              const dropRoll = def.lootTable.find(l => Math.random() < l.chance) ?? def.lootTable[0];
              const itemId = dropRoll?.itemId ?? 'gold_nugget';
              const baseSlot = enemySlots.find(s => s.heroId === c.id);
              setFloorLoot(list => [...list.slice(-12), {
                id: `loot_${now}_${c.id}`,
                itemId,
                x: baseSlot ? baseSlot.x : 50 + (Math.random() - 0.5) * 20,
                y: baseSlot ? baseSlot.y : 55 + (Math.random() - 0.5) * 10,
                bornAt: now,
              }]);
            }
          }
        }
      } else {
        newFloats.push({
          id: `f_${now}_${c.id}_${Math.random()}`,
          targetId: c.id,
          text: `+${Math.round(diff)}`,
          color: '#7FE2A0',
          bornAt: now,
        });
        newFlashes.push({ targetId: c.id, until: now + 180, kind: 'heal' });
      }
    }
    if (newFloats.length) setFloats(f => [...f.slice(-50), ...newFloats]);
    if (newFlashes.length) setFlashes(f => [...f.filter(x => x.until > now), ...newFlashes]);

    const next: Record<string, { hp: number; maxHp: number }> = {};
    for (const h of state.heroes) next[h.id] = { hp: h.hp, maxHp: h.maxHp };
    for (const m of enemies) next[m.id] = { hp: m.hp, maxHp: m.maxHp };
    prevHpRef.current = next;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Cull
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setFloats(f => f.filter(x => now - x.bornAt < 1100));
      setFlashes(f => f.filter(x => x.until > now));
      setFloorLoot(l => l.filter(x => now - x.bornAt < 15_000)); // loot stays 15s
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  // Boss banner + tile-entry tag
  useEffect(() => {
    const key = `${dungeon.partyPos.x},${dungeon.partyPos.y}`;
    if (key === prevTileKey.current) return;
    prevTileKey.current = key;
    // reset floor loot when the party moves rooms
    setFloorLoot([]);
    const now = Date.now();
    if (tile.kind === 'boss' && tile.encounter && tile.encounter.monsters.length > 0) {
      const bossDef = tile.encounter.monsters[0] && MONSTERS[tile.encounter.monsters[0].monsterId];
      setBossBanner({ name: bossDef?.name ?? 'BOSS', until: now + 2400 });
    }
    const labels: Partial<Record<Tile['kind'], string>> = {
      monster: 'MONSTERS!',
      chest: 'Treasure chest',
      trap: 'Trap sprung!',
      shrine: 'An ancient shrine',
      fountain: 'Strange fountain',
      fork: 'The path splits',
      merchant: 'A merchant',
      boss: 'BOSS ENCOUNTER!',
      entrance: 'Entering dungeon',
      exit: 'Portal home',
      empty: '',
    };
    setTileTag(labels[tile.kind] || null);
    window.setTimeout(() => setTileTag(null), 2500);
  }, [dungeon.partyPos.x, dungeon.partyPos.y, tile]);

  useEffect(() => {
    if (!bossBanner) return;
    const t = window.setTimeout(() => setBossBanner(null), Math.max(0, bossBanner.until - Date.now()));
    return () => window.clearTimeout(t);
  }, [bossBanner]);

  // Sprite scatter: place heroes on the party side, enemies on the enemy side,
  // but with cluster jitter so they mix at the center.
  const heroSlots: Array<{ heroId: string; x: number; y: number; depth: number }> = useMemo(() =>
    heroes.map((h, i) => {
      // Heroes on the left side of the melee scrum, in a 2x2 formation
      const baseX = 35 + (i % 2) * 6;
      const baseY = 45 + Math.floor(i / 2) * 12;
      const jx = (stableRand(h.id, 7) - 0.5) * 5;
      const jy = (stableRand(h.id, 17) - 0.5) * 5;
      return { heroId: h.id, x: baseX + jx, y: baseY + jy, depth: baseY + jy };
    }),
  [heroes]);

  const enemySlots: Array<{ heroId: string; x: number; y: number; depth: number }> = useMemo(() =>
    enemies.map((m, i) => {
      // Enemies adjacent to the heroes — melee range
      const baseX = 56 + (i % 2) * 6;
      const baseY = 45 + Math.floor(i / 2) * 12;
      const jx = (stableRand(m.id, 5) - 0.5) * 6;
      const jy = (stableRand(m.id, 11) - 0.5) * 5;
      return { heroId: m.id, x: baseX + jx, y: baseY + jy, depth: baseY + jy };
    }),
  [enemies]);

  // Depth-sort so closer sprites paint over further ones
  const spriteOrder = useMemo(() => {
    const all: Array<{ kind: 'hero' | 'enemy'; id: string; x: number; y: number; depth: number }> = [];
    heroSlots.forEach(s => all.push({ kind: 'hero', id: s.heroId, x: s.x, y: s.y, depth: s.depth }));
    enemySlots.forEach(s => all.push({ kind: 'enemy', id: s.heroId, x: s.x, y: s.y, depth: s.depth }));
    all.sort((a, b) => a.depth - b.depth);
    return all;
  }, [heroSlots, enemySlots]);

  // Low HP
  const lowHP = heroes.some(h => h.state === 'alive' && h.hp / h.maxHp < 0.25);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: '#000' }}>
      {/* Top area: stage + right panel */}
      <div className="flex-1 flex overflow-hidden">
      {/* STAGE */}
      <div className="relative flex-1 overflow-hidden" style={{ background: `radial-gradient(ellipse at center 30%, #1a1612 0%, #050403 80%)` }}>
        <AmbientLayer theme={theme} />

        {/* Dungeon badge top-left */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg border"
             style={{ borderColor: theme.accentColor + '70', color: theme.accentColor }}>
          <span className="text-xl">{dungeon.icon}</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.25em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {dungeon.name}
            </div>
            <div className="text-[10px] text-[#B8A890]">
              Room {dungeon.pathIndex + 1}/{dungeon.path.length} · Floor {dungeon.floor}
            </div>
          </div>
        </div>

        {/* Progress tile ribbon top-right */}
        <DungeonProgress state={state} theme={theme} />

        {/* Tile entry tag (empty corridors / shrines etc.) */}
        {tileTag && tile.kind !== 'monster' && tile.kind !== 'boss' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-4 py-1 rounded-full border"
               style={{
                 background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.7), transparent)',
                 borderColor: theme.accentColor + '70',
                 color: theme.accentColor,
                 animation: 'fadeIn 0.3s',
               }}>
            <span className="text-xs font-bold uppercase tracking-[0.3em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {tileTag}
            </span>
          </div>
        )}

        {/* CC2-style "An Encounter!" banner at the bottom while fighting */}
        {enemies.length > 0 && tile.kind !== 'boss' && (
          <EncounterBanner enemies={enemies} />
        )}

        {/* The tilted isometric room */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="relative"
            style={{
              width: '82%',
              height: '80%',
              marginTop: '2%',
              perspective: '1500px',
              perspectiveOrigin: '50% 20%',
            }}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: 'preserve-3d',
                transform: 'rotateX(58deg)',
              }}
            >
              {/* Floor */}
              <RoomFloor theme={theme} />
              {/* Back walls (the two visible in iso view) */}
              <BackWall side="top" theme={theme} doorway={pathHasDoorway(dungeon, 'forward')} />
              <BackWall side="right" theme={theme} doorway={pathHasDoorway(dungeon, 'right')} />

              {/* Loot on floor (lays flat on the tilted floor) */}
              {floorLoot.map(l => (
                <FloorLoot key={l.id} loot={l} />
              ))}

              {/* Sprites — positioned on the tilted plane, counter-rotated to face camera */}
              {spriteOrder.map(s => {
                const commonStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: `${s.x}%`, top: `${s.y}%`,
                  transform: 'translate(-50%, -100%) rotateX(-58deg)',
                  transformOrigin: '50% 100%',
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'auto',
                };
                if (s.kind === 'hero') {
                  const h = heroes.find(x => x.id === s.id)!;
                  const flash = flashes.find(f => f.targetId === s.id);
                  return (
                    <div key={s.id} style={commonStyle}>
                      <HeroSpriteBody hero={h} flash={flash} nowTick={nowTick} />
                    </div>
                  );
                } else {
                  const m = enemies.find(x => x.id === s.id)!;
                  const flash = flashes.find(f => f.targetId === s.id);
                  return (
                    <div key={s.id} style={commonStyle}>
                      <MonsterSpriteBody
                        monster={m} flash={flash} nowTick={nowTick}
                        onClick={clickMonster ? () => clickMonster(s.id) : undefined}
                      />
                    </div>
                  );
                }
              })}

              {/* Floating damage numbers — positioned on floor, counter-rotated */}
              {floats.map(f => {
                const hIdx = heroSlots.find(s => s.heroId === f.targetId);
                const eIdx = enemySlots.find(s => s.heroId === f.targetId);
                const pos = hIdx ?? eIdx;
                if (!pos) return null;
                return (
                  <div key={f.id}
                       className="absolute pointer-events-none z-30"
                       style={{
                         left: `${pos.x}%`, top: `${pos.y}%`,
                         transform: 'translate(-50%, -170%) rotateX(-58deg)',
                         transformOrigin: '50% 100%',
                       }}>
                    <FloatingNumberBody float={f} nowTick={nowTick} />
                  </div>
                );
              })}

              {/* Mid-room "searching" indicator */}
              {enemies.length === 0 && dungeon.moveTimer > 0 && (
                <div className="absolute" style={{
                       left: '50%', top: '50%',
                       transform: 'translate(-50%, -50%) rotateX(-58deg)',
                       transformOrigin: '50% 50%',
                     }}>
                  <MidRoomRing dungeon={dungeon} theme={theme} />
                </div>
              )}
            </div>

            {/* Boss banner — overlay above the iso stage, flat */}
            {bossBanner && (
              <div className="absolute left-1/2 top-[18%] -translate-x-1/2 z-50 pointer-events-none"
                   style={{ animation: 'bossEntrance 0.9s ease-out forwards' }}>
                <div className="text-center">
                  <div className="text-[10px] text-[#ff6060] uppercase tracking-[0.5em] font-bold mb-1"
                       style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 10px #ff4040' }}>
                    ⚠ BOSS ENCOUNTER ⚠
                  </div>
                  <div className="text-4xl font-black text-[#ff5050] px-6 py-1 bg-[#4a1818]/85 border-2 border-[#ff4040] rounded"
                       style={{
                         fontFamily: "'Cinzel', serif",
                         textShadow: '0 0 20px #ff4040, 2px 2px 0 #000',
                         letterSpacing: '0.08em',
                       }}>
                    {bossBanner.name.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Low-HP red pulse overlay */}
        {lowHP && (
          <div className="absolute inset-0 pointer-events-none z-10"
               style={{
                 boxShadow: 'inset 0 0 120px rgba(255, 40, 40, 0.55)',
                 animation: 'ambientFloat 1.2s ease-in-out infinite alternate',
               }} />
        )}
      </div>

      {/* RIGHT QUICK-ACTIONS PANEL */}
      <RightPanel state={state}
                  autoEquipBest={autoEquipBest}
                  quickHealParty={quickHealParty}
                  reviveHero={reviveHero} />

      </div> {/* end stage+right row */}

      {/* BOTTOM PANEL */}
      <BottomPanel state={state} />
    </div>
  );
};

// ============ Room Floor ============

const RoomFloor: React.FC<{ theme: DungeonTheme }> = ({ theme }) => {
  return (
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(ellipse at 50% 35%, ${theme.floorLight} 0%, ${theme.floorMid} 55%, ${theme.floorDark} 100%)
        `,
        boxShadow: `
          inset 0 0 140px rgba(0,0,0,0.65),
          inset 0 0 40px ${theme.vignetteColor}
        `,
      }}
    >
      {/* Stone tile pattern — textured paving with darker grout */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, rgba(0,0,0,0.08) 0%, transparent 25%),
            radial-gradient(circle at 80% 60%, rgba(0,0,0,0.1) 0%, transparent 30%),
            radial-gradient(circle at 45% 85%, rgba(0,0,0,0.06) 0%, transparent 20%),
            repeating-linear-gradient(45deg,
              transparent 0 36px,
              rgba(0,0,0,0.18) 36px 38px,
              transparent 38px 74px),
            repeating-linear-gradient(-45deg,
              transparent 0 36px,
              rgba(0,0,0,0.18) 36px 38px,
              transparent 38px 74px)
          `,
          opacity: 0.7,
        }}
      />
      {/* Speckled stone dots */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.25 }}>
        <defs>
          <pattern id="speckle" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="6" r="1" fill="rgba(0,0,0,0.4)" />
            <circle cx="14" cy="3" r="0.6" fill="rgba(0,0,0,0.35)" />
            <circle cx="19" cy="16" r="1" fill="rgba(0,0,0,0.35)" />
            <circle cx="9" cy="20" r="0.8" fill="rgba(0,0,0,0.4)" />
            <circle cx="2" cy="18" r="0.5" fill="rgba(255,255,255,0.08)" />
            <circle cx="21" cy="8" r="0.4" fill="rgba(255,255,255,0.08)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#speckle)" />
      </svg>
      {/* Floor debris */}
      <div className="absolute inset-0" style={{ opacity: 0.28 }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="absolute"
                style={{
                  left: `${(i * 11.7 + 6) % 85 + 8}%`,
                  top: `${(i * 15.3 + 9) % 75 + 12}%`,
                  fontSize: 16 + (i % 3) * 6,
                  filter: 'grayscale(70%) contrast(0.75) brightness(0.7)',
                }}>
            {theme.bgEmoji[i % theme.bgEmoji.length]}
          </span>
        ))}
      </div>
    </div>
  );
};

// ============ Back Walls ============

const BackWall: React.FC<{
  side: 'top' | 'right';
  theme: DungeonTheme;
  doorway?: boolean;
}> = ({ side, theme, doorway }) => {
  const WALL_H = 160;

  // Build an SVG that represents the wall face with a crenelated top edge,
  // brick seams, and an optional doorway cut out.
  // The SVG stretches to 100%/100% so rotation math is independent.
  const brickRows = 8;
  const brickCols = 14;
  const crenelTeeth = 24;

  // Build crenelation outline: toothed top edge
  const crenelHeight = 18; // px in SVG coords
  const toothW = 1000 / crenelTeeth;
  const crenelPath: string[] = [];
  for (let i = 0; i < crenelTeeth; i++) {
    const x = i * toothW;
    if (i === 0) crenelPath.push(`M ${x} ${crenelHeight}`);
    // tooth up
    crenelPath.push(`L ${x} 0`);
    crenelPath.push(`L ${x + toothW * 0.5} 0`);
    // back down into notch
    crenelPath.push(`L ${x + toothW * 0.5} ${crenelHeight}`);
    crenelPath.push(`L ${x + toothW} ${crenelHeight}`);
  }
  // close bottom rectangle
  crenelPath.push(`L 1000 400 L 0 400 Z`);

  const doorwayCut = doorway ? (
    <path d={`M 420 400 L 420 260 Q 420 180 500 180 Q 580 180 580 260 L 580 400 Z`} fill="black" />
  ) : null;

  const outerStyle: React.CSSProperties = side === 'top'
    ? {
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: WALL_H,
        transform: `rotateX(-90deg) translateY(${-WALL_H}px)`,
        transformOrigin: 'top',
      }
    : {
        position: 'absolute',
        top: 0, right: 0, width: WALL_H, height: '100%',
        transform: `rotateY(-90deg) translateX(${WALL_H}px)`,
        transformOrigin: 'right',
      };

  return (
    <div style={outerStyle}>
      <svg viewBox="0 0 1000 400" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`wg_${side}_${theme.wallTop.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={theme.wallTop} />
            <stop offset="25%" stopColor={theme.wallLight} />
            <stop offset="80%" stopColor={theme.wallMid} />
            <stop offset="100%" stopColor={theme.wallDark} />
          </linearGradient>
        </defs>
        {/* Wall body with crenelated top */}
        <path d={crenelPath.join(' ')} fill={`url(#wg_${side}_${theme.wallTop.replace('#','')})`} />
        {/* Brick vertical mortar lines */}
        {Array.from({ length: brickRows }).map((_, r) => {
          const y1 = crenelHeight + (400 - crenelHeight) * (r / brickRows);
          const y2 = crenelHeight + (400 - crenelHeight) * ((r + 1) / brickRows);
          const offset = (r % 2) * (1000 / brickCols / 2);
          return (
            <g key={r}>
              {/* horizontal seam */}
              <line x1="0" y1={y1} x2="1000" y2={y1} stroke={theme.wallMortar} strokeWidth="1.2" opacity="0.6" />
              {/* vertical seams with offset */}
              {Array.from({ length: brickCols }).map((_, c) => {
                const x = offset + c * (1000 / brickCols);
                return <line key={c} x1={x} y1={y1} x2={x} y2={y2} stroke={theme.wallMortar} strokeWidth="1.2" opacity="0.55" />;
              })}
              {/* subtle highlight on top of each row */}
              <line x1="0" y1={y1 + 1.5} x2="1000" y2={y1 + 1.5} stroke={theme.wallTop} strokeWidth="0.6" opacity="0.25" />
            </g>
          );
        })}
        {/* Shadow at bottom where wall meets floor */}
        <rect x="0" y="360" width="1000" height="40" fill="url(#wallShadow)" opacity="0.5" />
        {/* Doorway cutout (overlays wall face with black) */}
        {doorwayCut}
        {/* Crenelation detail — darker outline on tooth tops */}
        {Array.from({ length: crenelTeeth }).map((_, i) => (
          <line key={i}
                x1={i * toothW} y1="0" x2={i * toothW + toothW * 0.5} y2="0"
                stroke={theme.wallDark} strokeWidth="1.5" />
        ))}
        <defs>
          <linearGradient id="wallShadow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.8)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// ============ Hero sprite body ============

const HeroSpriteBody: React.FC<{
  hero: Hero; flash?: Flash; nowTick: number;
}> = ({ hero, flash, nowTick }) => {
  const cls = CLASSES[hero.classId];
  const hpPct = Math.max(0, (hero.hp / hero.maxHp) * 100);
  const mpPct = hero.maxMp > 0 ? Math.max(0, (hero.mp / hero.maxMp) * 100) : 0;
  const downed = hero.state !== 'alive';
  const bob = Math.sin((nowTick / 450) + hashHue(hero.id)) * 2;
  const casting = hero.attackTimer < 120 && !downed;
  const flashColor = flash?.kind === 'heal' ? '#7FE2A0' : flash?.kind === 'crit' ? '#ff4040' : '#ffffff';

  return (
    <div className="flex flex-col items-center"
           style={{
             filter: downed ? 'grayscale(100%) opacity(0.45)' : flash ? `drop-shadow(0 0 10px ${flashColor})` : undefined,
             transform: `translateY(${bob}px) ${casting ? 'translateX(8px)' : ''}`,
             transition: 'transform 180ms ease-out',
           }}>
      {/* Name + HP bars (tiny, CC2-style) */}
      <div style={{ minWidth: 70, marginBottom: 2 }}>
        <div className="px-1 py-px bg-black/75 rounded-sm border border-black/70 text-center"
             style={{ fontFamily: "'Nunito', sans-serif" }}>
          <div className="text-[9px] font-bold leading-none truncate"
               style={{ color: cls.color, textShadow: '0 1px 0 #000' }}>
            {hero.name}
          </div>
        </div>
        <div className="h-1 bg-black/80 overflow-hidden relative" style={{ marginTop: 1 }}>
          <div className="h-full" style={{ width: hpPct + '%', background: '#dc2020', transition: 'width 200ms ease-out' }} />
        </div>
        {hero.maxMp > 0 && (
          <div className="h-0.5 bg-black/80 overflow-hidden">
            <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc', transition: 'width 200ms' }} />
          </div>
        )}
      </div>

      {/* The sprite itself */}
      <div className="relative">
        {/* Shadow */}
        <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
             style={{ width: 36, height: 7, bottom: -4, background: 'radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, transparent 70%)' }} />
        {/* Chunky pixel character */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 44, height: 44,
            background: `radial-gradient(circle at 35% 30%, ${cls.color}e6 0%, ${cls.color}66 55%, ${cls.color}00 100%)`,
            border: `2px solid ${cls.color}`,
            borderRadius: '50% 50% 42% 42% / 55% 55% 45% 45%',
            boxShadow: `0 0 8px ${cls.color}90, inset 0 -6px 10px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="text-2xl select-none"
               style={{
                 filter: 'drop-shadow(1px 1px 0 #000) drop-shadow(-1px 1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(0 2px 2px rgba(0,0,0,0.6))',
               }}>
            {cls.icon}
          </div>
          {/* Shield indicator */}
          {hero.shield > 0 && (
            <div className="absolute inset-0 rounded-[inherit] animate-pulse pointer-events-none"
                 style={{ boxShadow: `inset 0 0 10px #6EA9E4, 0 0 14px #6EA9E480`, border: '2px solid #6EA9E4' }} />
          )}
          {/* Flash overlay */}
          {flash && (
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
                 style={{ background: flashColor, mixBlendMode: 'screen', opacity: 0.6 }} />
          )}
          {/* "!" ability point indicator */}
          {hero.abilityPoints > 0 && (
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#D4A943] text-black text-[9px] font-black flex items-center justify-center animate-pulse shadow">
              !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Monster sprite body ============

const MonsterSpriteBody: React.FC<{
  monster: MonsterInstance; flash?: Flash; nowTick: number; onClick?: () => void;
}> = ({ monster, flash, nowTick, onClick }) => {
  const def = MONSTERS[monster.monsterId];
  if (!def) return null;
  const hpPct = Math.max(0, (monster.hp / monster.maxHp) * 100);
  const bob = Math.sin((nowTick / 380) + hashHue(monster.id)) * 2;
  const attacking = monster.attackTimer < 150;
  const flashColor = flash?.kind === 'crit' ? '#ff4040' : '#ffffff';
  const stunned = monster.stunRemaining > 0;
  const isBoss = def.boss;
  const size = isBoss ? 58 : 40;

  return (
    <div className={`flex flex-col items-center ${onClick ? 'cursor-crosshair' : ''}`}
         onClick={onClick}
         style={{
           filter: flash ? `drop-shadow(0 0 10px ${flashColor})` : undefined,
           transform: `translateY(${bob}px) ${attacking ? 'translateX(-10px)' : ''}`,
           transition: 'transform 140ms ease-out',
           animation: monster.hp <= 0 ? 'fadeOut 0.5s forwards' : 'popIn 0.5s ease-out',
         }}>
      {/* Name + HP */}
      <div style={{ minWidth: isBoss ? 110 : 70, marginBottom: 2 }}>
        <div className="px-1 py-px bg-black/80 rounded-sm border text-center"
             style={{ borderColor: isBoss ? '#ff4040' : 'rgba(0,0,0,0.6)' }}>
          <div className={`text-[9px] font-bold leading-none truncate ${isBoss ? 'text-[#ff8a5a]' : 'text-[#F2E6A8]'}`}
               style={{ textShadow: '0 1px 0 #000' }}>
            {isBoss && '👑 '}{def.name}
          </div>
        </div>
        <div className="h-1 bg-black/80 overflow-hidden relative" style={{ marginTop: 1 }}>
          <div className="h-full"
               style={{ width: hpPct + '%', background: isBoss ? '#ff3030' : '#dc2020', transition: 'width 200ms ease-out' }} />
        </div>
      </div>

      {/* Sprite */}
      <div className="relative">
        <div className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
             style={{ width: size * 0.9, height: 7, bottom: -4, background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)' }} />
        <div
          className="relative flex items-center justify-center"
          style={{
            width: size, height: size,
            background: `radial-gradient(circle at 30% 30%, #a01e1ee6 0%, #40080866 55%, #40000000 100%)`,
            border: `2px solid ${isBoss ? '#ff3030' : '#E86E6E'}`,
            borderRadius: '50% 50% 42% 42% / 55% 55% 45% 45%',
            boxShadow: `0 0 10px ${isBoss ? '#ff3030' : '#E86E6E'}90, inset 0 -6px 10px rgba(0,0,0,0.55)`,
          }}
        >
          <div className="select-none"
               style={{
                 fontSize: size * 0.55,
                 transform: `scaleX(-1) ${stunned ? `rotate(${Math.sin(nowTick / 80) * 18}deg)` : ''}`,
                 filter: 'drop-shadow(1px 1px 0 #000) drop-shadow(-1px 1px 0 #000) drop-shadow(1px -1px 0 #000)',
               }}>
            {def.icon}
          </div>
          {stunned && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-black bg-black/80 px-1.5 rounded text-[#F2E6A8] border border-[#F2E6A8]/60"
                 style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 4px #F2E6A8' }}>
              STUNNED!
            </div>
          )}
          {monster.dots.length > 0 && <div className="absolute -bottom-1 -right-1 text-[10px]">🟢</div>}
          {flash && (
            <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
                 style={{ background: flashColor, mixBlendMode: 'screen', opacity: 0.65 }} />
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Floating number body ============

const FloatingNumberBody: React.FC<{ float: Float; nowTick: number }> = ({ float, nowTick }) => {
  const age = nowTick - float.bornAt;
  const t = Math.min(1, age / 1000);
  const dy = -48 * t;
  const dx = (stableRand(float.id, 3) - 0.5) * 16 * t;
  const opacity = 1 - t;
  const scale = 1 + (float.big ? 0.5 : 0.25) * Math.max(0, 1 - t * 2);
  return (
    <div className="relative" style={{ transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity }}>
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

// ============ Loot on floor ============

const FloorLoot: React.FC<{ loot: DroppedLoot }> = ({ loot }) => {
  const it = ITEMS[loot.itemId];
  const icon = it?.icon || '🪙';
  const rarity = it?.rarity || 'common';
  const glow = rarityGlow(rarity);
  return (
    <div className="absolute"
         style={{
           left: `${loot.x}%`, top: `${loot.y}%`,
           transform: 'translate(-50%, -50%)',
           animation: 'fadeIn 0.4s',
           pointerEvents: 'none',
         }}>
      <div className="relative">
        <div className="text-2xl"
             style={{
               filter: `drop-shadow(0 0 6px ${glow}) drop-shadow(0 2px 2px rgba(0,0,0,0.8))`,
             }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============ Mid-room progress ring ============

const MidRoomRing: React.FC<{ dungeon: any; theme: DungeonTheme }> = ({ dungeon, theme }) => {
  const t = 1 - Math.min(1, dungeon.moveTimer / 3500);
  return (
    <div className="absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="24" stroke="#00000080" strokeWidth="3" fill="none" />
        <circle cx="32" cy="32" r="24"
                stroke={theme.accentColor}
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${Math.PI * 48}`}
                strokeDashoffset={`${Math.PI * 48 * (1 - t)}`}
                strokeLinecap="round"
                transform="rotate(-90 32 32)"
                style={{ transition: 'stroke-dashoffset 100ms linear' }} />
      </svg>
    </div>
  );
};

// ============ Dungeon progress dots ============

const DungeonProgress: React.FC<{ state: GameState; theme: DungeonTheme }> = ({ state, theme }) => {
  const d = state.activeDungeon!;
  return (
    <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-0.5 max-w-xs justify-end">
      {d.path.map((p, i) => {
        const tile = d.tiles.find(t => t.x === p.x && t.y === p.y);
        const done = i < d.pathIndex;
        const here = i === d.pathIndex;
        const kind = tile?.kind ?? 'empty';
        const color =
          here ? theme.accentColor :
          done ? '#5a5040' :
          kind === 'boss' ? '#ff4040' : '#3D3328';
        return (
          <div key={i}
               className="w-3 h-3 rounded-sm border"
               style={{
                 background: done ? color + 'cc' : color + '40',
                 borderColor: color,
                 boxShadow: here ? `0 0 6px ${color}` : 'none',
               }}
               title={`Tile ${i + 1}: ${kind}`} />
        );
      })}
    </div>
  );
};

// ============ Right quick-actions panel ============

const RightPanel: React.FC<{
  state: GameState;
  autoEquipBest?: () => void;
  quickHealParty?: () => void;
  reviveHero?: (heroId: string) => void;
}> = ({ state, autoEquipBest, quickHealParty, reviveHero }) => {
  const dead = state.heroes.filter(h => h.state !== 'alive');
  const xpTotal = state.heroes.reduce((a, h) => a + h.xp + h.level * 1000, 0);
  const healingPotions = Object.entries(state.stash.items)
    .filter(([id]) => ['healing_potion', 'greater_healing_potion', 'elixir_of_life'].includes(id))
    .reduce((a, [, q]) => a + q, 0);
  const manaPotions = state.stash.items['mana_potion'] ?? 0;

  return (
    <aside className="w-56 shrink-0 bg-[#0B0807] border-l-2 border-[#3D3328] flex flex-col overflow-hidden">
      {/* Totals */}
      <div className="p-2 border-b border-[#3D3328] space-y-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-[#D4A943]/30">
          <span className="text-xs text-[#D4A943] font-bold flex items-center gap-1">🪙 GOLD</span>
          <span className="text-sm text-[#D4A943] font-black">{state.stash.gold.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-[#B485E8]/30">
          <span className="text-xs text-[#B485E8] font-bold flex items-center gap-1">⟡ ESS</span>
          <span className="text-sm text-[#B485E8] font-black">{state.stash.essence.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-[#7FE2A0]/30">
          <span className="text-xs text-[#7FE2A0] font-bold flex items-center gap-1">⚔ KILLS</span>
          <span className="text-sm text-[#7FE2A0] font-black">{state.totalMonstersKilled.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between bg-black/40 px-2 py-1 rounded border border-[#F2E6A8]/30">
          <span className="text-xs text-[#F2E6A8] font-bold flex items-center gap-1">XP</span>
          <span className="text-sm text-[#F2E6A8] font-black">
            {xpTotal > 9999 ? (xpTotal / 1000).toFixed(1) + 'K' : xpTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest font-bold px-1"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Quick Actions
        </div>

        <ActionCard
          icon="🛡"
          title="Auto-Equip Best"
          subtitle="Swap in upgrades"
          onClick={autoEquipBest}
          color="#D4A943"
        />

        <ActionCard
          icon="🧪"
          title="Heal Party"
          subtitle={`${healingPotions} potions · ${manaPotions} mana`}
          onClick={quickHealParty}
          color="#7FE2A0"
          disabled={healingPotions + manaPotions === 0}
        />

        {dead.length > 0 && (
          <div className="space-y-1">
            <div className="text-[9px] text-[#E86E6E] uppercase tracking-widest font-bold px-1"
                 style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Downed Heroes
            </div>
            {dead.map(h => {
              const c = CLASSES[h.classId];
              const cost = 100 + h.level * 20;
              return (
                <button
                  key={h.id}
                  onClick={() => reviveHero && reviveHero(h.id)}
                  disabled={state.stash.gold < cost}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded border text-left transition-all ${
                    state.stash.gold >= cost
                      ? 'bg-[#2a1410] border-[#E86E6E]/50 hover:border-[#E86E6E] hover:bg-[#3a1a14]'
                      : 'bg-[#1a0a08] border-[#3D3328] opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate" style={{ color: c.color }}>{h.name}</div>
                    <div className="text-[9px] text-[#E86E6E]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Revive {cost}g
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Stash-stacks info */}
        <div className="mt-2 text-[9px] text-[#7A6E60] uppercase tracking-widest font-bold px-1"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Collection
        </div>
        <div className="bg-black/40 rounded border border-[#3D3328] p-2 text-[10px]"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          <div className="flex justify-between text-[#B8A890]">
            <span>Unique items</span>
            <span className="text-[#F2E6A8] font-bold">{state.collectionLog.length}</span>
          </div>
          <div className="flex justify-between text-[#B8A890]">
            <span>Dungeons beat</span>
            <span className="text-[#F2E6A8] font-bold">
              {Object.values(state.dungeonsCompleted).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div className="flex justify-between text-[#B8A890]">
            <span>Playtime</span>
            <span className="text-[#F2E6A8] font-bold">
              {Math.floor(state.totalPlaytime / 60000)}m
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

const ActionCard: React.FC<{
  icon: string; title: string; subtitle: string;
  onClick?: () => void; color: string; disabled?: boolean;
}> = ({ icon, title, subtitle, onClick, color, disabled }) => {
  return (
    <button
      disabled={disabled || !onClick}
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2 rounded border text-left transition-all ${
        disabled
          ? 'bg-[#0a0706] border-[#1E1A16] opacity-40 cursor-not-allowed'
          : 'hover:scale-[1.02] cursor-pointer'
      }`}
      style={{
        background: disabled ? undefined : `linear-gradient(90deg, ${color}18 0%, transparent 100%)`,
        borderColor: disabled ? undefined : color + '70',
      }}>
      <span className="text-xl" style={{ filter: 'drop-shadow(0 1px 1px #000)' }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold truncate" style={{ color }}>{title}</div>
        <div className="text-[9px] text-[#B8A890] truncate"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>{subtitle}</div>
      </div>
    </button>
  );
};

// ============ Encounter banner ============

const EncounterBanner: React.FC<{ enemies: MonsterInstance[] }> = ({ enemies }) => {
  // Group enemies by monster type to show "N/M Type (Lvl. X)"
  const counts = new Map<string, { alive: number; total: number; level: number; name: string }>();
  for (const e of enemies) {
    const def = MONSTERS[e.monsterId];
    if (!def) continue;
    const cur = counts.get(def.id) ?? { alive: 0, total: 0, level: def.level, name: def.name };
    cur.total++;
    if (e.hp > 0) cur.alive++;
    counts.set(def.id, cur);
  }
  const groups = Array.from(counts.values());
  return (
    <div className="absolute left-1/2 bottom-3 -translate-x-1/2 z-20 px-4 py-1.5 rounded-md"
         style={{
           background: 'rgba(0, 80, 160, 0.8)',
           border: '1px solid rgba(180,220,255,0.8)',
           boxShadow: '0 2px 10px rgba(0,0,0,0.7)',
           minWidth: 320,
           textAlign: 'center',
         }}>
      <div className="text-[11px] font-bold uppercase tracking-widest text-white leading-tight"
           style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 1px 0 #000' }}>
        An Encounter!
      </div>
      {groups.map(g => (
        <div key={g.name} className="text-xs text-white leading-tight" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <span className="font-bold">{g.alive}/{g.total}</span> {g.name}{g.total > 1 ? 's' : ''} <span className="text-[10px] opacity-80">(Lvl. {g.level})</span>
        </div>
      ))}
    </div>
  );
};

// ============ Ambient particle layer ============

const AmbientLayer: React.FC<{ theme: DungeonTheme }> = ({ theme }) => {
  const particles = useMemo(() => {
    const count = theme.ambientKind === 'stars' ? 50 : 30;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 10,
      dur: 3 + Math.random() * 6,
      delay: Math.random() * 6,
    }));
  }, [theme]);
  const kindStyle = (kind: DungeonTheme['ambientKind']): React.CSSProperties => {
    switch (kind) {
      case 'embers': return { background: 'radial-gradient(circle, #ff8030, transparent 70%)' };
      case 'snow': return { background: '#d5ecff', borderRadius: '50%', opacity: 0.8 };
      case 'sparks': return { background: 'radial-gradient(circle, #ffe080, transparent 70%)' };
      case 'bubbles': return { background: 'radial-gradient(circle, rgba(180,240,255,0.7), transparent 70%)', borderRadius: '50%' };
      case 'stars': return { background: '#fff', borderRadius: '50%', boxShadow: '0 0 6px #fff' };
      case 'dust': return { background: 'radial-gradient(circle, rgba(240,220,180,0.5), transparent 70%)', borderRadius: '50%' };
      case 'shadow': return { background: 'radial-gradient(circle, rgba(180,100,200,0.5), transparent 70%)', borderRadius: '50%' };
      case 'leaves': return { background: '#a0b060', borderRadius: '10%' };
      case 'webs': return { background: 'radial-gradient(circle, rgba(200,180,200,0.3), transparent 70%)', borderRadius: '30%' };
    }
  };
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <div key={p.id} className="absolute"
             style={{
               left: `${p.x}%`, top: `${p.y}%`,
               width: p.size, height: p.size,
               animation: `ambientFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
               ...kindStyle(theme.ambientKind),
             }} />
      ))}
    </div>
  );
};

// ============ BOTTOM PANEL ============

const BottomPanel: React.FC<{ state: GameState }> = ({ state }) => {
  const heroes = state.heroes.filter(h => !h.bench);
  return (
    <div className="shrink-0 bg-[#0B0807] border-t-2 border-[#3D3328] grid gap-2 p-2"
         style={{
           gridTemplateColumns: '1fr 1.6fr 0.9fr',
           minHeight: 200,
         }}>
      <SpellGrid heroes={heroes} />
      <RosterPanel heroes={heroes} />
      <BuffInventoryPanel state={state} />
    </div>
  );
};

// ---- Spells / Abilities grid ----

const SpellGrid: React.FC<{ heroes: Hero[] }> = ({ heroes }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest font-bold px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Abilities
      </div>
      <div className="grid grid-cols-6 gap-1 flex-1 content-start">
        {heroes.flatMap(h => h.abilities.map(abId => ({ h, abId }))).slice(0, 18).map(({ h, abId }, idx) => {
          const ab = ABILITIES[abId];
          if (!ab) return null;
          const cls = CLASSES[h.classId];
          const cd = h.cooldowns[abId] ?? 0;
          const ready = cd <= 0 && h.mp >= ab.manaCost && h.state === 'alive';
          const t = ab.cooldown > 0 ? 1 - Math.min(1, cd / ab.cooldown) : 1;
          return (
            <div key={idx}
                 className="relative aspect-square rounded border-2 flex items-center justify-center overflow-hidden"
                 style={{
                   background: ready ? cls.color + '22' : '#1a1714',
                   borderColor: ready ? cls.color + 'bb' : '#3D3328',
                   boxShadow: ready ? `0 0 6px ${cls.color}80` : 'inset 0 1px 2px rgba(0,0,0,0.6)',
                 }}
                 title={`${h.name} · ${ab.name}\n${ab.description}`}>
              <span className="text-xl" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.8))' }}>{ab.icon}</span>
              {!ready && (
                <svg className="absolute inset-0" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18"
                          fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth="36"
                          strokeDasharray={`${Math.PI * 36}`}
                          strokeDashoffset={`${Math.PI * 36 * t}`}
                          transform="rotate(-90 20 20)"
                          opacity="0.65" />
                </svg>
              )}
              {!ready && cd > 0 && (
                <div className="absolute bottom-0 left-0 right-0 text-[9px] text-center font-bold text-white bg-black/80 leading-tight"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {(cd / 1000).toFixed(1)}
                </div>
              )}
              {/* owner tint dot */}
              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                   style={{ background: cls.color, boxShadow: `0 0 3px ${cls.color}` }} />
            </div>
          );
        })}
        {/* Pad empties */}
        {Array.from({ length: Math.max(0, 18 - heroes.flatMap(h => h.abilities).length) }).map((_, i) => (
          <div key={`empty_${i}`} className="aspect-square rounded border border-[#1E1A16] bg-[#0a0807]" />
        ))}
      </div>
    </div>
  );
};

// ---- Roster panel ----

const RosterPanel: React.FC<{ heroes: Hero[] }> = ({ heroes }) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest font-bold px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Party
      </div>
      <div className="bg-[#0a0807] rounded border border-[#3D3328] flex-1 overflow-hidden">
        <table className="w-full text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>
          <tbody>
            {heroes.map(h => {
              const cls = CLASSES[h.classId];
              const stats = effectiveStats(h);
              const hpPct = (h.hp / h.maxHp) * 100;
              const mpPct = h.maxMp > 0 ? (h.mp / h.maxMp) * 100 : 0;
              const dmg = weaponPower(h) + Math.floor(Math.max(stats.str, stats.dex, stats.int) * 1.2);
              const arm = totalArmor(h);
              return (
                <tr key={h.id} className={`border-b border-[#1E1A16] ${h.state !== 'alive' ? 'opacity-50' : ''}`}>
                  <td className="px-1 py-1 w-10 text-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded"
                         style={{
                           background: `radial-gradient(circle, ${cls.color}55, transparent)`,
                           border: `1px solid ${cls.color}`,
                         }}>
                      <span className="text-base">{cls.icon}</span>
                    </div>
                  </td>
                  <td className="px-1 py-1">
                    <div className="font-bold leading-tight" style={{ color: cls.color }}>{h.name}</div>
                    <div className="text-[9px] text-[#7A6E60] leading-tight" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Lvl {h.level} {cls.name}
                    </div>
                  </td>
                  <td className="px-1 py-1" style={{ minWidth: 120 }}>
                    <div className="relative h-3 bg-black/80">
                      <div className="h-full" style={{ width: hpPct + '%', background: '#dc2020' }} />
                      <div className="absolute inset-0 text-[9px] text-white font-bold text-right pr-1 leading-3"
                           style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000' }}>
                        {Math.ceil(h.hp)}/{h.maxHp} HP
                      </div>
                    </div>
                    <div className="relative h-2 bg-black/80 mt-0.5">
                      <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc' }} />
                      <div className="absolute inset-0 text-[8px] text-white font-bold text-right pr-1 leading-2"
                           style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000' }}>
                        {Math.ceil(h.mp)}/{h.maxMp} SP
                      </div>
                    </div>
                  </td>
                  <td className="px-1 py-1 text-[10px] text-[#ff6060] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <div>{dmg}DMG</div>
                    <div>{arm}ARM</div>
                  </td>
                  <td className="px-1 py-1 text-[10px] text-[#ff6060] font-bold pr-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <div>{Math.floor(stats.str + stats.dex)}ATK</div>
                    <div>{Math.floor(stats.con + arm * 0.5)}DEF</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ---- Buffs + Inventory slice ----

const BuffInventoryPanel: React.FC<{ state: GameState }> = ({ state }) => {
  // Gather active effects as "potion cards"
  const potionCards: Array<{
    id: string; title: string; sub: string; icon: string; color: string; remainingMs?: number;
  }> = [];

  for (const h of state.heroes) {
    for (const b of h.buffs) {
      const stat = b.stat ? b.stat.toUpperCase() : '';
      potionCards.push({
        id: `${h.id}_${b.id}`,
        title: `+${Math.round(b.power * 100)}% ${stat}`,
        sub: h.name,
        icon: b.stat === 'str' ? '🧪' : b.stat === 'int' ? '🔮' : '✨',
        color: '#D4A943',
        remainingMs: b.remaining,
      });
    }
    if (h.shield > 0) {
      potionCards.push({
        id: `${h.id}_shield`,
        title: `Shield ${Math.floor(h.shield)}`,
        sub: h.name,
        icon: '🛡',
        color: '#6EA9E4',
      });
    }
  }
  // Speed "potion" showing current game speed
  if (state.speed !== 1) {
    potionCards.push({
      id: 'game_speed',
      title: `${state.speed}× Speed`,
      sub: 'Time flows faster',
      icon: '⏩',
      color: '#B485E8',
    });
  }
  // Auto-sell rarities shown as a potion-style indicator
  if (state.autoSellRarities.length > 0) {
    potionCards.push({
      id: 'autosell',
      title: `Auto-Sell`,
      sub: state.autoSellRarities.join(', '),
      icon: '🪙',
      color: '#D4A943',
    });
  }

  return (
    <div className="flex flex-col gap-1 overflow-hidden">
      <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest font-bold px-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Active Effects
      </div>
      <div className="flex-1 overflow-y-auto">
        {potionCards.length === 0 && (
          <div className="text-[10px] text-[#5a5040] italic px-2 py-2">No active effects</div>
        )}
        <div className="grid grid-cols-1 gap-1">
          {potionCards.map(c => (
            <div key={c.id}
                 className="flex items-center gap-2 px-2 py-1 rounded border"
                 style={{
                   background: 'linear-gradient(90deg, #2a1d10 0%, #1a130a 100%)',
                   borderColor: c.color + '60',
                 }}>
              <span className="text-xl shrink-0" style={{ filter: 'drop-shadow(0 1px 1px #000)' }}>{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: c.color }}>{c.title}</div>
                <div className="text-[10px] text-[#B8A890] truncate">{c.sub}</div>
              </div>
              {c.remainingMs !== undefined && (
                <div className="text-[10px] text-[#7A6E60] font-bold shrink-0"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {(c.remainingMs / 1000).toFixed(0)}s
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ helpers ============

function pathHasDoorway(dungeon: any, dir: 'forward' | 'right'): boolean {
  // Whether the current room should show a visible doorway on a given back wall.
  // We show a 'forward' doorway only if the party hasn't reached the boss yet.
  if (!dungeon) return false;
  if (dir === 'forward') {
    return dungeon.pathIndex < dungeon.path.length - 1;
  }
  // 'right' — show doorway when returning is possible (all rooms except final).
  return dungeon.pathIndex > 0 && dungeon.pathIndex < dungeon.path.length - 1;
}

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return (h % 1000) / 100;
}

function rarityGlow(r: Rarity): string {
  switch (r) {
    case 'common': return '#8B8680';
    case 'uncommon': return '#7FE2A0';
    case 'rare': return '#6EA9E4';
    case 'epic': return '#C58BE8';
    case 'legendary': return '#F2B84B';
    case 'celestial': return '#22D3EE';
  }
}

function rarityRank(r: Rarity): number {
  const order: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'celestial'];
  return order.indexOf(r);
}
