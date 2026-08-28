import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SpeechBubbleProps {
  text: string | null;
  agentName: string;
  accentColor?: string;
  isVisible: boolean;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  isVisible
}) => {
  return (
    <AnimatePresence>
      {isVisible && text && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none whitespace-nowrap"
        >
          <div className="relative bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-lg text-[11px] text-zinc-300 shadow-2xl font-sans tracking-wide">
            "{text}"
            {/* Subtle pointer arrow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

