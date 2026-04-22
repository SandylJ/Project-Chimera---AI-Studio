import React, { useEffect, useState } from 'react';
import { ActiveDecision } from '../types';

interface Props {
  decision: ActiveDecision | undefined;
  onChoose: (optionId: string) => void;
}

export const DecisionModal: React.FC<Props> = ({ decision, onChoose }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!decision) return;
    const id = window.setInterval(() => setTick(t => t + 1), 250);
    return () => window.clearInterval(id);
  }, [decision]);

  if (!decision) return null;
  const secondsLeft = Math.max(0, Math.ceil((decision.expiresAt - Date.now()) / 1000));

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.2s ease' }}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-gradient-to-b from-[#2B231B] to-[#1E1A16] border-2 border-[#D4A943] rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4"
           style={{ boxShadow: '0 0 80px rgba(212, 169, 67, 0.3)' }}>
        <div className="flex items-center gap-3">
          <div className="text-5xl">{decision.icon}</div>
          <div>
            <div className="text-xs text-[#D4A943] uppercase tracking-[0.3em] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Decision
            </div>
            <div className="text-xl font-bold text-[#F2E6A8]" style={{ fontFamily: "'Cinzel', serif" }}>
              {decision.title}
            </div>
          </div>
          <div className="ml-auto text-xs text-[#B8A890] font-bold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {secondsLeft}s
          </div>
        </div>
        <p className="text-sm text-[#B8A890] italic">{decision.description}</p>
        <div className="space-y-2">
          {decision.options.map(opt => (
            <button
              key={opt.id}
              disabled={opt.disabled}
              onClick={() => onChoose(opt.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all
                ${opt.disabled
                  ? 'bg-[#0A0806] border-[#1E1A16] opacity-50 cursor-not-allowed'
                  : 'bg-[#14100C] border-[#3D3328] hover:border-[#D4A943] hover:bg-[#2B231B]'}`}
            >
              <div className="font-bold text-[#F2E6A8]">{opt.label}</div>
              <div className="text-xs text-[#B8A890] mt-1">{opt.description}</div>
              {opt.disabled && opt.disabledReason && (
                <div className="text-[10px] text-[#E86E6E] mt-1">{opt.disabledReason}</div>
              )}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-[#7A6E60] text-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Auto-picks "{decision.options.find(o => o.id === decision.defaultOptionId)?.label}" in {secondsLeft}s
        </div>
      </div>
    </div>
  );
};
