import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ITEMS, COLLECTION_LOG_CATEGORIES } from '../constants';
import { PlayerState } from '../types';
import { playButtonPress } from '../sounds';

interface CollectionLogViewProps { state: PlayerState; }
const RARITY_BORDER: Record<string, string> = { celestial: 'border-cyan-400', legendary: 'border-purple-500', epic: 'border-red-500', rare: 'border-blue-500', uncommon: 'border-green-500', common: 'border-[#3D3328]' };
const RARITY_GLOW: Record<string, string> = { celestial: 'shadow-cyan-400/30', legendary: 'shadow-purple-500/30', epic: 'shadow-red-500/30', rare: 'shadow-blue-500/30', uncommon: 'shadow-green-500/30', common: '' };

// Item Set definitions — derived from constants
const ITEM_SETS = [
  { setId: 'abyssal', name: 'Abyssal Robes', icon: '👘', pieces: ['abyssal_robe_top', 'abyssal_robe_legs'], piecesRequired: 2, bonus: { magic: 15, speed: 0.1 } },
  { setId: 'void_set', name: 'Void Knight', icon: '🪖', pieces: ['void_helm', 'void_body', 'void_legs'], piecesRequired: 3, bonus: { luck: 50, attack: 20 } },
  { setId: 'justiciar_set', name: 'Justiciar', icon: '🛡️', pieces: ['justiciar_helm', 'justiciar_chest', 'justiciar_legs'], piecesRequired: 3, bonus: { defense: 100, health: 50 } },
  { setId: 'ancestral_set', name: 'Ancestral', icon: '🧙', pieces: ['ancestral_hat', 'ancestral_robe_top', 'ancestral_robe_bottom'], piecesRequired: 3, bonus: { magic: 150, speed: 0.1 } },
];

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
      {/* Item Sets Tracker */}
      <div className="space-y-6 pt-8 border-t border-[#3D3328]">
        <h3 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>Equipment Sets</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ITEM_SETS.map(set => {
            const ownedPieces = set.pieces.filter(pieceId => state.inventory.some(i => i.itemId === pieceId) || Object.values(state.equipment).includes(pieceId));
            const equippedPieces = set.pieces.filter(pieceId => Object.values(state.equipment).includes(pieceId));
            const isComplete = ownedPieces.length >= set.piecesRequired;
            const isActive = equippedPieces.length >= set.piecesRequired;
            return (
              <div key={set.setId} className={`card p-5 space-y-3 ${isActive ? 'ring-1 ring-[#D4A943]/30' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{set.icon}</span>
                    <div>
                      <div className="font-bold text-sm" style={{ fontFamily: "'Cinzel', serif" }}>{set.name}</div>
                      <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {ownedPieces.length}/{set.piecesRequired} owned
                        {isActive && <span className="text-emerald-400 ml-2">ACTIVE</span>}
                      </div>
                    </div>
                  </div>
                  {isComplete && (
                    <span className="text-[9px] bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Complete
                    </span>
                  )}
                </div>
                {/* Pieces */}
                <div className="flex gap-2">
                  {set.pieces.map(pieceId => {
                    const item = ITEMS[pieceId];
                    const owned = state.inventory.some(i => i.itemId === pieceId) || Object.values(state.equipment).includes(pieceId);
                    const equipped = Object.values(state.equipment).includes(pieceId);
                    return (
                      <div key={pieceId} className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                        equipped ? 'bg-emerald-950/30 border-emerald-700/40' :
                        owned ? 'bg-[#1E1A16] border-[#D4A943]/30' :
                        'border-dashed border-[#3D3328] opacity-40'
                      }`}>
                        <div className={`text-xl ${owned ? '' : 'grayscale opacity-30'}`}>{item?.icon || '?'}</div>
                        <div className="text-[8px] uppercase tracking-widest mt-1 truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {owned ? item?.name : '???'}
                        </div>
                        {equipped && <div className="text-[7px] text-emerald-400 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Equipped</div>}
                      </div>
                    );
                  })}
                </div>
                {/* Bonus preview */}
                <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest border-t border-[#3D3328] pt-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span className={isActive ? 'text-[#D4A943]' : ''}>Set Bonus ({set.piecesRequired}pc): </span>
                  {Object.entries(set.bonus).map(([stat, val]) => (
                    <span key={stat} className={`mr-2 ${isActive ? 'text-emerald-400' : ''}`}>+{val} {stat}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
