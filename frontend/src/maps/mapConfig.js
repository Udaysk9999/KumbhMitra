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
 * Distinct Category Visual Themes for all 35+ POI types
 */
export const CATEGORY_THEMES = {
  // Kumbh / Pilgrimage
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
  kumbh_zone: {
    pinColor: '#ea580c',
    activeBg: 'bg-orange-600',
    ringColor: 'ring-orange-500/40',
    borderColor: 'border-orange-500',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  akhada: {
    pinColor: '#dc2626',
    activeBg: 'bg-red-600',
    ringColor: 'ring-red-500/40',
    borderColor: 'border-red-500',
    badgeClass: 'bg-red-100 text-red-900 border-red-300'
  },
  ashram: {
    pinColor: '#d97706',
    activeBg: 'bg-amber-500',
    ringColor: 'ring-amber-400/40',
    borderColor: 'border-amber-500',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
  },

  // Emergency & Medical
  hospital: {
    pinColor: '#dc2626',
    activeBg: 'bg-rose-600',
    ringColor: 'ring-rose-500/40',
    borderColor: 'border-rose-500',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  medical: {
    pinColor: '#e11d48',
    activeBg: 'bg-rose-600',
    ringColor: 'ring-rose-500/40',
    borderColor: 'border-rose-500',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  ambulance: {
    pinColor: '#be123c',
    activeBg: 'bg-rose-700',
    ringColor: 'ring-rose-600/40',
    borderColor: 'border-rose-600',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300'
  },
  blood_bank: {
    pinColor: '#9f1239',
    activeBg: 'bg-red-800',
    ringColor: 'ring-red-700/40',
    borderColor: 'border-red-700',
    badgeClass: 'bg-red-100 text-red-900 border-red-300'
  },
  pharmacy: {
    pinColor: '#059669',
    activeBg: 'bg-emerald-600',
    ringColor: 'ring-emerald-500/40',
    borderColor: 'border-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  police: {
    pinColor: '#1e293b',
    activeBg: 'bg-slate-800',
    ringColor: 'ring-slate-700/40',
    borderColor: 'border-slate-700',
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300'
  },
  fire_station: {
    pinColor: '#c2410c',
    activeBg: 'bg-orange-700',
    ringColor: 'ring-orange-600/40',
    borderColor: 'border-orange-600',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  emergency: {
    pinColor: '#b91c1c',
    activeBg: 'bg-red-700',
    ringColor: 'ring-red-600/40',
    borderColor: 'border-red-600',
    badgeClass: 'bg-red-100 text-red-900 border-red-300'
  },

  // Food & Stay
  restaurant: {
    pinColor: '#ea580c',
    activeBg: 'bg-orange-600',
    ringColor: 'ring-orange-500/40',
    borderColor: 'border-orange-500',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  hotel: {
    pinColor: '#4f46e5',
    activeBg: 'bg-indigo-600',
    ringColor: 'ring-indigo-500/40',
    borderColor: 'border-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300'
  },
  dharamshala: {
    pinColor: '#0d9488',
    activeBg: 'bg-teal-600',
    ringColor: 'ring-teal-500/40',
    borderColor: 'border-teal-500',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300'
  },
  bhakta_niwas: {
    pinColor: '#2563eb',
    activeBg: 'bg-blue-600',
    ringColor: 'ring-blue-500/40',
    borderColor: 'border-blue-500',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  guest_house: {
    pinColor: '#3b82f6',
    activeBg: 'bg-blue-500',
    ringColor: 'ring-blue-400/40',
    borderColor: 'border-blue-400',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  shop: {
    pinColor: '#059669',
    activeBg: 'bg-emerald-600',
    ringColor: 'ring-emerald-500/40',
    borderColor: 'border-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },

  // Transport & Parking
  transport: {
    pinColor: '#7c3aed',
    activeBg: 'bg-violet-600',
    ringColor: 'ring-violet-500/40',
    borderColor: 'border-violet-500',
    badgeClass: 'bg-violet-100 text-violet-900 border-violet-300'
  },
  railway: {
    pinColor: '#1d4ed8',
    activeBg: 'bg-blue-700',
    ringColor: 'ring-blue-600/40',
    borderColor: 'border-blue-600',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300'
  },
  bus_stand: {
    pinColor: '#6d28d9',
    activeBg: 'bg-purple-700',
    ringColor: 'ring-purple-600/40',
    borderColor: 'border-purple-600',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300'
  },
  parking: {
    pinColor: '#475569',
    activeBg: 'bg-slate-700',
    ringColor: 'ring-slate-500/40',
    borderColor: 'border-slate-500',
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300'
  },

  // Public Facilities
  public_toilet: {
    pinColor: '#57534e',
    activeBg: 'bg-stone-700',
    ringColor: 'ring-stone-500/40',
    borderColor: 'border-stone-500',
    badgeClass: 'bg-stone-100 text-stone-900 border-stone-300'
  },
  toilet: {
    pinColor: '#57534e',
    activeBg: 'bg-stone-700',
    ringColor: 'ring-stone-500/40',
    borderColor: 'border-stone-500',
    badgeClass: 'bg-stone-100 text-stone-900 border-stone-300'
  },
  water_point: {
    pinColor: '#0891b2',
    activeBg: 'bg-cyan-600',
    ringColor: 'ring-cyan-500/40',
    borderColor: 'border-cyan-500',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300'
  },
  help_center: {
    pinColor: '#d97706',
    activeBg: 'bg-amber-500',
    ringColor: 'ring-amber-400/40',
    borderColor: 'border-amber-400',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  tourist_information: {
    pinColor: '#0284c7',
    activeBg: 'bg-sky-600',
    ringColor: 'ring-sky-500/40',
    borderColor: 'border-sky-500',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300'
  },
  government_facility: {
    pinColor: '#334155',
    activeBg: 'bg-slate-700',
    ringColor: 'ring-slate-600/40',
    borderColor: 'border-slate-600',
    badgeClass: 'bg-slate-100 text-slate-900 border-slate-300'
  },
  rest_area: {
    pinColor: '#78716c',
    activeBg: 'bg-stone-600',
    ringColor: 'ring-stone-500/40',
    borderColor: 'border-stone-500',
    badgeClass: 'bg-stone-100 text-stone-900 border-stone-300'
  },
  other_public_facility: {
    pinColor: '#52525b',
    activeBg: 'bg-zinc-700',
    ringColor: 'ring-zinc-600/40',
    borderColor: 'border-zinc-600',
    badgeClass: 'bg-zinc-100 text-zinc-900 border-zinc-300'
  },

  // Explore Nashik: Forts, Waterfalls, Caves, Museums, Nature
  fort: {
    pinColor: '#78350f',
    activeBg: 'bg-amber-800',
    ringColor: 'ring-amber-700/40',
    borderColor: 'border-amber-700',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-400 font-bold'
  },
  cave: {
    pinColor: '#525252',
    activeBg: 'bg-neutral-700',
    ringColor: 'ring-neutral-600/40',
    borderColor: 'border-neutral-600',
    badgeClass: 'bg-neutral-100 text-neutral-900 border-neutral-300'
  },
  waterfall: {
    pinColor: '#0284c7',
    activeBg: 'bg-sky-600',
    ringColor: 'ring-sky-500/40',
    borderColor: 'border-sky-500',
    badgeClass: 'bg-sky-100 text-sky-900 border-sky-300'
  },
  museum: {
    pinColor: '#b45309',
    activeBg: 'bg-amber-700',
    ringColor: 'ring-amber-600/40',
    borderColor: 'border-amber-600',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
  },
  nature: {
    pinColor: '#15803d',
    activeBg: 'bg-green-700',
    ringColor: 'ring-green-600/40',
    borderColor: 'border-green-600',
    badgeClass: 'bg-green-100 text-green-900 border-green-300'
  },
  viewpoint: {
    pinColor: '#c2410c',
    activeBg: 'bg-orange-700',
    ringColor: 'ring-orange-600/40',
    borderColor: 'border-orange-600',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300'
  },
  tourist_spot: {
    pinColor: '#047857',
    activeBg: 'bg-emerald-700',
    ringColor: 'ring-emerald-600/40',
    borderColor: 'border-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  },
  tourist: {
    pinColor: '#047857',
    activeBg: 'bg-emerald-700',
    ringColor: 'ring-emerald-600/40',
    borderColor: 'border-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  }
};

/**
 * Get category theme with safe fallback
 */
export function getCategoryTheme(category) {
  if (!category) {
    return CATEGORY_THEMES.temple;
  }
  const key = category.toLowerCase();
  return (
    CATEGORY_THEMES[key] || {
      pinColor: '#d97706',
      activeBg: 'bg-amber-600',
      ringColor: 'ring-amber-500/40',
      borderColor: 'border-amber-500',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
    }
  );
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
    position: 3 // TOP_RIGHT
  },
  zoomControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  restriction: {
    latLngBounds: REGIONAL_BOUNDS,
    strictBounds: false
  }
};
