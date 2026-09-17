import React, { memo } from 'react';
import { project3DCoords } from '../map3DService';

/**
 * Temple Shikhara 3D SVG Silhouette & Stepped Architecture
 */
function TempleShikharaVisual({ isSelected, isHovered, accentColor = '#f59e0b', hasPillars = true }) {
  return (
    <div className="relative flex flex-col items-center pointer-events-none">
      {/* Saffron Sacred Flag at Pinnacle */}
      <div className="relative z-10 -mb-1 flex items-center">
        <div className="w-0.5 h-3 bg-amber-400" />
        <div
          className="w-3.5 h-2 bg-gradient-to-r from-amber-500 to-orange-500 origin-left shadow-sm"
          style={{
            clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
            animation: isSelected ? 'pulse 2s infinite' : 'none'
          }}
        />
      </div>

      {/* Golden Kalash Finial */}
      <div className="w-2.5 h-2 rounded-full bg-gradient-to-t from-amber-600 via-amber-300 to-yellow-200 border border-amber-300 shadow-sm z-10" />

      {/* Amalaka Disc Ring */}
      <div className="w-4 h-1 rounded-full bg-amber-500 border border-amber-300 -mt-0.5 z-10 shadow-xs" />

      {/* Shikhara Tower Spire (Nagari / Deccan Architectural Silhouette) */}
      <svg
        className={`w-12 h-14 transition-all duration-200 ${
          isSelected
            ? 'filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
            : isHovered
            ? 'filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
            : 'filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]'
        }`}
        viewBox="0 0 48 56"
        fill="none"
      >
        {/* Outer Tower Outline with Horizontal Architectural Ridges (Bhumis) */}
        <path
          d="M24 2 C21 10, 17 24, 12 40 L36 40 C31 24, 27 10, 24 2 Z"
          fill="url(#templeGradient)"
          stroke="#f59e0b"
          strokeWidth="1.2"
        />
        {/* Tier Carvings */}
        <line x1="18" y1="14" x2="30" y2="14" stroke="#d97706" strokeWidth="1" />
        <line x1="15" y1="24" x2="33" y2="24" stroke="#d97706" strokeWidth="1.2" />
        <line x1="13" y1="33" x2="35" y2="33" stroke="#d97706" strokeWidth="1.2" />
        {/* Central Spire Ridge */}
        <line x1="24" y1="4" x2="24" y2="40" stroke="#fef08a" strokeWidth="1.2" strokeDasharray="2 2" />

        {/* Gradients */}
        <defs>
          <linearGradient id="templeGradient" x1="24" y1="2" x2="24" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fef08a" />
            <stop offset="0.3" stopColor="#f59e0b" />
            <stop offset="0.8" stopColor="#b45309" />
            <stop offset="1" stopColor="#78350f" />
          </linearGradient>
        </defs>
      </svg>

      {/* Mandapa Assembly Hall Roof Base */}
      <div className="w-14 h-3 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 border-t border-amber-400 rounded-xs shadow-md -mt-1 flex justify-around px-1">
        <div className="w-1 h-full bg-amber-900/60" />
        <div className="w-1.5 h-full bg-amber-400/80 rounded-xs" />
        <div className="w-1 h-full bg-amber-900/60" />
      </div>

      {/* Stepped Plinth / Stone Jagati Base */}
      <div className="w-16 h-2 bg-stone-800 border-t border-stone-600 rounded-xs shadow-sm flex items-center justify-between px-1">
        {hasPillars && (
          <>
            <div className="w-1.5 h-2.5 -mt-1 bg-amber-400 border border-amber-300 rounded-xs shadow-xs" />
            <div className="w-1.5 h-2.5 -mt-1 bg-amber-400 border border-amber-300 rounded-xs shadow-xs" />
          </>
        )}
      </div>
      <div className="w-18 h-1.5 bg-stone-900 border-t border-stone-700 rounded-xs" />
    </div>
  );
}

/**
 * Stepped Ghat 3D Architecture (Ramkund & Riverfront Ghats)
 */
function SteppedGhatVisual({ isSelected, isHovered }) {
  return (
    <div className="relative flex flex-col items-center pointer-events-none">
      {/* Upper Ghat Pavilion Canopy */}
      <div className="w-14 h-3 rounded-t-lg bg-gradient-to-r from-sky-800 via-sky-600 to-sky-800 border border-sky-300 shadow-md flex items-center justify-center">
        <span className="text-[8px] font-mono text-sky-200 uppercase tracking-widest font-bold">
          SNAN GHAT
        </span>
      </div>

      {/* Ghat Boundary Lamp Pillars (Deepastambhas) */}
      <div className="w-16 flex items-center justify-between px-0.5 -my-0.5 z-10">
        <div className="w-1.5 h-4 bg-gradient-to-t from-stone-700 to-amber-400 border border-amber-300 rounded-xs shadow-xs" />
        <div className="w-1.5 h-4 bg-gradient-to-t from-stone-700 to-amber-400 border border-amber-300 rounded-xs shadow-xs" />
      </div>

      {/* Cascading Stone Steps (Terraces) */}
      <div className="w-14 h-2 bg-stone-800 border-y border-stone-600 shadow-xs" />
      <div className="w-16 h-2 bg-stone-750 border-y border-stone-600 shadow-xs" />
      <div className="w-18 h-2 bg-stone-700 border-y border-stone-500 shadow-xs" />

      {/* Sacred Water Kund Basin (Holy Immersion Pool) */}
      <div
        className={`w-20 h-4 rounded-b-lg border-2 border-cyan-400/80 bg-gradient-to-r from-sky-600 via-cyan-400 to-sky-600 shadow-lg flex items-center justify-center overflow-hidden transition-all ${
          isSelected
            ? 'shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse'
            : isHovered
            ? 'shadow-[0_0_10px_rgba(6,182,212,0.5)]'
            : ''
        }`}
      >
        <div className="w-full h-full bg-cyan-300/20 flex items-center justify-around">
          <div className="w-3 h-0.5 bg-white/70 rounded-full" />
          <div className="w-5 h-0.5 bg-white/90 rounded-full" />
          <div className="w-3 h-0.5 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Transit Interchange Canopy 3D Visual (CBS Terminal)
 */
function TransitTerminalVisual({ isSelected, isHovered }) {
  return (
    <div className="relative flex flex-col items-center pointer-events-none">
      {/* Arched Terminal Roof */}
      <div className="w-14 h-4 rounded-t-xl bg-gradient-to-r from-orange-700 via-orange-500 to-orange-700 border border-orange-300 shadow-md flex items-center justify-center">
        <span className="text-[9px] font-bold text-white">🚌 TRANSIT</span>
      </div>
      {/* Canopy Pillars */}
      <div className="w-12 h-3.5 border-x-2 border-stone-400 bg-stone-900/60 flex items-center justify-center">
        <div className="w-1.5 h-full bg-orange-400/80 mx-1" />
        <div className="w-1.5 h-full bg-orange-400/80 mx-1" />
      </div>
      {/* Tarmac Base */}
      <div className="w-16 h-2 bg-stone-800 border-t border-stone-600 rounded-xs" />
    </div>
  );
}

/**
 * Main 3D Landmark Visual Component
 * Renders custom architectural geometry on the 3D terrain plane,
 * paired with billboarded information cards and full interaction.
 */
const LandmarkVisual = memo(function LandmarkVisual({
  place,
  landmarkConfig,
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
  if (!place || !landmarkConfig) return null;

  const { left, top } = project3DCoords(place.latitude, place.longitude);

  // Compute elevation based on selected/hovered states
  let baseElevation = landmarkConfig.elevationZ || 40;
  if (isSelected) baseElevation += 16;
  else if (isHovered) baseElevation += 8;

  const placeName = place.name || 'Landmark';
  const badge = landmarkConfig.badge || place.categoryLabel || 'Landmark';
  const subtitle = landmarkConfig.subtitle || '';

  return (
    <div
      style={{
        left,
        top,
        transform: `translate(-50%, -100%) translateZ(${baseElevation}px)`,
        transformStyle: 'preserve-3d'
      }}
      className={`absolute z-30 transition-all duration-200 ease-out select-none ${
        isSelected ? 'z-50 scale-110' : isHovered ? 'z-45 scale-105' : 'z-30'
      }`}
    >
      {/* Ground Foundation Glow & Shadow */}
      <div
        className={`w-16 h-8 rounded-full mx-auto -mb-4 transition-all duration-200 blur-xs ${
          isSelected
            ? 'bg-amber-400/80 scale-150 animate-ping'
            : isHovered
            ? 'bg-amber-500/50 scale-125'
            : 'bg-stone-950/80 scale-100'
        }`}
        style={{ transform: 'rotateX(-55deg)' }}
        aria-hidden="true"
      />

      {/* Clickable 3D Landmark Interactive Shell */}
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
        className="group relative flex flex-col items-center cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-2xl"
        aria-label={`Select landmark ${placeName}, ${badge} in 3D`}
        aria-pressed={isSelected}
        title={`${placeName} (${badge})`}
      >
        {/* 1. Architectural 3D Structure */}
        {landmarkConfig.landmarkType === 'temple-shikhara' && (
          <TempleShikharaVisual
            isSelected={isSelected}
            isHovered={isHovered}
            accentColor={landmarkConfig.accentColor}
            hasPillars={landmarkConfig.hasPillars}
          />
        )}
        {landmarkConfig.landmarkType === 'stepped-ghat' && (
          <SteppedGhatVisual
            isSelected={isSelected}
            isHovered={isHovered}
          />
        )}
        {landmarkConfig.landmarkType === 'transit-terminal' && (
          <TransitTerminalVisual
            isSelected={isSelected}
            isHovered={isHovered}
          />
        )}

        {/* 2. Billboarded Identification Card (Always Faces User) */}
        <div
          style={{
            transform: `rotateZ(${-heading}deg) rotateX(${-tilt + 30}deg)`,
            transformOrigin: 'top center'
          }}
          className={`mt-1 flex flex-col items-center transition-all duration-150 ${
            isSelected
              ? 'scale-110'
              : isHovered
              ? 'scale-105'
              : 'scale-100'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-2xl backdrop-blur-md transition-all ${
              isSelected
                ? 'bg-amber-600 text-white border-amber-300 ring-4 ring-amber-400/70 shadow-amber-600/50'
                : isRouteStart
                ? 'bg-emerald-600 text-white border-emerald-300 ring-4 ring-emerald-500/40'
                : isRouteDest
                ? 'bg-rose-600 text-white border-rose-300 ring-4 ring-rose-500/40'
                : isHovered
                ? 'bg-stone-900/95 text-amber-300 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                : 'bg-stone-900/90 text-stone-100 border-stone-700 shadow-lg group-hover:border-amber-400'
            }`}
          >
            {/* Category or Route Endpoint Icon */}
            <span className="text-sm leading-none shrink-0" aria-hidden="true">
              {isRouteStart ? '🅰️' : isRouteDest ? '🅱️' : place.categoryIcon || '📍'}
            </span>

            {/* Landmark Title */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-extrabold max-w-[140px] sm:max-w-[180px] truncate whitespace-nowrap leading-tight">
                  {placeName}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {badge}
                </span>
              </div>
              {subtitle && (isHovered || isSelected) && (
                <span className="text-[9px] font-mono text-amber-200/80 truncate max-w-[160px] leading-tight">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
});

export default LandmarkVisual;
