/**
 * AI Provider Abstraction Layer for Ask Mitra (AI KumbhMitra)
 *
 * Provides structured intent extraction and response generation with Google Gemini integration,
 * OpenAI integration, and a deterministic RuleBasedAIProvider.
 *
 * Strictly scoped to Nashik and Trimbakeshwar, Maharashtra, India.
 */
import { buildGeminiPrompt } from './systemPrompt.js';
import { OpenAIAIProvider } from './openaiProvider.js';

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
export const CATEGORY_KEYWORDS = {
  temple: ['temple', 'mandir', 'jyotirlinga', 'darshan', 'shrine', 'samadhi'],
  ghat: ['ghat', 'riverbank', 'snan ghat', 'kund', 'bathing'],
  kumbh_zone: ['kumbh zone', 'sadhugram', 'mela zone', 'bathing zone', 'camp ground'],
  akhada: ['akhada', 'akhara', 'juni akhada', 'niranjani akhada', 'mahanirvani akhada'],
  ashram: ['ashram', 'math', 'hermitage'],
  dharamshala: ['dharamshala', 'dharmashala', 'choultry'],
  bhakta_niwas: ['bhakta niwas', 'bhakt niwas', 'pilgrim guest house'],
  guest_house: ['guest house', 'rest house', 'circuit house'],
  hospital: ['hospital', 'civil hospital', 'rural hospital', 'trauma care', 'clinic'],
  medical: ['medical', 'primary health centre', 'phc', 'health center', 'doctor'],
  ambulance: ['ambulance', '108 ambulance', 'ambulance service'],
  blood_bank: ['blood bank', 'blood center', 'blood donation'],
  pharmacy: ['pharmacy', 'chemist', 'medical store', 'medicine'],
  police: ['police', 'chowki', 'police station', 'police stations', 'security post', 'thana'],
  fire_station: ['fire station', 'fire stations', 'fire brigade', 'fire service'],
  emergency: ['emergency', 'disaster management', 'emergency facility', 'emergency facilities', 'emergency center'],
  restaurant: ['restaurant', 'restaurants', 'food', 'thali', 'meals', 'dining', 'snack', 'cafe', 'pizza', 'burger', 'vegetarian', 'veg food', 'bhojan', 'prasad', 'annadan'],
  hotel: ['hotel', 'hotels', 'stay', 'lodge', 'accommodation', 'resort'],
  transport: ['transport', 'transit', 'shuttle', 'taxi stand', 'auto stand'],
  railway: ['railway', 'railway station', 'railway stations', 'train station', 'train stations', 'train'],
  bus_stand: ['bus stand', 'bus stands', 'bus depot', 'bus terminal', 'msrtc'],
  parking: ['parking', 'park vehicle', 'car park', 'parking lot', 'vehicle holding'],
  public_toilet: ['public toilet', 'public toilets', 'toilet', 'toilets', 'washroom', 'washrooms', 'restroom', 'restrooms', 'sulabh', 'urinal'],
  water_point: ['drinking water', 'water point', 'water points', 'water station', 'ro water', 'tap water', 'water'],
  help_center: ['help center', 'help centers', 'information booth', 'enquiry', 'assistance desk', 'helpdesk', 'lost & found', 'lost and found'],
  tourist_spot: ['tourist spot', 'tourist spots', 'tourist place', 'tourist places', 'sightseeing', 'attraction', 'attractions', 'places to visit', 'place to visit', 'smarak', 'memorial'],
  fort: ['fort', 'forts', 'gad', 'killa', 'fortress'],
  cave: ['cave', 'caves', 'gufa', 'leni'],
  waterfall: ['waterfall', 'waterfalls', 'falls', 'cascade'],
  museum: ['museum', 'museums', 'gallery', 'heritage center'],
  nature: ['nature', 'dam', 'lake', 'talav', 'sanctuary', 'garden', 'park'],
  viewpoint: ['viewpoint', 'viewpoints', 'view point', 'scenic point', 'valley view', 'lookout'],
  government_facility: ['government facility', 'municipal corporation', 'collectorate', 'civic center', 'nmc'],
  tourist_information: ['tourist information', 'tourist info', 'tourism office'],
  rest_area: ['rest area', 'rest areas', 'waiting shed', 'holding area']
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

    // 1. Direct name match or exact aliases
    for (const place of knownPlaces) {
      const placeNameLower = place.name.toLowerCase();
      if (lower.includes(placeNameLower) || placeNameLower === lower) {
        return place;
      }
    }

    // 2. Specific landmark aliases
    if (lower.includes('ram kund') || lower.includes('ramkund')) {
      return knownPlaces.find((p) => p.name === 'Ram Kund Ghat') || knownPlaces.find((p) => p.name.includes('Ram Kund'));
    }
    if (lower.includes('kushavarta')) {
      return knownPlaces.find((p) => p.name.includes('Kushavarta'));
    }
    if (lower.includes('kalaram')) {
      return knownPlaces.find((p) => p.name.includes('Kalaram'));
    }
    if (lower.includes('kapaleshwar')) {
      return knownPlaces.find((p) => p.name.includes('Kapaleshwar'));
    }
    if (lower.includes('sita gufa') || lower.includes('sita gumpha')) {
      return knownPlaces.find((p) => p.name.includes('Sita Gufa'));
    }
    if (lower.includes('saptashrungi')) {
      return knownPlaces.find((p) => p.name.includes('Saptashrungi'));
    }
    if (lower.includes('brahmagiri')) {
      return knownPlaces.find((p) => p.name.includes('Brahmagiri'));
    }
    if (lower.includes('anjaneri')) {
      return knownPlaces.find((p) => p.name.includes('Anjaneri'));
    }
    if (lower.includes('harihar')) {
      return knownPlaces.find((p) => p.name.includes('Harihar'));
    }
    if (lower.includes('civil hospital')) {
      return knownPlaces.find((p) => p.name.includes('Civil Hospital'));
    }
    if (lower.includes('cbs')) {
      return knownPlaces.find((p) => p.name.includes('CBS'));
    }
    if (lower.includes('tapovan')) {
      return knownPlaces.find((p) => p.name.includes('Tapovan'));
    }
    if (lower.includes('trimbakeshwar') || lower.includes('trimbak')) {
      return knownPlaces.find((p) => p.name === 'Trimbakeshwar Jyotirlinga Temple') || knownPlaces.find((p) => p.name.includes('Trimbakeshwar'));
    }
    if (lower.includes('panchavati')) {
      return knownPlaces.find((p) => p.name === 'Ram Kund Ghat') || knownPlaces.find((p) => p.name.includes('Panchavati'));
    }
    if (lower.includes('muktidham')) {
      return knownPlaces.find((p) => p.name.includes('Muktidham'));
    }
    if (lower.includes('pandavleni')) {
      return knownPlaces.find((p) => p.name.includes('Pandavleni'));
    }
    if (lower.includes('nashik road')) {
      return knownPlaces.find((p) => p.name.includes('Nashik Road Railway'));
    }

    // 3. Substring keyword match
    for (const place of knownPlaces) {
      const parts = place.name.toLowerCase().split(/\s+/);
      const significant = parts.filter(
        (w) => !['temple', 'ghat', 'hospital', 'fort', 'point', 'station', 'bus', 'stand', 'road'].includes(w)
      );
      if (significant.some((w) => w.length > 3 && lower.includes(w))) {
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
        const escaped = kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}(s|es)?($|\\s|[^a-zA-Z0-9])`, 'i');
        if (regex.test(cleanText)) {
          return category;
        }
      }
    }
    return null;
  }

  async extractIntent(message, knownPlaces = [], context = {}) {
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

    // 3. Itinerary Intent
    if (/\b(?:itinerary|plan|trip|one[- ]day|two[- ]day|1[- ]day|2[- ]day|day plan|tour)\b/i.test(text)) {
      return {
        intent: 'itinerary',
        category: null,
        placeName: null,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

    // 4. Route Intent
    const isRoutePrompt =
      /\b(?:routes?|directions?|navigate|navigation|how\s+(?:do\s+i|to)\s+get|how\s+to\s+go|drive)\b/i.test(text) ||
      (/\b(?:walk|foot)\b/i.test(text) && /\b(?:to|from)\b/i.test(text)) ||
      (/\bway\b/i.test(text) && !/\b(?:railway|railways|subway|highway)\b/i.test(text));
    if (isRoutePrompt) {
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

    // 5. Nearby Intent
    const isNearbyPrompt = /(?:near|around|close\s+to|nearby)\b/i.test(text);
    if (isNearbyPrompt) {
      const anchorMatch = text.match(/(?:near|around|close\s+to|nearby)\s+([^,?.!]+)/i);
      let anchorName = anchorMatch ? anchorMatch[1].trim() : null;

      // Check if user refers to "here" with selectedLocation
      if ((!anchorName || anchorName.toLowerCase() === 'here') && context.selectedLocation) {
        anchorName = context.selectedLocation;
      }

      if (anchorName && ['nashik', 'nashik city', 'the city'].includes(anchorName.toLowerCase())) {
        const category = this.detectCategory(text, anchorName);
        if (category) {
          return {
            intent: 'search_places',
            category,
            placeName: null,
            origin: null,
            destination: null,
            radius: 5000,
            query: text
          };
        }
      }

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

    // 6. Place Info Intent
    // Handle "What can I see here?" / "Tell me about this place" using context.selectedLocation
    if ((/\b(?:here|this place)\b/i.test(text)) && context.selectedLocation) {
      return {
        intent: 'place_info',
        category: null,
        placeName: context.selectedLocation,
        origin: null,
        destination: null,
        radius: 5000,
        query: text
      };
    }

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

    // Direct place name match
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

    // 7. Search Places Intent
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

    // 8. General Question
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

  async generateResponse({ message, intent, context = {}, projectData = null, routeData = null }) {
    switch (intent) {
      case 'itinerary': {
        const places = Array.isArray(projectData) ? projectData : (context.places || []);
        const p1 = places[0]?.name || 'Ram Kund Ghat';
        const p2 = places[1]?.name || 'Kalaram Temple';
        const p3 = places[2]?.name || 'Muktidham Temple';
        const p4 = places[3]?.name || 'Godavari Riverbank Aarti';

        return `Namaste! Here is a suggested one-day Nashik pilgrimage and heritage itinerary:

Morning
• Location: ${p1} (Panchavati)
• Suggested duration: 1 to 1.5 hours
• Why visit: Sacred bathing ghat on Godavari River; key Kumbh Mela Shahi Snan destination with rich spiritual history.

Afternoon
• Location: ${p2} & Sita Gufa
• Suggested duration: 1.5 to 2 hours
• Why visit: Historic black-stone temple dedicated to Lord Rama, followed by the nearby Sita Gufa associated with Ramayana exile.

Evening
• Location: ${p3} & ${p4}
• Suggested duration: 1 to 1.5 hours
• Why visit: Experience the peaceful evening atmosphere and participate in the sacred Godavari Aarti.

Tip: Travel early to avoid crowds. Exact timings may vary during peak Kumbh dates; please verify local announcements with on-ground authorities.`;
      }

      case 'route': {
        const route = routeData || context.route;
        const originPlace = context.originPlace;
        const destPlace = context.destPlace;
        const mode = context.mode || 'driving';

        if (!route || !originPlace || !destPlace) {
          return `I could not calculate a route for your request. Please ensure both locations are verified sites in Nashik or Trimbakeshwar.`;
        }
        const modeLabel = mode === 'foot' ? 'walking' : 'driving';
        return `The estimated ${modeLabel} distance from ${originPlace.name} to ${destPlace.name} is ${route.distanceKm} km (approx. ${route.durationMins} minutes). Take the Trimbak Road / NH-848 for direct connectivity. Turn-by-turn route steps are displayed on your map.`;
      }

      case 'nearby_places': {
        const places = Array.isArray(projectData) ? projectData : (context.places || []);
        const anchorPlace = context.anchorPlace;
        const category = context.category;

        if (!anchorPlace) {
          return `Please specify a reference location in Nashik or Trimbakeshwar to find nearby places.`;
        }
        if (!places || places.length === 0) {
          return `No verified ${category ? category.replace('_', ' ') + ' ' : ''}places were found within 5 km of ${anchorPlace.name} in Nashik/Trimbakeshwar.`;
        }
        const categoryNote = category ? ` (${category.replace('_', ' ')})` : '';
        const names = places.slice(0, 5).map((p) => p.name).join(', ');
        return `Here are verified locations${categoryNote} near ${anchorPlace.name}: ${names}. You can select any place to view its location on the map.`;
      }

      case 'place_info': {
        const place = projectData || context.place;
        const placeName = context.placeName || (place ? place.name : 'that location');

        if (!place) {
          return `I do not have verified information for '${placeName}'. AI KumbhMitra only provides verified information for places in Nashik and Trimbakeshwar.`;
        }
        const hours = place.openingHours?.open && place.openingHours?.close
          ? `Opening hours: ${place.openingHours.open} - ${place.openingHours.close}.`
          : '';
        const addressStr = typeof place.address === 'object' && place.address !== null
          ? [place.address.area, place.address.city, place.address.state].filter(Boolean).join(', ')
          : (place.address || '');
        const address = addressStr ? `Address: ${addressStr}.` : '';
        const services = place.services?.length ? `Key services: ${place.services.join(', ')}.` : '';
        return `${place.name} (${(place.category || 'POI').toUpperCase()}) located in Nashik/Trimbakeshwar. ${place.description || ''} ${address} ${hours} ${services}`.trim();
      }

      case 'search_places': {
        const places = Array.isArray(projectData) ? projectData : (context.places || []);
        const category = context.category;

        if (!places || places.length === 0) {
          return `No verified ${category ? category.replace('_', ' ') : 'matching'} locations found in Nashik or Trimbakeshwar matching your request.`;
        }
        const names = places.slice(0, 8).map((p) => p.name).join(', ');
        return `Found ${places.length} verified ${category ? category.replace('_', ' ') : 'matching'} location(s) in Nashik and Trimbakeshwar: ${names}.`;
      }

      case 'unsupported': {
        const reason = context.reason;
        if (reason === 'fabrication_request') {
          return `I cannot invent or fabricate places. AI KumbhMitra strictly provides verified, factual data for pilgrimage sites and services in Nashik and Trimbakeshwar from our official database.`;
        }
        return `I could not find any verified locations matching your request. AI KumbhMitra strictly covers verified pilgrimage locations and services in the Nashik and Trimbakeshwar region.`;
      }

      case 'general_question':
      default: {
        const lowerMsg = (message || '').toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('namaste') || lowerMsg.includes('hi mitra')) {
          return `Namaste! I am Mitra, your digital guide for Kumbh Mitra. I can help you discover holy temples, sacred bathing ghats, routes between pilgrimage spots, and plan itineraries across Nashik and Trimbakeshwar. How may I assist your visit today?`;
        }
        const places = Array.isArray(projectData) ? projectData : (context.places || []);
        if (places.length > 0) {
          const names = places.slice(0, 6).map((p) => p.name).join(', ');
          return `Here are relevant places in Nashik and Trimbakeshwar matching your query: ${names}.`;
        }
        return `Namaste! As your Kumbh Mitra guide, I can assist you with information about temples, ghats, routes, and itineraries across Nashik and Trimbakeshwar. Please let me know what you would like to explore!`;
      }
    }
  }
}

/**
 * Gemini AI Provider
 * Connects directly to Google Gemini REST API using GEMINI_API_KEY.
 * Never falls back silently to rule-based when configured as gemini.
 */
export class GeminiAIProvider extends RuleBasedAIProvider {
  constructor(apiKey) {
    super();
    if (!apiKey || !apiKey.trim()) {
      throw new Error('Gemini API key is not configured');
    }
    this.apiKey = apiKey.trim();
    // Use gemini-3.6-flash or gemini-flash-latest for standard generation
    this.modelName = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  }

  async generateResponse(params) {
    const { message, intent, context = {}, projectData = null, routeData = null } = params;
    const prompt = buildGeminiPrompt({ message, context, projectData, routeData });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024
      }
    };

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (networkErr) {
      throw new Error(`Gemini network connection failed: ${networkErr.message}`);
    }

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || `Gemini API returned status ${response.status}`;
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error(`Gemini authentication or configuration error: ${errMsg}`);
      }
      if (response.status === 429) {
        throw new Error(`Gemini rate limit exceeded. Please try again shortly.`);
      }
      throw new Error(`Gemini request failed: ${errMsg}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText || !generatedText.trim()) {
      throw new Error('Gemini returned an empty response.');
    }

    return generatedText.trim();
  }
}

/**
 * Factory to get active AI provider based on environment configuration
 */
export const getAIProvider = () => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  if (provider === 'gemini') {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    if (!geminiKey || !geminiKey.trim()) {
      throw new Error('Gemini API key is not configured');
    }
    return {
      provider: 'gemini',
      instance: new GeminiAIProvider(geminiKey.trim())
    };
  }

  if (provider === 'openai') {
    const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
    if (!openaiKey || !openaiKey.trim()) {
      throw new Error('OpenAI API key is not configured');
    }
    return {
      provider: 'openai',
      instance: new OpenAIAIProvider(openaiKey.trim())
    };
  }

  if (provider === 'rule_based') {
    return {
      provider: 'rule_based',
      instance: new RuleBasedAIProvider()
    };
  }

  throw new Error(`Unsupported AI_PROVIDER: '${provider}'. Must be 'gemini', 'openai', or 'rule_based'.`);
};

/**
 * Diagnostic health check for AI service
 */
export const getAIHealth = () => {
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase().trim();

  if (provider === 'gemini') {
    const hasKey = Boolean((process.env.GEMINI_API_KEY || process.env.AI_API_KEY)?.trim());
    if (!hasKey) {
      return {
        success: false,
        provider: 'gemini',
        configured: false,
        error: 'Gemini API key is not configured'
      };
    }
    return {
      success: true,
      provider: 'gemini',
      configured: true
    };
  }

  if (provider === 'openai') {
    const hasKey = Boolean((process.env.OPENAI_API_KEY || process.env.AI_API_KEY)?.trim());
    if (!hasKey) {
      return {
        success: false,
        provider: 'openai',
        configured: false,
        error: 'OpenAI API key is not configured'
      };
    }
    return {
      success: true,
      provider: 'openai',
      configured: true
    };
  }

  if (provider === 'rule_based') {
    return {
      success: true,
      provider: 'rule_based',
      configured: true
    };
  }

  return {
    success: false,
    provider,
    configured: false,
    error: `Unsupported AI provider: ${provider}`
  };
};

export default {
  AIProvider,
  RuleBasedAIProvider,
  GeminiAIProvider,
  getAIProvider,
  getAIHealth
};
