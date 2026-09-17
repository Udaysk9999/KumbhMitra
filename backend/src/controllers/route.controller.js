import { calculateRoute } from '../services/routing.service.js';

/**
 * @desc    Calculate route between origin and destination coordinates
 * @route   POST /api/routes
 * @access  Public
 */
export const createRoute = async (req, res, next) => {
  try {
    const { origin, destination, mode = 'driving' } = req.body || {};

    const selectedMode = mode.toLowerCase() === 'walking' ? 'foot' : mode.toLowerCase();

    // Compute route via OSRM service
    const routeResult = await calculateRoute({
      origin: {
        lat: parseFloat(origin.lat),
        lng: parseFloat(origin.lng)
      },
      destination: {
        lat: parseFloat(destination.lat),
        lng: parseFloat(destination.lng)
      },
      mode: selectedMode
    });

    return res.status(200).json({
      success: true,
      data: {
        origin: {
          lat: parseFloat(origin.lat),
          lng: parseFloat(origin.lng)
        },
        destination: {
          lat: parseFloat(destination.lat),
          lng: parseFloat(destination.lng)
        },
        mode: selectedMode,
        distanceKm: routeResult.distanceKm,
        durationMins: routeResult.durationMins,
        geometry: routeResult.geometry,
        steps: routeResult.steps
      }
    });
  } catch (error) {
    const isClientError = error.message.includes('No route found') || error.message.includes('Invalid');
    if (isClientError) {
      error.statusCode = 422;
    } else if (error.message.includes('timed out') || error.message.includes('OSRM service responded')) {
      error.statusCode = 502;
    }
    next(error);
  }
};

export default {
  createRoute
};
