import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GameState, Hero, MonsterInstance, Tile, Rarity } from '../types';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { ABILITIES } from '../data/abilities';
import { ITEMS } from '../data/items';
import { themeFor } from '../visuals/dungeonTheme';
import { ClassSprite } from '../visuals/sprites';
import { PixelMapView } from './PixelMapView';
import { effectiveStats, totalArmor, weaponPower, xpToNext } from '../engine/util';
import { bountyProgress } from '../useGame';

/* ============================================================
   BattleView — hosts the PixelMapView stage, plus overlays
   (boss banner, victory celebration, combo streak, low-HP
   vignette) and two side/bottom control panels.
   ============================================================ */

interface Props {
  state: GameState;
  clickMonster?: (monsterId: string) => void;
  autoEquipBest?: () => void;
  quickHealParty?: () => void;
  reviveHero?: (heroId: string) => void;
  sellJunk?: () => void;
  useScroll?: (itemId: string) => void;
  spendAllAP?: () => void;
  autoEnchantCheapest?: () => void;
  quickHealHero?: (heroId: string) => void;
}

export const BattleView: React.FC<Props> = ({
  state, clickMonster, autoEquipBest, quickHealParty, reviveHero, sellJunk, useScroll,
  spendAllAP, autoEnchantCheapest, quickHealHero,
}) => {
  const dungeon = state.activeDungeon!;
  const tile = dungeon.tiles.find(t => t.x === dungeon.partyPos.x && t.y === dungeon.partyPos.y)!;
  const heroes = state.heroes.filter(h => !h.bench);

  // Animation tick for overlays that need a steady clock.
  const [, setNowTick] = useState(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => { setNowTick(Date.now()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const nowTick = Date.now();

  // Boss banner: fires when we step into a boss tile with live enemies.
  const [bossBanner, setBossBanner] = useState<{ name: string; until: number } | null>(null);
  const prevTileKey = useRef<string>('');
  useEffect(() => {
    const key = `${dungeon.partyPos.x},${dungeon.partyPos.y}`;
    if (key === prevTileKey.current) return;
    prevTileKey.current = key;
    if (tile.kind === 'boss' && tile.encounter && tile.encounter.monsters.length > 0) {
      const bossDef = tile.encounter.monsters[0] && MONSTERS[tile.encounter.monsters[0].monsterId];
      setBossBanner({ name: bossDef?.name ?? 'BOSS', until: Date.now() + 2400 });
    }
  }, [dungeon.partyPos.x, dungeon.partyPos.y, tile]);
  useEffect(() => {
    if (!bossBanner) return;
    const t = window.setTimeout(() => setBossBanner(null), Math.max(0, bossBanner.until - Date.now()));
    return () => window.clearTimeout(t);
  }, [bossBanner]);

  // Light screen-shake trigger: any time a hero takes damage, briefly shake.
  // Driven by the max `lastHitAt` across active heroes.
  const [shakeUntil, setShakeUntil] = useState<number>(0);
  const prevMaxHitRef = useRef<number>(0);
  useEffect(() => {
    let maxHit = 0;
    for (const h of heroes) {
      if (h.lastHitAt && h.lastHitAt > maxHit) maxHit = h.lastHitAt;
    }
    if (maxHit > prevMaxHitRef.current) {
      setShakeUntil(Date.now() + 180);
      prevMaxHitRef.current = maxHit;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Low-HP red vignette
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
          {/* Pixel-art top-down map — party walks through the dungeon */}
          <PixelMapView state={state} clickMonster={clickMonster} />

          {/* Victory celebration overlay */}
          {dungeon.status === 'victory' && dungeon.victoryAt && (
            <VictoryCelebration dungeon={dungeon} nowTick={nowTick} />
          )}

          {/* Boss entrance banner */}
          {bossBanner && (
            <div className="absolute left-1/2 top-[22%] -translate-x-1/2 z-50 pointer-events-none"
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

          {/* Screen flash when the party takes a heavy hit */}
          {Date.now() < shakeUntil && (
            <div className="absolute inset-0 pointer-events-none z-40"
                 style={{ background: 'rgba(255, 60, 60, 0.18)' }} />
          )}

          {/* Combo streak banner bottom-right */}
          {state.killCombo >= 2 && (Date.now() - state.lastKillAt < 3000) && (
            <ComboBanner combo={state.killCombo} lastKillAt={state.lastKillAt} nowTick={nowTick} />
          )}

          {/* Compact floating log strip bottom-left */}
          <CompactLogStrip state={state} nowTick={nowTick} />

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
                    sellJunk={sellJunk}
                    useScroll={useScroll}
                    spendAllAP={spendAllAP}
                    autoEnchantCheapest={autoEnchantCheapest}
                    quickHealHero={quickHealHero} />
      </div>

      {/* BOTTOM PANEL */}
      <BottomPanel state={state} />
    </div>
  );
};

/* ============ Compact log strip ============ */

const LOG_STRIP_MS = 6000;

const CompactLogStrip: React.FC<{ state: GameState; nowTick: number }> = ({ state, nowTick }) => {
  // Show the 3 most recent log entries that are "interesting" (not move/system).
  const recent = state.currentLog
    .filter(e => e.kind !== 'move' && e.kind !== 'system')
    .slice(0, 3)
    .filter(e => nowTick - e.t < LOG_STRIP_MS);
  if (recent.length === 0) return null;
  return (
    <div className="absolute left-3 bottom-3 z-20 pointer-events-none space-y-0.5">
      {recent.map(e => {
        const age = nowTick - e.t;
        const t = age / LOG_STRIP_MS;
        const opacity = 1 - t;
        const color = e.rarity ? rarityLineColor(e.rarity) : kindLineColor(e.kind);
        return (
          <div key={e.id}
               className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm"
               style={{
                 background: 'rgba(0,0,0,0.72)',
                 borderLeft: `2px solid ${color}`,
                 opacity,
                 transform: `translateY(${(1 - opacity) * -6}px)`,
                 fontFamily: "'JetBrains Mono', monospace",
                 transition: 'opacity 0.2s, transform 0.2s',
               }}>
            <span className="text-[11px]" style={{ color }}>{e.text}</span>
          </div>
        );
      })}
    </div>
  );
};

function kindLineColor(k: string): string {
  switch (k) {
    case 'combat': return '#E8E0D4';
    case 'loot': return '#D4A943';
    case 'level': return '#F2E6A8';
    case 'decision': return '#B485E8';
    case 'death': return '#E86E6E';
    case 'heal': return '#7FE2A0';
    case 'victory': return '#F2B84B';
    case 'retreat': return '#B8A890';
    default: return '#B8A890';
  }
}

function rarityLineColor(r: string): string {
  switch (r) {
    case 'uncommon': return '#7FE2A0';
    case 'rare': return '#6EA9E4';
    case 'epic': return '#C58BE8';
    case 'legendary': return '#F2B84B';
    case 'celestial': return '#FF6EE6';
    default: return '#E8E0D4';
  }
}

/* ============ Combo banner ============ */

const ComboBanner: React.FC<{ combo: number; lastKillAt: number; nowTick: number }> = ({ combo, lastKillAt, nowTick }) => {
  const age = nowTick - lastKillAt;
  const t = Math.max(0, 1 - age / 3000);
  const bonus = Math.min(100, (combo - 1) * 5);
  return (
    <div className="absolute bottom-3 right-3 z-30 pointer-events-none"
         style={{ animation: 'comboPulse 0.45s ease-out' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
           style={{
             background: 'linear-gradient(90deg, rgba(60,16,4,0.92) 0%, rgba(28,8,4,0.92) 100%)',
             border: '2px solid #ff6040',
             boxShadow: `0 0 ${14 + combo}px #ff604080`,
           }}>
        <span className="text-3xl" style={{ filter: `drop-shadow(0 0 6px #ff4040)` }}>🔥</span>
        <div>
          <div className="text-[9px] text-[#ff8a5a] font-bold uppercase tracking-widest leading-none"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Combo
          </div>
          <div className="text-2xl font-black text-[#ffc890] leading-none"
               style={{ fontFamily: "'Cinzel', serif", textShadow: '0 0 10px #ff4040' }}>
            ×{combo}
          </div>
          <div className="text-[9px] text-[#B8A890] leading-none mt-0.5">+{bonus}% rewards</div>
        </div>
      </div>
      <div className="mt-1 h-1 rounded bg-black/60 overflow-hidden" style={{ width: 150 }}>
        <div className="h-full" style={{ width: `${t * 100}%`, background: '#ff6040', transition: 'width 0.1s linear' }} />
      </div>
    </div>
  );
};

/* ============ Victory celebration ============ */

const VictoryCelebration: React.FC<{ dungeon: any; nowTick: number }> = ({ dungeon, nowTick }) => {
  const age = nowTick - (dungeon.victoryAt ?? nowTick);
  if (age > 2500 || age < 0) return null;
  const t = Math.min(1, age / 2500);
  const coins = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100,
    delay: Math.random() * 300,
    speed: 0.7 + Math.random() * 0.8,
    angle: (Math.random() - 0.5) * 60,
    emoji: Math.random() > 0.7 ? '💎' : Math.random() > 0.5 ? '✨' : '🪙',
    size: 20 + Math.random() * 16,
  })), [dungeon.victoryAt]);
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {coins.map((c, i) => {
        const local = Math.max(0, age - c.delay) * c.speed;
        const y = -20 + (local / 2500) * 140;
        const r = local * 0.6 + c.angle;
        const op = local < 300 ? local / 300 : 1 - Math.max(0, (local - 2100) / 400);
        return (
          <span key={i} className="absolute"
                style={{
                  left: `${c.x}%`, top: `${y}%`,
                  fontSize: c.size,
                  transform: `rotate(${r}deg)`,
                  opacity: Math.max(0, Math.min(1, op)),
                  filter: 'drop-shadow(0 0 8px #f2c846) drop-shadow(0 0 16px #f2c846aa)',
                }}>{c.emoji}</span>
        );
      })}
      <div className="absolute inset-0"
           style={{
             background: `radial-gradient(circle at 50% 40%, rgba(242, 200, 70, ${0.35 * (1 - t * 0.7)}) 0%, transparent 55%)`,
             mixBlendMode: 'screen',
           }} />
      <div className="absolute left-1/2 top-[28%] -translate-x-1/2 text-center"
           style={{ animation: 'bossEntrance 0.9s ease-out forwards' }}>
        <div className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#f2e08a] mb-2"
             style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 12px #f2c846' }}>
          🏆 DUNGEON CLEARED 🏆
        </div>
        <div className="text-6xl font-black px-8 py-3 rounded-lg"
             style={{
               fontFamily: "'Cinzel', serif",
               color: '#fff3c8',
               background: 'linear-gradient(90deg, #5a3a08 0%, #d4a943 50%, #5a3a08 100%)',
               backgroundSize: '200% 100%',
               animation: 'shimmer 2s infinite linear',
               border: '3px solid #f2e08a',
               textShadow: '0 0 18px #f2c846, 3px 3px 0 #2a1800',
               boxShadow: '0 0 50px #d4a94380, inset 0 0 20px #00000040',
               letterSpacing: '0.12em',
             }}>
          VICTORY
        </div>
      </div>
    </div>
  );
};

/* ============ Right quick-actions panel ============ */

const RightPanel: React.FC<{
  state: GameState;
  autoEquipBest?: () => void;
  quickHealParty?: () => void;
  reviveHero?: (heroId: string) => void;
  sellJunk?: () => void;
  useScroll?: (itemId: string) => void;
  spendAllAP?: () => void;
  autoEnchantCheapest?: () => void;
  quickHealHero?: (heroId: string) => void;
}> = ({ state, autoEquipBest, quickHealParty, reviveHero, sellJunk, useScroll, spendAllAP, autoEnchantCheapest, quickHealHero }) => {
  const dead = state.heroes.filter(h => h.state !== 'alive');
  const xpTotal = state.heroes.reduce((a, h) => a + h.xp + h.level * 1000, 0);
  const healingPotions = Object.entries(state.stash.items)
    .filter(([id]) => ['healing_potion', 'greater_healing_potion', 'elixir_of_life'].includes(id))
    .reduce((a, [, q]) => a + q, 0);
  const manaPotions = state.stash.items['mana_potion'] ?? 0;

  const upgradeCount = Object.entries(state.stash.items)
    .filter(([id]) => ITEMS[id]?.slot)
    .reduce((a, [, q]) => a + q, 0);

  const { junkGold, junkCount } = Object.entries(state.stash.items).reduce((acc, [id, qty]) => {
    const it = ITEMS[id];
    if (!it || it.slot || it.type === 'potion' || it.type === 'consumable') return acc;
    if (it.rarity === 'common' || it.rarity === 'uncommon') {
      acc.junkGold += Math.floor(it.value * qty * 0.5);
      acc.junkCount += qty;
    }
    return acc;
  }, { junkGold: 0, junkCount: 0 });

  const active = state.heroes.filter(h => !h.bench && h.state === 'alive');
  const avgHpPct = active.length ? active.reduce((a, h) => a + h.hp / h.maxHp, 0) / active.length : 1;
  const partyNeedsHeal = avgHpPct < 0.7;

  // AP available across active roster
  const apAvailable = state.heroes.reduce((a, h) => a + (h.bench ? 0 : h.abilityPoints), 0);

  // Cheapest affordable enchant (hero+slot) right now
  const cheapestEnchant = (() => {
    let best: { label: string; gold: number } | null = null;
    const slots: Array<'weapon'|'offhand'|'head'|'body'|'legs'|'feet'|'neck'|'ring'> =
      ['weapon', 'offhand', 'head', 'body', 'legs', 'feet', 'neck', 'ring'];
    for (const h of state.heroes) {
      if (h.bench) continue;
      for (const slot of slots) {
        if (!h.equipment[slot]) continue;
        const tier = (h.enchants?.[slot] ?? 0);
        if (tier >= 10) continue;
        const item = ITEMS[h.equipment[slot]!];
        if (!item) continue;
        const nextTier = tier + 1;
        const gold = Math.floor(item.value * 0.6 * Math.pow(1.8, nextTier));
        // naive — doesn't check materials, but enough for a "cheapest" hint
        if (state.stash.gold >= gold && (!best || gold < best.gold)) {
          best = { label: `${h.name.slice(0,8)}·${slot}+${nextTier}`, gold };
        }
      }
    }
    return best;
  })();

  return (
    <aside className="w-72 shrink-0 bg-[#0B0807] border-l-2 border-[#3D3328] flex flex-col overflow-hidden">
      {/* Totals — 2x2 grid for tighter layout */}
      <div className="p-2 border-b border-[#3D3328] grid grid-cols-2 gap-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <FlashingStat label="🪙 GOLD" value={state.stash.gold} color="#D4A943" />
        <FlashingStat label="⟡ ESS"  value={state.stash.essence} color="#B485E8" />
        <FlashingStat label="⚔ KILLS" value={state.totalMonstersKilled} color="#7FE2A0" />
        <FlashingStat label="XP" value={xpTotal} color="#F2E6A8" />
      </div>

      {/* Party status: per-hero mini portraits with click-to-heal */}
      <div className="px-2 pt-2 pb-1 border-b border-[#3D3328]/70">
        <SectionLabel>Party Status</SectionLabel>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {active.map(h => {
            const cls = CLASSES[h.classId];
            const hpPct = (h.hp / h.maxHp) * 100;
            const mpPct = h.maxMp > 0 ? (h.mp / h.maxMp) * 100 : 0;
            const color = hpPct > 66 ? '#55d86b' : hpPct > 33 ? '#e9cc3a' : '#e04040';
            const low = hpPct < 50;
            return (
              <button key={h.id}
                      onClick={() => quickHealHero && quickHealHero(h.id)}
                      title={low ? 'Heal this hero' : 'Fully healthy'}
                      disabled={!low || healingPotions === 0}
                      className={`group flex items-center gap-1.5 px-1.5 py-1 rounded border text-left transition-all ${
                        low && healingPotions > 0
                          ? 'cursor-pointer hover:scale-[1.02] hover:border-[#7FE2A0]'
                          : 'cursor-default'
                      }`}
                      style={{
                        background: 'rgba(10,8,6,0.75)',
                        borderColor: low ? '#E86E6E' : cls.color + '50',
                        animation: low ? 'ambientFloat 1.4s ease-in-out infinite alternate' : undefined,
                      }}>
                <span style={{ width: 24, height: 28, display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <ClassSprite classId={h.classId} size={24} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-bold truncate leading-none"
                       style={{ color: cls.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {h.name.slice(0, 8)}
                  </div>
                  <div className="relative h-[4px] mt-0.5 rounded-sm overflow-hidden bg-black/80">
                    <div className="h-full" style={{ width: hpPct + '%', background: color, transition: 'width 200ms' }} />
                  </div>
                  {h.maxMp > 0 && (
                    <div className="relative h-[2px] mt-0.5 rounded-sm overflow-hidden bg-black/80">
                      <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc' }} />
                    </div>
                  )}
                </div>
                {low && healingPotions > 0 && (
                  <span className="text-sm shrink-0" style={{ filter: 'drop-shadow(0 0 3px #7FE2A0)' }}>🧪</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
        <SectionLabel>Quick Actions</SectionLabel>

        <div className="grid grid-cols-2 gap-1.5">
          <MiniAction
            icon="🧪"
            title="Heal Party"
            right={partyNeedsHeal ? `${Math.round(avgHpPct * 100)}%` : 'OK'}
            subtitle={`${healingPotions + manaPotions} potions`}
            onClick={quickHealParty}
            color="#7FE2A0"
            pulse={partyNeedsHeal && healingPotions > 0}
            disabled={healingPotions + manaPotions === 0 || !partyNeedsHeal}
          />
          <MiniAction
            icon="🛡"
            title="Equip Best"
            right={upgradeCount > 0 ? `+${upgradeCount}` : '—'}
            subtitle={upgradeCount > 0 ? 'Swap upgrades' : 'No new gear'}
            onClick={autoEquipBest}
            color="#D4A943"
            pulse={upgradeCount > 3}
            disabled={upgradeCount === 0}
          />
          <MiniAction
            icon="💰"
            title="Sell Junk"
            right={junkGold > 0 ? `+${junkGold}g` : '—'}
            subtitle={junkGold > 0 ? `${junkCount} items` : 'No junk'}
            onClick={sellJunk}
            color="#F2B84B"
            pulse={junkGold > 200}
            disabled={junkGold === 0}
          />
          <MiniAction
            icon="⭐"
            title="Spend AP"
            right={apAvailable > 0 ? `${apAvailable}` : '—'}
            subtitle={apAvailable > 0 ? 'Auto-learn abilities' : 'No points'}
            onClick={spendAllAP}
            color="#B485E8"
            pulse={apAvailable >= 2}
            disabled={apAvailable === 0}
          />
          <MiniAction
            icon="🔨"
            title="Enchant"
            right={cheapestEnchant ? `${cheapestEnchant.gold}g` : '—'}
            subtitle={cheapestEnchant ? cheapestEnchant.label : 'Can\'t afford'}
            onClick={autoEnchantCheapest}
            color="#E86E6E"
            disabled={!cheapestEnchant}
          />
          <MiniAction
            icon="⟡"
            title="Essence"
            right={state.stash.essence > 0 ? `${state.stash.essence}` : '—'}
            subtitle="Burn at Shrine"
            disabled={true}
            color="#B485E8"
          />
        </div>

        {/* Recent loot ticker */}
        <RecentLootTicker state={state} />

        {state.killCombo >= 3 && (
          <div className="rounded-md border px-1.5 py-1 flex items-center gap-1.5"
               style={{
                 background: 'linear-gradient(90deg, #3a0808 0%, #1a0404 100%)',
                 borderColor: '#ff6060',
                 boxShadow: '0 0 10px #ff606060',
               }}>
            <span className="text-xl">🔥</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#ff8a5a] leading-none"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Combo Streak
              </div>
              <div className="text-[9px] text-[#B8A890] leading-none mt-0.5">
                +{Math.min(100, (state.killCombo - 1) * 5)}% gold/xp
              </div>
            </div>
            <div className="text-lg font-black text-[#ff8a5a] leading-none"
                 style={{ textShadow: '0 0 8px #ff6060' }}>
              ×{state.killCombo}
            </div>
          </div>
        )}

        {/* Scroll quickbar */}
        {useScroll && (() => {
          const scrolls = Object.entries(state.stash.items)
            .filter(([id, q]) => q > 0 && id.startsWith('scroll_'))
            .map(([id, q]) => ({ id, qty: q, item: ITEMS[id] }))
            .filter(x => x.item);
          if (scrolls.length === 0) return null;
          return (
            <div>
              <SectionLabel color="#6EA9E4">Scrolls</SectionLabel>
              <div className="grid grid-cols-2 gap-1">
                {scrolls.map(s => (
                  <button key={s.id}
                          onClick={() => useScroll(s.id)}
                          className="group px-1.5 py-1 rounded border text-left transition-all hover:scale-[1.04] hover:border-[#6EA9E4] cursor-pointer"
                          style={{
                            background: 'linear-gradient(140deg, #6EA9E424 0%, #6EA9E408 60%, transparent 100%)',
                            borderColor: '#6EA9E460',
                          }}
                          title={s.item.description}>
                    <div className="flex items-center gap-1">
                      <span className="text-base shrink-0" style={{ filter: 'drop-shadow(0 0 3px #6EA9E4)' }}>{s.item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-black text-[#9bc9ff] truncate leading-none tracking-wide">
                          {s.item.name.replace(/^Scroll of /, '').toUpperCase()}
                        </div>
                        <div className="text-[9px] text-[#5e8aba] leading-none mt-0.5"
                             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          ×{s.qty}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {dead.length > 0 && (
          <div className="space-y-1">
            <SectionLabel color="#E86E6E">Downed Heroes</SectionLabel>
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

        {/* Daily bounties (compact) */}
        {state.bountyBoard && (
          <div className="mt-2">
            <SectionLabel color="#F2E6A8">Daily Bounties</SectionLabel>
            <div className="bg-black/40 rounded border border-[#D4A943]/40 p-2 space-y-1.5">
              {state.bountyBoard.bounties.map(b => {
                const prog = bountyProgress(state, b);
                const pct = Math.min(100, (prog / b.target) * 100);
                const done = prog >= b.target;
                return (
                  <div key={b.id} className={b.claimed ? 'opacity-40' : ''}>
                    <div className="flex items-center justify-between gap-1 text-[10px]"
                         style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      <span className="text-[#B8A890] truncate flex-1">{b.label}</span>
                      <span className={done && !b.claimed ? 'text-[#7FE2A0] font-bold' : 'text-[#7A6E60]'}>
                        {Math.min(prog, b.target)}/{b.target}
                      </span>
                    </div>
                    <div className="h-1 bg-black/80 rounded overflow-hidden mt-0.5">
                      <div className="h-full transition-all"
                           style={{
                             width: pct + '%',
                             background: done ? '#7FE2A0' : '#D4A943',
                           }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Blessing summary */}
        {Object.values(state.blessings ?? {}).some(v => v && v > 0) && (
          <div className="mt-2">
            <SectionLabel color="#B485E8">Shrine Blessings</SectionLabel>
            <div className="bg-black/40 rounded border border-[#B485E8]/40 p-2 text-[10px] space-y-0.5"
                 style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {Object.entries(state.blessings ?? {}).map(([id, lvl]) => (
                lvl && lvl > 0 && (
                  <div key={id} className="flex justify-between text-[#c4a0e8]">
                    <span className="uppercase">{id}</span>
                    <span className="text-[#F2E6A8] font-bold">Lv {lvl}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <div className="mt-2"><SectionLabel>Collection</SectionLabel></div>
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
            <span>Best combo</span>
            <span className="text-[#F2E6A8] font-bold">×{state.bestKillCombo}</span>
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

const FlashingStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const [flashKey, setFlashKey] = useState(0);
  const prevRef = useRef<number>(value);
  const displayed = useCountUp(value, 500);
  useEffect(() => {
    if (value > prevRef.current) setFlashKey(k => k + 1);
    prevRef.current = value;
  }, [value]);
  return (
    <div key={flashKey}
         className="relative flex flex-col px-1.5 py-1 rounded border overflow-hidden"
         style={{
           background: `linear-gradient(140deg, ${color}18 0%, rgba(0,0,0,0.55) 100%)`,
           borderColor: color + '40',
           animation: flashKey > 0 ? 'goldCounterFlash 0.45s ease-out' : undefined,
         }}>
      <span className="text-[9px] font-black tracking-widest" style={{ color, opacity: 0.85 }}>{label}</span>
      <span className="text-sm font-black tabular-nums leading-none" style={{ color, textShadow: `0 0 6px ${color}40` }}>
        {displayed.toLocaleString()}
      </span>
    </div>
  );
};

const RecentLootTicker: React.FC<{ state: GameState }> = ({ state }) => {
  const loot = state.currentLog
    .filter(e => e.kind === 'loot' && e.rarity && e.rarity !== 'common')
    .slice(0, 4);
  if (loot.length === 0) return null;
  return (
    <div className="mt-2">
      <SectionLabel color="#D4A943">Recent Loot</SectionLabel>
      <div className="space-y-0.5">
        {loot.map(e => {
          const color =
            e.rarity === 'uncommon'  ? '#7FE2A0' :
            e.rarity === 'rare'      ? '#6EA9E4' :
            e.rarity === 'epic'      ? '#C58BE8' :
            e.rarity === 'legendary' ? '#F2B84B' :
                                       '#FF6EE6';
          return (
            <div key={e.id}
                 className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border"
                 style={{
                   background: `linear-gradient(90deg, ${color}18 0%, transparent 100%)`,
                   borderColor: color + '50',
                 }}>
              <span className="text-[10px] truncate" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
                {e.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SectionLabel: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
  <div className="text-[9px] uppercase tracking-widest font-bold px-1 pb-1"
       style={{
         color: color ?? '#7A6E60',
         fontFamily: "'JetBrains Mono', monospace",
         letterSpacing: '0.18em',
       }}>
    {children}
  </div>
);

const MiniAction: React.FC<{
  icon: string; title: string; right?: string; subtitle: string;
  onClick?: () => void; color: string; disabled?: boolean; pulse?: boolean;
}> = ({ icon, title, right, subtitle, onClick, color, disabled, pulse }) => (
  <button disabled={disabled || !onClick}
          onClick={onClick}
          className={`relative w-full rounded-md border px-1.5 py-1.5 text-left transition-all overflow-hidden ${
            disabled
              ? 'bg-[#0a0706] border-[#1E1A16] opacity-45 cursor-not-allowed'
              : 'hover:scale-[1.04] hover:border-[color:var(--card)] cursor-pointer active:scale-[0.97]'
          }`}
          style={{
            ['--card' as any]: color,
            background: disabled ? undefined : `linear-gradient(140deg, ${color}24 0%, ${color}08 60%, transparent 100%)`,
            borderColor: disabled ? undefined : color + '60',
            boxShadow: !disabled && pulse ? `0 0 8px ${color}80, inset 0 0 6px ${color}30` : undefined,
            animation: !disabled && pulse ? 'ambientFloat 1.8s ease-in-out infinite alternate' : undefined,
          }}>
    <div className="flex items-center gap-1.5">
      <span className="text-lg shrink-0 leading-none" style={{ filter: 'drop-shadow(0 1px 1px #000)' }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <div className="text-[10px] font-black truncate tracking-wide" style={{ color }}>{title}</div>
          {right && (
            <div className="text-[10px] font-black tabular-nums shrink-0"
                 style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>
              {right}
            </div>
          )}
        </div>
        <div className="text-[9px] text-[#8a7f72] truncate leading-tight">{subtitle}</div>
      </div>
    </div>
  </button>
);

const UpgradeCard: React.FC<{
  icon: string; title: string; right?: string; subtitle: string;
  onClick?: () => void; color: string; disabled?: boolean; pulse?: boolean;
}> = ({ icon, title, right, subtitle, onClick, color, disabled, pulse }) => (
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

/* ============ Bottom panel ============ */

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

const SpellGrid: React.FC<{ heroes: Hero[] }> = ({ heroes }) => (
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
        const effectsSummary = ab.effects.map(e => {
          const scale = e.flat ? `${e.power} flat` : `${e.power}× ${e.scaling.toUpperCase()}`;
          return `${e.kind}: ${scale}${e.duration ? ` (${e.duration / 1000}s)` : ''}`;
        }).join('\n');
        return (
          <div key={idx}
               className="relative aspect-square rounded border-2 flex items-center justify-center overflow-hidden"
               style={{
                 background: ready ? cls.color + '22' : '#1a1714',
                 borderColor: ready ? cls.color + 'bb' : '#3D3328',
                 boxShadow: ready ? `0 0 6px ${cls.color}80` : 'inset 0 1px 2px rgba(0,0,0,0.6)',
               }}
               title={`${h.name} · ${ab.name}\n${ab.description}\n\n${effectsSummary}\n\nCD ${ab.cooldown / 1000}s · ${ab.manaCost} MP · ${ab.targeting.replace(/_/g, ' ')}`}>
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
            <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                 style={{ background: cls.color, boxShadow: `0 0 3px ${cls.color}` }} />
          </div>
        );
      })}
      {Array.from({ length: Math.max(0, 18 - heroes.flatMap(h => h.abilities).length) }).map((_, i) => (
        <div key={`empty_${i}`} className="aspect-square rounded border border-[#1E1A16] bg-[#0a0807]" />
      ))}
    </div>
  </div>
);

const RosterPanel: React.FC<{ heroes: Hero[] }> = ({ heroes }) => (
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
                    <div className="h-full transition-all" style={{ width: hpPct + '%', background: hpPct > 66 ? '#55d86b' : hpPct > 33 ? '#e9cc3a' : '#e04040' }} />
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

const BuffInventoryPanel: React.FC<{ state: GameState }> = ({ state }) => {
  const potionCards: Array<{ id: string; title: string; sub: string; icon: string; color: string; remainingMs?: number }> = [];

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
  if (state.speed !== 1) {
    potionCards.push({ id: 'game_speed', title: `${state.speed}× Speed`, sub: 'Time flows faster', icon: '⏩', color: '#B485E8' });
  }
  if (state.autoSellRarities.length > 0) {
    potionCards.push({ id: 'autosell', title: `Auto-Sell`, sub: state.autoSellRarities.join(', '), icon: '🪙', color: '#D4A943' });
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
