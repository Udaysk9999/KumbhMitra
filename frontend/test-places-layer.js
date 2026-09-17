import {
  normalizePlace,
  searchPlaces,
  filterPlacesByCategory,
  formatOpeningHours,
  formatAccessibility,
  calculateRelativeMapPosition
} from './src/places/placeUtils.js';
import { placeService } from './src/places/placeService.js';
import { MOCK_PLACES } from './src/constants/mockPlaces.js';

console.log('=== RUNNING FRONTEND PLACE DATA LAYER TESTS ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Normalizing existing mock places
console.log('--- 1. Testing mock places normalization ---');
const normalizedMock = MOCK_PLACES.map(normalizePlace);
assert(normalizedMock.length === MOCK_PLACES.length, `Normalized all ${MOCK_PLACES.length} mock places`);
assert(normalizedMock.every(p => typeof p.id === 'string' && p.id.length > 0), 'All places have valid id');
assert(normalizedMock.every(p => typeof p.name === 'string' && p.name.length > 0), 'All places have valid name');
assert(normalizedMock.every(p => typeof p.latitude === 'number' && p.latitude > 0), 'All places have numeric latitude');
assert(normalizedMock.every(p => typeof p.longitude === 'number' && p.longitude > 0), 'All places have numeric longitude');
assert(normalizedMock.every(p => Array.isArray(p.tags)), 'All places have tags array');
assert(normalizedMock.every(p => Array.isArray(p.facilities)), 'All places have facilities array');
assert(normalizedMock.every(p => p.mapPosition && typeof p.mapPosition.top === 'string'), 'All places have mapPosition.top');

// Test 2: Normalizing backend MongoDB GeoJSON document
console.log('\n--- 2. Testing backend MongoDB GeoJSON schema normalization ---');
const backendMongoPlace = {
  _id: '6aab8aa442ec784f29a2b353',
  name: 'Ram Kund Ghat',
  category: 'ghat',
  location: { type: 'Point', coordinates: [73.7904, 20.0059] }, // [lng, lat]
  address: 'Panchavati, Godavari Riverbank, Nashik, Maharashtra 422003',
  description: 'Sacred bathing ghat where millions take the holy dip during Kumbh Mela and Shahi Snan rituals.',
  contact: '+91 253 257 0000',
  openingHours: { open: '00:00', close: '23:59' },
  accessibility: { wheelchairAccessible: true, seniorFriendly: true },
  services: ['Holy Dip', 'Godavari Aarti', 'Changing Rooms']
};

const normalizedMongo = normalizePlace(backendMongoPlace);
assert(normalizedMongo.id === '6aab8aa442ec784f29a2b353', 'Maps _id to id');
assert(normalizedMongo.latitude === 20.0059, 'Extracts latitude from coordinates[1]');
assert(normalizedMongo.longitude === 73.7904, 'Extracts longitude from coordinates[0]');
assert(normalizedMongo.phone === '+91 253 257 0000', 'Maps contact to phone');
assert(normalizedMongo.openingHours === '00:00 – 23:59', 'Safely converts openingHours object to string');
assert(normalizedMongo.accessibility === 'Wheelchair Accessible • Senior Friendly', 'Safely converts accessibility object to string');
assert(normalizedMongo.facilities.length === 3, 'Maps services to facilities');
assert(normalizedMongo.categoryLabel === 'Ghats', 'Resolves category label');
assert(normalizedMongo.categoryIcon === '🌊', 'Resolves category icon');
assert(typeof normalizedMongo.mapPosition.top === 'string', 'Computes mapPosition top percentage');
assert(typeof normalizedMongo.mapPosition.left === 'string', 'Computes mapPosition left percentage');

// Test 3: Handling missing / optional fields safely
console.log('\n--- 3. Testing minimal / partial place data safety ---');
const minimalPlace = {
  name: 'Mystic Spot',
  category: 'temple'
};
const normalizedMinimal = normalizePlace(minimalPlace);
assert(typeof normalizedMinimal.id === 'string', 'Assigns fallback id');
assert(normalizedMinimal.address.length > 0, 'Provides fallback region address');
assert(normalizedMinimal.openingHours === '', 'Empty string for missing opening hours (not undefined)');
assert(normalizedMinimal.phone === null, 'null for missing phone (not undefined)');
assert(normalizedMinimal.accessibility === '', 'Empty string for missing accessibility (not undefined)');
assert(Array.isArray(normalizedMinimal.tags), 'Tags defaults to safe array');
assert(Array.isArray(normalizedMinimal.facilities), 'Facilities defaults to safe array');

// Test 4: Search functionality
console.log('\n--- 4. Testing search across name, category, address, region, and tags ---');
const searchByName = searchPlaces(normalizedMock, 'Kalaram');
assert(searchByName.length === 1 && searchByName[0].name.includes('Kalaram'), 'Search by place name');

const searchByCategory = searchPlaces(normalizedMock, 'temple');
assert(searchByCategory.length >= 2, 'Search by category keyword');

const searchByAddress = searchPlaces(normalizedMock, 'Panchavati');
assert(searchByAddress.length >= 2, 'Search by address term');

const searchEmpty = searchPlaces(normalizedMock, '');
assert(searchEmpty.length === normalizedMock.length, 'Empty query returns all places');

const searchNonExistent = searchPlaces(normalizedMock, 'random_non_existent_xyz');
assert(searchNonExistent.length === 0, 'Non-matching query returns empty array');

// Test 5: Category filter
console.log('\n--- 5. Testing category filtering ---');
const temples = filterPlacesByCategory(normalizedMock, 'temple');
assert(temples.length > 0 && temples.every(p => p.category === 'temple'), 'Filter by temple');

const allPlaces = filterPlacesByCategory(normalizedMock, 'all');
assert(allPlaces.length === normalizedMock.length, 'Filter by all returns full list');

// Test 6: placeService API
console.log('\n--- 6. Testing placeService methods ---');
const syncPlaces = placeService.getPlacesSync();
assert(syncPlaces.length === MOCK_PLACES.length, 'getPlacesSync returns normalized mock places');

const asyncResult = await placeService.getPlaces();
assert(asyncResult.places.length === MOCK_PLACES.length, 'getPlaces returns normalized places');
assert(asyncResult.source === 'mock', 'Defaults to mock source when useApi is false');

const foundPlace = await placeService.getPlaceById('place_ramkund');
assert(foundPlace !== null && foundPlace.name.includes('Ramkund'), 'getPlaceById resolves known mock place');

const notFound = await placeService.getPlaceById('non_existent_id');
assert(notFound === null, 'getPlaceById returns null for unknown place');

console.log(`\n========================================`);
console.log(`FRONTEND PLACE LAYER: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
