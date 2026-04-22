import React, { useState, useMemo } from 'react';
import { GameState, Rarity } from '../types';
import { ITEMS } from '../data/items';
import { sellValue } from '../engine/loot';

interface Props {
  state: GameState;
  sellItem: (itemId: string, qty: number) => void;
  setAutoSell: (r: Rarity, on: boolean) => void;
  useScroll?: (itemId: string) => void;
}

type Filter = 'all' | 'weapon' | 'armor' | 'trinket' | 'potion' | 'consumable' | 'material';
type Sort = 'rarity' | 'value' | 'name' | 'qty';

const RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'celestial'];

export const StashView: React.FC<Props> = ({ state, sellItem, setAutoSell, useScroll }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'all'>('all');
  const [sort, setSort] = useState<Sort>('rarity');

  const items = useMemo(() => {
    const list = Object.entries(state.stash.items)
      .map(([id, qty]) => ({ id, qty, item: ITEMS[id] }))
      .filter(e => e.item);
    const typed = list
      .filter(e => filter === 'all'
        || e.item.type === filter
        || (filter === 'armor' && (e.item.type === 'armor' || e.item.slot === 'offhand')))
      .filter(e => rarityFilter === 'all' || e.item.rarity === rarityFilter);
    const sorted = [...typed].sort((a, b) => {
      switch (sort) {
        case 'value': return b.item.value * b.qty - a.item.value * a.qty;
        case 'name':  return a.item.name.localeCompare(b.item.name);
        case 'qty':   return b.qty - a.qty;
        case 'rarity':
        default: {
          const rdiff = RARITIES.indexOf(b.item.rarity) - RARITIES.indexOf(a.item.rarity);
          if (rdiff !== 0) return rdiff;
          return b.item.value - a.item.value;
        }
      }
    });
    return sorted;
  }, [state.stash.items, filter, rarityFilter, sort]);

  const totalValue = items.reduce((a, e) => a + sellValue(e.id, e.qty), 0);

  // Per-rarity bulk sell totals (only non-equipment + non-potion)
  const bulkByRarity = useMemo(() => {
    const sums: Record<Rarity, { gold: number; count: number; ids: string[] }> = {
      common:    { gold: 0, count: 0, ids: [] },
      uncommon:  { gold: 0, count: 0, ids: [] },
      rare:      { gold: 0, count: 0, ids: [] },
      epic:      { gold: 0, count: 0, ids: [] },
      legendary: { gold: 0, count: 0, ids: [] },
      celestial: { gold: 0, count: 0, ids: [] },
    };
    for (const [id, qty] of Object.entries(state.stash.items)) {
      const it = ITEMS[id];
      if (!it) continue;
      if (it.slot) continue; // keep equipment
      if (it.type === 'potion' || it.type === 'consumable') continue; // keep utility
      sums[it.rarity].gold += Math.floor(it.value * qty * 0.5);
      sums[it.rarity].count += qty;
      sums[it.rarity].ids.push(id);
    }
    return sums;
  }, [state.stash.items]);

  const bulkSellRarity = (r: Rarity) => {
    const { ids } = bulkByRarity[r];
    for (const id of ids) {
      const qty = state.stash.items[id] ?? 0;
      if (qty > 0) sellItem(id, qty);
    }
  };

  return (
    <div className="p-4 h-full overflow-hidden flex flex-col">
      <div className="flex items-end gap-3 mb-3">
        <div>
          <h2 className="text-2xl font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>Stash</h2>
          <div className="text-[11px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {items.length} unique • {Object.values(state.stash.items).reduce((a, b) => a + b, 0)} items • {state.stash.gold} gp
          </div>
        </div>
        <div className="ml-auto text-[11px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Sellable: <span className="text-[#D4A943] font-bold">{totalValue} gp</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {(['all', 'weapon', 'armor', 'trinket', 'potion', 'consumable', 'material'] as Filter[]).map(f => {
          const active = filter === f;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)}
                    className={`press px-3 py-1 text-[10px] uppercase tracking-widest transition-colors ${
                      active ? 'text-[#0a0806] font-black' : 'text-[#B8A890] hover:bg-[#2B2B32]'
                    }`}
                    style={{
                      background: active ? 'var(--cc-blue)' : '#14100C',
                      border: `1px solid ${active ? 'var(--cc-blue)' : '#2B2B32'}`,
                      borderRadius: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
              {f}
            </button>
          );
        })}
        <div className="w-px bg-[#3D3328]" />
        {['all' as const, ...RARITIES].map(r => {
          const active = rarityFilter === r;
          const color = r === 'all' ? '#E8E0D4' : rarityColor(r);
          return (
            <button key={r} type="button" onClick={() => setRarityFilter(r)}
                    className={`press px-3 py-1 text-[10px] uppercase tracking-widest transition-colors ${active ? 'font-black' : 'hover:bg-[#2B2B32]'}`}
                    style={{
                      background: active ? color : '#14100C',
                      color: active ? '#0a0806' : color,
                      border: `1px solid ${active ? color : '#2B2B32'}`,
                      borderRadius: 2,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
              {r === 'all' ? 'any' : r}
            </button>
          );
        })}
        <div className="w-px bg-[#3D3328]" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[#7A6E60] uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sort</span>
          {(['rarity', 'value', 'qty', 'name'] as Sort[]).map(s => {
            const active = sort === s;
            return (
              <button key={s} type="button" onClick={() => setSort(s)}
                      className={`press px-2 py-1 text-[10px] uppercase transition-colors ${active ? 'text-[#0a0806] font-black' : 'text-[#B8A890] hover:bg-[#2B2B32]'}`}
                      style={{
                        background: active ? 'var(--cc-blue)' : '#14100C',
                        border: `1px solid ${active ? 'var(--cc-blue)' : '#2B2B32'}`,
                        borderRadius: 2,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                {s}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {items.map(e => (
          <div key={e.id}
               className="bg-[#14100C] border rounded p-2"
               style={{ borderColor: rarityColor(e.item.rarity) + '60' }}>
            <div className="flex items-start gap-2">
              <span className="text-2xl">{e.item.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: rarityColor(e.item.rarity) }}>
                  {e.item.name}
                </div>
                <div className="text-[9px] text-[#7A6E60] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  ×{e.qty} • {e.item.type}
                </div>
              </div>
            </div>
            {e.item.weaponPower && <div className="text-[10px] text-[#E86E6E]">+{e.item.weaponPower} DMG</div>}
            {e.item.armor && <div className="text-[10px] text-[#D4A943]">+{e.item.armor} ARM</div>}
            {e.item.stats && (
              <div className="text-[10px] text-[#B8A890]">
                {Object.entries(e.item.stats).map(([k, v]) => `${k}+${v}`).join(' ')}
              </div>
            )}
            {e.item.description && <div className="text-[10px] text-[#7A6E60] italic mt-1">{e.item.description}</div>}
            <div className="flex gap-1 mt-2 flex-wrap">
              {/* Use-scroll shortcut */}
              {useScroll && e.item.type === 'consumable' && e.id.startsWith('scroll_') && (
                <button type="button" onClick={() => useScroll(e.id)}
                        className="press flex-1 text-[10px] py-1 text-[#0a0806] font-bold hover:brightness-110"
                        style={{
                          background: 'var(--cc-blue)',
                          border: '1px solid var(--cc-blue)',
                          borderRadius: 2,
                        }}>
                  Use
                </button>
              )}
              <button type="button" onClick={() => sellItem(e.id, 1)}
                      className="press flex-1 text-[10px] py-1 text-[#D4A943] hover:bg-[#2B2B32] transition-colors"
                      style={{
                        background: '#14100C',
                        border: '1px solid #2B2B32',
                        borderRadius: 2,
                      }}>
                Sell 1 ({sellValue(e.id, 1)})
              </button>
              {e.qty > 1 && (
                <button type="button" onClick={() => sellItem(e.id, e.qty)}
                        className="press flex-1 text-[10px] py-1 text-[#D4A943] hover:bg-[#2B2B32] transition-colors"
                        style={{
                          background: '#14100C',
                          border: '1px solid #2B2B32',
                          borderRadius: 2,
                        }}>
                  Sell all ({sellValue(e.id, e.qty)})
                </button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-center text-[#7A6E60] text-sm py-8">
            Stash is empty. Explore a dungeon to find loot.
          </div>
        )}
      </div>

      <div className="mt-3 p-2 bg-[#14100C] rounded border border-[#3D3328]">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-[10px] uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Bulk sell by rarity (materials & trinkets only — safe)
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {RARITIES.map(r => {
            const { gold, count } = bulkByRarity[r];
            const disabled = gold === 0;
            return (
              <button key={r} type="button" onClick={() => !disabled && bulkSellRarity(r)}
                      disabled={disabled}
                      className={`press px-2 py-1 text-[10px] transition-colors ${disabled ? 'cursor-not-allowed' : 'hover:bg-[#2B2B32]'}`}
                      style={{
                        background: disabled ? '#0a0806' : '#14100C',
                        border: `1px solid ${disabled ? '#1E1A16' : 'var(--cc-orange)'}`,
                        color: disabled ? '#3D3328' : rarityColor(r),
                        borderRadius: 2,
                        fontFamily: "'JetBrains Mono', monospace",
                      }}>
                <span className="font-bold">{r}</span> ×{count} → +{gold}g
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Auto-sell new drops:
          </div>
          <div className="flex gap-1 flex-wrap">
            {RARITIES.map(r => {
              const on = state.autoSellRarities.includes(r);
              return (
                <button key={r} type="button" onClick={() => setAutoSell(r, !on)}
                        className="press px-2 py-0.5 text-[10px] transition-colors hover:bg-[#2B2B32]"
                        style={{
                          background: on ? '#2B2B32' : '#14100C',
                          border: `1px solid ${on ? 'var(--cc-orange)' : '#2B2B32'}`,
                          color: rarityColor(r),
                          borderRadius: 2,
                        }}>
                  {on ? '✓ ' : ''}{r}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

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
