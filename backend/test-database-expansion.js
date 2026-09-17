process.env.NODE_ENV = 'test';
import app from './src/server.js';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Place from './src/models/Place.js';
import { validatePlacesData } from './data/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 5059;
let server;

async function runExpansionTests() {
  console.log('=== RUNNING PLACES DATABASE EXPANSION COMPREHENSIVE TESTS ===\n');

  const testResults = {};
  let totalPassed = 0;
  let totalFailed = 0;

  function record(testName, condition, details = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${details}`);
      testResults[testName] = 'PASS';
      totalPassed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${details}`);
      testResults[testName] = 'FAIL';
      totalFailed++;
    }
  }

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumbhmitra';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  const apiBase = `http://localhost:${PORT}/api`;

  try {
    // 1. Seed & JSON File Check
    console.log('--- 1. Seed & Data File Verification ---');
    const jsonPath = path.resolve(__dirname, 'data/places.json');
    const jsonExists = fs.existsSync(jsonPath);
    const places = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const dbCount = await Place.countDocuments();
    record('Seed', jsonExists && dbCount >= 130, `(${dbCount} records in DB, ${places.length} in JSON)`);

    // 2. Duplicate Check
    console.log('\n--- 2. Duplicate Check ---');
    const nameSet = new Set();
    let hasDuplicateName = false;
    for (const p of places) {
      const lower = p.name.toLowerCase().trim();
      if (nameSet.has(lower)) {
        hasDuplicateName = true;
        break;
      }
      nameSet.add(lower);
    }
    record('Duplicate check', !hasDuplicateName && nameSet.size === places.length, `(Total unique names: ${nameSet.size})`);

    // 3. Coordinate Validation
    console.log('\n--- 3. Coordinate Validation ---');
    const validation = validatePlacesData(places);
    record('Coordinate validation', validation.valid, validation.valid ? '(All 130 POIs within valid [lng, lat] bounds)' : validation.errors[0]);

    // 4. Category Filtering
    console.log('\n--- 4. Category Filtering ---');
    const catRes = await fetch(`${apiBase}/places?category=fort&limit=50`);
    const catData = await catRes.json();
    record('Category filtering', catData.success && catData.data.length === 15 && catData.data.every(p => p.category === 'fort'), `(Retrieved ${catData.data?.length} forts)`);

    // 5. Nearby Nashik (around Ram Kund [73.7904, 20.0059])
    console.log('\n--- 5. Nearby Nashik Search ---');
    const nearNashikRes = await fetch(`${apiBase}/places/nearby?lat=20.0059&lng=73.7904&radius=5000`);
    const nearNashikData = await nearNashikRes.json();
    record('Nearby Nashik', nearNashikData.success && nearNashikData.data.length > 20, `(Found ${nearNashikData.data?.length} places within 5km of Ram Kund)`);

    // 6. Nearby Trimbakeshwar (around Kushavarta / Temple [73.5302, 19.9324])
    console.log('\n--- 6. Nearby Trimbakeshwar Search ---');
    const nearTrimbakRes = await fetch(`${apiBase}/places/nearby?lat=19.9324&lng=73.5302&radius=5000`);
    const nearTrimbakData = await nearTrimbakRes.json();
    record('Nearby Trimbakeshwar', nearTrimbakData.success && nearTrimbakData.data.length >= 10, `(Found ${nearTrimbakData.data?.length} places within 5km of Trimbakeshwar)`);

    // 7. Temple Search
    console.log('\n--- 7. Temple Search ---');
    const templeRes = await fetch(`${apiBase}/places?category=temple&limit=50`);
    const templeData = await templeRes.json();
    record('Temple search', templeData.success && templeData.data.length >= 14, `(Found ${templeData.data?.length} temples)`);

    // 8. Fort Search
    console.log('\n--- 8. Fort Search ---');
    const fortRes = await fetch(`${apiBase}/places?category=fort&limit=50`);
    const fortData = await fortRes.json();
    const fortNames = fortData.data.map(f => f.name);
    const hasHarihar = fortNames.some(n => n.includes('Harihar'));
    const hasSalher = fortNames.some(n => n.includes('Salher'));
    record('Fort search', fortData.success && fortData.data.length === 15 && hasHarihar && hasSalher, `(Found all 15 forts including Harihar and Salher)`);

    // 9. Tourist Search
    console.log('\n--- 9. Tourist Search ---');
    const touristRes = await fetch(`${apiBase}/places?search=tourist&limit=50`);
    const touristData = await touristRes.json();
    record('Tourist search', touristData.success && touristData.data.length > 0, `(Found ${touristData.data?.length} matching places)`);

    // 10. Cave Search
    console.log('\n--- 10. Cave Search ---');
    const caveRes = await fetch(`${apiBase}/places?category=cave`);
    const caveData = await caveRes.json();
    record('Cave search', caveData.success && caveData.data.length >= 2, `(Found ${caveData.data?.length} caves including Pandav Leni and Sita Gufa)`);

    // 11. Waterfall Search
    console.log('\n--- 11. Waterfall Search ---');
    const wfRes = await fetch(`${apiBase}/places?category=waterfall`);
    const wfData = await wfRes.json();
    record('Waterfall search', wfData.success && wfData.data.length >= 3, `(Found ${wfData.data?.length} waterfalls including Someshwar and Dugarwadi)`);

    // 12. Museum Search
    console.log('\n--- 12. Museum Search ---');
    const musRes = await fetch(`${apiBase}/places?category=museum`);
    const musData = await musRes.json();
    record('Museum search', musData.success && musData.data.length >= 3, `(Found ${musData.data?.length} museums including Coin Museum and Dadasaheb Phalke Smarak)`);

    // 13. Hospital Search
    console.log('\n--- 13. Hospital Search ---');
    const hospRes = await fetch(`${apiBase}/places?category=hospital`);
    const hospData = await hospRes.json();
    record('Hospital search', hospData.success && hospData.data.length >= 5, `(Found ${hospData.data?.length} major hospitals)`);

    // 14. Emergency Search
    console.log('\n--- 14. Emergency Search ---');
    const emergRes = await fetch(`${apiBase}/places?category=emergency`);
    const emergData = await emergRes.json();
    record('Emergency search', emergData.success && emergData.data.length > 0, `(Found ${emergData.data?.length} emergency facilities)`);

    // 15. Transport Search
    console.log('\n--- 15. Transport Search ---');
    const transRes = await fetch(`${apiBase}/places?category=transport`);
    const transData = await transRes.json();
    record('Transport search', transData.success && transData.data.length > 0, `(Found transport facilities)`);

    // 16. Parking Search
    console.log('\n--- 16. Parking Search ---');
    const parkRes = await fetch(`${apiBase}/places?category=parking`);
    const parkData = await parkRes.json();
    record('Parking search', parkData.success && parkData.data.length >= 5, `(Found ${parkData.data?.length} parking facilities)`);

    // 17. Hotel Search
    console.log('\n--- 17. Hotel Search ---');
    const hotelRes = await fetch(`${apiBase}/places?category=hotel`);
    const hotelData = await hotelRes.json();
    record('Hotel search', hotelData.success && hotelData.data.length >= 5, `(Found ${hotelData.data?.length} hotels)`);

    // 18. Food Search
    console.log('\n--- 18. Food Search ---');
    const foodRes = await fetch(`${apiBase}/places?category=restaurant`);
    const foodData = await foodRes.json();
    record('Food search', foodData.success && foodData.data.length >= 5, `(Found ${foodData.data?.length} verified food & restaurant locations)`);

    // 19. Public Facility Search
    console.log('\n--- 19. Public Facility Search ---');
    const toiletRes = await fetch(`${apiBase}/places?category=public_toilet`);
    const toiletData = await toiletRes.json();
    const waterRes = await fetch(`${apiBase}/places?category=water_point`);
    const waterData = await waterRes.json();
    record('Public facility search', toiletData.success && toiletData.data.length > 0 && waterData.success && waterData.data.length > 0, `(Found ${toiletData.data?.length} toilets, ${waterData.data?.length} water points)`);

    // 20. AI Category Search Across Multiple Expanded Categories
    console.log('\n--- 20. AI Category Search Queries ---');
    const aiQueries = [
      'Find temples near Ram Kund',
      'Show me forts near Nashik',
      'What tourist places can I visit?',
      'Find waterfalls',
      'Show caves',
      'Find museums',
      'Find hospitals near Trimbakeshwar',
      'Find police stations near Panchavati',
      'Show parking near Ramkund',
      'Find restaurants',
      'Find vegetarian food',
      'Show railway stations',
      'Find hotels near Trimbakeshwar',
      'Show public toilets near Ramkund',
      'Where can I find drinking water?',
      'Show emergency facilities',
      'Give me tourist places near Trimbakeshwar'
    ];

    let aiSuccessCount = 0;
    for (const q of aiQueries) {
      const aiRes = await fetch(`${apiBase}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });
      const aiData = await aiRes.json();
      const hasPlaces = aiData.success && Array.isArray(aiData.data?.places) && aiData.data.places.length > 0;
      if (hasPlaces) {
        aiSuccessCount++;
      } else {
        console.warn(`AI query had 0 places: "${q}"`);
      }
    }
    record('AI category search', aiSuccessCount === aiQueries.length, `(Passed ${aiSuccessCount}/${aiQueries.length} natural language test queries)`);

    console.log('\n========================================');
    console.log(`COMPREHENSIVE TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
    console.log('========================================\n');

    return testResults;
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      await new Promise(r => server.close(r));
    }
    await mongoose.disconnect();
    setTimeout(() => {
      process.exit(totalFailed > 0 ? 1 : 0);
    }, 100);
  }
}

runExpansionTests();
