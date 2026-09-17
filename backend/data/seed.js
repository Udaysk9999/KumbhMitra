import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Place, { VALID_CATEGORIES } from '../src/models/Place.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumbhmitra';

/**
 * Validate and verify data integrity of place objects
 */
export const validatePlacesData = (places) => {
  const errors = [];
  const nameSet = new Set();
  const coordSet = new Set();

  places.forEach((p, idx) => {
    // Check required fields
    if (!p.name || typeof p.name !== 'string' || !p.name.trim()) {
      errors.push(`Place at index ${idx} is missing a valid name.`);
    }
    if (!p.category || typeof p.category !== 'string') {
      errors.push(`Place '${p.name || idx}' is missing category.`);
    } else if (!VALID_CATEGORIES.includes(p.category.toLowerCase())) {
      errors.push(`Place '${p.name}' has invalid category '${p.category}'.`);
    }

    // Coordinates check
    const coords = p.location?.coordinates;
    if (!Array.isArray(coords) || coords.length !== 2) {
      errors.push(`Place '${p.name}' must have GeoJSON [longitude, latitude] coordinates.`);
    } else {
      const [lng, lat] = coords;
      if (typeof lng !== 'number' || lng < 73.0 || lng > 75.0) {
        errors.push(`Place '${p.name}' longitude ${lng} out of reasonable Nashik region bounds (73.0 to 75.0).`);
      }
      if (typeof lat !== 'number' || lat < 19.5 || lat > 21.0) {
        errors.push(`Place '${p.name}' latitude ${lat} out of reasonable Nashik region bounds (19.5 to 21.0).`);
      }

      // Check duplicate coordinates
      const coordKey = `${lng.toFixed(6)},${lat.toFixed(6)}`;
      if (coordSet.has(coordKey)) {
        errors.push(`Duplicate coordinate detected: '${p.name}' shares coordinates ${coordKey} with another place.`);
      } else {
        coordSet.add(coordKey);
      }
    }

    // Duplicate name check
    const nameLower = (p.name || '').toLowerCase().trim();
    if (nameSet.has(nameLower)) {
      errors.push(`Duplicate place name detected: '${p.name}'.`);
    } else {
      nameSet.add(nameLower);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Database connection established.');

    // Load places from JSON
    const jsonPath = path.resolve(__dirname, 'places.json');
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Places data file not found at ${jsonPath}. Please run generate-places.js first.`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf-8');
    const places = JSON.parse(rawData);
    console.log(`[Seed] Loaded ${places.length} POIs from ${jsonPath}.`);

    // Validate data
    const validation = validatePlacesData(places);
    if (!validation.valid) {
      console.error('[Seed] Data validation failed with errors:');
      validation.errors.forEach((err) => console.error(`  - ${err}`));
      throw new Error('Places data failed validation checks.');
    }
    console.log('[Seed] Data validation passed: 0 duplicates, all coordinates within valid bounds.');

    // Wipe existing collection
    console.log('[Seed] Wiping existing places collection...');
    const deleteResult = await Place.deleteMany({});
    console.log(`[Seed] Removed ${deleteResult.deletedCount} existing place records.`);

    // Insert POIs
    console.log(`[Seed] Seeding ${places.length} verified POIs for Nashik & Trimbakeshwar...`);
    const insertedPlaces = await Place.insertMany(places);
    console.log(`[Seed] Successfully inserted ${insertedPlaces.length} places into database.`);

    // Ensure geospatial & text indexes are built
    console.log('[Seed] Ensuring 2dsphere and compound text indexes...');
    try {
      await Place.collection.dropIndexes();
      console.log('[Seed] Dropped previous indexes to allow clean index schema migration.');
    } catch (e) {
      console.log(`[Seed] Notice while dropping indexes: ${e.message}`);
    }
    await Place.createIndexes();
    console.log('[Seed] Indexes successfully verified:');
    const indexes = await Place.collection.indexes();
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Category breakdown summary
    const counts = {};
    insertedPlaces.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    console.log('\n=== SEEDING CATEGORY BREAKDOWN ===');
    Object.entries(counts).sort().forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });
    console.log(`TOTAL POIs: ${insertedPlaces.length}\n`);

    console.log('[Seed] Seeding complete! Exiting cleanly.');
  } catch (error) {
    console.error(`[Seed] Error occurred during seeding: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('[Seed] MongoDB connection closed.');
    process.exit(0);
  }
};

// Execute if run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
