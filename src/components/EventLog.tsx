import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameEvent } from '../useGame';

interface EventLogProps {
  events: GameEvent[];
  showNotifications?: boolean;
}

export function EventLog({ events, showNotifications = true }: EventLogProps) {
  if (!showNotifications) return null;

  return (
    <div className="fixed bottom-6 right-6 w-80 pointer-events-none z-50 space-y-2">
      <AnimatePresence initial={false}>
        {events.slice(0, 5).map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 0.8, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`p-3 border border-[#141414]/20 shadow-sm backdrop-blur-sm flex items-center gap-3 rounded-sm ${
              event.type === 'level' ? 'bg-yellow-400/90 text-[#141414]' : 
              event.type === 'loot' ? 'bg-[#141414]/80 text-[#E4E3E0]' : 
              'bg-[#E4E3E0]/80 text-[#141414]'
            }`}
          >
            <div className="text-xs font-serif italic font-bold tracking-tight">
              {event.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
