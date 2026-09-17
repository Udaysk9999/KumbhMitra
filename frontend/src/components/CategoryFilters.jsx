import React, { useState, useRef, useEffect } from 'react';
import { FILTER_GROUPS, CATEGORY_DEFINITIONS } from '../places/placeUtils';

/**
 * Enhanced Category Filters Component with 6 Filter Groups & Kumbh/Explore Modes
 */
export default function CategoryFilters({
  selectedCategory = 'all',
  onSelectCategory,
  mode = 'kumbh', // 'kumbh' | 'explore'
  onToggleMode
}) {
  const [activeGroup, setActiveGroup] = useState(mode === 'explore' ? 'explore_nashik' : 'all');
  const scrollRef = useRef(null);

  // Synchronize active group with mode when mode changes
  useEffect(() => {
    if (mode === 'explore') {
      setActiveGroup('explore_nashik');
    } else if (activeGroup === 'explore_nashik') {
      setActiveGroup('all');
    }
  }, [mode]);

  // Determine which categories to display
  const currentCategories = React.useMemo(() => {
    if (activeGroup === 'all') {
      if (mode === 'explore') {
        const exploreGroup = FILTER_GROUPS.find((g) => g.id === 'explore_nashik');
        return exploreGroup ? exploreGroup.categories : [];
      }
      // In Kumbh Mode "All", show prime pilgrimage & facility categories
      return [
        { id: 'all', label: 'All Places', icon: '📍' },
        { id: 'temple', label: 'Temples', icon: '🛕' },
        { id: 'ghat', label: 'Ghats', icon: '🌊' },
        { id: 'kumbh_zone', label: 'Kumbh Zones', icon: '⛺' },
        { id: 'akhada', label: 'Akhadas', icon: '🚩' },
        { id: 'hospital', label: 'Hospitals', icon: '🏥' },
        { id: 'emergency', label: 'Emergency', icon: '🚨' },
        { id: 'parking', label: 'Parking', icon: '🅿️' },
        { id: 'transport', label: 'Transport', icon: '🚌' },
        { id: 'public_toilet', label: 'Toilets', icon: '🚻' },
        { id: 'water_point', label: 'Water', icon: '💧' },
        { id: 'restaurant', label: 'Food', icon: '🍛' },
        { id: 'hotel', label: 'Hotels', icon: '🏨' },
        { id: 'fort', label: 'Forts', icon: '🏰' },
        { id: 'tourist_spot', label: 'Tourist Spots', icon: '📍' }
      ];
    }

    const group = FILTER_GROUPS.find((g) => g.id === activeGroup);
    return group ? group.categories : [];
  }, [activeGroup, mode]);

  return (
    <div className="w-full py-1.5 px-3 sm:px-6 space-y-1.5 select-none">
      
      {/* Row 1: Mode Switch & Group Selector Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-0.5">
        
        {/* Clean Mode Switcher: Kumbh Mode vs Explore Nashik */}
        <div 
          className="inline-flex items-center p-0.5 rounded-xl bg-stone-900/90 backdrop-blur-md text-white shadow-sm flex-shrink-0"
          role="group"
          aria-label="Experience Mode Switcher"
        >
          <button
            type="button"
            onClick={() => {
              onToggleMode?.('kumbh');
              setActiveGroup('all');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'kumbh'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
            aria-pressed={mode === 'kumbh'}
            title="Pilgrimage & Essential Services Mode"
          >
            <span>🕉️</span>
            <span>Kumbh Mode</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onToggleMode?.('explore');
              setActiveGroup('explore_nashik');
            }}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'explore'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
            aria-pressed={mode === 'explore'}
            title="Forts, Caves, Waterfalls & Heritage Tourism"
          >
            <span>🏰</span>
            <span>Explore Nashik</span>
          </button>
        </div>

        {/* 6 Structured Filter Group Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 pl-1">
          <button
            type="button"
            onClick={() => {
              setActiveGroup('all');
              onSelectCategory('all');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              activeGroup === 'all' && selectedCategory === 'all'
                ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                : 'bg-white/80 text-stone-600 border-stone-200/80 hover:bg-white hover:text-stone-900'
            }`}
          >
            All POIs
          </button>

          {FILTER_GROUPS.map((group) => {
            const isGroupActive = activeGroup === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  setActiveGroup(group.id);
                  // Default to first category in group if not already in it
                  const inGroup = group.categories.some((c) => c.id === selectedCategory);
                  if (!inGroup && group.categories.length > 0) {
                    onSelectCategory(group.categories[0].id);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer border ${
                  isGroupActive
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white/80 text-stone-600 border-stone-200/80 hover:bg-white hover:text-stone-900'
                }`}
              >
                <span>{group.icon}</span>
                <span>{group.title}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* Row 2: Subcategory Chips within Selected Group / Mode */}
      <div
        ref={scrollRef}
        role="group"
        aria-label="Subcategory filters"
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 scroll-smooth"
      >
        {activeGroup !== 'all' && (
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer flex-shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-stone-800 text-white border-stone-800 shadow-xs'
                : 'bg-white/90 text-stone-700 border-stone-200 hover:border-stone-400'
            }`}
          >
            <span>All in {FILTER_GROUPS.find((g) => g.id === activeGroup)?.title || 'Category'}</span>
          </button>
        )}

        {currentCategories.map((cat) => {
          const isActive =
            selectedCategory === cat.id ||
            (cat.alias && selectedCategory === cat.alias);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isActive}
              className={`group inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-tight transition-all duration-150 border cursor-pointer select-none flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isActive
                  ? mode === 'explore'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/20'
                  : 'bg-white/95 hover:bg-white text-stone-700 hover:text-stone-900 border-stone-200 hover:border-amber-400 shadow-2xs'
              }`}
            >
              <span className="text-sm leading-none flex-shrink-0" aria-hidden="true">
                {cat.icon}
              </span>
              <span className="whitespace-nowrap">
                {cat.label}
              </span>

              {isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-white ml-0.5"
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
