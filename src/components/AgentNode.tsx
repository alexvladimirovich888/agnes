import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentConfig } from '../types';
import { AgentAvatar } from './AgentAvatar';
import { AgentHoverCard } from './AgentHoverCard';
import { SpeechBubble } from './SpeechBubble';

interface AgentNodeProps {
  agent: AgentConfig;
  currentSpeech: string | null;
  onSelect: (agent: AgentConfig, initialPrompt?: string) => void;
}

export const AgentNode: React.FC<AgentNodeProps> = ({
  agent,
  currentSpeech,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative flex flex-col items-center select-none py-2 transition-all ${
        isHovered ? 'z-40' : 'z-10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Interactive Pop-up Window on Hover */}
      <AnimatePresence>
        {isHovered && (
          <AgentHoverCard
            agent={agent}
            onSelect={onSelect}
          />
        )}
      </AnimatePresence>

      {/* Autonomous idle Speech Bubble if not hovered */}
      {!isHovered && currentSpeech && (
        <SpeechBubble
          text={currentSpeech}
          agentName={agent.name}
          isVisible={Boolean(currentSpeech)}
        />
      )}

      {/* Agent Avatar Node */}
      <motion.div
        layoutId={`agent-card-${agent.id}`}
        id={`agent-node-${agent.id}`}
        onClick={() => onSelect(agent)}
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.2 }}
        className="group cursor-pointer flex flex-col items-center"
      >
        <div className="mb-3">
          <AgentAvatar
            type={agent.avatarType}
            avatarUrl={agent.avatarUrl}
            size="lg"
            isHovered={isHovered}
            alt={agent.name}
          />
        </div>

        {/* Agent Text Header */}
        <div className="text-center">
          <h3 className="text-white text-xs uppercase tracking-widest font-bold group-hover:text-zinc-200 transition-colors">
            {agent.name}
          </h3>
          <p className="text-[10px] text-zinc-500 uppercase tracking-tight mt-0.5">
            {agent.role}
          </p>
        </div>

        {/* Subtle indicator prompt tag on hover */}
        <div className="mt-1.5 text-[9px] uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
          Click to Interact
        </div>
      </motion.div>
    </div>
  );
};


