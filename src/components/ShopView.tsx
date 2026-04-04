import React from 'react';
import { motion } from 'motion/react';
import { ITEMS } from '../constants';
import { PlayerState } from '../types';

interface ShopViewProps {
  state: PlayerState;
  addToInventory: (itemId: string, quantity: number) => void;
  removeFromInventory: (itemId: string, quantity: number) => void;
  addGp: (amount: number) => void;
}

const SHOP_ITEMS = [
  { itemId: 'vial_of_water', price: 10, currency: 'gp' },
  { itemId: 'raw_shrimp', price: 10, currency: 'gp' },
  { itemId: 'raw_meat', price: 15, currency: 'gp' },
  { itemId: 'potato_seeds', price: 5, currency: 'gp' },
  { itemId: 'onion_seeds', price: 15, currency: 'gp' },
  { itemId: 'herb_seeds', price: 50, currency: 'gp' },
  { itemId: 'willow_seeds', price: 250, currency: 'gp' },
  { itemId: 'toadflax_seeds', price: 100, currency: 'gp' },
  { itemId: 'yew_seeds', price: 1000, currency: 'gp' },
  { itemId: 'magic_seeds', price: 5000, currency: 'gp' },
  { itemId: 'feathers', price: 2, currency: 'gp' },
];

const GRACEFUL_ITEMS = [
  { itemId: 'graceful_hood', price: 35, currency: 'mark_of_grace' },
  { itemId: 'graceful_cape', price: 40, currency: 'mark_of_grace' },
  { itemId: 'graceful_top', price: 55, currency: 'mark_of_grace' },
  { itemId: 'graceful_legs', price: 60, currency: 'mark_of_grace' },
  { itemId: 'graceful_gloves', price: 30, currency: 'mark_of_grace' },
  { itemId: 'graceful_boots', price: 40, currency: 'mark_of_grace' },
];

const SPECIAL_ITEMS = [
  { itemId: 'dragon_slayer_blade', price: 500000, currency: 'gp' },
  { itemId: 'imperial_crown', price: 100, currency: 'imperial_seal' },
  { itemId: 'raid_master_cape', price: 50, currency: 'raid_relic' },
  { itemId: 'edict_efficiency', price: 50000, currency: 'gp' },
  { itemId: 'edict_prosperity', price: 50000, currency: 'gp' },
  { itemId: 'edict_wisdom', price: 50000, currency: 'gp' },
  { itemId: 'edict_martial_law', price: 75000, currency: 'gp' },
];

export function ShopView({ state, addToInventory, removeFromInventory, addGp }: ShopViewProps) {
  const buyItem = (itemId: string, price: number, currency: string = 'gp') => {
    if (currency === 'gp') {
      if (state.gp >= price) {
        addGp(-price);
        addToInventory(itemId, 1);
      }
    } else {
      const inv = state.inventory.find(i => i.itemId === currency);
      if (inv && inv.quantity >= price) {
        removeFromInventory(currency, price);
        addToInventory(itemId, 1);
      }
    }
  };

  const sellItem = (itemId: string, quantity: number) => {
    const itemData = ITEMS[itemId];
    if (!itemData) return;
    
    const sellPrice = Math.floor(itemData.value * 0.5); // Sell for 50% value
    removeFromInventory(itemId, quantity);
    addGp(sellPrice * quantity);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between border-b border-[#141414] pb-4">
        <div>
          <h2 className="text-4xl font-serif italic font-bold tracking-tight capitalize">Imperial Merchant</h2>
          <div className="text-xs font-mono opacity-50 uppercase tracking-widest mt-1">
            TREASURY: {state.gp.toLocaleString()} GP
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Buy Section */}
        <div className="space-y-12">
          <div className="space-y-6">
            <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2">Supplies</h3>
            <div className="grid grid-cols-1 gap-4">
              {SHOP_ITEMS.map(item => {
                const itemData = ITEMS[item.itemId];
                if (!itemData) return null;
                return (
                  <div key={item.itemId} className="border border-[#141414] p-4 flex items-center justify-between hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{itemData.icon}</div>
                      <div>
                        <div className="font-serif italic font-bold">{itemData.name}</div>
                        <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{item.price} GP</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => buyItem(item.itemId, item.price, item.currency)}
                      disabled={state.gp < item.price}
                      className="px-4 py-2 border border-[#141414] group-hover:border-[#E4E3E0] text-xs font-mono uppercase tracking-widest disabled:opacity-30"
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2 text-blue-700">Graceful Gear</h3>
            <div className="grid grid-cols-1 gap-4">
              {GRACEFUL_ITEMS.map(item => {
                const itemData = ITEMS[item.itemId];
                if (!itemData) return null;
                const currencyData = ITEMS[item.currency];
                const inv = state.inventory.find(i => i.itemId === item.currency);
                const hasEnough = inv && inv.quantity >= item.price;
                
                return (
                  <div key={item.itemId} className="border border-blue-700/30 p-4 flex items-center justify-between hover:bg-blue-900 hover:text-[#E4E3E0] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{itemData.icon}</div>
                      <div>
                        <div className="font-serif italic font-bold">{itemData.name}</div>
                        <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                          {item.price} {currencyData?.name || item.currency}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => buyItem(item.itemId, item.price, item.currency)}
                      disabled={!hasEnough}
                      className="px-4 py-2 border border-blue-700/50 group-hover:border-[#E4E3E0] text-xs font-mono uppercase tracking-widest disabled:opacity-30"
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2 text-red-700">Imperial Relics</h3>
            <div className="grid grid-cols-1 gap-4">
              {SPECIAL_ITEMS.map(item => {
                const itemData = ITEMS[item.itemId];
                if (!itemData) return null;
                const currencyData = item.currency === 'gp' ? { name: 'GP', icon: '💰' } : ITEMS[item.currency];
                const inv = state.inventory.find(i => i.itemId === item.currency);
                const hasEnough = item.currency === 'gp' ? state.gp >= item.price : (inv && inv.quantity >= item.price);
                
                return (
                  <div key={item.itemId} className="border border-red-700/30 p-4 flex items-center justify-between hover:bg-red-900 hover:text-[#E4E3E0] transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{itemData.icon}</div>
                      <div>
                        <div className="font-serif italic font-bold">{itemData.name}</div>
                        <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                          {item.price} {currencyData?.name || item.currency}
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => buyItem(item.itemId, item.price, item.currency)}
                      disabled={!hasEnough}
                      className="px-4 py-2 border border-red-700/50 group-hover:border-[#E4E3E0] text-xs font-mono uppercase tracking-widest disabled:opacity-30"
                    >
                      Buy
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sell Section */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2">Inventory</h3>
          <div className="grid grid-cols-1 gap-4">
            {state.inventory.length === 0 && (
              <div className="text-sm font-serif italic opacity-50">Your inventory is empty.</div>
            )}
            {state.inventory.map(item => {
              const itemData = ITEMS[item.itemId];
              if (!itemData) return null;
              const sellPrice = Math.floor(itemData.value * 0.5);
              return (
                <div key={item.itemId} className="border border-[#141414] p-4 flex items-center justify-between hover:bg-[#141414] hover:text-[#E4E3E0] transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{itemData.icon}</div>
                    <div>
                      <div className="font-serif italic font-bold">{itemData.name} (x{item.quantity})</div>
                      <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">SELLS FOR {sellPrice} GP</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => sellItem(item.itemId, 1)}
                      className="px-3 py-1 border border-[#141414] group-hover:border-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest"
                    >
                      Sell 1
                    </button>
                    <button 
                      onClick={() => sellItem(item.itemId, item.quantity)}
                      className="px-3 py-1 border border-[#141414] group-hover:border-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest"
                    >
                      Sell All
                    </button>
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
