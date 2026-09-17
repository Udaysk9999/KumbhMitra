import React, { useState, useMemo } from 'react';
import { PLACE_CATEGORIES, MOCK_PLACES } from '../constants/mockPlaces';

/**
 * MapLegend Component
 * Displays categories with icons and colored indicators.
 * Responsive: Collapsible badge on mobile; expandable card with toggle on desktop/tablet.
 */
export default function MapLegend({ places, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract categories that actually exist in the current places list
  const activeCategories = useMemo(() => {
    const list = (places && places.length > 0) ? places : MOCK_PLACES;
    const presentCats = new Set(list.map((p) => p.category?.toLowerCase()));

    // Filter PLACE_CATEGORIES (skipping 'all') to categories present in data
    const matched = PLACE_CATEGORIES.filter(
      (c) => c.id !== 'all' && presentCats.has(c.id.toLowerCase())
    );

    if (matched.length > 0) return matched;

    // Fallback to all standard categories if none matched
    return PLACE_CATEGORIES.filter((c) => c.id !== 'all');
  }, [places]);

  return (
    <div className={`relative z-20 ${className}`}>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 shadow-md text-stone-700 hover:bg-stone-50 hover:text-amber-700 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        aria-expanded={isOpen}
        aria-label="Toggle map legend"
        title="Map Legend"
      >
        <span className="text-amber-600 font-bold" aria-hidden="true">🏷️</span>
        <span className="hidden sm:inline">Legend</span>
        <svg
          className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded Popover / Drawer */}
      {isOpen && (
        <div className="absolute top-10 right-0 w-48 p-2.5 rounded-2xl bg-white/95 backdrop-blur-lg border border-stone-200 shadow-xl space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-stone-800">
          <div className="flex items-center justify-between pb-1.5 border-b border-stone-200/80">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Map Legend ({activeCategories.length})
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 p-0.5 rounded-lg focus:outline-none cursor-pointer"
              aria-label="Close legend"
            >
              ✕
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {activeCategories.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-1.5 py-1 rounded-lg hover:bg-stone-100/80 text-xs transition-colors"
              >
                <span className="text-sm leading-none shrink-0" aria-hidden="true">
                  {c.icon}
                </span>
                <span className="truncate font-medium text-stone-700">
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
