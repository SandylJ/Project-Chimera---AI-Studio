import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ITEMS } from '../constants';
import { PlayerState, EquipmentSlot, Item } from '../types';

interface BankViewProps {
  state: PlayerState;
  equipItem: (itemId: string) => void;
  unequipItem: (slot: string) => void;
  toggleEdict: (itemId: string) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  addGp: (amount: number) => void;
  salvageItem: (itemId: string, quantity: number) => void;
  usePotion: (itemId: string) => void;
}

export function BankView({ state, equipItem, unequipItem, toggleEdict, removeFromInventory, addGp, salvageItem, usePotion }: BankViewProps) {
  const inventory = state.inventory;
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;
  const selectedInventoryItem = inventory.find(i => i.itemId === selectedItemId);
  const isEquipped = selectedItemId ? Object.values(state.equipment).includes(selectedItemId) : false;

  const handleUsePotion = (item: Item) => {
    if (!item || item.type !== 'potion') return;
    usePotion(item.id);
  };

  const handleSalvage = (item: Item, quantity: number) => {
    if (!item || item.type !== 'equipment') return;
    if (isEquipped && quantity >= (selectedInventoryItem?.quantity || 0)) {
      const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === item.id);
      if (slot) unequipItem(slot);
    }
    salvageItem(item.id, quantity);
    if (quantity >= (selectedInventoryItem?.quantity || 0)) {
      setSelectedItemId(null);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const data = ITEMS[item.itemId];
    if (!data) return false;
    if (filter === 'all') return true;
    if (filter === 'equipment') return data.type === 'equipment' || data.type === 'tool';
    if (filter === 'resources') return data.type === 'resource' || data.type === 'currency';
    if (filter === 'consumables') return data.type === 'food' || data.type === 'potion';
    if (filter === 'rare') return data.rarity === 'rare' || data.rarity === 'legendary';
    return true;
  });

  const totalValue = inventory.reduce((acc, item) => acc + (ITEMS[item.itemId]?.value || 0) * item.quantity, 0);

  const handleSell = (item: Item, quantity: number) => {
    if (!item || item.value === undefined) return;
    if (isEquipped && quantity >= (selectedInventoryItem?.quantity || 0)) {
      const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === item.id);
      if (slot) unequipItem(slot);
    }
    if (item.type === 'edict' && (state.activeEdicts || []).includes(item.id) && quantity >= (selectedInventoryItem?.quantity || 0)) {
      toggleEdict(item.id);
    }
    removeFromInventory(item.id, quantity);
    addGp(item.value * quantity);
    if (quantity >= (selectedInventoryItem?.quantity || 0)) {
      setSelectedItemId(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#141414] pb-6 gap-6">
        <div>
          <h2 className="text-5xl font-serif italic font-bold tracking-tight capitalize">Imperial Treasury</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs font-mono opacity-50 uppercase tracking-widest">
              {inventory.length} / 100 SLOTS — {state.gp.toLocaleString()} GP
            </div>
            <div className="h-1 w-1 bg-[#141414]/20 rounded-full" />
            <div className="text-xs font-mono text-amber-700 font-bold uppercase tracking-widest">
              HOARD VALUE: {totalValue.toLocaleString()} GP
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'equipment', 'resources', 'consumables', 'rare'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all border ${
                filter === f ? 'bg-[#141414] text-[#E4E3E0] border-[#141414]' : 'border-[#141414]/20 hover:border-[#141414]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Equipment Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2">Equipment</h3>
          <div className="grid grid-cols-3 gap-4 max-w-[300px] mx-auto">
            <div className="col-start-2">
              <Slot slot="head" itemId={state.equipment?.head} onUnequip={() => unequipItem('head')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-2">
              <Slot slot="neck" itemId={state.equipment?.neck} onUnequip={() => unequipItem('neck')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-1">
              <Slot slot="hands" itemId={state.equipment?.hands} onUnequip={() => unequipItem('hands')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-2">
              <Slot slot="body" itemId={state.equipment?.body} onUnequip={() => unequipItem('body')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-3">
              <Slot slot="ring" itemId={state.equipment?.ring} onUnequip={() => unequipItem('ring')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-1">
              <Slot slot="weapon" itemId={state.equipment?.weapon} onUnequip={() => unequipItem('weapon')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-2">
              <Slot slot="legs" itemId={state.equipment?.legs} onUnequip={() => unequipItem('legs')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-3">
              <Slot slot="shield" itemId={state.equipment?.shield} onUnequip={() => unequipItem('shield')} onSelect={setSelectedItemId} />
            </div>
            <div className="col-start-2">
              <Slot slot="feet" itemId={state.equipment?.feet} onUnequip={() => unequipItem('feet')} onSelect={setSelectedItemId} />
            </div>
          </div>

          {/* Active Edicts Section */}
          <div className="mt-12 space-y-6">
            <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2">Active Edicts</h3>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => {
                const edictId = (state.activeEdicts || [])[i];
                const edict = edictId ? ITEMS[edictId] : null;
                return (
                  <div 
                    key={`edict-${i}`}
                    onClick={() => edictId && setSelectedItemId(edictId)}
                    className={`aspect-square border border-[#141414] flex flex-col items-center justify-center p-2 relative group transition-all cursor-pointer ${edict ? 'bg-[#141414] text-[#E4E3E0]' : 'opacity-20 border-dashed'}`}
                  >
                    {edict ? (
                      <>
                        <div className="text-2xl">{edict.icon}</div>
                        <div className="text-[8px] font-mono uppercase tracking-widest text-center mt-1">{edict.name}</div>
                      </>
                    ) : (
                      <div className="text-[8px] font-mono uppercase tracking-widest text-center opacity-50">Empty Slot</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inventory Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2">Vault</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredInventory.map(item => {
              const itemData = ITEMS[item.itemId];
              if (!itemData) return null;

              return (
                <motion.div 
                  key={item.itemId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setSelectedItemId(item.itemId)}
                  className={`group border border-[#141414] p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all cursor-pointer relative ${selectedItemId === item.itemId ? 'bg-[#141414] text-[#E4E3E0] ring-2 ring-inset ring-[#E4E3E0]/30' : ''} ${
                    itemData.rarity === 'celestial' ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]' :
                    itemData.rarity === 'legendary' ? 'border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 
                    itemData.rarity === 'epic' ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                    itemData.rarity === 'rare' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 
                    itemData.rarity === 'uncommon' ? 'border-green-500' : ''
                  }`}
                >
                  <div className="text-4xl drop-shadow-sm">{itemData.icon}</div>
                  <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest text-center truncate w-full">
                    {itemData.name}
                  </div>
                  <div className={`absolute top-2 right-2 text-xs font-mono font-bold ${
                    itemData.rarity === 'celestial' ? 'text-cyan-500' :
                    itemData.rarity === 'legendary' ? 'text-purple-500' : 
                    itemData.rarity === 'epic' ? 'text-red-500' :
                    itemData.rarity === 'rare' ? 'text-blue-500' : 
                    itemData.rarity === 'uncommon' ? 'text-green-500' : ''
                  }`}>
                    {item.quantity.toLocaleString()}
                  </div>
                </motion.div>
              );
            })}

            {Array.from({ length: Math.max(0, 18 - filteredInventory.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="border border-[#141414]/10 p-4 flex items-center justify-center opacity-20 grayscale">
                <div className="w-8 h-8 rounded-full border border-dashed border-[#141414]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItemId(null)}
              className="fixed inset-0 bg-[#141414]/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#E4E3E0]/95 backdrop-blur-md border border-[#141414] shadow-2xl z-50 overflow-hidden"
            >
              <div className="relative">
                <button 
                  onClick={() => setSelectedItemId(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors z-10"
                >
                  ✕
                </button>

                <div className="flex flex-col items-center text-center space-y-4 p-8 bg-[#141414] text-[#E4E3E0]">
                  <div className="text-7xl drop-shadow-lg">{selectedItem.icon}</div>
                  <div>
                    <h4 className="text-3xl font-serif italic font-bold tracking-tight">{selectedItem.name}</h4>
                    <p className="text-[10px] font-mono opacity-50 uppercase tracking-widest mt-1">{selectedItem.type}</p>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-2">Description</div>
                    <p className="text-base font-serif italic leading-relaxed">{selectedItem.description}</p>
                  </div>

                  {selectedItem.stats && (
                    <div>
                      <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-2">Attributes</div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        {Object.entries(selectedItem.stats).map(([stat, val]) => (
                          <div key={stat} className="text-xs font-mono uppercase tracking-widest flex justify-between border-b border-[#141414]/10 pb-1">
                            <span className="opacity-70">{stat}</span>
                            <span className="font-bold text-emerald-800">+{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.setBonus && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
                      <div className="text-[10px] font-mono text-amber-800 uppercase tracking-widest mb-1">Set Bonus: {selectedItem.setBonus.setId}</div>
                      <div className="text-xs text-amber-900 italic">
                        Requires {selectedItem.setBonus.piecesRequired} pieces.
                        <div className="mt-1 font-bold">
                          {Object.entries(selectedItem.setBonus.bonus).map(([stat, val]) => (
                            <span key={stat} className="mr-2">+{val} {stat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {(selectedItem.skillHint || selectedItem.farmHint || selectedItem.usageHint) && (
                    <div className="p-5 bg-[#141414]/5 border border-[#141414]/10 space-y-4 rounded-sm">
                      {selectedItem.skillHint && (
                        <div>
                          <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Skill Focus</div>
                          <div className="text-xs font-bold uppercase tracking-tight">{selectedItem.skillHint}</div>
                        </div>
                      )}
                      {selectedItem.farmHint && (
                        <div>
                          <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Provenance</div>
                          <div className="text-xs font-bold italic">"{selectedItem.farmHint}"</div>
                        </div>
                      )}
                      {selectedItem.usageHint && (
                        <div>
                          <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Imperial Insight</div>
                          <div className="text-xs italic opacity-80 leading-snug">{selectedItem.usageHint}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-4 space-y-3">
                    {selectedItem.type === 'equipment' && selectedInventoryItem && (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => {
                            equipItem(selectedItem.id);
                            setSelectedItemId(null);
                          }}
                          className="py-4 bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90 text-xs font-mono uppercase tracking-widest transition-all shadow-lg"
                        >
                          Equip Item
                        </button>
                        <button 
                          onClick={() => handleSalvage(selectedItem, 1)}
                          className="py-4 border border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white text-xs font-mono uppercase tracking-widest transition-all"
                        >
                          Salvage (Essence)
                        </button>
                      </div>
                    )}

                    {selectedItem.type === 'potion' && selectedInventoryItem && (
                      <button 
                        onClick={() => handleUsePotion(selectedItem)}
                        className="w-full py-4 bg-emerald-800 text-white hover:bg-emerald-700 text-xs font-mono uppercase tracking-widest transition-all shadow-lg"
                      >
                        Consume Potion
                      </button>
                    )}

                    {selectedItem.type === 'edict' && (
                      <button 
                        onClick={() => toggleEdict(selectedItem.id)}
                        className="w-full py-4 bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90 text-xs font-mono uppercase tracking-widest transition-all shadow-lg"
                      >
                        {(state.activeEdicts || []).includes(selectedItem.id) ? 'Deactivate Edict' : 'Activate Edict'}
                      </button>
                    )}

                    {selectedInventoryItem && (
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleSell(selectedItem, 1)}
                          className="py-3 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest transition-all"
                        >
                          Sell 1 ({(selectedItem?.value || 0)} GP)
                        </button>
                        <button 
                          onClick={() => handleSell(selectedItem, selectedInventoryItem.quantity)}
                          className="py-3 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest transition-all"
                        >
                          Sell All ({(selectedItem?.value || 0) * selectedInventoryItem.quantity} GP)
                        </button>
                      </div>
                    )}

                    {isEquipped && (
                      <button 
                        onClick={() => {
                          const slot = Object.keys(state.equipment).find(key => state.equipment[key as keyof typeof state.equipment] === selectedItem.id);
                          if (slot) unequipItem(slot);
                          setSelectedItemId(null);
                        }}
                        className="w-full py-4 border border-red-900 text-red-900 hover:bg-red-900 hover:text-white text-xs font-mono uppercase tracking-widest transition-all"
                      >
                        Unequip Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Slot({ slot, itemId, onUnequip, onSelect }: { slot: string; itemId?: string; onUnequip: () => void; onSelect: (id: string) => void }) {
  const item = itemId ? ITEMS[itemId] : null;
  return (
    <div 
      onClick={() => itemId && onSelect(itemId)}
      className={`aspect-square border border-[#141414] flex flex-col items-center justify-center p-2 relative group transition-all cursor-pointer ${item ? 'bg-[#141414] text-[#E4E3E0]' : 'opacity-20 border-dashed'}`}
    >
      <div className="text-2xl">{item ? item.icon : '◌'}</div>
      <div className="text-[8px] font-mono uppercase tracking-widest text-center mt-1">{item ? item.name : slot}</div>
      {item && (
        <div className="absolute inset-0 bg-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  );
}
