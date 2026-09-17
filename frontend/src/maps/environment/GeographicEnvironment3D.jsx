import React, { memo } from 'react';

/**
 * 3D Geographic Environment Component
 * Provides authentic regional geography for the Nashik + Trimbakeshwar Kumbh Mela 2027 corridor:
 * 1. Godavari River Sacred Corridor (meandering river surface, Gangapur reservoir, Ramkund snan basin)
 * 2. Brahmagiri & Anjaneri Mountain Massif (layered 3D topography, summit crags, Trimbak sacred basin)
 * 3. Ground Elevation & Topographic Isolines (highland Western Ghats descending to Godavari plains)
 * 4. Regional Connectivity (NH 848 Pilgrimage Corridor connecting Nashik CBS & Trimbakeshwar)
 * 5. Ground Plinths (stone foundations firmly anchoring architectural landmarks to the terrain)
 */

// Smooth SVG path for the sacred Godavari River across the regional corridor
// Coordinates are calibrated against REGIONAL_BOUNDS:
// West: Trimbakeshwar Brahmagiri spring -> East: Deccan plateau outflow
const GODAVARI_RIVER_PATH = `
  M 19.8 66.8
  C 22.0 65.5, 24.5 63.8, 27.2 62.0
  C 31.5 59.2, 36.8 56.5, 41.5 54.0
  C 45.0 52.0, 48.0 49.5, 51.5 47.8
  C 54.5 46.2, 57.2 45.8, 60.5 45.0
  C 64.0 44.2, 67.0 43.8, 70.1 43.5
  C 72.8 43.2, 74.5 43.4, 75.5 43.9
  C 78.5 45.2, 82.0 48.5, 86.5 51.0
  C 90.0 53.0, 93.5 54.2, 98.0 55.5
`.trim();

// Kapila River tributary joining Godavari at Tapovan Sangam
const KAPILA_TRIBUTARY_PATH = `
  M 73.0 32.0
  C 73.8 35.5, 74.5 39.2, 75.5 43.9
`.trim();

// NH 848 Pilgrimage Highway connecting Trimbakeshwar directly to Nashik CBS
const NH848_HIGHWAY_PATH = `
  M 20.9 65.9
  C 28.5 63.5, 38.0 58.0, 48.0 53.5
  C 55.0 50.5, 61.5 48.5, 66.9 47.0
`.trim();

const GeographicEnvironment3D = memo(function GeographicEnvironment3D() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ transformStyle: 'preserve-3d' }}
      aria-hidden="true"
    >
      {/* ========================================================================= */}
      {/* 1. TOPOGRAPHIC BASE RELIEF & ELEVATION ISOLINES (Z = 1px)                 */}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full overflow-visible opacity-75"
        style={{ transform: 'translateZ(1px)' }}
      >
        <defs>
          {/* River Water Gradient: Deep sacred sapphire into radiant turquoise */}
          <linearGradient id="godavariWaterGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0369a1" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#0284c7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.85" />
          </linearGradient>

          {/* Riverbank Glow */}
          <linearGradient id="riverbankGlow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.3" />
          </linearGradient>

          {/* Western Ghats Highland Contour Gradient */}
          <radialGradient id="highlandGlow" cx="20%" cy="68%" r="28%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.16" />
            <stop offset="60%" stopColor="#78350f" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Gangapur Reservoir Gradient */}
          <radialGradient id="reservoirWater" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0891b2" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#0369a1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Western Highland Plateau Ambient Shade */}
        <circle cx="21" cy="68" r="22" fill="url(#highlandGlow)" />

        {/* Topographic Isolines (Elevation relief lines from Western Ghats to Plains) */}
        {/* 900m Highland Isoline */}
        <path
          d="M 8 50 C 14 55, 18 62, 22 75 C 24 82, 18 90, 10 95"
          fill="none"
          stroke="#d97706"
          strokeWidth="0.35"
          strokeOpacity="0.35"
          strokeDasharray="2 1.5"
        />
        {/* 750m Foothill Isoline */}
        <path
          d="M 12 42 C 20 48, 28 56, 32 70 C 35 80, 26 88, 18 96"
          fill="none"
          stroke="#d97706"
          strokeWidth="0.3"
          strokeOpacity="0.25"
        />
        {/* 650m Valley Transition Isoline */}
        <path
          d="M 28 35 C 38 42, 45 52, 50 65 C 54 76, 48 88, 40 96"
          fill="none"
          stroke="#78716c"
          strokeWidth="0.25"
          strokeOpacity="0.3"
          strokeDasharray="3 2"
        />
        {/* 580m Nashik Plain Isoline */}
        <path
          d="M 52 25 C 62 34, 70 45, 75 60 C 78 72, 74 85, 68 96"
          fill="none"
          stroke="#78716c"
          strokeWidth="0.25"
          strokeOpacity="0.2"
        />

        {/* ========================================================================= */}
        {/* 2. GODAVARI RIVER CORRIDOR (WATER SURFACE & EMBANKMENT)                    */}
        {/* ========================================================================= */}
        {/* Soft Riverbank Floodplain / Riparian Buffer */}
        <path
          d={GODAVARI_RIVER_PATH}
          fill="none"
          stroke="url(#riverbankGlow)"
          strokeWidth="4.6"
          strokeLinecap="round"
        />

        {/* Outer Riverbed Channel */}
        <path
          d={GODAVARI_RIVER_PATH}
          fill="none"
          stroke="#0e7490"
          strokeWidth="3.0"
          strokeOpacity="0.75"
          strokeLinecap="round"
        />

        {/* Main Flowing Water Surface */}
        <path
          d={GODAVARI_RIVER_PATH}
          fill="none"
          stroke="url(#godavariWaterGradient)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Sacred Sunlight Shimmer / Water Flow Current Line */}
        <path
          d={GODAVARI_RIVER_PATH}
          fill="none"
          stroke="#cffafe"
          strokeWidth="0.65"
          strokeOpacity="0.85"
          strokeDasharray="4 2.5"
          strokeLinecap="round"
        />

        {/* Gangapur Reservoir Lake Basin (Upstream Nashik water body) */}
        <ellipse
          cx="52.5"
          cy="47.2"
          rx="5.5"
          ry="3.2"
          transform="rotate(-15 52.5 47.2)"
          fill="url(#reservoirWater)"
          stroke="#38bdf8"
          strokeWidth="0.4"
          strokeOpacity="0.7"
        />
        <text
          x="52.5"
          y="46.0"
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="1.3"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.1"
          opacity="0.8"
        >
          GANGAPUR RESERVOIR
        </text>

        {/* Kapila River Tributary at Tapovan Confluence */}
        <path
          d={KAPILA_TRIBUTARY_PATH}
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />
        <text
          x="75.5"
          y="42.2"
          textAnchor="middle"
          fill="#67e8f9"
          fontSize="1.2"
          fontFamily="monospace"
          fontWeight="bold"
          opacity="0.8"
        >
          KAPILA SANGAM
        </text>

        {/* ========================================================================= */}
        {/* 3. RAMKUND SACRED SNAN BASIN (RIVERFRONT GHATS INTEGRATION)                */}
        {/* ========================================================================= */}
        {/* Ramkund Stepped Kund Basin - Physically joins the river with the ghat */}
        <g transform="translate(70.1, 43.5)">
          {/* Stepped Ghat Quay Platforms */}
          <rect
            x="-2.8"
            y="-2.2"
            width="5.6"
            height="4.4"
            rx="0.6"
            fill="#1c1917"
            stroke="#f59e0b"
            strokeWidth="0.3"
            strokeOpacity="0.8"
          />
          <rect
            x="-2.2"
            y="-1.7"
            width="4.4"
            height="3.4"
            rx="0.4"
            fill="#292524"
            stroke="#0284c7"
            strokeWidth="0.25"
          />
          {/* Inner Sacred Kund Water Pool */}
          <rect
            x="-1.6"
            y="-1.2"
            width="3.2"
            height="2.4"
            rx="0.3"
            fill="#06b6d4"
            fillOpacity="0.85"
            stroke="#a5f3fc"
            strokeWidth="0.25"
          />
          {/* Water Ripples inside Kund */}
          <line x1="-1.0" y1="-0.4" x2="1.0" y2="-0.4" stroke="#ffffff" strokeWidth="0.2" strokeOpacity="0.7" />
          <line x1="-1.2" y1="0.3" x2="0.8" y2="0.3" stroke="#ffffff" strokeWidth="0.2" strokeOpacity="0.7" />
          {/* Label */}
          <text
            x="0"
            y="3.2"
            textAnchor="middle"
            fill="#38bdf8"
            fontSize="1.1"
            fontFamily="monospace"
            fontWeight="bold"
            letterSpacing="0.08"
          >
            RAMKUND SACRED GHATS
          </text>
        </g>

        {/* ========================================================================= */}
        {/* 4. REGIONAL NH 848 PILGRIMAGE CORRIDOR (TRIMBAKESHWAR ↔ NASHIK)          */}
        {/* ========================================================================= */}
        {/* Highway Ribbon connecting Trimbakeshwar to CBS Transit Terminal */}
        <path
          d={NH848_HIGHWAY_PATH}
          fill="none"
          stroke="#ea580c"
          strokeWidth="0.85"
          strokeOpacity="0.5"
          strokeLinecap="round"
          strokeDasharray="2.5 1.5"
        />
        <text
          x="44.0"
          y="58.5"
          textAnchor="middle"
          fill="#fb923c"
          fontSize="1.2"
          fontFamily="monospace"
          fontWeight="bold"
          letterSpacing="0.1"
          opacity="0.85"
          transform="rotate(-18 44.0 58.5)"
        >
          NH 848 PILGRIMAGE CORRIDOR (32 KM)
        </text>

        {/* Trimbak Kushavarta Sacred Spring (River Source Indicator) */}
        <circle cx="20.0" cy="66.5" r="1.5" fill="#0284c7" stroke="#38bdf8" strokeWidth="0.3" />
        <text
          x="19.8"
          y="70.0"
          textAnchor="middle"
          fill="#38bdf8"
          fontSize="1.1"
          fontFamily="monospace"
          fontWeight="bold"
        >
          KUSHAVARTA KUND
        </text>
      </svg>

      {/* ========================================================================= */}
      {/* 5. BRAHMAGIRI & ANJANERI HILLS (3D LAYERED TOPOGRAPHY)                    */}
      {/* ========================================================================= */}
      {/* Layer 1: Brahmagiri Outer Mountain Base Plateau (Z = 5px) */}
      <div
        className="absolute rounded-[40px] bg-stone-900/90 border border-amber-800/40 shadow-xl flex items-center justify-center"
        style={{
          left: '12%',
          top: '60%',
          width: '18%',
          height: '18%',
          transform: 'translateZ(5px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Layer 2: Mid Escarpment Ridge (Z = 12px) */}
        <div
          className="absolute inset-[15%] rounded-[30px] bg-stone-850/90 border border-amber-600/40 shadow-lg flex items-center justify-center"
          style={{ transform: 'translateZ(7px)' }}
        >
          {/* Layer 3: Sacred Gangadwar High Cliffs (Z = 20px) */}
          <div
            className="absolute inset-[18%] rounded-[20px] bg-gradient-to-br from-stone-800 to-amber-950/60 border border-amber-500/50 shadow-md flex flex-col items-center justify-center p-1 text-center"
            style={{ transform: 'translateZ(8px)' }}
          >
            {/* Brahmagiri Summit Beacon (1,295m) */}
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse" />
            <span className="text-[8px] font-extrabold text-amber-300 uppercase tracking-wider mt-0.5">
              ⛰️ Brahmagiri
            </span>
            <span className="text-[7px] font-mono text-amber-400/80">
              1,295m Peak
            </span>
          </div>
        </div>

        {/* Mountain Base Contour Badge */}
        <span className="absolute bottom-1 left-2 text-[7px] font-mono tracking-widest text-amber-500/70 uppercase">
          Western Ghats Ridge
        </span>
      </div>

      {/* Anjaneri Sacred Mountain (Birthplace of Lord Hanuman) (Z = 8px) */}
      <div
        className="absolute rounded-3xl bg-stone-900/80 border border-stone-700/60 shadow-lg flex flex-col items-center justify-center p-1 text-center"
        style={{
          left: '26%',
          top: '68%',
          width: '10%',
          height: '10%',
          transform: 'translateZ(8px)',
          transformStyle: 'preserve-3d'
        }}
      >
        <span className="text-[8px] font-bold text-stone-300">
          ⛰️ Anjaneri
        </span>
        <span className="text-[7px] font-mono text-stone-400">
          1,280m
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 6. LANDMARK GROUND PLINTH FOUNDATIONS (Z = 2px)                           */}
      {/* Anchors the architecture firmly to the terrain so buildings do not float  */}
      {/* ========================================================================= */}
      {/* Trimbakeshwar Temple Jagati Courtyard Plinth */}
      <div
        className="absolute w-20 h-16 rounded-xl bg-stone-950/90 border-2 border-amber-600/50 shadow-[0_0_15px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          left: '20.9%',
          top: '65.9%',
          transform: 'translate(-50%, -50%) translateZ(2px)'
        }}
      >
        <div className="w-16 h-12 rounded-lg border border-dashed border-amber-500/40 bg-amber-950/20" />
      </div>

      {/* Ramkund Riverfront Stepped Quay Plinth */}
      <div
        className="absolute w-22 h-14 rounded-lg bg-stone-950/90 border-2 border-sky-500/50 shadow-[0_0_15px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          left: '70.1%',
          top: '43.5%',
          transform: 'translate(-50%, -50%) translateZ(2px)'
        }}
      >
        <div className="w-18 h-10 rounded border border-cyan-400/40 bg-sky-950/20" />
      </div>

      {/* Kalaram Temple Basalt Courtyard Plinth */}
      <div
        className="absolute w-18 h-14 rounded-xl bg-stone-950/90 border-2 border-amber-700/50 shadow-[0_0_12px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          left: '70.6%',
          top: '43.2%',
          transform: 'translate(-50%, -50%) translateZ(2px)'
        }}
      >
        <div className="w-14 h-10 rounded border border-stone-600 bg-stone-900/60" />
      </div>

      {/* CBS Transit Terminal Tarmac & Bay Platform Plinth */}
      <div
        className="absolute w-20 h-12 rounded-xl bg-stone-950/90 border-2 border-orange-600/50 shadow-[0_0_12px_rgba(0,0,0,0.8)] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          left: '66.9%',
          top: '47.0%',
          transform: 'translate(-50%, -50%) translateZ(2px)'
        }}
      >
        <div className="w-16 h-8 rounded border border-orange-500/40 bg-stone-900/80 flex items-center justify-around px-1">
          <div className="w-1 h-4 bg-orange-400/40 rounded-xs" />
          <div className="w-1 h-4 bg-orange-400/40 rounded-xs" />
          <div className="w-1 h-4 bg-orange-400/40 rounded-xs" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. REGIONAL WATERMARK SECTOR LABELS                                        */}
      {/* ========================================================================= */}
      {/* Western Ghats Escarpment Label */}
      <div
        className="absolute left-[4%] top-[72%] text-[9px] font-mono tracking-widest text-amber-500/40 uppercase font-extrabold -rotate-90 origin-left"
        style={{ transform: 'translateZ(1px)' }}
      >
        WESTERN GHATS ESCARPMENT
      </div>

      {/* Nashik Urban Corridor Label */}
      <div
        className="absolute right-[8%] top-[34%] text-[9px] font-mono tracking-widest text-stone-500/50 uppercase font-extrabold"
        style={{ transform: 'translateZ(1px)' }}
      >
        NASHIK URBAN BASIN • PANCHAVATI
      </div>
    </div>
  );
});

class EnvironmentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.warn('[GeographicEnvironment3D] Graceful recovery from render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

const SafeGeographicEnvironment3D = memo(function SafeGeographicEnvironment3D(props) {
  return (
    <EnvironmentErrorBoundary>
      <GeographicEnvironment3D {...props} />
    </EnvironmentErrorBoundary>
  );
});

export default SafeGeographicEnvironment3D;
