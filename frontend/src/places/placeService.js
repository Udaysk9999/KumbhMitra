import { MOCK_PLACES, PLACE_CATEGORIES } from '../constants/mockPlaces.js';
import {
  normalizePlace,
  searchPlaces as searchPlacesUtil,
  filterPlacesByCategory as filterPlacesUtil
} from './placeUtils.js';

/**
 * Place Service Configuration
 * Set `useApi: true` (or import.meta.env.VITE_USE_API === 'true') when ready to connect to backend REST API.
 */
export const placeServiceConfig = {
  // Single configuration switch: defaults to false to guarantee offline / mock stability
  useApi: import.meta.env?.VITE_USE_API === 'true' || false,
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'
};

// Cache for normalized mock places
const normalizedMockPlaces = MOCK_PLACES.map(normalizePlace);

/**
 * Place Data Service
 * Provides a unified, normalized interface for fetching, searching, and filtering
 * places in Nashik and Trimbakeshwar.
 */
export const placeService = {
  /**
   * Get all active categories
   */
  getCategories() {
    return PLACE_CATEGORIES;
  },

  /**
   * Retrieve all places (from backend API if enabled, otherwise from normalized mock places)
   *
   * @param {object} [options]
   * @param {boolean} [options.forceApi=false] - Force trying API call regardless of default switch
   * @returns {Promise<{ places: Array, source: 'api' | 'mock', error: string | null }>}
   */
  async getPlaces({ forceApi = false } = {}) {
    const shouldFetchApi = forceApi || placeServiceConfig.useApi;

    if (shouldFetchApi) {
      try {
        const response = await fetch(`${placeServiceConfig.apiBaseUrl}/places`, {
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`Places API responded with status ${response.status}`);
        }

        const json = await response.json();
        const rawPlaces = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

        if (rawPlaces.length > 0) {
          const normalizedApiPlaces = rawPlaces.map(normalizePlace).filter(Boolean);
          return {
            places: normalizedApiPlaces,
            source: 'api',
            error: null
          };
        }
      } catch (err) {
        console.warn('[placeService] Backend API unavailable or failed. Falling back to verified mock data.', err.message);
        return {
          places: normalizedMockPlaces,
          source: 'mock',
          error: err.message
        };
      }
    }

    // Default: use clean normalized mock dataset
    return {
      places: normalizedMockPlaces,
      source: 'mock',
      error: null
    };
  },

  /**
   * Synchronous getter returning normalized places directly for instant rendering
   */
  getPlacesSync() {
    return normalizedMockPlaces;
  },

  /**
   * Retrieve a single place by its identifier
   *
   * @param {string} id - Place ID
   * @param {Array} [placesPool] - Optional local pool to search within
   * @returns {Promise<object|null>}
   */
  async getPlaceById(id, placesPool = null) {
    if (!id) return null;

    // First search in local pool if provided
    if (placesPool && Array.isArray(placesPool)) {
      const match = placesPool.find((p) => p.id === id || p._id === id);
      if (match) return normalizePlace(match);
    }

    // Next search in mock dataset
    const mockMatch = normalizedMockPlaces.find((p) => p.id === id);
    if (mockMatch) return mockMatch;

    // If API enabled, attempt to fetch from backend
    if (placeServiceConfig.useApi) {
      try {
        const res = await fetch(`${placeServiceConfig.apiBaseUrl}/places/${id}`);
        if (res.ok) {
          const json = await res.json();
          const raw = json.data || json;
          return normalizePlace(raw);
        }
      } catch (err) {
        console.warn(`[placeService] Failed to fetch place with ID ${id} from API:`, err.message);
      }
    }

    return null;
  },

  /**
   * Search places using the normalized placeUtils engine
   */
  searchPlaces(places, query) {
    return searchPlacesUtil(places, query);
  },

  /**
   * Filter places by category using the normalized placeUtils engine
   */
  filterPlaces(places, categoryId) {
    return filterPlacesUtil(places, categoryId);
  }
};

export default placeService;
