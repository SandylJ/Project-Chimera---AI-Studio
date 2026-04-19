import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Hero, MonsterInstance, Tile, Rarity, AttackVisual } from '../types';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { ABILITIES } from '../data/abilities';
import { ITEMS } from '../data/items';
import { themeFor, DungeonTheme } from '../visuals/dungeonTheme';
import { ClassSprite } from '../visuals/sprites';
import { MonsterSpriteArt } from '../visuals/monsterSprites';
import { effectiveStats, totalArmor, weaponPower, xpToNext } from '../engine/util';

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
  rarity?: string;
  big?: boolean; // spotlight effect for rare+
}

interface CoinBurst {
  id: string;
  x: number;
  y: number;
  bornAt: number;
  count: number;
  gold: number;
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
  sellJunk?: () => void;
}

// Deterministic scatter so sprite positions don't jitter between renders
function stableRand(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return Math.abs(h % 1000) / 1000;
}

export const BattleView: React.FC<Props> = ({ state, clickMonster, autoEquipBest, quickHealParty, reviveHero, sellJunk }) => {
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
  const tileChangedAtRef = useRef<number>(0);
  const [floats, setFloats] = useState<Float[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [floorLoot, setFloorLoot] = useState<DroppedLoot[]>([]);
  const [coinBursts, setCoinBursts] = useState<CoinBurst[]>([]);
  const [bossBanner, setBossBanner] = useState<{ name: string; until: number } | null>(null);
  const [tileTag, setTileTag] = useState<string | null>(null);
  const [shakeUntil, setShakeUntil] = useState<number>(0);

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
              const dropRoll = def.lootTable.find(l => Math.random() < l.chance) ?? def.lootTable[0];
              const itemId = dropRoll?.itemId ?? 'gold_nugget';
              const rarity = ITEMS[itemId]?.rarity ?? 'common';
              const big = rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' || rarity === 'celestial';
              const baseSlot = enemySlots.find(s => s.heroId === c.id);
              const lx = baseSlot ? baseSlot.x : 50 + (Math.random() - 0.5) * 20;
              const ly = baseSlot ? baseSlot.y : 55 + (Math.random() - 0.5) * 10;
              setFloorLoot(list => [...list.slice(-12), {
                id: `loot_${now}_${c.id}`,
                itemId, x: lx, y: ly, bornAt: now,
                rarity, big,
              }]);
              // Coin burst from the kill
              const goldRange = def.goldReward;
              const estGold = Math.floor((goldRange[0] + goldRange[1]) / 2);
              setCoinBursts(cs => [...cs.slice(-10), {
                id: `cb_${now}_${c.id}`,
                x: lx, y: ly,
                bornAt: now,
                count: Math.min(22, 5 + Math.floor(estGold / 3) + (def.boss ? 20 : 0)),
                gold: estGold,
              }]);
              // Rare+ drops shake the screen
              if (big) {
                setShakeUntil(Date.now() + (rarity === 'legendary' || rarity === 'celestial' ? 500 : 280));
              }
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
      setFloorLoot(l => l.filter(x => now - x.bornAt < 2800)); // rest 1.5s + fly 1.0s + fade
      setCoinBursts(cs => cs.filter(c => now - c.bornAt < 1600));
    }, 300);
    return () => window.clearInterval(id);
  }, []);

  // Screen shake when a crit happens
  useEffect(() => {
    if (flashes.some(f => f.kind === 'crit' && f.until > Date.now() - 200)) {
      setShakeUntil(prev => Math.max(prev, Date.now() + 220));
    }
  }, [flashes]);

  // Boss banner + tile-entry tag
  useEffect(() => {
    const key = `${dungeon.partyPos.x},${dungeon.partyPos.y}`;
    if (key === prevTileKey.current) return;
    prevTileKey.current = key;
    tileChangedAtRef.current = Date.now();
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
      // Spread enemies across the right half of the floor, 2 rows × 4 columns.
      const cols = 4;
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseX = 54 + col * 7;
      const baseY = 42 + row * 14;
      const jx = (stableRand(m.id, 5) - 0.5) * 4;
      const jy = (stableRand(m.id, 11) - 0.5) * 4;
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
      <div className="relative flex-1 overflow-hidden" style={{
            background: `radial-gradient(ellipse at center 30%, #1a1612 0%, #050403 80%)`,
            animation: Date.now() < shakeUntil ? 'battleShake 0.22s linear' : undefined,
          }}>
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
              width: '92%',
              height: '94%',
              marginTop: '1%',
              perspective: '1700px',
              perspectiveOrigin: '50% 18%',
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

              {/* Tile-kind floor decoration (chest, shrine, fountain…) */}
              {!tile.cleared && <TileFloorDecor tile={tile} theme={theme} nowTick={nowTick} />}

              {/* Loot on floor (lays flat on the tilted floor, then flies to stash) */}
              {floorLoot.map(l => (
                <FloorLoot key={l.id} loot={l} nowTick={nowTick} />
              ))}

              {/* Sprites — positioned on the tilted plane, counter-rotated to face camera */}
              {spriteOrder.map(s => {
                // Tile-change walk-in: heroes slide in from the left, enemies from the right
                const entryAge = nowTick - tileChangedAtRef.current;
                const entryT = entryAge < 500 ? entryAge / 500 : 1;
                const walkInX = entryT < 1
                  ? (1 - entryT) * (s.kind === 'hero' ? -40 : 40)
                  : 0;
                const entryOpacity = Math.min(1, entryT * 2);
                const commonStyle: React.CSSProperties = {
                  position: 'absolute',
                  left: `${s.x}%`, top: `${s.y}%`,
                  transform: `translate(calc(-50% + ${walkInX}px), -100%) rotateX(-58deg)`,
                  transformOrigin: '50% 100%',
                  transformStyle: 'preserve-3d',
                  pointerEvents: 'auto',
                  opacity: entryOpacity,
                  transition: entryT < 1 ? 'transform 120ms linear' : undefined,
                };
                if (s.kind === 'hero') {
                  const h = heroes.find(x => x.id === s.id)!;
                  const flash = flashes.find(f => f.targetId === s.id);
                  return (
                    <div key={s.id} style={commonStyle}>
                      <HeroSpriteBody hero={h} flash={flash} nowTick={nowTick} walkingIn={entryT < 1} />
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

              {/* Projectiles / attack effects: hero actions */}
              {heroes.map(h => {
                if (!h.lastAction) return null;
                const age = nowTick - h.lastAction.at;
                if (age < 0 || age > 600) return null;
                const src = heroSlots.find(s => s.heroId === h.id);
                // target can be hero (for heal/buff) or enemy
                const tgtHero = heroSlots.find(s => s.heroId === h.lastAction!.targetId);
                const tgtEnemy = enemySlots.find(s => s.heroId === h.lastAction!.targetId);
                const tgt = tgtHero ?? tgtEnemy;
                if (!src || !tgt) return null;
                return (
                  <Projectile
                    key={'p_' + h.id + '_' + h.lastAction.at}
                    src={src} tgt={tgt}
                    kind={h.lastAction.kind}
                    age={age}
                  />
                );
              })}

              {/* Projectiles: monster basic attacks */}
              {enemies.map(m => {
                if (!m.lastAttack) return null;
                const age = nowTick - m.lastAttack.at;
                if (age < 0 || age > 450) return null;
                const src = enemySlots.find(s => s.heroId === m.id);
                const tgt = heroSlots.find(s => s.heroId === m.lastAttack!.targetHeroId);
                if (!src || !tgt) return null;
                return (
                  <Projectile
                    key={'mp_' + m.id + '_' + m.lastAttack.at}
                    src={src} tgt={tgt}
                    kind="melee"
                    age={age}
                    hostile
                  />
                );
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

            {/* Coin bursts — shower of gold from killed enemies */}
            {coinBursts.map(cb => (
              <CoinBurstFX key={cb.id} burst={cb} nowTick={nowTick} />
            ))}

            {/* Rare-drop spotlight beams from the floor */}
            {floorLoot.filter(l => l.big && (nowTick - l.bornAt < 1600)).map(l => (
              <RarityBeam key={'beam_' + l.id} loot={l} nowTick={nowTick} />
            ))}

            {/* Combo banner — bottom-right of stage */}
            {state.killCombo >= 2 && (nowTick - state.lastKillAt < 3000) && (
              <ComboBanner combo={state.killCombo} lastKillAt={state.lastKillAt} nowTick={nowTick} />
            )}

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
                  reviveHero={reviveHero}
                  sellJunk={sellJunk} />

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
  hero: Hero; flash?: Flash; nowTick: number; walkingIn?: boolean;
}> = ({ hero, flash, nowTick, walkingIn }) => {
  const cls = CLASSES[hero.classId];
  const hpPct = Math.max(0, (hero.hp / hero.maxHp) * 100);
  const mpPct = hero.maxMp > 0 ? Math.max(0, (hero.mp / hero.maxMp) * 100) : 0;
  const downed = hero.state !== 'alive';
  // Stronger bob during walk-in to simulate footsteps
  const bobPeriod = walkingIn ? 150 : 450;
  const bob = Math.sin((nowTick / bobPeriod) + hashHue(hero.id)) * (walkingIn ? 3.5 : 2);
  // Attack lunge driven by recent action
  const actionAge = hero.lastAction ? nowTick - hero.lastAction.at : Infinity;
  const actionKind = hero.lastAction?.kind;
  const lungeT = actionAge < 260 ? 1 - actionAge / 260 : 0;
  const lungeX = lungeT > 0 && (actionKind === 'melee')
    ? Math.sin(lungeT * Math.PI) * 22
    : lungeT > 0 && actionKind === 'ranged'
    ? -Math.sin(lungeT * Math.PI) * 4
    : lungeT > 0 && actionKind?.startsWith('spell_')
    ? -Math.sin(lungeT * Math.PI) * 6
    : 0;
  const flashColor = flash?.kind === 'heal' ? '#7FE2A0' : flash?.kind === 'crit' ? '#ff4040' : '#ffffff';

  return (
    <div className="flex flex-col items-center"
           style={{
             filter: downed ? 'grayscale(100%) opacity(0.45)' : flash ? `drop-shadow(0 0 10px ${flashColor})` : undefined,
             transform: `translate(${lungeX}px, ${bob}px) ${lungeT > 0 && actionKind === 'melee' ? `scale(${1 + lungeT * 0.08})` : ''}`,
             transition: lungeT > 0 ? 'transform 100ms ease-out' : 'transform 180ms ease-out',
           }}>
      {/* Tiny HP/MP bars (no name — names are in the roster panel) */}
      <div style={{ width: 56, marginBottom: 2 }}>
        <div className="h-[3px] bg-black/80 overflow-hidden relative rounded-sm">
          <div className="h-full" style={{ width: hpPct + '%', background: '#dc2020', transition: 'width 200ms ease-out' }} />
        </div>
        {hero.maxMp > 0 && (
          <div className="h-[2px] bg-black/80 overflow-hidden mt-[1px] rounded-sm">
            <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc', transition: 'width 200ms' }} />
          </div>
        )}
      </div>

      {/* The sprite itself */}
      <div className="relative">
        {/* Pixel art character */}
        <div className="relative"
             style={{
               filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.75)) ${flash ? `drop-shadow(0 0 8px ${flashColor})` : ''}`,
               width: 84, height: 116,
             }}>
          <div className="absolute inset-0 flex items-end justify-center"
               style={{ transform: 'translateY(-4px)' }}>
            <ClassSprite classId={hero.classId} size={84} />
          </div>
          {/* Shield indicator (glowing ring around sprite) */}
          {hero.shield > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-20 rounded-full animate-pulse pointer-events-none"
                 style={{ boxShadow: `inset 0 0 14px #6EA9E4, 0 0 16px #6EA9E480`, border: '2px solid #6EA9E4' }} />
          )}
          {/* Hit flash tint */}
          {flash && (
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: flashColor, mixBlendMode: 'screen', opacity: 0.45 }} />
          )}
          {/* Ability-point badge */}
          {hero.abilityPoints > 0 && (
            <div className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[#D4A943] text-black text-[10px] font-black flex items-center justify-center animate-pulse shadow-lg z-10">
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
  const attackAge = monster.lastAttack ? nowTick - monster.lastAttack.at : Infinity;
  const lungeT = attackAge < 260 ? 1 - attackAge / 260 : 0;
  const lungeX = -Math.sin(lungeT * Math.PI) * 18; // monster lunges LEFT toward heroes
  const flashColor = flash?.kind === 'crit' ? '#ff4040' : '#ffffff';
  const stunned = monster.stunRemaining > 0;
  const isBoss = def.boss;
  const size = isBoss ? 58 : 40;
  const wounded = monster.hp / monster.maxHp < 0.3;
  // Wounded sway: the monster visibly stumbles when near death
  const woundSway = wounded ? Math.sin(nowTick / 140) * 6 : 0;

  return (
    <div className={`flex flex-col items-center ${onClick ? 'cursor-crosshair' : ''}`}
         onClick={onClick}
         style={{
           filter: flash ? `drop-shadow(0 0 10px ${flashColor})` : wounded ? 'drop-shadow(0 0 6px #ff4040aa)' : undefined,
           transform: `translate(${lungeX}px, ${bob}px) rotate(${woundSway * 0.4}deg) ${lungeT > 0 ? `scale(${1 + lungeT * 0.08})` : ''}`,
           transition: lungeT > 0 ? 'transform 100ms ease-out' : 'transform 140ms ease-out',
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

      {/* Pixel art monster sprite */}
      <div className="relative"
           style={{
             filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.8)) ${flash ? `drop-shadow(0 0 8px ${flashColor})` : ''} ${isBoss ? 'drop-shadow(0 0 14px #ff3030aa)' : ''}`,
             width: isBoss ? 100 : 72,
             height: isBoss ? 140 : 98,
             transform: 'scaleX(-1)', // face heroes (left)
           }}>
        <div className="absolute inset-0 flex items-end justify-center">
          <MonsterSpriteArt
            monsterId={monster.monsterId}
            icon={def.icon}
            size={isBoss ? 100 : 72}
            level={def.level}
          />
        </div>
        {stunned && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs font-black bg-black/80 px-1.5 rounded text-[#F2E6A8] border border-[#F2E6A8]/60"
               style={{
                 fontFamily: "'JetBrains Mono', monospace",
                 textShadow: '0 0 4px #F2E6A8',
                 transform: 'translateX(-50%) scaleX(-1)', // counter-flip so text reads normally
               }}>
            STUNNED!
          </div>
        )}
        {monster.dots.length > 0 && (
          <div className="absolute bottom-0 right-0 text-[14px]"
               style={{ transform: 'scaleX(-1)' }}>🟢</div>
        )}
        {flash && (
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: flashColor, mixBlendMode: 'screen', opacity: 0.5 }} />
        )}
      </div>
    </div>
  );
};

// ============ Coin Burst FX ============

const CoinBurstFX: React.FC<{ burst: CoinBurst; nowTick: number }> = ({ burst, nowTick }) => {
  const age = nowTick - burst.bornAt;
  if (age > 1500) return null;
  // Precompute per-coin angles/speeds (memoize via bornAt)
  const coins = useMemo(() => {
    return Array.from({ length: burst.count }, (_, i) => {
      const angle = (i / burst.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const speed = 40 + Math.random() * 70;
      return {
        angle,
        speed,
        dr: (Math.random() - 0.5) * 720,
        phase: Math.random() * 0.3,
      };
    });
  }, [burst.id]);
  return (
    <div className="absolute pointer-events-none z-20"
         style={{
           left: `${burst.x}%`, top: `${burst.y}%`,
           transform: 'translate(-50%, -70%) rotateX(-58deg)',
           transformOrigin: '50% 100%',
         }}>
      {coins.map((c, i) => {
        const t = Math.min(1, (age / 1500) + c.phase * 0.3);
        const dx = Math.cos(c.angle) * c.speed * t;
        // gravity-like fall
        const dy = Math.sin(c.angle) * c.speed * t - Math.sin(Math.min(1, t) * Math.PI) * 32 + t * t * 60;
        const opacity = t < 0.8 ? 1 : Math.max(0, (1 - t) * 5);
        const rotate = c.dr * t;
        return (
          <span key={i}
                className="absolute"
                style={{
                  left: 0, top: 0,
                  transform: `translate(${dx}px, ${dy}px) rotate(${rotate}deg) scale(${1 - t * 0.2})`,
                  fontSize: 16,
                  opacity,
                  filter: 'drop-shadow(0 0 4px #f2c846) drop-shadow(0 1px 1px #000)',
                }}>🪙</span>
        );
      })}
      {/* +Ng text that rises up */}
      {age < 900 && (
        <div className="absolute font-black text-[#f2c846]"
             style={{
               left: 0,
               top: -20 - age * 0.05,
               transform: `translate(-50%, 0)`,
               opacity: 1 - age / 900,
               fontSize: 20,
               textShadow: '0 0 6px #f2c846, 2px 2px 0 #000',
               fontFamily: "'JetBrains Mono', monospace",
               whiteSpace: 'nowrap',
             }}>
          +{burst.gold}g
        </div>
      )}
    </div>
  );
};

// ============ Rarity Beam (rare+ drops shoot a vertical beam) ============

const RarityBeam: React.FC<{ loot: DroppedLoot; nowTick: number }> = ({ loot, nowTick }) => {
  const age = nowTick - loot.bornAt;
  if (age > 1600) return null;
  const color = rarityGlow((loot.rarity as Rarity) ?? 'rare');
  const t = Math.min(1, age / 1600);
  const opacity = t < 0.7 ? Math.min(1, t * 3) : 1 - (t - 0.7) / 0.3;
  return (
    <div className="absolute pointer-events-none z-15"
         style={{
           left: `${loot.x}%`, top: `${loot.y}%`,
           transform: 'translate(-50%, -100%) rotateX(-58deg)',
           transformOrigin: '50% 100%',
         }}>
      <div style={{
        width: 18, height: 130,
        background: `linear-gradient(180deg, ${color} 0%, ${color}80 50%, transparent 100%)`,
        boxShadow: `0 0 24px ${color}, 0 0 40px ${color}80`,
        borderRadius: 8,
        opacity,
        animation: 'rarityBeam 1.6s ease-out forwards',
        transformOrigin: 'bottom',
      }} />
      {/* Burst ring at base */}
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 rounded-full"
           style={{
             width: 28, height: 12,
             background: `radial-gradient(ellipse, ${color} 0%, transparent 70%)`,
             filter: 'blur(2px)',
             opacity,
           }} />
    </div>
  );
};

// ============ Combo Banner ============

const ComboBanner: React.FC<{ combo: number; lastKillAt: number; nowTick: number }> = ({ combo, lastKillAt, nowTick }) => {
  const since = nowTick - lastKillAt;
  const timeLeft = Math.max(0, 3000 - since);
  const pctLeft = timeLeft / 3000;
  const tier =
    combo >= 20 ? { label: 'UNSTOPPABLE', color: '#ff6060', bg: '#3a0808' } :
    combo >= 10 ? { label: 'RAMPAGE',    color: '#ffa040', bg: '#3a1a00' } :
    combo >= 5  ? { label: 'ON FIRE',    color: '#ffe080', bg: '#2a1a00' } :
    combo >= 3  ? { label: 'STREAK',     color: '#d4a943', bg: '#2a1c08' } :
                  { label: 'COMBO',      color: '#b0e8a0', bg: '#142a12' };
  // pulse on each new kill
  const pulseT = Math.min(1, since / 400);
  const scale = 1 + (1 - pulseT) * 0.25;
  return (
    <div className="absolute right-3 bottom-3 z-30 pointer-events-none"
         style={{
           transform: `scale(${scale})`,
           transformOrigin: 'bottom right',
           transition: 'transform 120ms ease-out',
         }}>
      <div className="px-4 py-2 rounded-lg border-2 shadow-lg"
           style={{
             background: `linear-gradient(90deg, ${tier.bg}f0 0%, ${tier.bg}c0 100%)`,
             borderColor: tier.color,
             boxShadow: `0 0 18px ${tier.color}aa, inset 0 0 10px ${tier.color}40`,
           }}>
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold"
             style={{ color: tier.color, fontFamily: "'JetBrains Mono', monospace" }}>
          {tier.label}
        </div>
        <div className="text-3xl font-black leading-none"
             style={{
               color: tier.color,
               textShadow: `0 0 10px ${tier.color}, 2px 2px 0 #000`,
               fontFamily: "'Cinzel', serif",
             }}>
          🔥 ×{combo}
        </div>
        {/* countdown bar */}
        <div className="h-1 mt-1 rounded bg-black/60 overflow-hidden">
          <div className="h-full transition-all"
               style={{
                 width: `${pctLeft * 100}%`,
                 background: tier.color,
                 boxShadow: `0 0 6px ${tier.color}`,
               }} />
        </div>
      </div>
    </div>
  );
};

// ============ Projectile / attack effect ============

interface SlotRef { heroId: string; x: number; y: number; depth: number }

const Projectile: React.FC<{
  src: SlotRef; tgt: SlotRef; kind: AttackVisual; age: number; hostile?: boolean;
}> = ({ src, tgt, kind, age, hostile }) => {
  // Some abilities target self / caster — show on-the-spot burst
  const selfTarget = src.heroId === tgt.heroId;

  // Total animation length varies per kind
  const dur =
    kind === 'spell_aoe' ? 500 :
    kind === 'buff_self' ? 500 :
    kind === 'spell_heal' ? 550 :
    kind === 'spell_light' ? 380 :
    kind === 'melee' ? 260 : 400;
  const t = Math.min(1, age / dur);

  // Screen-travel arc for projectiles that fly
  const flies = !selfTarget && (kind === 'ranged' || kind === 'spell_fire' || kind === 'spell_frost' || kind === 'spell_shadow' || kind === 'spell_heal');
  const x = flies ? src.x + (tgt.x - src.x) * t : tgt.x;
  const y = flies ? src.y + (tgt.y - src.y) * t - 6 : tgt.y - 4;
  // Slight parabolic arc
  const arc = flies ? -Math.sin(t * Math.PI) * 20 : 0;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate(-50%, -100%) rotateX(-58deg) translateY(${arc}px)`,
    transformOrigin: '50% 100%',
    transformStyle: 'preserve-3d',
    pointerEvents: 'none',
    zIndex: 20,
  };

  // Choose visual per kind
  switch (kind) {
    case 'melee': {
      // Slash burst at the target on impact
      const opacity = Math.sin(t * Math.PI);
      return (
        <div style={baseStyle}>
          <div className="relative" style={{ width: 42, height: 42, opacity }}>
            <span className="absolute inset-0 flex items-center justify-center text-4xl font-black"
                  style={{
                    color: hostile ? '#ff6060' : '#fff',
                    textShadow: hostile
                      ? '0 0 12px #ff2020, 2px 2px 0 #000'
                      : '0 0 12px #ffe080, 2px 2px 0 #000',
                    transform: `rotate(${hostile ? -25 : 25}deg) scale(${0.7 + t * 0.6})`,
                  }}>✦</span>
          </div>
        </div>
      );
    }
    case 'ranged': {
      // A flying arrow
      const angle = Math.atan2(tgt.y - src.y, tgt.x - src.x) * 180 / Math.PI;
      return (
        <div style={baseStyle}>
          <div style={{
            width: 30, height: 3, borderRadius: 2,
            background: 'linear-gradient(90deg, #9a7a40 0%, #f2d080 80%, #fff 100%)',
            boxShadow: '0 0 5px #f2d080',
            transform: `rotate(${angle}deg) translate(-50%, 0)`,
          }} />
        </div>
      );
    }
    case 'spell_fire': {
      const opacity = 1 - t * 0.3;
      return (
        <div style={baseStyle}>
          <div className="relative" style={{ width: 24, height: 24 }}>
            <div className="absolute inset-0 rounded-full"
                 style={{
                   background: 'radial-gradient(circle, #ffe080 0%, #ff6030 40%, #ff2020 70%, transparent 100%)',
                   boxShadow: '0 0 16px #ff6030, 0 0 28px #ff8030',
                   opacity,
                 }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl"
                 style={{ filter: 'drop-shadow(0 0 6px #ff6030)' }}>🔥</div>
          </div>
        </div>
      );
    }
    case 'spell_frost': {
      return (
        <div style={baseStyle}>
          <div className="relative" style={{ width: 22, height: 22 }}>
            <div className="absolute inset-0"
                 style={{
                   background: 'radial-gradient(circle, #e4f4ff 0%, #6ec4f0 50%, #2a6a9a 100%)',
                   boxShadow: '0 0 14px #6ec4f0',
                   borderRadius: '30%',
                   transform: `rotate(${t * 720}deg)`,
                 }} />
          </div>
        </div>
      );
    }
    case 'spell_heal': {
      const opacity = 1 - t * 0.2;
      return (
        <div style={baseStyle}>
          <div className="relative" style={{ width: 24, height: 24, opacity }}>
            <div className="absolute inset-0 rounded-full"
                 style={{
                   background: 'radial-gradient(circle, #d8ffd8 0%, #7FE2A0 50%, #2a8040 100%)',
                   boxShadow: '0 0 12px #7FE2A0, 0 0 24px #7FE2A080',
                 }} />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">✚</div>
          </div>
        </div>
      );
    }
    case 'spell_light': {
      const scale = 0.4 + Math.sin(t * Math.PI) * 1.4;
      const opacity = Math.sin(t * Math.PI);
      return (
        <div style={baseStyle}>
          <div style={{
            width: 48, height: 48,
            background: 'radial-gradient(circle, #fff 0%, #ffe080 50%, transparent 70%)',
            borderRadius: '50%',
            transform: `scale(${scale})`,
            opacity,
            boxShadow: '0 0 40px #ffe080',
          }} />
        </div>
      );
    }
    case 'spell_shadow': {
      const opacity = 1 - t * 0.2;
      return (
        <div style={baseStyle}>
          <div style={{
            width: 28, height: 28,
            background: 'radial-gradient(circle, #c090ff 0%, #6020a0 50%, #200040 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 16px #c090ff',
            opacity,
            transform: `scale(${0.6 + t * 0.8}) rotate(${t * 300}deg)`,
          }} />
        </div>
      );
    }
    case 'spell_aoe': {
      // Expanding ring at the source caster
      const scale = 0.2 + t * 2.5;
      const opacity = 1 - t;
      return (
        <div style={{
          position: 'absolute',
          left: `${src.x}%`, top: `${src.y}%`,
          transform: `translate(-50%, -60%) rotateX(-58deg) scale(${scale})`,
          transformOrigin: '50% 100%',
          pointerEvents: 'none',
          zIndex: 20,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '3px solid #c58bff',
            boxShadow: '0 0 28px #c58bff, inset 0 0 16px #c58bff',
            opacity,
          }} />
        </div>
      );
    }
    case 'buff_self': {
      const opacity = Math.sin(t * Math.PI);
      return (
        <div style={{
          position: 'absolute',
          left: `${src.x}%`, top: `${src.y}%`,
          transform: 'translate(-50%, -90%) rotateX(-58deg)',
          transformOrigin: '50% 100%',
          pointerEvents: 'none',
          zIndex: 20,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'radial-gradient(circle, #ffe08080 0%, transparent 70%)',
            boxShadow: '0 0 24px #ffe080',
            opacity,
          }} />
        </div>
      );
    }
    default:
      return null;
  }
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

const FloorLoot: React.FC<{ loot: DroppedLoot; nowTick: number }> = ({ loot, nowTick }) => {
  const it = ITEMS[loot.itemId];
  const icon = it?.icon || '🪙';
  const rarity = it?.rarity || 'common';
  const glow = rarityGlow(rarity);
  const age = nowTick - loot.bornAt;
  // Two-phase: rest on floor for 1.5s, then fly up and right to the stash corner.
  const flying = age > 1500;
  // Resting phase: slight bob + subtle sparkle
  if (!flying) {
    const sparkle = 0.7 + Math.sin(age / 180) * 0.3;
    const riseT = Math.min(1, age / 300);
    return (
      <div className="absolute"
           style={{
             left: `${loot.x}%`, top: `${loot.y}%`,
             transform: `translate(-50%, -50%) translateY(${-riseT * 4}px) rotateX(-58deg) translateZ(${4 * sparkle}px)`,
             transformOrigin: '50% 100%',
             pointerEvents: 'none',
             opacity: riseT,
           }}>
        <div style={{
          fontSize: 28,
          filter: `drop-shadow(0 0 ${6 + sparkle * 6}px ${glow}) drop-shadow(0 3px 3px rgba(0,0,0,0.85))`,
        }}>{icon}</div>
      </div>
    );
  }
  // Flying phase: 1000ms flight toward the stash UI (up and to the right).
  const t = Math.min(1, (age - 1500) / 1000);
  // ease-in cubic
  const te = t * t * (3 - 2 * t);
  const dx = te * 120;   // move rightward 120px
  const dy = -te * 140 - Math.sin(t * Math.PI) * 20; // rise with arc
  const scale = 1 - te * 0.55;
  const opacity = t < 0.8 ? 1 : Math.max(0, (1 - t) * 5);
  return (
    <div className="absolute"
         style={{
           left: `${loot.x}%`, top: `${loot.y}%`,
           transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${scale})`,
           transformOrigin: 'center',
           pointerEvents: 'none',
           opacity,
           zIndex: 25,
         }}>
      <div style={{
        fontSize: 28,
        filter: `drop-shadow(0 0 10px ${glow}) drop-shadow(0 4px 6px rgba(0,0,0,0.9))`,
      }}>{icon}</div>
    </div>
  );
};

// ============ Tile kind floor decoration ============

const TileFloorDecor: React.FC<{ tile: Tile; theme: DungeonTheme; nowTick: number }> = ({ tile, theme, nowTick }) => {
  const decor = (() => {
    switch (tile.kind) {
      case 'chest':    return { icon: '📦', color: '#D4A943', label: 'Treasure Chest' };
      case 'shrine':   return { icon: '⛩', color: '#7FE2A0', label: 'Ancient Shrine' };
      case 'fountain': return { icon: '⛲', color: '#6EA9E4', label: 'Mystic Fountain' };
      case 'fork':     return { icon: '🛤', color: '#F2E6A8', label: 'Fork in the Path' };
      case 'merchant': return { icon: '🧳', color: '#F2B84B', label: 'Wandering Merchant' };
      case 'trap':     return { icon: '⚠', color: '#ff6060', label: 'Pressure Plate' };
      default:         return null;
    }
  })();
  if (!decor) return null;
  const pulse = 0.75 + 0.25 * Math.sin(nowTick / 400);
  return (
    <div className="absolute pointer-events-none"
         style={{
           left: '50%', top: '62%',
           transform: 'translate(-50%, -50%) rotateX(-58deg)',
           transformOrigin: '50% 100%',
         }}>
      {/* Glow ring on floor */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
           style={{
             width: 90, height: 40,
             background: `radial-gradient(ellipse, ${decor.color}55 0%, transparent 75%)`,
             boxShadow: `0 0 30px ${decor.color}80`,
             filter: 'blur(1px)',
             transform: `rotateX(58deg) scaleY(0.6)`,
             opacity: pulse,
           }} />
      <div className="flex flex-col items-center gap-1">
        <div className="text-5xl"
             style={{
               filter: `drop-shadow(0 3px 4px rgba(0,0,0,0.85)) drop-shadow(0 0 8px ${decor.color})`,
               transform: `translateY(${-Math.sin(nowTick / 700) * 3}px)`,
             }}>
          {decor.icon}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black/75 rounded-full border"
             style={{ color: decor.color, borderColor: decor.color + '60', fontFamily: "'JetBrains Mono', monospace" }}>
          {decor.label}
        </div>
      </div>
    </div>
  );
};

// ============ Mid-room progress ring ============

const MidRoomRing: React.FC<{ dungeon: any; theme: DungeonTheme }> = ({ dungeon, theme }) => {
  const t = 1 - Math.min(1, dungeon.moveTimer / 3500);
  const sec = Math.max(0, dungeon.moveTimer / 1000);
  return (
    <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0">
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
        <div className="absolute inset-0 flex items-center justify-center text-2xl">
          👣
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-black/70 rounded-full"
           style={{ color: theme.accentColor, fontFamily: "'JetBrains Mono', monospace" }}>
        Advancing · {sec.toFixed(1)}s
      </div>
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
  sellJunk?: () => void;
}> = ({ state, autoEquipBest, quickHealParty, reviveHero, sellJunk }) => {
  const dead = state.heroes.filter(h => h.state !== 'alive');
  const xpTotal = state.heroes.reduce((a, h) => a + h.xp + h.level * 1000, 0);
  const healingPotions = Object.entries(state.stash.items)
    .filter(([id]) => ['healing_potion', 'greater_healing_potion', 'elixir_of_life'].includes(id))
    .reduce((a, [, q]) => a + q, 0);
  const manaPotions = state.stash.items['mana_potion'] ?? 0;

  // Count items that could be auto-equip upgrades (any equipment in stash)
  const upgradeCount = Object.entries(state.stash.items)
    .filter(([id]) => {
      const it = ITEMS[id];
      return it?.slot;
    })
    .reduce((a, [, q]) => a + q, 0);

  // Total junk value (common/uncommon non-equipment)
  const { junkGold, junkCount } = Object.entries(state.stash.items).reduce((acc, [id, qty]) => {
    const it = ITEMS[id];
    if (!it || it.slot || it.type === 'potion') return acc;
    if (it.rarity === 'common' || it.rarity === 'uncommon') {
      acc.junkGold += Math.floor(it.value * qty * 0.5);
      acc.junkCount += qty;
    }
    return acc;
  }, { junkGold: 0, junkCount: 0 });

  // Party's avg HP + MP percentage for heal pressure
  const active = state.heroes.filter(h => !h.bench && h.state === 'alive');
  const avgHpPct = active.length ? active.reduce((a, h) => a + h.hp / h.maxHp, 0) / active.length : 1;
  const partyNeedsHeal = avgHpPct < 0.7;

  return (
    <aside className="w-72 shrink-0 bg-[#0B0807] border-l-2 border-[#3D3328] flex flex-col overflow-hidden">
      {/* Totals */}
      <div className="p-2 border-b border-[#3D3328] space-y-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <FlashingStat
          label="🪙 GOLD"
          value={state.stash.gold}
          color="#D4A943"
          keyProp={state.stash.gold}
        />
        <FlashingStat label="⟡ ESS" value={state.stash.essence} color="#B485E8" keyProp={state.stash.essence} />
        <FlashingStat label="⚔ KILLS" value={state.totalMonstersKilled} color="#7FE2A0" keyProp={state.totalMonstersKilled} />
        <FlashingStat label="XP" value={xpTotal} color="#F2E6A8" keyProp={xpTotal} />
      </div>

      {/* Quick actions */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest font-bold px-1"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Quick Actions
        </div>

        <UpgradeCard
          icon="🛡"
          title="Equip Upgrades"
          right={upgradeCount > 0 ? `+${upgradeCount}` : '—'}
          subtitle={upgradeCount > 0 ? 'Swap in best gear' : 'No new gear in stash'}
          onClick={autoEquipBest}
          color="#D4A943"
          pulse={upgradeCount > 3}
          disabled={upgradeCount === 0}
        />

        <UpgradeCard
          icon="🧪"
          title="Heal Party"
          right={partyNeedsHeal ? `!${Math.round((1 - avgHpPct) * 100)}%` : 'OK'}
          subtitle={`${healingPotions} heal · ${manaPotions} mana`}
          onClick={quickHealParty}
          color="#7FE2A0"
          pulse={partyNeedsHeal && healingPotions > 0}
          disabled={healingPotions + manaPotions === 0 || !partyNeedsHeal}
        />

        <UpgradeCard
          icon="💰"
          title="Collect Item Sales"
          right={junkGold > 0 ? `+${junkGold.toLocaleString()}g` : '—'}
          subtitle={junkGold > 0 ? `Sell ${junkCount} junk item${junkCount === 1 ? '' : 's'}` : 'No junk to sell'}
          onClick={sellJunk}
          color="#F2B84B"
          pulse={junkGold > 200}
          disabled={junkGold === 0}
        />

        {state.killCombo >= 3 && (
          <div className="rounded-lg border-2 px-2 py-2"
               style={{
                 background: 'linear-gradient(90deg, #3a0808 0%, #1a0404 100%)',
                 borderColor: '#ff6060',
                 boxShadow: '0 0 12px #ff606060',
               }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <div className="flex-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-[#ff8a5a]"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Combo Streak
                </div>
                <div className="text-[9px] text-[#B8A890]">
                  +{Math.min(100, (state.killCombo - 1) * 5)}% gold/xp bonus
                </div>
              </div>
              <div className="text-xl font-black text-[#ff8a5a]"
                   style={{ textShadow: '0 0 8px #ff6060' }}>
                ×{state.killCombo}
              </div>
            </div>
          </div>
        )}

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

function useCountUp(target: number, durationMs = 600): number {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const from = value;
    if (from === target) return;
    const startAt = performance.now();
    let raf: number = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - startAt) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return value;
}

const FlashingStat: React.FC<{
  label: string; value: number; color: string; keyProp: number;
}> = ({ label, value, color, keyProp }) => {
  const [flashKey, setFlashKey] = useState(0);
  const prevRef = useRef<number>(value);
  const displayed = useCountUp(value, 500);
  useEffect(() => {
    if (value > prevRef.current) setFlashKey(k => k + 1);
    prevRef.current = value;
  }, [value]);
  return (
    <div key={flashKey}
         className="flex items-center justify-between px-2 py-1 rounded border"
         style={{
           background: 'rgba(0,0,0,0.4)',
           borderColor: color + '30',
           animation: flashKey > 0 ? 'goldCounterFlash 0.45s ease-out' : undefined,
         }}>
      <span className="text-xs font-bold flex items-center gap-1" style={{ color }}>{label}</span>
      <span className="text-sm font-black" style={{ color }}>{displayed.toLocaleString()}</span>
    </div>
  );
};

const UpgradeCard: React.FC<{
  icon: string; title: string; right?: string; subtitle: string;
  onClick?: () => void; color: string; disabled?: boolean; pulse?: boolean;
}> = ({ icon, title, right, subtitle, onClick, color, disabled, pulse }) => {
  return (
    <button disabled={disabled || !onClick}
            onClick={onClick}
            className={`w-full rounded-lg border-2 px-2 py-1.5 text-left transition-all ${
              disabled
                ? 'bg-[#0a0706] border-[#1E1A16] opacity-40 cursor-not-allowed'
                : 'hover:scale-[1.02] cursor-pointer active:scale-[0.98]'
            }`}
            style={{
              background: disabled ? undefined : `linear-gradient(90deg, ${color}22 0%, transparent 100%)`,
              borderColor: disabled ? undefined : color + '70',
              boxShadow: !disabled && pulse ? `0 0 10px ${color}aa` : undefined,
              animation: !disabled && pulse ? 'ambientFloat 2s ease-in-out infinite alternate' : undefined,
            }}>
      <div className="flex items-center gap-2">
        <span className="text-xl shrink-0" style={{ filter: 'drop-shadow(0 1px 1px #000)' }}>{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="text-xs font-bold truncate" style={{ color }}>{title}</div>
            {right && (
              <div className="text-xs font-black tabular-nums"
                   style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                {right}
              </div>
            )}
          </div>
          <div className="text-[10px] text-[#B8A890] truncate leading-tight">{subtitle}</div>
        </div>
      </div>
    </button>
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
    <div className="shrink-0 bg-[#0B0807] border-t-2 border-[#3D3328] grid gap-2 p-1.5"
         style={{
           gridTemplateColumns: '0.8fr 1.8fr 0.8fr',
           height: 150,
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
                  <td className="px-1 py-1 w-12 text-center align-middle">
                    <div className="inline-flex items-end justify-center rounded"
                         style={{
                           width: 38, height: 44,
                           background: `linear-gradient(180deg, ${cls.color}22 0%, #00000000 100%)`,
                           border: `1px solid ${cls.color}70`,
                         }}>
                      <ClassSprite classId={h.classId} size={34} />
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
                      <div className="h-full transition-all" style={{ width: mpPct + '%', background: '#2060dc' }} />
                      <div className="absolute inset-0 text-[8px] text-white font-bold text-right pr-1 leading-2"
                           style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000' }}>
                        {Math.ceil(h.mp)}/{h.maxMp} SP
                      </div>
                    </div>
                    {/* XP bar */}
                    <div className="relative h-1 bg-black/80 mt-0.5 overflow-hidden">
                      <div className="h-full transition-all"
                           style={{
                             width: Math.min(100, (h.xp / Math.max(1, xpToNext(h))) * 100) + '%',
                             background: 'linear-gradient(90deg, #9a8030 0%, #ffe080 100%)',
                             boxShadow: '0 0 4px #ffe080',
                           }} />
                    </div>
                  </td>
                  <td className="px-1 py-1 text-[10px] text-[#7fe890] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <div>{dmg}DMG</div>
                    <div>{arm}ARM</div>
                  </td>
                  <td className="px-1 py-1 text-[10px] text-[#7fe890] font-bold pr-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
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
