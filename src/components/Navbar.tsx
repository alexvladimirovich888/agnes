import React from 'react';
import { Terminal } from 'lucide-react';

interface NavbarProps {
  onOpenRunLocally: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRunLocally,
}) => {
  return (
    <header className="shrink-0 w-full bg-transparent py-4 relative z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between relative">
        
        {/* Left spacer to keep center balanced */}
        <div className="w-24 sm:w-28" />

        {/* Center: Brand Name */}
        <div className="flex items-center justify-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
            }}
            className="tracking-tight text-xl hover:opacity-90 transition-opacity flex items-center"
          >
            <span className="font-light text-zinc-300">Open</span>
            <span className="font-extrabold text-white">Bots</span>
          </a>
        </div>

        {/* Right CTA: Run Locally / Open Source */}
        <div className="w-24 sm:w-28 flex justify-end">
          <button
            onClick={onOpenRunLocally}
            className="text-[10px] uppercase tracking-widest px-3 py-1.5 border border-zinc-800 rounded-sm text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3 h-3 text-zinc-400" />
            <span className="hidden sm:inline">Run Locally</span>
          </button>
        </div>

      </div>
    </header>
  );
};


