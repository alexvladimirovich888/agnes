import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentConfig, ChatMessage, ToolAction } from '../types';
import { AgentAvatar } from './AgentAvatar';
import ReactMarkdown from 'react-markdown';
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  Sliders,
  Copy,
  Check,
  Cpu,
  AlertCircle,
  Terminal,
  Activity,
  ArrowUpRight
} from 'lucide-react';

interface ChatWindowProps {
  agent: AgentConfig;
  messages: ChatMessage[];
  isLoading: boolean;
  initialPrompt?: string;
  onSendMessage: (text: string) => void;
  onClose: () => void;
  onClearHistory: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  agent,
  messages,
  isLoading,
  initialPrompt,
  onSendMessage,
  onClose,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // If initialPrompt was passed, optionally focus or send
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      onSendMessage(initialPrompt.trim());
      setInputText('');
    }
  }, [initialPrompt]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus textarea on open
  useEffect(() => {
    textareaRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        layoutId={`agent-card-${agent.id}`}
        id={`chat-window-${agent.id}`}
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 15 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl sm:max-w-3xl h-[85vh] max-h-[640px] flex flex-col rounded-xl bg-[#09090b] border border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Subtle ambient light */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Chat Window Header */}
        <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-[#09090b]">
          <div className="flex items-center gap-3">
            <div className="scale-90">
              <AgentAvatar
                type={agent.avatarType}
                avatarUrl={agent.avatarUrl}
                accentColor={agent.accentColor}
                size="sm"
                alt={agent.name}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  {agent.name}
                </h2>
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono tracking-widest uppercase text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Agnes 2.5 Pro Core
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase mt-0.5">
                {agent.role}
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClearHistory}
              className="p-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Messages Scroll Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* If no messages yet, show introductory briefing card */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto my-8 p-6 sm:p-8 rounded-xl bg-zinc-950 border border-zinc-850 text-center flex flex-col items-center"
          >
            <div className="mb-4">
              <AgentAvatar
                type={agent.avatarType}
                avatarUrl={agent.avatarUrl}
                accentColor={agent.accentColor}
                size="lg"
                isHovered={true}
                alt={agent.name}
              />
            </div>
            
            <h3 className="text-lg font-light tracking-tight text-white mb-2">
              {agent.personality.greeting}
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed max-w-lg mb-6 font-light">
              {agent.description}
            </p>

            {/* Specialties Badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {agent.specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono uppercase tracking-widest text-zinc-400"
                >
                  {spec}
                </span>
              ))}
            </div>

            {/* Quick Starter Prompts */}
            <div className="w-full text-left">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-zinc-400" />
                <span>Suggested Operational Directives:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {agent.samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputText(sample);
                      textareaRef.current?.focus();
                    }}
                    className="p-3 rounded-md bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-left text-xs text-zinc-300 transition-all flex items-center justify-between group"
                  >
                    <span>{sample}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Render Conversation Stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isAgent = msg.sender === 'agent';

          const accentTextColor = 
            agent.accentColor === 'amber' ? 'text-amber-400' :
            agent.accentColor === 'emerald' ? 'text-emerald-400' :
            agent.accentColor === 'purple' ? 'text-purple-400' :
            agent.accentColor === 'cyan' ? 'text-cyan-400' : 'text-blue-400';

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Agent Message Container (Telegram incoming message layout) */}
              {isAgent && (
                <div className="flex items-start gap-2.5 sm:gap-3 max-w-2xl sm:max-w-3xl group">
                  {/* Clean Agent Avatar next to response */}
                  <div className="shrink-0 pt-0.5">
                    <AgentAvatar
                      type={agent.avatarType}
                      avatarUrl={agent.avatarUrl}
                      size="sm"
                      alt={agent.name}
                    />
                  </div>

                  {/* Telegram-style incoming message bubble */}
                  <div
                    className={`rounded-2xl rounded-tl-sm p-3.5 sm:p-4.5 relative shadow-lg ${
                      msg.error
                        ? 'bg-rose-950/40 border border-rose-800/80 text-rose-200'
                        : 'bg-[#18222d] border border-[#223140] text-zinc-200'
                    }`}
                  >
                    {/* Header with Agent Name & Copy Action */}
                    <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-zinc-700/30">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold tracking-wide ${accentTextColor}`}>
                          {agent.name}
                        </span>
                        <span className="text-[10px] text-zinc-400/80 font-normal">
                          {agent.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="p-1 rounded hover:bg-zinc-700/40 text-zinc-400 hover:text-white transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Message Body */}
                    {msg.error ? (
                      <div className="flex items-center gap-2 text-sm text-rose-300">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{msg.text}</span>
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed space-y-2.5 prose prose-invert max-w-none text-zinc-200">
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !String(children).includes('\n');
                              return !isInline ? (
                                <div className="my-2.5 rounded-lg overflow-hidden border border-zinc-700/60 bg-[#0f141c]">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-[#141b24] border-b border-zinc-700/50 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                                    <span className="flex items-center gap-1.5">
                                      <Terminal className="w-3 h-3 text-zinc-400" />
                                      {match ? match[1] : 'code'}
                                    </span>
                                    <button
                                      onClick={() => copyToClipboard(String(children), `code-${Math.random()}`)}
                                      className="hover:text-white text-[10px] uppercase tracking-wider transition-colors"
                                    >
                                      Copy
                                    </button>
                                  </div>
                                  <pre className="p-3.5 overflow-x-auto text-xs font-mono text-zinc-200 leading-relaxed">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              ) : (
                                <code className="px-1.5 py-0.5 rounded bg-[#223140] text-zinc-100 text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Telegram-style Timestamp footer */}
                    <div className="flex items-center justify-end gap-1 mt-1.5 -mb-1 text-[10px] font-mono text-zinc-400/70">
                      <span>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* User Outgoing Message (Telegram outgoing bubble) */}
              {isUser && (
                <div className="max-w-xl sm:max-w-2xl rounded-2xl rounded-tr-sm px-4 py-3 bg-[#2b5278] border border-[#376694]/60 text-white shadow-md">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-50">
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] font-mono text-blue-200/70">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Loading Indicator (Telegram-style typing state with Agent Avatar) */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 sm:gap-3"
          >
            <div className="shrink-0 pt-0.5">
              <AgentAvatar
                type={agent.avatarType}
                avatarUrl={agent.avatarUrl}
                size="sm"
                alt={agent.name}
              />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#18222d] border border-[#223140] flex items-center gap-3 shadow-lg">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-mono text-zinc-300">
                {agent.name} is typing...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="relative z-10 p-4 sm:p-6 border-t border-zinc-800 bg-[#09090b]">
        <div className="max-w-4xl mx-auto">
          
          {/* Input Form */}
          <div className="relative flex items-end gap-2 p-2 rounded-lg bg-zinc-950 border border-zinc-800 focus-within:border-zinc-600 transition-colors shadow-inner">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Instruct ${agent.name} or describe a task... (Enter to send, Shift+Enter for new line)`}
              rows={1}
              className="flex-1 bg-transparent border-0 text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-0 focus:outline-none resize-none max-h-36 py-2 px-3 leading-relaxed font-sans"
              style={{ minHeight: '40px' }}
            />

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="text-[10px] uppercase tracking-widest px-3.5 py-2.5 bg-white hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white text-black font-semibold rounded-sm transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-1.5"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          <div className="flex items-center justify-between mt-2 px-1 text-[10px] font-mono tracking-widest uppercase text-zinc-600">
            <span>OpenBots · Powered by Agnes 2.5 Pro</span>
            <span>Esc to return to canvas</span>
          </div>

        </div>
      </div>
    </motion.div>
  </div>
  );
};
