import React, { useState, useRef, useEffect, useCallback } from 'react';
import { searchPlaces } from '../places/placeUtils';

/**
 * Enhanced SearchBar Component
 * Supports search by name, category, tourist spots, forts, temples, hospitals,
 * restaurants, hotels, transport, and public facilities.
 * Includes quick "Nearby Search" trigger chips.
 */
export default function SearchBar({ places = [], onSelectPlace, onNearbySearch }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listboxRef = useRef(null);

  // Search across places using normalized placeUtils engine
  const filteredResults = query.trim() === ''
    ? []
    : searchPlaces(places, query).slice(0, 8);

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((place) => {
    if (!place) return;
    onSelectPlace?.(place);
    setQuery(place.name || '');
    setIsOpen(false);
    setActiveIndex(-1);
  }, [onSelectPlace]);

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || filteredResults.length === 0) {
      if (e.key === 'ArrowDown' && query.trim() !== '') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredResults.length) {
        handleSelect(filteredResults[activeIndex]);
      } else if (filteredResults.length > 0) {
        handleSelect(filteredResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  // Helper to highlight matching text in search results
  const highlightMatch = (text, term) => {
    if (!text || !term.trim()) return text;
    const parts = text.split(new RegExp(`(${term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={i} className="bg-amber-100 text-amber-900 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const quickNearbyChips = [
    { label: 'Hospitals', category: 'hospital', icon: '🏥' },
    { label: 'Temples', category: 'temple', icon: '🛕' },
    { label: 'Forts', category: 'fort', icon: '🏰' },
    { label: 'Water', category: 'water_point', icon: '💧' },
    { label: 'Parking', category: 'parking', icon: '🅿️' },
    { label: 'Toilets', category: 'public_toilet', icon: '🚻' },
    { label: 'Food', category: 'restaurant', icon: '🍛' }
  ];

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <span className="absolute left-3.5 text-stone-400 pointer-events-none" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>

        {/* Input Field with ARIA combobox semantics */}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen && filteredResults.length > 0}
          aria-autocomplete="list"
          aria-controls="search-suggestions-list"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search Ramkund, Harihar Fort, Trimbakeshwar, hospitals, forts..."
          aria-label="Search places in Nashik and Trimbakeshwar by name, category, or address"
          className="w-full pl-10 pr-24 py-2.5 bg-stone-50/90 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm rounded-xl border border-stone-200/90 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-stone-400 shadow-xs"
        />

        {/* Action Buttons: Clear & Nearby */}
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
              aria-label="Clear search input"
              title="Clear search input"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Quick Nearby Button */}
          {onNearbySearch && (
            <button
              type="button"
              onClick={() => {
                onNearbySearch();
                setIsOpen(false);
              }}
              className="px-2 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-amber-200/80"
              title="Find places near current map center or location"
            >
              <span>📍</span>
              <span className="hidden sm:inline">Nearby</span>
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          id="search-suggestions-list"
          ref={listboxRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1.5 bg-white/98 backdrop-blur-md rounded-xl border border-stone-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Quick Nearby Shortcuts Bar */}
          <div className="p-2 bg-stone-50 border-b border-stone-100">
            <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 px-1">
              Quick Nearby Search
            </div>
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {quickNearbyChips.map((chip) => (
                <button
                  key={chip.category}
                  type="button"
                  onClick={() => {
                    if (onNearbySearch) onNearbySearch(chip.category);
                    setIsOpen(false);
                  }}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
                >
                  <span>{chip.icon}</span>
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {query.trim() !== '' && (
            <>
              <div className="px-3.5 py-1.5 bg-stone-50/50 border-b border-stone-100 text-[11px] font-semibold text-stone-500 flex justify-between items-center">
                <span>SUGGESTIONS ({filteredResults.length})</span>
                <span className="text-[10px] text-stone-400">Use ↑↓ keys to navigate</span>
              </div>

              {filteredResults.length > 0 ? (
                <ul className="divide-y divide-stone-100 max-h-72 overflow-y-auto">
                  {filteredResults.map((place, idx) => {
                    const isSelected = activeIndex === idx;
                    return (
                      <li
                        key={place.id}
                        id={`suggestion-${idx}`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(place)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between group cursor-pointer ${
                            isSelected ? 'bg-amber-50/90 text-amber-950' : 'hover:bg-stone-50 text-stone-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base flex-shrink-0" aria-hidden="true">
                              {place.categoryIcon || '📍'}
                            </span>
                            <div className="min-w-0 pr-2">
                              <div className="text-xs font-semibold truncate group-hover:text-amber-900">
                                {highlightMatch(place.name, query)}
                              </div>
                              <div className="text-[11px] text-stone-500 truncate">
                                {highlightMatch(place.address || place.description, query)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {place.distanceKm && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/50">
                                {place.distanceKm} km
                              </span>
                            )}
                            {place.rating && (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/50">
                                ⭐ {place.rating}
                              </span>
                            )}
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800">
                              {place.categoryLabel || place.category}
                            </span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-xs text-stone-500 space-y-1">
                  <div>
                    No places found matching "<span className="font-semibold text-stone-700">{query}</span>"
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Try searching "Ramkund", "Harihar Fort", "Trimbakeshwar", "Hospitals", "Forts", or "Waterfalls"
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
