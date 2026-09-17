import React from 'react';

/**
 * MapLoadingState Component
 * Displays a non-intrusive, elegant loading state while Google Maps tiles / SDK initialize.
 */
export default function MapLoadingState({ message = 'Initializing Live Map Viewport...' }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-100/70 backdrop-blur-xs pointer-events-none transition-opacity duration-300">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg">
        <svg
          className="animate-spin h-5 w-5 text-amber-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="text-xs font-semibold text-stone-800">
          {message}
        </span>
      </div>
    </div>
  );
}
