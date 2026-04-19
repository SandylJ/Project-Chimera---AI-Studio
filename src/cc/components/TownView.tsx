import React, { useState } from 'react';
import { BlessingId, Bounty, ClassId, EquipSlot, GameState, Hero } from '../types';
import { CLASSES } from '../data/classes';
import { ITEMS } from '../data/items';
import { enchantCost, enchantTier, MAX_ENCHANT, blessingLevel, blessingCost, blessingBonus } from '../engine/util';
import { ClassSprite } from '../visuals/sprites';
import { bountyProgress } from '../useGame';

interface Props {
  state: GameState;
  recruitHero: (classId: ClassId) => void;
  buyShopItem: (itemId: string) => void;
  buyShopBundle: (bundleId: string) => void;
  reviveHero: (heroId: string) => void;
  healParty: () => void;
  resetGame: () => void;
  upgradeEquip: (heroId: string, slot: EquipSlot) => void;
  buyBlessing: (id: BlessingId) => void;
  claimBounty: (id: string) => void;
}

const STATIC_STOCK = [
  'healing_potion',
  'greater_healing_potion',
  'mana_potion',
  'elixir_of_life',
];

export const TownView: React.FC<Props> = ({
  state, recruitHero, buyShopItem, buyShopBundle, reviveHero, healParty, resetGame,
  upgradeEquip, buyBlessing, claimBounty,
}) => {
  const [section, setSection] = useState<'tavern' | 'shop' | 'blacksmith' | 'shrine' | 'bounties' | 'temple' | 'inn' | 'about'>('shop');

  return (
    <div className="p-4 h-full overflow-hidden flex flex-col">
      <h2 className="text-2xl font-bold text-[#F2E6A8] mb-1" style={{ fontFamily: "'Cinzel', serif" }}>
        🏰 The Town
      </h2>
      <div className="text-xs text-[#B8A890] mb-3">
        Rest, recruit, trade, upgrade, and prepare for the next expedition.
      </div>
      <div className="flex border-b border-[#3D3328] mb-3 flex-wrap">
        {(['shop', 'blacksmith', 'shrine', 'bounties', 'tavern', 'temple', 'inn', 'about'] as const).map(s => {
          const label: Record<typeof s, string> = {
            shop: '🛒 Shop',
            blacksmith: '🔨 Blacksmith',
            shrine: '⟡ Shrine',
            bounties: '🎯 Bounties',
            tavern: '🍺 Tavern',
            temple: '⛪ Temple',
            inn: '🛌 Inn',
            about: 'ℹ About',
          } as any;
          const unclaimedComplete = s === 'bounties' &&
            (state.bountyBoard?.bounties.some(b => !b.claimed && bountyProgress(state, b) >= b.target) ?? false);
          const isActive = section === s;
          return (
            <button key={s} type="button" onClick={() => setSection(s)}
                    className={`press relative px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                      isActive
                        ? 'text-[#0a0806] font-black'
                        : 'text-[#B8A890] hover:bg-[#2B2B32] hover:text-[#E8E0D4]'
                    }`}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: isActive ? 'var(--cc-blue)' : '#14100C',
                      border: `1px solid ${isActive ? 'var(--cc-blue)' : '#2B2B32'}`,
                      borderBottom: isActive ? '1px solid var(--cc-blue)' : '1px solid transparent',
                      borderRadius: 2,
                      marginBottom: -1,
                    }}>
              {label[s]}
              {unclaimedComplete && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7FE2A0]"
                      style={{ boxShadow: '0 0 6px #7FE2A0', animation: 'glowPulse 1.4s ease-in-out infinite', ['--glow' as any]: '#7FE2A0' }} />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-y-auto pr-1">
        {section === 'tavern' && <Tavern state={state} recruitHero={recruitHero} />}
        {section === 'shop' && <Shop state={state} buyShopItem={buyShopItem} buyShopBundle={buyShopBundle} />}
        {section === 'blacksmith' && <Blacksmith state={state} upgradeEquip={upgradeEquip} />}
        {section === 'shrine' && <Shrine state={state} buyBlessing={buyBlessing} />}
        {section === 'bounties' && <Bounties state={state} claimBounty={claimBounty} />}
        {section === 'temple' && <Temple state={state} reviveHero={reviveHero} />}
        {section === 'inn' && <Inn state={state} healParty={healParty} />}
        {section === 'about' && <About resetGame={resetGame} state={state} />}
      </div>
    </div>
  );
};

/* ============ Tavern ============ */

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
                <div className="shrink-0 flex items-end justify-center rounded"
                     style={{ width: 48, height: 58, background: `linear-gradient(180deg, ${c.color}22 0%, #00000000 100%)`, border: `1px solid ${c.color}60` }}>
                  <ClassSprite classId={c.id} size={46} />
                </div>
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
                type="button"
                onClick={() => recruitHero(c.id)}
                disabled={state.stash.gold < cost}
                className={`press w-full py-2 text-xs font-bold transition-colors ${state.stash.gold >= cost ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                style={{
                  background: state.stash.gold >= cost ? 'var(--cc-blue)' : '#14100C',
                  border: `1px solid ${state.stash.gold >= cost ? 'var(--cc-blue)' : '#2B2B32'}`,
                  borderRadius: 2,
                }}>
                {cost === 0 && have === 0 ? 'Recruit (free)' : `Recruit (${cost} gp)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============ Shop ============ */

const Shop: React.FC<{
  state: GameState;
  buyShopItem: (id: string) => void;
  buyShopBundle: (id: string) => void;
}> = ({ state, buyShopItem, buyShopBundle }) => {
  const rot = state.shopRotation;
  return (
    <div className="space-y-5">
      {/* Featured rotating stock */}
      <Section title="Today's Featured Stock" subtitle="Rotates daily">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {(rot?.featured ?? []).map(id => (
            <ShopCard key={id} state={state} id={id} buy={() => buyShopItem(id)} />
          ))}
          {STATIC_STOCK.map(id => (
            <ShopCard key={id} state={state} id={id} buy={() => buyShopItem(id)} />
          ))}
        </div>
      </Section>

      {/* Bundles */}
      <Section title="Bundles" subtitle="Discounted packs for the road">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {(rot?.bundles ?? []).map(b => {
            const canAfford = state.stash.gold >= b.price;
            const sampleValue = b.items.reduce((a, [id, q]) => a + (ITEMS[id]?.value ?? 0) * q, 0);
            const savings = sampleValue - b.price;
            return (
              <div key={b.id} className="p-3 rounded border bg-[#14100C] border-[#3D3328]">
                <div className="flex items-start justify-between mb-1">
                  <div className="font-bold text-[#F2E6A8]">{b.label}</div>
                  <div className="text-[10px] text-[#7FE2A0] font-bold">save {savings}g</div>
                </div>
                <div className="text-[11px] text-[#B8A890] mb-2">
                  {b.items.map(([id, q], i) => (
                    <span key={id} className="block">· {q}× {ITEMS[id]?.icon} {ITEMS[id]?.name}</span>
                  ))}
                </div>
                <button type="button" onClick={() => buyShopBundle(b.id)}
                        disabled={!canAfford}
                        className={`press w-full text-xs py-1.5 font-bold transition-colors ${canAfford ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                        style={{
                          background: canAfford ? 'var(--cc-blue)' : '#14100C',
                          border: `1px solid ${canAfford ? 'var(--cc-blue)' : '#2B2B32'}`,
                          borderRadius: 2,
                        }}>
                  Buy ({b.price} gp)
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Scrolls */}
      <Section title="Scrolls" subtitle="One-shot effects">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {(rot?.scrolls ?? []).map(id => (
            <ShopCard key={id} state={state} id={id} buy={() => buyShopItem(id)} />
          ))}
        </div>
      </Section>
    </div>
  );
};

const ShopCard: React.FC<{ state: GameState; id: string; buy: () => void }> = ({ state, id, buy }) => {
  const it = ITEMS[id];
  if (!it) return null;
  const canAfford = state.stash.gold >= it.value;
  return (
    <div className="p-2 rounded border"
         style={{ background: '#14100C', borderColor: rarityColor(it.rarity) + '60' }}>
      <div className="flex gap-2 items-start">
        <span className="text-2xl">{it.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: rarityColor(it.rarity) }}>{it.name}</div>
          <div className="text-[9px] text-[#7A6E60] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{it.type}</div>
        </div>
      </div>
      {it.description && <div className="text-[10px] text-[#7A6E60] italic mt-1 line-clamp-2">{it.description}</div>}
      {it.weaponPower && <div className="text-[10px] text-[#E86E6E]">+{it.weaponPower} DMG</div>}
      {it.armor && <div className="text-[10px] text-[#D4A943]">+{it.armor} ARM</div>}
      <button type="button" onClick={buy}
              disabled={!canAfford}
              className={`press w-full mt-2 text-[10px] py-1 transition-colors ${canAfford ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
              style={{
                background: canAfford ? 'var(--cc-blue)' : '#14100C',
                border: `1px solid ${canAfford ? 'var(--cc-blue)' : '#2B2B32'}`,
                borderRadius: 2,
              }}>
        Buy {it.value} gp
      </button>
    </div>
  );
};

/* ============ Blacksmith ============ */

const Blacksmith: React.FC<{ state: GameState; upgradeEquip: (heroId: string, slot: EquipSlot) => void }> = ({ state, upgradeEquip }) => {
  const active = state.heroes.filter(h => !h.bench);
  const [selected, setSelected] = useState<string | null>(active[0]?.id ?? null);
  const hero = active.find(h => h.id === selected) ?? active[0];

  return (
    <div className="space-y-3">
      <div className="text-sm text-[#B8A890]">
        Spend gold and monster parts to enchant equipped gear (+1 to +{MAX_ENCHANT}).
        Each rank adds <span className="text-[#7FE2A0] font-bold">+15% power</span> to that slot.
      </div>
      {/* hero tabs */}
      <div className="flex flex-wrap gap-1">
        {active.map(h => {
          const cls = CLASSES[h.classId];
          const isSel = hero?.id === h.id;
          return (
            <button key={h.id}
                    onClick={() => setSelected(h.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded border transition-all ${isSel ? 'border-[#D4A943] bg-[#2B231B]' : 'border-[#3D3328] bg-[#14100C] hover:bg-[#1E1A16]'}`}>
              <span style={{ width: 22, height: 26, display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                <ClassSprite classId={h.classId} size={22} />
              </span>
              <span className="text-[11px] font-bold" style={{ color: cls.color }}>{h.name}</span>
            </button>
          );
        })}
      </div>
      {hero && <BlacksmithHero hero={hero} state={state} upgradeEquip={upgradeEquip} />}
    </div>
  );
};

const BlacksmithHero: React.FC<{ hero: Hero; state: GameState; upgradeEquip: (heroId: string, slot: EquipSlot) => void }> = ({ hero, state, upgradeEquip }) => {
  const slots: EquipSlot[] = ['weapon', 'offhand', 'head', 'body', 'legs', 'feet', 'neck', 'ring'];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {slots.map(slot => {
        const itemId = hero.equipment[slot];
        const item = itemId ? ITEMS[itemId] : null;
        const tier = enchantTier(hero, slot);
        const cost = itemId ? enchantCost(hero, slot) : null;
        const canAfford = cost && state.stash.gold >= cost.gold
          && cost.materials.every(m => (state.stash.items[m.id] ?? 0) >= m.qty);
        return (
          <div key={slot} className="p-2 rounded border bg-[#14100C] border-[#3D3328]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {slot}
                </div>
                {item ? (
                  <div className="text-xs font-bold truncate" style={{ color: rarityColor(item.rarity) }}>
                    {item.icon} {item.name} {tier > 0 && <span className="text-[#7FE2A0]">+{tier}</span>}
                  </div>
                ) : (
                  <div className="text-xs text-[#3D3328]">(empty)</div>
                )}
              </div>
              {tier > 0 && (
                <div className="text-[10px] text-[#7FE2A0] font-bold shrink-0"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  +{Math.round((Math.pow(1.15, tier) - 1) * 100)}%
                </div>
              )}
            </div>
            {item && cost && (
              <div className="mt-2 space-y-1">
                <div className="text-[10px] text-[#D4A943] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  → +{tier + 1}: {cost.gold.toLocaleString()}g
                </div>
                <div className="flex flex-wrap gap-1">
                  {cost.materials.map(m => {
                    const have = state.stash.items[m.id] ?? 0;
                    const ok = have >= m.qty;
                    const mi = ITEMS[m.id];
                    return (
                      <span key={m.id}
                            className={`text-[9px] px-1 py-0.5 rounded border ${ok ? 'border-[#7FE2A0]/50 text-[#7FE2A0]' : 'border-[#E86E6E]/50 text-[#E86E6E]'}`}
                            style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            title={mi?.name}>
                        {mi?.icon} {have}/{m.qty}
                      </span>
                    );
                  })}
                </div>
                <button type="button" onClick={() => upgradeEquip(hero.id, slot)}
                        disabled={!canAfford}
                        className={`press w-full text-[10px] py-1 font-bold transition-colors ${canAfford ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                        style={{
                          background: canAfford ? 'var(--cc-orange)' : '#14100C',
                          border: `1px solid ${canAfford ? 'var(--cc-orange)' : '#2B2B32'}`,
                          borderRadius: 2,
                        }}>
                  Enchant to +{tier + 1}
                </button>
              </div>
            )}
            {item && !cost && tier >= MAX_ENCHANT && (
              <div className="mt-2 text-[10px] text-[#f2c846] text-center font-bold">MAX ENCHANT</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ============ Shrine / Blessings ============ */

const BLESSINGS: Array<{ id: BlessingId; icon: string; label: string; desc: string; color: string; max: number }> = [
  { id: 'might',   icon: '⚔', label: 'Might',   desc: '+3% damage per level',           color: '#E86E6E', max: 30 },
  { id: 'warding', icon: '🛡', label: 'Warding', desc: '+3% damage reduction per level', color: '#6EA9E4', max: 30 },
  { id: 'fortune', icon: '🪙', label: 'Fortune', desc: '+4% gold drops per level',       color: '#F2B84B', max: 30 },
  { id: 'wisdom',  icon: '📖', label: 'Wisdom',  desc: '+4% XP per level',               color: '#7FE2A0', max: 30 },
  { id: 'luck',    icon: '🍀', label: 'Luck',    desc: '+2% crit/drop rate per level',   color: '#B485E8', max: 30 },
  { id: 'vigor',   icon: '💖', label: 'Vigor',   desc: '+2.5% max HP per level',         color: '#FF6EE6', max: 30 },
];

const Shrine: React.FC<{ state: GameState; buyBlessing: (id: BlessingId) => void }> = ({ state, buyBlessing }) => {
  return (
    <div className="space-y-3">
      <div className="text-sm text-[#B8A890]">
        Burn <span className="text-[#B485E8] font-bold">⟡ essence</span> collected from dungeon bosses for permanent
        party-wide bonuses. Effects apply immediately.
      </div>
      <div className="bg-[#1b1320] border border-[#B485E8]/40 rounded px-3 py-2 flex items-center gap-3">
        <span className="text-3xl">⟡</span>
        <div className="flex-1">
          <div className="text-xs uppercase text-[#B485E8] tracking-widest font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Essence
          </div>
          <div className="text-2xl font-black text-[#B485E8]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {state.stash.essence.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {BLESSINGS.map(b => {
          const lvl = blessingLevel(state, b.id);
          const cost = blessingCost(lvl);
          const maxed = lvl >= b.max;
          const canAfford = state.stash.essence >= cost && !maxed;
          const effect = Math.round(blessingBonus(state, b.id) * 100);
          return (
            <div key={b.id} className="p-3 rounded border"
                 style={{ background: '#14100C', borderColor: b.color + '50' }}>
              <div className="flex items-start gap-2">
                <span className="text-3xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <div className="text-sm font-bold" style={{ color: b.color, fontFamily: "'Cinzel', serif" }}>{b.label}</div>
                    <div className="text-[10px] text-[#F2E6A8] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      Lv {lvl}{effect > 0 ? ` · +${effect}%` : ''}
                    </div>
                  </div>
                  <div className="text-[11px] text-[#B8A890] leading-tight">{b.desc}</div>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-black/80 rounded overflow-hidden">
                <div className="h-full" style={{ width: `${(lvl / b.max) * 100}%`, background: b.color }} />
              </div>
              <button type="button" onClick={() => buyBlessing(b.id)}
                      disabled={!canAfford}
                      className={`press w-full mt-2 text-[11px] py-1 font-bold transition-colors ${canAfford ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                      style={{
                        background: canAfford ? b.color : '#14100C',
                        border: `1px solid ${canAfford ? b.color : '#2B2B32'}`,
                        borderRadius: 2,
                      }}>
                {maxed ? 'Maxed' : `Burn ${cost} ⟡`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============ Bounties ============ */

const Bounties: React.FC<{ state: GameState; claimBounty: (id: string) => void }> = ({ state, claimBounty }) => {
  const board = state.bountyBoard;
  if (!board) return <div className="text-sm text-[#7A6E60]">No bounties available.</div>;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  const msLeft = tomorrow.getTime() - now.getTime();
  const hrs = Math.floor(msLeft / 3600000);
  const mins = Math.floor((msLeft % 3600000) / 60000);
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-sm text-[#B8A890]">
          Three bounties rotate every day. Claim rewards after completing them.
        </div>
        <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest"
             style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Resets in {hrs}h {mins}m
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {board.bounties.map(b => {
          const prog = bountyProgress(state, b);
          const pct = Math.min(100, (prog / b.target) * 100);
          const done = prog >= b.target;
          const claimed = b.claimed;
          return (
            <div key={b.id}
                 className="p-3 rounded border"
                 style={{
                   background: claimed ? '#0a0806' : done ? 'linear-gradient(135deg, #1a2408 0%, #0a1004 100%)' : '#14100C',
                   borderColor: claimed ? '#3D3328' : done ? '#7FE2A0' : '#3D3328',
                   boxShadow: done && !claimed ? '0 0 10px #7FE2A080' : undefined,
                 }}>
              <div className="text-sm font-bold text-[#F2E6A8] leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>
                {b.label}
              </div>
              <div className="text-[11px] text-[#B8A890] mt-1 leading-tight">{b.description}</div>
              <div className="mt-2 h-2 bg-black/80 rounded overflow-hidden">
                <div className="h-full transition-all"
                     style={{
                       width: pct + '%',
                       background: done ? '#7FE2A0' : '#D4A943',
                     }} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="text-[10px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {Math.min(prog, b.target)} / {b.target}
                </div>
                <div className="text-[10px] text-[#D4A943]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {bountyRewardText(b)}
                </div>
              </div>
              <button type="button" onClick={() => claimBounty(b.id)}
                      disabled={claimed || !done}
                      className={`press w-full mt-2 py-1.5 text-xs font-bold transition-colors ${
                        claimed ? 'text-[#5a5040] cursor-not-allowed' :
                        done ? 'text-[#0a0806] hover:brightness-110' :
                               'text-[#AAAAAA] cursor-not-allowed'
                      }`}
                      style={{
                        background: done && !claimed ? 'var(--cc-orange)' : '#14100C',
                        border: `1px solid ${done && !claimed ? 'var(--cc-orange)' : '#2B2B32'}`,
                        borderRadius: 2,
                        animation: done && !claimed ? 'glowPulse 1.6s ease-in-out infinite' : undefined,
                        ['--glow' as any]: 'var(--cc-orange)',
                      }}>
                {claimed ? '✓ Claimed' : done ? 'Claim Reward' : 'In progress'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function bountyRewardText(b: Bounty): string {
  const parts: string[] = [];
  if (b.reward.gold) parts.push(`+${b.reward.gold}g`);
  if (b.reward.essence) parts.push(`+${b.reward.essence}⟡`);
  if (b.reward.itemId && b.reward.itemQty) {
    const item = ITEMS[b.reward.itemId];
    if (item) parts.push(`+${b.reward.itemQty}× ${item.icon}`);
  }
  return parts.join(' · ');
}

/* ============ Temple ============ */

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
            <button type="button" onClick={() => reviveHero(h.id)}
                    disabled={state.stash.gold < cost}
                    className={`press px-3 py-1.5 text-xs font-bold transition-colors ${state.stash.gold >= cost ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                    style={{
                      background: state.stash.gold >= cost ? 'var(--cc-blue)' : '#14100C',
                      border: `1px solid ${state.stash.gold >= cost ? 'var(--cc-blue)' : '#2B2B32'}`,
                      borderRadius: 2,
                    }}>
              Revive ({cost} gp)
            </button>
          </div>
        );
      })}
    </div>
  );
};

/* ============ Inn ============ */

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
        <button type="button" onClick={healParty}
                disabled={cost === 0 || state.stash.gold < cost}
                className={`press px-4 py-2 text-xs font-bold transition-colors ${cost > 0 && state.stash.gold >= cost ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                style={{
                  background: cost > 0 && state.stash.gold >= cost ? 'var(--cc-blue)' : '#14100C',
                  border: `1px solid ${cost > 0 && state.stash.gold >= cost ? 'var(--cc-blue)' : '#2B2B32'}`,
                  borderRadius: 2,
                }}>
          {cost === 0 ? 'Nothing to heal' : `Rest (${cost} gp)`}
        </button>
      </div>
    </div>
  );
};

/* ============ About ============ */

const About: React.FC<{ resetGame: () => void; state: GameState }> = ({ resetGame, state }) => {
  const minutes = Math.floor(state.totalPlaytime / 60000);
  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-sm text-[#B8A890]">
        A party-based idle RPG. Your heroes explore dungeons autonomously — you equip them, level them, enchant gear,
        burn essence, and make the key decisions. Inspired by Clickpocalypse II.
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

/* ============ shared ============ */

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div>
    <div className="flex items-baseline justify-between mb-2 border-b border-[#3D3328] pb-1">
      <div className="text-sm font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>{title}</div>
      {subtitle && (
        <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {subtitle}
        </div>
      )}
    </div>
    {children}
  </div>
);

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
