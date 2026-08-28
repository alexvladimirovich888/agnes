import React from 'react';
import { motion } from 'motion/react';
import { Terminal, Github, Twitter } from 'lucide-react';

interface HeroProps {
  onOpenRunLocally: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenRunLocally
}) => {
  return (
    <section className="relative pt-4 pb-2 sm:pt-6 sm:pb-3 text-center shrink-0">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[180px] bg-white/[0.02] blur-[100px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6">
        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white mb-2"
        >
          AI that does more than <span className="italic font-serif opacity-70 text-zinc-400">chat</span>.
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-zinc-500 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed mb-4 font-light"
        >
          An open-source agent-native system. Hover over any entity to inspect its capabilities or send directives directly.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-2.5"
        >
          <button
            onClick={onOpenRunLocally}
            className="text-[9px] uppercase tracking-widest px-3.5 py-2 border border-zinc-800 rounded-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3 h-3 text-zinc-400" />
            <span>Run Locally</span>
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] uppercase tracking-widest px-3.5 py-2 border border-zinc-850 bg-zinc-900/40 rounded-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <Github className="w-3 h-3" />
            <span>GitHub</span>
          </a>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] uppercase tracking-widest px-3.5 py-2 border border-zinc-850 bg-zinc-900/40 rounded-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <Twitter className="w-3 h-3" />
            <span>X (Twitter)</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};


