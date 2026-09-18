import React, { useState, useMemo } from 'react';
import { formatDuration, formatDistance } from '../services/itineraryService';
import { CATEGORY_DEFINITIONS } from '../places/placeUtils';

/**
 * Itinerary Planner Component
 * Allows users to select 1-4 days, browse & select places with category filters,
 * optionally choose start location, and view an organized day-by-day plan
 * with travel distances, travel times, and suggested visit durations.
 */
export default function ItineraryPanel({
  isOpen,
  onClose,
  places = [],
  onGenerateItinerary,
  generatedItinerary = null,
  activeDayIndex = 0,
  onSelectDay = () => {},
  onSelectPlace = () => {},
  onShowRouteOnMap = () => {},
  selectedPlaceIds = [],
  onTogglePlaceId = () => {},
  onClearSelectedPlaces = () => {},
  isLoading = false,
  error = null,
  mapCenter = null
}) {
  const [selectedDays, setSelectedDays] = useState(1);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [useMapStartLocation, setUseMapStartLocation] = useState(false);
  const [activeTab, setActiveTab] = useState(generatedItinerary ? 'itinerary' : 'select');

  // Available filter categories for place selection
  const filterCategories = useMemo(() => {
    const present = new Set(places.map((p) => p.category));
    return [
      { id: 'all', label: 'All Places', icon: '📍' },
      { id: 'temple', label: 'Temples', icon: '🛕' },
      { id: 'ghat', label: 'Ghats', icon: '🌊' },
      { id: 'fort', label: 'Forts', icon: '🏰' },
      { id: 'tourist_spot', label: 'Attractions', icon: '📍' },
      { id: 'transport', label: 'Transit', icon: '🚌' },
      { id: 'restaurant', label: 'Food', icon: '🍛' },
      { id: 'hotel', label: 'Stay', icon: '🏨' },
      { id: 'kumbh_zone', label: 'Kumbh Zones', icon: '⛺' }
    ].filter((cat) => cat.id === 'all' || present.has(cat.id));
  }, [places]);

  // Filtered places for selection list
  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchCategory =
        activeCategory === 'all' ||
        place.category === activeCategory ||
        (activeCategory === 'tourist_spot' && (place.category === 'tourist_spot' || place.category === 'cave' || place.category === 'waterfall'));

      const matchSearch =
        !searchQuery.trim() ||
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (place.region && place.region.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (place.address && place.address.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchSearch;
    });
  }, [places, activeCategory, searchQuery]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (selectedPlaceIds.length === 0) return;
    const startLoc = useMapStartLocation && mapCenter ? { latitude: mapCenter.lat, longitude: mapCenter.lng } : null;
    onGenerateItinerary({
      days: selectedDays,
      placeIds: selectedPlaceIds,
      startLocation: startLoc
    });
    setActiveTab('itinerary');
  };

  const daysList = generatedItinerary?.days || [];
  const currentDayData = daysList[activeDayIndex] || daysList[0] || null;

  return (
    <aside
      className="fixed inset-x-0 bottom-0 max-h-[85vh] sm:max-h-full sm:inset-y-0 sm:left-auto sm:right-0 z-40 w-full sm:w-[460px] bg-white/98 backdrop-blur-md shadow-2xl border-t sm:border-t-0 sm:border-l border-stone-200/90 rounded-t-3xl sm:rounded-none flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-6 sm:slide-in-from-right"
      aria-label="Itinerary Planner"
      role="dialog"
      aria-modal="false"
    >
      {/* Mobile Drag Indicator Handle */}
      <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 mb-1 sm:hidden" aria-hidden="true" />

      {/* Header Bar */}
      <div className="px-5 py-3.5 border-b border-stone-200/80 bg-gradient-to-r from-amber-50/90 to-orange-50/90 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-base shadow-sm">
            📅
          </div>
          <div>
            <h2 className="font-bold text-stone-900 text-sm">
              Itinerary Planner
            </h2>
            <p className="text-[11px] text-stone-500">
              Nashik & Trimbakeshwar • Kumbh 2027
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          aria-label="Close itinerary planner"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Tabs: Select Places vs Generated Itinerary */}
      <div className="flex border-b border-stone-200 bg-stone-50/80 text-xs font-semibold px-4 pt-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('select')}
          className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'select'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>🎯 Select Places</span>
          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded-full">
            {selectedPlaceIds.length}
          </span>
        </button>

        {generatedItinerary && (
          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`pb-2 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'itinerary'
                ? 'border-amber-600 text-amber-900 font-bold'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>✨ Planned Schedule</span>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
              {daysList.length} {daysList.length === 1 ? 'Day' : 'Days'}
            </span>
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <div className="flex-1">
              <div className="font-bold">Notice</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* TAB 1: Place Selection & Configuration */}
        {activeTab === 'select' && (
          <div className="space-y-4">
            {/* Step 1: Choose Number of Days */}
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200/80">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                1. Number of Days
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDays(d)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      selectedDays === d
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {d} {d === 1 ? 'Day' : 'Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Starting Location Option */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-stone-800">Start from map center</div>
                <div className="text-[11px] text-stone-500">
                  {mapCenter ? `Near ${mapCenter.lat.toFixed(4)}°, ${mapCenter.lng.toFixed(4)}°` : 'Use current map position'}
                </div>
              </div>
              <input
                type="checkbox"
                id="start-location-toggle"
                checked={useMapStartLocation}
                onChange={(e) => setUseMapStartLocation(e.target.checked)}
                className="w-4 h-4 accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Step 3: Select Places */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  2. Select Places to Visit
                </label>
                {selectedPlaceIds.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearSelectedPlaces}
                    className="text-[11px] text-red-600 hover:underline cursor-pointer"
                  >
                    Clear selection
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none mb-2">
                {filterCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-1 ${
                      activeCategory === cat.id
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter places by name or area..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Places List with Checkboxes */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {filteredPlaces.map((place) => {
                  const placeId = place._id || place.id;
                  const isChecked = selectedPlaceIds.includes(placeId);
                  const catDef = CATEGORY_DEFINITIONS[place.category] || CATEGORY_DEFINITIONS.all;

                  return (
                    <div
                      key={placeId}
                      onClick={() => onTogglePlaceId(placeId)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isChecked
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                          : 'bg-white border-stone-200 hover:border-stone-300 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div click
                          className="w-4 h-4 accent-amber-600 rounded cursor-pointer flex-shrink-0"
                        />
                        <span className="text-lg flex-shrink-0" aria-hidden="true">
                          {catDef.icon}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate leading-tight">
                            {place.name}
                          </div>
                          <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                            <span>{catDef.label}</span>
                            <span>•</span>
                            <span>{place.region || 'Nashik'}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-stone-400 flex-shrink-0">
                        ⏱️ ~45m
                      </span>
                    </div>
                  );
                })}

                {filteredPlaces.length === 0 && (
                  <div className="py-6 text-center text-xs text-stone-400">
                    No places found matching your filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Generated Schedule View */}
        {activeTab === 'itinerary' && generatedItinerary && (
          <div className="space-y-4">
            {/* Day Selector Pills if Multi-Day */}
            {daysList.length > 1 && (
              <div className="flex gap-2 border-b border-stone-200 pb-2">
                {daysList.map((d, idx) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => onSelectDay(idx)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                      activeDayIndex === idx
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    Day {d.day} ({d.places.length} stops)
                  </button>
                ))}
              </div>
            )}

            {/* Current Day Summary Card */}
            {currentDayData && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-amber-950 text-sm">
                    Day {currentDayData.day} Plan
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5">
                    {currentDayData.places.length} Places to visit
                  </div>
                </div>
                <div className="text-right text-[11px] text-stone-600 space-y-0.5">
                  <div>🚗 Travel: <strong>{formatDistance(currentDayData.totalTravelDistance)}</strong> ({formatDuration(currentDayData.totalTravelDuration)})</div>
                  <div>⏱️ Visit time: <strong>{formatDuration(currentDayData.totalVisitDuration)}</strong></div>
                </div>
              </div>
            )}

            {/* Day Places Ordered Sequence */}
            {currentDayData && (
              <div className="space-y-3">
                {currentDayData.places.map((item, idx) => {
                  const place = item.place;
                  const catDef = CATEGORY_DEFINITIONS[place.category] || CATEGORY_DEFINITIONS.all;
                  const travel = item.travelFromPrevious;

                  return (
                    <div key={place._id || idx} className="space-y-2">
                      {/* Leg connection banner */}
                      {travel && travel.distance > 0 && (
                        <div className="flex items-center gap-2 pl-4 text-[10px] text-stone-500 font-medium">
                          <div className="w-0.5 h-6 bg-amber-300 ml-3" />
                          <span className="bg-stone-100 border border-stone-200 rounded-md px-2 py-0.5 text-stone-600 flex items-center gap-1">
                            🚗 Travel: <strong>{formatDistance(travel.distance)}</strong> (~{travel.duration} mins)
                          </span>
                        </div>
                      )}

                      {/* Place Stop Card */}
                      <div
                        onClick={() => onSelectPlace(place)}
                        className="p-3 bg-white rounded-xl border border-stone-200 hover:border-amber-400 shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-start gap-3 group"
                      >
                        {/* Order badge */}
                        <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5 group-hover:scale-105 transition-transform">
                          {item.order}
                        </div>

                        {/* Place Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-xs text-stone-900 group-hover:text-amber-800 transition-colors truncate">
                              {place.name}
                            </h4>
                            <span className="text-xs flex-shrink-0" aria-hidden="true">
                              {catDef.icon}
                            </span>
                          </div>

                          <div className="text-[11px] text-stone-500 truncate mt-0.5">
                            {place.address?.city ? `${place.address.area || ''}, ${place.address.city}` : place.category}
                          </div>

                          {/* Visit duration and timing */}
                          <div className="mt-2 flex items-center gap-2 flex-wrap text-[10px]">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                              <span>⏱️ Visit:</span> {formatDuration(item.visitDuration)}
                            </span>

                            {place.openingHours?.open && (
                              <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded">
                                🕐 {place.openingHours.open} - {place.openingHours.close || 'Late'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Map Action Button */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => onShowRouteOnMap(currentDayData)}
                className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🗺️</span>
                <span>View Route on Map</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('select')}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Modify Places
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="p-3.5 border-t border-stone-200 bg-white flex items-center justify-between gap-3">
        {activeTab === 'select' ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={selectedPlaceIds.length === 0 || isLoading}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedPlaceIds.length === 0 || isLoading
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-600/20 active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Creating your itinerary...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>
                  Generate Itinerary ({selectedPlaceIds.length} {selectedPlaceIds.length === 1 ? 'place' : 'places'}, {selectedDays} {selectedDays === 1 ? 'day' : 'days'})
                </span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('select')}
            className="w-full py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            ← Back to Place Selection
          </button>
        )}
      </div>
    </aside>
  );
}
