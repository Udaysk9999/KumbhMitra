/**
 * Place Data Normalization & Formatting Utilities
 *
 * Ensures all components consume a standardized, safe Place interface regardless
 * of whether data originates from mock datasets or future backend API responses.
 *
 * Scope: Strictly Nashik & Trimbakeshwar (Kumbh Mela 2027).
 */

export const CATEGORY_DEFINITIONS = {
  all: { id: 'all', label: 'All Places', icon: '📍', color: 'from-stone-600 to-stone-800' },
  temple: { id: 'temple', label: 'Temples', icon: '🛕', color: 'from-amber-600 to-orange-700' },
  ghat: { id: 'ghat', label: 'Ghats', icon: '🌊', color: 'from-sky-600 to-cyan-800' },
  hotel: { id: 'hotel', label: 'Hotels', icon: '🏨', color: 'from-indigo-600 to-blue-800' },
  restaurant: { id: 'restaurant', label: 'Restaurants', icon: '🍛', color: 'from-orange-600 to-red-700' },
  shop: { id: 'shop', label: 'Shops', icon: '🏪', color: 'from-emerald-600 to-teal-800' },
  hospital: { id: 'hospital', label: 'Hospitals', icon: '🏥', color: 'from-rose-600 to-red-800' },
  medical: { id: 'medical', label: 'Medical', icon: '🚑', color: 'from-red-600 to-rose-700' },
  parking: { id: 'parking', label: 'Parking', icon: '🅿️', color: 'from-blue-600 to-indigo-800' },
  police: { id: 'police', label: 'Police', icon: '🚓', color: 'from-slate-700 to-stone-900' },
  fire_station: { id: 'fire_station', label: 'Fire Station', icon: '🚒', color: 'from-red-700 to-orange-800' },
  transport: { id: 'transport', label: 'Transport', icon: '🚌', color: 'from-violet-600 to-purple-800' },
  water_point: { id: 'water_point', label: 'Water Points', icon: '💧', color: 'from-teal-600 to-cyan-700' },
  toilet: { id: 'toilet', label: 'Restrooms', icon: '🚻', color: 'from-stone-600 to-stone-800' },
  help_center: { id: 'help_center', label: 'Help Centers', icon: 'ℹ️', color: 'from-amber-500 to-orange-600' },
  tourist: { id: 'tourist', label: 'Tourist Spots', icon: '📍', color: 'from-emerald-600 to-green-800' },
  tourist_spot: { id: 'tourist_spot', label: 'Tourist Spots', icon: '📍', color: 'from-emerald-600 to-green-800' }
};

/**
 * Approximate 2D canvas percentage coordinate calculator for Nashik-Trimbakeshwar bounds
 */
export const calculateRelativeMapPosition = (lat, lng) => {
  // Nashik/Trimbakeshwar geographical bounding box
  const minLat = 19.9100;
  const maxLat = 20.0200;
  const minLng = 73.5100;
  const maxLng = 73.8300;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return { top: '50%', left: '50%' };
  }

  // Calculate clamped percentage
  const topPct = Math.min(85, Math.max(15, 100 - ((lat - minLat) / (maxLat - minLat)) * 70 - 15));
  const leftPct = Math.min(85, Math.max(15, ((lng - minLng) / (maxLng - minLng)) * 70 + 15));

  return {
    top: `${Math.round(topPct)}%`,
    left: `${Math.round(leftPct)}%`
  };
};

/**
 * Format opening hours regardless of data structure (string vs { open, close })
 */
export const formatOpeningHours = (openingHours) => {
  if (!openingHours) return '';
  if (typeof openingHours === 'string') return openingHours.trim();

  if (typeof openingHours === 'object') {
    const { open, close } = openingHours;
    if (open && close) {
      return `${open} – ${close}`;
    }
    if (open) return `Opens at ${open}`;
  }
  return '';
};

/**
 * Format accessibility features regardless of data structure
 */
export const formatAccessibility = (accessibility) => {
  if (!accessibility) return '';
  if (typeof accessibility === 'string') return accessibility.trim();

  if (typeof accessibility === 'object') {
    const features = [];
    if (accessibility.wheelchairAccessible) features.push('Wheelchair Accessible');
    if (accessibility.seniorFriendly) features.push('Senior Friendly');
    if (features.length > 0) {
      return features.join(' • ');
    }
  }
  return '';
};

/**
 * Standardize any place record into a safe, uniform contract.
 *
 * @param {object} raw - Raw place data from mock or backend API
 * @returns {object} Normalized place object
 */
export const normalizePlace = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const id = raw.id || (raw._id ? String(raw._id) : `place_${Math.random().toString(36).substr(2, 9)}`);
  const name = raw.name || 'Unnamed Place';
  const category = (raw.category || 'all').toLowerCase();
  const catDef = CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS.all;

  // Extract lat / lng supporting both flat keys and GeoJSON Point coordinates [lng, lat]
  let latitude = 0;
  let longitude = 0;

  if (typeof raw.latitude === 'number') {
    latitude = raw.latitude;
  } else if (raw.location?.coordinates && Array.isArray(raw.location.coordinates)) {
    longitude = Number(raw.location.coordinates[0]) || 0;
    latitude = Number(raw.location.coordinates[1]) || 0;
  }

  if (typeof raw.longitude === 'number') {
    longitude = raw.longitude;
  }

  const region = raw.region || (
    (raw.address && raw.address.toLowerCase().includes('trimbak')) || longitude < 73.65
      ? 'Trimbakeshwar'
      : 'Nashik'
  );

  const coordinatesSummary = raw.coordinatesSummary || (
    latitude && longitude
      ? `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
      : 'Coordinates unavailable'
  );

  const mapPosition = raw.mapPosition || calculateRelativeMapPosition(latitude, longitude);

  // Normalize facilities and services
  const rawServices = Array.isArray(raw.services) ? raw.services : [];
  const rawFacilities = Array.isArray(raw.facilities) ? raw.facilities : [];
  const facilities = Array.from(new Set([...rawServices, ...rawFacilities])).filter(Boolean);

  const tags = Array.isArray(raw.tags)
    ? raw.tags
    : [catDef.label, region, ...facilities.slice(0, 2)];

  const imagePlaceholder = raw.imagePlaceholder || raw.image || `linear-gradient(135deg, #d97706 0%, #b45309 100%)`;

  return {
    id,
    name,
    category,
    categoryLabel: raw.categoryLabel || catDef.label,
    categoryIcon: raw.categoryIcon || catDef.icon,
    region,
    tagline: raw.tagline || `${catDef.label} in ${region}`,
    description: raw.description || 'Verified pilgrimage point of interest in Nashik/Trimbakeshwar.',
    imagePlaceholder,
    image: raw.image || null,
    address: raw.address || `${region}, Maharashtra, India`,
    phone: raw.phone || raw.contact || null,
    openingHours: formatOpeningHours(raw.openingHours),
    rating: typeof raw.rating === 'number' ? raw.rating : null,
    reviewsCount: raw.reviewsCount || null,
    accessibility: formatAccessibility(raw.accessibility),
    latitude,
    longitude,
    coordinatesSummary,
    facilities,
    services: facilities,
    tags,
    mapPosition
  };
};

/**
 * Filter places by text query across name, category, address, region, and tags
 */
export const searchPlaces = (places = [], query = '') => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return places;
  }

  const q = query.toLowerCase().trim();

  return places.filter((place) => {
    if (!place) return false;

    return (
      place.name?.toLowerCase().includes(q) ||
      place.categoryLabel?.toLowerCase().includes(q) ||
      place.category?.toLowerCase().includes(q) ||
      place.region?.toLowerCase().includes(q) ||
      place.address?.toLowerCase().includes(q) ||
      place.description?.toLowerCase().includes(q) ||
      (Array.isArray(place.tags) && place.tags.some((tag) => tag?.toLowerCase().includes(q))) ||
      (Array.isArray(place.facilities) && place.facilities.some((fac) => fac?.toLowerCase().includes(q)))
    );
  });
};

/**
 * Filter places by category ID
 */
export const filterPlacesByCategory = (places = [], categoryId = 'all') => {
  if (!categoryId || categoryId === 'all') {
    return places;
  }

  return places.filter((place) => place?.category === categoryId);
};

export default {
  CATEGORY_DEFINITIONS,
  calculateRelativeMapPosition,
  formatOpeningHours,
  formatAccessibility,
  normalizePlace,
  searchPlaces,
  filterPlacesByCategory
};
