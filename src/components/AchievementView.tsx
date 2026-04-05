import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ACHIEVEMENTS, Achievement, AchievementCheckState } from '../achievementData';
import { PlayerState } from '../types';
import { playButtonPress } from '../sounds';

interface AchievementViewProps {
  state: PlayerState;
}

const TIER_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  bronze: { bg: 'bg-orange-950/20', border: 'border-orange-800/40', text: 'text-orange-400', label: 'Bronze' },
  silver: { bg: 'bg-slate-800/20', border: 'border-slate-500/40', text: 'text-slate-300', label: 'Silver' },
  gold: { bg: 'bg-amber-950/20', border: 'border-amber-600/40', text: 'text-amber-400', label: 'Gold' },
  imperial: { bg: 'bg-purple-950/20', border: 'border-purple-500/40', text: 'text-purple-300', label: 'Imperial' },
};

const CATEGORY_LABELS: Record<string, { name: string; icon: string }> = {
  combat: { name: 'Combat', icon: '⚔️' },
  gathering: { name: 'Gathering', icon: '🌿' },
  artisan: { name: 'Artisan', icon: '🔨' },
  wealth: { name: 'Wealth', icon: '💰' },
  exploration: { name: 'Exploration', icon: '🗺️' },
  mastery: { name: 'Mastery', icon: '🌟' },
};

export function AchievementView({ state }: AchievementViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  const checkState: AchievementCheckState = state as unknown as AchievementCheckState;

  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(a => ({
      ...a,
      completed: a.check(checkState),
    }));
  }, [checkState]);

  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = achievements.length;

  const filtered = useMemo(() => {
    return achievements.filter(a => {
      if (filterCategory !== 'all' && a.category !== filterCategory) return false;
      if (!showCompleted && a.completed) return false;
      return true;
    });
  }, [achievements, filterCategory, showCompleted]);

  type AchWithStatus = Achievement & { completed: boolean };

  // Group by category
  const grouped: Record<string, AchWithStatus[]> = useMemo(() => {
    const groups: Record<string, AchWithStatus[]> = {};
    filtered.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3D3328] pb-6 gap-6">
        <div>
          <h2 className="text-5xl font-bold tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>Achievements</h2>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-xs text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {completedCount} / {totalCount} COMPLETED
            </div>
            <div className="h-1 w-1 bg-[#3D3328] rounded-full" />
            <div className="text-xs text-[#D4A943] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.floor((completedCount / totalCount) * 100)}% PROGRESS
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-64 h-2 bg-[#0D0B09] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#C17F4E] to-[#D4A943] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / totalCount) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(CATEGORY_LABELS)].map(cat => (
              <button
                key={cat}
                onClick={() => { playButtonPress(); setFilterCategory(cat); }}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-widest transition-all rounded-lg flex items-center gap-1.5 ${
                  filterCategory === cat
                    ? 'bg-[#D4A943] text-[#1A1510] font-bold shadow-[0_3px_0_0_#8A6E1E]'
                    : 'bg-[#1E1A16] border border-[#3D3328] shadow-[0_2px_0_0_#0D0B09] hover:text-[#E8E0D4]'
                }`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span>{cat === 'all' ? '📋' : CATEGORY_LABELS[cat].icon}</span>
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat].name}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[10px] text-[#7A6E60] uppercase tracking-widest cursor-pointer" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            <input type="checkbox" checked={showCompleted} onChange={() => setShowCompleted(!showCompleted)} className="accent-[#D4A943]" />
            Show Completed
          </label>
        </div>
      </div>

      {/* Achievement grid */}
      {Object.entries(grouped).map(([category, achs]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Cinzel', serif" }}>
            <span>{CATEGORY_LABELS[category]?.icon}</span>
            {CATEGORY_LABELS[category]?.name || category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achs.map((ach, i) => {
              const tier = TIER_COLORS[ach.tier];
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`card p-4 flex items-start gap-4 transition-all ${
                    ach.completed
                      ? `${tier.bg} ${tier.border} border-2`
                      : 'opacity-50 grayscale'
                  }`}
                >
                  <div className={`text-3xl ${ach.completed ? '' : 'opacity-40'}`}>{ach.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`text-sm font-bold ${ach.completed ? tier.text : 'text-[#7A6E60]'}`} style={{ fontFamily: "'Cinzel', serif" }}>
                        {ach.name}
                      </div>
                      {ach.completed && (
                        <span className="text-[8px] bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded-full uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          Done
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#B8A890] leading-relaxed">{ach.description}</div>
                    <div className={`text-[9px] uppercase tracking-widest mt-1 font-bold ${tier.text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {tier.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#7A6E60] text-sm">
          No achievements to display with current filters.
        </div>
      )}
    </div>
  );
}
