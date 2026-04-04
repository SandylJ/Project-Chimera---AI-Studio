import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ITEMS, COLLECTION_LOG_CATEGORIES } from '../constants';
import { PlayerState } from '../types';
import { playButtonPress } from '../sounds';

interface CollectionLogViewProps { state: PlayerState; }
const RARITY_BORDER: Record<string, string> = { celestial: 'border-cyan-400', legendary: 'border-purple-500', epic: 'border-red-500', rare: 'border-blue-500', uncommon: 'border-green-500', common: 'border-[#3D3328]' };
const RARITY_GLOW: Record<string, string> = { celestial: 'shadow-cyan-400/30', legendary: 'shadow-purple-500/30', epic: 'shadow-red-500/30', rare: 'shadow-blue-500/30', uncommon: 'shadow-green-500/30', common: '' };

export function CollectionLogView({ state }: CollectionLogViewProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(COLLECTION_LOG_CATEGORIES[0]?.id ?? '');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const obtainedSet = useMemo(() => new Set(state.collectionLog), [state.collectionLog]);
  const totalPossible = useMemo(() => COLLECTION_LOG_CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0), []);
  const totalObtained = useMemo(() => { const all = new Set(COLLECTION_LOG_CATEGORIES.flatMap(c => c.items)); let count = 0; for (const id of all) { if (obtainedSet.has(id)) count++; } return count; }, [obtainedSet]);
  const overallPct = totalPossible > 0 ? (totalObtained / totalPossible) * 100 : 0;
  const categoryStats = useMemo(() => { const map: Record<string, { obtained: number; total: number }> = {};
    for (const cat of COLLECTION_LOG_CATEGORIES) { let obtained = 0; for (const id of cat.items) { if (obtainedSet.has(id)) obtained++; } map[cat.id] = { obtained, total: cat.items.length }; } return map; }, [obtainedSet]);
  const selectedCategory = COLLECTION_LOG_CATEGORIES.find(c => c.id === selectedCategoryId);
  const catStats = selectedCategory ? categoryStats[selectedCategory.id] : null;
  const catPct = catStats && catStats.total > 0 ? (catStats.obtained / catStats.total) * 100 : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-[#3D3328] pb-4">
        <div><h2 className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>Collection Log</h2>
          <div className="text-xs text-[#7A6E60] uppercase tracking-widest mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{totalObtained} / {totalPossible} UNIQUE ITEMS</div></div>
        <div className="text-right"><div className="text-xs text-[#7A6E60] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{overallPct.toFixed(1)}% COMPLETE</div></div>
      </div>
      <div className="progress-bar" style={{ height: '10px' }}><motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${overallPct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} /></div>
      <div className="flex gap-8">
        <div className="w-56 shrink-0 space-y-1">
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>CATEGORIES</div>
          {COLLECTION_LOG_CATEGORIES.map(cat => {
            const stats = categoryStats[cat.id]; const isSelected = cat.id === selectedCategoryId; const isComplete = stats && stats.obtained === stats.total;
            return (<button key={cat.id} onClick={() => { playButtonPress(); setSelectedCategoryId(cat.id); }}
              className={`w-full text-left px-3 py-2 text-sm transition-all flex items-center justify-between gap-2 rounded-lg ${
                isSelected ? 'bg-[#D4A943] text-[#1A1510] font-bold shadow-[0_3px_0_0_#8A6E1E]' : 'hover:bg-[#1E1A16] text-[#B8A890]'
              }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span className="flex items-center gap-2 truncate"><span>{cat.icon}</span><span className="truncate">{cat.name}</span></span>
              <span className={`text-[10px] shrink-0 ${isComplete ? 'text-emerald-400' : isSelected ? 'text-[#1A1510]/60' : 'text-[#7A6E60]'}`}>{stats?.obtained}/{stats?.total}</span>
            </button>);
          })}
        </div>
        <div className="flex-1 min-w-0">
          {selectedCategory && catStats && (
            <AnimatePresence mode="wait"><motion.div key={selectedCategory.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
              <div className="flex items-end justify-between border-b border-[#3D3328] pb-3">
                <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}><span>{selectedCategory.icon}</span>{selectedCategory.name}</h3>
                <div className="text-xs text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{catStats.obtained} / {catStats.total} ({catPct.toFixed(0)}%)</div>
              </div>
              <div className="progress-bar" style={{ height: '6px' }}><motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${catPct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} /></div>
              <div className="grid grid-cols-6 sm:grid-cols-7 lg:grid-cols-8 gap-2">
                {selectedCategory.items.map(itemId => {
                  const itemData = ITEMS[itemId]; const obtained = obtainedSet.has(itemId); const rarity = itemData?.rarity ?? 'common';
                  return (<div key={itemId} className="relative" onMouseEnter={() => setHoveredItem(itemId)} onMouseLeave={() => setHoveredItem(null)}>
                    <div className={`aspect-square border-2 ${RARITY_BORDER[rarity]} rounded-lg flex items-center justify-center text-2xl transition-all ${
                      obtained ? `${RARITY_GLOW[rarity]} shadow-md hover:scale-110` : 'opacity-20 grayscale'}`}>{obtained ? (itemData?.icon ?? '?') : '?'}</div>
                    {hoveredItem === itemId && (<div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none">
                      <div className="bg-[#0D0B09] text-[#E8E0D4] px-3 py-1.5 text-[10px] uppercase tracking-widest whitespace-nowrap shadow-lg rounded-lg border border-[#3D3328]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {obtained ? itemData?.name ?? itemId : '???'}{obtained && itemData?.rarity && itemData.rarity !== 'common' && <span className="ml-2 opacity-60">[{itemData.rarity}]</span>}</div></div>)}
                  </div>);
                })}
              </div>
            </motion.div></AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
