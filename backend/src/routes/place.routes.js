import express from 'express';
import {
  getAllPlaces,
  getNearbyPlaces,
  getPlaceById
} from '../controllers/place.controller.js';
import {
  validatePlacesQuery,
  validateNearbyQuery,
  validatePlaceId
} from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/places/nearby (or /nearby if mounted at /api/places)
 * @desc    Find places within a specified radius from coordinates
 * @access  Public
 * @note    Defined before /:id to prevent "nearby" being treated as an ObjectId parameter
 */
router.get(['/nearby', '/places/nearby'], validateNearbyQuery, getNearbyPlaces);

/**
 * @route   GET /api/places/:id (or /:id if mounted at /api/places)
 * @desc    Get detailed place information by MongoDB ObjectId
 * @access  Public
 */
router.get(['/places/:id', '/:id'], validatePlaceId, getPlaceById);

/**
 * @route   GET /api/places (or / if mounted at /api/places)
 * @desc    Get all places with pagination, category filter, and text search
 * @access  Public
 */
router.get(['/', '/places'], validatePlacesQuery, getAllPlaces);

export default router;
