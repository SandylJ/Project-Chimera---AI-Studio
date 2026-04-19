import React, { useState, useEffect, useRef } from 'react';
import { useCcGame } from './useGame';
import { DungeonView } from './components/DungeonView';
import { PartyView } from './components/PartyView';
import { StashView } from './components/StashView';
import { TownView } from './components/TownView';
import { CombatLog } from './components/CombatLog';
import { DecisionModal } from './components/DecisionModal';
import {
  playLevelUp, playRareDrop, playEpicDrop, playLegendaryDrop, playCelestialDrop,
  playTabClick,
} from '../sounds';

export default function CcApp() {
  const g = useCcGame();
  const [tab, setTabRaw] = useState<string>('dungeon');
  const setTab = (t: string) => { playTabClick(); setTabRaw(t); };
  const { state } = g;

  // Play sounds for new log entries
  const lastLogIdRef = useRef<string>('');
  useEffect(() => {
    const latest = state.currentLog[0];
    if (!latest || latest.id === lastLogIdRef.current) return;
    lastLogIdRef.current = latest.id;
    if (latest.kind === 'level') playLevelUp();
    else if (latest.kind === 'victory') playLegendaryDrop();
    else if (latest.kind === 'loot' && latest.rarity) {
      switch (latest.rarity) {
        case 'rare': playRareDrop(); break;
        case 'epic': playEpicDrop(); break;
        case 'legendary': playLegendaryDrop(); break;
        case 'celestial': playCelestialDrop(); break;
        default: break;
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
                 retreatToTown={g.retreatToTown} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {tab === 'dungeon' && (
            <DungeonView state={state}
                         enterDungeon={g.enterDungeon}
                         clickMonster={g.clickMonster}
                         autoEquipBest={g.autoEquipBest}
                         quickHealParty={g.quickHealParty}
                         reviveHero={g.reviveHero}
                         sellJunk={g.sellJunk} />
          )}
          {tab === 'party' && (
            <PartyView state={state}
                       unequipItem={g.unequipItem}
                       toggleBench={g.toggleBench}
                       buyAbility={g.buyAbility}
                       reviveHero={g.reviveHero}
                       useConsumable={g.useConsumable}
                       equipItem={g.equipItem} />
          )}
          {tab === 'stash' && (
            <StashView state={state}
                       sellItem={g.sellItem}
                       setAutoSell={g.setAutoSell} />
          )}
          {tab === 'town' && (
            <TownView state={state}
                      recruitHero={g.recruitHero}
                      buyShopItem={g.buyShopItem}
                      reviveHero={g.reviveHero}
                      healParty={g.healParty}
                      resetGame={g.resetGame} />
          )}
          {tab === 'log' && <CombatLog state={state} />}
        </div>
      </main>
      <DecisionModal decision={state.activeDecision} onChoose={g.resolveDecision} />
      {state.pendingOfflineReport && (
        <OfflineOverlay report={state.pendingOfflineReport} dismiss={g.dismissOfflineReport} />
      )}
    </div>
  );
}

// ========== Top tab bar (CC2-style) ==========

const TopTabBar: React.FC<{
  tab: string; setTab: (t: string) => void; state: ReturnType<typeof useCcGame>['state'];
  setSpeed: (s: 1|2|4) => void; togglePause: () => void; retreatToTown: () => void;
}> = ({ tab, setTab, state, setSpeed, togglePause, retreatToTown }) => {
  const TABS = [
    { id: 'dungeon', label: 'Dungeon', icon: '⚔' },
    { id: 'party',   label: 'Party',   icon: '👥' },
    { id: 'stash',   label: 'Stash',   icon: '📦' },
    { id: 'town',    label: 'Town',    icon: '🏰' },
    { id: 'log',     label: 'Log',     icon: '📜' },
  ];
  const dungeon = state.activeDungeon;
  return (
    <div className="shrink-0 bg-[#0A0806] border-b-2 border-[#3D3328] flex items-center gap-1 px-2 py-1"
         style={{ backgroundImage: 'linear-gradient(180deg, #1a1410 0%, #0a0806 100%)' }}>
      {/* Tabs */}
      <div className="flex items-center gap-0.5">
        {TABS.map(t => {
          const active = tab === t.id;
          const needsAttention = t.id === 'party' && state.heroes.some(h => h.abilityPoints > 0);
          return (
            <button key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative px-3 py-1 text-xs rounded transition-all ${
                      active
                        ? 'bg-[#6EA9E4] text-[#0a0806] font-bold'
                        : 'bg-[#14100C] text-[#B8A890] hover:bg-[#1E1A16] hover:text-[#E8E0D4]'
                    }`}
                    style={{ fontFamily: "'Nunito', sans-serif" }}>
              <span className="mr-1">{t.icon}</span>{t.label}
              {needsAttention && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#D4A943] animate-pulse" />
              )}
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
          {[1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s as 1|2|4)}
                    className={`w-7 h-7 text-[10px] font-bold rounded ${
                      state.speed === s ? 'bg-[#D4A943] text-black' : 'bg-[#1E1A16] text-[#B8A890]'
                    }`}>{s}×</button>
          ))}
          <button onClick={togglePause}
                  className={`w-7 h-7 rounded text-xs ${
                    state.paused ? 'bg-[#6EA9E4] text-black' : 'bg-[#1E1A16] text-[#E8E0D4]'
                  }`}>{state.paused ? '▶' : '❚❚'}</button>
          {dungeon && (
            <button onClick={retreatToTown}
                    className="ml-1 px-2 h-7 text-[10px] font-bold rounded bg-[#1E1A16] text-[#E86E6E] hover:bg-[#2a1410] border border-[#3D3328]">
              ← TOWN
            </button>
          )}
          <button onClick={() => {
                    if (!confirm('Hard reset: wipe save, clear cache, reload?')) return;
                    try { localStorage.removeItem('cc_save_v1'); } catch {}
                    window.location.href = window.location.pathname + '?nuked=' + Date.now();
                  }}
                  className="ml-1 px-1.5 h-7 text-[9px] rounded bg-[#14100C] text-[#7A6E60] hover:text-[#E86E6E] border border-[#3D3328]"
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
