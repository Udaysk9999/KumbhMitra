import React from 'react';

/**
 * Reusable Loading, Empty, and Error Status Views for Places
 */

/**
 * Loading state spinner / shimmer indicator
 */
export function PlacesLoadingView({ message = 'Loading places...' }) {
  return (
    <div 
      className="absolute top-28 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-stone-200 shadow-lg flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200"
      role="status"
      aria-live="polite"
    >
      <span className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></span>
      <span className="text-xs font-semibold text-stone-800">{message}</span>
    </div>
  );
}

/**
 * Empty results state when category filter or query finds no locations
 */
export function PlacesEmptyView({ categoryLabel = 'this category', onReset }) {
  return (
    <div 
      className="absolute top-28 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-amber-200/80 shadow-xl max-w-sm w-11/12 text-center animate-in fade-in slide-in-from-top-2 duration-200"
      role="alert"
    >
      <div className="text-2xl mb-1.5" aria-hidden="true">📍</div>
      <div className="text-xs font-bold text-stone-900 mb-1">
        No Places Found
      </div>
      <p className="text-[11px] text-stone-500 mb-3">
        No verified places found in {categoryLabel}. Try selecting another category or searching all places.
      </p>
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95"
        >
          View All Places
        </button>
      )}
    </div>
  );
}

/**
 * Notice banner displayed when API is unavailable and using offline mock data
 */
export function ApiUnavailableNotice({ error, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-4 z-30 max-w-sm bg-stone-900/90 text-white backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-stone-700 shadow-xl flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
        <div>
          <span className="font-semibold text-amber-300">Offline Dataset Mode</span>
          <span className="text-stone-300 text-[11px] block">
            {error ? 'Backend API unavailable. Using verified local POIs.' : 'Serving verified local POIs for Nashik & Trimbakeshwar.'}
          </span>
        </div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-stone-400 hover:text-white p-1"
          aria-label="Dismiss notice"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default {
  PlacesLoadingView,
  PlacesEmptyView,
  ApiUnavailableNotice
};
