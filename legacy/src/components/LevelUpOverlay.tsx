import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playLevelUp } from '../sounds';

export interface LevelUpEvent {
  id: string;
  skillName: string;
  newLevel: number;
}

interface LevelUpOverlayProps {
  levelUp: LevelUpEvent | null;
  onDismiss: () => void;
}

export function LevelUpOverlay({ levelUp, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    if (!levelUp) return;
    playLevelUp();
    const timer = setTimeout(onDismiss, 2000);
    return () => clearTimeout(timer);
  }, [levelUp, onDismiss]);

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          key={levelUp.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          onClick={onDismiss}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto cursor-pointer"
        >
          <div className="relative flex items-center gap-4 px-8 py-4 bg-[#0D0B09]/95 backdrop-blur-xl border-2 border-[#D4A943]/50 rounded-2xl shadow-[0_0_30px_rgba(212,169,67,0.3)]">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none notif-shimmer" />

            {/* Level number with glow */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
              className="relative"
            >
              <span
                className="text-5xl font-bold text-white"
                style={{
                  fontFamily: "'Cinzel', serif",
                  textShadow: '0 0 20px rgba(212, 169, 67, 0.6), 0 0 40px rgba(212, 169, 67, 0.3)',
                }}
              >
                {levelUp.newLevel}
              </span>
            </motion.div>

            {/* Text content */}
            <div className="relative">
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#D4A943]"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Level Up
              </motion.div>
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="text-xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {levelUp.skillName}
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
