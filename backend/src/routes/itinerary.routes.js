import express from 'express';
import mongoose from 'mongoose';
import { createItinerary } from '../controllers/itinerary.controller.js';

const router = express.Router();

/**
 * Validate request body for POST /api/itinerary
 */
export const validateItineraryBody = (req, res, next) => {
  const { days, placeIds, startLocation } = req.body || {};

  // 1. Validate placeIds
  if (!placeIds || !Array.isArray(placeIds)) {
    return res.status(400).json({
      success: false,
      error: "Field 'placeIds' is required and must be a non-empty array of place IDs."
    });
  }

  if (placeIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Field 'placeIds' cannot be empty. Please select at least one place."
    });
  }

  // Check for duplicate place IDs
  const uniqueIds = new Set(placeIds);
  if (uniqueIds.size !== placeIds.length) {
    return res.status(400).json({
      success: false,
      error: "Duplicate place IDs detected in 'placeIds'. Each place can only be selected once."
    });
  }

  // Validate that each place ID is a valid MongoDB ObjectId
  for (let i = 0; i < placeIds.length; i++) {
    const id = placeIds[i];
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: `Invalid place ID format at index ${i}: '${id}'. Must be a 24-character hexadecimal string.`
      });
    }
  }

  // 2. Validate days
  if (days !== undefined && days !== null) {
    const parsedDays = parseInt(days, 10);
    if (isNaN(parsedDays) || parsedDays < 1) {
      return res.status(400).json({
        success: false,
        error: "Field 'days' must be a positive integer greater than or equal to 1."
      });
    }
    if (parsedDays > 7) {
      return res.status(400).json({
        success: false,
        error: "Field 'days' cannot exceed 7 days for a single itinerary."
      });
    }
    if (parsedDays > placeIds.length) {
      return res.status(400).json({
        success: false,
        error: `Field 'days' (${parsedDays}) cannot exceed the number of selected places (${placeIds.length}).`
      });
    }
  }

  // 3. Validate startLocation if provided
  if (startLocation !== undefined && startLocation !== null) {
    if (typeof startLocation !== 'object' || Array.isArray(startLocation)) {
      return res.status(400).json({
        success: false,
        error: "Field 'startLocation' must be an object containing 'latitude' and 'longitude'."
      });
    }

    const lat = startLocation.latitude ?? startLocation.lat;
    const lng = startLocation.longitude ?? startLocation.lng;

    if (lat === undefined || lat === null || lat === '') {
      return res.status(400).json({
        success: false,
        error: "Field 'startLocation.latitude' is required when startLocation is provided."
      });
    }

    const parsedLat = parseFloat(lat);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({
        success: false,
        error: "Field 'startLocation.latitude' must be a valid number between -90 and 90."
      });
    }

    if (lng === undefined || lng === null || lng === '') {
      return res.status(400).json({
        success: false,
        error: "Field 'startLocation.longitude' is required when startLocation is provided."
      });
    }

    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({
        success: false,
        error: "Field 'startLocation.longitude' must be a valid number between -180 and 180."
      });
    }
  }

  next();
};

/**
 * @route   POST /api/itinerary (or / if mounted at /api/itinerary)
 * @desc    Generate optimized multi-day itinerary across selected places
 * @access  Public
 */
router.post(['/', '/itinerary'], validateItineraryBody, createItinerary);

export default router;
