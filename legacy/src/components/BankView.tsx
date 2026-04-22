import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ITEMS } from '../constants';
import { PlayerState, EquipmentSlot, Item } from '../types';
import { playButtonPress, playSuccess, playSellItem, playEquip } from '../sounds';

interface BankViewProps {
  state: PlayerState;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: string) => void;
  toggleEdict: (itemId: string) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  addGp: (amount: number) => void;
  salvageItem: (itemId: string, quantity: number) => void;
  usePotion: (itemId: string) => void;
  socketGem: (equipmentSlot: string, gemItemId: string) => void;
  unsocketGem: (equipmentSlot: string, gemIndex: number) => void;
  openClueScroll: (clueItemId: string) => void;
  toggleAutoSell: (itemId: string) => void;
}

const BANK_TABS = [
  { id: 'all', name: 'All', icon: '📦' },
  { id: 'equipment', name: 'Gear', icon: '⚔️' },
  { id: 'resources', name: 'Resources', icon: '🪨' },
  { id: 'consumables', name: 'Consumables', icon: '🧪' },
  { id: 'rare', name: 'Rare+', icon: '💎' },
  { id: 'quest', name: 'Quest Items', icon: '📜' },
];

export function BankView({ state, equipItem, unequipItem, toggleEdict, removeFromInventory, addGp, salvageItem, usePotion, socketGem, unsocketGem, openClueScroll, toggleAutoSell }: BankViewProps) {
  const inventory = state.inventory;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'quantity' | 'rarity'>('name');
  const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;
  const selectedInventoryItem = inventory.find(i => i.itemId === selectedItemId);
  const isEquipped = selectedItemId ? Object.values(state.equipment).includes(selectedItemId) : false;
  const [soldFeedback, setSoldFeedback] = useState<{ amount: number } | null>(null);

  const handleUsePotion = (item: Item) => { if (!item || item.type !== 'potion') return; playSuccess(); usePotion(item.id); };
  const handleSalvage = (item: Item, quantity: number) => {
    if (!item || item.type !== 'equipment') return;
    if (isEquipped && quantity >= (selectedInventoryItem?.quantity || 0)) {
      const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === item.id);
      if (slot) unequipItem(slot);
    }
    playButtonPress(); salvageItem(item.id, quantity);
    if (quantity >= (selectedInventoryItem?.quantity || 0)) setSelectedItemId(null);
  };

  const RARITY_ORDER: Record<string, number> = { celestial: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
  const filteredInventory = useMemo(() => {
    let items = inventory.filter(item => {
      const data = ITEMS[item.itemId]; if (!data) return false;
      if (searchQuery) { const q = searchQuery.toLowerCase(); if (!data.name.toLowerCase().includes(q) && !data.description.toLowerCase().includes(q) && !(data.skillHint || '').toLowerCase().includes(q)) return false; }
      if (filter === 'all') return true;
      if (filter === 'equipment') return data.type === 'equipment' || data.type === 'tool';
      if (filter === 'resources') return data.type === 'resource' || data.type === 'currency';
      if (filter === 'consumables') return data.type === 'food' || data.type === 'potion';
      if (filter === 'rare') return data.rarity === 'rare' || data.rarity === 'epic' || data.rarity === 'legendary' || data.rarity === 'celestial';
      if (filter === 'quest') return data.type === 'resource' && (data.rarity === 'legendary' || data.rarity === 'epic');
      return true;
    });
    items.sort((a, b) => { const da = ITEMS[a.itemId]; const db = ITEMS[b.itemId]; if (!da || !db) return 0;
      if (sortBy === 'name') return da.name.localeCompare(db.name); if (sortBy === 'value') return (db.value * b.quantity) - (da.value * a.quantity);
      if (sortBy === 'quantity') return b.quantity - a.quantity; if (sortBy === 'rarity') return (RARITY_ORDER[db.rarity || 'common'] || 0) - (RARITY_ORDER[da.rarity || 'common'] || 0); return 0;
    }); return items;
  }, [inventory, filter, searchQuery, sortBy]);

  const totalValue = inventory.reduce((acc, item) => acc + (ITEMS[item.itemId]?.value || 0) * item.quantity, 0);
  const handleSell = (item: Item, quantity: number) => {
    if (!item || item.value === undefined) return;
    if (isEquipped && quantity >= (selectedInventoryItem?.quantity || 0)) { const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === item.id); if (slot) unequipItem(slot); }
    if (item.type === 'edict' && (state.activeEdicts || []).includes(item.id) && quantity >= (selectedInventoryItem?.quantity || 0)) toggleEdict(item.id);
    const gpGained = item.value * quantity;
    playSellItem(); removeFromInventory(item.id, quantity); addGp(gpGained);
    setSoldFeedback({ amount: gpGained });
    setTimeout(() => setSoldFeedback(null), 800);
    if (quantity >= (selectedInventoryItem?.quantity || 0)) setSelectedItemId(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3D3328] pb-6 gap-6">
        <div>
          <h2 className="text-5xl font-bold tracking-tight capitalize" style={{ fontFamily: "'Cinzel', serif" }}>Imperial Treasury</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{inventory.length} / 100 SLOTS — {state.gp.toLocaleString()} GP</div>
            <div className="h-1 w-1 bg-[#3D3328] rounded-full" />
            <div className="text-xs text-[#D4A943] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>HOARD VALUE: {totalValue.toLocaleString()} GP</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {BANK_TABS.map(tab => (
              <button key={tab.id} onClick={() => { playButtonPress(); setFilter(tab.id); }}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5 ${
                  filter === tab.id ? 'bg-[#D4A943] text-[#1A1510] font-bold shadow-[0_3px_0_0_#8A6E1E]'
                  : 'bg-[#1E1A16] border border-[#3D3328] shadow-[0_2px_0_0_#0D0B09] hover:text-[#E8E0D4]'
                }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}><span>{tab.icon}</span>{tab.name}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs border border-[#3D3328] bg-[#1E1A16] text-[#E8E0D4] rounded-lg placeholder:text-[#7A6E60]/50 focus:border-[#D4A943] focus:outline-none focus:ring-2 focus:ring-[#D4A943]/20 transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest border border-[#3D3328] bg-[#1E1A16] text-[#E8E0D4] rounded-lg focus:outline-none cursor-pointer"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <option value="name">Sort: Name</option><option value="value">Sort: Value</option><option value="quantity">Sort: Qty</option><option value="rarity">Sort: Rarity</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-6">
          <h3 className="text-xl font-bold border-b border-[#3D3328] pb-2" style={{ fontFamily: "'Cinzel', serif" }}>Equipment</h3>
          <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto">
            <div className="col-start-2"><Slot slot="head" itemId={state.equipment?.head} onUnequip={() => unequipItem('head')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-2"><Slot slot="neck" itemId={state.equipment?.neck} onUnequip={() => unequipItem('neck')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-1"><Slot slot="hands" itemId={state.equipment?.hands} onUnequip={() => unequipItem('hands')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-2"><Slot slot="body" itemId={state.equipment?.body} onUnequip={() => unequipItem('body')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-3"><Slot slot="ring" itemId={state.equipment?.ring} onUnequip={() => unequipItem('ring')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-1"><Slot slot="weapon" itemId={state.equipment?.weapon} onUnequip={() => unequipItem('weapon')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-2"><Slot slot="legs" itemId={state.equipment?.legs} onUnequip={() => unequipItem('legs')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-3"><Slot slot="shield" itemId={state.equipment?.shield} onUnequip={() => unequipItem('shield')} onSelect={setSelectedItemId} /></div>
            <div className="col-start-2"><Slot slot="feet" itemId={state.equipment?.feet} onUnequip={() => unequipItem('feet')} onSelect={setSelectedItemId} /></div>
          </div>
          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-bold border-b border-[#3D3328] pb-2" style={{ fontFamily: "'Cinzel', serif" }}>Active Edicts</h3>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => {
                const edictId = (state.activeEdicts || [])[i]; const edict = edictId ? ITEMS[edictId] : null;
                return (
                  <div key={`edict-${i}`} onClick={() => edictId && setSelectedItemId(edictId)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 relative group transition-all cursor-pointer ${
                      edict ? 'bg-[#0D0B09] text-[#E8E0D4] border border-[#D4A943]/30' : 'border border-dashed border-[#3D3328] opacity-40'
                    }`}>
                    {edict ? (<><div className="text-2xl">{edict.icon}</div><div className="text-[8px] uppercase tracking-widest text-center mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{edict.name}</div></>)
                    : (<div className="text-[8px] uppercase tracking-widest text-center text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Empty Slot</div>)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold border-b border-[#3D3328] pb-2" style={{ fontFamily: "'Cinzel', serif" }}>Vault</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredInventory.map(item => (
              <VaultItem key={item.itemId} itemId={item.itemId} quantity={item.quantity} isSelected={selectedItemId === item.itemId} onSelect={setSelectedItemId} />
            ))}
            {Array.from({ length: Math.max(0, 18 - filteredInventory.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="border border-dashed border-[#3D3328] rounded-lg p-4 flex items-center justify-center opacity-20">
                <div className="w-8 h-8 rounded-full border border-dashed border-[#3D3328]" /></div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItemId(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1E1A16] border border-[#3D3328] rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="relative">
              <button onClick={() => setSelectedItemId(null)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg border border-[#3D3328] hover:bg-[#2A2520] transition-colors z-10 text-[#7A6E60] hover:text-[#E8E0D4]">✕</button>
              <div className={`flex flex-col items-center text-center space-y-4 p-8 bg-[#0D0B09] text-[#E8E0D4] relative overflow-hidden ${
                selectedItem.rarity === 'celestial' || selectedItem.rarity === 'legendary' ? 'notif-shimmer' : ''
              }`}>
                {/* Rarity background glow */}
                {selectedItem.rarity && selectedItem.rarity !== 'common' && (
                  <div className={`absolute inset-0 opacity-20 ${
                    selectedItem.rarity === 'celestial' ? 'rarity-bg-celestial' :
                    selectedItem.rarity === 'legendary' ? 'rarity-bg-legendary' :
                    selectedItem.rarity === 'epic' ? 'rarity-bg-epic' :
                    selectedItem.rarity === 'rare' ? 'rarity-bg-rare' :
                    'rarity-bg-uncommon'
                  }`} style={{ background: undefined }} />
                )}
                <div className="text-7xl drop-shadow-lg relative">
                  {selectedItem.icon}
                  <AnimatePresence>
                    {soldFeedback && (
                      <motion.div
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -40, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 text-[#D4A943] font-bold text-lg whitespace-nowrap pointer-events-none"
                        style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 10px rgba(212, 169, 67, 0.6)' }}
                      >
                        +{soldFeedback.amount.toLocaleString()} GP
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <h4 className={`text-3xl font-bold tracking-tight ${
                    selectedItem.rarity === 'celestial' ? 'rarity-celestial' :
                    selectedItem.rarity === 'legendary' ? 'rarity-legendary' :
                    selectedItem.rarity === 'epic' ? 'rarity-epic' :
                    selectedItem.rarity === 'rare' ? 'rarity-rare' :
                    selectedItem.rarity === 'uncommon' ? 'rarity-uncommon' : ''
                  }`} style={{ fontFamily: "'Cinzel', serif" }}>{selectedItem.name}</h4>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <p className={`text-[10px] uppercase tracking-widest font-bold ${
                      selectedItem.rarity === 'celestial' ? 'rarity-celestial' :
                      selectedItem.rarity === 'legendary' ? 'rarity-legendary' :
                      selectedItem.rarity === 'epic' ? 'rarity-epic' :
                      selectedItem.rarity === 'rare' ? 'rarity-rare' :
                      selectedItem.rarity === 'uncommon' ? 'rarity-uncommon' : 'text-[#7A6E60]'
                    }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedItem.rarity || 'common'}</p>
                    <span className="text-[#3D3328]">·</span>
                    <p className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedItem.type}</p>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Description</div>
                  <p className="text-base leading-relaxed text-[#B8A890]">{selectedItem.description}</p>
                </div>
                {selectedItem.stats && (
                  <div>
                    <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Attributes</div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      {Object.entries(selectedItem.stats).map(([stat, val]) => (
                        <div key={stat} className="text-xs uppercase tracking-widest flex justify-between border-b border-[#3D3328] pb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          <span className="text-[#7A6E60]">{stat}</span><span className="font-bold text-emerald-400">+{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedItem.setBonus && (
                  <div className="p-4 bg-[#D4A943]/10 border border-[#D4A943]/30 rounded-lg">
                    <div className="text-[10px] text-[#D4A943] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Set Bonus: {selectedItem.setBonus.setId}</div>
                    <div className="text-xs text-[#B8A890] italic">Requires {selectedItem.setBonus.piecesRequired} pieces.
                      <div className="mt-1 font-bold">{Object.entries(selectedItem.setBonus.bonus).map(([stat, val]) => (<span key={stat} className="mr-2">+{val} {stat}</span>))}</div>
                    </div>
                  </div>
                )}
                {(selectedItem.skillHint || selectedItem.farmHint || selectedItem.usageHint) && (
                  <div className="p-5 bg-[#0D0B09] border border-[#3D3328] space-y-4 rounded-lg">
                    {selectedItem.skillHint && <div><div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Skill Focus</div><div className="text-xs font-bold uppercase tracking-tight">{selectedItem.skillHint}</div></div>}
                    {selectedItem.farmHint && <div><div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Provenance</div><div className="text-xs font-bold italic">"{selectedItem.farmHint}"</div></div>}
                    {selectedItem.usageHint && <div><div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Imperial Insight</div><div className="text-xs italic text-[#B8A890] leading-snug">{selectedItem.usageHint}</div></div>}
                  </div>
                )}
                {/* Gem Socketing UI */}
                {selectedItem.socketable && isEquipped && (() => {
                  const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === selectedItem.id);
                  if (!slot) return null;
                  const socketedGems = state.socketedGems[slot] || [];
                  const maxSockets = selectedItem.sockets || 0;
                  const availableGems = state.inventory.filter(i => ITEMS[i.itemId]?.isGem);
                  return (
                    <div className="p-4 bg-[#0D0B09] border border-purple-800/30 rounded-lg space-y-3">
                      <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        Gem Sockets ({socketedGems.length}/{maxSockets})
                      </div>
                      <div className="flex gap-2">
                        {Array.from({ length: maxSockets }).map((_, i) => {
                          const gemId = socketedGems[i];
                          const gem = gemId ? ITEMS[gemId] : null;
                          return (
                            <div key={i} className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center relative group transition-all ${
                              gem ? 'bg-[#1E1A16] border border-purple-600/40' : 'border border-dashed border-[#3D3328] opacity-50'
                            }`}>
                              {gem ? (
                                <>
                                  <div className="text-xl">{gem.icon}</div>
                                  <div className="text-[7px] text-[#7A6E60] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{gem.name.split(' ')[0]}</div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); playButtonPress(); unsocketGem(slot, i); }}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-900 border border-red-700 rounded-full text-[8px] text-red-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >✕</button>
                                </>
                              ) : (
                                <div className="text-[8px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Empty</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {socketedGems.length < maxSockets && availableGems.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Available Gems</div>
                          <div className="flex flex-wrap gap-2">
                            {availableGems.map(invItem => {
                              const gem = ITEMS[invItem.itemId];
                              return (
                                <button
                                  key={invItem.itemId}
                                  onClick={(e) => { e.stopPropagation(); playSuccess(); socketGem(slot, invItem.itemId); }}
                                  className="tooltip flex items-center gap-1.5 px-2 py-1 bg-[#1E1A16] border border-[#3D3328] rounded-lg hover:border-purple-500/50 transition-colors text-xs"
                                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                                >
                                  <span>{gem.icon}</span>
                                  <span className={`${
                                    gem.rarity === 'legendary' ? 'rarity-legendary' :
                                    gem.rarity === 'epic' ? 'rarity-epic' : 'rarity-rare'
                                  }`}>{gem.name}</span>
                                  <span className="text-[#7A6E60]">x{invItem.quantity}</span>
                                  <span className="tooltip-content !whitespace-normal !w-40">
                                    <span className="block text-[9px] text-[#7A6E60] uppercase mb-1">Gem Bonus</span>
                                    {gem.gemBonus && Object.entries(gem.gemBonus).map(([stat, val]) => (
                                      <span key={stat} className="tooltip-stat text-emerald-400 mr-2">+{val} {stat}</span>
                                    ))}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {socketedGems.length > 0 && (
                        <div className="text-[9px] text-emerald-400/70 uppercase tracking-widest pt-1 border-t border-[#3D3328]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          Bonuses: {socketedGems.map(gId => ITEMS[gId]).filter(Boolean).map(g =>
                            Object.entries(g.gemBonus || {}).map(([s, v]) => `+${v} ${s}`).join(', ')
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="pt-4 space-y-3">
                  {selectedItem.type === 'equipment' && selectedInventoryItem && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => { playEquip(); equipItem(selectedItem.id); setSelectedItemId(null); }} className="keycap keycap-gold py-4 text-xs uppercase tracking-widest w-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Equip</button>
                      <button onClick={() => handleSalvage(selectedItem, 1)} className="keycap py-4 text-xs uppercase tracking-widest w-full text-cyan-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Salvage</button>
                    </div>
                  )}
                  {selectedItem.type === 'potion' && selectedInventoryItem && (
                    <button onClick={() => handleUsePotion(selectedItem)} className="keycap keycap-gold w-full py-4 text-xs uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Consume Potion</button>
                  )}
                  {selectedItem.id.startsWith('clue_scroll_') && selectedInventoryItem && (
                    <button onClick={() => { playSuccess(); openClueScroll(selectedItem.id); setSelectedItemId(null); }} className="keycap keycap-gold w-full py-4 text-xs uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Open Clue Scroll</button>
                  )}
                  {selectedItem.type === 'edict' && (
                    <button onClick={() => { playButtonPress(); toggleEdict(selectedItem.id); }} className="keycap keycap-gold w-full py-4 text-xs uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {(state.activeEdicts || []).includes(selectedItem.id) ? 'Deactivate Edict' : 'Activate Edict'}
                    </button>
                  )}
                  {selectedInventoryItem && (
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleSell(selectedItem, 1)} className="keycap keycap-sm py-3 text-[10px] uppercase tracking-widest w-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sell 1 ({selectedItem?.value || 0} GP)</button>
                      <button onClick={() => handleSell(selectedItem, selectedInventoryItem.quantity)} className="keycap keycap-sm py-3 text-[10px] uppercase tracking-widest w-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sell All ({(selectedItem?.value || 0) * selectedInventoryItem.quantity} GP)</button>
                    </div>
                  )}
                  {selectedItem.value > 0 && selectedItem.type === 'resource' && (!selectedItem.rarity || selectedItem.rarity === 'common' || selectedItem.rarity === 'uncommon') && (
                    <button onClick={() => { playButtonPress(); toggleAutoSell(selectedItem.id); }}
                      className={`keycap keycap-sm w-full py-3 text-[10px] uppercase tracking-widest ${
                        state.autoSellItems.includes(selectedItem.id) ? 'text-amber-400' : 'text-[#7A6E60]'
                      }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {state.autoSellItems.includes(selectedItem.id) ? 'Auto-Sell: ON' : 'Auto-Sell: OFF'}
                    </button>
                  )}
                  {isEquipped && (
                    <button onClick={() => { playEquip(); const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === selectedItem.id); if (slot) unequipItem(slot); setSelectedItemId(null); }}
                      className="keycap w-full py-4 text-xs uppercase tracking-widest text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace", boxShadow: '0 4px 0 0 #7f1d1d' }}>Unequip Item</button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>)}
      </AnimatePresence>
    </div>
  );
}

const VaultItem = memo(function VaultItem({ itemId, quantity, isSelected, onSelect }: { itemId: string; quantity: number; isSelected: boolean; onSelect: (id: string) => void }) {
  const itemData = ITEMS[itemId];
  if (!itemData) return null;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      onClick={() => { playButtonPress(); onSelect(itemId); }}
      className={`tooltip group card item-stack p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#2A2520] hover:border-[#D4A943]/30 transition-all cursor-pointer relative ${
        isSelected ? 'bg-[#2A2520] border-[#D4A943]/30 ring-2 ring-inset ring-[#D4A943]/30' : ''
      } ${
        itemData.rarity === 'celestial' ? 'rarity-border-celestial border-2 notif-shimmer' : itemData.rarity === 'legendary' ? 'rarity-border-legendary border-2 notif-shimmer' :
        itemData.rarity === 'epic' ? 'rarity-border-epic border-2' : itemData.rarity === 'rare' ? 'rarity-border-rare border-2' :
        itemData.rarity === 'uncommon' ? 'rarity-border-uncommon border-2' : ''
      }`}
      style={{ '--stack-size': Math.min(quantity, 100) } as React.CSSProperties}>
      <div className="text-4xl drop-shadow-sm">{itemData.icon}</div>
      <div className={`text-[10px] uppercase tracking-widest text-center truncate w-full ${
        itemData.rarity === 'celestial' ? 'rarity-celestial' :
        itemData.rarity === 'legendary' ? 'rarity-legendary' :
        itemData.rarity === 'epic' ? 'rarity-epic' :
        'text-[#7A6E60]'
      }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{itemData.name}</div>
      <div className={`absolute top-2 right-2 text-xs font-bold ${
        itemData.rarity === 'celestial' ? 'rarity-celestial' : itemData.rarity === 'legendary' ? 'rarity-legendary' :
        itemData.rarity === 'epic' ? 'rarity-epic' : itemData.rarity === 'rare' ? 'rarity-rare' :
        itemData.rarity === 'uncommon' ? 'rarity-uncommon' : 'text-[#7A6E60]'
      }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{quantity.toLocaleString()}</div>
      <ItemTooltip item={itemData} quantity={quantity} />
    </motion.div>
  );
});

function Slot({ slot, itemId, onUnequip, onSelect }: { slot: string; itemId?: string; onUnequip: () => void; onSelect: (id: string) => void }) {
  const item = itemId ? ITEMS[itemId] : null;
  return (
    <div onClick={() => { if (itemId) { playButtonPress(); onSelect(itemId); } }}
      className={`tooltip aspect-square rounded-lg flex flex-col items-center justify-center p-2 relative group transition-all cursor-pointer ${
        item ? 'bg-[#0D0B09] text-[#E8E0D4] border border-[#D4A943]/30' : 'border border-dashed border-[#3D3328] opacity-30'
      }`}>
      <div className="text-2xl">{item ? item.icon : '◌'}</div>
      <div className="text-[8px] uppercase tracking-widest text-center mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item ? item.name : slot}</div>
      {item && <div className="absolute inset-0 rounded-lg bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
      {item && <ItemTooltip item={item} />}
    </div>
  );
}

const RARITY_LABELS: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
  celestial: 'Celestial',
};

function ItemTooltip({ item, quantity }: { item: Item; quantity?: number }) {
  return (
    <div className="tooltip-content !whitespace-normal !w-56 !left-1/2 pointer-events-none">
      {/* Header: name + rarity */}
      <div className={`font-bold text-sm mb-1 ${
        item.rarity === 'celestial' ? 'rarity-celestial' :
        item.rarity === 'legendary' ? 'rarity-legendary' :
        item.rarity === 'epic' ? 'rarity-epic' :
        item.rarity === 'rare' ? 'rarity-rare' :
        item.rarity === 'uncommon' ? 'rarity-uncommon' :
        'text-[#8B8680]'
      }`} style={{ fontFamily: "'Cinzel', serif" }}>
        {item.icon} {item.name}
      </div>

      {/* Rarity + type badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[9px] uppercase tracking-widest font-bold ${
          item.rarity === 'celestial' ? 'rarity-celestial' :
          item.rarity === 'legendary' ? 'rarity-legendary' :
          item.rarity === 'epic' ? 'rarity-epic' :
          item.rarity === 'rare' ? 'rarity-rare' :
          item.rarity === 'uncommon' ? 'rarity-uncommon' :
          'text-[#7A6E60]'
        }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {RARITY_LABELS[item.rarity || 'common']}
        </span>
        <span className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {item.type}
        </span>
      </div>

      {/* Description */}
      <div className="tooltip-desc mb-2 leading-snug">{item.description}</div>

      {/* Stats */}
      {item.stats && (
        <div className="border-t border-[#3D3328] pt-1.5 mt-1.5 space-y-0.5">
          {Object.entries(item.stats).filter(([, v]) => v !== 0).map(([stat, val]) => (
            <div key={stat} className="flex justify-between">
              <span className="text-[#7A6E60] tooltip-stat">{stat}</span>
              <span className="tooltip-stat text-emerald-400">+{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Value */}
      <div className="border-t border-[#3D3328] pt-1.5 mt-1.5 flex justify-between">
        <span className="tooltip-stat text-[#7A6E60]">Value</span>
        <span className="tooltip-stat text-[#D4A943]">{item.value.toLocaleString()} GP{quantity && quantity > 1 ? ` (${(item.value * quantity).toLocaleString()} total)` : ''}</span>
      </div>

      {/* Set bonus hint */}
      {item.setBonus && (
        <div className="border-t border-[#3D3328] pt-1.5 mt-1.5">
          <span className="text-[9px] text-[#D4A943] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Set: {item.setBonus.setId} ({item.setBonus.piecesRequired}pc)
          </span>
        </div>
      )}
    </div>
  );
}
