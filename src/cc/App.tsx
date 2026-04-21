import React, { useState, useEffect, useRef } from 'react';
import { useCcGame } from './useGame';
import { DungeonView } from './components/DungeonView';
import { ClassSprite } from './visuals/sprites';
import { CLASSES } from './data/classes';
import { xpToNext } from './engine/util';
import { PartyView } from './components/PartyView';
import { StashView } from './components/StashView';
import { TownView } from './components/TownView';
import { TownSkillsView } from './components/TownSkillsView';
import { CombatLog } from './components/CombatLog';
import { DecisionModal } from './components/DecisionModal';
import {
  playLevelUp, playRareDrop, playEpicDrop, playLegendaryDrop, playCelestialDrop,
  playTabClick,
} from '../sounds';

export default function CcApp() {
  const g = useCcGame();
  const [tab, setTabRaw] = useState<string>('dungeon');
  const [focusHeroId, setFocusHeroId] = useState<string | null>(null);
  const [levelBurst, setLevelBurst] = useState<{ id: string; heroName: string; level: number; bornAt: number } | null>(null);
  const [dropBanner, setDropBanner] = useState<{ id: string; text: string; rarity: string; bornAt: number } | null>(null);
  const setTab = (t: string) => { playTabClick(); setTabRaw(t); };
  const focusHero = (id: string) => { setFocusHeroId(id); setTab('party'); };
  const { state } = g;

  // Play sounds for new log entries
  const lastLogIdRef = useRef<string>('');
  useEffect(() => {
    const latest = state.currentLog[0];
    if (!latest || latest.id === lastLogIdRef.current) return;
    lastLogIdRef.current = latest.id;
    if (latest.kind === 'level') {
      playLevelUp();
      // Parse "⬆ NAME reached level N!" — show a brief burst overlay
      const m = latest.text.match(/⬆\s+(.+?)\s+reached level\s+(\d+)/i);
      if (m) {
        setLevelBurst({ id: latest.id, heroName: m[1], level: Number(m[2]), bornAt: Date.now() });
        window.setTimeout(() => setLevelBurst(cur => cur?.id === latest.id ? null : cur), 1600);
      }
    }
    else if (latest.kind === 'victory') playLegendaryDrop();
    else if (latest.kind === 'loot' && latest.rarity) {
      switch (latest.rarity) {
        case 'rare': playRareDrop(); break;
        case 'epic': playEpicDrop(); break;
        case 'legendary': playLegendaryDrop(); break;
        case 'celestial': playCelestialDrop(); break;
        default: break;
      }
      if (['rare', 'epic', 'legendary', 'celestial'].includes(latest.rarity)) {
        setDropBanner({ id: latest.id, text: latest.text, rarity: latest.rarity, bornAt: Date.now() });
        window.setTimeout(() => setDropBanner(cur => cur?.id === latest.id ? null : cur), 1800);
      }
    }
  }, [state.currentLog]);

  // Keyboard shortcuts: space=pause, 1/2/4=speed
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); g.togglePause(); }
      else if (e.key === '1') g.setSpeed(1);
      else if (e.key === '2') g.setSpeed(2);
      else if (e.key === '4') g.setSpeed(4);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [g]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0D0B09] text-[#E8E0D4] overflow-hidden"
         style={{ fontFamily: "'Nunito', sans-serif" }}>
      <TopTabBar tab={tab} setTab={setTab} state={state}
                 setSpeed={g.setSpeed}
                 togglePause={g.togglePause}
                 retreatToTown={g.retreatToTown}
                 focusHero={focusHero} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {tab === 'dungeon' && (
            <DungeonView state={state}
                         enterDungeon={g.enterDungeon}
                         clickMonster={g.clickMonster}
                         autoEquipBest={g.autoEquipBest}
                         quickHealParty={g.quickHealParty}
                         reviveHero={g.reviveHero}
                         sellJunk={g.sellJunk}
                         useScroll={g.useScroll}
                         spendAllAP={g.spendAllAP}
                         autoEnchantCheapest={g.autoEnchantCheapest}
                         quickHealHero={g.quickHealHero} />
          )}
          {tab === 'party' && (
            <PartyView state={state}
                       unequipItem={g.unequipItem}
                       toggleBench={g.toggleBench}
                       buyAbility={g.buyAbility}
                       reviveHero={g.reviveHero}
                       useConsumable={g.useConsumable}
                       equipItem={g.equipItem}
                       focusHeroId={focusHeroId} />
          )}
          {tab === 'stash' && (
            <StashView state={state}
                       sellItem={g.sellItem}
                       setAutoSell={g.setAutoSell}
                       useScroll={g.useScroll} />
          )}
          {tab === 'town' && (
            <TownView state={state}
                      recruitHero={g.recruitHero}
                      buyShopItem={g.buyShopItem}
                      buyShopBundle={g.buyShopBundle}
                      reviveHero={g.reviveHero}
                      healParty={g.healParty}
                      resetGame={g.resetGame}
                      upgradeEquip={g.upgradeEquip}
                      buyBlessing={g.buyBlessing}
                      claimBounty={g.claimBounty} />
          )}
          {tab === 'skills' && (
            <TownSkillsView state={state}
                            setActiveTask={g.setActiveTask}
                            clearActiveTask={g.clearActiveTask}
                            hireWorker={g.hireWorker} />
          )}
          {tab === 'log' && <CombatLog state={state} />}
        </div>
      </main>
      <DecisionModal decision={state.activeDecision} onChoose={g.resolveDecision} />
      {state.pendingOfflineReport && (
        <OfflineOverlay report={state.pendingOfflineReport} dismiss={g.dismissOfflineReport} />
      )}
      {levelBurst && <LevelUpBurst burst={levelBurst} />}
      {dropBanner && <RareDropBanner banner={dropBanner} />}
    </div>
  );
}

const RareDropBanner: React.FC<{ banner: { id: string; text: string; rarity: string; bornAt: number } }> = ({ banner }) => {
  const color =
    banner.rarity === 'rare'      ? '#6EA9E4' :
    banner.rarity === 'epic'      ? '#C58BE8' :
    banner.rarity === 'legendary' ? '#F2B84B' :
                                    '#22D3EE';
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none"
         style={{ animation: 'bossEntrance 0.55s ease-out forwards' }}>
      <div className="text-center">
        <div className="text-[10px] font-bold uppercase tracking-[0.4em] mb-1"
             style={{ color, fontFamily: "'JetBrains Mono', monospace", textShadow: `0 0 10px ${color}` }}>
          ★ {banner.rarity.toUpperCase()} DROP ★
        </div>
        <div className="text-lg font-bold px-5 py-1 rounded-md"
             style={{
               fontFamily: "'Cinzel', serif",
               color: '#fff3c8',
               background: `linear-gradient(90deg, ${color}40 0%, ${color}80 50%, ${color}40 100%)`,
               backgroundSize: '200% 100%',
               animation: 'shimmer 2s infinite linear',
               border: `1px solid ${color}`,
               textShadow: `0 0 8px ${color}, 1px 1px 0 #000`,
               letterSpacing: '0.06em',
               boxShadow: `0 0 20px ${color}80, inset 0 0 10px #00000040`,
             }}>
          {banner.text.replace(/^[^a-zA-Z]*/, '').slice(0, 60)}
        </div>
      </div>
    </div>
  );
};

const LevelUpBurst: React.FC<{ burst: { id: string; heroName: string; level: number; bornAt: number } }> = ({ burst }) => {
  // Find hero's class color if possible
  return (
    <div className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center"
         style={{ animation: 'fadeIn 0.18s' }}>
      <div className="absolute inset-0"
           style={{
             background: `radial-gradient(circle at 50% 40%, rgba(242, 230, 168, 0.4) 0%, transparent 55%)`,
             mixBlendMode: 'screen',
             animation: 'fadeIn 0.2s',
           }} />
      <div className="text-center" style={{ animation: 'bossEntrance 0.7s ease-out forwards' }}>
        <div className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#f2e08a] mb-1"
             style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 10px #f2c846' }}>
          ⬆ LEVEL UP
        </div>
        <div className="text-5xl font-black px-6 py-2 rounded"
             style={{
               fontFamily: "'Cinzel', serif",
               color: '#fff3c8',
               background: 'linear-gradient(90deg, #5a3a08 0%, #d4a943 50%, #5a3a08 100%)',
               backgroundSize: '200% 100%',
               animation: 'shimmer 2s infinite linear',
               border: '2px solid #f2e08a',
               textShadow: '0 0 14px #f2c846, 2px 2px 0 #2a1800',
               letterSpacing: '0.08em',
             }}>
          {burst.heroName}
        </div>
        <div className="mt-2 text-3xl font-black text-[#f2e08a]"
             style={{ textShadow: '0 0 12px #f2c846' }}>
          LVL {burst.level}
        </div>
      </div>
    </div>
  );
};

// ========== Top tab bar (CC2-style) ==========

const TopTabBar: React.FC<{
  tab: string; setTab: (t: string) => void; state: ReturnType<typeof useCcGame>['state'];
  setSpeed: (s: 1|2|4) => void; togglePause: () => void; retreatToTown: () => void;
  focusHero: (heroId: string) => void;
}> = ({ tab, setTab, state, setSpeed, togglePause, retreatToTown, focusHero }) => {
  const TABS = [
    { id: 'dungeon', label: 'Dungeon', icon: '⚔' },
    { id: 'party',   label: 'Party',   icon: '👥' },
    { id: 'stash',   label: 'Stash',   icon: '📦' },
    { id: 'town',    label: 'Town',    icon: '🏰' },
    { id: 'skills',  label: 'Skills',  icon: '⛏️' },
    { id: 'log',     label: 'Log',     icon: '📜' },
  ];
  const dungeon = state.activeDungeon;
  return (
    <div className="shrink-0 bg-[#0A0806] border-b-2 border-[#3D3328] flex items-center gap-1.5 px-2 py-1.5"
         style={{ backgroundImage: 'linear-gradient(180deg, #1a1410 0%, #0a0806 100%)' }}>
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {/* Main 'Game' tab — always takes you to dungeon view (picker or battle) */}
        <button type="button" onClick={() => setTab('dungeon')}
                className={`press px-3 py-1.5 text-xs transition-colors font-bold ${
                  tab === 'dungeon' ? 'text-[#0a0806]' : 'text-[#B8A890] hover:bg-[#1E1A16] hover:text-[#E8E0D4]'
                }`}
                style={{
                  background: tab === 'dungeon' ? 'var(--cc-blue)' : '#14100C',
                  border: `1px solid ${tab === 'dungeon' ? 'var(--cc-blue)' : '#2B2B32'}`,
                  borderRadius: 2,
                }}>
          <span className="mr-1">⚔</span>Game
        </button>

        {/* Per-hero tabs (clicking opens the Party view focused on that hero) */}
        {state.heroes.filter(h => !h.bench).map(h => {
          const cls = CLASSES[h.classId];
          const hpPct = Math.max(0, (h.hp / Math.max(1, h.maxHp)) * 100);
          const mpPct = h.maxMp > 0 ? Math.max(0, (h.mp / h.maxMp) * 100) : 0;
          const hpColor = hpPct > 66 ? '#55d86b' : hpPct > 33 ? '#e9cc3a' : '#e04040';
          const lowHp = hpPct < 30 && h.state === 'alive';
          const downed = h.state !== 'alive';
          return (
            <button key={h.id}
                    type="button"
                    onClick={() => focusHero(h.id)}
                    className="press relative flex items-center gap-1.5 px-1.5 py-0.5 transition-colors hover:bg-[#2B2B32]"
                    style={{
                      background: downed ? '#2a1010' : '#14100C',
                      border: `1px solid ${downed ? 'var(--cc-orange)' : cls.color + '55'}`,
                      borderRadius: 2,
                      fontFamily: "'Nunito', sans-serif",
                      boxShadow: lowHp ? '0 0 8px var(--cc-orange)' : undefined,
                      animation: lowHp ? 'glowPulse 1.4s ease-in-out infinite' : undefined,
                      ['--glow' as any]: 'var(--cc-orange)',
                    }}
                    title={`${h.name} — ${cls.name}\nHP ${Math.ceil(h.hp)}/${h.maxHp} · MP ${Math.ceil(h.mp)}/${h.maxMp}`}>
              <span className="shrink-0" style={{ width: 24, height: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <ClassSprite classId={h.classId} size={24} />
              </span>
              <div className="flex flex-col min-w-0" style={{ width: 62 }}>
                <div className="flex items-baseline gap-1 leading-none">
                  <span className="font-black truncate"
                        style={{ color: cls.color, fontSize: '10px', textShadow: '0 1px 0 #000' }}>
                    {h.name.slice(0, 8)}
                  </span>
                  <span className="text-[9px] text-[#f2e08a] font-bold shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    L{h.level}
                  </span>
                </div>
                {/* HP bar */}
                <div className="relative h-[4px] mt-0.5 bg-black rounded-sm overflow-hidden">
                  <div className="h-full" style={{ width: hpPct + '%', background: hpColor, transition: 'width 180ms' }} />
                </div>
                {/* MP bar */}
                {h.maxMp > 0 && (
                  <div className="relative h-[2px] mt-[1px] bg-black rounded-sm overflow-hidden">
                    <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc' }} />
                  </div>
                )}
                {/* XP bar */}
                <div className="relative h-[2px] mt-[1px] bg-black rounded-sm overflow-hidden">
                  <div className="h-full"
                       style={{
                         width: Math.min(100, (h.xp / Math.max(1, xpToNext(h))) * 100) + '%',
                         background: 'linear-gradient(90deg, #9a8030 0%, #ffe080 100%)',
                       }} />
                </div>
              </div>
              {h.abilityPoints > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#D4A943] text-black text-[8px] font-black animate-pulse"
                      style={{ boxShadow: '0 0 4px #D4A943' }}>+</span>
              )}
              {downed && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-black bg-black px-1 rounded text-[#E86E6E] border border-[#E86E6E]/70"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}>DOWN</span>
              )}
            </button>
          );
        })}

        {TABS.slice(1).map(t => {
          const active = tab === t.id;
          // Per-tab "pending action" indicators — CC2 tabHighlighted style
          const townAlert = t.id === 'town' && state.bountyBoard?.bounties.some(b => {
            const prog =
              b.kind === 'kill_count' ? Math.max(0, state.totalMonstersKilled - state.bountyBoard!.snapshot.totalMonstersKilled) :
              b.kind === 'earn_gold'  ? Math.max(0, state.totalGoldEarned - state.bountyBoard!.snapshot.totalGoldEarned) :
              b.kind === 'find_items' ? (state.bountyBoard?.itemsCollected ?? 0) :
              b.kind === 'best_combo' ? state.bestKillCombo :
              Object.values(state.bountyBoard?.dungeonClearCount ?? {}).reduce((a, v) => a + (v as number), 0);
            return !b.claimed && prog >= b.target;
          });
          const partyAlert = t.id === 'party' && state.heroes.some(h => !h.bench && (h.abilityPoints > 0 || h.state !== 'alive'));
          const stashAlert = t.id === 'stash' && Object.entries(state.stash.items).some(([id]) => {
            const it = (globalThis as any).__ITEMS?.[id]; // not available — safe fallback
            return !!it;
          });
          const highlighted = townAlert || partyAlert;
          return (
            <button key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`press relative px-3 py-1.5 text-xs transition-colors font-bold ${
                      active
                        ? 'text-[#0a0806]'
                        : highlighted
                          ? 'text-[#0a0806] hover:brightness-110'
                          : 'text-[#B8A890] hover:bg-[#1E1A16] hover:text-[#E8E0D4]'
                    }`}
                    style={{
                      background: active
                        ? 'var(--cc-blue)'
                        : highlighted
                          ? 'var(--cc-blue)'
                          : '#14100C',
                      border: `1px solid ${active || highlighted ? 'var(--cc-blue)' : '#2B2B32'}`,
                      borderRadius: 2,
                      fontFamily: "'Nunito', sans-serif",
                      animation: highlighted && !active ? 'glowPulse 1.8s ease-in-out infinite' : undefined,
                      ['--glow' as any]: 'var(--cc-blue)',
                    }}>
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          );
        })}
      </div>

      {/* Center: current dungeon badge if in one */}
      <div className="flex-1 flex items-center justify-center">
        {dungeon ? (
          <div className="text-[10px] uppercase tracking-widest text-[#F2E6A8] font-bold"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {dungeon.icon} {dungeon.name} — Room {dungeon.pathIndex + 1}/{dungeon.path.length}
          </div>
        ) : (
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#7A6E60]"
               style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Party Idle
          </div>
        )}
      </div>

      {/* Right: currencies + controls */}
      <div className="flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="flex items-center gap-1 text-xs">
          <span className="text-lg">🪙</span>
          <span className="text-[#D4A943] font-bold tabular-nums">{state.stash.gold.toLocaleString()}</span>
        </div>
        {state.stash.essence > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-lg">⟡</span>
            <span className="text-[#B485E8] font-bold tabular-nums">{state.stash.essence.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[#7A6E60]">XP</span>
          <span className="text-[#F2E6A8] font-bold tabular-nums">
            {state.heroes.reduce((a,h)=>a+h.xp+h.level*1000,0).toLocaleString()}
          </span>
        </div>
        {/* Speed/pause */}
        <div className="flex items-center gap-0.5 ml-2">
          {[1, 2, 4].map(s => {
            const active = state.speed === s;
            return (
              <button key={s} type="button" onClick={() => setSpeed(s as 1|2|4)}
                      className={`press w-7 h-7 text-[10px] font-bold transition-colors ${
                        active ? 'text-[#0a0806]' : 'text-[#B8A890] hover:bg-[#2B2B32]'
                      }`}
                      style={{
                        background: active ? 'var(--cc-orange)' : '#14100C',
                        border: `1px solid ${active ? 'var(--cc-orange)' : '#2B2B32'}`,
                        borderRadius: 2,
                      }}>{s}×</button>
            );
          })}
          <button type="button" onClick={togglePause}
                  className={`press w-7 h-7 text-xs font-bold transition-colors ${
                    state.paused ? 'text-[#0a0806]' : 'text-[#E8E0D4] hover:bg-[#2B2B32]'
                  }`}
                  style={{
                    background: state.paused ? 'var(--cc-blue)' : '#14100C',
                    border: `1px solid ${state.paused ? 'var(--cc-blue)' : '#2B2B32'}`,
                    borderRadius: 2,
                  }}>{state.paused ? '▶' : '❚❚'}</button>
          {dungeon && (
            <button type="button" onClick={retreatToTown}
                    className="press ml-1 px-2 h-7 text-[10px] font-bold text-[#E86E6E] hover:bg-[#2a1410]"
                    style={{
                      background: '#14100C',
                      border: '1px solid #E86E6E50',
                      borderRadius: 2,
                    }}>
              ← TOWN
            </button>
          )}
          <button type="button" onClick={() => {
                    if (!confirm('Hard reset: wipe save, clear cache, reload?')) return;
                    try { localStorage.removeItem('cc_save_v1'); } catch {}
                    window.location.href = window.location.pathname + '?nuked=' + Date.now();
                  }}
                  className="press ml-1 px-1.5 h-7 text-[9px] text-[#7A6E60] hover:text-[#E86E6E]"
                  style={{
                    background: '#14100C',
                    border: '1px solid #2B2B32',
                    borderRadius: 2,
                  }}
                  title="Hard reset">
            ⚠
          </button>
        </div>
      </div>
    </div>
  );
};

const OfflineOverlay: React.FC<{ report: NonNullable<ReturnType<typeof useCcGame>['state']['pendingOfflineReport']>; dismiss: () => void }> = ({ report, dismiss }) => {
  const mins = Math.floor(report.duration / 60000);
  const hrs = Math.floor(mins / 60);
  const durStr = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" onClick={dismiss}>
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative bg-[#1E1A16] border-2 border-[#D4A943] rounded-2xl p-6 max-w-sm w-full space-y-3 cursor-pointer">
        <div className="text-xs text-[#D4A943] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Welcome Back
        </div>
        <div className="text-sm text-[#B8A890]">While you were away for <span className="text-[#F2E6A8] font-bold">{durStr}</span>, your party:</div>
        <div className="space-y-1 bg-[#0D0B09] p-3 rounded border border-[#3D3328]">
          <Row k="Tiles Cleared" v={report.tilesCleared.toLocaleString()} />
          <Row k="Monsters Killed" v={report.monstersKilled.toLocaleString()} />
          <Row k="Gold Earned" v={`+${report.goldGained.toLocaleString()}`} color="#D4A943" />
          <Row k="XP Gained" v={`+${report.xpGained.toLocaleString()}`} color="#7FE2A0" />
        </div>
        <div className="text-[10px] text-[#7A6E60] text-center uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          click to dismiss
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ k: string; v: string; color?: string }> = ({ k, v, color = '#E8E0D4' }) => (
  <div className="flex justify-between text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
    <span className="text-[#7A6E60]">{k}</span>
    <span className="font-bold" style={{ color }}>{v}</span>
  </div>
);
