import { MOCK_PLACES } from '../constants/mockPlaces.js';
import {
  CATEGORY_DEFINITIONS,
  FILTER_GROUPS,
  normalizePlace,
  searchPlaces as searchPlacesUtil,
  filterPlacesByCategory as filterPlacesUtil
} from './placeUtils.js';
import apiService from '../services/api.js';

/**
 * Place Service Configuration
 * By default useApi is true to consume real backend endpoints.
 */
export const placeServiceConfig = {
  useApi: import.meta.env?.VITE_USE_API !== 'false',
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'
};

// Cache for normalized mock places (fallback only if backend unavailable)
const normalizedMockPlaces = MOCK_PLACES.map(normalizePlace);

/**
 * Place Data Service
 * Provides a unified interface for fetching, searching, and filtering
 * real database places across Nashik and Trimbakeshwar.
 */
export const placeService = {
  /**
   * Get all category filter groups
   */
  getCategories() {
    return FILTER_GROUPS;
  },

  /**
   * Retrieve all places from real backend API (with fallback if offline)
   * Requests limit=500 to fetch all 130 database POIs.
   */
  async getPlaces({ category = '', search = '', limit = 500, forceApi = false } = {}) {
    const shouldFetchApi = forceApi || placeServiceConfig.useApi;

    if (shouldFetchApi) {
      try {
        const json = await apiService.getPlaces({
          category,
          search,
          limit
        });

        const rawPlaces = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : null);

        if (rawPlaces !== null) {
          const normalizedApiPlaces = rawPlaces.map(normalizePlace).filter(Boolean);
          return {
            places: normalizedApiPlaces,
            count: normalizedApiPlaces.length,
            total: typeof json.total === 'number' ? json.total : normalizedApiPlaces.length,
            source: 'api',
            error: null
          };
        }
      } catch (err) {
        console.warn('[placeService] Backend API unavailable or error. Using fallback dataset.', err.message);
        return {
          places: normalizedMockPlaces,
          count: normalizedMockPlaces.length,
          total: normalizedMockPlaces.length,
          source: 'mock',
          error: err.message
        };
      }
    }

    // Fallback if offline
    return {
      places: normalizedMockPlaces,
      count: normalizedMockPlaces.length,
      total: normalizedMockPlaces.length,
      source: 'mock',
      error: null
    };
  },

  /**
   * Find places nearby given coordinates
   */
  async getNearbyPlaces({ lat, lng, radius = 5000, category = '' } = {}) {
    try {
      const json = await apiService.getNearbyPlaces({ lat, lng, radius, category });
      const rawPlaces = Array.isArray(json.data) ? json.data : [];
      const normalized = rawPlaces.map(normalizePlace).filter(Boolean);
      return {
        places: normalized,
        count: normalized.length,
        source: 'api',
        error: null
      };
    } catch (err) {
      console.warn('[placeService] Nearby API failed:', err.message);
      return {
        places: [],
        count: 0,
        source: 'mock',
        error: err.message
      };
    }
  },

  /**
   * Synchronous getter for initial render
   */
  getPlacesSync() {
    return normalizedMockPlaces;
  },

  /**
   * Retrieve a single place by ID from backend (GET /api/places/:id)
   */
  async getPlaceById(id, placesPool = null) {
    if (!id) return null;

    // 1. Fetch latest details from backend
    if (placeServiceConfig.useApi) {
      try {
        const json = await apiService.getPlaceById(id);
        const raw = json.data || json;
        if (raw) return normalizePlace(raw);
      } catch (err) {
        console.warn(`[placeService] Failed to fetch place with ID ${id}:`, err.message);
      }
    }

    // 2. Search in current in-memory pool if offline or backend failed
    if (placesPool && Array.isArray(placesPool)) {
      const match = placesPool.find((p) => p.id === id || p._id === id);
      if (match) return normalizePlace(match);
    }

    const mockMatch = normalizedMockPlaces.find((p) => p.id === id);
    if (mockMatch) return mockMatch;

    return null;
  },

  /**
   * Search places using the normalized search utility
   */
  searchPlaces(places, query) {
    return searchPlacesUtil(places, query);
  },

  /**
   * Filter places by category
   */
  filterPlaces(places, categoryId) {
    return filterPlacesUtil(places, categoryId);
  }
};

export default placeService;
