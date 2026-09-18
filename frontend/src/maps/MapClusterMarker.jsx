import React from 'react';

/**
 * Cluster Marker Component
 * Clean modern circular count badge grouping nearby POIs when zoomed out.
 * Displays count badge with smooth hover scale and expansion on click.
 */
export default function MapClusterMarker({
  count,
  category = 'Places',
  onClick
}) {
  return (
    <div
      className="relative select-none flex flex-col items-center pointer-events-auto cursor-pointer group"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      role="button"
      tabIndex={0}
      aria-label={`Cluster of ${count} ${category}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Cluster Pill / Circle */}
      <div className="flex items-center justify-center min-w-[36px] h-9 px-2 rounded-full bg-gradient-to-tr from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-extrabold text-xs border-2 border-white shadow-lg ring-4 ring-amber-500/25 group-hover:scale-110 group-hover:ring-amber-500/40 transition-all duration-150">
        <span>{count}</span>
      </div>

      {/* Cluster Label */}
      <div className="mt-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-stone-700 bg-white/95 border border-stone-200 shadow-sm group-hover:bg-amber-50 group-hover:text-amber-900 group-hover:border-amber-300 transition-colors">
        {category}
      </div>
    </div>
  );
}
