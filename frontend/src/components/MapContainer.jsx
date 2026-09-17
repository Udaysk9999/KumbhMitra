import React from 'react';
import PlaceMarker from './PlaceMarker';

/**
 * Reusable Map Container Component
 * Acts as the viewport foundation for the map experience.
 * In Phase 1, displays an architectural map placeholder with interactive markers,
 * ready to be swapped with Google Maps / Photorealistic 3D Tiles in future phases.
 */
export default function MapContainer({
  mode = '2D',
  places = [],
  selectedPlace = null,
  onSelectPlace
}) {
  return (
    <div 
      className="relative w-full h-full flex-1 overflow-hidden select-none bg-stone-100"
      aria-label="Interactive Map Area"
    >
      {/* Cartographic Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #78716c 1px, transparent 1px),
            linear-gradient(to bottom, #78716c 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      ></div>

      {/* Subtle Topographical Contour Accents */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #ea580c 0%, transparent 70%)'
        }}
      ></div>

      {/* Water Body (Godavari River Representation) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-25"
        preserveAspectRatio="none"
        viewBox="0 0 1000 600"
      >
        <path
          d="M 100,200 Q 300,160 500,280 T 900,340 T 1100,320"
          fill="none"
          stroke="#0284c7"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <text x="520" y="270" fill="#0369a1" fontSize="12" fontWeight="bold" letterSpacing="2">
          GODAVARI RIVER (SACRED BASIN)
        </text>
      </svg>

      {/* Top Left: Regional Map Overlay Indicator */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none">
        <div className="bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/80 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-stone-900 tracking-tight">
              Interactive Map
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-[11px] font-semibold text-amber-700">
              Nashik + Trimbakeshwar
            </span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">
            Phase 1 UI Shell • Click markers to view place intelligence
          </div>
        </div>
      </div>

      {/* Top Right: Mode Indicator Badge */}
      <div className="absolute top-20 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/80 shadow-sm flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${mode === '2D' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-bold font-mono text-stone-800">
            {mode === '2D' ? '2D Map Mode' : '3D Map Mode'}
          </span>
        </div>
      </div>

      {/* Center Watermark & Guidance (Discreet) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-4 py-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-stone-200/60 shadow-xs max-w-sm">
          <div className="text-xs font-semibold text-stone-700">
            {mode === '2D' ? 'Standard 2D Map View' : 'Immersive 3D Spatial View'}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Map canvas will integrate Google Maps Platform & 3D Photorealistic Tiles in Phase 2.
          </p>
        </div>
      </div>

      {/* Interactive Place Markers */}
      <div className="absolute inset-0">
        {places.map((place) => (
          <PlaceMarker
            key={place.id}
            place={place}
            isSelected={selectedPlace?.id === place.id}
            onClick={onSelectPlace}
          />
        ))}
      </div>

      {/* Bottom Left: Coordinates & Scale Indicator */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2">
        <div className="bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-600">
          CENTER: 19.9975° N, 73.7898° E (Godavari Basin)
        </div>
        <div className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-600">
          SCALE: 1:25,000
        </div>
      </div>

      {/* Bottom Right: Future Controls Placeholder (Compass & Zoom) */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
        <div className="bg-white/90 backdrop-blur-md rounded-xl border border-stone-200/90 shadow-sm p-1.5 flex flex-col gap-1 text-xs font-bold text-stone-700">
          <button
            type="button"
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center"
            aria-label="Zoom in"
            title="Zoom control (enabled in maps phase)"
          >
            +
          </button>
          <div className="w-full h-px bg-stone-200"></div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center"
            aria-label="Zoom out"
            title="Zoom control (enabled in maps phase)"
          >
            −
          </button>
        </div>
      </div>

    </div>
  );
}
