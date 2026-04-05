import React from 'react';
import { motion } from 'motion/react';
import {
  Pickaxe, Trees, Fish, PawPrint, Sprout, Hammer, Utensils, FlaskConical,
  Scissors, Sword, Shield, Zap, Target, Castle, Skull, Package, Hexagon,
  Hand, Sparkles, Ghost, Footprints
} from 'lucide-react';
import { SkillId } from '../types';
import { LEVEL_XP, ITEMS, SKILL_PETS } from '../constants';
import { playButtonPress } from '../sounds';
import { AnimatedCounter } from './AnimatedCounter';

interface DashboardViewProps {
  state: any;
  events: any[];
  setActiveTab: (tab: string) => void;
  prestige?: () => void;
}

const calculateLuck = (equipment: any, socketedGems?: Record<string, string[]>) => {
  let luck = 0;
  Object.values(equipment || {}).forEach((itemId: any) => {
    if (itemId) {
      const item = ITEMS[itemId];
      if (item?.stats?.luck) luck += item.stats.luck;
    }
  });
  if (socketedGems) {
    Object.values(socketedGems).forEach((gems: string[]) => {
      gems.forEach(gemId => {
        const gem = ITEMS[gemId];
        if (gem?.gemBonus?.luck) luck += gem.gemBonus.luck;
      });
    });
  }
  return luck;
};

type SkillCategory = 'gathering' | 'combat' | 'artisan' | 'support';

const CATEGORY_COLORS: Record<SkillCategory, { bar: string; icon: string; iconBorder: string; glow: string }> = {
  gathering: { bar: 'from-emerald-600 to-green-400', icon: 'text-emerald-400', iconBorder: 'border-emerald-800 group-hover:border-emerald-500/50', glow: 'rgba(52, 211, 153, 0.3)' },
  combat:    { bar: 'from-red-700 to-rose-400', icon: 'text-red-400', iconBorder: 'border-red-900 group-hover:border-red-500/50', glow: 'rgba(248, 113, 113, 0.3)' },
  artisan:   { bar: 'from-amber-600 to-yellow-400', icon: 'text-amber-400', iconBorder: 'border-amber-800 group-hover:border-amber-500/50', glow: 'rgba(251, 191, 36, 0.3)' },
  support:   { bar: 'from-purple-600 to-violet-400', icon: 'text-purple-400', iconBorder: 'border-purple-800 group-hover:border-purple-500/50', glow: 'rgba(167, 139, 250, 0.3)' },
};

const SKILLS: { id: SkillId; name: string; icon: any; category: SkillCategory }[] = [
  { id: 'mining', name: 'Mining', icon: Pickaxe, category: 'gathering' },
  { id: 'woodcutting', name: 'Woodcutting', icon: Trees, category: 'gathering' },
  { id: 'fishing', name: 'Fishing', icon: Fish, category: 'gathering' },
  { id: 'hunting', name: 'Hunting', icon: PawPrint, category: 'gathering' },
  { id: 'farming', name: 'Farming', icon: Sprout, category: 'gathering' },
  { id: 'smithing', name: 'Smithing', icon: Hammer, category: 'artisan' },
  { id: 'cooking', name: 'Cooking', icon: Utensils, category: 'artisan' },
  { id: 'herblore', name: 'Herblore', icon: FlaskConical, category: 'artisan' },
  { id: 'crafting', name: 'Crafting', icon: Scissors, category: 'artisan' },
  { id: 'runecrafting', name: 'Runecrafting', icon: Hexagon, category: 'artisan' },
  { id: 'thieving', name: 'Thieving', icon: Hand, category: 'support' },
  { id: 'agility', name: 'Agility', icon: Footprints, category: 'support' },
  { id: 'attack', name: 'Attack', icon: Sword, category: 'combat' },
  { id: 'strength', name: 'Strength', icon: Zap, category: 'combat' },
  { id: 'defense', name: 'Defense', icon: Shield, category: 'combat' },
  { id: 'magic', name: 'Magic', icon: Zap, category: 'combat' },
  { id: 'ranged', name: 'Ranged', icon: Target, category: 'combat' },
  { id: 'prayer', name: 'Prayer', icon: Sparkles, category: 'support' },
  { id: 'empire', name: 'Empire', icon: Castle, category: 'support' },
  { id: 'raids', name: 'Raids', icon: Skull, category: 'combat' },
  { id: 'slayer', name: 'Slayer', icon: Ghost, category: 'combat' },
  { id: 'construction', name: 'Construction', icon: Castle, category: 'artisan' },
];

export function DashboardView({ state, events, setActiveTab, prestige }: DashboardViewProps) {
  const totalLevel: number = Object.values(state.skills || {}).reduce((acc: number, skill: any) => acc + (skill?.level || 0), 0) as number;
  const totalXp: number = Object.values(state.skills || {}).reduce((acc: number, skill: any) => acc + (skill?.xp || 0), 0) as number;
  const totalAscensions: number = Object.values((state.ascensions || {}) as Record<string, number>).reduce((acc: number, count: number) => acc + (count || 0), 0) as number;
  const luck = calculateLuck(state.equipment, state.socketedGems);
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
            {state.prestigeLevel > 0 && (
              <div className="keycap keycap-sm" style={{ background: 'linear-gradient(180deg, #9333ea 0%, #6b21a8 100%)', color: '#fff', borderColor: '#581c87', boxShadow: '0 1px 0 0 rgba(200,160,255,0.3) inset, 0 4px 0 0 #3b0764, 0 5px 4px 0 rgba(0,0,0,0.3)' }}>
                PRESTIGE {state.prestigeLevel}
              </div>
            )}
            {totalAscensions > 0 && <div className="keycap keycap-sm keycap-gold">TIER {totalAscensions} ASCENDANT</div>}
            <div className="px-3 py-1.5 rounded-lg border border-emerald-800 bg-emerald-950/50 text-emerald-400 text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Sparkles className="w-3 h-3" /> LUCK: {luck}
            </div>
            <div className="px-3 py-1.5 rounded-lg border border-cyan-800 bg-cyan-950/50 text-cyan-400 text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <Package className="w-3 h-3" /> ESSENCE: {state.celestialEssence.toLocaleString()}
            </div>
            {state.activePet && ITEMS[state.activePet] && (
              <div className="px-3 py-1.5 rounded-lg border border-purple-800 bg-purple-950/50 text-purple-300 text-[10px] uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <span>{ITEMS[state.activePet].icon}</span> {ITEMS[state.activePet].name}
              </div>
            )}
            {state.petsUnlocked && state.petsUnlocked.length > 0 && (
              <div className="px-3 py-1.5 rounded-lg border border-[#3D3328] bg-[#1E1A16] text-[#7A6E60] text-[10px] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                PETS: {state.petsUnlocked.length}/{Object.keys(SKILL_PETS).length}
              </div>
            )}
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
            const colors = CATEGORY_COLORS[skill.category];
            const isMaxed = playerSkill.level >= 99;
            return (
              <motion.div key={skill.id} whileHover={{ scale: 1.02 }}
                onClick={() => { playButtonPress(); setActiveTab(skill.id); }}
                className={`group card p-4 flex flex-col gap-4 hover:bg-[#2A2520] hover:border-[#D4A943]/30 transition-all cursor-pointer ${
                  isMaxed ? 'ring-1 ring-[#D4A943]/20' : ''
                }`}>
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 border rounded-lg flex items-center justify-center transition-colors ${colors.iconBorder} ${colors.icon}`}>
                    <skill.icon size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LEVEL</div>
                    <div className={`text-2xl font-bold ${isMaxed ? 'text-[#D4A943]' : ''}`} style={{ fontFamily: "'Cinzel', serif" }}>{playerSkill.level}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-bold mb-1">{skill.name}</div>
                  <div className="h-2 bg-[#0D0B09] rounded-full overflow-hidden relative">
                    <motion.div
                      className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                    {progress > 85 && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ boxShadow: `inset 0 0 8px ${colors.glow}, 0 0 6px ${colors.glow}` }}
                      />
                    )}
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
          <AnimatedCounter value={state.gp} className="text-4xl font-bold text-[#D4A943]" suffix=" GP" style={{ fontFamily: "'Cinzel', serif" }} />
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

      {/* Prestige Section */}
      {totalLevel >= 1000 && prestige && (
        <div className="card p-6 border-purple-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>Prestige</h3>
              <p className="text-xs text-[#7A6E60] mt-1">Reset your skills for permanent bonuses. Keeps pets, collection log, and achievements.</p>
            </div>
            {state.prestigeLevel > 0 && (
              <div className="text-right">
                <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Tokens</div>
                <div className="text-2xl font-bold text-purple-400" style={{ fontFamily: "'Cinzel', serif" }}>{state.prestigeTokens}</div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Bonuses: +{state.prestigeLevel * 5}% XP · Tokens earned: ~{Math.floor(totalLevel / 100)}
            </div>
            <button
              onClick={() => { if (totalLevel >= 1500) { playButtonPress(); prestige(); } }}
              disabled={totalLevel < 1500}
              className={`keycap text-[10px] uppercase tracking-widest ${totalLevel >= 1500 ? 'animate-pulse' : 'opacity-40 cursor-not-allowed'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace", background: totalLevel >= 1500 ? 'linear-gradient(180deg, #9333ea 0%, #6b21a8 100%)' : undefined, color: totalLevel >= 1500 ? '#fff' : undefined }}
            >
              {totalLevel >= 1500 ? 'Prestige Now' : `Need ${1500 - totalLevel} more levels`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
