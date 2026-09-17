/**
 * Centralized API service for AI KumbhMitra
 * 
 * Provides typed interface contracts for backend REST endpoints.
 * Integrates place discovery and routing services with seamless offline/mock fallbacks.
 */
import placeService from './placeService';
import routeService from './routeService';

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
   * Calculate route between two locations using routeService
   */
  async calculateRoute(origin, destination, mode = 'shuttle') {
    return routeService.calculateRoute({ start: origin, destination, mode });
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
