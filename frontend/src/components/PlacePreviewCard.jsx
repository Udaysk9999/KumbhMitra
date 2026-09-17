import React from 'react';
import { getCategoryTheme } from '../maps/mapConfig';

/**
 * Compact Place Preview Card Component
 * Displays essential place details when a marker or search result is selected.
 * Includes direct actions for viewing full details or getting route directions.
 */
export default function PlacePreviewCard({ place, onViewDetails, onGetDirections, onClose }) {
  if (!place) return null;

  const theme = getCategoryTheme(place.category);

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-sm z-30 animate-in fade-in slide-in-from-bottom-3 duration-200"
      role="region"
      aria-label={`Place preview for ${place.name}`}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/90 shadow-xl p-3.5 sm:p-4 text-stone-900">
        
        {/* Header: Category Badge & Close Button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base" aria-hidden="true">
              {place.categoryIcon || '📍'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badgeClass}`}>
              {place.categoryLabel || place.category}
            </span>
            <span className="text-[11px] font-medium text-stone-500">
              {place.region}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close place preview"
            title="Dismiss preview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Place Title & Rating */}
        <div className="mb-1.5">
          <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1">
            {place.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-600">
            {place.rating && (
              <span className="flex items-center gap-0.5 font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                <span>⭐</span>
                <span>{place.rating}</span>
              </span>
            )}
            <span className="text-stone-500 truncate">
              {place.address}
            </span>
          </div>
        </div>

        {/* Action Buttons: Directions & View Details */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onGetDirections?.(place)}
            className="px-2.5 py-1.5 bg-stone-100 hover:bg-amber-50 hover:text-amber-900 border border-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={`Directions to ${place.name}`}
          >
            <span>🧭</span>
            <span>Directions</span>
          </button>

          <button
            type="button"
            onClick={() => onViewDetails?.(place)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label={`View full details for ${place.name}`}
          >
            <span>View Details</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
