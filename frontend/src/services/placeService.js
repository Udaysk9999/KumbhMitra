import { MOCK_PLACES } from '../constants/mockPlaces';

/**
 * Curated categories supported by the Nashik + Trimbakeshwar discovery experience
 */
export const CURATED_CATEGORIES = [
  { id: 'all', label: 'All Places', icon: '📍' },
  { id: 'temple', label: 'Temples', icon: '🛕' },
  { id: 'ghat', label: 'Ghats', icon: '🌊' },
  { id: 'hospital', label: 'Hospitals', icon: '🏥' },
  { id: 'hotel', label: 'Hotels', icon: '🏨' },
  { id: 'shop', label: 'Markets', icon: '🏪', alias: 'market' },
  { id: 'transport', label: 'Transport', icon: '🚌' },
  { id: 'parking', label: 'Parking', icon: '🅿️' }
];

/**
 * Frontend Place Data Service Abstraction
 * Decouples the UI from mock data, preparing for seamless integration
 * with backend REST/GraphQL endpoints once available.
 */
export const placeService = {
  /**
   * Retrieve active category configurations
   */
  getCategories() {
    return CURATED_CATEGORIES;
  },

  /**
   * Fast synchronous initial data getter for zero-flash initial render
   */
  getInitialPlaces() {
    return [...MOCK_PLACES];
  },

  /**
   * Retrieve places with optional category and search query filters
   * Implemented asynchronously to match future REST API signature:
   * GET /api/places?category=...&query=...
   */
  async getPlaces({ category = 'all', query = '' } = {}) {
    let results = [...MOCK_PLACES];

    // Filter by Category
    if (category && category !== 'all') {
      const normalizedCat = category.toLowerCase();
      results = results.filter((p) => {
        const placeCat = (p.category || '').toLowerCase();
        if (placeCat === normalizedCat) return true;
        // Market <-> Shop alias matching
        if ((normalizedCat === 'market' || normalizedCat === 'markets') && placeCat === 'shop') return true;
        if (normalizedCat === 'shop' && placeCat === 'market') return true;
        return false;
      });
    }

    // Filter by Search Query
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      results = results.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const catMatch = (p.categoryLabel || p.category || '').toLowerCase().includes(q);
        const addressMatch = (p.address || '').toLowerCase().includes(q);
        const regionMatch = (p.region || '').toLowerCase().includes(q);
        const tagsMatch = Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q));
        return nameMatch || catMatch || addressMatch || regionMatch || tagsMatch;
      });
    }

    return {
      success: true,
      data: results,
      total: results.length
    };
  },

  /**
   * Retrieve details for a single place by ID
   * GET /api/places/:id
   */
  async getPlaceById(id) {
    const place = MOCK_PLACES.find((p) => p.id === id);
    return {
      success: !!place,
      data: place || null
    };
  }
};

export default placeService;
