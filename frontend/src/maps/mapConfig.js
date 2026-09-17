/**
 * Map Configuration & Geographic Constants
 * Project Scope: Strictly Nashik + Trimbakeshwar (Kumbh Mela 2027 Corridor)
 */

export const NASHIK_CENTER = {
  lat: 19.9975,
  lng: 73.7850
};

export const TRIMBAKESHWAR_COORDS = {
  lat: 19.9325,
  lng: 73.5308
};

export const DEFAULT_ZOOM = 13;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 20;

/**
 * Strict Regional Bounding Box for Nashik + Trimbakeshwar
 * Prevents map from panning out to broader Maharashtra / India.
 */
export const REGIONAL_BOUNDS = {
  north: 20.1500,
  south: 19.8200,
  west: 73.4200,
  east: 73.9500
};

/**
 * Category Visual Themes
 */
export const CATEGORY_THEMES = {
  temple: {
    pinColor: '#d97706',
    activeBg: 'bg-amber-600',
    ringColor: 'ring-amber-500/40',
    borderColor: 'border-amber-500',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  ghat: {
    pinColor: '#0284c7',
    activeBg: 'bg-sky-600',
    ringColor: 'ring-sky-500/40',
    borderColor: 'border-sky-500',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300'
  },
  hospital: {
    pinColor: '#dc2626',
    activeBg: 'bg-red-600',
    ringColor: 'ring-red-500/40',
    borderColor: 'border-red-500',
    badgeClass: 'bg-red-100 text-red-900 border-red-300'
  },
  hotel: {
    pinColor: '#4f46e5',
    activeBg: 'bg-indigo-600',
    ringColor: 'ring-indigo-500/40',
    borderColor: 'border-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  shop: {
    pinColor: '#059669',
    activeBg: 'bg-emerald-600',
    ringColor: 'ring-emerald-500/40',
    borderColor: 'border-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  transport: {
    pinColor: '#ea580c',
    activeBg: 'bg-orange-600',
    ringColor: 'ring-orange-500/40',
    borderColor: 'border-orange-500',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  parking: {
    pinColor: '#475569',
    activeBg: 'bg-slate-700',
    ringColor: 'ring-slate-500/40',
    borderColor: 'border-slate-500',
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300'
  }
};

/**
 * Get category theme with safe fallback
 */
export function getCategoryTheme(category) {
  return CATEGORY_THEMES[category] || {
    pinColor: '#d97706',
    activeBg: 'bg-amber-600',
    ringColor: 'ring-amber-500/40',
    borderColor: 'border-amber-500',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  };
}

/**
 * Base Google Maps Initialization Options
 */
export const DEFAULT_MAP_OPTIONS = {
  center: NASHIK_CENTER,
  zoom: DEFAULT_ZOOM,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  gestureHandling: 'greedy',
  clickableIcons: false,
  mapTypeControl: true,
  mapTypeControlOptions: {
    position: 3 // TOP_RIGHT (maps.ControlPosition.TOP_RIGHT)
  },
  zoomControl: false, // Managed by custom controls
  streetViewControl: false,
  fullscreenControl: false,
  restriction: {
    latLngBounds: REGIONAL_BOUNDS,
    strictBounds: false
  }
};
