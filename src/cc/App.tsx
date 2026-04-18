import React, { useState } from 'react';
import { useCcGame } from './useGame';
import { Sidebar } from './components/Sidebar';
import { HUDBar } from './components/HUDBar';
import { DungeonView } from './components/DungeonView';
import { PartyView } from './components/PartyView';
import { StashView } from './components/StashView';
import { TownView } from './components/TownView';
import { CombatLog } from './components/CombatLog';
import { DecisionModal } from './components/DecisionModal';

export default function CcApp() {
  const g = useCcGame();
  const [tab, setTab] = useState<string>('dungeon');
  const { state } = g;

  return (
    <div className="w-screen h-screen flex bg-[#0D0B09] text-[#E8E0D4] overflow-hidden"
         style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Sidebar tab={tab} setTab={setTab} state={state} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <HUDBar state={state}
                setSpeed={g.setSpeed}
                togglePause={g.togglePause}
                retreatToTown={g.retreatToTown} />
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-hidden">
            {tab === 'dungeon' && <DungeonView state={state} enterDungeon={g.enterDungeon} />}
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
          {tab !== 'log' && <CombatLog state={state} compact />}
        </div>
      </main>
      <DecisionModal decision={state.activeDecision} onChoose={g.resolveDecision} />
      {state.pendingOfflineReport && (
        <OfflineOverlay report={state.pendingOfflineReport} dismiss={g.dismissOfflineReport} />
      )}
    </div>
  );
}

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
