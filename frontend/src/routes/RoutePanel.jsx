import React, { useState } from 'react';
import { TRAVEL_MODES } from './routeUtils';

/**
 * Interactive Route Panel Component
 * Controls route planning between places in the Nashik-Trimbakeshwar corridor.
 * Supports start/destination selection, travel mode switching, distance/duration metrics,
 * and clean responsive desktop/mobile presentations.
 */
export default function RoutePanel({
  places = [],
  startPlace,
  destPlace,
  activeRoute,
  onSelectStart,
  onSelectDest,
  onSwapPoints,
  onChangeMode,
  onCalculateRoute,
  onClearRoute,
  onClose,
  isLoading = false,
  error = null
}) {
  const [selectedMode, setSelectedMode] = useState(activeRoute?.mode || 'shuttle');

  const handleModeClick = (modeId) => {
    setSelectedMode(modeId);
    onChangeMode?.(modeId);
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:top-28 sm:left-4 z-40 w-full sm:w-96 max-h-[76vh] sm:max-h-[calc(100vh-8.5rem)] bg-white/98 backdrop-blur-md shadow-2xl border-t sm:border border-stone-200/90 rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-left-4 duration-200"
      role="region"
      aria-label="Route Planning and Directions"
    >
      {/* Mobile Drag Pill */}
      <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2 sm:hidden" aria-hidden="true" />

      {/* Panel Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200/80 bg-stone-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-600/10 text-amber-800 flex items-center justify-center text-sm font-bold" aria-hidden="true">
            🧭
          </span>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
              Kumbh Route Directions
            </h2>
            <p className="text-[10px] text-stone-500 font-medium">
              Nashik ⇄ Trimbakeshwar Corridor
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          aria-label="Close directions panel"
          title="Close directions panel"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
        
        {/* Travel Mode Switcher */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            Travel Mode
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200/80">
            {TRAVEL_MODES.map((mode) => {
              const isActive = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeClick(mode.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200 font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="text-sm" aria-hidden="true">{mode.icon}</span>
                  <span className="truncate">{mode.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="relative p-3 bg-stone-50/90 rounded-2xl border border-stone-200/90 space-y-2.5">
          
          {/* Start Point (A) */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs flex-shrink-0">
              A
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="route-start-select" className="sr-only">Start Location</label>
              <select
                id="route-start-select"
                value={startPlace?.id || ''}
                onChange={(e) => {
                  const place = places.find((p) => p.id === e.target.value);
                  onSelectStart?.(place);
                }}
                className="w-full text-xs font-semibold text-stone-900 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="" disabled>Select Origin Point...</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex items-center justify-center -my-1">
            <button
              type="button"
              onClick={onSwapPoints}
              className="p-1 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition-colors shadow-xs cursor-pointer text-xs flex items-center gap-1 px-2"
              title="Swap origin and destination"
              aria-label="Swap origin and destination"
            >
              <span>⇅</span>
              <span className="text-[10px] font-semibold">Reverse</span>
            </button>
          </div>

          {/* Destination Point (B) */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs flex-shrink-0">
              B
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="route-dest-select" className="sr-only">Destination Location</label>
              <select
                id="route-dest-select"
                value={destPlace?.id || ''}
                onChange={(e) => {
                  const place = places.find((p) => p.id === e.target.value);
                  onSelectDest?.(place);
                }}
                className="w-full text-xs font-semibold text-stone-900 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                <option value="" disabled>Select Destination...</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Calculate / Recalculate Action Button */}
        <button
          type="button"
          disabled={!startPlace || !destPlace || isLoading}
          onClick={onCalculateRoute}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Calculating Route Path...</span>
            </>
          ) : (
            <>
              <span>🗺️</span>
              <span>Show Route on Map</span>
            </>
          )}
        </button>

        {/* Active Route Statistics Card */}
        {activeRoute && !isLoading && (
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-sm space-y-2.5 animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{activeRoute.modeIcon}</span>
                <div>
                  <div className="text-sm font-extrabold text-stone-900">
                    {activeRoute.durationText}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    {activeRoute.distanceText} via {activeRoute.modeLabel}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Route Active
              </span>
            </div>

            {/* Start & End summary */}
            <div className="space-y-1.5 text-xs text-stone-700">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  A
                </span>
                <span className="truncate font-medium">{activeRoute.start.name}</span>
              </div>
              <div className="w-0.5 h-2 bg-stone-300 ml-2" />
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  B
                </span>
                <span className="truncate font-medium">{activeRoute.destination.name}</span>
              </div>
            </div>

            {/* Demo Notice */}
            <div className="p-2 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 leading-snug">
              ℹ️ <strong>Demo Route Layer</strong>: Displaying simulated road curvature adhering to GeoJSON LineString coordinates. Live GPS feeds & transit schedules will connect in the routing phase.
            </div>

            {/* Clear Route Button */}
            <button
              type="button"
              onClick={onClearRoute}
              className="w-full py-1.5 px-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Clear Route from Map
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
