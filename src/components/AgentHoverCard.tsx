import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AgentConfig } from '../types';
import { ArrowRight, Sparkles, MessageSquare } from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';

interface AgentHoverCardProps {
  agent: AgentConfig;
  onSelect: (agent: AgentConfig, initialPrompt?: string) => void;
}

export const AgentHoverCard: React.FC<AgentHoverCardProps> = ({
  agent,
  onSelect,
}) => {
  const [miniPrompt, setMiniPrompt] = useState('');

  const handleInputTrigger = () => {
    onSelect(agent, miniPrompt.trim() || undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(agent, miniPrompt.trim() || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -8, scale: 0.96 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute left-[calc(100%+16px)] top-1/2 -translate-y-1/2 w-76 sm:w-84 z-50 p-4 rounded-xl bg-[#09090b]/98 border border-zinc-700/90 shadow-2xl backdrop-blur-xl text-left select-text pointer-events-auto"
      style={{ filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.9))' }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header with avatar & status */}
      <div className="flex items-start justify-between gap-3 mb-2.5 pb-2.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="scale-90 origin-left">
            <AgentAvatar
              type={agent.avatarType}
              avatarUrl={agent.avatarUrl}
              size="sm"
              alt={agent.name}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {agent.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-tight uppercase">
              {agent.role}
            </p>
          </div>
        </div>

        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
          Agnes 2.5 Pro
        </span>
      </div>

      {/* Greeting & Capabilities Brief */}
      <div className="space-y-1.5 mb-3">
        <p className="text-xs text-zinc-200 font-medium leading-snug">
          {agent.personality.greeting}
        </p>
        <p className="text-[11px] text-zinc-400 leading-relaxed font-light line-clamp-2">
          {agent.description}
        </p>
      </div>

      {/* Specialties Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.specialties.slice(0, 3).map((spec, idx) => (
          <span
            key={idx}
            className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
          >
            {spec}
          </span>
        ))}
      </div>

      {/* Interactive Input Row: Clicking this immediately expands the chat */}
      <form onSubmit={handleSubmit} className="relative mt-2">
        <input
          type="text"
          value={miniPrompt}
          onChange={(e) => setMiniPrompt(e.target.value)}
          onClick={handleInputTrigger}
          onFocus={handleInputTrigger}
          placeholder={`Type instruction to expand chat...`}
          className="w-full pl-3 pr-8 py-2 text-xs bg-black border border-zinc-700/90 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 font-sans cursor-pointer transition-colors hover:border-zinc-500"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded bg-white text-black hover:bg-zinc-200 transition-colors"
          title="Open & Send"
        >
          <ArrowRight className="w-3 h-3" />
        </button>
      </form>

      {/* Quick Action Hint */}
      <div
        onClick={handleInputTrigger}
        className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-zinc-850/60 text-[9px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-2.5 h-2.5 text-zinc-400" />
          Click line to expand full chat
        </span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
          Interactive
        </span>
      </div>

      {/* Pointer triangle on the left edge pointing at the agent */}
      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 bg-[#09090b] border-l border-b border-zinc-700/90 rotate-45 pointer-events-none" />
    </motion.div>
  );
};
