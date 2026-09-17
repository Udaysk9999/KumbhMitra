import mongoose from 'mongoose';
import { VALID_CATEGORIES } from '../models/Place.js';

/**
 * Valid POI Categories as defined in Place schema plus category groups
 */
export const ALLOWED_CATEGORIES = [
  ...VALID_CATEGORIES,
  'accommodation',
  'railway_station',
  'railway_stations',
  'train_station',
  'bus_station',
  'drinking_water'
];

/**
 * Validate query parameters for GET /api/places
 */
export const validatePlacesQuery = (req, res, next) => {
  const { page, limit, category, search } = req.query;

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'page' must be a positive integer greater than or equal to 1."
      });
    }
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'limit' must be a positive integer greater than or equal to 1."
      });
    }
  }

  if (category !== undefined && typeof category === 'string' && category.trim()) {
    const normalized = category.trim().toLowerCase();
    if (!ALLOWED_CATEGORIES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category '${category}'. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}.`
      });
    }
  }

  if (search !== undefined && typeof search !== 'string') {
    return res.status(400).json({
      success: false,
      error: "Query parameter 'search' must be a string."
    });
  }

  next();
};

/**
 * Validate query parameters for GET /api/places/nearby
 */
export const validateNearbyQuery = (req, res, next) => {
  const { lat, lng, radius, category } = req.query;

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
  if (radius !== undefined) {
    const parsedRadius = parseFloat(radius);
    if (isNaN(parsedRadius) || parsedRadius <= 0) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'radius' must be a positive number representing meters."
      });
    }
  }

  // Validate category
  if (category !== undefined && typeof category === 'string' && category.trim()) {
    const normalized = category.trim().toLowerCase();
    if (!ALLOWED_CATEGORIES.includes(normalized)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category '${category}'. Allowed categories: ${ALLOWED_CATEGORIES.join(', ')}.`
      });
    }
  }

  next();
};

/**
 * Validate MongoDB ObjectId route parameter :id
 */
export const validatePlaceId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid place ID format. Must be a 24-character hexadecimal string."
    });
  }

  next();
};

/**
 * Helper to validate coordinate objects { lat, lng }
 */
const validateCoordObject = (coord, label) => {
  if (!coord || typeof coord !== 'object') {
    return `Field '${label}' is required and must be an object with 'lat' and 'lng'.`;
  }

  const { lat, lng } = coord;

  if (lat === undefined || lat === null || lat === '') {
    return `Field '${label}.lat' is required.`;
  }
  const parsedLat = parseFloat(lat);
  if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
    return `Field '${label}.lat' must be a valid latitude between -90 and 90.`;
  }

  if (lng === undefined || lng === null || lng === '') {
    return `Field '${label}.lng' is required.`;
  }
  const parsedLng = parseFloat(lng);
  if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
    return `Field '${label}.lng' must be a valid longitude between -180 and 180.`;
  }

  return null;
};

/**
 * Validate request body for POST /api/routes
 */
export const validateRouteBody = (req, res, next) => {
  const { origin, destination, mode = 'driving' } = req.body || {};

  const originError = validateCoordObject(origin, 'origin');
  if (originError) {
    return res.status(400).json({
      success: false,
      error: originError
    });
  }

  const destError = validateCoordObject(destination, 'destination');
  if (destError) {
    return res.status(400).json({
      success: false,
      error: destError
    });
  }

  const allowedModes = ['driving', 'foot', 'walking'];
  if (typeof mode !== 'string' || !allowedModes.includes(mode.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Invalid mode '${mode}'. Supported modes are 'driving' or 'foot'.`
    });
  }

  next();
};

export default {
  ALLOWED_CATEGORIES,
  validatePlacesQuery,
  validateNearbyQuery,
  validatePlaceId,
  validateRouteBody
};
