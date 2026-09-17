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
      {/* 3D Horizon & Sky Atmospheric Glow */}
      <div className="absolute inset-0 bg-radial from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

      {/* 3D Tilted Terrain Plane with Smooth Matrix Transform */}
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom}) rotateX(${tilt}deg) rotateZ(${heading}deg)`,
          transformStyle: 'preserve-3d'
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

  // Camera Fly-To helper for a place
  const flyToPlace = useCallback((place) => {
    if (!place) return;
    const camera = computeCameraForPlace(place, heading);
    setTilt(camera.tilt);
    setHeading(camera.heading);
    setZoom(camera.zoom);

    const { xPercent, yPercent } = project3DCoords(place.latitude, place.longitude);
    const width = window.innerWidth;
    const height = window.innerHeight;

    const targetX = width * 0.5 - (xPercent / 100) * width * camera.zoom;
    const targetY = height * 0.5 - (yPercent / 100) * height * camera.zoom;

    setPanOffset({
      x: Math.max(-width * 0.8, Math.min(width * 0.8, targetX)),
      y: Math.max(-height * 0.8, Math.min(height * 0.8, targetY))
    });
  }, [heading]);

  // Camera Fly-To helper for an active route
  const flyToRoute = useCallback((route) => {
    if (!route) return;
    const camera = computeCameraForRoute(route);
    setTilt(camera.tilt);
    setHeading(camera.heading);
    setZoom(camera.zoom);

    if (route.start && route.destination) {
      const midLat = (Number(route.start.latitude) + Number(route.destination.latitude)) / 2;
      const midLng = (Number(route.start.longitude) + Number(route.destination.longitude)) / 2;
      const { xPercent, yPercent } = project3DCoords(midLat, midLng);
      const width = window.innerWidth;
      const height = window.innerHeight;

      const targetX = width * 0.5 - (xPercent / 100) * width * camera.zoom;
      const targetY = height * 0.5 - (yPercent / 100) * height * camera.zoom;

      setPanOffset({
        x: Math.max(-width * 0.8, Math.min(width * 0.8, targetX)),
        y: Math.max(-height * 0.8, Math.min(height * 0.8, targetY))
      });
    }
  }, []);

  // Imperative camera controls for parent / hooks
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
    setZoom(presetKey === 'regionalOverview' ? 0.95 : 1.35);

    const { xPercent, yPercent } = project3DCoords(preset.center.lat, preset.center.lng);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const currentZoom = presetKey === 'regionalOverview' ? 0.95 : 1.35;

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

      {/* TOP-CENTER: 3D Preset Camera Navigator */}
      <nav
        className="absolute top-20 left-1/2 -translate-x-1/2 z-20 max-w-xl w-[94%] sm:w-auto pointer-events-auto"
        aria-label="3D Camera Presets"
      >
        <div className="bg-stone-900/90 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-stone-800 shadow-xl flex items-center justify-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('nashikGodavari')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
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
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
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
            className={`px-2.5 py-1 text-[11px] font-bold rounded-xl transition-all cursor-pointer hidden xs:inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
              activePreset === 'regionalOverview'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            🌐 Corridor 3D
          </button>
        </div>
      </nav>

      {/* BOTTOM-LEFT: 3D Spatial Metrics HUD */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2 text-stone-300">
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono shadow-xs">
          PITCH: {tilt}°
        </div>
        <div className="bg-stone-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] font-mono shadow-xs">
          BEARING: {heading}° ({heading >= 315 || heading < 45 ? 'N' : heading < 135 ? 'E' : heading < 225 ? 'S' : 'W'})
        </div>
        <div className="bg-stone-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-800 text-[10px] font-mono text-amber-400 shadow-xs">
          3D PLACE DISCOVERY ACTIVE ({places.length} LOCATIONS)
        </div>
      </div>

      {/* 3D CAMERA ORBIT & TILT CONTROLS (Floating Right Toolbar) */}
      <div
        className={`absolute right-4 z-20 flex flex-col gap-1.5 transition-all duration-200 ${
          activeRoute ? 'bottom-44 sm:bottom-28' : 'bottom-28'
        }`}
        role="toolbar"
        aria-label="3D Camera Orbit and Tilt Controls"
      >
        <div className="bg-stone-900/95 backdrop-blur-md rounded-2xl border border-stone-800 shadow-xl p-1 flex flex-col gap-1 text-stone-300">
          {/* Tilt Up */}
          <button
            type="button"
            onClick={() => setTilt((t) => Math.min(t + 10, 75))}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Tilt Camera Up (Increase Pitch)"
            aria-label="Tilt Camera Up"
          >
            ▲
          </button>
          {/* Tilt Down */}
          <button
            type="button"
            onClick={() => setTilt((t) => Math.max(t - 10, 20))}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
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
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Rotate Viewport Left (30°)"
            aria-label="Rotate Left 30 degrees"
          >
            ↺
          </button>
          {/* Rotate Heading Right */}
          <button
            type="button"
            onClick={() => setHeading((h) => (h + 30) % 360)}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Rotate Viewport Right (30°)"
            aria-label="Rotate Right 30 degrees"
          >
            ↻
          </button>
          <div className="w-full h-px bg-stone-800" aria-hidden="true" />
          {/* Reset North Compass */}
          <button
            type="button"
            onClick={() => setHeading(0)}
            className="w-9 h-9 rounded-xl hover:bg-stone-800 flex items-center justify-center transition-colors cursor-pointer text-[10px] font-extrabold text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Reset Compass Heading to North (0°)"
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
