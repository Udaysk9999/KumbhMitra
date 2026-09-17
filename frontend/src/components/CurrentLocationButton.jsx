import React, { useState, useCallback } from 'react';

/**
 * CurrentLocationButton Component
 * Requests geolocation from browser, recenters map with smooth zoom,
 * renders loading state, and safely handles permissions/errors.
 */
export default function CurrentLocationButton({ mapRef, onError, className = '' }) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(() => {
    if (!navigator.geolocation) {
      onError?.('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current?.setUserLocation) {
          mapRef.current.setUserLocation({ lat: latitude, lng: longitude });
        } else if (mapRef.current?.panTo) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
          if (mapRef.current.setZoom) {
            mapRef.current.setZoom(15);
          }
        }
        setLoading(false);
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        if (err.code === 1) msg = 'Location permission denied. Please allow access in browser settings.';
        else if (err.code === 2) msg = 'Location unavailable or GPS signal lost.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again.';
        onError?.(msg);
        setLoading(false);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  }, [mapRef, onError]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`w-9 h-9 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-md hover:bg-stone-100 flex items-center justify-center text-stone-700 transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 active:scale-95 ${className}`}
      aria-label="Find my current location"
      title="Show my location"
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-amber-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 text-stone-700 hover:text-amber-600 transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" fill="currentColor" />
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
          <circle cx="12" cy="12" r="7" />
        </svg>
      )}
    </button>
  );
}
