import React, { useState, useEffect } from 'react';
import { GameState, Hero, EquipSlot } from '../types';
import { CLASSES } from '../data/classes';
import { ABILITIES, CLASS_ABILITY_TREE } from '../data/abilities';
import { ITEMS } from '../data/items';
import { effectiveStats, xpToNext, canEquip, totalArmor, weaponPower, enchantTier } from '../engine/util';
import { ClassSprite } from '../visuals/sprites';

interface Props {
  state: GameState;
  unequipItem: (heroId: string, slot: EquipSlot) => void;
  toggleBench: (heroId: string) => void;
  buyAbility: (heroId: string, abilityId: string) => void;
  reviveHero: (heroId: string) => void;
  useConsumable: (heroId: string, itemId: string) => void;
  equipItem: (heroId: string, itemId: string) => void;
  focusHeroId?: string | null;
}

const ALL_SLOTS: EquipSlot[] = ['weapon', 'offhand', 'head', 'body', 'legs', 'feet', 'neck', 'ring'];

export const PartyView: React.FC<Props> = ({ state, unequipItem, toggleBench, buyAbility, reviveHero, useConsumable, equipItem, focusHeroId }) => {
  const [selectedId, setSelectedId] = useState<string | null>(focusHeroId ?? state.heroes[0]?.id ?? null);
  useEffect(() => {
    if (focusHeroId && focusHeroId !== selectedId) setSelectedId(focusHeroId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusHeroId]);
  const selected = state.heroes.find(h => h.id === selectedId) ?? state.heroes[0];

  return (
    <div className="flex h-full">
      <aside className="w-64 shrink-0 bg-[#14100C] border-r border-[#3D3328] overflow-y-auto">
        <div className="p-3 border-b border-[#3D3328]">
          <h3 className="text-sm uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Roster
          </h3>
        </div>
        {state.heroes.map(h => {
          const cls = CLASSES[h.classId];
          const isSel = selected?.id === h.id;
          const hpPct = Math.max(0, (h.hp / Math.max(1, h.maxHp)) * 100);
          const mpPct = h.maxMp > 0 ? Math.max(0, (h.mp / h.maxMp) * 100) : 0;
          const xpPct = Math.min(100, (h.xp / Math.max(1, xpToNext(h))) * 100);
          const hpColor = hpPct > 66 ? '#55d86b' : hpPct > 33 ? '#e9cc3a' : '#e04040';
          const downed = h.state !== 'alive';
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setSelectedId(h.id)}
              className={`press relative w-full text-left p-2 border-b border-[#1E1A16] flex items-center gap-2 transition-colors
                ${isSel ? 'bg-[#2B231B] border-l-2 border-l-[var(--cc-blue)]' : 'hover:bg-[#1E1A16] border-l-2 border-l-transparent'}`}
            >
              <div className="shrink-0 flex items-end justify-center rounded"
                   style={{
                     width: 42, height: 48,
                     background: `linear-gradient(180deg, ${cls.color}22 0%, #00000000 100%)`,
                     border: `1px solid ${cls.color}60`,
                     filter: downed ? 'grayscale(1) opacity(0.5)' : undefined,
                   }}>
                <ClassSprite classId={h.classId} size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1">
                  <div className="text-xs font-bold truncate flex-1" style={{ color: cls.color }}>{h.name}</div>
                  <div className="text-[8px] text-[#f2e08a] font-bold shrink-0"
                       style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    L{h.level}
                  </div>
                </div>
                <div className="text-[9px] text-[#7A6E60] leading-none mt-0.5"
                     style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {cls.role.toUpperCase()}{h.bench ? ' · BENCH' : ''}{downed ? ' · DOWN' : ''}
                </div>
                {/* HP bar */}
                <div className="relative h-[4px] mt-1 bg-black rounded-sm overflow-hidden">
                  <div className="h-full" style={{ width: hpPct + '%', background: hpColor, transition: 'width 200ms' }} />
                </div>
                {/* MP bar */}
                {h.maxMp > 0 && (
                  <div className="relative h-[2px] mt-0.5 bg-black rounded-sm overflow-hidden">
                    <div className="h-full" style={{ width: mpPct + '%', background: '#2060dc' }} />
                  </div>
                )}
                {/* XP bar */}
                <div className="relative h-[2px] mt-0.5 bg-black rounded-sm overflow-hidden">
                  <div className="h-full"
                       style={{
                         width: xpPct + '%',
                         background: 'linear-gradient(90deg, #9a8030 0%, #ffe080 100%)',
                       }} />
                </div>
              </div>
              {h.abilityPoints > 0 && (
                <span className="absolute top-1 right-1 text-[9px] bg-[#D4A943] text-black px-1.5 rounded-full font-black"
                      style={{ boxShadow: '0 0 6px #D4A943aa' }}>+{h.abilityPoints}</span>
              )}
            </button>
          );
        })}
      </aside>

      <div className="flex-1 overflow-y-auto p-4">
        {selected && (
          <HeroDetail
            hero={selected}
            state={state}
            unequipItem={unequipItem}
            toggleBench={toggleBench}
            buyAbility={buyAbility}
            reviveHero={reviveHero}
            useConsumable={useConsumable}
            equipItem={equipItem}
          />
        )}
      </div>
    </div>
  );
};

interface DetailProps {
  hero: Hero;
  state: GameState;
  unequipItem: (heroId: string, slot: EquipSlot) => void;
  toggleBench: (heroId: string) => void;
  buyAbility: (heroId: string, abilityId: string) => void;
  reviveHero: (heroId: string) => void;
  useConsumable: (heroId: string, itemId: string) => void;
  equipItem: (heroId: string, itemId: string) => void;
}

const HeroDetail: React.FC<DetailProps> = ({ hero, state, unequipItem, toggleBench, buyAbility, reviveHero, useConsumable, equipItem }) => {
  const cls = CLASSES[hero.classId];
  const stats = effectiveStats(hero);
  const tree = CLASS_ABILITY_TREE[hero.classId] ?? [];
  const [tab, setTab] = useState<'gear' | 'abilities' | 'stats'>('gear');

  const nextXp = xpToNext(hero);
  const xpPct = (hero.xp / nextXp) * 100;

  const potions = ['healing_potion', 'greater_healing_potion', 'mana_potion', 'elixir_of_life']
    .filter(id => (state.stash.items[id] ?? 0) > 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl"
             style={{ background: cls.color + '20', border: `2px solid ${cls.color}` }}>
          {cls.icon}
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold" style={{ color: cls.color, fontFamily: "'Cinzel', serif" }}>{hero.name}</div>
          <div className="text-xs text-[#B8A890]">{cls.name} • {cls.role} • Level {hero.level}</div>
          <div className="text-xs text-[#7A6E60] mt-1">{cls.description}</div>
          <div className="h-2 bg-black rounded mt-2 overflow-hidden w-full max-w-sm">
            <div className="h-full bg-gradient-to-r from-[#9b8b3a] to-[#F2E6A8] transition-all"
                 style={{ width: xpPct + '%' }} />
          </div>
          <div className="text-[10px] text-[#7A6E60] mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            XP {hero.xp.toLocaleString()} / {nextXp.toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => toggleBench(hero.id)}
                  className="press px-3 py-1.5 text-xs text-[#E8E0D4] hover:bg-[#2B2B32] transition-colors"
                  style={{
                    background: '#14100C',
                    border: '1px solid #2B2B32',
                    borderRadius: 2,
                  }}>
            {hero.bench ? 'Activate' : 'Bench'}
          </button>
          {hero.state !== 'alive' && (
            <button type="button" onClick={() => reviveHero(hero.id)}
                    className="press px-3 py-1.5 text-xs text-[#0a0806] font-bold hover:brightness-110"
                    style={{
                      background: 'var(--cc-blue)',
                      border: '1px solid var(--cc-blue)',
                      borderRadius: 2,
                    }}>
              Revive ({100 + hero.level * 20} gp)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="HP" value={`${Math.ceil(hero.hp)}/${hero.maxHp}`} color="#7FE2A0" />
        <Stat label="MP" value={`${Math.ceil(hero.mp)}/${hero.maxMp}`} color="#6EA9E4" />
        <Stat label="ARMOR" value={String(totalArmor(hero))} color="#D4A943" />
        <Stat label="STR" value={String(Math.floor(stats.str))} color="#E86E6E" />
        <Stat label="DEX" value={String(Math.floor(stats.dex))} color="#7FE2A0" />
        <Stat label="INT" value={String(Math.floor(stats.int))} color="#B485E8" />
        <Stat label="CON" value={String(Math.floor(stats.con))} color="#F2B84B" />
        <Stat label="SPD" value={String(Math.floor(stats.spd))} color="#F2E6A8" />
        <Stat label="LUCK" value={String(Math.floor(stats.luck))} color="#FF6EE6" />
      </div>

      <div className="flex border-b border-[#3D3328] mb-3 gap-1">
        {(['gear', 'abilities', 'stats'] as const).map(t => {
          const active = tab === t;
          return (
            <button key={t} type="button" onClick={() => setTab(t)}
                    className={`press px-4 py-2 text-xs uppercase tracking-widest transition-colors ${
                      active ? 'text-[#0a0806] font-black' : 'text-[#B8A890] hover:bg-[#2B2B32]'
                    }`}
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: active ? 'var(--cc-blue)' : 'transparent',
                      border: `1px solid ${active ? 'var(--cc-blue)' : 'transparent'}`,
                      borderBottom: 'none',
                      borderRadius: 2,
                      marginBottom: -1,
                    }}>
              {t}
            </button>
          );
        })}
      </div>

      {tab === 'gear' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ALL_SLOTS.map(slot => {
              const id = hero.equipment[slot];
              const item = id ? ITEMS[id] : null;
              const tier = enchantTier(hero, slot);
              return (
                <div key={slot} className="bg-[#14100C] border border-[#3D3328] rounded p-2">
                  <div className="text-[9px] uppercase tracking-widest text-[#7A6E60] mb-1"
                       style={{ fontFamily: "'JetBrains Mono', monospace" }}>{slot}</div>
                  {item ? (
                    <div>
                      <div className="text-xs font-bold" style={{ color: rarityColor(item.rarity) }}>
                        {item.icon} {item.name}
                        {tier > 0 && <span className="ml-1 text-[#7FE2A0]">+{tier}</span>}
                      </div>
                      {item.weaponPower && (
                        <div className="text-[10px] text-[#E86E6E]">
                          +{Math.floor(item.weaponPower * (1 + tier * 0.15))} DMG
                          {tier > 0 && <span className="text-[#7FE2A0]"> (base {item.weaponPower})</span>}
                        </div>
                      )}
                      {item.armor && (
                        <div className="text-[10px] text-[#D4A943]">
                          +{Math.floor(item.armor * (1 + tier * 0.15))} ARM
                          {tier > 0 && <span className="text-[#7FE2A0]"> (base {item.armor})</span>}
                        </div>
                      )}
                      <button onClick={() => unequipItem(hero.id, slot)}
                              className="text-[10px] text-[#7A6E60] hover:text-[#E86E6E] mt-1">
                        remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-[#3D3328]">(empty)</div>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <div className="text-xs text-[#7A6E60] uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Equippable from Stash
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(state.stash.items)
                .filter(([id]) => ITEMS[id]?.slot)
                .map(([id, qty]) => {
                  const item = ITEMS[id];
                  const check = canEquip(hero, item);
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={!check.ok}
                      onClick={() => equipItem(hero.id, id)}
                      className={`press text-left p-2 border text-xs transition-colors
                        ${check.ok
                          ? 'bg-[#14100C] hover:bg-[#2B2B32]'
                          : 'bg-[#0A0806] opacity-50 cursor-not-allowed'}`}
                      style={{
                        borderColor: check.ok ? 'var(--cc-blue)' : '#2B2B32',
                        borderRadius: 2,
                      }}
                    >
                      <div className="font-bold" style={{ color: rarityColor(item.rarity) }}>{item.icon} {item.name}</div>
                      <div className="text-[10px] text-[#7A6E60]">×{qty} • {item.slot}</div>
                      {item.weaponPower && <div className="text-[10px] text-[#E86E6E]">+{item.weaponPower} DMG</div>}
                      {item.armor && <div className="text-[10px] text-[#D4A943]">+{item.armor} ARM</div>}
                      {!check.ok && <div className="text-[10px] text-[#E86E6E]">{check.reason}</div>}
                    </button>
                  );
                })}
              {Object.entries(state.stash.items).filter(([id]) => ITEMS[id]?.slot).length === 0 && (
                <div className="text-xs text-[#7A6E60] col-span-3">No equippable items in stash.</div>
              )}
            </div>
          </div>

          {potions.length > 0 && (
            <div>
              <div className="text-xs text-[#7A6E60] uppercase tracking-widest mb-2"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>Potions</div>
              <div className="flex flex-wrap gap-2">
                {potions.map(id => {
                  const p = ITEMS[id];
                  return (
                    <button key={id}
                            type="button"
                            onClick={() => useConsumable(hero.id, id)}
                            className="press px-3 py-1.5 text-xs hover:bg-[#2B2B32] transition-colors"
                            style={{
                              background: '#14100C',
                              border: '1px solid var(--cc-blue)',
                              borderRadius: 2,
                            }}>
                      {p.icon} {p.name} <span className="text-[#7A6E60]">×{state.stash.items[id]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'abilities' && (
        <div className="space-y-3">
          {/* AP banner */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded border"
               style={{
                 background: hero.abilityPoints > 0 ? 'linear-gradient(90deg, #3a2a08 0%, #1a1004 100%)' : '#14100C',
                 borderColor: hero.abilityPoints > 0 ? '#D4A943' : '#3D3328',
                 boxShadow: hero.abilityPoints > 0 ? '0 0 8px #D4A94360' : undefined,
               }}>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#7A6E60] font-bold"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>Ability Points</div>
              <div className="text-xl font-black text-[#D4A943]">{hero.abilityPoints}</div>
            </div>
            <div className="text-[11px] text-[#B8A890] text-right max-w-[240px]">
              Earned every 2 levels. Spend them below to unlock new abilities. Active abilities fire automatically in combat.
            </div>
          </div>
          {/* Group by level-req tiers */}
          {groupAbilitiesByTier(tree).map(group => (
            <div key={group.tier}>
              <div className="text-[10px] uppercase tracking-widest text-[#7A6E60] font-bold mb-1 pl-1"
                   style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Tier {group.tier} · Level {group.minLevel}+
              </div>
              <div className="space-y-1">
                {group.ids.map(abId => {
                  const ab = ABILITIES[abId];
                  if (!ab) return null;
                  const owned = hero.abilities.includes(abId);
                  const levelOk = hero.level >= ab.levelReq;
                  const canBuy = !owned && levelOk && hero.abilityPoints >= 1;
                  const firstEffect = ab.effects[0];
                  return (
                    <div key={abId}
                         className={`p-2 rounded border transition-all ${
                           owned ? 'bg-[#2B231B] border-[#D4A943]'
                                 : levelOk ? 'bg-[#14100C] border-[#3D3328] hover:border-[#D4A943]/60'
                                           : 'bg-[#0A0806] border-[#1E1A16] opacity-60'
                         }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xl shrink-0">{ab.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1">
                            <span className="font-bold text-[#F2E6A8]">{ab.name}</span>
                            <span className="text-[9px] text-[#7A6E60] whitespace-nowrap" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              L{ab.levelReq} • {ab.cooldown / 1000}s CD • {ab.manaCost} MP
                            </span>
                          </div>
                          <div className="text-[11px] text-[#B8A890] leading-tight">{ab.description}</div>
                          {firstEffect && (
                            <div className="text-[10px] text-[#7FE2A0] leading-tight"
                                 style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                              {effectPreview(firstEffect)}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0">
                          {owned ? (
                            <span className="text-[10px] text-[#7FE2A0] font-bold">LEARNED</span>
                          ) : !levelOk ? (
                            <span className="text-[10px] text-[#E86E6E]">L{ab.levelReq}</span>
                          ) : (
                            <button type="button" disabled={!canBuy}
                                    onClick={() => buyAbility(hero.id, abId)}
                                    className={`press px-3 py-1 text-xs font-bold transition-colors ${canBuy ? 'text-[#0a0806] hover:brightness-110' : 'text-[#AAAAAA] cursor-not-allowed'}`}
                                    style={{
                                      background: canBuy ? 'var(--cc-orange)' : '#14100C',
                                      border: `1px solid ${canBuy ? 'var(--cc-orange)' : '#2B2B32'}`,
                                      borderRadius: 2,
                                    }}>
                              Learn
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'stats' && (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <Kv k="Weapon DMG" v={String(weaponPower(hero))} />
            <Kv k="Total Armor" v={String(totalArmor(hero))} />
            <Kv k="Attack Interval" v={`${(2600 - Math.min(20, stats.spd) * 90)} ms`} />
            <Kv k="STR / DEX / INT" v={`${Math.floor(stats.str)} / ${Math.floor(stats.dex)} / ${Math.floor(stats.int)}`} />
            <Kv k="CON / SPD / LUCK" v={`${Math.floor(stats.con)} / ${Math.floor(stats.spd)} / ${Math.floor(stats.luck)}`} />
            <Kv k="Abilities Known" v={String(hero.abilities.length)} />
          </div>
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="bg-[#14100C] border border-[#3D3328] rounded p-2">
    <div className="text-[9px] uppercase tracking-widest text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
    <div className="text-lg font-bold" style={{ color, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
  </div>
);

const Kv: React.FC<{ k: string; v: string }> = ({ k, v }) => (
  <div className="flex justify-between p-2 bg-[#14100C] rounded border border-[#3D3328]">
    <span className="text-[#7A6E60]">{k}</span>
    <span className="text-[#E8E0D4] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
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

function groupAbilitiesByTier(ids: string[]): Array<{ tier: number; minLevel: number; ids: string[] }> {
  // Bucket by levelReq: 1-4, 5-9, 10-14, 15-19, 20+
  const buckets: Record<string, { tier: number; minLevel: number; ids: string[] }> = {};
  for (const id of ids) {
    const ab = ABILITIES[id];
    if (!ab) continue;
    const lv = ab.levelReq;
    const bucket = lv < 5 ? 1 : lv < 10 ? 2 : lv < 15 ? 3 : lv < 20 ? 4 : 5;
    const minLv = bucket === 1 ? 1 : bucket === 2 ? 5 : bucket === 3 ? 10 : bucket === 4 ? 15 : 20;
    const key = `${bucket}`;
    buckets[key] ||= { tier: bucket, minLevel: minLv, ids: [] };
    buckets[key].ids.push(id);
  }
  return Object.values(buckets).sort((a, b) => a.tier - b.tier);
}

function effectPreview(eff: { kind: string; power: number; flat?: boolean; scaling: string; duration?: number }): string {
  const scale = eff.flat ? `${eff.power} flat` : `${eff.power}× ${eff.scaling.toUpperCase()}`;
  switch (eff.kind) {
    case 'damage': return `→ ${scale} damage`;
    case 'aoe_damage': return `→ ${scale} AoE damage`;
    case 'heal': return `→ heals ${scale}`;
    case 'shield': return `→ absorbs ${scale} dmg`;
    case 'buff': return `→ +${Math.round(eff.power * 100)}% stat for ${(eff.duration ?? 0) / 1000}s`;
    case 'stun': return `→ stuns for ${(eff.duration ?? 0) / 1000}s`;
    case 'dot': return `→ ${scale}/tick for ${(eff.duration ?? 0) / 1000}s`;
    default: return `→ ${eff.kind}`;
  }
}
