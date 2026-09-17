import { routeService } from './src/services/routeService.js';
import { generateDemoRoute, normalizeRoute, TRAVEL_MODES, calculateHaversineKm, formatDistance, formatDuration } from './src/routes/routeUtils.js';
import { MOCK_PLACES } from './src/constants/mockPlaces.js';

console.log('--- STARTING ROUTE INTEGRATION UI & CONTRACT TESTS ---');

// 1. Check Travel Modes
console.log(`[TEST 1] Verifying travel modes: ${TRAVEL_MODES.map(m => m.id).join(', ')}`);
if (TRAVEL_MODES.length !== 3) {
  throw new Error(`Expected 3 travel modes, found ${TRAVEL_MODES.length}`);
}

const cbs = MOCK_PLACES.find(p => p.id === 'place_cbs_transit') || MOCK_PLACES[0];
const trimbak = MOCK_PLACES.find(p => p.id === 'place_trimbakeshwar_temple') || MOCK_PLACES[1];

console.log(`[TEST 2] Origin: ${cbs.name}, Destination: ${trimbak.name}`);

// 2. Test calculateRoute for all modes
for (const mode of ['shuttle', 'walking', 'driving']) {
  const result = await routeService.calculateRoute({
    start: cbs,
    destination: trimbak,
    mode
  });

  if (!result.success || !result.data) {
    throw new Error(`Route calculation failed for mode ${mode}: ${result.error}`);
  }

  const route = result.data;
  console.log(`  ✓ Mode: ${mode.padEnd(8)} | Dist: ${route.distanceText.padEnd(8)} | Time: ${route.durationText.padEnd(10)} | Steps: ${route.steps?.length || 0} | Waypoints: ${route.geometry.coordinates.length}`);

  // Contract verification
  if (!route.start || !route.start.id || !route.start.latitude || !route.start.longitude) {
    throw new Error(`Invalid start location contract in mode ${mode}`);
  }
  if (!route.destination || !route.destination.id || !route.destination.latitude || !route.destination.longitude) {
    throw new Error(`Invalid destination location contract in mode ${mode}`);
  }
  if (!route.geometry || route.geometry.type !== 'LineString' || !Array.isArray(route.geometry.coordinates)) {
    throw new Error(`Invalid GeoJSON LineString geometry in mode ${mode}`);
  }
  if (!route.distance || typeof route.distance.valueKm !== 'number') {
    throw new Error(`Invalid distance object contract in mode ${mode}`);
  }
  if (!route.duration || typeof route.duration.valueMinutes !== 'number') {
    throw new Error(`Invalid duration object contract in mode ${mode}`);
  }
  if (!Array.isArray(route.steps) || route.steps.length === 0) {
    throw new Error(`Expected turn-by-turn steps in mode ${mode}`);
  }
}

// 3. Test Error Handling (Same Origin and Destination)
console.log('[TEST 3] Testing identical origin and destination error validation');
const errorResult = await routeService.calculateRoute({
  start: cbs,
  destination: cbs,
  mode: 'shuttle'
});
if (errorResult.success || !errorResult.error) {
  throw new Error('Expected validation error for same start and destination, but got success');
}
console.log(`  ✓ Expected error received: "${errorResult.error}"`);

// 4. Test Error Handling (Missing Start or Destination)
console.log('[TEST 4] Testing missing inputs');
const missingResult = await routeService.calculateRoute({
  start: null,
  destination: trimbak
});
if (missingResult.success || !missingResult.error) {
  throw new Error('Expected validation error for missing start point');
}
console.log(`  ✓ Expected error received: "${missingResult.error}"`);

// 5. Test Normalizer with synthetic raw backend API response
console.log('[TEST 5] Testing normalizeRoute with mock backend API response structure');
const syntheticApiPayload = {
  id: 'backend_route_123',
  start: { id: 'p1', name: 'Nashik CBS', latitude: 19.9975, longitude: 73.7898 },
  destination: { id: 'p2', name: 'Trimbakeshwar', latitude: 19.9324, longitude: 73.5307 },
  travelMode: 'driving',
  distance: { valueKm: 29.5, valueMeters: 29500 },
  duration: { valueMinutes: 44, valueSeconds: 2640 },
  geometry: {
    type: 'LineString',
    coordinates: [
      [73.7898, 19.9975],
      [73.7000, 19.9600],
      [73.5307, 19.9324]
    ]
  },
  steps: [
    { stepIndex: 1, instruction: 'Depart via NH-848', distanceKm: 5, durationMinutes: 8 }
  ],
  source: 'api'
};

const normalizedApiRoute = normalizeRoute(syntheticApiPayload);
if (normalizedApiRoute.source !== 'api' || normalizedApiRoute.distanceText !== '29.5 km' || normalizedApiRoute.durationText !== '44 min') {
  throw new Error('Backend route normalization did not map fields accurately');
}
console.log(`  ✓ Normalized API Route successfully: source=${normalizedApiRoute.source}, distance=${normalizedApiRoute.distanceText}`);

console.log('--- ALL ROUTE TESTS PASSED SUCCESSFULLY! ---');
