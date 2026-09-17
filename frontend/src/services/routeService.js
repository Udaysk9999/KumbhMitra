import { generateDemoRoute, normalizeRoute } from '../routes/routeUtils.js';

/**
 * Route Service Configuration
 * Set `VITE_USE_ROUTE_API=true` or `VITE_USE_API=true` in frontend/.env when backend routing is ready.
 */
export const routeServiceConfig = {
  useApi: import.meta.env?.VITE_USE_ROUTE_API === 'true' || import.meta.env?.VITE_USE_API === 'true' || false,
  apiBaseUrl: import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'
};

/**
 * Frontend Route Service Abstraction
 * Handles routing calculations between points of interest in Nashik and Trimbakeshwar.
 * Calls backend routing endpoints when enabled, and falls back seamlessly to high-fidelity
 * local GIS route interpolation so the UI remains fully interactive without a backend.
 */
export const routeService = {
  /**
   * Calculate a route between two places or coordinates
   *
   * @param {object} params
   * @param {object} params.start - Origin place object (must include latitude, longitude, and name/id)
   * @param {object} params.destination - Destination place object
   * @param {'walking'|'driving'|'shuttle'} [params.mode='shuttle'] - Travel mode
   * @param {boolean} [params.forceApi=false] - Force attempting HTTP backend call
   * @returns {Promise<{ success: boolean, data: object|null, source: 'api'|'mock', error: string|null }>}
   */
  async calculateRoute({ start, destination, mode = 'shuttle', forceApi = false } = {}) {
    // Basic Input Validations
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

    // 1. Attempt Backend Route Calculation if configured
    if (shouldAttemptApi) {
      try {
        const queryParams = new URLSearchParams({
          originLat: String(start.latitude),
          originLng: String(start.longitude),
          originId: String(start.id || ''),
          destLat: String(destination.latitude),
          destLng: String(destination.longitude),
          destId: String(destination.id || ''),
          mode
        });

        const response = await fetch(`${routeServiceConfig.apiBaseUrl}/routes?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Routing API responded with HTTP status ${response.status}`);
        }

        const json = await response.json();
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
        // Fall through to local simulation fallback
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
   * Synchronous demo route generator for instant local preview
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
