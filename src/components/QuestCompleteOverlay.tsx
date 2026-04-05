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
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [quest, onDismiss]);

  return (
    <AnimatePresence>
      {quest && (
        <motion.div
          key={quest.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onDismiss}
          className="fixed inset-0 z-[100] pointer-events-auto cursor-pointer flex items-center justify-center"
        >
          {/* Background dim */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Scroll unfurl effect — top and bottom borders */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute w-[400px] h-[1px] bg-gradient-to-r from-transparent via-[#D4A943] to-transparent top-[calc(50%-80px)]"
          />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="absolute w-[400px] h-[1px] bg-gradient-to-r from-transparent via-[#D4A943] to-transparent top-[calc(50%+80px)]"
          />

          {/* Center content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
            className="relative flex flex-col items-center gap-3 px-12 py-8"
          >
            {/* Trophy icon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-6xl"
            >
              🏆
            </motion.div>

            {/* QUEST COMPLETE label */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[11px] uppercase tracking-[0.4em] font-bold text-[#D4A943]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Quest Complete
            </motion.div>

            {/* Quest name */}
            <motion.h2
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="text-3xl font-bold tracking-tight text-[#E8E0D4] text-center"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {quest.questName}
            </motion.h2>

            {/* Difficulty badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
              className={`text-[10px] uppercase tracking-widest font-bold ${DIFFICULTY_COLORS[quest.difficulty] || 'text-[#7A6E60]'}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {quest.difficulty}
            </motion.div>

            {/* Click hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
              className="text-[9px] text-[#7A6E60] uppercase tracking-widest mt-3"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              click to dismiss
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
