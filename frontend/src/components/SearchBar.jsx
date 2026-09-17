import React, { useState, useRef, useEffect } from 'react';

/**
 * Reusable SearchBar Component
 * Provides instant mock search suggestions across temples, ghats, hospitals, hotels, shops, etc.
 */
export default function SearchBar({ places = [], onSelectPlace }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Filter mock places based on query
  const filteredResults = query.trim() === '' 
    ? [] 
    : places.filter((p) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryLabel.toLowerCase().includes(query.toLowerCase()) ||
        p.region.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    onSelectPlace(place);
    setQuery(place.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <span className="absolute left-3.5 text-stone-400 pointer-events-none" aria-hidden="true">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search temples, hotels, hospitals, shops, restaurants..."
          aria-label="Search places in Nashik and Trimbakeshwar"
          className="w-full pl-10 pr-10 py-2.5 bg-stone-50/90 hover:bg-stone-50 focus:bg-white text-stone-900 text-sm rounded-xl border border-stone-200/90 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-stone-400"
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 rounded-md"
            aria-label="Clear search input"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Mock Search Dropdown */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md rounded-xl border border-stone-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-1.5 bg-stone-50 border-b border-stone-100 text-[11px] font-semibold text-stone-500 flex justify-between items-center">
            <span>MOCK SEARCH RESULTS</span>
            <span className="text-amber-700 font-normal">Frontend Demo</span>
          </div>

          {filteredResults.length > 0 ? (
            <ul className="divide-y divide-stone-100 max-h-64 overflow-y-auto">
              {filteredResults.map((place) => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(place)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-amber-50/50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base" aria-hidden="true">{place.categoryIcon}</span>
                      <div>
                        <div className="text-xs font-semibold text-stone-900 group-hover:text-amber-900">
                          {place.name}
                        </div>
                        <div className="text-[11px] text-stone-500 line-clamp-1">
                          {place.region} • {place.address}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 group-hover:bg-amber-100 group-hover:text-amber-800">
                      {place.categoryLabel}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-xs text-stone-500">
              No matching places found for "<span className="font-semibold text-stone-700">{query}</span>" in mock data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
