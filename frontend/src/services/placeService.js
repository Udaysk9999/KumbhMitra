import { placeService as placesService } from '../places/placeService.js';
import { FILTER_GROUPS, CATEGORY_DEFINITIONS } from '../places/placeUtils.js';

export const CURATED_CATEGORIES = [
  { id: 'all', label: 'All Places', icon: '📍' },
  { id: 'temple', label: 'Temples', icon: '🛕' },
  { id: 'ghat', label: 'Ghats', icon: '🌊' },
  { id: 'fort', label: 'Forts', icon: '🏰' },
  { id: 'hospital', label: 'Hospitals', icon: '🏥' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'tourist_spot', label: 'Attractions', icon: '📍' },
  { id: 'parking', label: 'Parking', icon: '🅿️' }
];

export const placeService = {
  getCategories() {
    return FILTER_GROUPS;
  },
  getInitialPlaces() {
    return placesService.getPlacesSync();
  },
  async getPlaces(params = {}) {
    const result = await placesService.getPlaces(params);
    return {
      success: !result.error,
      data: result.places,
      total: result.total || result.places.length,
      error: result.error
    };
  },
  async getPlaceById(id) {
    const place = await placesService.getPlaceById(id);
    return {
      success: !!place,
      data: place || null
    };
  },
  async getNearbyPlaces(params = {}) {
    return placesService.getNearbyPlaces(params);
  }
};

export default placeService;
