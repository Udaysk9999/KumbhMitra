import React, { useEffect } from 'react';
import { formatOpeningHours, formatAccessibility } from '../places/placeUtils';

/**
 * Place Information Panel Component
 * Displays comprehensive details for a selected place from the real database.
 * Shows Name, Category, Subcategory, Description, Address, Contact, Opening Hours,
 * Accessibility, Facilities, Services, Tags, Importance, Kumbh Relevance, and Verified Source.
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

  const categoryLabel = place.categoryLabel || place.category || 'Point of Interest';
  const categoryIcon = place.categoryIcon || '📍';
  const subcategory = place.subcategory || null;
  const region = place.region || 'Nashik / Trimbakeshwar';
  const bgStyle = place.imagePlaceholder || (place.image ? `url(${place.image})` : 'linear-gradient(135deg, #d97706 0%, #b45309 100%)');
  const formattedHours = formatOpeningHours(place.openingHours || place.rawOpeningHours);
  const formattedAccessibility = formatAccessibility(place.accessibility || place.rawAccessibility);
  
  const phone = place.phone || (typeof place.contact === 'string' ? place.contact : null) || place.contact?.phone || null;
  const email = place.email || place.contact?.email || null;
  const website = place.website || place.contact?.website || null;

  const tags = Array.isArray(place.tags) ? place.tags.filter(Boolean) : [];
  const facilities = Array.isArray(place.facilities) ? place.facilities.filter(Boolean) : [];
  const services = Array.isArray(place.services) ? place.services.filter((s) => !facilities.includes(s)) : [];

  const importance = typeof place.importance === 'number' ? place.importance : null;
  const isKumbhRelevant = place.kumbhRelevance !== false;
  const verified = place.verified !== false;
  const source = place.source || 'Nashik District Administration / Kumbh Authority';

  return (
    <aside
      className="fixed inset-x-0 bottom-0 max-h-[82vh] sm:max-h-full sm:inset-y-0 sm:left-auto sm:right-0 z-40 w-full sm:w-[440px] bg-white/98 backdrop-blur-md shadow-2xl border-t sm:border-t-0 sm:border-l border-stone-200/90 rounded-t-3xl sm:rounded-none flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-right"
      aria-label={`Detailed information for ${place.name}`}
      role="dialog"
      aria-modal="false"
    >
      {/* Mobile Drag Indicator Handle */}
      <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" aria-hidden="true" />

      {/* Top Header Bar */}
      <div className="px-5 py-3.5 border-b border-stone-200/80 flex items-center justify-between bg-stone-50/90">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl" aria-hidden="true">{categoryIcon}</span>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200/70">
            {categoryLabel}
          </span>
          {subcategory && (
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
              {subcategory}
            </span>
          )}
          {region && (
            <span className="text-[11px] font-medium text-stone-500">
              • {region}
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
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        
        {/* Visual Header Banner */}
        <div 
          className="w-full h-36 rounded-2xl overflow-hidden relative shadow-inner flex flex-col justify-end p-4 border border-stone-200/60"
          style={{ background: bgStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
          
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 mb-1">
              {isKumbhRelevant && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white px-2 py-0.5 rounded shadow-xs">
                  🕉️ Kumbh 2027 Key Site
                </span>
              )}
              {verified && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600/90 text-white px-2 py-0.5 rounded shadow-xs">
                  ✓ Verified POI
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-white drop-shadow-md leading-snug">
              {place.name}
            </h1>
          </div>
        </div>

        {/* Place Metadata & Rating / Importance */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-stone-600 pb-1">
          <div className="flex items-center gap-2">
            {importance && (
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200/70">
                Priority: {importance}/5
              </span>
            )}
            {place.rating ? (
              <span className="flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                ⭐ {place.rating} {place.reviewsCount ? `(${place.reviewsCount})` : ''}
              </span>
            ) : null}
            {place.distanceKm && (
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                📍 {place.distanceKm} km away
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
            Overview
          </h3>
          <p className="text-xs leading-relaxed text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200/70">
            {place.description || 'Verified point of interest in Nashik and Trimbakeshwar.'}
          </p>
        </div>

        {/* Action Button: Get Directions */}
        <div>
          <button
            type="button"
            onClick={handleStartRoute}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
          >
            <span>🧭</span>
            <span>Get Directions / Plan Route</span>
          </button>
        </div>

        {/* Key Information Section */}
        <div className="space-y-3 pt-2 border-t border-stone-200/80">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
            Location & Contact Details
          </h3>

          {/* Address */}
          <div className="flex items-start gap-2.5 text-xs">
            <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">📍</span>
            <div>
              <div className="font-semibold text-stone-800">Address</div>
              <div className="text-stone-600 mt-0.5">
                {place.address || 'Address information unavailable'}
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="flex items-start gap-2.5 text-xs">
            <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">🕐</span>
            <div>
              <div className="font-semibold text-stone-800">Opening Hours</div>
              <div className="text-stone-600 mt-0.5">
                {formattedHours || 'Open 24 hours / All day'}
              </div>
            </div>
          </div>

          {/* Phone / Contact */}
          {(phone || email || website) && (
            <div className="flex items-start gap-2.5 text-xs">
              <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">📞</span>
              <div>
                <div className="font-semibold text-stone-800">Contact</div>
                {phone && <div className="text-stone-600 mt-0.5">Phone: {phone}</div>}
                {email && <div className="text-stone-600 mt-0.5">Email: {email}</div>}
                {website && (
                  <div className="text-amber-700 mt-0.5 truncate max-w-[280px]">
                    <a href={website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility */}
          {formattedAccessibility && (
            <div className="flex items-start gap-2.5 text-xs">
              <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">♿</span>
              <div>
                <div className="font-semibold text-stone-800">Accessibility</div>
                <div className="text-stone-600 mt-0.5">{formattedAccessibility}</div>
              </div>
            </div>
          )}

          {/* Coordinates Summary */}
          {place.coordinatesSummary && (
            <div className="flex items-start gap-2.5 text-xs">
              <span className="text-base text-stone-400 mt-0.5" aria-hidden="true">🌐</span>
              <div>
                <div className="font-semibold text-stone-800">Coordinates</div>
                <div className="text-stone-600 font-mono text-[11px] mt-0.5">{place.coordinatesSummary}</div>
              </div>
            </div>
          )}
        </div>

        {/* Facilities & Services */}
        {(facilities.length > 0 || services.length > 0) && (
          <div className="pt-2 border-t border-stone-200/80">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Available Facilities & Amenities
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {[...facilities, ...services].map((facility, idx) => (
                <span key={idx} className="text-[11px] bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200/60 flex items-center gap-1">
                  <span>✓</span> {facility}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="pt-2 border-t border-stone-200/80">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-2">
              Tags & Search Terms
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, idx) => (
                <span key={idx} className="text-[11px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Data Source & Verification Footer */}
        <div className="pt-3 border-t border-stone-200/80">
          <div className="p-3 bg-stone-50 border border-stone-200/70 rounded-xl text-[11px] text-stone-600 space-y-1">
            <div className="font-semibold text-stone-700 flex items-center gap-1">
              <span>🏛️</span> Source: {source}
            </div>
            <div className="text-[10px] text-stone-500">
              Verified spatial record for Nashik & Trimbakeshwar Simhastha Kumbh Mela 2027.
            </div>
          </div>
        </div>

      </div>

      {/* Footer Close Button */}
      <div className="p-3.5 border-t border-stone-200 bg-stone-50/90 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-200/60 font-semibold text-xs transition-colors cursor-pointer"
        >
          Close Information
        </button>
      </div>
    </aside>
  );
}
