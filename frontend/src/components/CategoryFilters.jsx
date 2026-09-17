import React from 'react';
import { PLACE_CATEGORIES } from '../constants/mockPlaces';

/**
 * Category Filter Chips Component
 * Horizontally scrollable bar allowing users to filter places by type.
 */
export default function CategoryFilters({ selectedCategory, onSelectCategory }) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 px-4 sm:px-6">
      <div className="flex items-center gap-2 min-w-max">
        {PLACE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 border shadow-xs ${
                isActive
                  ? 'bg-amber-600 text-white border-amber-600 shadow-amber-500/20 shadow-md'
                  : 'bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border-stone-200 hover:border-stone-300'
              }`}
              aria-pressed={isActive}
            >
              <span className="text-sm" aria-hidden="true">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
