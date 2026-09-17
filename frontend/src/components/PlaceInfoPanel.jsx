<<<<<<< HEAD
import React, { useState } from 'react';
import { formatOpeningHours, formatAccessibility } from '../places/placeUtils';

/**
 * Reusable Place Information Panel
 * Google Maps-style information drawer providing details on selected place.
 * Safely renders optional fields without displaying "undefined" or crashing on missing data.
=======
import React, { useEffect } from 'react';

/**
 * Place Information Panel Component
 * Displays comprehensive details for a selected place.
 * Includes "Get Directions" action integrating with RoutePanel.
>>>>>>> 38212d7 (frontend 1)
 */
export default function PlaceInfoPanel({ place, onClose, onGetDirections }) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!place) return null;

  const handleStartRoute = () => {
    if (onGetDirections) {
      onGetDirections(place);
    }
  };

  const categoryLabel = place.categoryLabel || place.category || 'Pilgrimage Site';
  const categoryIcon = place.categoryIcon || '📍';
  const region = place.region || 'Nashik / Trimbakeshwar';
  const bgStyle = place.imagePlaceholder || (place.image ? `url(${place.image})` : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)');
  const formattedHours = formatOpeningHours(place.openingHours);
  const formattedAccessibility = formatAccessibility(place.accessibility);
  const phone = place.phone || place.contact || null;
  const tags = Array.isArray(place.tags) ? place.tags.filter(Boolean) : [];
  const facilities = Array.isArray(place.facilities) ? place.facilities.filter(Boolean) : [];

  const hasKeyInfo = Boolean(place.address || formattedHours || phone || formattedAccessibility || place.coordinatesSummary);

  return (
    <aside
      className="fixed inset-x-0 bottom-0 max-h-[78vh] sm:max-h-full sm:inset-y-0 sm:left-auto sm:right-0 z-40 w-full sm:w-[420px] bg-white/98 backdrop-blur-md shadow-2xl border-t sm:border-t-0 sm:border-l border-stone-200/90 rounded-t-3xl sm:rounded-none flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-right"
      aria-label={`Detailed information for ${place.name}`}
      role="dialog"
      aria-modal="false"
    >
      {/* Mobile Drag Indicator Handle */}
      <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" aria-hidden="true" />

      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
        <div className="flex items-center gap-2">
<<<<<<< HEAD
          <span className="text-xl" aria-hidden="true">{categoryIcon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200/70">
            {categoryLabel}
=======
          <span className="text-xl" aria-hidden="true">{place.categoryIcon || '📍'}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200/70">
            {place.categoryLabel || place.category}
          </span>
          <span className="text-[11px] font-medium text-stone-500">
            {place.region}
>>>>>>> 38212d7 (frontend 1)
          </span>
          {region && (
            <span className="text-[11px] font-medium text-stone-500">
              {region}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          aria-label="Close place details panel"
          title="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        
        {/* Visual Header / Image Placeholder */}
        <div 
          style={{ background: bgStyle }}
          className="w-full h-36 rounded-2xl flex flex-col justify-end p-4 text-white shadow-inner relative overflow-hidden bg-cover bg-center"
        >
          <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-sm text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-mono">
            Kumbh 2027
          </div>
          {place.tagline && (
            <div className="text-xs font-medium opacity-90 drop-shadow-sm">{place.tagline}</div>
          )}
        </div>

        {/* Title & Rating */}
        <div>
          <h2 className="text-xl font-bold text-stone-900 leading-tight">
            {place.name || 'Verified Location'}
          </h2>

<<<<<<< HEAD
          <div className="mt-2 flex items-center gap-3 text-xs text-stone-600">
            {place.rating ? (
              <div className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                <span>⭐</span>
                <span>{place.rating}</span>
              </div>
            ) : null}
            {place.reviewsCount ? (
              <>
                <span className="text-stone-400">•</span>
                <span>{place.reviewsCount}</span>
              </>
            ) : null}
            <span className="text-stone-400">•</span>
=======
          <div className="mt-2 flex items-center gap-3 text-xs text-stone-600 flex-wrap">
            <div className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
              <span>⭐</span>
              <span>{place.rating || '4.5'}</span>
            </div>
            <span className="text-stone-400">·</span>
            <span>{place.reviewsCount || '1,000+ reviews'}</span>
            <span className="text-stone-400">·</span>
>>>>>>> 38212d7 (frontend 1)
            <span className="text-emerald-700 font-medium">Verified Location</span>
          </div>
        </div>

        {/* Description */}
        {place.description ? (
          <p className="text-xs leading-relaxed text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            {place.description}
          </p>
        ) : null}

        {/* Action Button: Get Directions */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleStartRoute}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          >
            <span>🧭</span>
            <span>Get Directions / Plan Route</span>
          </button>
        </div>

        {/* Detailed Information Grid */}
        {hasKeyInfo && (
          <div className="space-y-3.5 pt-2 border-t border-stone-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Key Information
            </h3>

<<<<<<< HEAD
            {/* Address */}
            {place.address && (
              <div className="flex items-start gap-3 text-xs">
                <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">📍</span>
                <div>
                  <div className="font-semibold text-stone-800">Address</div>
                  <div className="text-stone-600 mt-0.5">{place.address}</div>
                </div>
=======
          {/* Address */}
          <div className="flex items-start gap-3 text-xs">
            <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">📍</span>
            <div>
              <div className="font-semibold text-stone-800">Address</div>
              <div className="text-stone-600 mt-0.5">{place.address}</div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="flex items-start gap-3 text-xs">
            <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">🕒</span>
            <div>
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <span>Opening Hours</span>
                <span className="text-[10px] text-stone-400 font-normal">(Demo Data)</span>
>>>>>>> 38212d7 (frontend 1)
              </div>
            )}

            {/* Opening Hours */}
            {formattedHours && (
              <div className="flex items-start gap-3 text-xs">
                <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">🕐</span>
                <div>
                  <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <span>Opening Hours</span>
                  </div>
                  <div className="text-stone-600 mt-0.5">{formattedHours}</div>
                </div>
              </div>
            )}

            {/* Contact */}
            {phone && (
              <div className="flex items-start gap-3 text-xs">
                <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">📞</span>
                <div>
                  <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                    <span>Contact</span>
                  </div>
                  <div className="text-stone-600 mt-0.5">{phone}</div>
                </div>
              </div>
            )}

            {/* Accessibility */}
            {formattedAccessibility && (
              <div className="flex items-start gap-3 text-xs">
                <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">♿</span>
                <div>
                  <div className="font-semibold text-stone-800">Accessibility</div>
                  <div className="text-stone-600 mt-0.5">{formattedAccessibility}</div>
                </div>
              </div>
            )}

            {/* Coordinates Summary */}
            {place.coordinatesSummary && (
              <div className="flex items-start gap-3 text-xs">
                <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">🌐</span>
                <div>
                  <div className="font-semibold text-stone-800">Geospatial Coordinates</div>
                  <div className="text-stone-600 font-mono text-[11px] mt-0.5">{place.coordinatesSummary}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Facilities / Services */}
        {facilities.length > 0 && (
          <div className="pt-2 border-t border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Services & Amenities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {facilities.map((facility, idx) => (
                <span key={idx} className="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200/60 flex items-center gap-1">
                  <span>✓</span> {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
<<<<<<< HEAD
        {tags.length > 0 && (
=======
        {place.tags && place.tags.length > 0 && (
>>>>>>> 38212d7 (frontend 1)
          <div className="pt-2 border-t border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Keywords & Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
<<<<<<< HEAD
              {tags.map((tag, idx) => (
=======
              {place.tags.map((tag, idx) => (
>>>>>>> 38212d7 (frontend 1)
                <span key={idx} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/60">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
<<<<<<< HEAD

        {/* Verified Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800">
          📍 <strong>Nashik & Trimbakeshwar Guide</strong>: Verified location data for the Simhastha Kumbh Mela corridor.
        </div>
=======
>>>>>>> 38212d7 (frontend 1)

      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200/60 font-semibold text-xs transition-colors cursor-pointer"
        >
          Close Panel
        </button>
      </div>
    </aside>
  );
}
