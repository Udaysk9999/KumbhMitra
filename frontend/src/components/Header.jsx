import React from 'react';
import SearchBar from './SearchBar';
import ModeToggle from './ModeToggle';

/**
 * Main Top Header Component
 * Floats cleanly above the map view with subtle translucency.
 * Provides search, responsive 2D/3D mode toggling, AI assistant and emergency access.
 */
export default function Header({
  mode,
  onToggleMode,
  places,
  onSelectPlace,
  onOpenAI,
  onOpenEmergency
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-3">
        
        {/* Left: Brand / Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-amber-500/30">
              🕉️
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-stone-900 text-base tracking-tight">
                  AI KumbhMitra
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 border border-amber-200/60">
                  2027
                </span>
              </div>
              <p className="text-[11px] font-semibold text-stone-500 tracking-wide">
                Nashik <span className="text-amber-600">•</span> Trimbakeshwar
              </p>
            </div>
          </div>

          {/* Mobile Quick Action Bar & 2D/3D Toggle (Small Screens) */}
          <div className="flex items-center gap-1.5 md:hidden">
            <ModeToggle mode={mode} onToggle={onToggleMode} />
            <button
              type="button"
              onClick={onOpenAI}
              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm"
              aria-label="Open AI Assistant"
            >
              🤖
            </button>
            <button
              type="button"
              onClick={onOpenEmergency}
              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs"
              aria-label="Open Emergency Services"
            >
              🚨
            </button>
          </div>
        </div>

        {/* Center: Search Interface */}
        <div className="w-full md:max-w-md lg:max-w-lg">
          <SearchBar places={places} onSelectPlace={onSelectPlace} />
        </div>

        {/* Right: Mode Toggle + AI + Emergency Buttons (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* 2D / 3D Toggle */}
          <ModeToggle mode={mode} onToggle={onToggleMode} />

          {/* AI Assistant Button */}
          <button
            type="button"
            onClick={onOpenAI}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100/90 hover:bg-stone-200/90 rounded-xl border border-stone-200 transition-colors shadow-sm cursor-pointer"
            aria-label="Ask KumbhMitra AI Assistant"
          >
            <span>🤖</span>
            <span>Ask KumbhMitra</span>
          </button>

          {/* Emergency Button */}
          <button
            type="button"
            onClick={onOpenEmergency}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100/90 rounded-xl border border-red-200 transition-colors shadow-sm cursor-pointer"
            aria-label="Emergency Services and Helplines"
          >
            <span>🚨</span>
            <span>Emergency</span>
          </button>
        </div>

      </div>
    </header>
  );
}
