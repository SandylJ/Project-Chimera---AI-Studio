import React from 'react';
import { motion } from 'motion/react';
import { ITEMS } from '../constants';
import { PlayerState } from '../types';
import { playButtonPress, playSuccess, playSellItem } from '../sounds';

interface ShopViewProps { state: PlayerState; addToInventory: (itemId: string, quantity: number) => void; removeFromInventory: (itemId: string, quantity: number) => void; addGp: (amount: number) => void; }

const SHOP_ITEMS = [
  { itemId: 'vial_of_water', price: 10, currency: 'gp' }, { itemId: 'raw_shrimp', price: 10, currency: 'gp' },
  { itemId: 'raw_meat', price: 15, currency: 'gp' }, { itemId: 'potato_seeds', price: 5, currency: 'gp' },
  { itemId: 'onion_seeds', price: 15, currency: 'gp' }, { itemId: 'herb_seeds', price: 50, currency: 'gp' },
  { itemId: 'willow_seeds', price: 250, currency: 'gp' }, { itemId: 'toadflax_seeds', price: 100, currency: 'gp' },
  { itemId: 'yew_seeds', price: 1000, currency: 'gp' }, { itemId: 'magic_seeds', price: 5000, currency: 'gp' },
  { itemId: 'feathers', price: 2, currency: 'gp' },
];
const GRACEFUL_ITEMS = [
  { itemId: 'graceful_hood', price: 35, currency: 'mark_of_grace' }, { itemId: 'graceful_cape', price: 40, currency: 'mark_of_grace' },
  { itemId: 'graceful_top', price: 55, currency: 'mark_of_grace' }, { itemId: 'graceful_legs', price: 60, currency: 'mark_of_grace' },
  { itemId: 'graceful_gloves', price: 30, currency: 'mark_of_grace' }, { itemId: 'graceful_boots', price: 40, currency: 'mark_of_grace' },
];
const CONSUMABLES = [
  { itemId: 'cooked_trout', price: 100, currency: 'gp' }, { itemId: 'cooked_lobster', price: 500, currency: 'gp' },
  { itemId: 'cooked_swordfish', price: 1500, currency: 'gp' }, { itemId: 'cooked_shark', price: 5000, currency: 'gp' },
  { itemId: 'cooked_mantaray', price: 15000, currency: 'gp' },
  { itemId: 'prayer_potion', price: 8000, currency: 'gp' }, { itemId: 'antipoison', price: 3000, currency: 'gp' },
  { itemId: 'bones', price: 25, currency: 'gp' }, { itemId: 'big_bones', price: 100, currency: 'gp' },
  { itemId: 'dragon_bones', price: 2500, currency: 'gp' },
];
const TOOLS = [
  // Axes
  { itemId: 'bronze_axe', price: 100, currency: 'gp' }, { itemId: 'iron_axe', price: 500, currency: 'gp' },
  { itemId: 'steel_axe', price: 2000, currency: 'gp' }, { itemId: 'mithril_axe', price: 8000, currency: 'gp' },
  { itemId: 'adamant_axe', price: 25000, currency: 'gp' }, { itemId: 'rune_axe', price: 100000, currency: 'gp' },
  // Pickaxes
  { itemId: 'bronze_pickaxe', price: 100, currency: 'gp' }, { itemId: 'iron_pickaxe', price: 500, currency: 'gp' },
  { itemId: 'steel_pickaxe', price: 2000, currency: 'gp' }, { itemId: 'mithril_pickaxe', price: 8000, currency: 'gp' },
  { itemId: 'adamant_pickaxe', price: 25000, currency: 'gp' }, { itemId: 'rune_pickaxe', price: 100000, currency: 'gp' },
  // Fishing
  { itemId: 'small_fishing_net', price: 50, currency: 'gp' }, { itemId: 'fishing_rod', price: 150, currency: 'gp' },
  { itemId: 'harpoon', price: 500, currency: 'gp' },
  // Utility
  { itemId: 'tinderbox', price: 50, currency: 'gp' }, { itemId: 'hammer', price: 50, currency: 'gp' },
  { itemId: 'chisel', price: 50, currency: 'gp' }, { itemId: 'needle', price: 10, currency: 'gp' },
];
const SPECIAL_ITEMS = [
  { itemId: 'dragon_slayer_blade', price: 500000, currency: 'gp' }, { itemId: 'imperial_crown', price: 100, currency: 'imperial_seal' },
  { itemId: 'raid_master_cape', price: 50, currency: 'raid_relic' }, { itemId: 'edict_efficiency', price: 50000, currency: 'gp' },
  { itemId: 'edict_prosperity', price: 50000, currency: 'gp' }, { itemId: 'edict_wisdom', price: 50000, currency: 'gp' },
  { itemId: 'edict_martial_law', price: 75000, currency: 'gp' },
];

export function ShopView({ state, addToInventory, removeFromInventory, addGp }: ShopViewProps) {
  const buyItem = (itemId: string, price: number, currency: string = 'gp') => {
    if (currency === 'gp') { if (state.gp >= price) { playSuccess(); addGp(-price); addToInventory(itemId, 1); } }
    else { const inv = state.inventory.find(i => i.itemId === currency); if (inv && inv.quantity >= price) { playSuccess(); removeFromInventory(currency, price); addToInventory(itemId, 1); } }
  };
  const sellItem = (itemId: string, quantity: number) => { const itemData = ITEMS[itemId]; if (!itemData) return; playSellItem(); removeFromInventory(itemId, quantity); addGp(Math.floor(itemData.value * 0.5) * quantity); };

  const renderShopSection = (title: string, items: typeof SHOP_ITEMS, accentBorder?: string) => (
    <div className="space-y-6">
      <h3 className={`text-xl font-bold border-b pb-2 ${accentBorder || 'border-[#3D3328]'}`} style={{ fontFamily: "'Cinzel', serif" }}>{title}</h3>
      <div className="grid grid-cols-1 gap-3">
        {items.map(item => {
          const itemData = ITEMS[item.itemId]; if (!itemData) return null;
          const currencyData = item.currency === 'gp' ? { name: 'GP' } : ITEMS[item.currency];
          const inv = state.inventory.find(i => i.itemId === item.currency);
          const hasEnough = item.currency === 'gp' ? state.gp >= item.price : (inv && inv.quantity >= item.price);
          return (
            <div key={item.itemId} className="card p-4 flex items-center justify-between hover:bg-[#2A2520] hover:border-[#D4A943]/30 transition-all group">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{itemData.icon}</div>
                <div>
                  <div className="font-bold">{itemData.name}</div>
                  <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.price} {currencyData?.name || item.currency}</div>
                </div>
              </div>
              <button onClick={() => buyItem(item.itemId, item.price, item.currency)} disabled={!hasEnough}
                className="keycap keycap-sm text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Buy</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-[#3D3328] pb-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight capitalize" style={{ fontFamily: "'Cinzel', serif" }}>Imperial Merchant</h2>
          <div className="text-xs text-[#7A6E60] uppercase tracking-widest mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>TREASURY: {state.gp.toLocaleString()} GP</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-12">
          {renderShopSection('Supplies', SHOP_ITEMS)}
          {renderShopSection('Tools & Equipment', TOOLS, 'border-amber-800 text-amber-400')}
          {renderShopSection('Consumables & Bones', CONSUMABLES, 'border-green-800 text-green-400')}
          {renderShopSection('Graceful Gear', GRACEFUL_ITEMS, 'border-blue-800 text-blue-400')}
          {renderShopSection('Imperial Relics', SPECIAL_ITEMS, 'border-red-800 text-red-400')}
        </div>
        <div className="space-y-6">
          <h3 className="text-xl font-bold border-b border-[#3D3328] pb-2" style={{ fontFamily: "'Cinzel', serif" }}>Inventory</h3>
          <div className="grid grid-cols-1 gap-3">
            {state.inventory.length === 0 && <div className="text-sm text-[#7A6E60] italic">Your inventory is empty.</div>}
            {state.inventory.map(item => {
              const itemData = ITEMS[item.itemId]; if (!itemData) return null;
              return (
                <div key={item.itemId} className="card p-4 flex items-center justify-between hover:bg-[#2A2520] hover:border-[#D4A943]/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{itemData.icon}</div>
                    <div>
                      <div className="font-bold">{itemData.name} (x{item.quantity})</div>
                      <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SELLS FOR {Math.floor(itemData.value * 0.5)} GP</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => sellItem(item.itemId, 1)} className="keycap keycap-sm text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sell 1</button>
                    <button onClick={() => sellItem(item.itemId, item.quantity)} className="keycap keycap-sm text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Sell All</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
