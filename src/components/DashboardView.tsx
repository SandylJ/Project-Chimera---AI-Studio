import React from 'react';
import { motion } from 'motion/react';
import {
  Pickaxe, Trees, Fish, PawPrint, Sprout, Hammer, Utensils, FlaskConical,
  Scissors, Sword, Shield, Zap, Target, Castle, Skull, Package, Hexagon,
  Hand, Sparkles, Ghost, Footprints
} from 'lucide-react';
import { SkillId } from '../types';
import { LEVEL_XP, ITEMS } from '../constants';
import { playButtonPress } from '../sounds';

interface DashboardViewProps {
  state: any;
  events: any[];
  setActiveTab: (tab: string) => void;
}

const calculateLuck = (equipment: any) => {
  let luck = 0;
  Object.values(equipment || {}).forEach((itemId: any) => {
    if (itemId) {
      const item = ITEMS[itemId];
      if (item?.stats?.luck) luck += item.stats.luck;
    }
  });
  return luck;
};

const SKILLS: { id: SkillId; name: string; icon: any }[] = [
  { id: 'mining', name: 'Mining', icon: Pickaxe },
  { id: 'woodcutting', name: 'Woodcutting', icon: Trees },
  { id: 'fishing', name: 'Fishing', icon: Fish },
  { id: 'hunting', name: 'Hunting', icon: PawPrint },
  { id: 'farming', name: 'Farming', icon: Sprout },
  { id: 'smithing', name: 'Smithing', icon: Hammer },
  { id: 'cooking', name: 'Cooking', icon: Utensils },
  { id: 'herblore', name: 'Herblore', icon: FlaskConical },
  { id: 'crafting', name: 'Crafting', icon: Scissors },
  { id: 'runecrafting', name: 'Runecrafting', icon: Hexagon },
  { id: 'thieving', name: 'Thieving', icon: Hand },
  { id: 'agility', name: 'Agility', icon: Footprints },
  { id: 'attack', name: 'Attack', icon: Sword },
  { id: 'strength', name: 'Strength', icon: Zap },
  { id: 'defense', name: 'Defense', icon: Shield },
  { id: 'magic', name: 'Magic', icon: Zap },
  { id: 'ranged', name: 'Ranged', icon: Target },
  { id: 'prayer', name: 'Prayer', icon: Sparkles },
  { id: 'empire', name: 'Empire', icon: Castle },
  { id: 'raids', name: 'Raids', icon: Skull },
  { id: 'slayer', name: 'Slayer', icon: Ghost },
];

export function DashboardView({ state, events, setActiveTab }: DashboardViewProps) {
  const totalLevel = Object.values(state.skills || {}).reduce((acc: number, skill: any) => acc + (skill?.level || 0), 0);
  const totalXp = Object.values(state.skills || {}).reduce((acc: number, skill: any) => acc + (skill?.xp || 0), 0);
  const totalAscensions = Object.values((state.ascensions || {}) as Record<string, number>).reduce((acc: number, count: number) => acc + (count || 0), 0);
  const luck = calculateLuck(state.equipment);
  const recentLoot = events.filter(e => e.type === 'loot').slice(0, 10);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 border-b border-[#3D3328] pb-8">
        <div className="flex-1">
          <h2 className="text-6xl font-bold tracking-tight leading-none mb-4" style={{ fontFamily: "'Cinzel', serif" }}>Imperial Command</h2>
          <p className="text-lg text-[#B8A890] max-w-xl">
            Your empire stands at the precipice of greatness. Master the arts of gathering, crafting, and warfare to expand your reach across the realm.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {totalAscensions > 0 && <div className="keycap keycap-sm keycap-gold">TIER {totalAscensions} ASCENDANT</div>}
            <div className="px-3 py-1.5 rounded-lg border border-emerald-800 bg-emerald-950/50 text-emerald-400 text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Sparkles className="w-3 h-3" /> LUCK: {luck}
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-cyan-800 bg-cyan-950/50 text-cyan-400 text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Package className="w-3 h-3" /> ESSENCE: {state.celestialEssence.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>TOTAL LEVEL</div>
          <div className="text-8xl font-bold leading-none text-[#E8E0D4]" style={{ fontFamily: "'Cinzel', serif" }}>{totalLevel}</div>
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{totalXp.toLocaleString()} TOTAL XP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map(skill => {
            const playerSkill = state.skills[skill.id];
            const nextLevelXp = LEVEL_XP(playerSkill.level + 1);
            const currentLevelXp = LEVEL_XP(playerSkill.level);
            const progress = ((playerSkill.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
            return (
              <motion.div key={skill.id} whileHover={{ scale: 1.02 }}
                onClick={() => { playButtonPress(); setActiveTab(skill.id); }}
                className="group card p-4 flex flex-col gap-4 hover:bg-[#2A2520] hover:border-[#D4A943]/30 transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 border border-[#3D3328] group-hover:border-[#D4A943]/30 rounded-lg flex items-center justify-center transition-colors">
                    <skill.icon size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LEVEL</div>
                    <div className="text-2xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{playerSkill.level}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">{skill.name}</div>
                  <div className="h-1.5 bg-[#0D0B09] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-[#C17F4E] to-[#D4A943] rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <div className="flex justify-between text-[8px] mt-1 text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>{playerSkill.xp.toLocaleString()} XP</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold border-b border-[#3D3328] pb-2" style={{ fontFamily: "'Cinzel', serif" }}>Recent Loot</h3>
          <div className="space-y-3">
            {recentLoot.length > 0 ? recentLoot.map((loot, i) => (
              <motion.div key={loot.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className={`p-3 rounded-lg text-xs flex items-center gap-3 ${
                  loot.rarity === 'celestial' ? 'rarity-bg-celestial rarity-border-celestial border-2 font-black' :
                  loot.rarity === 'legendary' ? 'rarity-bg-legendary rarity-border-legendary border-2 font-bold' :
                  loot.rarity === 'epic' ? 'rarity-bg-epic rarity-border-epic border-2 font-bold' :
                  loot.rarity === 'rare' ? 'rarity-bg-rare rarity-border-rare border-2' :
                  loot.rarity === 'uncommon' ? 'rarity-bg-uncommon rarity-border-uncommon border-2' :
                  'bg-[#1E1A16] border border-[#3D3328]'
                }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span className="text-lg">{loot.message.split(' ')[0]}</span>
                <span className="opacity-80">{loot.message.split(' ').slice(1).join(' ')}</span>
              </motion.div>
            )) : (
              <div className="text-xs text-[#7A6E60] text-center py-12 border border-dashed border-[#3D3328] rounded-lg">
                No loot recorded yet. Start an action to begin your hoard.
              </div>
            )}
          </div>
          {recentLoot.length > 0 && (
            <button onClick={() => { playButtonPress(); setActiveTab('bank'); }}
              className="keycap keycap-gold w-full text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              View Treasury
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-8 border-t border-[#3D3328]">
        <div className="card p-5 space-y-2">
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>TREASURY</div>
          <div className="text-4xl font-bold text-[#D4A943]" style={{ fontFamily: "'Cinzel', serif" }}>{state.gp.toLocaleString()} GP</div>
          <p className="text-xs text-[#7A6E60]">Your wealth continues to grow.</p>
        </div>
        <div className="card p-5 space-y-2">
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>CELESTIAL ESSENCE</div>
          <div className="text-4xl font-bold text-cyan-400" style={{ fontFamily: "'Cinzel', serif" }}>{state.celestialEssence.toLocaleString()} CE</div>
          <p className="text-xs text-[#7A6E60]">Harvested from ascended skills.</p>
        </div>
        <div className="card p-5 space-y-2">
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>INVENTORY</div>
          <div className="text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{state.inventory.length} / 100</div>
          <p className="text-xs text-[#7A6E60]">Manage your resources efficiently.</p>
        </div>
        <div className="card p-5 space-y-2">
          <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ACTIVE TASK</div>
          <div className="text-4xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
            {state.activeAction ? <span className="text-emerald-400">ENGAGED</span> : <span className="text-[#7A6E60]">IDLE</span>}
          </div>
          <p className="text-xs text-[#7A6E60]">{state.activeAction ? 'Workers busy.' : 'Awaiting command.'}</p>
        </div>
      </div>
    </div>
  );
}
