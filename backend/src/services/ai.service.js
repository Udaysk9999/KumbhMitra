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
      reply: 'Please ask a question about pilgrimage sites, facilities, or routes in Nashik and Trimbakeshwar.',
      places: [],
      route: null
    };
  }

  const trimmedMessage = message.trim();

  // Retrieve all known places in DB for authoritative entity matching
  const { places: allPlaces } = await fetchAllPlaces({ limit: 100 });

  const provider = getAIProvider();
  const extraction = await provider.extractIntent(trimmedMessage, allPlaces);
  const { intent, category, placeName, origin, destination, radius = 5000, query, mode = 'driving', reason } = extraction;

  let reply = '';
  let resultPlaces = [];
  let resultRoute = null;

  switch (intent) {
    case 'unsupported': {
      resultPlaces = [];
      resultRoute = null;
      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'unsupported',
        context: { reason, query }
      });
      break;
    }

    case 'route': {
      // Check for missing origin or destination
      if (!origin && !destination) {
        reply = 'Please specify both an origin and a destination in Nashik or Trimbakeshwar to calculate a route.';
        break;
      }
      if (!origin) {
        reply = `Please specify an origin location in Nashik or Trimbakeshwar to calculate the route to ${destination}.`;
        break;
      }
      if (!destination) {
        reply = `Please specify a destination to calculate the route from ${origin} (for example: Trimbakeshwar Jyotirlinga Temple).`;
        break;
      }

      // Resolve places against database
      const originPlace = provider.findPlaceMatch(origin, allPlaces);
      const destPlace = provider.findPlaceMatch(destination, allPlaces);

      if (!originPlace || !destPlace) {
        const missing = [];
        if (!originPlace) missing.push(`'${origin}'`);
        if (!destPlace) missing.push(`'${destination}'`);
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

    case 'nearby_places': {
      if (!placeName) {
        reply = 'Please specify a reference location in Nashik or Trimbakeshwar (such as Ram Kund or Kalaram Temple) to find nearby places.';
        break;
      }

      const anchorPlace = provider.findPlaceMatch(placeName, allPlaces);
      if (!anchorPlace) {
        reply = `I could not find '${placeName}' in our verified Nashik and Trimbakeshwar database to search nearby places.`;
        break;
      }

      const nearbyPlaces = await fetchNearbyPlaces({
        lat: anchorPlace.location.coordinates[1],
        lng: anchorPlace.location.coordinates[0],
        radius,
        category: category || undefined
      });

      resultPlaces = nearbyPlaces;

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'nearby_places',
        context: { places: nearbyPlaces, anchorPlace, category }
      });
      break;
    }

    case 'place_info': {
      if (!placeName) {
        reply = 'Please specify the name of the place in Nashik or Trimbakeshwar you would like information about.';
        break;
      }

      const place = provider.findPlaceMatch(placeName, allPlaces);
      if (!place) {
        reply = `I do not have verified information for '${placeName}'. AI KumbhMitra only provides verified information for places in Nashik and Trimbakeshwar.`;
        resultPlaces = [];
        break;
      }

      resultPlaces = [place];

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'place_info',
        context: { place, placeName: place.name }
      });
      break;
    }

    case 'search_places': {
      let searchFilter;
      if (query) {
        const specificWords = query.toLowerCase()
          .replace(/(find|places|in|on|at|show|me|where|are|the|a|an|nashik|trimbakeshwar)/gi, '')
          .trim();
        if (specificWords && specificWords !== category && specificWords !== `${category}s`) {
          searchFilter = specificWords;
        }
      }

      const { places } = await fetchAllPlaces({
        category: category || undefined,
        search: searchFilter,
        limit: 20
      });

      resultPlaces = places;

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'search_places',
        context: { places, category }
      });
      break;
    }

    case 'general_question':
    default: {
      const cleaned = (query || trimmedMessage)
        .replace(/(find|places|in|on|at|show|me|where|are|the|a|an|nashik|trimbakeshwar)/gi, '')
        .trim();

      let places = [];
      if (cleaned) {
        const searchResult = await fetchAllPlaces({ search: cleaned, limit: 10 });
        places = searchResult.places;
      }

      resultPlaces = places;

      reply = await provider.generateResponse({
        message: trimmedMessage,
        intent: 'general_question',
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
