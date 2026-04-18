import React, { useState } from 'react';
import { ClassId, GameState } from '../types';
import { CLASSES } from '../data/classes';
import { ITEMS } from '../data/items';

interface Props {
  state: GameState;
  recruitHero: (classId: ClassId) => void;
  buyShopItem: (itemId: string) => void;
  reviveHero: (heroId: string) => void;
  healParty: () => void;
  resetGame: () => void;
}

const SHOP_STOCK = [
  'healing_potion',
  'greater_healing_potion',
  'mana_potion',
  'elixir_of_life',
  'iron_sword',
  'leather_vest',
  'iron_helm',
  'leather_boots',
  'wooden_shield',
  'oak_staff',
  'short_bow',
  'iron_dagger',
  'lucky_charm',
];

export const TownView: React.FC<Props> = ({ state, recruitHero, buyShopItem, reviveHero, healParty, resetGame }) => {
  const [section, setSection] = useState<'tavern' | 'shop' | 'temple' | 'inn' | 'about'>('tavern');

  return (
    <div className="p-4 h-full overflow-hidden flex flex-col">
      <h2 className="text-2xl font-bold text-[#F2E6A8] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
        🏰 The Town
      </h2>
      <div className="text-xs text-[#B8A890] mb-4">
        Rest, recruit, trade, and prepare for the next expedition.
      </div>
      <div className="flex border-b border-[#3D3328] mb-3">
        {(['tavern', 'shop', 'temple', 'inn', 'about'] as const).map(s => (
          <button key={s} onClick={() => setSection(s)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest ${section === s ? 'text-[#F2E6A8] border-b-2 border-[#D4A943]' : 'text-[#7A6E60] hover:text-[#B8A890]'}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {s}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {section === 'tavern' && <Tavern state={state} recruitHero={recruitHero} />}
        {section === 'shop' && <Shop state={state} buyShopItem={buyShopItem} />}
        {section === 'temple' && <Temple state={state} reviveHero={reviveHero} />}
        {section === 'inn' && <Inn state={state} healParty={healParty} />}
        {section === 'about' && <About resetGame={resetGame} state={state} />}
      </div>
    </div>
  );
};

const Tavern: React.FC<{ state: GameState; recruitHero: (id: ClassId) => void }> = ({ state, recruitHero }) => {
  return (
    <div className="space-y-4">
      <div className="text-sm text-[#B8A890]">
        Recruit new heroes. Max 4 active at once — the rest wait on the bench.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.values(CLASSES).map(c => {
          const have = state.heroes.filter(h => h.classId === c.id).length;
          const cost = c.recruitCost + have * 150;
          return (
            <div key={c.id}
                 className="p-3 rounded-lg border"
                 style={{ background: c.color + '10', borderColor: c.color + '40' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{c.icon}</span>
                <div className="flex-1">
                  <div className="text-lg font-bold" style={{ color: c.color, fontFamily: "'Cinzel', serif" }}>{c.name}</div>
                  <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {c.role}
                  </div>
                </div>
                <div className="text-xs text-[#D4A943] font-bold">{have} in roster</div>
              </div>
              <p className="text-xs text-[#B8A890] mb-3">{c.description}</p>
              <button
                onClick={() => recruitHero(c.id)}
                disabled={state.stash.gold < cost}
                className={`w-full py-2 text-xs font-bold rounded ${state.stash.gold >= cost ? 'bg-[#D4A943] hover:bg-[#e5bb55] text-black' : 'bg-[#1E1A16] text-[#7A6E60] cursor-not-allowed'}`}>
                {cost === 0 && have === 0 ? 'Recruit (free)' : `Recruit (${cost} gp)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Shop: React.FC<{ state: GameState; buyShopItem: (id: string) => void }> = ({ state, buyShopItem }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
      {SHOP_STOCK.map(id => {
        const it = ITEMS[id];
        if (!it) return null;
        const canAfford = state.stash.gold >= it.value;
        return (
          <div key={id}
               className="p-2 rounded border"
               style={{ background: '#14100C', borderColor: rarityColor(it.rarity) + '60' }}>
            <div className="flex gap-2 items-start">
              <span className="text-2xl">{it.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: rarityColor(it.rarity) }}>{it.name}</div>
                <div className="text-[9px] text-[#7A6E60] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {it.type}
                </div>
              </div>
            </div>
            {it.description && <div className="text-[10px] text-[#7A6E60] italic mt-1">{it.description}</div>}
            {it.weaponPower && <div className="text-[10px] text-[#E86E6E]">+{it.weaponPower} DMG</div>}
            {it.armor && <div className="text-[10px] text-[#D4A943]">+{it.armor} ARM</div>}
            <button onClick={() => buyShopItem(id)}
                    disabled={!canAfford}
                    className={`w-full mt-2 text-[10px] py-1 rounded ${canAfford ? 'bg-[#D4A943] text-black hover:bg-[#e5bb55]' : 'bg-[#1E1A16] text-[#7A6E60] cursor-not-allowed'}`}>
              Buy {it.value} gp
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Temple: React.FC<{ state: GameState; reviveHero: (id: string) => void }> = ({ state, reviveHero }) => {
  const dead = state.heroes.filter(h => h.state !== 'alive');
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#B8A890]">Revive fallen heroes. Cost scales with their level.</p>
      {dead.length === 0 && (
        <div className="text-sm text-[#7FE2A0]">All heroes are in fighting shape. 🙏</div>
      )}
      {dead.map(h => {
        const c = CLASSES[h.classId];
        const cost = 100 + h.level * 20;
        return (
          <div key={h.id} className="flex items-center gap-3 p-3 bg-[#14100C] rounded border border-[#3D3328]">
            <span className="text-2xl">{c.icon}</span>
            <div className="flex-1">
              <div className="font-bold" style={{ color: c.color }}>{h.name}</div>
              <div className="text-[10px] text-[#7A6E60]">L{h.level} {c.name}</div>
            </div>
            <button onClick={() => reviveHero(h.id)}
                    disabled={state.stash.gold < cost}
                    className={`px-3 py-1.5 text-xs rounded font-bold ${state.stash.gold >= cost ? 'bg-[#7FE2A0] text-black hover:bg-[#5fc085]' : 'bg-[#1E1A16] text-[#7A6E60]'}`}>
              Revive ({cost} gp)
            </button>
          </div>
        );
      })}
    </div>
  );
};

const Inn: React.FC<{ state: GameState; healParty: () => void }> = ({ state, healParty }) => {
  const cost = state.heroes.filter(h => !h.bench && h.state === 'alive').reduce((a, h) => a + Math.floor((h.maxHp - h.hp) * 0.5 + (h.maxMp - h.mp) * 0.3), 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-[#B8A890]">Rest the party. Full HP and MP for your active roster.</p>
      <div className="p-4 bg-[#14100C] border border-[#3D3328] rounded flex items-center gap-3">
        <span className="text-3xl">🛌</span>
        <div className="flex-1">
          <div className="font-bold text-[#F2E6A8]">The Tired Hound</div>
          <div className="text-xs text-[#7A6E60]">Warm fire. Hearty stew.</div>
        </div>
        <button onClick={healParty}
                disabled={cost === 0 || state.stash.gold < cost}
                className={`px-4 py-2 text-xs font-bold rounded ${cost > 0 && state.stash.gold >= cost ? 'bg-[#7FE2A0] text-black hover:bg-[#5fc085]' : 'bg-[#1E1A16] text-[#7A6E60]'}`}>
          {cost === 0 ? 'Nothing to heal' : `Rest (${cost} gp)`}
        </button>
      </div>
    </div>
  );
};

const About: React.FC<{ resetGame: () => void; state: GameState }> = ({ resetGame, state }) => {
  const minutes = Math.floor(state.totalPlaytime / 60000);
  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-[#B8A890]">
        A party-based idle RPG. Your heroes explore dungeons autonomously — you equip them, level them, and make the key
        decisions. Inspired by Clickpocalypse II.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Stat k="Playtime" v={`${minutes} min`} />
        <Stat k="Monsters Killed" v={state.totalMonstersKilled.toLocaleString()} />
        <Stat k="Gold Earned" v={state.totalGoldEarned.toLocaleString()} />
        <Stat k="Collection Log" v={`${state.collectionLog.length} items`} />
        <Stat k="Active Heroes" v={state.heroes.filter(h => !h.bench).length + ' / 4'} />
        <Stat k="Dungeons Unlocked" v={String(state.unlockedDungeons.length)} />
      </div>
      <div className="pt-4 border-t border-[#3D3328]">
        <div className="text-xs text-[#7A6E60] mb-2">Danger zone</div>
        <button onClick={resetGame}
                className="px-3 py-1.5 text-xs text-[#E86E6E] border border-[#E86E6E]/50 rounded hover:bg-[#E86E6E]/10">
          Reset Save (delete everything)
        </button>
      </div>
    </div>
  );
};

const Stat: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="p-3 bg-[#14100C] border border-[#3D3328] rounded">
    <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{k}</div>
    <div className="text-lg font-bold text-[#F2E6A8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
  </div>
);

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
