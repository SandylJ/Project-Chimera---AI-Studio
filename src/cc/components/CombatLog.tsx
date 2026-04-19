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

  const filters: Array<LogEntry['kind'] | 'all'> = ['all', 'combat', 'loot', 'level', 'heal', 'decision', 'victory', 'death'];
  // Aggregate counts per kind for the filter chip labels
  const counts: Record<string, number> = {};
  for (const e of state.currentLog) counts[e.kind] = (counts[e.kind] ?? 0) + 1;
  counts.all = state.currentLog.length;

  return (
    <div className="p-4 h-full flex flex-col overflow-hidden">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-2xl font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>
          📜 Event Log
        </h2>
        <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {state.currentLog.length} entries · newest first
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {filters.map(f => {
          const active = filter === f;
          const color = f === 'all' ? '#F2E6A8' : kindColor(f as LogEntry['kind']);
          const count = counts[f] ?? 0;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
                    className={`press px-2.5 py-1 text-[10px] uppercase tracking-widest border transition-colors ${active ? 'font-black' : 'hover:bg-[#2B2B32]'}`}
                    style={{
                      background: active ? color : '#14100C',
                      borderColor: color + (active ? '' : '40'),
                      color: active ? '#0a0806' : color,
                      borderRadius: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                <span>{f}</span>
                <span className="ml-1 opacity-70">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto bg-[#0D0B09] border border-[#3D3328] rounded p-3 text-xs space-y-0.5"
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
  const borderColor = entry.rarity ? color + '60' : 'transparent';
  return (
    <div className="flex gap-2 items-start px-1.5 py-0.5 rounded hover:bg-[#14100C] transition-colors"
         style={{ borderLeft: `2px solid ${borderColor}` }}>
      <span className="text-[#3D3328] shrink-0 tabular-nums text-[10px]">{time}</span>
      <span className="shrink-0 text-sm leading-none" style={{ color }}>{KIND_ICONS[entry.kind]}</span>
      <span className="leading-snug" style={{ color }}>{entry.text}</span>
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
