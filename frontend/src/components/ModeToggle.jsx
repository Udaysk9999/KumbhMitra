import React from 'react';

/**
 * 2D / 3D Mode Toggle Component
 * Functional UI toggle switching map presentation mode.
 */
export default function ModeToggle({ mode, onToggle }) {
  return (
    <div 
      className="inline-flex items-center p-1 rounded-xl bg-stone-100 border border-stone-200/80 shadow-inner"
      role="group"
      aria-label="Map View Mode Toggle"
    >
      <button
        type="button"
        onClick={() => onToggle('2D')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
          mode === '2D'
            ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        aria-pressed={mode === '2D'}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        2D
      </button>

      <button
        type="button"
        onClick={() => onToggle('3D')}
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
          mode === '3D'
            ? 'bg-white text-amber-900 shadow-sm border border-amber-200/80'
            : 'text-stone-500 hover:text-stone-800'
        }`}
        aria-pressed={mode === '3D'}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        3D
      </button>
    </div>
  );
}
