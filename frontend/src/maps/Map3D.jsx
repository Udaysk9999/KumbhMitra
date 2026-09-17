import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import {
  NASHIK_CENTER,
  TRIMBAKESHWAR_COORDS,
  REGIONAL_BOUNDS
} from './mapConfig';
import {
  CAMERA_PRESETS_3D,
  computeCameraForPlace,
  computeCameraForRoute,
  project3DCoords
} from './map3DService';
import Map3DMarker from './Map3DMarker';
import LandmarkVisual from './landmarks/LandmarkVisual';
import { getLandmarkConfig } from './landmarks/landmarkConfig';
import GeographicEnvironment3D from './environment/GeographicEnvironment3D';
import { buildSvgPathFromGeoJson } from '../routes/RouteLayer';

/**
 * Helper to format geographic compass bearing string (e.g. 025° NNE, 180° S)
 */
function formatCompassBearing(heading) {
  const normalized = ((heading % 360) + 360) % 360;
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(normalized / 22.5) % 16;
  return `${String(Math.round(normalized)).padStart(3, '0')}° ${directions[index]}`;
}

/**
 * 3D Geographic Canvas Component
 * Renders Nashik + Trimbakeshwar regional geography with interactive 3D perspective,
 * terrain elevation contours, Godavari River corridor, Brahmagiri mountain zone,
 * 3D place discovery pins, and route geometry.
 */
function Map3DCanvas({
  places,
  selectedPlace,
  activeRoute,
  onSelectPlace,
  tilt,
  heading,
  zoom,
  panOffset,
  setPanOffset
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPlaceId, setHoveredPlaceId] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

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

  // Touch gesture support for responsive mobile panning (360px - 430px)
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      initialPanX: panOffset.x,
      initialPanY: panOffset.y
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setPanOffset({
      x: dragStartRef.current.initialPanX + dx,
      y: dragStartRef.current.initialPanY + dy
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-full h-full overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 select-none cursor-grab active:cursor-grabbing touch-none"
      style={{ perspective: '1200px' }}
      aria-label="3D Geographic Spatial Map Viewport"
      role="region"
    >
      {/* 3D Horizon & Sky Atmospheric Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* 3D Tilted Terrain Plane with Smooth Matrix Transform */}
      <div
        className="absolute inset-0 origin-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotateX(${tilt}deg) rotateZ(${heading}deg)`,
          transformStyle: 'preserve-3d',
          transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Terrain Base Plane & Geographic Grid */}
        <div
          className="absolute inset-[-40%] rounded-3xl bg-stone-900/90 border-2 border-stone-800 shadow-2xl pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(217, 119, 6, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(217, 119, 6, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* 3D Geographic Environment: Godavari River Corridor, Brahmagiri Hills, Ground Plinths, Regional Corridor */}
        <GeographicEnvironment3D />

        {/* Selected Place Ground Spotlight Beacon */}
        {selectedPlace && (
          <div
            className="absolute pointer-events-none transition-all duration-500 ease-out"
            style={{
              left: project3DCoords(selectedPlace.latitude, selectedPlace.longitude).left,
              top: project3DCoords(selectedPlace.latitude, selectedPlace.longitude).top,
              transform: 'translate(-50%, -50%) translateZ(2px)',
              transformStyle: 'preserve-3d'
            }}
            aria-hidden="true"
          >
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 blur-md animate-pulse" />
            <div className="w-12 h-12 -mt-20 mx-auto rounded-full border-2 border-amber-400/80 bg-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
          </div>
        )}

        {/* 3D Active Route Polyline Layer */}
        {activeRoute && activeRoute.geometry?.coordinates && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
            style={{ transform: 'translateZ(18px)' }}
          >
            <path
              d={buildSvgPathFromGeoJson(activeRoute.geometry.coordinates, (lat, lng) => project3DCoords(lat, lng))}
              fill="none"
              stroke={activeRoute.modeColor || '#f59e0b'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_4px_10px_rgba(245,158,11,0.6)]"
            />
          </svg>
        )}

        {/* 3D Place Discovery Pins + Landmark Architectural Visuals */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          const isHovered = hoveredPlaceId === place.id;
          const isRouteStart = activeRoute?.start?.id === place.id;
          const isRouteDest = activeRoute?.destination?.id === place.id;
          const landmarkConfig = getLandmarkConfig(place.id);
          const hasActiveSelection = Boolean(selectedPlace);

          // Render architectural landmark visual for known landmarks
          if (landmarkConfig) {
            return (
              <LandmarkVisual
                key={`landmark-${place.id}`}
                place={place}
                landmarkConfig={landmarkConfig}
                isSelected={isSelected}
                isHovered={isHovered}
                isRouteStart={isRouteStart}
                isRouteDest={isRouteDest}
                hasActiveSelection={hasActiveSelection}
                heading={heading}
                tilt={tilt}
                onClick={onSelectPlace}
                onMouseEnter={(p) => setHoveredPlaceId(p.id)}
                onMouseLeave={() => setHoveredPlaceId(null)}
              />
            );
          }

          // Standard 3D marker for all other places
          return (
            <Map3DMarker
              key={place.id}
              place={place}
              isSelected={isSelected}
              isHovered={isHovered}
              isRouteStart={isRouteStart}
              isRouteDest={isRouteDest}
              hasActiveSelection={hasActiveSelection}
              heading={heading}
              tilt={tilt}
              onClick={onSelectPlace}
              onMouseEnter={(p) => setHoveredPlaceId(p.id)}
              onMouseLeave={() => setHoveredPlaceId(null)}
            />
          );
        })}
      </div>
    </div>
  );
}

/**
 * Main Modular 3D Map Component
 * Implements 3D Place Discovery with billboarded markers, camera fly-to animations,
 * interactive pitch/heading orbit controls, and geographic presets.
 */
const Map3D = forwardRef(function Map3D({
  places = [],
  selectedPlace = null,
  activeRoute = null,
  onSelectPlace,
  onToggleMode
}, ref) {
  const [tilt, setTilt] = useState(55);
  const [heading, setHeading] = useState(25);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [activePreset, setActivePreset] = useState('nashikGodavari');

  // Camera Fly-To helper for a place with responsive mobile bias
  const flyToPlace = useCallback((place) => {
    if (!place) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const camera = computeCameraForPlace(place, heading, isMobile);
    setTilt(camera.tilt);
    setHeading(camera.heading);
    setZoom(camera.zoom);

    const { xPercent, yPercent } = project3DCoords(place.latitude, place.longitude);
    const width = window.innerWidth;
    const height = window.innerHeight;

    // On mobile screens, bias the focal point slightly upward so it clears the bottom preview sheet
    const verticalBias = isMobile ? height * 0.08 : 0;
    const targetX = width * 0.5 - (xPercent / 100) * width * camera.zoom;
    const targetY = (height * 0.5 - verticalBias) - (yPercent / 100) * height * camera.zoom;

    setPanOffset({
      x: Math.max(-width * 0.75, Math.min(width * 0.75, targetX)),
      y: Math.max(-height * 0.75, Math.min(height * 0.75, targetY))
    });
  }, [heading]);

  // Camera Fly-To helper for an active route with mobile optimization
  const flyToRoute = useCallback((route) => {
    if (!route) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const camera = computeCameraForRoute(route, isMobile);
    setTilt(camera.tilt);
    setHeading(camera.heading);
    setZoom(camera.zoom);

    if (route.start && route.destination) {
      const midLat = (Number(route.start.latitude) + Number(route.destination.latitude)) / 2;
      const midLng = (Number(route.start.longitude) + Number(route.destination.longitude)) / 2;
      const { xPercent, yPercent } = project3DCoords(midLat, midLng);
      const width = window.innerWidth;
      const height = window.innerHeight;

      const verticalBias = isMobile ? height * 0.06 : 0;
      const targetX = width * 0.5 - (xPercent / 100) * width * camera.zoom;
      const targetY = (height * 0.5 - verticalBias) - (yPercent / 100) * height * camera.zoom;

      setPanOffset({
        x: Math.max(-width * 0.75, Math.min(width * 0.75, targetX)),
        y: Math.max(-height * 0.75, Math.min(height * 0.75, targetY))
      });
    }
  }, []);

  // Imperative camera controls for parent / hooks
  useImperativeHandle(ref, () => ({
    zoomIn: () => setZoom((z) => Math.min(z + 0.25, 2.2)),
    zoomOut: () => setZoom((z) => Math.max(z - 0.25, 0.7)),
    tiltUp: () => setTilt((t) => Math.min(t + 8, 65)),
    tiltDown: () => setTilt((t) => Math.max(t - 8, 20)),
    rotateLeft: () => setHeading((h) => (h - 30 + 360) % 360),
    rotateRight: () => setHeading((h) => (h + 30) % 360),
    resetHeading: () => setHeading(0),
    resetView: () => {
      setTilt(55);
      setHeading(25);
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setActivePreset('nashikGodavari');
    },
    fitPlaces: () => {
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });
      setActivePreset('regionalOverview');
    },
    panTo: (coords) => {
      if (!coords) return;
      flyToPlace({ latitude: coords.lat ?? coords.latitude, longitude: coords.lng ?? coords.longitude });
    },
    fitToPlace: (place) => {
      if (!place) return;
      flyToPlace(place);
    },
    fitBoundsToRoute: (route) => {
      if (!route) return;
      flyToRoute(route);
    }
  }), [flyToPlace, flyToRoute]);

  // Synchronize 3D camera when selected place changes
  useEffect(() => {
    if (!selectedPlace) return;
    flyToPlace(selectedPlace);
  }, [selectedPlace, flyToPlace]);

  // Synchronize 3D camera when active route changes
  useEffect(() => {
    if (!activeRoute) return;
    flyToRoute(activeRoute);
  }, [activeRoute, flyToRoute]);

  // Handle preset camera buttons
  const handleSelectPreset = (presetKey) => {
    const preset = CAMERA_PRESETS_3D[presetKey];
    if (!preset) return;
    setActivePreset(presetKey);
    setTilt(preset.tilt);
    setHeading(preset.heading);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const baseZoom = presetKey === 'regionalOverview' ? 0.95 : 1.35;
    const currentZoom = isMobile ? Math.max(0.85, baseZoom - 0.15) : baseZoom;
    setZoom(currentZoom);

    const { xPercent, yPercent } = project3DCoords(preset.center.lat, preset.center.lng);
    const width = window.innerWidth;
    const height = window.innerHeight;

    setPanOffset({
      x: width * 0.5 - (xPercent / 100) * width * currentZoom,
      y: height * 0.5 - (yPercent / 100) * height * currentZoom
    });
  };

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-stone-950 text-white">
      {/* 3D Geographic Canvas */}
      <Map3DCanvas
        places={places}
        selectedPlace={selectedPlace}
        activeRoute={activeRoute}
        onSelectPlace={onSelectPlace}
        tilt={tilt}
        heading={heading}
        zoom={zoom}
        panOffset={panOffset}
        setPanOffset={setPanOffset}
      />

      {/* TOP-CENTER: 3D Preset Camera Navigator (Positioned cleanly below category filters) */}
      <nav
        className="absolute top-2.5 sm:top-3.5 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[96%] sm:w-auto pointer-events-auto"
        aria-label="3D Geographic Presets"
      >
        <div className="bg-stone-900/95 backdrop-blur-md px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('nashikGodavari')}
            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              activePreset === 'nashikGodavari'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            aria-label="Switch 3D camera to Ramkund and Godavari Basin"
          >
            🌊 Ramkund 3D
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('trimbakeshwar')}
            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              activePreset === 'trimbakeshwar'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            aria-label="Switch 3D camera to Trimbakeshwar and Brahmagiri Hills"
          >
            🛕 Trimbakeshwar 3D
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('regionalOverview')}
            className={`px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-xl transition-all cursor-pointer hidden xs:inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              activePreset === 'regionalOverview'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
            aria-label="Switch 3D camera to regional corridor overview"
          >
            🌐 Corridor 3D
          </button>
        </div>
      </nav>

      {/* BOTTOM-LEFT: 3D Spatial Metrics HUD */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden md:flex items-center gap-1.5 text-stone-300">
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono shadow-xs">
          PITCH: {tilt}°
        </div>
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono shadow-xs">
          BEARING: {formatCompassBearing(heading)}
        </div>
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono text-amber-400 shadow-xs">
          3D EXPLORATION ({places.length} LOCATIONS)
        </div>
      </div>

      {/* 3D CAMERA ORBIT & TILT CONTROLS (Floating Right Toolbar - Collision Safe) */}
      <div
        className={`absolute right-3 sm:right-4 z-20 flex flex-col gap-1.5 transition-all duration-300 ${
          activeRoute || selectedPlace ? 'bottom-52 sm:bottom-36 md:bottom-28' : 'bottom-20 sm:bottom-24 md:bottom-28'
        }`}
        role="toolbar"
        aria-label="3D Camera Orbit and Tilt Controls"
      >
        <div className="bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-800 shadow-xl p-1 flex flex-col gap-1 text-stone-300">
          {/* Tilt Up */}
          <button
            type="button"
            onClick={() => setTilt((t) => Math.min(t + 8, 65))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Tilt Camera Up (Increase Pitch)"
            aria-label="Tilt Camera Up"
          >
            ▲
          </button>
          {/* Tilt Down */}
          <button
            type="button"
            onClick={() => setTilt((t) => Math.max(t - 8, 20))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Tilt Camera Down (Decrease Pitch)"
            aria-label="Tilt Camera Down"
          >
            ▼
          </button>
          <div className="w-full h-px bg-stone-800" aria-hidden="true" />
          {/* Rotate Heading Left */}
          <button
            type="button"
            onClick={() => setHeading((h) => (h - 30 + 360) % 360)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Rotate Viewport Left (30°)"
            aria-label="Rotate Left 30 degrees"
          >
            ↺
          </button>
          {/* Rotate Heading Right */}
          <button
            type="button"
            onClick={() => setHeading((h) => (h + 30) % 360)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Rotate Viewport Right (30°)"
            aria-label="Rotate Right 30 degrees"
          >
            ↻
          </button>
          <div className="w-full h-px bg-stone-800" aria-hidden="true" />
          {/* Compass Rose Needle Control (Interactive Orientation Indicator & North Reset) */}
          <button
            type="button"
            onClick={() => setHeading(0)}
            className="w-8 h-9 sm:w-9 sm:h-10 rounded-xl hover:bg-stone-800 flex flex-col items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title={`Bearing: ${formatCompassBearing(heading)} — Click to Reset North (0°)`}
            aria-label={`Compass heading ${heading} degrees. Click to reset orientation to North`}
          >
            <div
              className="w-5 h-5 rounded-full border border-stone-600/70 bg-stone-950 flex items-center justify-center transition-transform duration-300 ease-out shadow-inner"
              style={{ transform: `rotate(${-heading}deg)` }}
              aria-hidden="true"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-b-[7px] border-b-rose-500 drop-shadow-xs" />
                <div className="w-0.5 h-0.5 rounded-full bg-amber-400 z-10 -my-0.5" />
                <div className="w-0 h-0 border-l-[2.5px] border-l-transparent border-r-[2.5px] border-r-transparent border-t-[7px] border-t-stone-300 drop-shadow-xs" />
              </div>
            </div>
            <span className="text-[7px] font-mono font-bold text-amber-400 mt-0.5 leading-none">
              {heading === 0 ? 'N' : `${heading}°`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default Map3D;
