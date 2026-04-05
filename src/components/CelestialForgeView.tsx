import React from 'react';
import { motion } from 'motion/react';
import { ITEMS } from '../constants';
import { PlayerState } from '../types';
import { playButtonPress, playSuccess } from '../sounds';

interface CelestialForgeViewProps { state: PlayerState; buyRelic: (relicId: string) => void; toggleEdict: (relicId: string) => void; }
const RELICS = [
  'relic_storm_eye', 'relic_empire_heart', 'relic_void_blade', 'relic_eternal_wisdom',
  'relic_gatherers_grace', 'relic_iron_will', 'relic_fortune_star', 'relic_golden_touch', 'relic_timeless_mastery',
];

export function CelestialForgeView({ state, buyRelic, toggleEdict }: CelestialForgeViewProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-[#3D3328] pb-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight capitalize" style={{ fontFamily: "'Cinzel', serif" }}>The Celestial Forge</h2>
          <div className="text-xs text-[#7A6E60] uppercase tracking-widest mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{state.celestialEssence} CELESTIAL ESSENCE HELD</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RELICS.map(relicId => {
          const relic = ITEMS[relicId]; if (!relic) return null;
          const isOwned = (state.inventory || []).some(i => i.itemId === relicId); const isActive = (state.activeEdicts || []).includes(relicId);
          const canAfford = (state.celestialEssence || 0) >= relic.value;
          return (
            <div key={relicId} className={`card p-6 flex flex-col gap-4 transition-all ${isOwned ? 'bg-[#0D0B09] border-[#D4A943]/30' : 'hover:border-[#D4A943]/30 hover:-translate-y-1'}`}>
              <div className="flex items-start justify-between">
                <div className="text-5xl">{relic.icon}</div>
                <div className="text-right"><div className="text-sm font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{relic.name}</div>
                  <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{isOwned ? 'OWNED' : `${relic.value} ESSENCE`}</div></div>
              </div>
              <p className="text-sm leading-relaxed text-[#B8A890]">{relic.description}</p>
              <div className="mt-auto pt-4">
                {!isOwned ? (
                  <button onClick={() => { if (canAfford) { playSuccess(); buyRelic(relicId); } }} disabled={!canAfford}
                    className={`w-full py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all ${canAfford ? 'keycap keycap-gold' : 'bg-[#0D0B09] text-[#7A6E60] cursor-not-allowed'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>Forge Relic</button>
                ) : (
                  <button onClick={() => { playButtonPress(); toggleEdict(relicId); }}
                    className={`keycap w-full py-2 text-[10px] uppercase tracking-widest ${isActive ? 'keycap-gold' : ''}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{isActive ? 'DEACTIVATE' : 'ACTIVATE'}</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="card p-8 bg-[#0D0B09] border-[#3D3328]">
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Cinzel', serif" }}>About Ascension</h3>
        <p className="text-sm text-[#B8A890] leading-relaxed max-w-2xl">
          When a skill reaches level 99, Ascend it to reset to level 1, gain 1 Celestial Essence and a permanent 5% bonus.
          Use Essence here to forge Relics — powerful global bonuses.
        </p>
      </div>
    </div>
  );
}
