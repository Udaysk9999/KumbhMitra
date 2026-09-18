import React, { useState, useEffect } from 'react';

/**
 * BackendStatus
 *
 * Displays a real-time badge indicating whether AI KumbhMitra is consuming
 * live data from the backend REST API or falling back to the local demo dataset.
 *
 * Props:
 *   source  – 'api' | 'mock' | null
 *             Passed down from placeService.getPlaces() result.source
 *
 * Visual states:
 *   'api'  → 🟢 Live Data   (green pulse badge)
 *   'mock' → 🟡 Demo Mode   (amber static badge)
 *   null   → loading spinner (invisible until source resolves)
 */
export default function BackendStatus({ source }) {
  const [visible, setVisible] = useState(false);

  // Fade in once source resolves
  useEffect(() => {
    if (source) {
      const t = setTimeout(() => setVisible(true), 300);
      return () => clearTimeout(t);
    }
  }, [source]);

  if (!source) return null;

  const isLive = source === 'api';

  return (
    <div
      id="backend-status-badge"
      role="status"
      aria-label={isLive ? 'Connected to live backend data' : 'Running in demo mode with local data'}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide
        border transition-all duration-500
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}
        ${isLive
          ? 'bg-emerald-50 border-emerald-300/70 text-emerald-700'
          : 'bg-amber-50 border-amber-300/60 text-amber-700'}
      `}
    >
      {/* Status dot */}
      <span className="relative flex h-1.5 w-1.5">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            isLive ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </span>

      {/* Label */}
      <span className="hidden sm:inline">
        {isLive ? 'Live Data' : 'Demo Mode'}
      </span>
    </div>
  );
}
