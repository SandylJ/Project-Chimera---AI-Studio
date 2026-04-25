import React, { useState, useEffect, useRef } from 'react';
import { useCcGame } from './useGame';
import { DungeonView } from './components/DungeonView';
import { PartyView } from './components/PartyView';
import { StashView } from './components/StashView';
import { TownView } from './components/TownView';
import { TownSkillsView } from './components/TownSkillsView';
import { CombatLog } from './components/CombatLog';
import { DecisionModal } from './components/DecisionModal';
import { TopTabBar } from './components/TopTabBar';
import {
  playLevelUp, playRareDrop, playEpicDrop, playLegendaryDrop, playCelestialDrop,
  playTabClick,
} from './sounds';

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

  // Keyboard shortcuts. Extended set: H heal, E auto-equip, A auto-enchant,
  // J sell junk, T retreat to town, ?/ open help. Skipped while typing.
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code === 'Space') { e.preventDefault(); g.togglePause(); }
      else if (e.key === '1') g.setSpeed(1);
      else if (e.key === '2') g.setSpeed(2);
      else if (e.key === '4') g.setSpeed(4);
      else if (e.key === 'h' || e.key === 'H') g.quickHealParty();
      else if (e.key === 'e' || e.key === 'E') g.autoEquipBest();
      else if (e.key === 'a' || e.key === 'A') g.autoEnchantCheapest();
      else if (e.key === 'j' || e.key === 'J') g.sellJunk();
      else if (e.key === 't' || e.key === 'T') {
        if (state.activeDungeon) g.retreatToTown();
      }
      else if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setShowShortcuts(v => !v);
      }
      else if (e.key === 'Escape') setShowShortcuts(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [g, state.activeDungeon]);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0D0B09] text-[#E8E0D4] overflow-hidden"
         style={{ fontFamily: "'Nunito', sans-serif" }}>
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
             onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#14100C] border-2 border-[#D4A943] rounded-lg p-6 max-w-md w-full shadow-[0_0_40px_rgba(212,169,67,0.4)]"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>Keyboard Shortcuts</h2>
              <button onClick={() => setShowShortcuts(false)} className="text-[#7A6E60] hover:text-[#F2E6A8] text-sm">[Esc]</button>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Kbd k="Space" v="Pause / resume" />
              <Kbd k="1 / 2 / 4" v="Speed 1× / 2× / 4×" />
              <Kbd k="H" v="Quick-heal party" />
              <Kbd k="E" v="Auto-equip best" />
              <Kbd k="A" v="Auto-enchant cheapest" />
              <Kbd k="J" v="Sell junk" />
              <Kbd k="T" v="Retreat to town" />
              <Kbd k="?" v="Toggle this help" />
            </div>
          </div>
        </div>
      )}
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
                         skipDungeonFloor={g.skipDungeonFloor}
                         useAllBuffs={g.useAllBuffs}
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
                            toggleAutoRepeat={g.toggleAutoRepeat}
                            togglePinAction={g.togglePinAction}
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

const Kbd: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <>
    <span className="px-2 py-0.5 bg-[#2B231B] border border-[#3D3328] rounded text-[#F2E6A8] font-bold text-center">{k}</span>
    <span className="text-[#B8A890] flex items-center">{v}</span>
  </>
);
