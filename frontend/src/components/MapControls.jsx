import React, { useCallback } from 'react';
import CurrentLocationButton from './CurrentLocationButton';

/**
 * Floating map control panel with zoom, geolocation, fit places, and reset view.
 * Interacts with the imperative methods exposed by the active map ref (GoogleMap or MapFallback).
 */
export default function MapControls({ mapRef, onLocationError, className = '' }) {
  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn?.();
  }, [mapRef]);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut?.();
  }, [mapRef]);

  const handleFitPlaces = useCallback(() => {
    mapRef.current?.fitPlaces?.();
  }, [mapRef]);

  const handleReset = useCallback(() => {
    mapRef.current?.resetView?.();
  }, [mapRef]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`} role="toolbar" aria-label="Map Navigation Controls">
      {/* Zoom In & Out Pill */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md p-1 flex flex-col gap-1 text-sm font-bold text-stone-700">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl hover:bg-stone-100 flex items-center justify-center transition-colors active:bg-stone-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Zoom in"
          title="Zoom In (+)"
        >
          <svg className="w-4 h-4 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <div className="w-full h-px bg-stone-200" aria-hidden="true" />
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl hover:bg-stone-100 flex items-center justify-center transition-colors active:bg-stone-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Zoom out"
          title="Zoom Out (-)"
        >
          <svg className="w-4 h-4 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Geolocation / My Location */}
      <CurrentLocationButton mapRef={mapRef} onError={onLocationError} />

      {/* Fit All Places */}
      <button
        type="button"
        onClick={handleFitPlaces}
        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md hover:bg-stone-100 flex items-center justify-center text-sm font-semibold text-stone-700 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-95"
        aria-label="Fit all places in view"
        title="Fit all places in view"
      >
        <span aria-hidden="true" className="text-base leading-none">📍</span>
      </button>

      {/* Recenter / Reset View */}
      <button
        type="button"
        onClick={handleReset}
        className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-95"
        aria-label="Reset map view to default"
        title="Reset map view"
      >
        <svg className="w-4 h-4 text-stone-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>
    </div>
  );
}
