import React from 'react';
import { motion } from 'motion/react';
import { ITEMS } from '../constants';
import { PlayerState } from '../types';

interface CelestialForgeViewProps {
  state: PlayerState;
  buyRelic: (relicId: string) => void;
  toggleEdict: (relicId: string) => void;
}

const RELICS = [
  'relic_storm_eye',
  'relic_empire_heart',
  'relic_void_blade',
  'relic_eternal_wisdom'
];

export function CelestialForgeView({ state, buyRelic, toggleEdict }: CelestialForgeViewProps) {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-[#141414] pb-4">
        <div>
          <h2 className="text-4xl font-serif italic font-bold tracking-tight capitalize">The Celestial Forge</h2>
          <div className="text-xs font-mono opacity-50 uppercase tracking-widest mt-1">
            {state.celestialEssence} CELESTIAL ESSENCE HELD
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RELICS.map(relicId => {
          const relic = ITEMS[relicId];
          if (!relic) return null;

          const isOwned = (state.inventory || []).some(i => i.itemId === relicId);
          const isActive = (state.activeEdicts || []).includes(relicId);
          const canAfford = (state.celestialEssence || 0) >= relic.value;

          return (
            <div 
              key={relicId}
              className={`border border-[#141414] p-6 flex flex-col gap-4 transition-all ${isOwned ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:border-opacity-50'}`}
            >
              <div className="flex items-start justify-between">
                <div className="text-5xl">{relic.icon}</div>
                <div className="text-right">
                  <div className="text-sm font-serif italic font-bold">{relic.name}</div>
                  <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                    {isOwned ? 'OWNED' : `${relic.value} ESSENCE`}
                  </div>
                </div>
              </div>

              <p className="text-sm font-serif opacity-80 leading-relaxed">
                {relic.description}
              </p>

              <div className="mt-auto pt-4">
                {!isOwned ? (
                  <button
                    onClick={() => buyRelic(relicId)}
                    disabled={!canAfford}
                    className={`w-full py-2 border border-[#141414] text-[10px] font-mono uppercase tracking-widest transition-all ${canAfford ? 'hover:bg-[#141414] hover:text-[#E4E3E0]' : 'opacity-30 cursor-not-allowed'}`}
                  >
                    Forge Relic
                  </button>
                ) : (
                  <button
                    onClick={() => toggleEdict(relicId)}
                    className={`w-full py-2 border border-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest transition-all ${isActive ? 'bg-[#E4E3E0] text-[#141414]' : 'hover:bg-[#E4E3E0] hover:text-[#141414]'}`}
                  >
                    {isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#141414] text-[#E4E3E0] p-8">
        <h3 className="text-xl font-serif italic font-bold mb-4">About Ascension</h3>
        <p className="text-sm font-serif opacity-70 leading-relaxed max-w-2xl">
          Ascension is the ultimate path of the Imperial Master. When a skill reaches level 99, you may choose to Ascend it. 
          This will reset the skill to level 1, but you will gain 1 Celestial Essence and a permanent 5% bonus to that skill's efficiency and XP gain.
          Celestial Essence can be used here in the Forge to create Relics—powerful artifacts that provide global, game-changing bonuses.
        </p>
      </div>
    </div>
  );
}
