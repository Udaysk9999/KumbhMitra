import React, { useState, useMemo } from 'react';
import { MAIN_CATEGORY_GROUPS, searchPlaces } from '../places/placeUtils';

/**
 * KumbhMitra Smart Map Left Sidebar
 * Features:
 * - Search input
 * - Quick category actions [ Medical, Religious, Emergency, Food, Transport, Parking, Facilities, Explore ]
 * - Nearby relevant places list with distance and status
 * - Kumbh Mode switcher
 * - Desktop collapsible dock and mobile drawer support
 */
export default function SmartMapSidebar({
  isOpen = true,
  onToggle,
  places = [],
  selectedCategory = 'default',
  onSelectCategory,
  selectedPlace = null,
  onSelectPlace,
  kumbhMode = true,
  onToggleKumbhMode,
  onOpenAI,
  onOpenEmergency,
  className = ''
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const quickActionKeys = [
    { id: 'medical', label: 'Medical', icon: '🏥' },
    { id: 'religious', label: 'Religious', icon: '🙏' },
    { id: 'emergency', label: 'Emergency', icon: '🚨' },
    { id: 'food', label: 'Food', icon: '🍛' },
    { id: 'transport', label: 'Transport', icon: '🚌' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'facilities', label: 'Facilities', icon: '🚻' },
    { id: 'explore', label: 'Explore', icon: '🏰' }
  ];

  // Determine which places appear in the "Nearby" list
  const nearbyPlaces = useMemo(() => {
    let pool = places;

    // Filter by search query if present
    if (searchQuery.trim() !== '') {
      return searchPlaces(pool, searchQuery).slice(0, 20);
    }

    // Filter by selected category group
    if (selectedCategory && selectedCategory !== 'default' && selectedCategory !== 'all') {
      const group = MAIN_CATEGORY_GROUPS.find((g) => g.id === selectedCategory);
      if (group) {
        const catSet = new Set(group.categoryIds);
        pool = pool.filter((p) => catSet.has(p.category));
      } else {
        pool = pool.filter((p) => p.category === selectedCategory);
      }
    } else {
      // Default: show key Kumbh emergency & religious places
      pool = pool.filter((p) =>
        ['hospital', 'ghat', 'temple', 'police', 'fire_station', 'emergency', 'railway'].includes(p.category)
      );
    }

    // Sort by priority (VERY_HIGH -> HIGH -> MEDIUM -> LOW) then distance
    return pool.slice(0, 15);
  }, [places, selectedCategory, searchQuery]);

  const activeGroupLabel = useMemo(() => {
    if (searchQuery.trim() !== '') return `Search Results for "${searchQuery}"`;
    if (!selectedCategory || selectedCategory === 'default' || selectedCategory === 'all') {
      return 'Key Kumbh Sites';
    }
    const group = MAIN_CATEGORY_GROUPS.find((g) => g.id === selectedCategory);
    return group ? `${group.title} Places` : selectedCategory;
  }, [selectedCategory, searchQuery]);

  return (
    <>
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 w-80 sm:w-88 lg:w-96 bg-white/95 backdrop-blur-md border-r border-stone-200/90 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
        aria-label="KumbhMitra Smart Map Sidebar"
      >
        {/* Top Header */}
        <div className="p-4 border-b border-stone-200/80 bg-stone-50/80">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                🕉️
              </div>
              <div>
                <h1 className="font-extrabold text-stone-900 text-sm sm:text-base leading-none tracking-tight">
                  KumbhMitra Smart Map
                </h1>
                <p className="text-[10px] text-stone-500 font-semibold tracking-wide mt-0.5">
                  Simhastha 2027 • Nashik & Trimbak
                </p>
              </div>
            </div>

            {/* Kumbh Mode Switch */}
            <button
              type="button"
              onClick={onToggleKumbhMode}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-tight border transition-all flex items-center gap-1 cursor-pointer ${
                kumbhMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                  : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
              }`}
              title="Toggle Kumbh Mode Focus"
            >
              <span>{kumbhMode ? '🕉️ Kumbh' : '🗺️ Standard'}</span>
            </button>
          </div>

          {/* Search Bar Input */}
          <div className="relative flex items-center">
            <span className="absolute left-3 text-stone-400 pointer-events-none" aria-hidden="true">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search places, temples, hospitals, ghats..."
              className="w-full pl-9 pr-8 py-2 bg-white text-stone-900 text-xs rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-stone-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Category Action Pills */}
          <div className="mt-3">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Categories
            </div>
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {quickActionKeys.map((btn) => {
                const isActive = selectedCategory === btn.id;
                return (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => {
                      onSelectCategory(isActive ? 'default' : btn.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight whitespace-nowrap border transition-all flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 shadow-2xs'
                    }`}
                  >
                    <span>{btn.icon}</span>
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nearby / Discovered Places List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="px-1.5 py-1 flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            <span>NEARBY {activeGroupLabel.toUpperCase()}</span>
            <span className="text-stone-400 font-normal">({nearbyPlaces.length})</span>
          </div>

          {nearbyPlaces.length > 0 ? (
            <div className="space-y-1.5">
              {nearbyPlaces.map((place) => {
                const isSelected = selectedPlace?.id === place.id;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => onSelectPlace(place)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 group ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-300 shadow-sm ring-2 ring-amber-400/30'
                        : 'bg-white hover:bg-stone-50 border-stone-200/80 shadow-2xs'
                    }`}
                  >
                    <span className="text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
                      {place.categoryIcon || '📍'}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-amber-900">
                          {place.name}
                        </h4>
                        {place.distanceKm && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60 flex-shrink-0">
                            {place.distanceKm} km
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        {place.subcategory || place.categoryLabel} • {place.region}
                      </div>

                      {/* Availability & Emergency indicators */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {place.emergency && (
                          <span className="text-[9px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            🚨 24×7 Emergency
                          </span>
                        )}
                        {place.kumbhRelevance && !place.emergency && (
                          <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            🕉️ Kumbh Site
                          </span>
                        )}
                        {place.verified && (
                          <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-stone-500 space-y-1">
              <div>No places found in this category.</div>
              <button
                type="button"
                onClick={() => onSelectCategory('default')}
                className="mt-2 px-3 py-1 bg-amber-600 text-white rounded-lg font-semibold text-xs"
              >
                Reset to Default Sites
              </button>
            </div>
          )}
        </div>

        {/* Bottom Quick Tools */}
        <div className="p-3 border-t border-stone-200 bg-stone-50/80 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenAI}
            className="flex-1 py-2 px-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🤖</span>
            <span>Ask AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenEmergency}
            className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🚨</span>
            <span>Emergency</span>
          </button>
        </div>
      </aside>

      {/* Collapse / Expand Toggle Button on Desktop */}
      <button
        type="button"
        onClick={onToggle}
        className={`fixed top-20 z-30 hidden md:flex items-center justify-center w-7 h-12 bg-white/95 backdrop-blur-md border border-stone-300 shadow-md text-stone-600 hover:text-stone-900 rounded-r-xl transition-all duration-300 cursor-pointer ${
          isOpen ? 'left-80 sm:left-88 lg:left-96' : 'left-0'
        }`}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </>
  );
}
