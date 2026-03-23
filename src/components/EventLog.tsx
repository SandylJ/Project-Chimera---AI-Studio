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
    <div className="fixed bottom-6 right-6 pointer-events-none z-50 space-y-2 flex flex-col items-end">
      <AnimatePresence initial={false}>
        {events.slice(0, 5).map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 0.8, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`px-2 py-1 border border-[#141414]/10 shadow-sm backdrop-blur-md rounded-sm self-end w-max max-w-xs ${
              event.type === 'level' ? 'bg-yellow-400/80 text-[#141414]' : 
              event.type === 'loot' ? 'bg-[#141414]/60 text-[#E4E3E0]' : 
              'bg-[#E4E3E0]/60 text-[#141414]'
            }`}
          >
            <div className="text-[10px] whitespace-nowrap font-serif italic font-bold tracking-tight">
              {event.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
