import { fetchAllPlaces, fetchNearbyPlaces } from './place.service.js';
import { calculateRoute } from './routing.service.js';
import { getAIProvider } from './ai/provider.js';

/**
 * Process user natural language chat message and return factual information strictly
 * scoped to Nashik and Trimbakeshwar.
 *
 * @param {string} message - User query message
 * @returns {Promise<{ reply: string, places: Array, route: object|null }>}
 */
export const processUserMessage = async (message) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    return {
      reply: 'Please ask a question about places, pilgrimage sites, or routes in Nashik and Trimbakeshwar.',
      places: [],
      route: null
    };
  }

  const trimmedMessage = message.trim();

  // Retrieve all known places in DB for accurate entity matching
  const { places: allPlaces } = await fetchAllPlaces({ limit: 100 });

  const provider = getAIProvider();
  const { intent, entities } = await provider.extractIntent(trimmedMessage, allPlaces);

  let reply = '';
  let resultPlaces = [];
  let resultRoute = null;

  switch (intent) {
    case 'out_of_scope': {
      resultPlaces = [];
      resultRoute = null;
      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'out_of_scope',
        context: { places: [] }
      });
      break;
    }

    case 'route': {
      const { originPlace, destPlace, mode = 'driving', originQuery, destQuery } = entities;

      if (!originPlace || !destPlace) {
        const missing = [];
        if (!originPlace) missing.push(`'${originQuery || 'origin'}'`);
        if (!destPlace) missing.push(`'${destQuery || 'destination'}'`);
        reply = `I could not find ${missing.join(' and ')} in our verified Nashik and Trimbakeshwar database. Route calculations are only available between known locations within Nashik and Trimbakeshwar.`;
        break;
      }

      try {
        const route = await calculateRoute({
          origin: {
            lat: originPlace.location.coordinates[1],
            lng: originPlace.location.coordinates[0]
          },
          destination: {
            lat: destPlace.location.coordinates[1],
            lng: destPlace.location.coordinates[0]
          },
          mode
        });

        resultRoute = {
          origin: {
            name: originPlace.name,
            lat: originPlace.location.coordinates[1],
            lng: originPlace.location.coordinates[0]
          },
          destination: {
            name: destPlace.name,
            lat: destPlace.location.coordinates[1],
            lng: destPlace.location.coordinates[0]
          },
          mode,
          distanceKm: route.distanceKm,
          durationMins: route.durationMins,
          geometry: route.geometry,
          steps: route.steps
        };

        resultPlaces = [originPlace, destPlace];

        reply = await provider.generateResponse({
          message: trimmedMessage,
          intent: 'route',
          context: { route, originPlace, destPlace, mode }
        });
      } catch (err) {
        reply = `Failed to calculate route between ${originPlace.name} and ${destPlace.name}: ${err.message}`;
      }
      break;
    }

    case 'nearby': {
      const { anchorPlace, category, radius = 5000 } = entities;

      if (!anchorPlace) {
        reply = `I could not identify a valid reference location in Nashik or Trimbakeshwar to find nearby places. Please specify a known site like Ram Kund or Kalaram Temple.`;
        break;
      }

      const nearbyPlaces = await fetchNearbyPlaces({
        lat: anchorPlace.location.coordinates[1],
        lng: anchorPlace.location.coordinates[0],
        radius,
        category
      });

      resultPlaces = nearbyPlaces;

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'nearby',
        context: { places: nearbyPlaces, anchorPlace, category }
      });
      break;
    }

    case 'place_info': {
      const { place } = entities;

      if (!place) {
        reply = `I do not have verified information for that location. AI KumbhMitra only provides verified information for places in Nashik and Trimbakeshwar.`;
        break;
      }

      resultPlaces = [place];

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'place_info',
        context: { place }
      });
      break;
    }

    case 'category_search': {
      const { category, query } = entities;

      // Extract specific search sub-terms if any (e.g. "pizza" from "find pizza places")
      let searchFilter;
      if (query) {
        const specificWords = query.toLowerCase()
          .replace(/(find|places|in|on|at|show|me|where|are|the|a|an|nashik|trimbakeshwar)/gi, '')
          .trim();
        if (specificWords && specificWords !== category && specificWords !== `${category}s`) {
          searchFilter = specificWords;
        }
      }

      const { places } = await fetchAllPlaces({ category, search: searchFilter, limit: 20 });

      resultPlaces = places;

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'category_search',
        context: { places, category }
      });
      break;
    }

    case 'general_search':
    default: {
      const { query } = entities;
      const cleaned = query.replace(/(find|places|in|on|at|show|me|where|are|the|a|an|nashik|trimbakeshwar)/gi, '').trim();

      let places = [];
      if (cleaned) {
        const searchResult = await fetchAllPlaces({ search: cleaned, limit: 10 });
        places = searchResult.places;
      }

      resultPlaces = places;

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'general_search',
        context: { places }
      });
      break;
    }
  }

  return {
    reply,
    places: resultPlaces,
    route: resultRoute
  };
};

export default {
  processUserMessage
};
