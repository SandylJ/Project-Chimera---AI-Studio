import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ACTIONS, ITEMS, LEVEL_XP } from '../constants';
import { PlayerState, SkillId, BountyTier, BountyContract } from '../types';

interface BountyBoardViewProps {
  state: PlayerState;
  requestBounty: (tier: BountyTier) => void;
  abandonBounty: () => void;
  startAction: (actionId: string) => void;
  stopAction: () => void;
  ascendSkill: (skillId: SkillId) => void;
  buyBountyItem: (itemId: string) => void;
}

const TIER_CONFIG: Record<BountyTier, { name: string; label: string; levelReq: number; killRange: string; multiplier: string; borderColor: string; bgAccent: string; textAccent: string }> = {
  iron: { name: 'Iron Board', label: 'IRON', levelReq: 1, killRange: '15–40', multiplier: '1×', borderColor: 'border-gray-400', bgAccent: 'bg-gray-400/10', textAccent: 'text-gray-500' },
  gold: { name: 'Gold Board', label: 'GOLD', levelReq: 40, killRange: '30–80', multiplier: '2×', borderColor: 'border-amber-400', bgAccent: 'bg-amber-400/10', textAccent: 'text-amber-600' },
  imperial: { name: 'Imperial Board', label: 'IMPERIAL', levelReq: 75, killRange: '50–150', multiplier: '4×', borderColor: 'border-purple-500', bgAccent: 'bg-purple-500/10', textAccent: 'text-purple-600' },
};

const SHOP_ITEMS = [
  { itemId: 'huntsmans_vizor', cost: 500 },
  { itemId: 'bounty_ring', cost: 300 },
  { itemId: 'hunters_insignia', cost: 750 },
];

export function BountyBoardView({ state, requestBounty, abandonBounty, startAction, stopAction, ascendSkill, buyBountyItem }: BountyBoardViewProps) {
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false);
  const [expandMonsters, setExpandMonsters] = useState(false);

  const skill = state.skills.slayer;
  const nextLevelXp = LEVEL_XP(skill.level + 1);
  const currentLevelXp = LEVEL_XP(skill.level);
  const progressToNext = ((skill.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  const ascensionCount = state.ascensions.slayer || 0;
  const contract = state.bountyContract;

  const slayerActions = ACTIONS.filter(a => a.skill === 'slayer');

  const isActivelyHunting = contract && state.activeAction?.actionId === contract.monsterId;
  const activeSlayerAction = state.activeAction ? ACTIONS.find(a => a.id === state.activeAction?.actionId && a.skill === 'slayer') : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ─── 1. Slayer Skill Header ─── */}
      <div className="flex items-end justify-between border-b border-[#141414] pb-4">
        <div>
          <h2 className="text-4xl font-serif italic font-bold tracking-tight flex items-center gap-4">
            Bounty Hunting
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
          {/* Bounty Marks */}
          <div className="text-right">
            <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Bounty Marks</div>
            <div className="text-xl font-mono font-bold">{state.bountyMarks.toLocaleString()}</div>
          </div>

          {/* Streak */}
          <div className="text-right">
            <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Streak</div>
            <div className="text-xl font-mono font-bold">{state.bountyStreak}</div>
          </div>

          {/* Total Completed */}
          <div className="text-right">
            <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Completed</div>
            <div className="text-xl font-mono font-bold">{state.totalBountiesCompleted}</div>
          </div>

          {/* Ascension */}
          {skill.level >= 99 && (
            <button
              onClick={() => ascendSkill('slayer')}
              className="px-4 py-2 border border-[#141414] text-[10px] font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-all animate-pulse"
            >
              Ascend Skill
            </button>
          )}

          {/* XP Bar */}
          <div className="w-48">
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

      {/* ─── 2. Active Contract Panel ─── */}
      {contract && (
        <div className="bg-[#141414] text-[#E4E3E0] p-6 rounded-sm shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">ACTIVE CONTRACT</div>
                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-sm ${
                  contract.tier === 'iron' ? 'bg-gray-500/30 text-gray-300' :
                  contract.tier === 'gold' ? 'bg-amber-500/30 text-amber-300' :
                  'bg-purple-500/30 text-purple-300'
                }`}>
                  {contract.tier}
                </span>
              </div>
              <div className="text-2xl font-serif italic font-bold">{contract.monsterName}</div>
            </div>

            <div className="flex items-center gap-4">
              {/* Reward Preview */}
              <div className="text-right">
                <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest mb-1">REWARD</div>
                <div className="text-xs font-mono">
                  <span className="text-amber-300">{contract.bountyMarkReward} marks</span>
                  <span className="opacity-40 mx-1">+</span>
                  <span className="text-blue-300">{contract.bonusXp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kill Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-mono mb-1">
              <span className="opacity-50">KILLS</span>
              <span>{contract.killsCompleted} / {contract.killsRequired}</span>
            </div>
            <div className="h-2 bg-[#E4E3E0]/10 overflow-hidden">
              <motion.div
                className="h-full bg-[#E4E3E0]"
                initial={{ width: 0 }}
                animate={{ width: `${(contract.killsCompleted / contract.killsRequired) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Action Progress (if actively fighting target) */}
          {isActivelyHunting && state.activeAction && (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] font-mono mb-1">
                <span className="opacity-50">ACTION PROGRESS</span>
                <span>{Math.floor(state.activeAction.progress)}%</span>
              </div>
              <div className="h-1 bg-[#E4E3E0]/10 overflow-hidden">
                <motion.div
                  className="h-full bg-green-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.activeAction.progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </div>
          )}

          {/* Contract Actions */}
          <div className="flex items-center gap-3">
            {isActivelyHunting ? (
              <button
                onClick={stopAction}
                className="px-4 py-2 border border-[#E4E3E0]/20 hover:bg-[#E4E3E0] hover:text-[#141414] transition-colors text-xs font-mono uppercase tracking-widest"
              >
                Stop Hunting
              </button>
            ) : (
              <button
                onClick={() => startAction(contract.monsterId)}
                className="px-4 py-2 bg-[#E4E3E0] text-[#141414] text-xs font-mono uppercase tracking-widest font-bold hover:bg-white transition-colors"
              >
                Hunt Target
              </button>
            )}

            {!showAbandonConfirm ? (
              <button
                onClick={() => setShowAbandonConfirm(true)}
                className="px-3 py-2 text-red-400 hover:text-red-300 text-[10px] font-mono uppercase tracking-widest transition-colors"
              >
                Abandon Contract
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-red-400">Streak will reset to 0. Sure?</span>
                <button
                  onClick={() => { abandonBounty(); setShowAbandonConfirm(false); }}
                  className="px-2 py-1 bg-red-500/20 text-red-300 text-[10px] font-mono uppercase tracking-widest hover:bg-red-500/40 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowAbandonConfirm(false)}
                  className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── 3. Bounty Board (Tier Cards) ─── */}
      <div>
        <h3 className="text-2xl font-serif italic font-bold mb-4">The Bounty Board</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['iron', 'gold', 'imperial'] as BountyTier[]).map(tier => {
            const cfg = TIER_CONFIG[tier];
            const isLocked = skill.level < cfg.levelReq;
            const hasContract = !!contract;

            return (
              <div
                key={tier}
                className={`relative border-2 ${cfg.borderColor} p-5 transition-all`}
              >
                {/* Lock badge */}
                {isLocked && (
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1.5 bg-[#0D0B09] border border-red-900/50 rounded-lg">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400">
                      LVL {cfg.levelReq} SLAYER
                    </span>
                  </div>
                )}

                <div className={`text-[9px] font-mono uppercase tracking-widest mb-2 ${cfg.textAccent}`}>
                  {cfg.label} TIER
                </div>
                <div className="text-lg font-serif italic font-bold mb-3">{cfg.name}</div>

                <div className="space-y-2 text-xs font-mono mb-4">
                  <div className="flex justify-between">
                    <span className="opacity-50">Level Req</span>
                    <span>{cfg.levelReq}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-50">Kill Range</span>
                    <span>{cfg.killRange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-50">Mark Multiplier</span>
                    <span className="font-bold">{cfg.multiplier}</span>
                  </div>
                </div>

                <button
                  onClick={() => requestBounty(tier)}
                  disabled={isLocked || hasContract}
                  className={`w-full py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${
                    isLocked || hasContract
                      ? 'bg-[#141414]/10 text-[#141414]/30 cursor-not-allowed'
                      : 'bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/80'
                  }`}
                >
                  {hasContract ? 'Contract Active' : 'Accept Contract'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 4. Bounty Mark Shop ─── */}
      <div>
        <h3 className="text-2xl font-serif italic font-bold mb-1">Bounty Mark Exchange</h3>
        <div className="text-[10px] font-mono opacity-40 uppercase tracking-widest mb-4">
          SPEND MARKS ON EXCLUSIVE HUNTER GEAR
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SHOP_ITEMS.map(({ itemId, cost }) => {
            const item = ITEMS[itemId];
            if (!item) return null;

            const owned = state.inventory.some(i => i.itemId === itemId && i.quantity > 0);
            const canAfford = state.bountyMarks >= cost;

            return (
              <div key={itemId} className="border border-[#141414] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-sm font-serif italic font-bold">{item.name}</div>
                    <div className="text-[10px] font-mono opacity-50 mt-0.5">{item.description}</div>
                  </div>
                  {item.rarity && (
                    <span className={`text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 ${
                      item.rarity === 'legendary' ? 'bg-purple-500/10 text-purple-600' :
                      item.rarity === 'epic' ? 'bg-orange-500/10 text-orange-600' :
                      item.rarity === 'rare' ? 'bg-blue-500/10 text-blue-600' :
                      'bg-gray-500/10 text-gray-600'
                    }`}>
                      {item.rarity}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {item.stats && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {Object.entries(item.stats).filter(([, v]) => v).map(([stat, val]) => (
                      <span key={stat} className="text-[10px] font-mono bg-[#141414]/5 px-1.5 py-0.5">
                        {stat.toUpperCase()} +{val}
                      </span>
                    ))}
                  </div>
                )}

                {/* Cost & Buy */}
                <div className="flex items-center justify-between pt-3 border-t border-[#141414]/10">
                  <div className="text-xs font-mono font-bold">{cost} marks</div>
                  {owned ? (
                    <span className="text-[10px] font-mono text-green-600 uppercase tracking-widest">Owned</span>
                  ) : (
                    <button
                      onClick={() => buyBountyItem(itemId)}
                      disabled={state.bountyMarks < cost}
                      className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors ${
                        state.bountyMarks >= cost
                          ? 'bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/80'
                          : 'bg-[#141414]/10 text-[#141414]/30 cursor-not-allowed'
                      }`}
                    >
                      {state.bountyMarks >= cost ? 'Buy' : 'Need Marks'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Available Slayer Monsters ─── */}
      <div>
        <button
          onClick={() => setExpandMonsters(!expandMonsters)}
          className="flex items-center gap-2 text-2xl font-serif italic font-bold mb-4 hover:opacity-70 transition-opacity"
        >
          <span className={`text-sm transition-transform ${expandMonsters ? 'rotate-90' : ''}`}>▶</span>
          Slayer Bestiary
          <span className="text-[10px] font-mono opacity-40 uppercase tracking-widest not-italic ml-2">
            {slayerActions.length} creatures
          </span>
        </button>

        {expandMonsters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slayerActions.map(action => {
              const isLocked = skill.level < action.levelRequired;
              const isActive = state.activeAction?.actionId === action.id;
              const isContractTarget = contract?.monsterId === action.id;

              return (
                <div
                  key={action.id}
                  className={`group relative border p-4 transition-all overflow-hidden ${
                    isContractTarget ? 'border-amber-400 border-2' : 'border-[#141414]'
                  } ${
                    isLocked ? 'bg-[#141414]/5 cursor-not-allowed' : 'hover:bg-[#141414] hover:text-[#E4E3E0] cursor-pointer'
                  } ${isActive ? 'ring-2 ring-[#141414] ring-offset-2' : ''}`}
                  onClick={() => !isLocked && startAction(action.id)}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#E4E3E0]/60 backdrop-blur-[1px] z-10">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] -rotate-12 border border-[#141414] px-2 py-1 bg-[#E4E3E0]">
                        LOCKED — LVL {action.levelRequired}
                      </div>
                    </div>
                  )}

                  {/* Contract Target Badge */}
                  {isContractTarget && (
                    <div className="absolute top-2 right-2 text-[8px] font-mono uppercase tracking-widest bg-amber-400 text-[#141414] px-1.5 py-0.5 font-bold z-5">
                      CONTRACT TARGET
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-3">
                    <div className="text-lg font-serif italic font-bold leading-tight flex items-center gap-2">
                      {action.name}
                      {action.isBoss && <span className="text-[8px] bg-purple-600 text-white px-1 rounded-full not-italic font-mono">BOSS</span>}
                      {action.isMonster && !action.isBoss && <span className="text-[8px] bg-red-500 text-white px-1 rounded-full not-italic font-mono">MOB</span>}
                    </div>
                    <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
                      {Math.round(action.duration / 100) / 10}s
                    </div>
                  </div>

                  {action.description && (
                    <div className="text-[10px] font-mono opacity-60 mb-3 leading-relaxed italic">
                      {action.description}
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Weakness */}
                    {action.weakness && (
                      <div className="space-y-1">
                        <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">WEAKNESS</div>
                        <div className="text-xs font-mono font-bold opacity-60">
                          {action.weakness.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* Rewards */}
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">REWARDS</div>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        <span className="bg-[#141414]/5 group-hover:bg-[#E4E3E0]/10 px-1.5 py-0.5 rounded-sm">
                          +{action.xpReward.toLocaleString()} XP
                        </span>
                      </div>
                    </div>

                    {/* Loot */}
                    <div className="space-y-1">
                      <div className="text-[9px] font-mono opacity-40 uppercase tracking-widest">POTENTIAL LOOT</div>
                      <div className="flex flex-wrap gap-2 text-xs font-mono">
                        {action.outputs.map(o => {
                          const item = ITEMS[o.itemId];
                          return (
                            <span
                              key={o.itemId}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm ${
                                item?.rarity === 'legendary' ? 'bg-purple-500/10 text-purple-700 group-hover:text-purple-300' :
                                item?.rarity === 'rare' ? 'bg-blue-500/10 text-blue-700 group-hover:text-blue-300' :
                                'bg-[#141414]/5 group-hover:bg-[#E4E3E0]/10'
                              }`}
                            >
                              {item?.icon} {o.quantity}
                              {o.chance < 1 && <span className="opacity-50 text-[10px]">({(o.chance * 100).toFixed(1)}%)</span>}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inputs */}
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
                      LVL {action.levelRequired} SLAYER
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
        )}
      </div>
    </div>
  );
}
