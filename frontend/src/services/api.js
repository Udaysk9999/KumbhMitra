/**
 * Centralized API service for AI KumbhMitra
 * 
 * Provides typed interface contracts for backend REST endpoints.
 * In Phase 1 Part 2, these are placeholder hooks ready for backend integration
 * in upcoming phases without requiring refactoring in UI components.
 */

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
   * Future: Retrieve places with optional category & bounding box filters
   */
  async getPlaces(params = {}) {
    console.info('[apiService:placeholder] getPlaces called with params:', params);
    return { data: [], message: 'Backend places API will be connected in database phase.' };
  },

  /**
   * Future: Retrieve place details by unique ID
   */
  async getPlaceById(id) {
    console.info('[apiService:placeholder] getPlaceById called for:', id);
    return { data: null, message: 'Backend place detail API will be connected in database phase.' };
  },

  /**
   * Future: Search places by text query and category
   */
  async searchPlaces(query, category = 'all') {
    console.info('[apiService:placeholder] searchPlaces called with:', { query, category });
    return { results: [], message: 'Backend search API will be connected in database phase.' };
  },

  /**
   * Future: Calculate multi-modal route between coordinates
   */
  async calculateRoute(origin, destination, mode = 'walking') {
    console.info('[apiService:placeholder] calculateRoute called with:', { origin, destination, mode });
    return { route: null, message: 'Routing calculations will be available in the routing phase.' };
  },

  /**
   * Future: Send natural language prompt to AI assistant service
   */
  async askAI(prompt, context = {}) {
    console.info('[apiService:placeholder] askAI called with:', { prompt, context });
    return { reply: null, message: 'AI Assistant API will be connected in the AI phase.' };
  }
};

export default apiService;
