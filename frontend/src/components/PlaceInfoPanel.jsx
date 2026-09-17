import React, { useState } from 'react';
import { formatOpeningHours, formatAccessibility } from '../places/placeUtils';

/**
 * Reusable Place Information Panel
 * Google Maps-style information drawer providing details on selected place.
 * Safely renders optional fields without displaying "undefined" or crashing on missing data.
 */
export default function PlaceInfoPanel({ place, onClose }) {
  const [routeStatus, setRouteStatus] = useState(null);

  if (!place) return null;

  const handleStartRoute = () => {
    setRouteStatus('Route planning will be available in the routing phase.');
    setTimeout(() => {
      setRouteStatus(null);
    }, 4500);
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
      className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white/95 backdrop-blur-md shadow-2xl border-l border-stone-200/90 flex flex-col transition-all duration-300 animate-in slide-in-from-right"
      aria-label="Place Information Panel"
    >
      {/* Top Header Bar */}
      <div className="p-4 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/80">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{categoryIcon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200/70">
            {categoryLabel}
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
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          aria-label="Close place information panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
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
            <span className="text-emerald-700 font-medium">Verified Location</span>
          </div>
        </div>

        {/* Description */}
        {place.description ? (
          <p className="text-xs leading-relaxed text-stone-600 bg-stone-50 p-3.5 rounded-xl border border-stone-100">
            {place.description}
          </p>
        ) : null}

        {/* Action Button: Start Route */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleStartRoute}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
          >
            <span>🧭</span>
            <span>Start Route</span>
          </button>

          {/* Feedback banner for route action */}
          {routeStatus && (
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] text-center font-medium animate-in fade-in duration-200">
              ℹ️ {routeStatus}
            </div>
          )}
        </div>

        {/* Detailed Information Grid */}
        {hasKeyInfo && (
          <div className="space-y-3.5 pt-2 border-t border-stone-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Key Information
            </h3>

            {/* Address */}
            {place.address && (
              <div className="flex items-start gap-3 text-xs">
                <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">📍</span>
                <div>
                  <div className="font-semibold text-stone-800">Address</div>
                  <div className="text-stone-600 mt-0.5">{place.address}</div>
                </div>
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
        {tags.length > 0 && (
          <div className="pt-2 border-t border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Keywords & Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200/60">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Verified Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-800">
          📍 <strong>Nashik & Trimbakeshwar Guide</strong>: Verified location data for the Simhastha Kumbh Mela corridor.
        </div>

      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200/60 font-semibold text-xs transition-colors"
        >
          Close Panel
        </button>
      </div>
    </aside>
  );
}
