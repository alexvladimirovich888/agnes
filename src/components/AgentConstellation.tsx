import React, { useEffect, useState } from 'react';
import { AgentConfig } from '../types';
import { AgentNode } from './AgentNode';

interface AgentConstellationProps {
  agents: AgentConfig[];
  onSelectAgent: (agent: AgentConfig, initialPrompt?: string) => void;
}

export const AgentConstellation: React.FC<AgentConstellationProps> = ({
  agents,
  onSelectAgent,
}) => {
  const [activeSpeech, setActiveSpeech] = useState<{
    agentId: string;
    text: string;
  } | null>(null);

  // Dynamic subtle speech bubble engine
  useEffect(() => {
    // Initial random greeting from an agent after 1.5s
    const initialTimer = setTimeout(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      if (randomAgent && randomAgent.personality.idlePhrases.length > 0) {
        const phrase = randomAgent.personality.idlePhrases[0];
        setActiveSpeech({ agentId: randomAgent.id, text: phrase });

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
          setActiveSpeech(null);
        }, 4000);
      }
    }, 1500);

    // Periodic organic speech triggers (every 9 to 14 seconds)
    const interval = setInterval(() => {
      if (agents.length === 0) return;
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const phrases = randomAgent.personality.idlePhrases;
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];

      setActiveSpeech({ agentId: randomAgent.id, text: phrase });

      // Auto fade out after 4.5 seconds
      setTimeout(() => {
        setActiveSpeech((current) => (current?.agentId === randomAgent.id ? null : current));
      }, 4500);
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [agents]);

  return (
    <section id="agents-canvas" className="relative py-4 sm:py-6 flex-1 flex items-center justify-center">
      {/* Organic Spatial Grid Layout (2-col grid with comfortable spacing on 1 screen) */}
      <div className="max-w-4xl w-full mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-2 gap-y-10 sm:gap-y-12 gap-x-12 sm:gap-x-28 md:gap-x-36 justify-items-center">
          {agents.map((agent) => (
            <AgentNode
              key={agent.id}
              agent={agent}
              currentSpeech={activeSpeech?.agentId === agent.id ? activeSpeech.text : null}
              onSelect={onSelectAgent}
            />
          ))}
        </div>
      </div>
    </section>
  );
};


