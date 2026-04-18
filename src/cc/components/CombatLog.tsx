import React, { useState } from 'react';
import { GameState, LogEntry } from '../types';

interface Props {
  state: GameState;
  compact?: boolean;
}

const KIND_ICONS: Record<LogEntry['kind'], string> = {
  combat: '⚔',
  loot: '🪙',
  level: '⬆',
  move: '👣',
  decision: '❓',
  system: 'ℹ',
  death: '💀',
  heal: '💚',
  victory: '🏆',
  retreat: '🚪',
};

export const CombatLog: React.FC<Props> = ({ state, compact = false }) => {
  const [filter, setFilter] = useState<LogEntry['kind'] | 'all'>('all');
  const entries = state.currentLog.filter(e => filter === 'all' || e.kind === filter);

  if (compact) {
    return (
      <div className="bg-[#0D0B09] border-t border-[#3D3328] max-h-40 overflow-y-auto p-2 text-xs space-y-0.5"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {entries.slice(0, 30).map(e => (
          <LogLine key={e.id} entry={e} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <h2 className="text-2xl font-bold text-[#F2E6A8] mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
        📜 Event Log
      </h2>
      <div className="flex flex-wrap gap-2 mb-3">
        {(['all', 'combat', 'loot', 'level', 'decision', 'victory', 'death'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-[10px] uppercase tracking-widest rounded ${filter === f ? 'bg-[#D4A943] text-black' : 'bg-[#14100C] text-[#B8A890]'}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto bg-[#0D0B09] border border-[#3D3328] rounded p-3 text-xs space-y-1"
           style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        {entries.map(e => <LogLine key={e.id} entry={e} />)}
        {entries.length === 0 && <div className="text-[#7A6E60] italic">No entries match this filter.</div>}
      </div>
    </div>
  );
};

const LogLine: React.FC<{ entry: LogEntry }> = ({ entry }) => {
  const color = entry.rarity ? rarityColor(entry.rarity) : kindColor(entry.kind);
  const time = new Date(entry.t).toLocaleTimeString(undefined, { hour12: false });
  return (
    <div className="flex gap-2 items-start">
      <span className="text-[#3D3328] shrink-0">{time}</span>
      <span className="shrink-0">{KIND_ICONS[entry.kind]}</span>
      <span style={{ color }}>{entry.text}</span>
    </div>
  );
};

function kindColor(k: LogEntry['kind']): string {
  switch (k) {
    case 'combat': return '#E8E0D4';
    case 'loot': return '#D4A943';
    case 'level': return '#F2E6A8';
    case 'move': return '#7A6E60';
    case 'decision': return '#B485E8';
    case 'system': return '#6EA9E4';
    case 'death': return '#E86E6E';
    case 'heal': return '#7FE2A0';
    case 'victory': return '#F2B84B';
    case 'retreat': return '#B8A890';
  }
}

function rarityColor(r: string): string {
  switch (r) {
    case 'common': return '#E8E0D4';
    case 'uncommon': return '#7FE2A0';
    case 'rare': return '#6EA9E4';
    case 'epic': return '#C58BE8';
    case 'legendary': return '#F2B84B';
    case 'celestial': return '#FF6EE6';
    default: return '#E8E0D4';
  }
}
