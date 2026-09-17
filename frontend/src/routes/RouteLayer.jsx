import React from 'react';

/**
 * Route Endpoint Marker Component
 * Highlights origin (A) and destination (B) distinctly when a route is active
 */
export function RouteEndpointMarker({ type = 'start', label, placeName, onClick }) {
  const isStart = type === 'start';
  const bgClass = isStart ? 'bg-emerald-600' : 'bg-amber-600';
  const ringClass = isStart ? 'ring-emerald-500/40' : 'ring-amber-500/40';

  return (
    <div className="relative group transition-transform duration-200 hover:scale-110 z-40 select-none">
      <button
        type="button"
        onClick={onClick}
        className="relative flex flex-col items-center focus:outline-none cursor-pointer"
        aria-label={`${isStart ? 'Route Origin' : 'Route Destination'}: ${placeName}`}
      >
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white border-2 border-white shadow-xl ring-4 ${ringClass} ${bgClass} font-bold text-xs`}
        >
          <span className="w-4 h-4 rounded-full bg-white text-stone-900 flex items-center justify-center text-[10px] font-black">
            {label || (isStart ? 'A' : 'B')}
          </span>
          <span className="max-w-[130px] truncate whitespace-nowrap">
            {placeName}
          </span>
        </div>

        {/* Needle */}
        <div
          className={`w-2.5 h-2.5 -mt-1.5 rotate-45 border-r border-b border-transparent ${bgClass}`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/**
 * Helper to convert GeoJSON LineString coordinates [[lng, lat], ...] to SVG path 'd' attribute
 * given a coordinate projection function (lng, lat) => { xPercent, yPercent }
 */
export function buildSvgPathFromGeoJson(coordinates = [], projectFn) {
  if (!coordinates || coordinates.length < 2 || !projectFn) return '';

  return coordinates.reduce((acc, [lng, lat], index) => {
    const { xPercent, yPercent } = projectFn(lat, lng);
    const cmd = index === 0 ? 'M' : 'L';
    return `${acc} ${cmd} ${xPercent} ${yPercent}`;
  }, '').trim();
}
