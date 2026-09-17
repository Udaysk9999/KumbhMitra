/**
 * AI Provider Abstraction Layer for AI KumbhMitra
 *
 * Provides an extensible interface for natural language understanding and response generation.
 * Supports Google Gemini API (GEMINI_API_KEY) with a deterministic RuleBasedAIProvider fallback.
 */

/**
 * Common out-of-scope geographic locations outside Nashik and Trimbakeshwar
 */
const OUT_OF_SCOPE_LOCATIONS = [
  'mars',
  'moon',
  'jupiter',
  'venus',
  'saturn',
  'mumbai',
  'pune',
  'delhi',
  'bangalore',
  'bengaluru',
  'hyderabad',
  'kolkata',
  'chennai',
  'goa',
  'london',
  'paris',
  'new york',
  'tokyo',
  'usa',
  'america',
  'europe'
];

/**
 * Category keywords for Nashik/Trimbakeshwar POIs
 */
const CATEGORY_KEYWORDS = {
  temple: ['temple', 'mandir', 'jyotirlinga', 'darshan', 'shrine'],
  ghat: ['ghat', 'riverbank', 'snan ghat'],
  hospital: ['hospital', 'clinic', 'medical', 'doctor', 'ambulance', 'health center'],
  parking: ['parking', 'park vehicle', 'car park'],
  restaurant: ['restaurant', 'food', 'thali', 'meals', 'dining', 'snack', 'cafe', 'pizza', 'burger'],
  hotel: ['hotel', 'lodge', 'dharamshala', 'stay', 'accommodation'],
  police: ['police', 'chowki', 'police station', 'security post'],
  transport: ['bus stand', 'cbs', 'transport', 'railway', 'bus depot'],
  water_point: ['drinking water', 'water point', 'water station', 'ro water', 'tap'],
  help_center: ['help center', 'information booth', 'enquiry', 'assistance desk'],
  toilet: ['toilet', 'washroom', 'restroom']
};

/**
 * Base AI Provider interface
 */
export class AIProvider {
  async extractIntent(message, knownPlaces = []) {
    throw new Error('extractIntent must be implemented by provider');
  }

  async generateResponse(params) {
    throw new Error('generateResponse must be implemented by provider');
  }
}

/**
 * Rule-Based Provider: Fast, offline, deterministic intent parser and factual response builder
 */
export class RuleBasedAIProvider extends AIProvider {
  /**
   * Check if query targets locations outside Nashik and Trimbakeshwar
   */
  isOutOfScope(text) {
    const lower = text.toLowerCase();
    for (const loc of OUT_OF_SCOPE_LOCATIONS) {
      const regex = new RegExp(`\\b${loc}\\b`, 'i');
      if (regex.test(lower)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find matching place from known places list
   */
  findPlaceMatch(text, knownPlaces = []) {
    const lower = text.toLowerCase();

    for (const place of knownPlaces) {
      const placeNameLower = place.name.toLowerCase();
      if (lower.includes(placeNameLower)) {
        return place;
      }
      if (placeNameLower.includes('ram kund') && (lower.includes('ram kund') || lower.includes('ramkund'))) {
        return place;
      }
      if (placeNameLower.includes('kalaram') && lower.includes('kalaram')) {
        return place;
      }
      if (placeNameLower.includes('trimbakeshwar') && lower.includes('trimbakeshwar')) {
        return place;
      }
      if (placeNameLower.includes('tapovan') && lower.includes('tapovan')) {
        return place;
      }
      if (placeNameLower.includes('civil hospital') && lower.includes('civil hospital')) {
        return place;
      }
      if (placeNameLower.includes('cbs') && lower.includes('cbs')) {
        return place;
      }
    }
    return null;
  }

  /**
   * Detect category keyword in text, ignoring anchor place name
   */
  detectCategory(text, excludeText = '') {
    let cleanText = text.toLowerCase();
    if (excludeText) {
      cleanText = cleanText.replace(excludeText.toLowerCase(), '');
    }

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}s?\\b`, 'i');
        if (regex.test(cleanText)) {
          return category;
        }
      }
    }
    return null;
  }

  async extractIntent(message, knownPlaces = []) {
    const text = message.trim();
    const lower = text.toLowerCase();

    // 1. Check for explicit out-of-scope locations
    if (this.isOutOfScope(text)) {
      return {
        intent: 'out_of_scope',
        entities: { query: text }
      };
    }

    // 2. Route Intent: "route from X to Y", "how to go from X to Y", "directions from X to Y"
    const routeRegex = /(?:route|directions?|way|navigate|how\s+to\s+go|drive|walk)\s+(?:from\s+)?(.+?)\s+(?:to|towards?)\s+(.+)/i;
    const routeMatch = text.match(routeRegex);
    if (routeMatch) {
      const originQuery = routeMatch[1].trim();
      const destQuery = routeMatch[2].trim();

      const originPlace = this.findPlaceMatch(originQuery, knownPlaces);
      const destPlace = this.findPlaceMatch(destQuery, knownPlaces);

      return {
        intent: 'route',
        entities: {
          originQuery,
          destQuery,
          originPlace,
          destPlace,
          mode: lower.includes('walk') || lower.includes('foot') ? 'foot' : 'driving'
        }
      };
    }

    // 3. Nearby Intent: "places near X", "what is near X", "around X", "close to X"
    const nearbyRegex = /(?:near|around|close\s+to|nearby)\s+(.+)/i;
    const nearbyMatch = text.match(nearbyRegex);
    if (nearbyMatch || lower.includes('near') || lower.includes('nearby') || lower.includes('around')) {
      const anchorQuery = nearbyMatch ? nearbyMatch[1].replace(/[?.,!]/g, '').trim() : '';
      const anchorPlace = this.findPlaceMatch(anchorQuery || text, knownPlaces);
      const category = this.detectCategory(text, anchorPlace ? anchorPlace.name : anchorQuery);

      return {
        intent: 'nearby',
        entities: {
          anchorQuery,
          anchorPlace,
          category,
          radius: 5000
        }
      };
    }

    // 4. Place Info Intent: "tell me about X", "what is X", "information about X"
    const infoRegex = /(?:tell\s+me\s+about|information\s+(?:on|about)|info\s+(?:on|about)|details\s+(?:of|about|on)|what\s+is|when\s+does)\s+(.+)/i;
    const infoMatch = text.match(infoRegex);
    if (infoMatch) {
      const targetQuery = infoMatch[1].replace(/[?.,!]/g, '').trim();
      const place = this.findPlaceMatch(targetQuery, knownPlaces);
      return {
        intent: 'place_info',
        entities: {
          targetQuery,
          place
        }
      };
    }

    // Direct place mention without category keyword
    const directPlace = this.findPlaceMatch(text, knownPlaces);
    if (directPlace && !this.detectCategory(text, directPlace.name)) {
      return {
        intent: 'place_info',
        entities: {
          targetQuery: directPlace.name,
          place: directPlace
        }
      };
    }

    // 5. Category Search Intent
    const detectedCategory = this.detectCategory(text);
    if (detectedCategory) {
      return {
        intent: 'category_search',
        entities: {
          category: detectedCategory,
          query: text
        }
      };
    }

    // 6. General Search
    return {
      intent: 'general_search',
      entities: {
        query: text
      }
    };
  }

  async generateResponse({ message, intent, context = {} }) {
    switch (intent) {
      case 'route': {
        const { route, originPlace, destPlace, mode } = context;
        if (!route) {
          return `I could not calculate a route for your request. Please ensure both locations are verified sites in Nashik or Trimbakeshwar.`;
        }
        const modeLabel = mode === 'foot' ? 'walking' : 'driving';
        return `The estimated ${modeLabel} distance from ${originPlace.name} to ${destPlace.name} is ${route.distanceKm} km (approx. ${route.durationMins} minutes). Turn-by-turn route steps are provided below.`;
      }

      case 'nearby': {
        const { places, anchorPlace, category } = context;
        if (!anchorPlace) {
          return `I could not find the reference location in Nashik or Trimbakeshwar to search nearby places.`;
        }
        if (!places || places.length === 0) {
          return `No verified ${category ? category + ' ' : ''}places were found within 5 km of ${anchorPlace.name} in Nashik/Trimbakeshwar.`;
        }
        const categoryNote = category ? ` (${category})` : '';
        const names = places.slice(0, 5).map((p) => p.name).join(', ');
        return `Here are places${categoryNote} near ${anchorPlace.name}: ${names}.`;
      }

      case 'place_info': {
        const { place } = context;
        if (!place) {
          return `I could not find verified information for that location in Nashik or Trimbakeshwar.`;
        }
        const hours = place.openingHours?.open && place.openingHours?.close
          ? `Opening hours: ${place.openingHours.open} - ${place.openingHours.close}.`
          : '';
        const address = place.address ? `Address: ${place.address}.` : '';
        const services = place.services?.length ? `Key services: ${place.services.join(', ')}.` : '';
        return `${place.name} (${place.category.toUpperCase()}) located in Nashik/Trimbakeshwar. ${place.description || ''} ${address} ${hours} ${services}`.trim();
      }

      case 'category_search': {
        const { places, category } = context;
        if (!places || places.length === 0) {
          return `No verified ${category} locations found in Nashik or Trimbakeshwar matching your request.`;
        }
        const names = places.map((p) => p.name).join(', ');
        return `Found ${places.length} ${category} location(s) in Nashik and Trimbakeshwar: ${names}.`;
      }

      case 'out_of_scope':
      case 'general_search':
      default: {
        const { places } = context;
        if (!places || places.length === 0) {
          return `I could not find any verified locations matching your query in Nashik or Trimbakeshwar. AI KumbhMitra strictly covers verified pilgrimage locations and services in the Nashik and Trimbakeshwar region.`;
        }
        const names = places.map((p) => p.name).join(', ');
        return `Found ${places.length} matching place(s) in Nashik and Trimbakeshwar: ${names}.`;
      }
    }
  }
}

/**
 * Gemini AI Provider
 * Connects to Google Gemini API when GEMINI_API_KEY is configured.
 */
export class GeminiAIProvider extends RuleBasedAIProvider {
  constructor(apiKey) {
    super();
    this.apiKey = apiKey;
    this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  }

  async generateResponse(params) {
    try {
      const { message, intent, context = {} } = params;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const systemPrompt = `You are AI KumbhMitra, a helpful, factual pilgrimage assistant for Kumbh Mela 2027 in Nashik and Trimbakeshwar, Maharashtra, India.
IMPORTANT INSTRUCTIONS:
- You ONLY provide verified information for Nashik and Trimbakeshwar.
- NEVER fabricate places, routes, addresses, or services outside of provided database context.
- If information does not exist in context, explicitly state that it is unavailable in Nashik and Trimbakeshwar.
- Context data: ${JSON.stringify(context)}
- User Intent: ${intent}`;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nUser Question: ${message}\n\nPlease respond concisely and factually:` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 250
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText && generatedText.trim()) {
        return generatedText.trim();
      }

      // Fall back to rule-based if empty response
      return super.generateResponse(params);
    } catch (error) {
      console.warn('[GeminiAIProvider] Fallback to RuleBasedAIProvider:', error.message);
      return super.generateResponse(params);
    }
  }
}

/**
 * Factory to get active AI provider based on environment configuration
 */
export const getAIProvider = () => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;

  if (geminiKey && geminiKey.trim()) {
    return new GeminiAIProvider(geminiKey.trim());
  }

  return new RuleBasedAIProvider();
};

export default {
  AIProvider,
  RuleBasedAIProvider,
  GeminiAIProvider,
  getAIProvider
};
