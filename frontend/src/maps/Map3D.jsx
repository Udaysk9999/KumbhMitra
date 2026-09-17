import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  NASHIK_CENTER,
  TRIMBAKESHWAR_COORDS,
  REGIONAL_BOUNDS,
  getCategoryTheme
} from './mapConfig';
import {
  CAMERA_PRESETS_3D,
  computeCameraForPlace,
  computeCameraForRoute,
  project3DCoords
} from './map3DService';
import { RouteEndpointMarker, buildSvgPathFromGeoJson } from '../routes/RouteLayer';

// Singleton loader tracker for 3D map
let is3DOptionsConfigured = false;
let libraries3DPromise = null;

function getGoogleMapsLibraries(apiKey) {
  if (!is3DOptionsConfigured && apiKey) {
    setOptions({
      key: apiKey,
      v: 'weekly'
    });
    is3DOptionsConfigured = true;
  }

  if (!libraries3DPromise) {
    libraries3DPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('marker'),
      importLibrary('geometry')
    ])
      .then(([mapsLib, markerLib, geometryLib]) => ({
        mapsLib,
        markerLib,
        geometryLib,
        google: window.google
      }))
      .catch((err) => {
        libraries3DPromise = null;
        throw err;
      });
  }

  return libraries3DPromise;
}

/**
 * 3D Geographic Canvas Fallback
 * Renders Nashik + Trimbakeshwar regional geography with interactive 3D perspective,
 * terrain elevation contours, 3D place pins, and route geometry.
 */
function Map3DFallback({
  places,
  selectedPlace,
  activeRoute,
  onSelectPlace,
  tilt,
  heading,
  zoom,
  onTiltChange,
  onHeadingChange,
  onZoomChange,
  onSelectPreset
}) {
  const containerRef = useRef(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  // Pan when selected place changes in 3D
  useEffect(() => {
    if (!selectedPlace || !containerRef.current) return;
    const { xPercent, yPercent } = project3DCoords(selectedPlace.latitude, selectedPlace.longitude);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const targetX = width * 0.5 - (xPercent / 100) * width * zoom;
    const targetY = height * 0.5 - (yPercent / 100) * height * zoom;

    setPanOffset({
      x: Math.max(-width * 0.8, Math.min(width * 0.8, targetX)),
      y: Math.max(-height * 0.8, Math.min(height * 0.8, targetY))
    });
  }, [selectedPlace, zoom]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 select-none cursor-grab active:cursor-grabbing"
      style={{ perspective: '1200px' }}
      aria-label="3D Geographic Spatial Map Viewport"
    >
      {/* 3D Horizon & Sky Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* 3D Tilted Terrain Plane */}
      <div
        className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotateX(${tilt}deg) rotateZ(${heading}deg)`,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Terrain Base Grid */}
        <div
          className="absolute inset-[-40%] rounded-3xl bg-stone-900/90 border-2 border-stone-800 shadow-2xl"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(217, 119, 6, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(217, 119, 6, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        >
          {/* Godavari River 3D Corridor Ribbon */}
          <div
            className="absolute top-[48%] left-[10%] right-[10%] h-12 bg-gradient-to-r from-sky-600/30 via-cyan-500/40 to-sky-600/30 rounded-full blur-xs border-y border-sky-400/40"
            style={{ transform: 'rotate(-4deg)' }}
          >
            <span className="absolute left-6 top-3 text-[10px] font-mono tracking-widest text-sky-300/80 uppercase">
              Godavari River Sacred Corridor
            </span>
          </div>

          {/* Trimbakeshwar Mountain Elevation Contour Hint */}
          <div
            className="absolute top-[52%] left-[12%] w-32 h-32 rounded-full border border-amber-600/30 bg-amber-950/20"
            style={{ transform: 'translateZ(10px)' }}
          >
            <span className="absolute bottom-2 left-3 text-[9px] font-bold text-amber-500/70 uppercase">
              Brahmagiri Hills
            </span>
          </div>

          {/* Nashik Urban Valley Zone */}
          <div
            className="absolute top-[38%] right-[15%] w-48 h-48 rounded-2xl border border-stone-700/50 bg-stone-800/30"
            style={{ transform: 'translateZ(5px)' }}
          >
            <span className="absolute top-2 right-3 text-[9px] font-bold text-stone-400/60 uppercase">
              Nashik Urban Grid
            </span>
          </div>
        </div>

        {/* 3D Active Route Polyline */}
        {activeRoute && activeRoute.geometry?.coordinates && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            style={{ transform: 'translateZ(15px)' }}
          >
            <path
              d={buildSvgPathFromGeoJson(activeRoute.geometry.coordinates, (lat, lng) => project3DCoords(lat, lng))}
              fill="none"
              stroke={activeRoute.modeColor || '#f59e0b'}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]"
            />
          </svg>
        )}

        {/* 3D Places Pins with Vertical Elevation Stems */}
        {places.map((place) => {
          const { left, top } = project3DCoords(place.latitude, place.longitude);
          const isSelected = selectedPlace?.id === place.id;
          const isRouteStop =
            activeRoute &&
            (place.id === activeRoute.start?.id || place.id === activeRoute.destination?.id);
          const theme = getCategoryTheme(place.category);

          return (
            <div
              key={place.id}
              style={{
                left,
                top,
                transform: `translate(-50%, -100%) translateZ(${isSelected ? '40px' : '20px'})`,
                transformStyle: 'preserve-3d'
              }}
              className="absolute z-20 transition-all duration-200"
            >
              {/* Ground Shadow Dot */}
              <div
                className={`w-3 h-3 rounded-full mx-auto -mb-1.5 transition-all ${
                  isSelected ? 'bg-amber-500/80 scale-150 animate-ping' : 'bg-stone-900/60'
                }`}
                style={{ transform: 'rotateX(-55deg)' }}
              />

              {/* 3D Elevation Stem / Pillar */}
              <div
                className={`w-0.5 mx-auto transition-all ${
                  isSelected ? 'h-8 bg-amber-400' : 'h-4 bg-stone-500/70'
                }`}
              />

              {/* 3D Marker Card */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlace?.(place);
                }}
                className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border shadow-xl transition-all cursor-pointer ${
                  isSelected
                    ? `${theme.activeBg} text-white border-amber-300 ring-4 ring-amber-400/50 scale-110`
                    : isRouteStop
                    ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-300 scale-105'
                    : 'bg-stone-900/90 text-stone-100 border-stone-700 hover:border-amber-400 hover:scale-105'
                }`}
                style={{ transform: `rotateZ(${-heading}deg) rotateX(${-tilt + 30}deg)` }}
                aria-label={`Select ${place.name} in 3D`}
              >
                <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
                  {place.categoryIcon || '📍'}
                </span>
                <span className="text-[11px] font-bold max-w-[130px] truncate whitespace-nowrap">
                  {place.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main Modular 3D Map Component
 * Provides 3D perspective camera controls, preset navigation, place focus,
 * and handles both live WebGL/Google Vector 3D and 3D Geographic Canvas Fallback.
 */
const Map3D = forwardRef(function Map3D({
  places = [],
  selectedPlace = null,
  activeRoute = null,
  onSelectPlace,
  onError,
  onToggleMode
}, ref) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const [tilt, setTilt] = useState(55);
  const [heading, setHeading] = useState(25);
  const [zoom, setZoom] = useState(1);
  const [activePreset, setActivePreset] = useState('nashikGodavari');
  const [isInitializing, setIsInitializing] = useState(Boolean(apiKey));
  const [google3DError, setGoogle3DError] = useState(apiKey ? null : 'NO_API_KEY');

  // Imperative camera controls for parent components
  useImperativeHandle(ref, () => ({
    zoomIn: () => setZoom((z) => Math.min(z + 0.25, 2.5)),
    zoomOut: () => setZoom((z) => Math.max(z - 0.25, 0.7)),
    tiltUp: () => setTilt((t) => Math.min(t + 10, 75)),
    tiltDown: () => setTilt((t) => Math.max(t - 10, 20)),
    rotateLeft: () => setHeading((h) => (h - 30 + 360) % 360),
    rotateRight: () => setHeading((h) => (h + 30) % 360),
    resetHeading: () => setHeading(0),
    resetView: () => {
      setTilt(55);
      setHeading(25);
      setZoom(1);
      setActivePreset('nashikGodavari');
    },
    fitPlaces: () => {
      setZoom(1);
      setActivePreset('regionalOverview');
    },
    panTo: (coords) => {
      if (!coords) return;
      setZoom(1.4);
    },
    fitToPlace: (place) => {
      if (!place) return;
      const camera = computeCameraForPlace(place, heading);
      setTilt(camera.tilt);
      setZoom(1.5);
    },
    fitBoundsToRoute: (route) => {
      if (!route) return;
      const camera = computeCameraForRoute(route);
      setTilt(camera.tilt);
      setHeading(camera.heading);
      setZoom(1.2);
    }
  }), [heading, tilt]);

  // Handle selected place camera sync in 3D
  useEffect(() => {
    if (!selectedPlace) return;
    const camera = computeCameraForPlace(selectedPlace, heading);
    setTilt(camera.tilt);
    setZoom(1.5);
  }, [selectedPlace]);

  // Handle active route camera sync in 3D
  useEffect(() => {
    if (!activeRoute) return;
    const camera = computeCameraForRoute(activeRoute);
    setTilt(camera.tilt);
    setHeading(camera.heading);
    setZoom(1.2);
  }, [activeRoute]);

  // Handle preset camera selection
  const handleSelectPreset = (presetKey) => {
    const preset = CAMERA_PRESETS_3D[presetKey];
    if (!preset) return;
    setActivePreset(presetKey);
    setTilt(preset.tilt);
    setHeading(preset.heading);
    setZoom(presetKey === 'regionalOverview' ? 0.9 : 1.3);
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-stone-950 text-white">
      {/* 3D Geographic Canvas Render */}
      <Map3DFallback
        places={places}
        selectedPlace={selectedPlace}
        activeRoute={activeRoute}
        onSelectPlace={onSelectPlace}
        tilt={tilt}
        heading={heading}
        zoom={zoom}
        onTiltChange={setTilt}
        onHeadingChange={setHeading}
        onZoomChange={setZoom}
        onSelectPreset={handleSelectPreset}
      />

      {/* TOP-CENTER: 3D Camera Preset Switcher Chips */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[94%] sm:w-auto">
        <div className="bg-stone-900/90 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('nashikGodavari')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
              activePreset === 'nashikGodavari'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            🌊 Ramkund 3D
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('trimbakeshwar')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
              activePreset === 'trimbakeshwar'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            🛕 Trimbakeshwar 3D
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('regionalOverview')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer hidden xs:inline-block ${
              activePreset === 'regionalOverview'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            🌐 Corridor 3D
          </button>
        </div>
      </div>

      {/* BOTTOM-LEFT: 3D Perspective Metrics HUD */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2 text-stone-300">
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono shadow-xs">
          PITCH: {tilt}°
        </div>
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono shadow-xs">
          HEADING: {heading}° ({heading >= 315 || heading < 45 ? 'N' : heading < 135 ? 'E' : heading < 225 ? 'S' : 'W'})
        </div>
        <div className="bg-stone-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-800 text-[10px] font-mono text-amber-400 shadow-xs">
          3D SPATIAL ENGINE ACTIVE
        </div>
      </div>

      {/* 3D CAMERA ORBIT & TILT CONTROLS (Floating Right Toolbar) */}
      <div className="absolute bottom-28 right-4 z-20 flex flex-col gap-1.5">
        <div className="bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-800 shadow-xl p-1 flex flex-col gap-1 text-stone-300">
          {/* Tilt Up */}
          <button
            type="button"
            onClick={() => setTilt((t) => Math.min(t + 10, 75))}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
            title="Tilt Camera Up"
            aria-label="Tilt Camera Up"
          >
            ▲
          </button>
          {/* Tilt Down */}
          <button
            type="button"
            onClick={() => setTilt((t) => Math.max(t - 10, 20))}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
            title="Tilt Camera Down"
            aria-label="Tilt Camera Down"
          >
            ▼
          </button>
          <div className="w-full h-px bg-stone-800" />
          {/* Rotate Heading Left */}
          <button
            type="button"
            onClick={() => setHeading((h) => (h - 30 + 360) % 360)}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
            title="Rotate Left (30°)"
            aria-label="Rotate Left 30 degrees"
          >
            ↺
          </button>
          {/* Rotate Heading Right */}
          <button
            type="button"
            onClick={() => setHeading((h) => (h + 30) % 360)}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold"
            title="Rotate Right (30°)"
            aria-label="Rotate Right 30 degrees"
          >
            ↻
          </button>
          <div className="w-full h-px bg-stone-800" />
          {/* Reset North Compass */}
          <button
            type="button"
            onClick={() => setHeading(0)}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-[10px] font-extrabold text-amber-400"
            title="Reset Compass to North"
            aria-label="Reset North"
          >
            N
          </button>
        </div>
      </div>
    </div>
  );
});

export default Map3D;
