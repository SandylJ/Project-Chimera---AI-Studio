import React, { useState, useEffect } from 'react';
import { GameState, Hero, EquipSlot } from '../types';
import { CLASSES } from '../data/classes';
import { ABILITIES, CLASS_ABILITY_TREE } from '../data/abilities';
import { ITEMS } from '../data/items';
import { effectiveStats, xpToNext, canEquip, totalArmor, weaponPower } from '../engine/util';
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
          return (
            <button
              key={h.id}
              onClick={() => setSelectedId(h.id)}
              className={`w-full text-left p-2 border-b border-[#1E1A16] flex items-center gap-2 transition-all
                ${isSel ? 'bg-[#2B231B] border-l-2 border-l-[#D4A943]' : 'hover:bg-[#1E1A16] border-l-2 border-l-transparent'}`}
            >
              <div className="shrink-0 flex items-end justify-center rounded"
                   style={{
                     width: 42, height: 48,
                     background: `linear-gradient(180deg, ${cls.color}22 0%, #00000000 100%)`,
                     border: `1px solid ${cls.color}60`,
                   }}>
                <ClassSprite classId={h.classId} size={40} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate" style={{ color: cls.color }}>{h.name}</div>
                <div className="text-[9px] text-[#7A6E60]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  L{h.level} {cls.role.toUpperCase()}{h.bench ? ' • BENCH' : ''}{h.state !== 'alive' ? ' • DOWN' : ''}
                </div>
              </div>
              {h.abilityPoints > 0 && (
                <span className="text-[9px] bg-[#D4A943] text-black px-1.5 rounded-full font-bold">+{h.abilityPoints}</span>
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
          <button onClick={() => toggleBench(hero.id)}
                  className="px-3 py-1.5 bg-[#1E1A16] hover:bg-[#2B231B] text-xs rounded border border-[#3D3328] text-[#E8E0D4]">
            {hero.bench ? 'Activate' : 'Bench'}
          </button>
          {hero.state !== 'alive' && (
            <button onClick={() => reviveHero(hero.id)}
                    className="px-3 py-1.5 bg-[#7FE2A0] hover:bg-[#5fc085] text-xs rounded text-black font-bold">
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

      <div className="flex border-b border-[#3D3328] mb-3">
        {(['gear', 'abilities', 'stats'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest ${tab === t ? 'text-[#F2E6A8] border-b-2 border-[#D4A943]' : 'text-[#7A6E60] hover:text-[#B8A890]'}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'gear' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ALL_SLOTS.map(slot => {
              const id = hero.equipment[slot];
              const item = id ? ITEMS[id] : null;
              return (
                <div key={slot} className="bg-[#14100C] border border-[#3D3328] rounded p-2">
                  <div className="text-[9px] uppercase tracking-widest text-[#7A6E60] mb-1"
                       style={{ fontFamily: "'JetBrains Mono', monospace" }}>{slot}</div>
                  {item ? (
                    <div>
                      <div className="text-xs font-bold" style={{ color: rarityColor(item.rarity) }}>{item.icon} {item.name}</div>
                      {item.weaponPower && <div className="text-[10px] text-[#E86E6E]">+{item.weaponPower} DMG</div>}
                      {item.armor && <div className="text-[10px] text-[#D4A943]">+{item.armor} ARM</div>}
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
                      disabled={!check.ok}
                      onClick={() => equipItem(hero.id, id)}
                      className={`text-left p-2 rounded border text-xs
                        ${check.ok
                          ? 'bg-[#14100C] border-[#3D3328] hover:border-[#D4A943] hover:bg-[#2B231B]'
                          : 'bg-[#0A0806] border-[#1E1A16] opacity-50 cursor-not-allowed'}`}
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
                            onClick={() => useConsumable(hero.id, id)}
                            className="px-3 py-1.5 text-xs bg-[#14100C] border border-[#3D3328] hover:bg-[#2B231B] rounded">
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
        <div className="space-y-2">
          <div className="text-xs text-[#7A6E60] mb-2">
            Ability Points available: <span className="text-[#D4A943] font-bold">{hero.abilityPoints}</span>
          </div>
          {tree.map(abId => {
            const ab = ABILITIES[abId];
            if (!ab) return null;
            const owned = hero.abilities.includes(abId);
            const canBuy = !owned && hero.level >= ab.levelReq && hero.abilityPoints >= 1;
            return (
              <div key={abId}
                   className={`p-3 rounded border ${owned ? 'bg-[#2B231B] border-[#D4A943]' : 'bg-[#14100C] border-[#3D3328]'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{ab.icon}</span>
                  <span className="font-bold text-[#F2E6A8]">{ab.name}</span>
                  <span className="text-[10px] text-[#7A6E60]">L{ab.levelReq} • CD {ab.cooldown / 1000}s • {ab.manaCost} MP</span>
                  <div className="ml-auto">
                    {owned ? (
                      <span className="text-[10px] text-[#7FE2A0] font-bold">LEARNED</span>
                    ) : (
                      <button disabled={!canBuy}
                              onClick={() => buyAbility(hero.id, abId)}
                              className={`px-3 py-1 text-xs rounded ${canBuy ? 'bg-[#D4A943] text-black hover:bg-[#e5bb55]' : 'bg-[#1E1A16] text-[#7A6E60] cursor-not-allowed'}`}>
                        Learn
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-[#B8A890] mt-1">{ab.description}</div>
              </div>
            );
          })}
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
