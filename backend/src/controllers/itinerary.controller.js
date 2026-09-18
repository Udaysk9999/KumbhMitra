import { planItinerary } from '../services/itinerary.service.js';

/**
 * @desc    Generate deterministic multi-day itinerary across selected Nashik/Trimbakeshwar POIs
 * @route   POST /api/itinerary
 * @access  Public
 */
export const createItinerary = async (req, res, next) => {
  try {
    const { days = 1, placeIds, startLocation = null } = req.body || {};

    const itineraryResult = await planItinerary({
      days: parseInt(days, 10),
      placeIds,
      startLocation
    });

    return res.status(200).json({
      success: true,
      count: itineraryResult.days.length,
      data: itineraryResult
    });
  } catch (error) {
    // If places not found or missing, status 400 or 404
    if (
      error.message.includes('not found') ||
      error.message.includes('outside the Nashik') ||
      error.message.includes('validation')
    ) {
      error.statusCode = 400;
    }
    next(error);
  }
};

export default {
  createItinerary
};
