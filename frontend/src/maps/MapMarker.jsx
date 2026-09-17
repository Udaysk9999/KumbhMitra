import React from 'react';
import { getCategoryTheme } from './mapConfig';

/**
 * Reusable MapMarker Component
 * Displays interactive place pin with category styling, hover interactions,
 * keyboard accessibility, and selected visual emphasis.
 */
export default function MapMarker({ place, isSelected, onClick }) {
  const theme = getCategoryTheme(place.category);

  return (
    <div
      className={`relative select-none transition-transform duration-150 ${
        isSelected ? 'z-30 scale-110' : 'z-10 hover:scale-105 hover:z-20'
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(place);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onClick?.(place);
          }
        }}
        aria-label={`Select ${place.name}, ${place.categoryLabel || place.category}`}
        aria-pressed={isSelected}
        title={`${place.name} (${place.categoryLabel || place.category})`}
        className="relative flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-full cursor-pointer group"
      >
        {/* Main Pin Pill */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-sm transition-all duration-150 ${
            isSelected
              ? `${theme.activeBg} text-white border-white ring-4 ${theme.ringColor} shadow-lg font-bold`
              : 'bg-white/95 text-stone-900 border-stone-300 hover:border-amber-400 hover:shadow-md'
          }`}
        >
          <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
            {place.categoryIcon || '📍'}
          </span>
          <span className="text-[11px] font-semibold max-w-[130px] truncate whitespace-nowrap">
            {place.name}
          </span>
        </div>

        {/* Pin Needle Tail */}
        <div
          className={`w-2.5 h-2.5 -mt-1.5 rotate-45 border-r border-b transition-colors duration-150 ${
            isSelected
              ? `${theme.activeBg} border-transparent`
              : 'bg-white border-stone-300 group-hover:border-amber-400'
          }`}
          aria-hidden="true"
        />

        {/* Ground Pulse Dot */}
        <div
          className={`w-2.5 h-1 rounded-full mt-0.5 transition-all duration-150 ${
            isSelected ? `${theme.activeBg} opacity-90 scale-125` : 'bg-stone-400/50 opacity-50'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
