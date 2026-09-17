import React, { useState } from 'react';
import { TRAVEL_MODES, getTravelMode } from './routeUtils';

/**
 * Interactive Route Panel Component
 * 
 * Supports:
 * - Origin (A) and Destination (B) selection with distinct visual markers
 * - Multi-modal transit selection: Shuttle 🚌, Walking 🚶, Driving 🚗
 * - Live distance and estimated arrival calculations
 * - Turn-by-turn navigation steps list
 * - Loading, error, and empty states
 * - Desktop floating card & mobile-friendly bottom sheet
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
  const [selectedMode, setSelectedMode] = useState(activeRoute?.travelMode || activeRoute?.mode || 'shuttle');
  const [showSteps, setShowSteps] = useState(false);

  const handleModeClick = (modeId) => {
    setSelectedMode(modeId);
    onChangeMode?.(modeId);
  };

  const currentModeConfig = getTravelMode(selectedMode);

  return (
    <div
      className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:top-28 sm:left-4 z-40 w-full sm:w-96 max-h-[82vh] sm:max-h-[calc(100vh-8.5rem)] bg-white/98 backdrop-blur-md shadow-2xl border-t sm:border border-stone-200/90 rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-left-4 duration-200"
      role="region"
      aria-label="Route Planning and Directions"
    >
      {/* Mobile Drag Pill */}
      <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mt-2 sm:hidden" aria-hidden="true" />

      {/* Panel Header */}
      <div className="p-3.5 sm:p-4 border-b border-stone-200/80 bg-stone-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-amber-600/10 text-amber-800 flex items-center justify-center text-sm font-bold shadow-xs" aria-hidden="true">
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

      {/* Scrollable Body */}
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
                  <span className="truncate">{mode.shortLabel || mode.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-stone-500 px-1 italic">
            {currentModeConfig.description}
          </p>
        </div>

        {/* Origin & Destination Selectors */}
        <div className="relative p-3 bg-stone-50/90 rounded-2xl border border-stone-200/90 space-y-2.5">
          
          {/* Start Point (A) - Emerald */}
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs flex-shrink-0"
              title="Origin (Start Location)"
            >
              A
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="route-start-select" className="sr-only">Origin Location</label>
              <select
                id="route-start-select"
                value={startPlace?.id || ''}
                onChange={(e) => {
                  const place = places.find((p) => p.id === e.target.value);
                  onSelectStart?.(place);
                }}
                className="w-full text-xs font-semibold text-stone-900 bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="" disabled>Choose Starting Point...</option>
                {places.map((p) => (
                  <option key={`start-${p.id}`} value={p.id}>
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
              className="p-1 rounded-full bg-white border border-stone-200 text-stone-500 hover:text-amber-800 hover:bg-amber-50 transition-colors shadow-xs cursor-pointer text-xs flex items-center gap-1 px-2.5"
              title="Swap origin and destination"
              aria-label="Swap origin and destination"
            >
              <span>⇅</span>
              <span className="text-[10px] font-semibold">Reverse Route</span>
            </button>
          </div>

          {/* Destination Point (B) - Amber */}
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs flex-shrink-0"
              title="Destination (End Location)"
            >
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
                <option value="" disabled>Choose Destination...</option>
                {places.map((p) => (
                  <option key={`dest-${p.id}`} value={p.id}>
                    {p.name} ({p.region})
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
            <span className="text-sm mt-0.5" aria-hidden="true">⚠️</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-red-900">Route Error</div>
              <div className="text-[11px] text-red-700 mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Calculate Route Action Button */}
        <button
          type="button"
          disabled={!startPlace || !destPlace || isLoading}
          onClick={onCalculateRoute}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Calculating Route Path...</span>
            </>
          ) : (
            <>
              <span>🗺️</span>
              <span>{activeRoute ? 'Recalculate Route' : 'Show Route on Map'}</span>
            </>
          )}
        </button>

        {/* Active Route Statistics & Information Card */}
        {activeRoute && !isLoading && (
          <div className="p-3.5 bg-white rounded-2xl border border-stone-200/90 shadow-sm space-y-3 animate-in fade-in duration-200">
            
            {/* Header: Duration & Distance */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" aria-hidden="true">
                  {activeRoute.modeIcon || currentModeConfig.icon}
                </span>
                <div>
                  <div className="text-base font-extrabold text-stone-900 leading-tight">
                    {activeRoute.durationText}
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500">
                    {activeRoute.distanceText} via {activeRoute.modeLabel}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 block">
                  Active
                </span>
                <span className="text-[9px] text-stone-400 font-medium mt-0.5 block">
                  {activeRoute.source === 'api' ? 'Live API' : 'Simulated'}
                </span>
              </div>
            </div>

            {/* Start (A) & Destination (B) Summaries */}
            <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
              <div className="flex items-start gap-2 min-w-0">
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  A
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-stone-900 block truncate">
                    {activeRoute.start.name}
                  </span>
                  {activeRoute.start.address && (
                    <span className="text-[10px] text-stone-400 block truncate">
                      {activeRoute.start.address}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-0.5 h-3 bg-stone-300 ml-2" aria-hidden="true" />

              <div className="flex items-start gap-2 min-w-0">
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-bold mt-0.5 flex-shrink-0">
                  B
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-stone-900 block truncate">
                    {activeRoute.destination.name}
                  </span>
                  {activeRoute.destination.address && (
                    <span className="text-[10px] text-stone-400 block truncate">
                      {activeRoute.destination.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Turn-by-Turn Navigation Accordion Toggle */}
            {activeRoute.steps && activeRoute.steps.length > 0 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowSteps((prev) => !prev)}
                  className="w-full py-1.5 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  aria-expanded={showSteps}
                >
                  <span className="flex items-center gap-1.5">
                    <span>🧭</span>
                    <span>Turn-by-Turn Directions ({activeRoute.steps.length} steps)</span>
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${showSteps ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Steps List */}
                {showSteps && (
                  <div className="mt-2 space-y-2 border-t border-stone-100 pt-2 text-xs animate-in fade-in duration-150">
                    {activeRoute.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-stone-600 bg-white p-2 rounded-lg border border-stone-100">
                        <span className="w-5 h-5 rounded-md bg-amber-50 text-amber-800 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-stone-800 leading-snug">
                            {step.instruction}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                            {step.distanceText && <span>{step.distanceText}</span>}
                            {step.durationText && <span>• {step.durationText}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Guidance Notice */}
            <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[10px] text-amber-900 leading-snug">
              ℹ️ <strong>Simhastha Route Corridor</strong>:
              {activeRoute.source === 'api'
                ? ' Powered by backend live transit routing API.'
                : ' Displaying simulated Nashik-Trimbak highway geometry adhering to GeoJSON LineString standard.'}
            </div>

            {/* Clear Route Button */}
            <button
              type="button"
              onClick={onClearRoute}
              className="w-full py-2 px-3 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Clear Route from Map
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
