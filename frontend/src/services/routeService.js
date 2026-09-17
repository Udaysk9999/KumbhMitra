import { generateDemoRoute, normalizeRoute } from '../routes/routeUtils.js';
import apiService from './api.js';

/**
 * Route Service Configuration
 * By default useApi is true to consume real backend routing.
 */
export const routeServiceConfig = {
  useApi: import.meta.env?.VITE_USE_API !== 'false',
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'
};

/**
 * Frontend Route Service
 * Handles routing calculations between points of interest in Nashik and Trimbakeshwar.
 * Calls backend POST /api/routes with graceful fallback to local route simulation if offline.
 */
export const routeService = {
  /**
   * Calculate a route between two places or coordinates
   *
   * @param {object} params
   * @param {object} params.start - Origin place object (must include latitude, longitude)
   * @param {object} params.destination - Destination place object
   * @param {'walking'|'driving'|'shuttle'} [params.mode='shuttle'] - Travel mode
   * @param {boolean} [params.forceApi=false] - Force attempting HTTP backend call
   * @returns {Promise<{ success: boolean, data: object|null, source: 'api'|'mock', error: string|null }>}
   */
  async calculateRoute({ start, destination, mode = 'shuttle', forceApi = false } = {}) {
    if (!start || !destination) {
      return {
        success: false,
        data: null,
        source: 'mock',
        error: 'Please select both an origin and destination location.'
      };
    }

    if (start.id && destination.id && start.id === destination.id) {
      return {
        success: false,
        data: null,
        source: 'mock',
        error: 'Origin and destination must be different locations.'
      };
    }

    const shouldAttemptApi = forceApi || routeServiceConfig.useApi;

    // 1. Attempt Backend Route Calculation (POST /api/routes)
    if (shouldAttemptApi) {
      try {
        const json = await apiService.calculateRoute({
          origin: {
            lat: start.latitude,
            lng: start.longitude
          },
          destination: {
            lat: destination.latitude,
            lng: destination.longitude
          },
          mode
        });

        const rawRoute = json.data || json.route || json;

        if (rawRoute) {
          const normalized = normalizeRoute(
            { ...rawRoute, source: 'api' },
            start,
            destination,
            mode
          );
          return {
            success: true,
            data: normalized,
            source: 'api',
            error: null
          };
        }
      } catch (err) {
        console.warn(
          '[routeService] Backend routing API unreachable or returned error. Falling back to local route visualizer.',
          err.message
        );
      }
    }

    // 2. High-fidelity Local / Demo Route Fallback
    try {
      const demoRoute = generateDemoRoute(start, destination, mode);
      return {
        success: true,
        data: demoRoute,
        source: 'mock',
        error: null
      };
    } catch (err) {
      return {
        success: false,
        data: null,
        source: 'mock',
        error: err.message || 'Unable to compute route between selected points.'
      };
    }
  },

  /**
   * Synchronous demo route generator for instant preview
   */
  calculateRouteSync(start, destination, mode = 'shuttle') {
    try {
      const route = generateDemoRoute(start, destination, mode);
      return { success: true, data: route, source: 'mock', error: null };
    } catch (err) {
      return { success: false, data: null, source: 'mock', error: err.message };
    }
  }
};

export default routeService;
