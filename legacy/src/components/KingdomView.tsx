import React from 'react';
import { KINGDOM_WORKERS } from '../constants';
import { PlayerState } from '../types';
import { Users, TrendingUp, Coins, Sparkles, GraduationCap } from 'lucide-react';
import { playButtonPress, playSuccess } from '../sounds';

interface KingdomViewProps { state: PlayerState; hireWorker: (workerId: string) => void; }

export function KingdomView({ state, hireWorker }: KingdomViewProps) {
  const getWorkerCount = (id: string) => state.kingdom[id] || 0;
  const getWorkerCost = (worker: typeof KINGDOM_WORKERS[0]) => Math.floor(worker.baseCost * Math.pow(worker.costMultiplier, getWorkerCount(worker.id)));
  const getBonusIcon = (type: string) => {
    switch (type) { case 'gp': return <Coins size={14} className="text-[#D4A943]" />; case 'celestial_essence': return <Sparkles size={14} className="text-purple-400" />;
      case 'xp': return <GraduationCap size={14} className="text-blue-400" />; default: return <TrendingUp size={14} />; }
  };
  const totalGpPerSec = KINGDOM_WORKERS.filter(w => w.bonusType === 'gp').reduce((acc, w) => acc + (w.bonusValue * getWorkerCount(w.id)), 0);
  const totalEssencePerSec = KINGDOM_WORKERS.filter(w => w.bonusType === 'celestial_essence').reduce((acc, w) => acc + (w.bonusValue * getWorkerCount(w.id)), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#3D3328] pb-6">
        <div>
          <h2 className="text-5xl font-bold tracking-tighter uppercase" style={{ fontFamily: "'Cinzel', serif" }}>The Royal Kingdom</h2>
          <p className="text-sm text-[#B8A890] mt-2 max-w-xl">Manage your subjects. Workers provide passive benefits to your empire.</p>
        </div>
        <div className="flex gap-4">
          <div className="card px-4 py-2"><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Passive Income</div><div className="text-lg font-bold text-[#D4A943]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{totalGpPerSec.toLocaleString()} GP/s</div></div>
          <div className="card px-4 py-2"><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Passive Essence</div><div className="text-lg font-bold text-purple-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{totalEssencePerSec.toFixed(2)} /s</div></div>
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {KINGDOM_WORKERS.map(worker => {
          const count = getWorkerCount(worker.id); const cost = getWorkerCost(worker); const canAfford = state.gp >= cost;
          const missingReqs = worker.requirements.filter(req => state.skills[req.skillId].level < req.level); const meetsLevel = missingReqs.length === 0;
          const maxWorkers = 1 + Math.floor(state.skills[worker.primarySkillId].level / 20) * 2; const isAtMax = count >= maxWorkers;
          return (
            <div key={worker.id} className={`group relative card p-6 transition-all duration-300 ${meetsLevel ? 'hover:border-[#D4A943]/30 hover:-translate-y-1' : 'border-[#3D3328]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${meetsLevel ? '' : 'text-[#7A6E60]'}`} style={{ fontFamily: "'Cinzel', serif" }}>{worker.name}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {worker.requirements.map(req => {
                      const met = state.skills[req.skillId].level >= req.level;
                      const currentLevel = state.skills[req.skillId].level;
                      return (
                        <span key={req.skillId} className={`text-[10px] px-2 py-1 rounded-lg border font-bold uppercase tracking-wider ${
                          met ? 'border-emerald-800 bg-emerald-950/30 text-emerald-400' : 'border-red-800 bg-red-950/30 text-red-400'
                        }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                          {req.skillId} {currentLevel}/{req.level} {met ? '✓' : '✗'}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="w-10 h-10 bg-[#0D0B09] text-[#E8E0D4] flex items-center justify-center rounded-lg font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{count}</div>
                  <div className="text-[10px] text-[#7A6E60] mt-1 uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Max: {maxWorkers}</div>
                </div>
              </div>
              <p className={`text-sm mb-6 min-h-[40px] ${meetsLevel ? 'text-[#B8A890]' : 'text-[#7A6E60]'}`}>{worker.description}</p>
              <div className="flex items-center gap-2 mb-6 p-2 bg-[#0D0B09] rounded-lg">{getBonusIcon(worker.bonusType)}<span className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>+{worker.bonusValue} {worker.bonusType.replace('_', ' ')} /s</span></div>
              <button onClick={() => { if (canAfford && meetsLevel && !isAtMax) { playSuccess(); hireWorker(worker.id); } }} disabled={!canAfford || !meetsLevel || isAtMax}
                className={`w-full py-3 rounded-lg text-xs uppercase tracking-widest transition-all ${canAfford && meetsLevel && !isAtMax ? 'keycap keycap-gold' : 'bg-[#0D0B09] text-[#7A6E60] cursor-not-allowed'}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {!meetsLevel ? 'Requirements Not Met' : isAtMax ? `Max Reached (${maxWorkers})` : `Hire for ${cost.toLocaleString()} GP`}
              </button>
            </div>
          );
        })}
      </div>
      <section className="mt-12 card p-8 bg-[#0D0B09] border-[#3D3328]">
        <div className="flex items-center gap-4 mb-6"><Users size={32} className="text-[#D4A943]" /><h3 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Cinzel', serif" }}>Kingdom Statistics</h3></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Total Subjects</div><div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Object.values(state.kingdom).reduce((a, b) => a + b, 0)}</div></div>
          <div><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Active Bonuses</div><div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{KINGDOM_WORKERS.filter(w => getWorkerCount(w.id) > 0).length}</div></div>
          <div><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Royal Wealth</div><div className="text-2xl font-bold text-[#D4A943]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{state.gp.toLocaleString()} GP</div></div>
          <div><div className="text-[10px] text-[#7A6E60] uppercase tracking-widest mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Kingdom Tier</div><div className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{Math.floor(Object.values(state.kingdom).reduce((a, b) => a + b, 0) / 10) + 1}</div></div>
        </div>
      </section>
    </div>
  );
}
