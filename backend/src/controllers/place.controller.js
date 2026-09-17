import mongoose from 'mongoose';
import Place from '../models/Place.js';

/**
 * Escape special characters in string for safe regular expression querying.
 *
 * @param {string} text
 * @returns {string} Escaped string
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * @desc    Get all places with pagination, optional category filter, and text search
 * @route   GET /api/places
 * @access  Public
 * @query   {number} [page=1] - Current page number
 * @query   {number} [limit=20] - Number of items per page (max 100)
 * @query   {string} [category] - Filter by place category
 * @query   {string} [search] - Case-insensitive text search matching name or description
 */
export const getAllPlaces = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    // Validate page parameter
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'page' must be a positive integer greater than or equal to 1."
      });
    }

    // Validate limit parameter
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'limit' must be a positive integer greater than or equal to 1."
      });
    }

    const safeLimit = Math.min(parsedLimit, 100);
    const skip = (parsedPage - 1) * safeLimit;

    // Build filter query
    const filter = {};

    if (category && typeof category === 'string' && category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    if (search && typeof search === 'string' && search.trim()) {
      const sanitizedSearch = escapeRegex(search.trim());
      filter.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }

    // Query data and total count concurrently
    const [total, places] = await Promise.all([
      Place.countDocuments(filter),
      Place.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean()
    ]);

    const totalPages = Math.ceil(total / safeLimit) || 1;

    return res.status(200).json({
      success: true,
      count: places.length,
      total,
      page: parsedPage,
      totalPages,
      data: places
    });
  } catch (error) {
    console.error('[place.controller:getAllPlaces] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while fetching places.'
    });
  }
};

/**
 * @desc    Find places within a specified radius from geographical coordinates
 * @route   GET /api/places/nearby
 * @access  Public
 * @query   {number} lat - Latitude in degrees (-90 to 90, required)
 * @query   {number} lng - Longitude in degrees (-180 to 180, required)
 * @query   {number} [radius=5000] - Search radius in meters (default: 5000)
 * @query   {string} [category] - Optional category filter
 */
export const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, radius = 5000, category } = req.query;

    // Validate latitude
    if (lat === undefined || lat === null || lat === '') {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'lat' (latitude) is required."
      });
    }

    const parsedLat = parseFloat(lat);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'lat' must be a valid number between -90 and 90."
      });
    }

    // Validate longitude
    if (lng === undefined || lng === null || lng === '') {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'lng' (longitude) is required."
      });
    }

    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'lng' must be a valid number between -180 and 180."
      });
    }

    // Validate radius
    const parsedRadius = parseFloat(radius);
    if (isNaN(parsedRadius) || parsedRadius <= 0) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'radius' must be a positive number representing meters."
      });
    }

    // Build geospatial filter using MongoDB $near on 2dsphere index
    const filter = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLng, parsedLat] // GeoJSON specifies [longitude, latitude]
          },
          $maxDistance: parsedRadius
        }
      }
    };

    if (category && typeof category === 'string' && category.trim()) {
      filter.category = category.trim().toLowerCase();
    }

    // Execute query - MongoDB $near automatically sorts results by distance
    const places = await Place.find(filter).lean();

    return res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });
  } catch (error) {
    console.error('[place.controller:getNearbyPlaces] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while searching nearby places.'
    });
  }
};

/**
 * @desc    Get detailed information for a single place by MongoDB ObjectId
 * @route   GET /api/places/:id
 * @access  Public
 * @param   {string} id - MongoDB ObjectId of the place
 */
export const getPlaceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid place ID format. Must be a 24-character hexadecimal string."
      });
    }

    const place = await Place.findById(id).lean();

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
    console.error('[place.controller:getPlaceById] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while retrieving place.'
    });
  }
};
