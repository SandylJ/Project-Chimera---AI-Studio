import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ACTIONS, ITEMS, LEVEL_XP } from '../constants';
import { PlayerState, SkillId, SkillAction } from '../types';
import { playButtonPress } from '../sounds';

interface SkillViewProps {
  skillId: SkillId;
  state: PlayerState;
  startAction: (actionId: string) => void;
  stopAction: () => void;
  ascendSkill: (skillId: SkillId) => void;
}

export function SkillView({ skillId, state, startAction, stopAction, ascendSkill }: SkillViewProps) {
  const skill = state.skills[skillId];
  const skillActions = ACTIONS.filter(a => a.skill === skillId);
  const nextLevelXp = LEVEL_XP(skill.level + 1);
  const currentLevelXp = LEVEL_XP(skill.level);
  const progressToNext = ((skill.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  const ascensionCount = state.ascensions[skillId] || 0;
  const bestTool = state.inventory
    .map(i => ITEMS[i.itemId])
    .filter(item => item?.type === 'tool' && item.toolBonus?.skillId === skillId)
    .sort((a, b) => (b.toolBonus?.speedMultiplier || 1) - (a.toolBonus?.speedMultiplier || 1))[0];

  // Action completion detection — flash when progress resets
  const [completionFlash, setCompletionFlash] = useState(false);
  const [xpFloat, setXpFloat] = useState<number | null>(null);
  const prevProgressRef = useRef(0);
  const prevXpRef = useRef(skill.xp);

  useEffect(() => {
    const currentProgress = state.activeAction?.progress || 0;
    // Detect completion: progress was >80% and now dropped below 20% (reset)
    if (prevProgressRef.current > 80 && currentProgress < 20) {
      setCompletionFlash(true);
      setTimeout(() => setCompletionFlash(false), 400);

      // Show XP gained
      const xpDiff = skill.xp - prevXpRef.current;
      if (xpDiff > 0) {
        setXpFloat(xpDiff);
        setTimeout(() => setXpFloat(null), 700);
      }
    }
    prevProgressRef.current = currentProgress;
    prevXpRef.current = skill.xp;
  }, [state.activeAction?.progress, skill.xp]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#3D3328] pb-4 gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight capitalize flex items-center gap-4" style={{ fontFamily: "'Cinzel', serif" }}>
            {skillId}
            {ascensionCount > 0 && <span className="keycap keycap-sm keycap-gold text-[10px] uppercase tracking-widest">ASCENSION {ascensionCount}</span>}
            {bestTool && (
              <span className="text-[10px] uppercase tracking-widest bg-emerald-950/50 text-emerald-400 border border-emerald-800 px-2 py-1 rounded-lg flex items-center gap-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {bestTool.icon} {bestTool.name} ACTIVE
              </span>
            )}
          </h2>
          <div className="text-xs text-[#7A6E60] uppercase tracking-widest mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Level {skill.level} — {skill.xp.toLocaleString()} XP
          </div>
        </div>
        <div className="flex items-center gap-6">
          {skill.level >= 99 && (
            <button onClick={() => { playButtonPress(); ascendSkill(skillId); }}
              className="keycap keycap-gold text-[10px] uppercase tracking-widest animate-pulse" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Ascend Skill
            </button>
          )}
          <div className="w-64">
            <div className="flex justify-between text-[10px] text-[#7A6E60] mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              <span>PROGRESS</span><span>{Math.floor(progressToNext)}%</span>
            </div>
            <div className="progress-bar" style={{ height: '8px' }}>
              <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${progressToNext}%` }} transition={{ duration: 0.5 }} />
            </div>
          </div>
        </div>
      </div>

      {state.activeAction && ACTIONS.find(a => a.id === state.activeAction?.actionId)?.skill === skillId && (
        <div className={`bg-[#0D0B09] border text-[#E8E0D4] p-6 rounded-xl shadow-xl transition-all relative overflow-visible ${
          completionFlash ? 'border-[#D4A943] ring-2 ring-[#D4A943]/40' :
          state.activeAction.progress > 85 ? 'border-[#D4A943]/60' : 'border-[#D4A943]/30'
        }`}>
          {/* XP float on completion */}
          {xpFloat !== null && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute -top-2 right-6 text-emerald-400 font-bold text-sm pointer-events-none"
              style={{ fontFamily: "'JetBrains Mono', monospace", textShadow: '0 0 8px rgba(52, 211, 153, 0.5)' }}
            >
              +{xpFloat.toLocaleString()} XP
            </motion.div>
          )}
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>CURRENTLY PERFORMING</div>
              <div className="text-xl font-bold" style={{ fontFamily: "'Cinzel', serif" }}>{ACTIONS.find(a => a.id === state.activeAction?.actionId)?.name}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[10px] text-[#D4A943] font-bold uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {Math.floor(state.activeAction.progress)}%
              </div>
              <button onClick={() => { playButtonPress(); stopAction(); }}
                className="keycap keycap-sm text-xs uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</button>
            </div>
          </div>
          <div className="h-3 bg-[#1E1A16] rounded-full overflow-hidden relative">
            <motion.div className="h-full bg-gradient-to-r from-[#C17F4E] to-[#D4A943] rounded-full"
              initial={{ width: 0 }} animate={{ width: `${state.activeAction.progress}%` }} transition={{ duration: 0.1 }} />
            {state.activeAction.progress > 85 && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ boxShadow: 'inset 0 0 10px rgba(212, 169, 67, 0.5), 0 0 8px rgba(212, 169, 67, 0.3)' }}
              />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillActions.map(action => {
          const isLocked = skill.level < action.levelRequired ||
            (action.secondarySkillRequired && state.skills[action.secondarySkillRequired.skill].level < action.secondarySkillRequired.level);
          const isActive = state.activeAction?.actionId === action.id;
          return (
            <div key={action.id}
              className={`group relative card p-4 transition-all overflow-hidden ${
                isLocked ? 'cursor-not-allowed' : 'hover:bg-[#2A2520] hover:border-[#D4A943]/30 cursor-pointer'
              } ${isActive ? 'ring-2 ring-[#D4A943] ring-offset-2 ring-offset-[#151210]' : ''}`}
              onClick={() => { if (!isLocked) { playButtonPress(); startAction(action.id); } }}>
              {isLocked && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0D0B09] border border-red-900/50 rounded-lg">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-red-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    LVL {action.levelRequired}
                    {action.secondarySkillRequired && <> + LVL {action.secondarySkillRequired.level} {action.secondarySkillRequired.skill}</>}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start mb-3">
                <div className="text-lg font-bold leading-tight flex items-center gap-2">
                  {action.name}
                  {action.isMonster && <span className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>MOB</span>}
                  {action.isBoss && <span className="text-[8px] bg-purple-600 text-white px-1.5 py-0.5 rounded-full" style={{ fontFamily: "'JetBrains Mono', monospace" }}>BOSS</span>}
                </div>
                <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {Math.round((action.duration / (bestTool?.toolBonus?.speedMultiplier || 1)) / 100) / 10}s
                </div>
              </div>
              {action.description && <div className="text-[10px] text-[#7A6E60] mb-3 leading-relaxed italic" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{action.description}</div>}
              <div className="space-y-3">
                {action.isMonster && action.weakness && (
                  <div className="space-y-1">
                    <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>WEAKNESS</div>
                    <div className={`text-xs font-bold ${action.weakness === skillId ? 'text-emerald-400' : 'text-[#7A6E60]'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {action.weakness.toUpperCase()} {action.weakness === skillId && ' (BONUS ACTIVE)'}
                    </div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>REWARDS</div>
                  <div className="flex flex-wrap gap-2 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    <span className="bg-[#0D0B09] px-1.5 py-0.5 rounded-md">+{Math.floor(action.xpReward * (bestTool?.toolBonus?.xpMultiplier || 1))} XP</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>POTENTIAL LOOT</div>
                  <div className="flex flex-wrap gap-2 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {action.outputs.map(o => {
                      const item = ITEMS[o.itemId];
                      return (
                        <span key={o.itemId} className={`tooltip flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                          item?.rarity === 'celestial' ? 'rarity-bg-celestial rarity-celestial' :
                          item?.rarity === 'legendary' ? 'rarity-bg-legendary rarity-legendary' :
                          item?.rarity === 'epic' ? 'rarity-bg-epic rarity-epic' :
                          item?.rarity === 'rare' ? 'rarity-bg-rare rarity-rare' :
                          item?.rarity === 'uncommon' ? 'rarity-bg-uncommon rarity-uncommon' : 'bg-[#0D0B09]'
                        }`}>
                          {item?.icon} {o.quantity}
                          {o.chance < 1 && <span className="opacity-50 text-[10px]">({(o.chance * 100).toFixed(1)}%)</span>}
                          {item && (
                            <span className="tooltip-content !whitespace-normal !w-48">
                              <span className={`font-bold text-xs block mb-0.5 ${
                                item.rarity === 'celestial' ? 'rarity-celestial' :
                                item.rarity === 'legendary' ? 'rarity-legendary' :
                                item.rarity === 'epic' ? 'rarity-epic' :
                                item.rarity === 'rare' ? 'rarity-rare' :
                                item.rarity === 'uncommon' ? 'rarity-uncommon' : ''
                              }`} style={{ fontFamily: "'Cinzel', serif" }}>{item.name}</span>
                              <span className="tooltip-desc block leading-snug">{item.description}</span>
                              {item.stats && (
                                <span className="block border-t border-[#3D3328] pt-1 mt-1">
                                  {Object.entries(item.stats).filter(([,v]) => v !== 0).map(([stat, val]) => (
                                    <span key={stat} className="tooltip-stat text-emerald-400 mr-2">+{val} {stat}</span>
                                  ))}
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
                {(action.inputs || action.toolRequired) && (
                  <div className="space-y-1">
                    <div className="text-[9px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>REQUIRED</div>
                    <div className="flex flex-wrap gap-2 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {action.toolRequired && (
                        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                          state.inventory.some(i => i.itemId === action.toolRequired) ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'
                        }`}>{ITEMS[action.toolRequired]?.icon} {ITEMS[action.toolRequired]?.name}</span>
                      )}
                      {action.inputs?.map(i => {
                        const inv = state.inventory.find(invItem => invItem.itemId === i.itemId);
                        const hasEnough = inv && inv.quantity >= i.quantity;
                        return (
                          <span key={i.itemId} className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            hasEnough ? 'bg-emerald-950/50 text-emerald-400' : 'bg-red-950/50 text-red-400'
                          }`}>{ITEMS[i.itemId]?.icon} {i.quantity}</span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-[#3D3328] flex items-center justify-between">
                <div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{skillId.toUpperCase()}</div>
                {!isLocked && (
                  <div className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isActive ? 'text-emerald-400' : 'opacity-0 group-hover:opacity-100 text-[#D4A943]'
                  }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{isActive ? '● ACTIVE' : 'START ACTION'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
