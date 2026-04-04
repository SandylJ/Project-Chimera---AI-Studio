import React from 'react';
import { KINGDOM_WORKERS } from '../constants';
import { PlayerState } from '../types';
import { Users, TrendingUp, Coins, Sparkles, GraduationCap, Sword } from 'lucide-react';

interface KingdomViewProps {
  state: PlayerState;
  hireWorker: (workerId: string) => void;
}

export function KingdomView({ state, hireWorker }: KingdomViewProps) {
  const getWorkerCount = (id: string) => state.kingdom[id] || 0;

  const getWorkerCost = (worker: typeof KINGDOM_WORKERS[0]) => {
    const count = getWorkerCount(worker.id);
    return Math.floor(worker.baseCost * Math.pow(worker.costMultiplier, count));
  };

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'gp': return <Coins size={14} className="text-yellow-600" />;
      case 'celestial_essence': return <Sparkles size={14} className="text-purple-600" />;
      case 'xp': return <GraduationCap size={14} className="text-blue-600" />;
      default: return <TrendingUp size={14} />;
    }
  };

  const totalGpPerSec = KINGDOM_WORKERS
    .filter(w => w.bonusType === 'gp')
    .reduce((acc, w) => acc + (w.bonusValue * getWorkerCount(w.id)), 0);

  const totalEssencePerSec = KINGDOM_WORKERS
    .filter(w => w.bonusType === 'celestial_essence')
    .reduce((acc, w) => acc + (w.bonusValue * getWorkerCount(w.id)), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#141414] pb-6">
        <div>
          <h2 className="text-5xl font-serif italic font-bold tracking-tighter uppercase">The Royal Kingdom</h2>
          <p className="text-sm font-serif italic opacity-60 mt-2 max-w-xl">
            Manage your subjects and expand your influence. Hired workers provide passive benefits to your empire, 
            generating wealth and knowledge while you focus on greater deeds.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 bg-[#141414]/5 border border-[#141414]/10 rounded-sm">
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Passive Income</div>
            <div className="text-lg font-mono font-bold">{totalGpPerSec.toLocaleString()} GP/s</div>
          </div>
          <div className="px-4 py-2 bg-[#141414]/5 border border-[#141414]/10 rounded-sm">
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Passive Essence</div>
            <div className="text-lg font-mono font-bold">{totalEssencePerSec.toFixed(2)} /s</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {KINGDOM_WORKERS.map(worker => {
          const count = getWorkerCount(worker.id);
          const cost = getWorkerCost(worker);
          const canAfford = state.gp >= cost;
          const missingReqs = worker.requirements.filter(req => state.skills[req.skillId].level < req.level);
          const meetsLevel = missingReqs.length === 0;
          const primarySkillLevel = state.skills[worker.primarySkillId].level;
          const maxWorkers = 1 + Math.floor(primarySkillLevel / 20) * 2;
          const isAtMax = count >= maxWorkers;

          return (
            <div 
              key={worker.id}
              className={`group relative border border-[#141414] p-6 transition-all duration-300 ${
                meetsLevel ? 'bg-white hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]' : 'bg-[#141414]/5 opacity-60 grayscale'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-serif italic font-bold tracking-tight">{worker.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {worker.requirements.map(req => (
                      <span 
                        key={req.skillId}
                        className={`text-[9px] font-mono px-1.5 py-0.5 border ${
                          state.skills[req.skillId].level >= req.level 
                            ? 'border-[#141414]/20 opacity-50' 
                            : 'border-red-500 text-red-600 font-bold'
                        } uppercase tracking-tighter`}
                      >
                        {req.skillId} {req.level}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-10 h-10 bg-[#141414] text-[#E4E3E0] flex items-center justify-center rounded-sm font-mono font-bold">
                    {count}
                  </div>
                  <div className="text-[10px] font-mono opacity-50 mt-1 uppercase">
                    Max: {maxWorkers}
                  </div>
                </div>
              </div>

              <p className="text-sm font-serif italic opacity-70 mb-6 min-h-[40px]">
                {worker.description}
              </p>

              <div className="flex items-center gap-2 mb-6 p-2 bg-[#141414]/5 rounded-sm">
                {getBonusIcon(worker.bonusType)}
                <span className="text-xs font-mono font-bold uppercase tracking-wider">
                  +{worker.bonusValue} {worker.bonusType.replace('_', ' ')} /s
                </span>
              </div>

              <button
                onClick={() => hireWorker(worker.id)}
                disabled={!canAfford || !meetsLevel || isAtMax}
                className={`w-full py-3 font-mono text-xs uppercase tracking-widest transition-all ${
                  canAfford && meetsLevel && !isAtMax
                    ? 'bg-[#141414] text-[#E4E3E0] hover:bg-[#141414]/90'
                    : 'bg-[#141414]/10 text-[#141414]/40 cursor-not-allowed'
                }`}
              >
                {!meetsLevel 
                  ? `Requirements Not Met` 
                  : isAtMax 
                    ? `Max Reached (${maxWorkers})` 
                    : `Hire for ${cost.toLocaleString()} GP`}
              </button>

              {!meetsLevel && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#E4E3E0]/40 backdrop-blur-[1px] pointer-events-none">
                  <div className="px-4 py-2 bg-[#141414] text-[#E4E3E0] text-[10px] font-mono uppercase tracking-widest rotate-[-5deg]">
                    Missing Requirements
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <section className="mt-12 p-8 border border-[#141414] bg-[#141414] text-[#E4E3E0]">
        <div className="flex items-center gap-4 mb-6">
          <Users size={32} />
          <h3 className="text-3xl font-serif italic font-bold tracking-tight">Kingdom Statistics</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">Total Subjects</div>
            <div className="text-2xl font-mono font-bold">
              {Object.values(state.kingdom).reduce((a, b) => a + b, 0)}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">Active Bonuses</div>
            <div className="text-2xl font-mono font-bold">
              {KINGDOM_WORKERS.filter(w => getWorkerCount(w.id) > 0).length}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">Royal Wealth</div>
            <div className="text-2xl font-mono font-bold">{state.gp.toLocaleString()} GP</div>
          </div>
          <div>
            <div className="text-[10px] font-mono opacity-50 uppercase tracking-widest mb-1">Kingdom Tier</div>
            <div className="text-2xl font-mono font-bold">
              {Math.floor(Object.values(state.kingdom).reduce((a, b) => a + b, 0) / 10) + 1}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
