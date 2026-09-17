/**
 * AI Provider Abstraction Layer for AI KumbhMitra
 *
 * Provides structured intent extraction and response generation with Google Gemini integration
 * and a deterministic RuleBasedAIProvider fallback.
 *
 * Strictly scoped to Nashik and Trimbakeshwar, Maharashtra, India.
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
  'europe',
  'atlantis',
  'hogwarts',
  'narnia'
];

/**
 * Keywords indicating prompt injection or fabrication requests
 */
const FABRICATION_KEYWORDS = [
  'invent',
  'fabricate',
  'make up',
  'create a fictional',
  'fake place',
  'fictional place',
  'hallucinate',
  'pretend there is',
  'imagine a temple',
  'magical powers',
  'mythical temple'
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
  isFabricationRequest(text) {
    const lower = text.toLowerCase();
    return FABRICATION_KEYWORDS.some((kw) => lower.includes(kw));
  }

  isOutOfScope(text) {
    const lower = text.toLowerCase();
    return OUT_OF_SCOPE_LOCATIONS.some((loc) => {
      const regex = new RegExp(`\\b${loc}\\b`, 'i');
      return regex.test(lower);
    });
  }

  findPlaceMatch(text, knownPlaces = []) {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase().trim();

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

    // 1. Fabrication protection
    if (this.isFabricationRequest(text)) {
      return {
        intent: 'unsupported',
        category: null,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: text,
        reason: 'fabrication_request'
      };
    }

    // 2. Out-of-scope check
    if (this.isOutOfScope(text)) {
      return {
        intent: 'unsupported',
        category: null,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: text,
        reason: 'out_of_scope'
      };
    }

    // 3. Route Intent
    const isRoutePrompt = /(?:route|directions?|way|navigate|how\s+to\s+go|drive|walk)\b/i.test(text);
    if (isRoutePrompt) {
      // Check for "from X to Y"
      const fromToMatch = text.match(/(?:from)\s+([^,]+?)\s+(?:to|towards)\s+([^,?.!]+)/i);
      if (fromToMatch) {
        return {
          intent: 'route',
          category: null,
          placeName: null,
          origin: fromToMatch[1].trim(),
          destination: fromToMatch[2].trim(),
          radius: 5000,
          query: text,
          mode: lower.includes('walk') || lower.includes('foot') ? 'foot' : 'driving'
        };
      }

      // Check for "route from X" (missing destination)
      const fromMatch = text.match(/(?:from)\s+([^,?.!]+)/i);
      if (fromMatch && !/(?:to|towards)\s+/i.test(text)) {
        return {
          intent: 'route',
          category: null,
          placeName: null,
          origin: fromMatch[1].trim(),
          destination: null,
          radius: 5000,
          query: text,
          mode: lower.includes('walk') || lower.includes('foot') ? 'foot' : 'driving'
        };
      }

      // Check for "route to Y" (missing origin)
      const toMatch = text.match(/(?:to|towards)\s+([^,?.!]+)/i);
      if (toMatch && !/(?:from)\s+/i.test(text)) {
        return {
          intent: 'route',
          category: null,
          placeName: null,
          origin: null,
          destination: toMatch[1].trim(),
          radius: 5000,
          query: text,
          mode: lower.includes('walk') || lower.includes('foot') ? 'foot' : 'driving'
        };
      }

      // Route with generic query
      return {
        intent: 'route',
        category: null,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

    // 4. Nearby Intent
    const isNearbyPrompt = /(?:near|around|close\s+to|nearby)\b/i.test(text);
    if (isNearbyPrompt) {
      const anchorMatch = text.match(/(?:near|around|close\s+to|nearby)\s+([^,?.!]+)/i);
      let anchorName = anchorMatch ? anchorMatch[1].trim() : null;

      const matchedPlace = anchorName ? this.findPlaceMatch(anchorName, knownPlaces) : null;
      const category = this.detectCategory(text, matchedPlace ? matchedPlace.name : (anchorName || ''));

      return {
        intent: 'nearby_places',
        category,
        placeName: matchedPlace ? matchedPlace.name : anchorName,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

    // 5. Place Info Intent
    const infoMatch = text.match(/(?:tell\s+me\s+about|information\s+(?:on|about)|info\s+(?:on|about)|details\s+(?:of|about|on)|what\s+is|where\s+is|when\s+does)\s+([^,?.!]+)/i);
    if (infoMatch) {
      const targetQuery = infoMatch[1].trim();
      const place = this.findPlaceMatch(targetQuery, knownPlaces);
      return {
        intent: 'place_info',
        category: null,
        placeName: place ? place.name : targetQuery,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

    // Direct place name match without category keywords
    const directPlace = this.findPlaceMatch(text, knownPlaces);
    if (directPlace && !this.detectCategory(text, directPlace.name)) {
      return {
        intent: 'place_info',
        category: null,
        placeName: directPlace.name,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

    // 6. Search Places Intent
    const detectedCategory = this.detectCategory(text);
    if (detectedCategory) {
      return {
        intent: 'search_places',
        category: detectedCategory,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

    // 7. General Question or Unsupported
    return {
      intent: 'general_question',
      category: null,
      placeName: null,
      origin: null,
      destination: null,
      radius: 5000,
      query: text
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

      case 'nearby_places': {
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
        const { place, placeName } = context;
        if (!place) {
          return `I do not have verified information for '${placeName || 'that location'}'. AI KumbhMitra only provides verified information for places in Nashik and Trimbakeshwar.`;
        }
        const hours = place.openingHours?.open && place.openingHours?.close
          ? `Opening hours: ${place.openingHours.open} - ${place.openingHours.close}.`
          : '';
        const address = place.address ? `Address: ${place.address}.` : '';
        const services = place.services?.length ? `Key services: ${place.services.join(', ')}.` : '';
        return `${place.name} (${place.category.toUpperCase()}) located in Nashik/Trimbakeshwar. ${place.description || ''} ${address} ${hours} ${services}`.trim();
      }

      case 'search_places': {
        const { places, category } = context;
        if (!places || places.length === 0) {
          return `No verified ${category || 'matching'} locations found in Nashik or Trimbakeshwar matching your request.`;
        }
        const names = places.map((p) => p.name).join(', ');
        return `Found ${places.length} ${category || 'matching'} location(s) in Nashik and Trimbakeshwar: ${names}.`;
      }

      case 'unsupported': {
        const { reason } = context;
        if (reason === 'fabrication_request') {
          return `I cannot invent or fabricate places. AI KumbhMitra strictly provides verified, factual data for pilgrimage sites and services in Nashik and Trimbakeshwar from our official database.`;
        }
        return `I could not find any verified locations matching your request. AI KumbhMitra strictly covers verified pilgrimage locations and services in the Nashik and Trimbakeshwar region.`;
      }

      case 'general_question':
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

  async extractIntent(message, knownPlaces = []) {
    // Check first for explicit fabrication or out-of-scope attacks for fast rejection
    if (this.isFabricationRequest(message)) {
      return {
        intent: 'unsupported',
        category: null,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: message,
        reason: 'fabrication_request'
      };
    }

    if (this.isOutOfScope(message)) {
      return {
        intent: 'unsupported',
        category: null,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: message,
        reason: 'out_of_scope'
      };
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const prompt = `You are the NLU intent extractor for AI KumbhMitra (Nashik & Trimbakeshwar only).
Extract the user intent and entities. Supported intents:
- "search_places": finding places by category or keywords (e.g. temples, hospitals, parking)
- "nearby_places": finding places near a specific reference place (e.g. near Ram Kund)
- "place_info": asking about a specific place (e.g. tell me about Kalaram Temple)
- "route": asking for directions/route between two places (e.g. route from X to Y)
- "general_question": general inquiry about Kumbh Mela in Nashik/Trimbakeshwar
- "unsupported": asking to invent/fabricate data, or asking about locations outside Nashik/Trimbakeshwar

Known places in Nashik/Trimbakeshwar: ${knownPlaces.map((p) => p.name).join(', ')}.

Respond ONLY with valid JSON in this exact structure without markdown or backticks:
{
  "intent": "search_places" | "nearby_places" | "place_info" | "route" | "general_question" | "unsupported",
  "category": string or null,
  "placeName": string or null,
  "origin": string or null,
  "destination": string or null,
  "radius": 5000,
  "query": string
}

User Message: "${message}"`;

      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && parsed.intent) {
          return {
            intent: parsed.intent,
            category: parsed.category || null,
            placeName: parsed.placeName || null,
            origin: parsed.origin || null,
            destination: parsed.destination || null,
            radius: parsed.radius || 5000,
            query: parsed.query || message
          };
        }
      }

      return super.extractIntent(message, knownPlaces);
    } catch (err) {
      // Fallback to rule-based parser on any Gemini error or quota limit
      return super.extractIntent(message, knownPlaces);
    }
  }

  async generateResponse(params) {
    try {
      const { message, intent, context = {} } = params;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const systemPrompt = `You are AI KumbhMitra, a verified pilgrimage assistant for Kumbh Mela 2027 in Nashik and Trimbakeshwar, Maharashtra, India.
CRITICAL SAFETY & GROUNDING RULES:
1. Treat database/API context as authoritative.
2. NEVER invent, hallucinate, or fabricate places, coordinates, opening hours, or routes.
3. If information does not exist in context, explicitly inform the user that it is unavailable in our Nashik & Trimbakeshwar database.
4. If the user asks you to invent or make up a place, politely decline.
Context: ${JSON.stringify(context)}
Intent: ${intent}`;

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

      return super.generateResponse(params);
    } catch (error) {
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
