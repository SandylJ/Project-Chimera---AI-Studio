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
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [levelUp, onDismiss]);

  return (
    <AnimatePresence>
      {levelUp && (
        <motion.div
          key={levelUp.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onDismiss}
          className="fixed inset-0 z-[100] pointer-events-auto cursor-pointer flex items-center justify-center"
        >
          {/* Gold flash overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0.08] }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-b from-amber-400/20 via-transparent to-amber-400/10"
          />

          {/* Particle burst — radiating lines */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: [0, 3], opacity: [0.8, 0] }}
              transition={{ duration: 1.2, delay: 0.1 + i * 0.03, ease: 'easeOut' }}
              className="absolute w-1 h-16 bg-gradient-to-t from-amber-400 to-transparent rounded-full"
              style={{
                transform: `rotate(${i * 30}deg)`,
                transformOrigin: 'center bottom',
              }}
            />
          ))}

          {/* Center content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            className="relative flex flex-col items-center gap-3"
          >
            {/* Glow ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-16 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212, 169, 67, 0.4), transparent 70%)',
              }}
            />

            {/* LEVEL UP text */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-[11px] uppercase tracking-[0.4em] font-bold text-amber-400"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Level Up
            </motion.div>

            {/* Skill name */}
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="text-5xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {levelUp.skillName}
            </motion.h2>

            {/* Level number */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
              className="flex items-baseline gap-2"
            >
              <span
                className="text-8xl font-bold text-white drop-shadow-[0_0_20px_rgba(212,169,67,0.5)]"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {levelUp.newLevel}
              </span>
            </motion.div>

            {/* Click hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
              className="text-[9px] text-[#7A6E60] uppercase tracking-widest mt-4"
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
