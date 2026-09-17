import React, { memo } from 'react';
import { getCategoryTheme } from './mapConfig';
import { project3DCoords } from './map3DService';

/**
 * 3D Place Marker Component
 * Renders an interactive 3D pin in the spatial plane with elevation stem,
 * billboard orientation facing the camera, category styling, and 5 distinct visual states:
 * Default, Hover, Selected, Route Start (A), and Route Destination (B).
 */
const Map3DMarker = memo(function Map3DMarker({
  place,
  isSelected = false,
  isHovered = false,
  isRouteStart = false,
  isRouteDest = false,
  heading = 25,
  tilt = 55,
  onClick,
  onMouseEnter,
  onMouseLeave
}) {
  if (!place) return null;

  const { left, top } = project3DCoords(place.latitude, place.longitude);
  const theme = getCategoryTheme(place.category);

  // Elevation and stem height based on state
  let stemHeightClass = 'h-4 bg-stone-500/60';
  let elevationZ = '20px';
  let groundDotClass = 'bg-stone-900/60';

  if (isSelected) {
    stemHeightClass = 'h-10 bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]';
    elevationZ = '44px';
    groundDotClass = 'bg-amber-500 scale-150 animate-ping';
  } else if (isRouteStart) {
    stemHeightClass = 'h-9 bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]';
    elevationZ = '38px';
    groundDotClass = 'bg-emerald-500 scale-125';
  } else if (isRouteDest) {
    stemHeightClass = 'h-9 bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.7)]';
    elevationZ = '38px';
    groundDotClass = 'bg-rose-500 scale-125';
  } else if (isHovered) {
    stemHeightClass = 'h-6 bg-amber-400/80';
    elevationZ = '28px';
    groundDotClass = 'bg-amber-400/70 scale-110';
  }

  const categoryLabel = place.categoryLabel || place.category || 'Location';
  const placeName = place.name || 'Location';

  return (
    <div
      style={{
        left,
        top,
        transform: `translate(-50%, -100%) translateZ(${elevationZ})`,
        transformStyle: 'preserve-3d'
      }}
      className={`absolute z-20 transition-all duration-200 ease-out select-none ${
        isSelected ? 'z-40' : isRouteStart || isRouteDest ? 'z-35' : isHovered ? 'z-30' : 'z-20'
      }`}
    >
      {/* Ground Shadow & Pulse Ring */}
      <div
        className={`w-3.5 h-3.5 rounded-full mx-auto -mb-1.5 transition-all duration-200 ${groundDotClass}`}
        style={{ transform: 'rotateX(-55deg)' }}
        aria-hidden="true"
      />

      {/* Vertical 3D Elevation Stem */}
      <div
        className={`w-0.5 mx-auto transition-all duration-200 ${stemHeightClass}`}
        aria-hidden="true"
      />

      {/* Billboarded Interactive 3D Marker Card */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(place);
        }}
        onMouseEnter={() => onMouseEnter?.(place)}
        onMouseLeave={() => onMouseLeave?.(place)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            onClick?.(place);
          }
        }}
        style={{
          transform: `rotateZ(${-heading}deg) rotateX(${-tilt + 30}deg)`,
          transformOrigin: 'bottom center'
        }}
        className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-xl transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isSelected
            ? `${theme.activeBg} text-white border-amber-300 ring-4 ring-amber-400/60 scale-115 font-bold shadow-2xl shadow-amber-600/50`
            : isRouteStart
            ? 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-500/40 font-bold scale-110 shadow-lg'
            : isRouteDest
            ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-500/40 font-bold scale-110 shadow-lg'
            : isHovered
            ? 'bg-stone-800 text-stone-100 border-amber-400 ring-2 ring-amber-400/50 scale-110 shadow-lg'
            : 'bg-stone-900/90 text-stone-100 border-stone-700 hover:border-amber-400 hover:scale-105'
        }`}
        aria-label={`Select ${placeName}, ${categoryLabel} in 3D`}
        aria-pressed={isSelected}
        title={`${placeName} (${categoryLabel})`}
      >
        {/* Route Start (A) Indicator */}
        {isRouteStart && (
          <span className="w-4 h-4 rounded-full bg-white text-emerald-700 text-[10px] font-black flex items-center justify-center shrink-0">
            A
          </span>
        )}

        {/* Route Dest (B) Indicator */}
        {isRouteDest && (
          <span className="w-4 h-4 rounded-full bg-white text-rose-700 text-[10px] font-black flex items-center justify-center shrink-0">
            B
          </span>
        )}

        {/* Category Icon */}
        {!isRouteStart && !isRouteDest && (
          <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
            {place.categoryIcon || '📍'}
          </span>
        )}

        {/* Place Name / Label */}
        <span
          className={`text-[11px] truncate whitespace-nowrap transition-all ${
            isSelected || isHovered || isRouteStart || isRouteDest
              ? 'max-w-[160px] font-bold'
              : 'max-w-[115px] font-medium'
          }`}
        >
          {placeName}
        </span>

        {/* Selected Category Tag Pill */}
        {isSelected && (
          <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-white/20 text-white border border-white/30">
            {categoryLabel}
          </span>
        )}
      </button>
    </div>
  );
});

export default Map3DMarker;
