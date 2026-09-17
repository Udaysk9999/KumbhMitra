/**
 * OSRM Routing Service for AI KumbhMitra
 * Calculates road geometries and estimated travel times between Nashik/Trimbakeshwar locations.
 */

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || 'http://router.project-osrm.org/route/v1';

/**
 * Generate human-readable instruction string from an OSRM step maneuver.
 *
 * @param {object} step - OSRM step object
 * @returns {string} Human-friendly instruction
 */
const formatStepInstruction = (step) => {
  const maneuver = step.maneuver || {};
  const type = maneuver.type || '';
  const modifier = maneuver.modifier || '';
  const name = step.name ? `onto ${step.name}` : (step.ref ? `onto ${step.ref}` : '');

  switch (type) {
    case 'depart':
      return step.name ? `Depart on ${step.name}` : 'Depart towards destination';
    case 'arrive':
      return 'Arrive at destination';
    case 'turn':
    case 'end of road':
      return `Turn ${modifier} ${name}`.trim();
    case 'continue':
      return `Continue straight ${name}`.trim();
    case 'roundabout':
    case 'rotary':
      return `Enter roundabout and take exit ${name}`.trim();
    case 'fork':
      return `Take ${modifier} fork ${name}`.trim();
    case 'merge':
      return `Merge ${modifier} ${name}`.trim();
    case 'ramp':
      return `Take ramp ${name}`.trim();
    default:
      if (modifier) {
        return `${modifier.charAt(0).toUpperCase() + modifier.slice(1)} ${name}`.trim();
      }
      return `${type.charAt(0).toUpperCase() + type.slice(1)} ${name}`.trim() || 'Continue';
  }
};

/**
 * Calculate route between two geographical coordinates using OSRM public engine.
 *
 * @param {object} params
 * @param {object} params.origin - { lat: Number, lng: Number }
 * @param {object} params.destination - { lat: Number, lng: Number }
 * @param {string} [params.mode='driving'] - 'driving' or 'foot'
 * @returns {Promise<{ distanceKm: number, durationMins: number, geometry: object, steps: Array }>}
 */
export const calculateRoute = async ({ origin, destination, mode = 'driving' }) => {
  // Normalize mode: accept 'driving' or 'foot' (also map 'walking' to 'foot')
  const normalizedMode = mode === 'walking' || mode === 'foot' ? 'foot' : 'driving';

  // Format coordinates as [lng,lat] according to OSRM specification
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_BASE_URL}/${normalizedMode}/${coordinates}?overview=full&geometries=geojson&steps=true`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AI-KumbhMitra-Backend/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OSRM service responded with HTTP status ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      const errorMsg = data.message || `No route found for specified points (OSRM code: ${data.code})`;
      throw new Error(errorMsg);
    }

    const route = data.routes[0];

    // distance in meters -> distanceKm rounded to 1 decimal place
    const distanceKm = Math.round((route.distance / 1000) * 10) / 10;

    // duration in seconds -> durationMins rounded to nearest integer
    const durationMins = Math.round(route.duration / 60);

    // geometry GeoJSON LineString
    const geometry = route.geometry;

    // Turn-by-turn instruction summary list
    const steps = (route.legs || []).flatMap((leg) =>
      (leg.steps || []).map((step) => ({
        instruction: formatStepInstruction(step),
        distanceMeters: Math.round(step.distance),
        durationSeconds: Math.round(step.duration),
        name: step.name || step.ref || '',
        mode: step.mode || normalizedMode,
        maneuver: step.maneuver || {}
      }))
    );

    return {
      distanceKm,
      durationMins,
      geometry,
      steps
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('OSRM routing request timed out after 12 seconds');
    }
    throw error;
  }
};

export default {
  calculateRoute
};
