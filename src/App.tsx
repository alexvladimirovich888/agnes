import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AgentConfig, ChatMessage } from './types';
import { INITIAL_AGENTS } from './lib/agents';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AgentConstellation } from './components/AgentConstellation';
import { ChatWindow } from './components/ChatWindow';
import { RunLocallyModal } from './components/RunLocallyModal';

export default function App() {
  // Load agents from storage or use default 4 agents
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    try {
      const saved = localStorage.getItem('openbots_agents_v9_uploaded_assets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(a => a.id === 'vex' || a.id === 'byte')) {
          // Merge avatarUrl if missing
          return parsed.map((p: AgentConfig) => {
            const init = INITIAL_AGENTS.find(a => a.id === p.id);
            return {
              ...p,
              avatarUrl: init?.avatarUrl || p.avatarUrl
            };
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached agents', e);
    }
    return INITIAL_AGENTS;
  });

  // Selected agent for expanded chat view
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(undefined);

  // Conversations history mapped by agentId
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('openbots_conversations_v6');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse cached conversations', e);
    }
    return {};
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRunLocallyOpen, setIsRunLocallyOpen] = useState(false);

  // Persist agents
  useEffect(() => {
    try {
      localStorage.setItem('openbots_agents_v9_uploaded_assets', JSON.stringify(agents));
    } catch (e) {
      console.warn('Could not save agents to localStorage', e);
    }
  }, [agents]);

  // Persist conversations
  useEffect(() => {
    try {
      localStorage.setItem('openbots_conversations_v6', JSON.stringify(conversations));
    } catch (e) {
      console.warn('Could not save conversations to localStorage', e);
    }
  }, [conversations]);

  // Select agent to talk to (with optional initial prompt from hover popup)
  const handleSelectAgent = (agent: AgentConfig, initialPrompt?: string) => {
    setSelectedAgent(agent);
    setPendingPrompt(initialPrompt);
  };

  // Clear conversation history for an agent
  const handleClearHistory = (agentId: string) => {
    setConversations((prev) => ({
      ...prev,
      [agentId]: []
    }));
  };

  // Send message to the backend
  const handleSendMessage = async (text: string) => {
    if (!selectedAgent) return;

    const agentId = selectedAgent.id;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      agentId,
      text,
      timestamp: Date.now()
    };

    // Update conversation state with user message
    const currentMessages = conversations[agentId] || [];
    const updatedMessages = [...currentMessages, userMsg];

    setConversations((prev) => ({
      ...prev,
      [agentId]: updatedMessages
    }));

    setIsLoading(true);

    try {
      // Build request payload for server-side Agnes 2.5 Pro Alpha API
      const payload = {
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        systemPrompt: selectedAgent.systemPrompt,
        customPrompt: selectedAgent.customPrompt,
        messages: updatedMessages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Something went wrong. Try again.');
      }

      const data = await response.json();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        agentId,
        text: data.reply || 'No response returned by agent.',
        timestamp: Date.now(),
        toolsUsed: data.toolsUsed
      };

      setConversations((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), agentMsg]
      }));

    } catch (err: any) {
      console.error('Chat execution failed:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'agent',
        agentId,
        text: err.message || 'Something went wrong. Try again.',
        timestamp: Date.now(),
        error: true
      };

      setConversations((prev) => ({
        ...prev,
        [agentId]: [...(prev[agentId] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#07080a] text-[#e1e4ea] bg-grid-pattern selection:bg-cyan-500/20 selection:text-cyan-200 flex flex-col font-sans overflow-hidden justify-between">
      
      {/* Top Minimal Navigation */}
      <Navbar
        onOpenRunLocally={() => setIsRunLocallyOpen(true)}
      />

      {/* Main Single-Screen Content Area */}
      <main className="flex-1 flex flex-col justify-center gap-6 sm:gap-8 py-2 sm:py-4 overflow-visible">
        
        {/* Minimal Hero Section */}
        <Hero
          onOpenRunLocally={() => setIsRunLocallyOpen(true)}
        />

        {/* The 4 Living Agents Constellation with Interactive Hover Cards */}
        <AgentConstellation
          agents={agents}
          onSelectAgent={handleSelectAgent}
        />

      </main>

      {/* Expanded Chat Transformation Window (Comfortably centered, non-fullscreen) */}
      <AnimatePresence>
        {selectedAgent && (
          <ChatWindow
            agent={selectedAgent}
            messages={conversations[selectedAgent.id] || []}
            isLoading={isLoading}
            initialPrompt={pendingPrompt}
            onSendMessage={handleSendMessage}
            onClose={() => {
              setSelectedAgent(null);
              setPendingPrompt(undefined);
            }}
            onClearHistory={() => handleClearHistory(selectedAgent.id)}
          />
        )}
      </AnimatePresence>

      {/* Run Locally / Open Source Guide Modal */}
      <RunLocallyModal
        isOpen={isRunLocallyOpen}
        onClose={() => setIsRunLocallyOpen(false)}
      />

    </div>
  );
}

