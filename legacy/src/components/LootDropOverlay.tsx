import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playRareDrop, playEpicDrop, playLegendaryDrop, playCelestialDrop } from '../sounds';

export interface LootDropEvent {
  id: string;
  itemName: string;
  itemIcon: string;
  quantity: number;
  rarity: 'rare' | 'epic' | 'legendary' | 'celestial';
}

interface LootDropOverlayProps {
  drop: LootDropEvent | null;
  onDismiss: () => void;
}

const RARITY_CONFIG = {
  rare: {
    label: 'RARE DROP',
    gradient: 'from-blue-600 via-blue-500 to-cyan-400',
    textColor: 'text-blue-300',
    glowColor: 'rgba(43, 95, 179, 0.6)',
    beamColor: 'rgba(43, 95, 179, 0.25)',
    borderColor: 'border-blue-400/50',
    playSound: playRareDrop,
    duration: 1800,
  },
  epic: {
    label: 'EPIC DROP',
    gradient: 'from-purple-700 via-red-500 to-pink-500',
    textColor: 'text-purple-300',
    glowColor: 'rgba(123, 63, 160, 0.6)',
    beamColor: 'rgba(123, 63, 160, 0.2)',
    borderColor: 'border-purple-400/50',
    playSound: playEpicDrop,
    duration: 2200,
  },
  legendary: {
    label: 'LEGENDARY DROP',
    gradient: 'from-yellow-600 via-amber-400 to-yellow-300',
    textColor: 'text-amber-300',
    glowColor: 'rgba(212, 169, 67, 0.7)',
    beamColor: 'rgba(212, 169, 67, 0.2)',
    borderColor: 'border-amber-400/50',
    playSound: playLegendaryDrop,
    duration: 2500,
  },
  celestial: {
    label: 'CELESTIAL DROP',
    gradient: 'from-cyan-400 via-white to-blue-400',
    textColor: 'text-cyan-200',
    glowColor: 'rgba(34, 211, 238, 0.7)',
    beamColor: 'rgba(34, 211, 238, 0.15)',
    borderColor: 'border-cyan-300/50',
    playSound: playCelestialDrop,
    duration: 3000,
  },
};

export function LootDropOverlay({ drop, onDismiss }: LootDropOverlayProps) {
  useEffect(() => {
    if (!drop) return;
    const config = RARITY_CONFIG[drop.rarity];
    config.playSound();
    const timer = setTimeout(onDismiss, config.duration);
    return () => clearTimeout(timer);
  }, [drop, onDismiss]);

  return (
    <AnimatePresence>
      {drop && (() => {
        const config = RARITY_CONFIG[drop.rarity];
        return (
          <motion.div
            key={drop.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onDismiss}
            className="fixed inset-0 z-[100] pointer-events-auto cursor-pointer flex items-center justify-center"
          >
            {/* Dark vignette */}
            <div className="absolute inset-0 bg-black/50" />

            {/* Loot beam — vertical light pillar */}
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 w-24 origin-bottom"
              style={{
                height: '100vh',
                background: `linear-gradient(to top, ${config.beamColor}, transparent 70%)`,
              }}
            />

            {/* Radial glow behind item */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.6] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle, ${config.glowColor}, transparent 70%)`,
              }}
            />

            {/* Item showcase card */}
            <motion.div
              initial={{ scale: 0.3, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.15 }}
              className={`relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 ${config.borderColor} bg-[#0D0B09]/90 backdrop-blur-xl shadow-2xl`}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none notif-shimmer" />

              {/* Rarity label */}
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={`text-[10px] uppercase tracking-[0.3em] font-bold ${config.textColor}`}
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {config.label}
              </motion.div>

              {/* Item icon with glow */}
              <motion.div
                animate={{
                  filter: [
                    `drop-shadow(0 0 8px ${config.glowColor})`,
                    `drop-shadow(0 0 20px ${config.glowColor})`,
                    `drop-shadow(0 0 8px ${config.glowColor})`,
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-8xl"
              >
                {drop.itemIcon}
              </motion.div>

              {/* Item name */}
              <motion.h3
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className={`text-2xl font-bold tracking-tight bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {drop.itemName}
              </motion.h3>

              {/* Quantity */}
              {drop.quantity > 1 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 400 }}
                  className="text-xs text-[#B8A890] uppercase tracking-widest"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  x{drop.quantity}
                </motion.div>
              )}

              {/* Click hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                className="text-[9px] text-[#7A6E60] uppercase tracking-widest mt-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                click to dismiss
              </motion.div>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
