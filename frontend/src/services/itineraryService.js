import apiService from './api.js';

/**
 * Format minutes into a user-friendly hours and minutes string
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '0 min';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs} hr ${mins} min`;
  if (hrs > 0) return `${hrs} hr`;
  return `${mins} min`;
};

/**
 * Format distance in kilometers
 */
export const formatDistance = (km) => {
  if (km == null) return '0 km';
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${Number(km).toFixed(1)} km`;
};

export const itineraryService = {
  /**
   * Request multi-day itinerary from backend POST /api/itinerary
   */
  async generateItinerary({ days = 1, placeIds = [], startLocation = null }) {
    if (!placeIds || placeIds.length === 0) {
      throw new Error('Please select at least one place for your itinerary.');
    }

    try {
      const response = await apiService.generateItinerary({
        days,
        placeIds,
        startLocation
      });

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate itinerary.');
      }

      return {
        success: true,
        data: response.data,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Unable to create itinerary. Please try again.'
      };
    }
  },

  formatDuration,
  formatDistance
};

export default itineraryService;
