import React from 'react';
import { GameState, Hero } from '../types';
import { CLASSES } from '../data/classes';

interface Props {
  state: GameState;
  setSpeed: (s: 1 | 2 | 4) => void;
  togglePause: () => void;
  retreatToTown: () => void;
}

export const HUDBar: React.FC<Props> = ({ state, setSpeed, togglePause, retreatToTown }) => {
  const active = state.heroes.filter(h => !h.bench);
  const dungeon = state.activeDungeon;

  return (
    <div className="bg-[#14100C] border-b border-[#3D3328] p-3 flex items-center gap-4">
      <div className="flex gap-2 flex-1 min-w-0 overflow-hidden">
        {active.map(h => (
          <MiniHeroBar key={h.id} hero={h} />
        ))}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {dungeon && (
          <div className="text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <div className="text-[#7A6E60]">LOCATION</div>
            <div className="text-[#F2E6A8] font-bold">{dungeon.name}</div>
          </div>
        )}
        <div className="flex gap-1">
          {[1, 2, 4].map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s as 1 | 2 | 4)}
              className={`w-8 h-8 text-xs font-bold rounded ${state.speed === s
                ? 'bg-[#D4A943] text-black'
                : 'bg-[#1E1A16] text-[#B8A890] hover:bg-[#2B231B]'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >{s}×</button>
          ))}
        </div>
        <button
          onClick={togglePause}
          className={`w-9 h-9 rounded ${state.paused ? 'bg-[#6EA9E4] text-black' : 'bg-[#1E1A16] text-[#E8E0D4]'}`}
          title={state.paused ? 'Resume' : 'Pause'}
        >{state.paused ? '▶' : '❚❚'}</button>
        {dungeon && (
          <button
            onClick={retreatToTown}
            className="px-3 h-9 rounded bg-[#1E1A16] hover:bg-[#2B231B] text-[#E86E6E] text-xs font-bold border border-[#3D3328]"
            title="Return to town"
          >
            ← Town
          </button>
        )}
      </div>
    </div>
  );
};

const MiniHeroBar: React.FC<{ hero: Hero }> = ({ hero }) => {
  const cls = CLASSES[hero.classId];
  const hpPct = (hero.hp / hero.maxHp) * 100;
  const mpPct = hero.maxMp > 0 ? (hero.mp / hero.maxMp) * 100 : 0;
  const downed = hero.state !== 'alive';
  return (
    <div className={`flex-1 min-w-0 max-w-[220px] bg-[#1E1A16] border border-[#3D3328] rounded-md p-2 ${downed ? 'opacity-40 grayscale' : ''}`}>
      <div className="flex items-center gap-1 mb-1">
        <span className="text-base">{cls.icon}</span>
        <span className="text-xs font-bold text-[#E8E0D4] truncate" style={{ color: cls.color }}>{hero.name}</span>
        <span className="ml-auto text-[9px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>L{hero.level}</span>
      </div>
      <div className="h-2 bg-black rounded overflow-hidden relative mb-1">
        <div className="h-full bg-gradient-to-r from-[#4a9b3a] to-[#7FE2A0] transition-all"
             style={{ width: hpPct + '%' }} />
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {Math.ceil(hero.hp)}/{hero.maxHp}
        </div>
      </div>
      {hero.maxMp > 0 && (
        <div className="h-1.5 bg-black rounded overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#3867a0] to-[#6EA9E4] transition-all"
               style={{ width: mpPct + '%' }} />
        </div>
      )}
    </div>
  );
};
