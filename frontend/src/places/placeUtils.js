/**
 * Place Data Normalization & Formatting Utilities
 *
 * Ensures all components consume a standardized, safe Place interface regardless
 * of whether data originates from mock datasets or real backend API responses.
 *
 * Scope: Strictly Nashik & Trimbakeshwar (Kumbh Mela 2027 Corridor).
 */

export const CATEGORY_DEFINITIONS = {
  all: { id: 'all', label: 'All Places', icon: '📍', color: 'from-stone-600 to-stone-800' },
  temple: { id: 'temple', label: 'Temples', icon: '🛕', color: 'from-amber-600 to-orange-700' },
  ghat: { id: 'ghat', label: 'Ghats', icon: '🌊', color: 'from-sky-600 to-cyan-800' },
  kumbh_zone: { id: 'kumbh_zone', label: 'Kumbh Zones', icon: '⛺', color: 'from-orange-600 to-red-700' },
  akhada: { id: 'akhada', label: 'Akhadas', icon: '🚩', color: 'from-red-600 to-amber-700' },
  ashram: { id: 'ashram', label: 'Ashrams', icon: '🕉️', color: 'from-amber-500 to-orange-700' },
  dharamshala: { id: 'dharamshala', label: 'Dharamshalas', icon: '🏠', color: 'from-teal-600 to-cyan-800' },
  bhakta_niwas: { id: 'bhakta_niwas', label: 'Bhakta Niwas', icon: '🛏️', color: 'from-sky-600 to-indigo-700' },
  guest_house: { id: 'guest_house', label: 'Guest Houses', icon: '🏡', color: 'from-indigo-600 to-blue-700' },
  hotel: { id: 'hotel', label: 'Hotels', icon: '🏨', color: 'from-indigo-600 to-blue-800' },
  restaurant: { id: 'restaurant', label: 'Restaurants', icon: '🍛', color: 'from-orange-600 to-red-700' },
  shop: { id: 'shop', label: 'Markets & Shops', icon: '🏪', color: 'from-emerald-600 to-teal-800' },
  hospital: { id: 'hospital', label: 'Hospitals', icon: '🏥', color: 'from-rose-600 to-red-800' },
  medical: { id: 'medical', label: 'Medical Facilities', icon: '🏥', color: 'from-red-600 to-rose-700' },
  ambulance: { id: 'ambulance', label: 'Ambulance Points', icon: '🚑', color: 'from-rose-600 to-red-700' },
  blood_bank: { id: 'blood_bank', label: 'Blood Banks', icon: '🩸', color: 'from-red-700 to-rose-900' },
  pharmacy: { id: 'pharmacy', label: 'Pharmacies', icon: '💊', color: 'from-emerald-600 to-teal-700' },
  police: { id: 'police', label: 'Police Stations', icon: '🚓', color: 'from-slate-700 to-stone-900' },
  fire_station: { id: 'fire_station', label: 'Fire Stations', icon: '🚒', color: 'from-red-700 to-orange-800' },
  emergency: { id: 'emergency', label: 'Emergency Posts', icon: '🚨', color: 'from-red-600 to-rose-800' },
  parking: { id: 'parking', label: 'Parking Grounds', icon: '🅿️', color: 'from-blue-600 to-indigo-800' },
  transport: { id: 'transport', label: 'Transit Hubs', icon: '🚌', color: 'from-violet-600 to-purple-800' },
  railway: { id: 'railway', label: 'Railway Stations', icon: '🚆', color: 'from-blue-700 to-slate-900' },
  bus_stand: { id: 'bus_stand', label: 'Bus Stands', icon: '🚏', color: 'from-violet-600 to-purple-800' },
  water_point: { id: 'water_point', label: 'Drinking Water', icon: '💧', color: 'from-teal-600 to-cyan-700' },
  toilet: { id: 'toilet', label: 'Public Restrooms', icon: '🚻', color: 'from-stone-600 to-stone-800' },
  public_toilet: { id: 'public_toilet', label: 'Public Restrooms', icon: '🚻', color: 'from-stone-600 to-stone-800' },
  help_center: { id: 'help_center', label: 'Help Centers', icon: 'ℹ️', color: 'from-amber-500 to-orange-600' },
  tourist: { id: 'tourist', label: 'Tourist Spots', icon: '📍', color: 'from-emerald-600 to-green-800' },
  tourist_spot: { id: 'tourist_spot', label: 'Tourist Spots', icon: '📍', color: 'from-emerald-600 to-green-800' },
  fort: { id: 'fort', label: 'Historical Forts', icon: '🏰', color: 'from-amber-700 to-stone-800' },
  cave: { id: 'cave', label: 'Ancient Caves', icon: '🪨', color: 'from-stone-600 to-zinc-800' },
  waterfall: { id: 'waterfall', label: 'Waterfalls', icon: '🌊', color: 'from-cyan-600 to-blue-700' },
  museum: { id: 'museum', label: 'Museums & Heritage', icon: '🏛️', color: 'from-amber-600 to-yellow-800' },
  nature: { id: 'nature', label: 'Nature & Parks', icon: '🌲', color: 'from-emerald-600 to-teal-800' },
  viewpoint: { id: 'viewpoint', label: 'Scenic Viewpoints', icon: '🌄', color: 'from-orange-500 to-amber-700' },
  government_facility: { id: 'government_facility', label: 'Civic & Govt', icon: '🏢', color: 'from-slate-600 to-gray-800' },
  tourist_information: { id: 'tourist_information', label: 'Tourist Info', icon: 'ℹ️', color: 'from-cyan-600 to-sky-800' },
  rest_area: { id: 'rest_area', label: 'Rest Areas', icon: '🛖', color: 'from-stone-500 to-zinc-700' },
  other_public_facility: { id: 'other_public_facility', label: 'Public Amenities', icon: '🏛️', color: 'from-stone-600 to-stone-800' }
};

/**
 * 6 Organized Filter Groups for Clean UI
 */
export const FILTER_GROUPS = [
  {
    id: 'kumbh',
    title: 'Kumbh / Pilgrimage',
    icon: '🕉️',
    categories: [
      { id: 'temple', label: 'Temples', icon: '🛕' },
      { id: 'ghat', label: 'Ghats', icon: '🌊' },
      { id: 'kumbh_zone', label: 'Kumbh Zones', icon: '⛺' },
      { id: 'akhada', label: 'Akhadas', icon: '🚩' },
      { id: 'ashram', label: 'Ashrams', icon: '🕉️' }
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency',
    icon: '🚨',
    categories: [
      { id: 'hospital', label: 'Hospitals', icon: '🏥' },
      { id: 'medical', label: 'Medical', icon: '🏥' },
      { id: 'ambulance', label: 'Ambulance', icon: '🚑' },
      { id: 'blood_bank', label: 'Blood Banks', icon: '🩸' },
      { id: 'pharmacy', label: 'Pharmacies', icon: '💊' },
      { id: 'police', label: 'Police', icon: '🚓' },
      { id: 'fire_station', label: 'Fire Stations', icon: '🚒' },
      { id: 'emergency', label: 'Emergency', icon: '🚨' }
    ]
  },
  {
    id: 'food_stay',
    title: 'Food / Stay',
    icon: '🏨',
    categories: [
      { id: 'restaurant', label: 'Restaurants', icon: '🍛' },
      { id: 'hotel', label: 'Hotels', icon: '🏨' },
      { id: 'dharamshala', label: 'Dharamshalas', icon: '🏠' },
      { id: 'bhakta_niwas', label: 'Bhakta Niwas', icon: '🛏️' },
      { id: 'ashram', label: 'Ashrams', icon: '🕉️' }
    ]
  },
  {
    id: 'transport',
    title: 'Transport',
    icon: '🚌',
    categories: [
      { id: 'railway', label: 'Railway', icon: '🚆' },
      { id: 'bus_stand', label: 'Bus Stands', icon: '🚏' },
      { id: 'transport', label: 'Transit Hubs', icon: '🚌' },
      { id: 'parking', label: 'Parking', icon: '🅿️' }
    ]
  },
  {
    id: 'public_facilities',
    title: 'Public Facilities',
    icon: '🚻',
    categories: [
      { id: 'public_toilet', label: 'Toilets', icon: '🚻', alias: 'toilet' },
      { id: 'water_point', label: 'Water', icon: '💧' },
      { id: 'help_center', label: 'Help Centers', icon: 'ℹ️' },
      { id: 'tourist_information', label: 'Tourist Info', icon: 'ℹ️' },
      { id: 'rest_area', label: 'Rest Areas', icon: '🛖' },
      { id: 'government_facility', label: 'Govt Facilities', icon: '🏢' }
    ]
  },
  {
    id: 'explore_nashik',
    title: 'Explore Nashik',
    icon: '🏰',
    categories: [
      { id: 'tourist_spot', label: 'Tourist Spots', icon: '📍', alias: 'tourist' },
      { id: 'fort', label: 'Forts', icon: '🏰' },
      { id: 'cave', label: 'Caves', icon: '🪨' },
      { id: 'waterfall', label: 'Waterfalls', icon: '🌊' },
      { id: 'museum', label: 'Museums', icon: '🏛️' },
      { id: 'nature', label: 'Nature', icon: '🌲' },
      { id: 'viewpoint', label: 'Viewpoints', icon: '🌄' }
    ]
  }
];

/**
 * Priority categories for Mode Switcher
 */
export const KUMBH_MODE_CATEGORIES = new Set([
  'temple', 'ghat', 'kumbh_zone', 'akhada', 'ashram',
  'hospital', 'medical', 'ambulance', 'blood_bank', 'pharmacy',
  'police', 'fire_station', 'emergency',
  'parking', 'transport', 'railway', 'bus_stand',
  'public_toilet', 'toilet', 'water_point', 'help_center',
  'restaurant', 'hotel', 'dharamshala', 'bhakta_niwas', 'guest_house',
  'government_facility', 'other_public_facility', 'rest_area'
]);

export const EXPLORE_MODE_CATEGORIES = new Set([
  'fort', 'tourist_spot', 'tourist', 'cave', 'waterfall', 'museum', 'nature', 'viewpoint',
  'temple', 'ghat', 'hotel', 'restaurant'
]);

/**
 * Approximate 2D canvas percentage coordinate calculator for Nashik-Trimbakeshwar bounds
 */
export const calculateRelativeMapPosition = (lat, lng) => {
  const minLat = 19.9100;
  const maxLat = 20.0200;
  const minLng = 73.5100;
  const maxLng = 73.8300;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    return { top: '50%', left: '50%' };
  }

  const topPct = Math.min(85, Math.max(15, 100 - ((lat - minLat) / (maxLat - minLat)) * 70 - 15));
  const leftPct = Math.min(85, Math.max(15, ((lng - minLng) / (maxLng - minLng)) * 70 + 15));

  return {
    top: `${Math.round(topPct)}%`,
    left: `${Math.round(leftPct)}%`
  };
};

/**
 * Format opening hours regardless of data structure
 */
export const formatOpeningHours = (openingHours) => {
  if (!openingHours) return '';
  if (typeof openingHours === 'string') return openingHours.trim();

  if (typeof openingHours === 'object') {
    const { open, close, days, note } = openingHours;
    const parts = [];
    if (open && close) parts.push(`${open} – ${close}`);
    else if (open) parts.push(`Opens at ${open}`);
    if (days) parts.push(`(${days})`);
    if (note) parts.push(`[${note}]`);
    return parts.join(' ');
  }
  return '';
};

/**
 * Format accessibility features safely
 */
export const formatAccessibility = (accessibility) => {
  if (!accessibility) return '';
  if (typeof accessibility === 'string') return accessibility.trim();

  if (typeof accessibility === 'object') {
    const features = [];
    if (accessibility.wheelchairAccessible) features.push('Wheelchair Accessible');
    if (accessibility.rampAvailable) features.push('Ramp Available');
    if (accessibility.seniorFriendly) features.push('Senior Friendly');
    if (accessibility.brailleSignage) features.push('Braille Signage');
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
  const rawCat = (raw.category || 'all').toLowerCase();
  const category = (rawCat === 'toilet' ? 'public_toilet' : (rawCat === 'tourist' ? 'tourist_spot' : rawCat));
  const catDef = CATEGORY_DEFINITIONS[category] || CATEGORY_DEFINITIONS[rawCat] || CATEGORY_DEFINITIONS.all;

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

  const addressStr = typeof raw.address === 'object' && raw.address !== null
    ? (raw.address.fullAddress || [raw.address.area, raw.address.city, raw.address.district, raw.address.state].filter(Boolean).join(', '))
    : (typeof raw.address === 'string' ? raw.address : '');

  const region = raw.region || (
    (addressStr && addressStr.toLowerCase().includes('trimbak')) || (name && name.toLowerCase().includes('trimbak')) || longitude < 73.65
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

  // Normalize Contact
  let phone = null;
  let email = null;
  let website = null;
  if (typeof raw.contact === 'object' && raw.contact !== null) {
    phone = raw.contact.phone || null;
    email = raw.contact.email || null;
    website = raw.contact.website || null;
  } else if (typeof raw.contact === 'string') {
    phone = raw.contact;
  } else if (raw.phone) {
    phone = raw.phone;
  }

  const imagePlaceholder = raw.imagePlaceholder || raw.image || `linear-gradient(135deg, #d97706 0%, #b45309 100%)`;

  return {
    id,
    _id: raw._id ? String(raw._id) : id,
    name,
    category,
    rawCategory: rawCat,
    categoryLabel: raw.categoryLabel || catDef.label,
    categoryIcon: raw.categoryIcon || catDef.icon,
    subcategory: raw.subcategory || null,
    region,
    tagline: raw.tagline || `${catDef.label} in ${region}`,
    description: raw.description || 'Verified point of interest in Nashik and Trimbakeshwar.',
    imagePlaceholder,
    image: raw.image || null,
    address: addressStr || `${region}, Maharashtra, India`,
    phone,
    email,
    website,
    contact: phone || email || website || null,
    openingHours: formatOpeningHours(raw.openingHours),
    rawOpeningHours: raw.openingHours || null,
    rating: typeof raw.rating === 'number' ? raw.rating : null,
    reviewsCount: raw.reviewsCount || null,
    accessibility: formatAccessibility(raw.accessibility),
    rawAccessibility: raw.accessibility || null,
    latitude,
    longitude,
    coordinatesSummary,
    facilities,
    services: facilities,
    tags,
    importance: typeof raw.importance === 'number' ? raw.importance : null,
    kumbhRelevance: raw.kumbhRelevance != null ? Boolean(raw.kumbhRelevance) : true,
    verified: raw.verified != null ? Boolean(raw.verified) : true,
    source: raw.source || 'Nashik District Administration / Kumbh Authority',
    distanceKm: raw.distanceKm || (raw.distance != null ? (raw.distance / 1000).toFixed(1) : null),
    mapPosition
  };
};

/**
 * Filter places by text query across name, category, subcategory, address, region, tags, and facilities
 */
export const searchPlaces = (places = [], query = '') => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return places;
  }

  const q = query.toLowerCase().trim();

  // Handle plural / aliases like 'forts' -> 'fort', 'temples' -> 'temple', 'hospitals' -> 'hospital'
  const singularQ = q.endsWith('s') ? q.slice(0, -1) : q;
  const esSingularQ = q.endsWith('es') ? q.slice(0, -2) : singularQ;

  return places.filter((place) => {
    if (!place) return false;

    const nameMatch = place.name?.toLowerCase().includes(q);
    const catLabelMatch = place.categoryLabel?.toLowerCase().includes(q) || place.categoryLabel?.toLowerCase().includes(singularQ);
    const catMatch = place.category?.toLowerCase().includes(q) || place.category?.toLowerCase().includes(singularQ) || place.category?.toLowerCase().includes(esSingularQ);
    const subcatMatch = place.subcategory?.toLowerCase().includes(q);
    const regionMatch = place.region?.toLowerCase().includes(q);
    const addressMatch = place.address?.toLowerCase().includes(q);
    const descMatch = place.description?.toLowerCase().includes(q);
    const tagsMatch = Array.isArray(place.tags) && place.tags.some((tag) => tag?.toLowerCase().includes(q) || tag?.toLowerCase().includes(singularQ));
    const facMatch = Array.isArray(place.facilities) && place.facilities.some((fac) => fac?.toLowerCase().includes(q));

    return nameMatch || catLabelMatch || catMatch || subcatMatch || regionMatch || addressMatch || descMatch || tagsMatch || facMatch;
  });
};

/**
 * Filter places by category ID (supporting aliases)
 */
export const filterPlacesByCategory = (places = [], categoryId = 'all') => {
  if (!categoryId || categoryId === 'all') {
    return places;
  }

  const normalized = categoryId.toLowerCase();

  return places.filter((place) => {
    if (!place) return false;
    const cat = (place.category || '').toLowerCase();
    if (cat === normalized) return true;
    if ((normalized === 'toilet' || normalized === 'public_toilet') && (cat === 'toilet' || cat === 'public_toilet')) return true;
    if ((normalized === 'tourist' || normalized === 'tourist_spot') && (cat === 'tourist' || cat === 'tourist_spot')) return true;
    if ((normalized === 'guest_house' || normalized === 'bhakta_niwas') && (cat === 'guest_house' || cat === 'bhakta_niwas')) return true;
    if ((normalized === 'medical' || normalized === 'hospital') && (cat === 'medical' || cat === 'hospital')) return true;
    return false;
  });
};

export default {
  CATEGORY_DEFINITIONS,
  FILTER_GROUPS,
  KUMBH_MODE_CATEGORIES,
  EXPLORE_MODE_CATEGORIES,
  calculateRelativeMapPosition,
  formatOpeningHours,
  formatAccessibility,
  normalizePlace,
  searchPlaces,
  filterPlacesByCategory
};
