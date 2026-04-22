import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSuccess } from '../sounds';

export interface QuestCompleteEvent {
  id: string;
  questName: string;
  difficulty: string;
}

interface QuestCompleteOverlayProps {
  quest: QuestCompleteEvent | null;
  onDismiss: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  novice: 'text-green-400',
  intermediate: 'text-blue-400',
  experienced: 'text-purple-400',
  master: 'text-amber-400',
  grandmaster: 'text-cyan-300',
};

export function QuestCompleteOverlay({ quest, onDismiss }: QuestCompleteOverlayProps) {
  useEffect(() => {
    if (!quest) return;
    playSuccess();
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [quest, onDismiss]);

  return (
    <AnimatePresence>
      {quest && (
        <motion.div
          key={quest.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={onDismiss}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto cursor-pointer"
        >
          <div className="relative flex items-center gap-4 px-8 py-4 bg-[#0D0B09]/95 backdrop-blur-xl border-2 border-[#D4A943]/50 rounded-2xl shadow-[0_0_30px_rgba(212,169,67,0.3)]">
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none notif-shimmer" />

            {/* Trophy */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
              className="text-4xl"
            >
              🏆
            </motion.div>

            {/* Text */}
            <div className="relative">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4A943]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Quest Complete
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-lg font-bold tracking-tight text-[#E8E0D4]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {quest.questName}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-[9px] uppercase tracking-widest font-bold ${DIFFICULTY_COLORS[quest.difficulty] || 'text-[#7A6E60]'}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {quest.difficulty}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
