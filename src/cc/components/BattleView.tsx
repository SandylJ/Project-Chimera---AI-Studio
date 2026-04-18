import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GameState, Hero, MonsterInstance, Tile } from '../types';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { ABILITIES } from '../data/abilities';
import { themeFor, DungeonTheme } from '../visuals/dungeonTheme';

interface Float {
  id: string;
  targetId: string;        // hero or monster instance id (for positioning)
  text: string;
  color: string;
  big?: boolean;
  crit?: boolean;
  bornAt: number;
  kind: 'dmg' | 'heal' | 'miss' | 'shield' | 'xp' | 'gold' | 'kill';
  frozenPos?: SlotPos;     // for kills where the target disappears
}

interface LootPop {
  id: string;
  x: number;               // px (from container left)
  y: number;               // px
  icon: string;
  rarity: string;
  bornAt: number;
}

interface Flash {
  targetId: string;
  until: number;
  kind: 'dmg' | 'heal' | 'crit';
}

interface Props {
  state: GameState;
  clickMonster?: (monsterId: string) => void;
}

export const BattleView: React.FC<Props> = ({ state, clickMonster }) => {
  const dungeon = state.activeDungeon!;
  const theme = themeFor(dungeon.defId);
  const tile = dungeon.tiles.find(t => t.x === dungeon.partyPos.x && t.y === dungeon.partyPos.y)!;

  const heroes = state.heroes.filter(h => !h.bench);
  const enemies = tile.encounter?.monsters ?? [];

  // Track HP across renders to spawn damage floats / hit flashes.
  const prevHpRef = useRef<Record<string, { hp: number; maxHp: number }>>({});
  const prevTileKey = useRef<string>('');
  const [floats, setFloats] = useState<Float[]>([]);
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [loots, setLoots] = useState<LootPop[]>([]);
  const [nowTick, setNowTick] = useState(0);
  const [bossBanner, setBossBanner] = useState<{ name: string; until: number } | null>(null);

  // animation tick
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      setNowTick(Date.now());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Diff HP to create floats & flashes
  useEffect(() => {
    const now = Date.now();
    const newFloats: Float[] = [];
    const newFlashes: Flash[] = [];
    const all: Array<{ id: string; hp: number; maxHp: number; crit?: boolean }> = [];
    for (const h of state.heroes) all.push({ id: h.id, hp: h.hp, maxHp: h.maxHp });
    for (const m of enemies) all.push({ id: m.id, hp: m.hp, maxHp: m.maxHp });

    const newLoots: LootPop[] = [];
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
          color: isCrit ? '#ff5050' : '#ffd4a0',
          big: isCrit,
          crit: isCrit,
          bornAt: now,
          kind: 'dmg',
        });
        newFlashes.push({ targetId: c.id, until: now + 180, kind: isCrit ? 'crit' : 'dmg' });
        // Detect kill: prev hp > 0, new hp <= 0
        if (prev.hp > 0 && c.hp <= 0) {
          // find slot pos — only for monsters
          const mIdx = enemies.findIndex(e => e.id === c.id);
          if (mIdx >= 0) {
            const slot = computeEnemySlots(enemies.length)[mIdx];
            // Spawn loot pop icons for dying monsters
            const mdef = MONSTERS[enemies[mIdx].monsterId];
            const iconPool = ['🪙', mdef?.icon ?? '💥', '✨'];
            for (let k = 0; k < 3; k++) {
              newLoots.push({
                id: `loot_${now}_${c.id}_${k}`,
                x: parseFloat(slot.x) + (Math.random() - 0.5) * 6,
                y: parseFloat(slot.y) + (Math.random() - 0.5) * 6,
                icon: iconPool[k],
                rarity: 'common',
                bornAt: now + k * 100,
              });
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
          kind: 'heal',
        });
        newFlashes.push({ targetId: c.id, until: now + 180, kind: 'heal' });
      }
    }
    if (newLoots.length > 0) setLoots(l => [...l.slice(-60), ...newLoots]);

    if (newFloats.length > 0) {
      setFloats(f => [...f.slice(-80), ...newFloats]);
      setFlashes(f => [...f.filter(x => x.until > now), ...newFlashes]);
    }

    // update snapshot
    const next: Record<string, { hp: number; maxHp: number }> = {};
    for (const h of state.heroes) next[h.id] = { hp: h.hp, maxHp: h.maxHp };
    for (const m of enemies) next[m.id] = { hp: m.hp, maxHp: m.maxHp };
    prevHpRef.current = next;
  }, [state, enemies]);

  // Cull old floats/flashes/loots
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setFloats(f => f.filter(x => now - x.bornAt < 1100));
      setFlashes(f => f.filter(x => x.until > now));
      setLoots(l => l.filter(x => now - x.bornAt < 1400));
    }, 200);
    return () => window.clearInterval(id);
  }, []);

  // Boss banner: trigger when arriving on a boss tile with enemies.
  useEffect(() => {
    const key = `${dungeon.partyPos.x},${dungeon.partyPos.y}`;
    if (key !== prevTileKey.current) {
      prevTileKey.current = key;
      if (tile.kind === 'boss' && tile.encounter && tile.encounter.monsters.length > 0) {
        const bossDef = tile.encounter.monsters[0] && MONSTERS[tile.encounter.monsters[0].monsterId];
        setBossBanner({ name: bossDef?.name ?? 'BOSS', until: Date.now() + 2400 });
      }
    }
  }, [dungeon.partyPos.x, dungeon.partyPos.y, tile]);
  useEffect(() => {
    if (!bossBanner) return;
    const t = window.setTimeout(() => setBossBanner(null), bossBanner.until - Date.now());
    return () => window.clearTimeout(t);
  }, [bossBanner]);

  // Screen flash on critical events: crit, hero downed, boss fight start.
  const [screenFlash, setScreenFlash] = useState<{ color: string; until: number } | null>(null);
  useEffect(() => {
    const hasCrit = flashes.some(f => f.kind === 'crit');
    if (hasCrit) {
      setScreenFlash({ color: 'rgba(255, 60, 60, 0.2)', until: Date.now() + 180 });
    }
  }, [flashes]);
  useEffect(() => {
    if (!screenFlash) return;
    const id = window.setTimeout(() => setScreenFlash(null), 200);
    return () => window.clearTimeout(id);
  }, [screenFlash]);

  // Low HP: any hero < 25% triggers red pulse vignette.
  const lowHP = heroes.some(h => h.state === 'alive' && h.hp / h.maxHp < 0.25);

  // Compute sprite positions
  const partySlots = computePartySlots(heroes.length);
  const enemySlots = computeEnemySlots(enemies.length);

  return (
    <div className="relative w-full h-full overflow-hidden"
         style={{ background: theme.skyGradient }}>
      {/* Parallax background decoration */}
      <BackgroundDeco theme={theme} />

      {/* Ambient particles */}
      <AmbientParticles theme={theme} />

      {/* Floor */}
      <div className="absolute left-0 right-0 bottom-0"
           style={{ height: '40%', background: theme.floorGradient, boxShadow: `inset 0 30px 40px -20px ${theme.vignetteColor}` }}>
        <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ background: theme.floorBand }} />
      </div>

      {/* Fog layer */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: `radial-gradient(ellipse at center, transparent 40%, ${theme.fogColor} 80%)` }} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ boxShadow: `inset 0 0 200px ${theme.vignetteColor}` }} />

      {/* Screen flash layer (on crits) */}
      {screenFlash && (
        <div className="absolute inset-0 pointer-events-none z-40"
             style={{ background: screenFlash.color, animation: 'fadeIn 0.05s' }} />
      )}

      {/* Low-HP danger pulse */}
      {lowHP && (
        <div className="absolute inset-0 pointer-events-none z-10"
             style={{
               boxShadow: 'inset 0 0 120px rgba(255, 40, 40, 0.55)',
               animation: 'ambientFloat 1.2s ease-in-out infinite alternate',
             }} />
      )}

      {/* Dungeon label top-left */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur rounded-lg border"
           style={{ borderColor: theme.accentColor + '60', color: theme.accentColor }}>
        <span className="text-lg">{dungeon.icon}</span>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {dungeon.name}
          </div>
          <div className="text-[10px] text-[#B8A890]">
            Tile {dungeon.pathIndex + 1} / {dungeon.path.length} • Floor {dungeon.floor}
          </div>
        </div>
      </div>

      {/* Tile-type banner top-center */}
      <TileBanner tile={tile} theme={theme} />

      {/* Dungeon progress ribbon top-right */}
      <DungeonProgress state={state} theme={theme} />

      {/* Party sprites */}
      {heroes.map((h, i) => (
        <HeroSprite
          key={h.id}
          hero={h}
          pos={partySlots[i]}
          flash={flashes.find(f => f.targetId === h.id)}
          theme={theme}
          nowTick={nowTick}
        />
      ))}

      {/* Enemy sprites */}
      {enemies.map((m, i) => (
        <MonsterSprite
          key={m.id}
          monster={m}
          pos={enemySlots[i]}
          flash={flashes.find(f => f.targetId === m.id)}
          theme={theme}
          nowTick={nowTick}
          onClick={clickMonster ? () => clickMonster(m.id) : undefined}
        />
      ))}

      {/* Floating texts */}
      {floats.map(f => (
        <FloatingNumber
          key={f.id}
          float={f}
          heroes={heroes}
          enemies={enemies}
          partySlots={partySlots}
          enemySlots={enemySlots}
          nowTick={nowTick}
        />
      ))}

      {/* Idle "All quiet" or "Searching..." centered mid-ground */}
      {enemies.length === 0 && (
        <MidTileAction tile={tile} theme={theme} dungeon={dungeon} />
      )}

      {/* Click-to-attack hint */}
      {enemies.length > 0 && clickMonster && (
        <div className="absolute left-1/2 top-[15%] -translate-x-1/2 text-[10px] tracking-widest uppercase text-[#E8E0D4]/60 bg-black/40 px-2 py-0.5 rounded pointer-events-none"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          click enemies to strike
        </div>
      )}

      {/* Loot pops from dying enemies */}
      {loots.map(l => {
        const age = nowTick - l.bornAt;
        if (age < 0) return null;
        return (
          <div key={l.id}
               className="absolute pointer-events-none z-30"
               style={{
                 left: `${l.x}%`,
                 top: `${l.y}%`,
                 animation: 'lootPop 1.3s ease-out forwards',
                 animationDelay: `${age < 0 ? -age : 0}ms`,
                 fontSize: '2rem',
                 filter: 'drop-shadow(0 0 8px #D4A943)',
               }}>
            {l.icon}
          </div>
        );
      })}

      {/* BOSS entrance banner */}
      {bossBanner && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
             style={{ animation: 'bossEntrance 0.9s ease-out forwards' }}>
          <div className="text-center">
            <div className="text-[11px] text-[#ff6060] uppercase tracking-[0.4em] font-bold mb-1"
                 style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 10px #ff4040' }}>
              ⚠ DANGER ⚠
            </div>
            <div className="text-5xl font-black text-[#ff4040]"
                 style={{
                   fontFamily: "'Cinzel', serif",
                   textShadow: '0 0 30px #ff4040, 0 0 10px #000, 4px 4px 0 #000',
                   letterSpacing: '0.1em',
                 }}>
              {bossBanner.name.toUpperCase()}
            </div>
            <div className="mt-2 text-sm text-[#E86E6E] uppercase tracking-[0.3em]"
                 style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 8px #000' }}>
              APPEARS
            </div>
          </div>
        </div>
      )}

      {/* Ability bar bottom */}
      <AbilityBar heroes={heroes} theme={theme} nowTick={nowTick} />
    </div>
  );
};

// ============ Layout ============

interface SlotPos { x: string; y: string; scale?: number }

function computePartySlots(n: number): SlotPos[] {
  // 2x2 staggered formation for clean visibility
  const slots = [
    { x: '10%', y: '58%' },
    { x: '20%', y: '65%' },
    { x: '8%',  y: '72%' },
    { x: '22%', y: '78%' },
  ];
  return slots.slice(0, Math.max(1, n));
}

function computeEnemySlots(n: number): SlotPos[] {
  const slots = [
    { x: '82%', y: '58%' },
    { x: '72%', y: '65%' },
    { x: '84%', y: '72%' },
    { x: '70%', y: '78%' },
  ];
  return slots.slice(0, Math.max(1, n));
}

// ============ Hero sprite ============

const HeroSprite: React.FC<{
  hero: Hero;
  pos: SlotPos;
  flash: Flash | undefined;
  theme: DungeonTheme;
  nowTick: number;
}> = ({ hero, pos, flash, theme, nowTick }) => {
  const cls = CLASSES[hero.classId];
  const hpPct = Math.max(0, (hero.hp / hero.maxHp) * 100);
  const mpPct = hero.maxMp > 0 ? Math.max(0, (hero.mp / hero.maxMp) * 100) : 0;
  const downed = hero.state !== 'alive';
  const bob = Math.sin((nowTick / 450) + hashHue(hero.id)) * 3;
  const isCasting = hero.attackTimer < 120 && !downed;

  const flashColor = flash?.kind === 'heal' ? '#7FE2A0' : flash?.kind === 'crit' ? '#ff4040' : '#ffffff';

  return (
    <div
      id={'hero_' + hero.id}
      className="absolute"
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) translateY(${bob}px) ${isCasting ? 'translateX(16px)' : ''}`,
        transition: 'transform 180ms ease-out',
        filter: downed ? 'grayscale(100%) opacity(0.5)' : flash ? `drop-shadow(0 0 14px ${flashColor})` : undefined,
      }}
    >
      <div className="relative flex flex-col items-center">
        {/* HP + MP bars above */}
        <div className="mb-1 flex flex-col items-center gap-0.5" style={{ minWidth: 86 }}>
          <div className="w-full px-1 py-0.5 bg-black/80 rounded-sm border border-black/60">
            <div className="text-[9px] font-bold text-center truncate leading-tight"
                 style={{ color: cls.color, fontFamily: "'Cinzel', serif" }}>
              {hero.name}
            </div>
          </div>
          <div className="w-full h-2 bg-black/70 rounded-sm overflow-hidden relative border border-black/50">
            <div className="h-full transition-all"
                 style={{ width: hpPct + '%', background: 'linear-gradient(90deg, #4a9b3a 0%, #7FE2A0 100%)' }} />
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white"
                 style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000' }}>
              {Math.ceil(hero.hp)}/{hero.maxHp}
            </div>
          </div>
          {hero.maxMp > 0 && (
            <div className="w-full h-1 bg-black/70 rounded-sm overflow-hidden border border-black/50">
              <div className="h-full transition-all"
                   style={{ width: mpPct + '%', background: 'linear-gradient(90deg, #3867a0 0%, #6EA9E4 100%)' }} />
            </div>
          )}
        </div>

        {/* Shadow */}
        <div className="absolute -bottom-1 w-16 h-2 rounded-full opacity-50"
             style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 75%)' }} />

        {/* Sprite */}
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${cls.color}cc 0%, ${cls.color}44 60%, transparent 100%)`,
            border: `2px solid ${cls.color}`,
            boxShadow: `0 0 12px ${cls.color}80, inset 0 0 14px rgba(0,0,0,0.4)`,
          }}
        >
          <div className="text-4xl" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))' }}>
            {cls.icon}
          </div>
          {/* Shield overlay */}
          {hero.shield > 0 && (
            <div className="absolute inset-0 rounded-full pointer-events-none animate-pulse"
                 style={{ boxShadow: `inset 0 0 12px #6EA9E4, 0 0 18px #6EA9E480`, border: '2px solid #6EA9E4' }} />
          )}
          {/* Buff indicator */}
          {hero.buffs.length > 0 && (
            <div className="absolute -top-1 -right-1 text-xs">✨</div>
          )}
          {/* Hit flash overlay */}
          {flash && (
            <div className="absolute inset-0 rounded-full pointer-events-none"
                 style={{ background: flashColor, mixBlendMode: 'screen', opacity: 0.55 }} />
          )}
          {/* Level badge */}
          <div className="absolute -bottom-1 -right-1 text-[9px] font-bold rounded px-1 bg-black/80 border"
               style={{ borderColor: cls.color, color: cls.color, fontFamily: "'JetBrains Mono', monospace" }}>
            L{hero.level}
          </div>
          {/* Unspent ability point indicator */}
          {hero.abilityPoints > 0 && (
            <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-[#D4A943] text-black animate-pulse shadow-lg">
              !
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============ Monster sprite ============

const MonsterSprite: React.FC<{
  monster: MonsterInstance;
  pos: SlotPos;
  flash: Flash | undefined;
  theme: DungeonTheme;
  nowTick: number;
  onClick?: () => void;
}> = ({ monster, pos, flash, theme, nowTick, onClick }) => {
  const def = MONSTERS[monster.monsterId];
  if (!def) return null;
  const hpPct = Math.max(0, (monster.hp / monster.maxHp) * 100);
  const bob = Math.sin((nowTick / 380) + hashHue(monster.id)) * 4;
  const attacking = monster.attackTimer < 150;
  const flashColor = flash?.kind === 'crit' ? '#ff4040' : '#ffffff';
  const dying = monster.hp <= monster.maxHp * 0.25;
  const stunned = monster.stunRemaining > 0;
  const isBoss = def.boss;

  return (
    <div
      id={'mon_' + monster.id}
      className={`absolute ${onClick ? 'cursor-crosshair select-none active:scale-95' : ''}`}
      onClick={onClick}
      style={{
        left: pos.x,
        top: pos.y,
        transform: `translate(-50%, -50%) translateY(${bob}px) ${attacking ? 'translateX(-14px)' : ''} ${isBoss ? 'scale(1.35)' : ''}`,
        transition: 'transform 150ms ease-out',
        filter: flash ? `drop-shadow(0 0 14px ${flashColor})` : undefined,
        animation: monster.hp <= 0 ? 'fadeOut 0.5s forwards' : `popIn 0.5s ease-out`,
      }}
    >
      <div className="flex flex-col items-center">
        {/* Name + HP */}
        <div className="mb-1 flex flex-col items-center gap-0.5" style={{ minWidth: isBoss ? 120 : 86 }}>
          <div className="w-full px-1 py-0.5 bg-black/80 rounded-sm border"
               style={{ borderColor: isBoss ? '#ff5050' : 'rgba(0,0,0,0.6)' }}>
            <div className={`text-[9px] font-bold text-center truncate leading-tight ${isBoss ? 'text-[#ff8a5a]' : 'text-[#F2E6A8]'}`}
                 style={{ fontFamily: "'Cinzel', serif" }}>
              {isBoss && '👑 '}{def.name}
            </div>
          </div>
          <div className="w-full h-2 bg-black/70 rounded-sm overflow-hidden relative border border-black/50">
            <div className="h-full transition-all"
                 style={{ width: hpPct + '%', background: isBoss ? 'linear-gradient(90deg, #8a2020 0%, #ff5050 100%)' : 'linear-gradient(90deg, #8a2020 0%, #E86E6E 100%)' }} />
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white"
                 style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 2px #000' }}>
              {Math.ceil(monster.hp)}/{monster.maxHp}
            </div>
          </div>
        </div>

        {/* Shadow */}
        <div className={`absolute -bottom-1 rounded-full opacity-50`}
             style={{ width: isBoss ? '4.5rem' : '3.5rem', height: '0.5rem', background: 'radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, transparent 75%)' }} />

        {/* Sprite */}
        <div
          className="relative rounded-full flex items-center justify-center shadow-lg"
          style={{
            width: isBoss ? 72 : 56,
            height: isBoss ? 72 : 56,
            background: `radial-gradient(circle at 30% 30%, ${isBoss ? '#a02020' : '#502020'}cc 0%, #20080844 60%, transparent 100%)`,
            border: `2px solid ${isBoss ? '#ff5050' : '#E86E6E'}`,
            boxShadow: `0 0 12px ${isBoss ? '#ff5050' : '#E86E6E'}80, inset 0 0 14px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="text-4xl"
               style={{
                 filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))',
                 transform: `scaleX(-1) ${stunned ? 'rotate(' + (Math.sin(nowTick / 80) * 15) + 'deg)' : ''}`,
               }}>
            {def.icon}
          </div>
          {stunned && <div className="absolute -top-2 -right-1 text-sm animate-spin">💫</div>}
          {monster.dots.length > 0 && <div className="absolute -bottom-2 -right-1 text-xs">🟢</div>}
          {flash && (
            <div className="absolute inset-0 rounded-full pointer-events-none"
                 style={{ background: flashColor, mixBlendMode: 'screen', opacity: 0.6 }} />
          )}
          <div className="absolute -bottom-1 -left-1 text-[9px] font-bold rounded px-1 bg-black/80 border border-[#E86E6E] text-[#E86E6E]"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            L{def.level}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ Floating damage number ============

const FloatingNumber: React.FC<{
  float: Float;
  heroes: Hero[];
  enemies: MonsterInstance[];
  partySlots: SlotPos[];
  enemySlots: SlotPos[];
  nowTick: number;
}> = ({ float, heroes, enemies, partySlots, enemySlots, nowTick }) => {
  // Find target's current slot pos
  const heroIdx = heroes.findIndex(h => h.id === float.targetId);
  const enemyIdx = enemies.findIndex(m => m.id === float.targetId);
  const pos = heroIdx >= 0 ? partySlots[heroIdx] : enemyIdx >= 0 ? enemySlots[enemyIdx] : undefined;
  if (!pos) return null;

  const age = nowTick - float.bornAt;
  const t = Math.min(1, age / 1000);
  const dy = -80 * t;
  const opacity = 1 - t;
  const scale = 1 + (float.big ? 0.6 : 0.3) * Math.max(0, 1 - t * 2);

  return (
    <div className="absolute pointer-events-none z-30"
         style={{
           left: pos.x,
           top: pos.y,
           transform: `translate(-50%, calc(-50% + ${dy}px)) scale(${scale})`,
           opacity,
         }}>
      <span className={`font-black ${float.big ? 'text-4xl' : 'text-2xl'}`}
            style={{
              color: float.color,
              textShadow: `0 0 8px ${float.color}cc, 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000`,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
        {float.text}
        {float.crit && <span className="text-[10px] block">CRIT!</span>}
      </span>
    </div>
  );
};

// ============ Tile banner ============

const TileBanner: React.FC<{ tile: Tile; theme: DungeonTheme }> = ({ tile, theme }) => {
  const labels: Record<string, { text: string; icon: string; color: string }> = {
    entrance: { text: 'Entering Dungeon...', icon: '🚪', color: '#B8A890' },
    monster: { text: 'Monsters ambush!', icon: '⚔', color: '#E86E6E' },
    chest: { text: 'A chest!', icon: '📦', color: '#D4A943' },
    trap: { text: 'A trap!', icon: '⚠', color: '#ff6060' },
    shrine: { text: 'An ancient shrine...', icon: '⛩', color: '#7FE2A0' },
    fountain: { text: 'A strange fountain.', icon: '⛲', color: '#6EA9E4' },
    fork: { text: 'The path splits.', icon: '🛤', color: '#F2E6A8' },
    merchant: { text: 'A merchant!', icon: '🧳', color: '#D4A943' },
    boss: { text: 'BOSS FIGHT!', icon: '👑', color: '#ff4040' },
    empty: { text: 'Empty corridor.', icon: '...', color: '#7A6E60' },
    exit: { text: 'Return Portal.', icon: '🚪', color: '#B8A890' },
  };
  const L = labels[tile.kind];
  if (!L) return null;
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/70 backdrop-blur rounded-full border"
         style={{ borderColor: L.color + '60', color: L.color }}>
      <span className="text-sm font-bold tracking-wide flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}>
        <span>{L.icon}</span>{L.text}
      </span>
    </div>
  );
};

// ============ Mid-tile action / progress ring ============

const MidTileAction: React.FC<{ tile: Tile; theme: DungeonTheme; dungeon: any }> = ({ tile, theme, dungeon }) => {
  if (tile.encounter) return null;
  const hasNext = dungeon.moveTimer > 0 && dungeon.status === 'active';
  if (!hasNext) return null;
  const t = 1 - Math.min(1, dungeon.moveTimer / 3500);
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80" className="absolute inset-0">
          <circle cx="40" cy="40" r="30" stroke="#00000040" strokeWidth="4" fill="none" />
          <circle cx="40" cy="40" r="30"
                  stroke={theme.accentColor}
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${Math.PI * 60}`}
                  strokeDashoffset={`${Math.PI * 60 * (1 - t)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  style={{ transition: 'stroke-dashoffset 100ms linear' }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">👣</div>
      </div>
    </div>
  );
};

// ============ Top-right dungeon progress ============

const DungeonProgress: React.FC<{ state: GameState; theme: DungeonTheme }> = ({ state, theme }) => {
  const d = state.activeDungeon!;
  return (
    <div className="absolute top-3 right-3 flex flex-wrap gap-0.5 max-w-xs justify-end">
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
               title={`Tile ${i + 1}: ${kind}`}
          />
        );
      })}
    </div>
  );
};

// ============ Parallax background decoration ============

const BackgroundDeco: React.FC<{ theme: DungeonTheme }> = ({ theme }) => {
  const emojis = useMemo(() => {
    const arr: { emoji: string; x: number; y: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 14; i++) {
      arr.push({
        emoji: theme.bgEmoji[i % theme.bgEmoji.length],
        x: Math.random() * 100,
        y: 10 + Math.random() * 40,
        size: 20 + Math.random() * 30,
        alpha: 0.15 + Math.random() * 0.15,
      });
    }
    return arr;
  }, [theme]);
  return (
    <div className="absolute inset-0 pointer-events-none">
      {emojis.map((e, i) => (
        <div key={i} className="absolute"
             style={{
               left: `${e.x}%`,
               top: `${e.y}%`,
               fontSize: e.size,
               opacity: e.alpha,
               filter: 'grayscale(40%) blur(0.3px)',
             }}>
          {e.emoji}
        </div>
      ))}
    </div>
  );
};

// ============ Ambient particles ============

const AmbientParticles: React.FC<{ theme: DungeonTheme }> = ({ theme }) => {
  // Generate particle positions once
  const particles = useMemo(() => {
    const count = theme.ambientKind === 'stars' ? 40 : 22;
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
      case 'snow': return { background: '#d5ecff', borderRadius: '50%', opacity: 0.7 };
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <div key={p.id}
             className="absolute"
             style={{
               left: `${p.x}%`,
               top: `${p.y}%`,
               width: p.size,
               height: p.size,
               animation: `ambientFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
               ...kindStyle(theme.ambientKind),
             }} />
      ))}
    </div>
  );
};

// ============ Ability bar ============

const AbilityBar: React.FC<{ heroes: Hero[]; theme: DungeonTheme; nowTick: number }> = ({ heroes, theme, nowTick }) => {
  return (
    <div className="absolute left-0 right-0 bottom-0 px-3 py-2 bg-gradient-to-t from-black/90 to-transparent">
      <div className="flex gap-3 justify-center">
        {heroes.map(h => (
          <HeroAbilityStack key={h.id} hero={h} nowTick={nowTick} />
        ))}
      </div>
    </div>
  );
};

const HeroAbilityStack: React.FC<{ hero: Hero; nowTick: number }> = ({ hero, nowTick }) => {
  const cls = CLASSES[hero.classId];
  return (
    <div className="flex flex-col items-center">
      <div className="text-[9px] font-bold mb-1" style={{ color: cls.color, fontFamily: "'JetBrains Mono', monospace" }}>
        {hero.name.split(' ')[0].toUpperCase()}
      </div>
      <div className="flex gap-1">
        {hero.abilities.slice(0, 4).map(abId => {
          const ab = ABILITIES[abId];
          if (!ab) return null;
          const cd = hero.cooldowns[abId] ?? 0;
          const ready = cd <= 0 && hero.mp >= ab.manaCost && hero.state === 'alive';
          const t = ab.cooldown > 0 ? 1 - Math.min(1, cd / ab.cooldown) : 1;
          return (
            <div key={abId}
                 className="relative w-10 h-10 rounded-md border flex items-center justify-center overflow-hidden"
                 style={{
                   background: ready ? cls.color + '30' : '#14100C',
                   borderColor: ready ? cls.color : '#3D3328',
                   boxShadow: ready ? `0 0 8px ${cls.color}80` : 'none',
                 }}
                 title={`${ab.name} — ${ab.description}`}>
              <span className="text-xl">{ab.icon}</span>
              {!ready && (
                <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="18"
                          fill="none"
                          stroke="rgba(0,0,0,0.7)"
                          strokeWidth="36"
                          strokeDasharray={`${Math.PI * 36}`}
                          strokeDashoffset={`${Math.PI * 36 * t}`}
                          transform="rotate(-90 20 20)"
                          opacity="0.6" />
                </svg>
              )}
              {!ready && cd > 0 && (
                <div className="absolute bottom-0 left-0 right-0 text-[8px] text-center font-bold text-white bg-black/80"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {(cd / 1000).toFixed(1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============ helpers ============

function hashHue(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return (h % 1000) / 100;
}
