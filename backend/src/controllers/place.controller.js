import {
  fetchAllPlaces,
  fetchNearbyPlaces,
  fetchPlaceById
} from '../services/place.service.js';

/**
 * @desc    Get all places with pagination, optional category filter, and text search
 * @route   GET /api/places
 * @access  Public
 */
export const getAllPlaces = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    const result = await fetchAllPlaces({
      page,
      limit,
      category,
      search
    });

    return res.status(200).json({
      success: true,
      count: result.places.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.places
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Find places within a specified radius from geographical coordinates
 * @route   GET /api/places/nearby
 * @access  Public
 */
export const getNearbyPlaces = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000, category } = req.query;

    const places = await fetchNearbyPlaces({
      lat,
      lng,
      radius,
      category
    });

    return res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed information for a single place by MongoDB ObjectId
 * @route   GET /api/places/:id
 * @access  Public
 */
export const getPlaceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const place = await fetchPlaceById(id);

    if (!place) {
      return res.status(404).json({
        success: false,
        error: `Place not found with ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      count: 1,
      data: place
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getAllPlaces,
  getNearbyPlaces,
  getPlaceById
};
