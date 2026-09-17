import React from 'react';

/**
 * MapErrorState Component
 * Displays a dismissible banner when Google Maps API or Geolocation encounters an issue.
 */
export default function MapErrorState({ error, onDismiss, onRetry }) {
  if (!error) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 max-w-md w-[92%] sm:w-auto animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-300 shadow-xl text-stone-800">
        <span className="text-base shrink-0" aria-hidden="true">⚠️</span>
        <div className="flex-1 text-xs">
          <p className="font-semibold text-stone-900 leading-tight">Notice</p>
          <p className="text-stone-600 mt-0.5 leading-normal">{error}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              aria-label="Dismiss error notice"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
