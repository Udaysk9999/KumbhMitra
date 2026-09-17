import React from 'react';

/**
 * Place Marker Component
 * Interactive map pin positioned on the map placeholder canvas.
 */
export default function PlaceMarker({ place, isSelected, onClick }) {
  return (
    <div
      style={{ top: place.mapPosition.top, left: place.mapPosition.left }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform duration-200 hover:scale-110"
    >
      <button
        type="button"
        onClick={() => onClick(place)}
        className={`group relative flex flex-col items-center focus:outline-none`}
        aria-label={`Select ${place.name}, ${place.categoryLabel}`}
      >
        {/* Pin Bubble */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-md transition-all ${
            isSelected
              ? 'bg-amber-600 text-white border-white ring-4 ring-amber-500/30 scale-105'
              : 'bg-white/95 text-stone-800 border-stone-200 hover:border-amber-400 hover:shadow-lg'
          }`}
        >
          <span className="text-sm leading-none" aria-hidden="true">
            {place.categoryIcon}
          </span>
          <span className="text-[11px] font-bold max-w-[120px] truncate">
            {place.name}
          </span>
        </div>

        {/* Pin Needle / Tail */}
        <div
          className={`w-2 h-2 -mt-1 rotate-45 border-r border-b transition-colors ${
            isSelected
              ? 'bg-amber-600 border-amber-600'
              : 'bg-white border-stone-200 group-hover:border-amber-400'
          }`}
        ></div>

        {/* Ground Marker Dot */}
        <div
          className={`w-2 h-1 rounded-full mt-0.5 opacity-60 ${
            isSelected ? 'bg-amber-600 animate-ping' : 'bg-stone-400'
          }`}
        ></div>
      </button>
    </div>
  );
}
