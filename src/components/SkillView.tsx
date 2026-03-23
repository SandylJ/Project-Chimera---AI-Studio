import React from 'react';
import { motion } from 'motion/react';
import { ACTIONS, ITEMS, LEVEL_XP } from '../constants';
import { PlayerState, SkillId, SkillAction } from '../types';

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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Skill Header */}
      <div className="flex items-end justify-between border-b border-[#141414] pb-4">
        <div>
          <h2 className="text-4xl font-serif italic font-bold tracking-tight capitalize flex items-center gap-4">
            {skillId}
            {ascensionCount > 0 && (
              <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest bg-[#141414] text-[#E4E3E0] px-2 py-1">
                ASCENSION {ascensionCount}
              </span>
            )}
          </h2>
          <div className="text-xs font-mono opacity-50 uppercase tracking-widest mt-1">
            Level {skill.level} — {skill.xp.toLocaleString()} XP
          </div>
        </div>
        <div className="flex items-center gap-6">
          {skill.level >= 99 && (
            <button
              onClick={() => ascendSkill(skillId)}
              className="px-4 py-2 border border-[#141414] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all animate-pulse"
            >
              Ascend Skill
            </button>
          )}
          <div className="w-64">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span>PROGRESS</span>
              <span>{Math.floor(progressToNext)}%</span>
            </div>
            <div className="h-1 bg-[#141414]/10 overflow-hidden">
              <motion.div 
                className="h-full bg-[#141414]"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Action */}
      {state.activeAction && ACTIONS.find(a => a.id === state.activeAction?.actionId)?.skill === skillId && (
        <div className="bg-[#141414] text-[#E4E3E0] p-6 rounded-sm shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">CURRENTLY PERFORMING</div>
              <div className="text-xl font-serif italic font-bold">
                {ACTIONS.find(a => a.id === state.activeAction?.actionId)?.name}
              </div>
            </div>
            <button 
              onClick={stopAction}
              className="px-4 py-2 border border-[#E4E3E0]/20 hover:bg-[#E4E3E0] hover:text-[#141414] transition-colors text-xs font-mono uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
          <div className="h-2 bg-[#E4E3E0]/10 overflow-hidden">
            <motion.div 
              className="h-full bg-[#E4E3E0]"
              initial={{ width: 0 }}
              animate={{ width: `${state.activeAction.progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillActions.map(action => {
          const isLocked = skill.level < action.levelRequired || 
            (action.secondarySkillRequired && state.skills[action.secondarySkillRequired.skill].level < action.secondarySkillRequired.level);
          const isActive = state.activeAction?.actionId === action.id;
          
          return (
            <div 
              key={action.id}
              className={`group relative border border-[#141414] p-4 transition-all overflow-hidden ${
                isLocked ? 'bg-[#141414]/5 cursor-not-allowed' : 'hover:bg-[#141414] hover:text-[#E4E3E0] cursor-pointer'
              } ${isActive ? 'ring-2 ring-[#141414] ring-offset-2' : ''}`}
              onClick={() => !isLocked && startAction(action.id)}
            >
              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#E4E3E0]/60 backdrop-blur-[1px] z-10">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] -rotate-12 border border-[#141414] px-2 py-1 bg-[#E4E3E0]">
                    LOCKED — LVL {action.levelRequired} {action.skill}
                    {action.secondarySkillRequired && <br/>}
                    {action.secondarySkillRequired && `LVL ${action.secondarySkillRequired.level} ${action.secondarySkillRequired.skill}`}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <div className="text-lg font-serif italic font-bold leading-tight flex items-center gap-2">
                  {action.name}
                  {action.isMonster && <span className="text-[8px] bg-red-500 text-white px-1 rounded-full not-italic font-mono">MOB</span>}
                </div>
                <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                  {action.duration / 1000}s
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Weakness */}
                {action.isMonster && action.weakness && (
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">WEAKNESS</div>
                    <div className={`text-xs font-mono font-bold ${action.weakness === skillId ? 'text-green-600 group-hover:text-green-400' : 'opacity-60'}`}>
                      {action.weakness.toUpperCase()} {action.weakness === skillId && ' (BONUS ACTIVE)'}
                    </div>
                  </div>
                )}
                {/* Rewards */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">REWARDS</div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    <span className="bg-[#141414]/5 group-hover:bg-[#E4E3E0]/10 px-1.5 py-0.5 rounded-sm">+{action.xpReward} XP</span>
                    {action.outputs.map(o => (
                      <span key={o.itemId} className="flex items-center gap-1 bg-[#141414]/5 group-hover:bg-[#E4E3E0]/10 px-1.5 py-0.5 rounded-sm">
                        {ITEMS[o.itemId]?.icon} {o.quantity}
                        {o.chance < 1 && <span className="opacity-50 text-[10px]">({(o.chance * 100).toFixed(1)}%)</span>}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Costs */}
                {action.inputs && action.inputs.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">REQUIRED</div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {action.inputs.map(i => {
                        const inv = state.inventory.find(invItem => invItem.itemId === i.itemId);
                        const hasEnough = inv && inv.quantity >= i.quantity;
                        return (
                          <span 
                            key={i.itemId} 
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm ${
                              hasEnough ? 'bg-green-500/10 text-green-700 group-hover:text-green-300' : 'bg-red-500/10 text-red-700 group-hover:text-red-300'
                            }`}
                          >
                            {ITEMS[i.itemId]?.icon} {i.quantity}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#141414]/10 group-hover:border-[#E4E3E0]/20 flex items-center justify-between">
                <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                  {skillId.toUpperCase()}
                </div>
                {!isLocked && (
                  <div className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                    isActive ? 'text-green-600 group-hover:text-green-400' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    {isActive ? '● ACTIVE' : 'START ACTION'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
