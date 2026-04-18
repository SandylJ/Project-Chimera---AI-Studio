import React from 'react';
import { GameState } from '../types';
import { themeFor } from '../visuals/dungeonTheme';

interface Props {
  state: GameState;
  setSpeed: (s: 1 | 2 | 4) => void;
  togglePause: () => void;
  retreatToTown: () => void;
}

export const HUDBar: React.FC<Props> = ({ state, setSpeed, togglePause, retreatToTown }) => {
  const dungeon = state.activeDungeon;
  const theme = themeFor(dungeon?.defId);

  return (
    <div className="bg-[#0A0806] border-b-2 border-[#3D3328] px-4 py-2 flex items-center gap-3"
         style={{
           backgroundImage: 'linear-gradient(180deg, #1a1410 0%, #0a0806 100%)',
           boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
         }}>

      {/* Left — gold + essence */}
      <div className="flex items-center gap-3 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#D4A943]/40 bg-black/40">
          <span className="text-lg">🪙</span>
          <span className="text-[#D4A943] font-bold">{state.stash.gold.toLocaleString()}</span>
        </div>
        {state.stash.essence > 0 && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#B485E8]/40 bg-black/40">
            <span className="text-lg">⟡</span>
            <span className="text-[#B485E8] font-bold">{state.stash.essence.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Center — dungeon badge */}
      {dungeon ? (
        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg mx-2 border"
             style={{
               background: `linear-gradient(90deg, transparent 0%, ${theme.accentColor}22 50%, transparent 100%)`,
               borderColor: theme.accentColor + '50',
             }}>
          <span className="text-xl">{dungeon.icon}</span>
          <div className="text-center">
            <div className="text-xs font-bold tracking-widest uppercase" style={{ color: theme.accentColor, fontFamily: "'Cinzel', serif" }}>
              {dungeon.name}
            </div>
            <div className="text-[9px] text-[#B8A890]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Tile {dungeon.pathIndex + 1}/{dungeon.path.length} • Floor {dungeon.floor}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-center text-xs text-[#7A6E60] uppercase tracking-widest"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          In Town — pick a dungeon
        </div>
      )}

      {/* Right — controls */}
      <div className="flex items-center gap-1 shrink-0">
        {[1, 2, 4].map(s => (
          <button
            key={s}
            onClick={() => setSpeed(s as 1 | 2 | 4)}
            className={`w-9 h-9 text-xs font-bold rounded transition-all ${state.speed === s
              ? 'bg-[#D4A943] text-black shadow-lg scale-110'
              : 'bg-[#1E1A16] text-[#B8A890] hover:bg-[#2B231B]'}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            title={`Speed ${s}×`}
          >{s}×</button>
        ))}
        <button
          onClick={togglePause}
          className={`w-10 h-9 rounded ml-1 ${state.paused ? 'bg-[#6EA9E4] text-black' : 'bg-[#1E1A16] text-[#E8E0D4] hover:bg-[#2B231B]'}`}
          title={state.paused ? 'Resume (Space)' : 'Pause (Space)'}
        >{state.paused ? '▶' : '❚❚'}</button>
        {dungeon && (
          <button
            onClick={retreatToTown}
            className="px-3 h-9 rounded bg-[#1E1A16] hover:bg-[#E86E6E]/20 hover:border-[#E86E6E] text-[#E86E6E] text-xs font-bold border border-[#3D3328] transition-all ml-1"
            title="Retreat to town"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ← TOWN
          </button>
        )}
      </div>
    </div>
  );
};
