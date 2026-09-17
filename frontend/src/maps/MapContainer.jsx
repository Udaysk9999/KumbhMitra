import React, { useState, useRef } from 'react';
import GoogleMap from './GoogleMap';
import MapFallback from './MapFallback';
import { NASHIK_CENTER } from './mapConfig';

/**
 * Main Interactive Map Container Component
 * Coordinates between Google Maps 2D mode, fallback GIS mode, and 3D preview mode.
 */
export default function MapContainer({
  mode = '2D',
  places = [],
  selectedPlace = null,
  onSelectPlace,
  onToggleMode
}) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapError, setMapError] = useState(apiKey ? null : 'MISSING_API_KEY');
  const [currentCoords, setCurrentCoords] = useState(NASHIK_CENTER);
  const mapRef = useRef(null);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn?.();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut?.();
  };

  const handleResetView = () => {
    mapRef.current?.resetView?.();
  };

  const handleFitPlaces = () => {
    mapRef.current?.fitPlaces?.();
  };

  const getStatusMessage = () => {
    if (mapError === 'MISSING_API_KEY') {
      return 'Configuration Notice: Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env to enable live Google Maps satellite/street tiles.';
    }
    if (mapError === 'AUTH_FAILURE') {
      return 'Google Maps Authentication Warning: The configured API key was rejected by Google Cloud. Verify key permissions and billing status.';
    }
    return `Map Notice: ${mapError}`;
  };

  return (
    <div
      className="relative w-full h-full flex-1 overflow-hidden select-none bg-stone-100"
      aria-label="Interactive Map Area"
    >
      {/* 2D MODE VIEWPORT */}
      {mode === '2D' ? (
        apiKey && !mapError ? (
          <GoogleMap
            ref={mapRef}
            apiKey={apiKey}
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={onSelectPlace}
            onError={(err) => setMapError(err)}
            onCoordinatesChange={(coords) => setCurrentCoords(coords)}
          />
        ) : (
          <MapFallback
            ref={mapRef}
            places={places}
            selectedPlace={selectedPlace}
            onSelectPlace={onSelectPlace}
            statusMessage={getStatusMessage()}
          />
        )
      ) : (
        /* 3D MODE PLACEHOLDER (Phase 3 Scope) */
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950 text-white">
          <div className="max-w-md w-full p-6 rounded-2xl bg-stone-800/80 backdrop-blur-md border border-stone-700 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
                Phase 3 Preview
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Immersive 3D Spatial View
              </h2>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                Google 3D Photorealistic Tiles and Cesium/Three.js spatial terrain are scheduled for implementation in Phase 3.
              </p>
            </div>

            <div className="p-3 bg-stone-900/60 rounded-xl border border-stone-700/80 text-[11px] text-stone-400 text-left space-y-1">
              <div className="font-semibold text-stone-200">Current Scope:</div>
              <div>• Nashik Godavari River Basin (2D Interactive)</div>
              <div>• Trimbakeshwar Jyotirlinga Corridor (2D Interactive)</div>
            </div>

            <button
              type="button"
              onClick={() => onToggleMode?.('2D')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-amber-600/30"
            >
              Return to Interactive 2D Map
            </button>
          </div>
        </div>
      )}

      {/* TOP-LEFT OVERLAY: Regional Map Info */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/90 shadow-sm">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${apiKey && !mapError ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-xs font-bold text-stone-900 tracking-tight">
              {apiKey && !mapError ? 'Google Maps 2D' : 'Local GIS Mode'}
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-[11px] font-semibold text-amber-800">
              Nashik + Trimbakeshwar
            </span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">
            Showing {places.length} Kumbh locations • Click markers for intelligence
          </div>
        </div>
      </div>

      {/* TOP-RIGHT OVERLAY: Mode Badge (Desktop/Tablet) */}
      <div className="absolute top-20 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-sm flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${mode === '2D' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          <span className="text-xs font-bold font-mono text-stone-800">
            {mode === '2D' ? '2D Map Active' : '3D Mode Pending'}
          </span>
        </div>
      </div>

      {/* BOTTOM-LEFT: Coordinates Indicator */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2">
        <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-700 shadow-xs">
          CENTER: {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
        </div>
        <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-700 shadow-xs">
          CORRIDOR: NASHIK-TRIMBAK
        </div>
      </div>

      {/* BOTTOM-RIGHT: Map Navigation Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-md p-1 flex flex-col gap-1 text-sm font-bold text-stone-700">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors active:bg-stone-200"
            aria-label="Zoom in"
            title="Zoom In"
          >
            +
          </button>
          <div className="w-full h-px bg-stone-200"></div>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors active:bg-stone-200"
            aria-label="Zoom out"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Recenter / Fit All Places Button */}
        <button
          type="button"
          onClick={handleFitPlaces}
          className="bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-md p-2 hover:bg-stone-100 flex items-center justify-center text-xs font-semibold text-stone-700 transition-colors"
          title="Fit all places in view"
          aria-label="Fit all places in view"
        >
          📍
        </button>
      </div>
    </div>
  );
}
