import React, { useState, useRef, useEffect } from 'react';
import MapLegend from './MapLegend';

/**
 * Modern MapTopControls Component
 * Floating card controls supporting:
 * - Prominent "📍 Near Me" trigger with category picker
 * - Satellite / Roadmap toggle
 * - My Location geolocation
 * - Zoom in / out
 * - Reset view
 * - Map Legend toggle
 */
export default function MapTopControls({
  mapRef,
  places = [],
  onNearbySearch,
  onLocationError,
  onToggleSidebar,
  isSidebarOpen = true,
  className = ''
}) {
  const [isNearMeOpen, setIsNearMeOpen] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);
  const nearMeRef = useRef(null);

  // Close Near Me dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (nearMeRef.current && !nearMeRef.current.contains(e.target)) {
        setIsNearMeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nearMeOptions = [
    { label: 'Nearby Hospitals', category: 'hospital', icon: '🏥' },
    { label: 'Nearby Temples', category: 'temple', icon: '🛕' },
    { label: 'Nearby Ghats', category: 'ghat', icon: '🌊' },
    { label: 'Nearby Food', category: 'restaurant', icon: '🍛' },
    { label: 'Nearby Toilets', category: 'public_toilet', icon: '🚻' },
    { label: 'Nearby Water', category: 'water_point', icon: '💧' },
    { label: 'Nearby Police', category: 'police', icon: '🚓' },
    { label: 'Nearby Parking', category: 'parking', icon: '🅿️' }
  ];

  const handleToggleSatellite = () => {
    mapRef.current?.toggleSatellite?.();
    setIsSatellite((prev) => !prev);
  };

  const handleZoomIn = () => mapRef.current?.zoomIn?.();
  const handleZoomOut = () => mapRef.current?.zoomOut?.();
  const handleReset = () => mapRef.current?.resetView?.();

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      onLocationError?.('Geolocation not supported by browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        mapRef.current?.setUserLocation?.(coords) || mapRef.current?.panTo?.(coords);
      },
      (err) => {
        onLocationError?.(err.message || 'Location permission unavailable.');
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      
      {/* Mobile Sidebar Toggle Button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="md:hidden px-3 py-2 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md text-stone-700 hover:bg-stone-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        aria-label="Toggle places menu"
      >
        <span>☰</span>
        <span>Places</span>
      </button>

      {/* Prominent "📍 Near Me" Button with Category Picker */}
      <div ref={nearMeRef} className="relative">
        <button
          type="button"
          onClick={() => setIsNearMeOpen((prev) => !prev)}
          className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white rounded-2xl shadow-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ring-2 ring-amber-500/20 active:scale-95"
          aria-expanded={isNearMeOpen}
          aria-label="Near Me Options"
        >
          <span>📍</span>
          <span>Near Me</span>
          <svg className={`w-3 h-3 transition-transform ${isNearMeOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Near Me Dropdown Menu */}
        {isNearMeOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-52 bg-white/98 backdrop-blur-md rounded-2xl border border-stone-200 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 py-1">
              Find Within 5-10 km
            </div>
            <div className="space-y-0.5">
              {nearMeOptions.map((opt) => (
                <button
                  key={opt.category}
                  type="button"
                  onClick={() => {
                    onNearbySearch(opt.category);
                    setIsNearMeOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-amber-50 hover:text-amber-900 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-sm">{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Satellite / Hybrid View Toggle */}
      <button
        type="button"
        onClick={handleToggleSatellite}
        className={`px-3 py-2 rounded-2xl border shadow-md font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
          isSatellite
            ? 'bg-stone-900 text-white border-stone-800'
            : 'bg-white/95 text-stone-700 border-stone-200 hover:bg-stone-50'
        }`}
        title="Toggle Satellite Tiles"
      >
        <span>🛰️</span>
        <span className="hidden sm:inline">{isSatellite ? 'Map' : 'Satellite'}</span>
      </button>

      {/* Geolocation Button */}
      <button
        type="button"
        onClick={handleMyLocation}
        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
        title="Center on My Location"
        aria-label="Center on My Location"
      >
        <svg className="w-4 h-4 text-stone-700 hover:text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      </button>

      {/* Zoom In & Out */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md p-0.5 flex items-center">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          ＋
        </button>
        <div className="w-px h-4 bg-stone-200" />
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-700 font-bold cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          －
        </button>
      </div>

      {/* Recenter / Reset View */}
      <button
        type="button"
        onClick={handleReset}
        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md hover:bg-stone-50 text-stone-700 flex items-center justify-center transition-all cursor-pointer"
        title="Reset Map to Nashik Corridor"
        aria-label="Reset Map"
      >
        <svg className="w-4 h-4 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>

      {/* Collapsible Legend */}
      <MapLegend places={places} />

    </div>
  );
}
