import React from 'react';
import { getCategoryTheme } from './mapConfig';

/**
 * Reusable MapMarker Component
 * Used for displaying place markers on the map.
 * Supports category visual theming, selection rings, and click events.
 */
export default function MapMarker({ place, isSelected, onClick }) {
  const theme = getCategoryTheme(place.category);

  return (
    <div className="relative group transition-transform duration-200 hover:scale-110 select-none">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(place);
        }}
        className="relative flex flex-col items-center focus:outline-none cursor-pointer"
        aria-label={`Select ${place.name} (${place.categoryLabel || place.category})`}
      >
        {/* Main Marker Bubble */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-md transition-all duration-200 ${
            isSelected
              ? `${theme.activeBg} text-white border-white ring-4 ${theme.ringColor} scale-105 z-30 shadow-lg`
              : 'bg-white/95 text-stone-900 border-stone-200 hover:border-amber-400 hover:shadow-lg'
          }`}
        >
          <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
            {place.categoryIcon || '📍'}
          </span>
          <span className="text-[11px] font-bold max-w-[130px] truncate whitespace-nowrap">
            {place.name}
          </span>
        </div>

        {/* Marker Needle Tip */}
        <div
          className={`w-2.5 h-2.5 -mt-1.5 rotate-45 border-r border-b transition-colors duration-200 ${
            isSelected
              ? `${theme.activeBg} border-transparent`
              : 'bg-white border-stone-300 group-hover:border-amber-400'
          }`}
        ></div>

        {/* Ground Pulse Effect */}
        <div
          className={`w-2.5 h-1 rounded-full mt-0.5 transition-opacity ${
            isSelected ? `${theme.activeBg} animate-ping opacity-90` : 'bg-stone-400/60 opacity-60'
          }`}
        ></div>
      </button>
    </div>
  );
}
