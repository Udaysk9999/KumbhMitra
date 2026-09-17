import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import MapMarker from './MapMarker';
import { REGIONAL_BOUNDS } from './mapConfig';

/**
 * Coordinate Projection Helper
 * Translates real geographic WGS84 (lat, lng) to canvas percentage coordinates
 * based on the Nashik + Trimbakeshwar regional bounding box.
 */
function projectCoords(lat, lng) {
  const { north, south, east, west } = REGIONAL_BOUNDS;
  const clampedLng = Math.max(west, Math.min(east, lng));
  const clampedLat = Math.max(south, Math.min(north, lat));

  const xPercent = ((clampedLng - west) / (east - west)) * 100;
  const yPercent = ((north - clampedLat) / (north - south)) * 100;

  return {
    left: `${xPercent.toFixed(3)}%`,
    top: `${yPercent.toFixed(3)}%`,
    xPercent,
    yPercent
  };
}

/**
 * MapFallback Component
 * Active when Google Maps API key is pending configuration or when offline.
 * Projects real geographic coordinates into an interactive, zoomable, pannable GIS canvas.
 */
const MapFallback = forwardRef(function MapFallback({
  places = [],
  selectedPlace = null,
  onSelectPlace,
  statusMessage = 'Configuration Notice: Add VITE_GOOGLE_MAPS_API_KEY in frontend/.env to load live Google Maps satellite/street tiles.'
}, ref) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });
  const containerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => setZoomLevel((z) => Math.min(z + 0.35, 2.5)),
    zoomOut: () => setZoomLevel((z) => Math.max(z - 0.35, 0.7)),
    resetView: () => {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }));

  // Pan to selected place
  useEffect(() => {
    if (!selectedPlace || !containerRef.current) return;
    const { xPercent, yPercent } = projectCoords(selectedPlace.latitude, selectedPlace.longitude);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const targetX = width * 0.5 - (xPercent / 100) * width * zoomLevel;
    const targetY = height * 0.5 - (yPercent / 100) * height * zoomLevel;

    setPanOffset({
      x: Math.max(-width * 0.8, Math.min(width * 0.8, targetX)),
      y: Math.max(-height * 0.8, Math.min(height * 0.8, targetY))
    });
  }, [selectedPlace, zoomLevel]);

  // Handle drag to pan
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
      className={`relative w-full h-full overflow-hidden select-none bg-stone-100 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      aria-label="Interactive GIS Fallback Map"
    >
      {/* Top Banner: API Status Guidance */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none max-w-xl w-[90%] sm:w-auto">
        <div className="bg-amber-50/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-amber-300 shadow-md flex items-start gap-2.5 text-stone-800">
          <span className="text-base leading-none mt-0.5" aria-hidden="true">🔑</span>
          <div className="text-xs">
            <div className="font-bold text-amber-900">
              Google Maps API Integration Active
            </div>
            <div className="text-[11px] text-amber-800/90 mt-0.5 leading-snug">
              {statusMessage}
            </div>
          </div>
        </div>
      </div>

      {/* Pannable & Zoomable Canvas Plane */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '50% 50%',
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
        }}
        className="relative w-full h-full"
      >
        {/* Cartographic Coordinate Grid */}
        <div
          className="absolute inset-0 opacity-[0.25] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #78716c 1px, transparent 1px),
              linear-gradient(to bottom, #78716c 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Nashik-Trimbakeshwar Corridor Vector Guide */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
          preserveAspectRatio="none"
          viewBox="0 0 1000 600"
        >
          {/* Godavari River Sacred Path from Trimbakeshwar to Nashik */}
          <path
            d="M 210,480 Q 420,380 650,330 T 920,290"
            fill="none"
            stroke="#0284c7"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
          <text x="660" y="305" fill="#0369a1" fontSize="13" fontWeight="bold" letterSpacing="2">
            GODAVARI RIVER BASIN
          </text>
          
          {/* Trimbak - Nashik NH-848 Pilgrimage Highway Corridor */}
          <path
            d="M 210,480 L 630,340"
            fill="none"
            stroke="#d97706"
            strokeWidth="4"
            strokeDasharray="8 6"
            opacity="0.6"
          />
          <text x="350" y="430" fill="#b45309" fontSize="10" fontWeight="bold">
            TRIMBAK - NASHIK HIGHWAY (SH-30 / NH-848)
          </text>
        </svg>

        {/* Real Coordinates Geographic Markers */}
        {places.map((place) => {
          const { left, top } = projectCoords(place.latitude, place.longitude);
          return (
            <div
              key={place.id}
              style={{ left, top }}
              className="absolute -translate-x-1/2 -translate-y-full z-10"
            >
              <MapMarker
                place={place}
                isSelected={selectedPlace?.id === place.id}
                onClick={onSelectPlace}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MapFallback;
