import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import GoogleMap from './GoogleMap';
import MapFallback from './MapFallback';
import Map3D from './Map3D';
import MapControls from '../components/MapControls';
import MapLegend from '../components/MapLegend';
import MapErrorState from '../components/MapErrorState';
import { NASHIK_CENTER } from './mapConfig';

/**
 * Main Interactive Map Container Component
 * Seamlessly manages transitions between 2D interactive map (Google Map / Fallback GIS)
 * and 3D Geographic Spatial View (Map3D).
 * Preserves selected place, active route, filters, and discovery state across mode switches.
 */
const MapContainer = forwardRef(function MapContainer({
  mode = '2D',
  places = [],
  selectedPlace = null,
  activeRoute = null,
  onSelectPlace,
  onToggleMode
}, ref) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [mapError, setMapError] = useState(apiKey ? null : 'MISSING_API_KEY');
  const [userNotification, setUserNotification] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(NASHIK_CENTER);
  const mapRef = useRef(null);

  // Expose active map imperative handles to parent
  useImperativeHandle(ref, () => mapRef.current, []);

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
      aria-label="Interactive Map Viewport"
    >
      {/* Toast / Banner for location or map notifications */}
      {userNotification && (
        <MapErrorState
          error={userNotification}
          onDismiss={() => setUserNotification(null)}
        />
      )}

      {/* 2D / 3D VIEWPORT SWITCHER */}
      {mode === '2D' ? (
        apiKey && !mapError ? (
          <GoogleMap
            ref={mapRef}
            apiKey={apiKey}
            places={places}
            selectedPlace={selectedPlace}
            activeRoute={activeRoute}
            onSelectPlace={onSelectPlace}
            onError={(err) => setMapError(err)}
            onCoordinatesChange={(coords) => setCurrentCoords(coords)}
          />
        ) : (
          <MapFallback
            ref={mapRef}
            places={places}
            selectedPlace={selectedPlace}
            activeRoute={activeRoute}
            onSelectPlace={onSelectPlace}
            statusMessage={getStatusMessage()}
          />
        )
      ) : (
        /* LIVE 3D GEOGRAPHIC SPATIAL ENGINE */
        <Map3D
          ref={mapRef}
          places={places}
          selectedPlace={selectedPlace}
          activeRoute={activeRoute}
          onSelectPlace={onSelectPlace}
          onToggleMode={onToggleMode}
        />
      )}

      {/* TOP-LEFT OVERLAY: Regional Map Info */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-stone-200/90 shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                mode === '3D'
                  ? 'bg-amber-500 animate-pulse'
                  : apiKey && !mapError
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-bold text-stone-900 tracking-tight">
              {mode === '3D'
                ? '3D Spatial Corridor'
                : apiKey && !mapError
                ? 'Google Maps 2D'
                : 'Local GIS Mode'}
            </span>
            <span className="text-stone-300">|</span>
            <span className="text-[11px] font-semibold text-amber-800">
              Nashik + Trimbakeshwar
            </span>
          </div>
          <div className="text-[10px] text-stone-500 mt-0.5">
            {activeRoute ? (
              <span className="text-amber-700 font-semibold">
                📍 Active Route: {activeRoute.start.name.split(' ')[0]} ➔ {activeRoute.destination.name.split(' ')[0]} ({activeRoute.distanceText})
              </span>
            ) : (
              <span>
                {mode === '3D'
                  ? `Rendering ${places.length} places in 3D perspective • Click pins or presets`
                  : `Showing ${places.length} Kumbh locations • Click markers for intelligence`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TOP-RIGHT OVERLAY: Map Legend & Mode Indicator */}
      <div className="absolute top-20 right-4 z-20 flex items-center gap-2">
        <MapLegend places={places} />
        <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-200/90 shadow-sm items-center gap-2 hidden sm:flex">
          <span
            className={`w-2 h-2 rounded-full ${
              mode === '2D' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="text-xs font-bold font-mono text-stone-800">
            {mode === '2D' ? '2D Map Active' : '3D Spatial Active'}
          </span>
        </div>
      </div>

      {/* BOTTOM-LEFT: Coordinates Indicator (2D Mode) */}
      {mode === '2D' && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none hidden md:flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-700 shadow-xs">
            CENTER: {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
          </div>
          <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg border border-stone-200 text-[10px] font-mono text-stone-700 shadow-xs">
            CORRIDOR: NASHIK-TRIMBAK
          </div>
        </div>
      )}

      {/* BOTTOM-RIGHT: Floating Navigation Controls */}
      <div
        className={`absolute right-4 z-20 transition-all duration-200 ${
          activeRoute ? 'bottom-24 sm:bottom-4' : 'bottom-4'
        }`}
      >
        <MapControls
          mapRef={mapRef}
          onLocationError={(msg) => setUserNotification(msg)}
        />
      </div>
    </div>
  );
});

export default MapContainer;
