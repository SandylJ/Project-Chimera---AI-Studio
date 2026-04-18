import React from 'react';
import { GameState } from '../types';

interface Props {
  tab: string;
  setTab: (t: string) => void;
  state: GameState;
}

const TABS = [
  { id: 'dungeon', label: 'Dungeon', icon: '🗺️' },
  { id: 'party', label: 'Party', icon: '👥' },
  { id: 'stash', label: 'Stash', icon: '📦' },
  { id: 'town', label: 'Town', icon: '🏰' },
  { id: 'log', label: 'Log', icon: '📜' },
];

export const Sidebar: React.FC<Props> = ({ tab, setTab, state }) => {
  return (
    <nav className="w-48 shrink-0 bg-[#14100C] border-r border-[#3D3328] flex flex-col p-3 gap-2">
      <div className="pb-3 mb-2 border-b border-[#3D3328]">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#D4A943] font-bold"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Party Idle
        </div>
        <div className="text-xs text-[#7A6E60] mt-1">v{state.version}.0</div>
      </div>
      {TABS.map(t => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-all
              ${active
                ? 'bg-[#2B231B] text-[#F2E6A8] border-l-2 border-[#D4A943]'
                : 'text-[#B8A890] hover:bg-[#1E1A16] hover:text-[#E8E0D4] border-l-2 border-transparent'}`}
          >
            <span className="text-base">{t.icon}</span>
            <span>{t.label}</span>
            {t.id === 'party' && state.heroes.some(h => h.abilityPoints > 0) && (
              <span className="ml-auto text-[10px] bg-[#D4A943] text-black px-1.5 rounded-full">!</span>
            )}
          </button>
        );
      })}
      <div className="mt-auto pt-3 border-t border-[#3D3328] space-y-1 text-[11px]"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="flex justify-between">
          <span className="text-[#7A6E60]">GOLD</span>
          <span className="text-[#D4A943] font-bold">{state.stash.gold.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#7A6E60]">ESSENCE</span>
          <span className="text-[#B485E8] font-bold">{state.stash.essence.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#7A6E60]">KILLS</span>
          <span className="text-[#E8E0D4]">{state.totalMonstersKilled.toLocaleString()}</span>
        </div>
      </div>
    </nav>
  );
};
