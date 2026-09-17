import Place from '../models/Place.js';

/**
 * Escape special characters in text for safe regular expressions
 *
 * @param {string} text
 * @returns {string} Escaped string
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Helper to build category query filter supporting aliases and groupings
 */
const buildCategoryFilter = (category) => {
  if (!category || typeof category !== 'string' || !category.trim()) {
    return null;
  }
  const cat = category.trim().toLowerCase();
  if (cat === 'toilet' || cat === 'public_toilet') {
    return { $in: ['public_toilet', 'toilet'] };
  }
  if (cat === 'accommodation') {
    return { $in: ['hotel', 'dharamshala', 'ashram', 'bhakta_niwas', 'guest_house'] };
  }
  if (cat === 'medical') {
    return { $in: ['medical', 'hospital', 'ambulance', 'blood_bank', 'pharmacy'] };
  }
  if (cat === 'emergency') {
    return { $in: ['emergency', 'police', 'fire_station', 'hospital', 'ambulance'] };
  }
  if (cat === 'transport') {
    return { $in: ['transport', 'railway', 'bus_stand'] };
  }
  if (cat === 'railway' || cat === 'railway_station' || cat === 'railway_stations' || cat === 'train_station' || cat === 'train') {
    return { $in: ['railway', 'transport'] };
  }
  if (cat === 'bus_stand' || cat === 'bus_station' || cat === 'bus_terminal') {
    return { $in: ['bus_stand', 'transport'] };
  }
  if (cat === 'water_point' || cat === 'drinking_water' || cat === 'water') {
    return { $in: ['water_point'] };
  }
  return cat;
};

/**
 * Retrieve paginated places with optional category, search, and kumbh filters.
 *
 * @param {object} options
 * @param {number} [options.page=1] - Page number (1-indexed)
 * @param {number} [options.limit=20] - Page size (max 500)
 * @param {string} [options.category] - POI category filter
 * @param {string} [options.search] - Text search query across name, description, tags
 * @param {boolean|string} [options.kumbhRelevant] - Filter by Kumbh Mela relevance
 * @returns {Promise<{ places: Array, total: number, page: number, totalPages: number }>}
 */
export const fetchAllPlaces = async ({ page = 1, limit = 20, category, search, kumbhRelevant } = {}) => {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(500, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (safePage - 1) * safeLimit;

  const filter = {};

  if (category && typeof category === 'string' && category.trim()) {
    const catQuery = buildCategoryFilter(category);
    if (catQuery) {
      filter.category = catQuery;
    }
  }

  if (kumbhRelevant !== undefined) {
    filter.kumbhRelevant = kumbhRelevant === 'true' || kumbhRelevant === true;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const sanitized = escapeRegex(search.trim());
    filter.$or = [
      { name: { $regex: sanitized, $options: 'i' } },
      { description: { $regex: sanitized, $options: 'i' } },
      { tags: { $regex: sanitized, $options: 'i' } },
      { subcategory: { $regex: sanitized, $options: 'i' } },
      { foodType: { $regex: sanitized, $options: 'i' } }
    ];
  }

  const [total, places] = await Promise.all([
    Place.countDocuments(filter),
    Place.find(filter)
      .sort({ importance: -1, createdAt: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
  ]);

  const totalPages = Math.ceil(total / safeLimit) || 1;

  return {
    places,
    total,
    page: safePage,
    totalPages
  };
};

/**
 * Retrieve places within a specified radius from given coordinates, sorted by proximity.
 *
 * @param {object} options
 * @param {number} options.lat - Latitude (-90 to 90)
 * @param {number} options.lng - Longitude (-180 to 180)
 * @param {number} [options.radius=5000] - Search radius in meters
 * @param {string} [options.category] - Optional category filter
 * @param {boolean|string} [options.kumbhRelevant] - Optional Kumbh filter
 * @returns {Promise<Array>} List of nearby places sorted from closest to farthest
 */
export const fetchNearbyPlaces = async ({ lat, lng, radius = 5000, category, kumbhRelevant } = {}) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = parseFloat(radius) || 5000;

  const filter = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parsedLng, parsedLat] // GeoJSON [longitude, latitude]
        },
        $maxDistance: parsedRadius
      }
    }
  };

  if (category && typeof category === 'string' && category.trim()) {
    const catQuery = buildCategoryFilter(category);
    if (catQuery) {
      filter.category = catQuery;
    }
  }

  if (kumbhRelevant !== undefined) {
    filter.kumbhRelevant = kumbhRelevant === 'true' || kumbhRelevant === true;
  }

  const places = await Place.find(filter).lean();
  return places;
};

/**
 * Retrieve a single place by its MongoDB ObjectId.
 *
 * @param {string} id - MongoDB ObjectId string
 * @returns {Promise<object|null>} Place document or null if not found
 */
export const fetchPlaceById = async (id) => {
  const place = await Place.findById(id).lean();
  return place;
};

export default {
  fetchAllPlaces,
  fetchNearbyPlaces,
  fetchPlaceById
};
