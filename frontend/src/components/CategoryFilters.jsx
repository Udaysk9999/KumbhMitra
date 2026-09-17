import React, { useRef } from 'react';
import { CURATED_CATEGORIES } from '../services/placeService';

/**
 * Category Filter Chips Component
 * Allows users to quickly narrow down places by category (Temples, Ghats, Hospitals, etc.)
 * Includes keyboard navigation, active state indicators, and smooth scrolling for mobile.
 */
export default function CategoryFilters({ selectedCategory, onSelectCategory }) {
  const scrollRef = useRef(null);

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % CURATED_CATEGORIES.length;
      onSelectCategory(CURATED_CATEGORIES[nextIndex].id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + CURATED_CATEGORIES.length) % CURATED_CATEGORIES.length;
      onSelectCategory(CURATED_CATEGORIES[prevIndex].id);
    }
  };

  return (
    <div className="relative w-full py-2 px-4 sm:px-6">
      {/* Horizontal Category Scroll Container */}
      <div
        ref={scrollRef}
        role="group"
        aria-label="Filter places by category"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth"
      >
        {CURATED_CATEGORIES.map((cat, idx) => {
          const isActive =
            selectedCategory === cat.id ||
            (cat.alias && selectedCategory === cat.alias);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              aria-pressed={isActive}
              className={`group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 border cursor-pointer select-none flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 ring-2 ring-amber-500/20'
                  : 'bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border-stone-200 hover:border-amber-300 shadow-xs'
              }`}
            >
              <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
                {cat.icon}
              </span>
              <span className="whitespace-nowrap">
                {cat.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white ml-0.5 animate-in fade-in zoom-in"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
