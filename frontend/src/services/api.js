/**
 * Centralized API service for AI KumbhMitra
 * 
 * Provides unified interface for all backend REST endpoints:
 * - GET /api/places (with pagination, category, search, kumbhRelevant)
 * - GET /api/places/:id
 * - GET /api/places/nearby (with lat, lng, radius, category)
 * - POST /api/routes (with origin, destination, mode)
 * - POST /api/ai/chat (with message)
 * - GET /api/health
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
  baseUrl: API_BASE_URL,

  /**
   * Check backend health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed with status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn('[apiService] Health check unavailable:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Retrieve places from backend with optional filters and pagination
   * By default requests limit=500 to fetch all available POIs in database
   */
  async getPlaces({ category = '', search = '', kumbhRelevant = '', page = 1, limit = 500 } = {}) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (page) params.set('page', String(page));
    if (category && category !== 'all') params.set('category', category);
    if (search && search.trim()) params.set('search', search.trim());
    if (kumbhRelevant !== '' && kumbhRelevant != null) params.set('kumbhRelevant', String(kumbhRelevant));

    const url = `${API_BASE_URL}/places?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Places API responded with status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Retrieve place details by unique MongoDB ID
   */
  async getPlaceById(id) {
    if (!id) throw new Error('Place ID is required');
    const response = await fetch(`${API_BASE_URL}/places/${id}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Place lookup failed with status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Search places by text query
   */
  async searchPlaces(query, { category = '', limit = 50 } = {}) {
    return this.getPlaces({ search: query, category, limit });
  },

  /**
   * Find places within a radius from coordinates
   * GET /api/places/nearby?lat=...&lng=...&radius=...&category=...
   */
  async getNearbyPlaces({ lat, lng, radius = 5000, category = '', kumbhRelevant = '' } = {}) {
    if (lat == null || lng == null) {
      throw new Error('Coordinates (lat, lng) are required for nearby search');
    }

    const params = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(radius)
    });

    if (category && category !== 'all') params.set('category', category);
    if (kumbhRelevant !== '' && kumbhRelevant != null) params.set('kumbhRelevant', String(kumbhRelevant));

    const url = `${API_BASE_URL}/places/nearby?${params.toString()}`;
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Nearby places API responded with status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Calculate route between two locations using backend OSRM routing
   * POST /api/routes
   */
  async calculateRoute({ origin, destination, mode = 'driving' }) {
    if (!origin || !destination) {
      throw new Error('Origin and destination are required');
    }

    const originLat = origin.latitude ?? origin.lat;
    const originLng = origin.longitude ?? origin.lng;
    const destLat = destination.latitude ?? destination.lat;
    const destLng = destination.longitude ?? destination.lng;

    if (originLat == null || originLng == null || destLat == null || destLng == null) {
      throw new Error('Valid origin and destination coordinates are required');
    }

    // Convert shuttle or driving modes
    const apiMode = mode === 'walking' ? 'foot' : (mode === 'shuttle' ? 'driving' : mode);

    const response = await fetch(`${API_BASE_URL}/routes`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin: { lat: Number(originLat), lng: Number(originLng) },
        destination: { lat: Number(destLat), lng: Number(destLng) },
        mode: apiMode
      })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Routing API failed with status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Natural-language conversational guidance with AI KumbhMitra
   * POST /api/ai/chat
   */
  async chatWithAI(message) {
    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new Error('Message is required');
    }

    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: message.trim() })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `AI Chat API failed with status ${response.status}`);
    }

    return await response.json();
  }
};

export default apiService;
