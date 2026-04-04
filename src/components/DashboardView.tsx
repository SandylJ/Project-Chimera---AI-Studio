import React from 'react';
import { motion } from 'motion/react';
import { 
  Pickaxe, 
  Trees, 
  Fish, 
  PawPrint, 
  Sprout, 
  Hammer, 
  Utensils, 
  FlaskConical, 
  Scissors, 
  Sword, 
  Shield, 
  Zap, 
  Target, 
  Castle, 
  Skull, 
  Briefcase, 
  Store, 
  Coins,
  LayoutDashboard,
  Package,
  Hexagon,
  Hand,
  Sparkles,
  Ghost,
  Footprints
} from 'lucide-react';
import { SkillId } from '../types';
import { LEVEL_XP, ITEMS } from '../constants';

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
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-8 border-b border-[#141414] pb-8">
        <div className="flex-1">
          <h2 className="text-6xl font-serif italic font-bold tracking-tight leading-none mb-4">Imperial Command</h2>
          <p className="text-lg font-serif italic opacity-70 max-w-xl">
            Your empire stands at the precipice of greatness. Master the arts of gathering, crafting, and warfare to expand your reach across the realm.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {totalAscensions > 0 && (
              <div className="px-3 py-1 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest">
                TIER {totalAscensions} ASCENDANT
              </div>
            )}
            <div className="px-3 py-1 border border-emerald-600 text-emerald-800 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              LUCK: {luck}
            </div>
            <div className="px-3 py-1 border border-cyan-600 text-cyan-800 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
              <Package className="w-3 h-3" />
              ESSENCE: {state.celestialEssence.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">TOTAL LEVEL</div>
          <div className="text-8xl font-serif italic font-bold leading-none">{totalLevel}</div>
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">{totalXp.toLocaleString()} TOTAL XP</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Skill Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map(skill => {
            const playerSkill = state.skills[skill.id];
            const nextLevelXp = LEVEL_XP(playerSkill.level + 1);
            const currentLevelXp = LEVEL_XP(playerSkill.level);
            const progress = ((playerSkill.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

            return (
              <motion.div 
                key={skill.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab(skill.id)}
                className="group border border-[#141414] p-4 flex flex-col gap-4 hover:bg-[#141414] hover:text-[#E4E3E0] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 border border-[#141414] group-hover:border-[#E4E3E0] flex items-center justify-center transition-colors">
                    <skill.icon size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">LEVEL</div>
                    <div className="text-2xl font-serif italic font-bold">{playerSkill.level}</div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-serif italic font-bold mb-1">{skill.name}</div>
                  <div className="h-1 bg-[#141414]/10 group-hover:bg-[#E4E3E0]/20 overflow-hidden">
                    <motion.div 
                      className="h-full bg-[#141414] group-hover:bg-[#E4E3E0]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono mt-1 opacity-50 uppercase tracking-widest">
                    <span>{playerSkill.xp.toLocaleString()} XP</span>
                    <span>{Math.floor(progress)}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Loot Sidebar */}
        <div className="space-y-6">
          <h3 className="text-xl font-serif italic font-bold border-b border-[#141414] pb-2">Recent Loot</h3>
          <div className="space-y-3">
            {recentLoot.length > 0 ? (
              recentLoot.map((loot, i) => (
                <motion.div 
                  key={loot.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 border border-[#141414]/10 rounded-sm text-xs font-mono flex items-center gap-3 ${
                    loot.rarity === 'celestial' ? 'bg-cyan-400/20 border-cyan-400 text-cyan-900 font-black' :
                    loot.rarity === 'legendary' ? 'bg-purple-500/10 border-purple-500 text-purple-900 font-bold' :
                    loot.rarity === 'epic' ? 'bg-red-500/10 border-red-500 text-red-900 font-bold' :
                    loot.rarity === 'rare' ? 'bg-blue-500/10 border-blue-500 text-blue-900' :
                    loot.rarity === 'uncommon' ? 'bg-green-500/10 border-green-500 text-green-900' :
                    'bg-[#141414]/5'
                  }`}
                >
                  <span className="text-lg">{loot.message.split(' ')[0]}</span>
                  <span className="opacity-80">{loot.message.split(' ').slice(1).join(' ')}</span>
                </motion.div>
              ))
            ) : (
              <div className="text-xs font-serif italic opacity-50 text-center py-12 border border-dashed border-[#141414]/20">
                No loot recorded yet. Start an action to begin your hoard.
              </div>
            )}
          </div>
          {recentLoot.length > 0 && (
            <button 
              onClick={() => setActiveTab('bank')}
              className="w-full py-3 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414]/90 transition-all"
            >
              View Treasury
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-[#141414]">
        <div className="space-y-2">
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">TREASURY</div>
          <div className="text-4xl font-serif italic font-bold">{state.gp.toLocaleString()} GP</div>
          <p className="text-xs font-serif italic opacity-50">Your wealth continues to grow as your empire expands.</p>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">CELESTIAL ESSENCE</div>
          <div className="text-4xl font-serif italic font-bold">{state.celestialEssence.toLocaleString()} CE</div>
          <p className="text-xs font-serif italic opacity-50">Pure energy harvested from ascended skills.</p>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">INVENTORY</div>
          <div className="text-4xl font-serif italic font-bold">{state.inventory.length} / 100</div>
          <p className="text-xs font-serif italic opacity-50">Manage your resources and equipment efficiently.</p>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">ACTIVE TASK</div>
          <div className="text-4xl font-serif italic font-bold">
            {state.activeAction ? 'ENGAGED' : 'IDLE'}
          </div>
          <p className="text-xs font-serif italic opacity-50">
            {state.activeAction ? 'Your workers are busy at their stations.' : 'Your empire awaits your next command.'}
          </p>
        </div>
      </div>
    </div>
  );
}
