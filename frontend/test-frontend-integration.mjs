import { CATEGORY_DEFINITIONS, FILTER_GROUPS, KUMBH_MODE_CATEGORIES, EXPLORE_MODE_CATEGORIES, normalizePlace, searchPlaces, filterPlacesByCategory } from './src/places/placeUtils.js';
import { CATEGORY_THEMES, getCategoryTheme } from './src/maps/mapConfig.js';

async function runTests() {
  console.log('=== AI KUMBHMITRA FRONTEND INTEGRATION TESTS ===\n');

  let passed = 0;
  let failed = 0;

  function assert(cond, name) {
    if (cond) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Fetch real backend places
  const res = await fetch('http://localhost:5000/api/places?limit=500');
  const json = await res.json();
  const rawPlaces = json.data || [];
  assert(rawPlaces.length === 130, `Backend returned all 130 database places (count: ${rawPlaces.length})`);

  // 2. Normalization
  const normalized = rawPlaces.map(normalizePlace).filter(Boolean);
  assert(normalized.length === 130, `All 130 places safely normalized without error`);

  // 3. Category coverage & Themes
  const presentCategories = [...new Set(normalized.map(p => p.category))];
  console.log(`\nDistinct POI Categories in database (${presentCategories.length}):`, presentCategories.join(', '));

  presentCategories.forEach(cat => {
    const theme = getCategoryTheme(cat);
    const def = CATEGORY_DEFINITIONS[cat];
    assert(theme && theme.activeBg && def && def.icon, `Category '${cat}' has theme (${theme?.activeBg}) & icon (${def?.icon})`);
  });

  // 4. Test Category Filters
  console.log('\n--- Testing Category Filters ---');
  const filterTests = [
    { cat: 'temple', min: 1 },
    { cat: 'ghat', min: 1 },
    { cat: 'hospital', min: 1 },
    { cat: 'emergency', min: 1 },
    { cat: 'restaurant', min: 1 },
    { cat: 'hotel', min: 1 },
    { cat: 'transport', min: 1 },
    { cat: 'parking', min: 1 },
    { cat: 'public_toilet', min: 1 },
    { cat: 'water_point', min: 1 },
    { cat: 'fort', min: 1 },
    { cat: 'tourist_spot', min: 1 },
    { cat: 'cave', min: 1 },
    { cat: 'waterfall', min: 1 },
    { cat: 'museum', min: 1 },
    { cat: 'nature', min: 1 },
    { cat: 'viewpoint', min: 1 },
    { cat: 'kumbh_zone', min: 1 },
    { cat: 'akhada', min: 1 },
    { cat: 'ashram', min: 1 }
  ];

  filterTests.forEach(({ cat, min }) => {
    const filtered = filterPlacesByCategory(normalized, cat);
    assert(filtered.length >= min, `Filter '${cat}' returned ${filtered.length} places (expected >= ${min})`);
  });

  // 5. Test Search
  console.log('\n--- Testing Search ---');
  const searchQueries = [
    'Ramkund',
    'Harihar Fort',
    'Trimbakeshwar',
    'hospitals',
    'waterfalls',
    'forts',
    'restaurants'
  ];

  searchQueries.forEach(q => {
    const results = searchPlaces(normalized, q);
    assert(results.length > 0, `Search '${q}' found ${results.length} result(s): "${results[0]?.name}"`);
  });

  // 6. Test Nearby Search endpoint
  console.log('\n--- Testing Nearby API ---');
  const nearbyRes = await fetch('http://localhost:5000/api/places/nearby?lat=19.9975&lng=73.7850&radius=10000');
  const nearbyJson = await nearbyRes.json();
  assert(nearbyJson.success && nearbyJson.data.length > 0, `GET /api/places/nearby returned ${nearbyJson.data?.length} POIs`);

  // 7. Test Routing endpoint
  console.log('\n--- Testing Routing API ---');
  const ramkund = normalized.find(p => p.name.includes('Ram Kund') || p.name.includes('Ramkund'));
  const trimbak = normalized.find(p => p.name.includes('Trimbakeshwar Jyotirlinga'));
  assert(ramkund && trimbak, `Found origin (${ramkund?.name}) and destination (${trimbak?.name})`);

  const routeRes = await fetch('http://localhost:5000/api/routes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      origin: { lat: ramkund.latitude, lng: ramkund.longitude },
      destination: { lat: trimbak.latitude, lng: trimbak.longitude },
      mode: 'driving'
    })
  });
  const routeJson = await routeRes.json();
  assert(routeJson.success && routeJson.data?.geometry?.coordinates?.length > 0, `POST /api/routes generated route (${routeJson.data?.distanceKm} km, ${routeJson.data?.durationMins} mins, ${routeJson.data?.geometry?.coordinates?.length} coords)`);

  // 8. Test AI Chat endpoint
  console.log('\n--- Testing AI Chat API ---');
  const aiQueries = [
    'Find temples near Ram Kund',
    'Show forts near Nashik',
    'Find waterfalls'
  ];

  for (const q of aiQueries) {
    const aiRes = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: q })
    });
    const aiJson = await aiRes.json();
    assert(aiJson.success && aiJson.data?.reply && Array.isArray(aiJson.data?.places), `AI query "${q}" returned reply and ${aiJson.data?.places?.length} places`);
  }

  // 9. Check Kumbh Mode & Explore Mode coverage
  console.log('\n--- Testing Modes ---');
  const explorePlaces = normalized.filter(p => EXPLORE_MODE_CATEGORIES.has(p.category));
  const kumbhPlaces = normalized.filter(p => KUMBH_MODE_CATEGORIES.has(p.category));
  assert(explorePlaces.length > 0, `Explore Mode has ${explorePlaces.length} places (forts, caves, waterfalls, etc.)`);
  assert(kumbhPlaces.length > 0, `Kumbh Mode has ${kumbhPlaces.length} places (pilgrimage, medical, transport, facilities)`);

  // 10. Check Place Information Fields
  console.log('\n--- Testing Place Information Attributes ---');
  const sampleFort = normalized.find(p => p.category === 'fort');
  assert(sampleFort && sampleFort.name && sampleFort.description && sampleFort.address, `Fort record (${sampleFort?.name}) has full attributes: ${sampleFort?.categoryIcon} ${sampleFort?.categoryLabel}`);

  console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
