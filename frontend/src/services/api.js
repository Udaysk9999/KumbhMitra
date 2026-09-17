/**
 * Centralized API service for AI KumbhMitra
 * 
 * Provides typed interface contracts for backend REST endpoints.
 * In Phase 2 Part 3, delegates to placeService abstraction which handles
 * local data now and backend HTTP fetch once MongoDB/Express APIs are live.
 */
import placeService from './placeService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const apiService = {
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
   * Retrieve places with category and search filters
   */
  async getPlaces(params = {}) {
    return placeService.getPlaces(params);
  },

  /**
   * Retrieve place details by unique ID
   */
  async getPlaceById(id) {
    return placeService.getPlaceById(id);
  },

  /**
   * Search places by text query and category
   */
  async searchPlaces(query, category = 'all') {
    return placeService.getPlaces({ query, category });
  },

  /**
   * Placeholder: Route planning (Phase 2 future)
   */
  async calculateRoute(origin, destination, mode = 'walking') {
    console.info('[apiService:placeholder] calculateRoute called with:', { origin, destination, mode });
    return { route: null, message: 'Routing calculations will be available in the routing phase.' };
  },

  /**
   * Placeholder: AI Assistant prompt (Phase 2 future)
   */
  async askAI(prompt, context = {}) {
    console.info('[apiService:placeholder] askAI called with:', { prompt, context });
    return { reply: null, message: 'AI Assistant API will be connected in the AI phase.' };
  }
};

export default apiService;
