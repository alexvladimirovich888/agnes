import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Copy, Check, HardDrive, Cpu, ShieldCheck, Github, Twitter } from 'lucide-react';

interface RunLocallyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RunLocallyModal: React.FC<RunLocallyModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const cliCommand = `# Install OpenBots CLI & Agent Engine
curl -fsSL https://get.openbots-ai.dev/install.sh | bash

# Run OpenBots locally with Agnes 2.5 Pro acceleration
openbots run agnes-2.5-pro --port 8080 --tools all`;

  const dockerCommand = `# Pull and run official OpenBots container
docker run -d --gpus all -p 8080:8080 \\
  -v ~/.openbots/weights:/models \\
  ghcr.io/openbots-ai/agnes-2.5-pro:latest`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="relative w-full max-w-2xl rounded-xl bg-[#09090b] border border-zinc-800 shadow-2xl p-6 sm:p-8 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold uppercase tracking-wider text-white">
                    Run OpenBots Locally
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                    Powered by Agnes 2.5 Pro · Sovereign Execution · Zero Telemetry
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-zinc-300">
              
              {/* Option 1: Native CLI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    Option 1: Quick Install (Linux / macOS / WSL)
                  </span>
                  <button
                    onClick={() => copyText(cliCommand, 'cli')}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white"
                  >
                    {copiedSection === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'cli' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-md bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                  <code>{cliCommand}</code>
                </pre>
              </div>

              {/* Option 2: Docker Container */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                    Option 2: Production Docker Runtime
                  </span>
                  <button
                    onClick={() => copyText(dockerCommand, 'docker')}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-white"
                  >
                    {copiedSection === 'docker' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSection === 'docker' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="p-3.5 rounded-md bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed">
                  <code>{dockerCommand}</code>
                </pre>
              </div>

              {/* Hardware Specs info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-md bg-zinc-950 border border-zinc-850 text-xs">
                <div className="flex flex-col">
                  <span className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest">MIN HARDWARE</span>
                  <span className="font-semibold text-zinc-200 mt-1">16GB RAM / Apple Silicon</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest">OPTIMAL GPU</span>
                  <span className="font-semibold text-zinc-200 mt-1">NVIDIA RTX 4090 / A100</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-zinc-500 uppercase text-[10px] tracking-widest">QUANTIZATION</span>
                  <span className="font-semibold text-zinc-200 mt-1">4-bit / 8-bit / BF16 Native</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>X (Twitter)</span>
                </a>
              </div>

              <button
                onClick={onClose}
                className="text-[10px] uppercase tracking-widest px-4 py-2 bg-white text-black rounded-sm font-semibold hover:bg-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
