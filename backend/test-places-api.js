process.env.NODE_ENV = 'test';
import mongoose from 'mongoose';
import app from './src/server.js';

const PORT = 5055; // Use dedicated test port to avoid conflict
let server;

async function runTests() {
  console.log('=== RUNNING PLACE API ENDPOINT TESTS ===\n');
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

  // Ensure DB connected
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumbhmitra';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  const baseUrl = `http://localhost:${PORT}/api/places`;

  try {
    // Test 1: GET /api/places (default pagination)
    console.log('\n--- 1. Test GET /api/places ---');
    const res1 = await fetch(`${baseUrl}`);
    const data1 = await res1.json();
    assert(res1.status === 200, 'Status code 200');
    assert(data1.success === true, 'Response has success: true');
    assert(typeof data1.count === 'number', 'Response has count property');
    assert(Array.isArray(data1.data), 'Response data is array');
    assert(data1.data.length > 0, `Returned ${data1.data.length} places`);
    assert(data1.page === 1, 'Default page is 1');
    assert(data1.totalPages >= 1, 'totalPages is >= 1');

    const samplePlace = data1.data[0];
    const sampleId = samplePlace._id;

    // Test 2: Category Filter: GET /api/places?category=ghat
    console.log('\n--- 2. Test GET /api/places?category=ghat ---');
    const res2 = await fetch(`${baseUrl}?category=ghat`);
    const data2 = await res2.json();
    assert(res2.status === 200, 'Status code 200');
    assert(data2.success === true, 'Response success: true');
    assert(data2.data.length > 0, 'Found ghat places');
    assert(data2.data.every(p => p.category === 'ghat'), 'All places have category === ghat');

    // Test 3: Text Search: GET /api/places?search=Ram
    console.log('\n--- 3. Test GET /api/places?search=Ram ---');
    const res3 = await fetch(`${baseUrl}?search=Ram`);
    const data3 = await res3.json();
    assert(res3.status === 200, 'Status code 200');
    assert(data3.success === true, 'Response success: true');
    assert(data3.data.some(p => p.name.includes('Ram')), 'Found place with "Ram" in name');

    // Test 4: Pagination parameters: GET /api/places?page=2&limit=3
    console.log('\n--- 4. Test GET /api/places?page=2&limit=3 ---');
    const res4 = await fetch(`${baseUrl}?page=2&limit=3`);
    const data4 = await res4.json();
    assert(res4.status === 200, 'Status code 200');
    assert(data4.page === 2, 'Page matches query 2');
    assert(data4.data.length <= 3, 'Items returned <= limit 3');

    // Test 5: Invalid page / limit validation
    console.log('\n--- 5. Test invalid pagination error handling ---');
    const res5 = await fetch(`${baseUrl}?page=-1`);
    const data5 = await res5.json();
    assert(res5.status === 400, 'Status 400 for negative page');
    assert(data5.success === false, 'success: false');
    assert(typeof data5.error === 'string', 'Error message returned');

    // Test 6: GET /api/places/nearby (Ram Kund Ghat coordinates [73.7904, 20.0059])
    console.log('\n--- 6. Test GET /api/places/nearby ---');
    const res6 = await fetch(`${baseUrl}/nearby?lat=20.0059&lng=73.7904&radius=5000`);
    const data6 = await res6.json();
    assert(res6.status === 200, 'Status code 200');
    assert(data6.success === true, 'Response success: true');
    assert(typeof data6.count === 'number', 'count is a number');
    assert(Array.isArray(data6.data), 'data is an array');
    assert(data6.data.length > 0, `Nearby returned ${data6.data.length} places within 5km`);
    assert(data6.data[0].name === 'Ram Kund Ghat', 'Closest place is Ram Kund Ghat itself');

    // Test 7: GET /api/places/nearby with category filter
    console.log('\n--- 7. Test GET /api/places/nearby with category=temple ---');
    const res7 = await fetch(`${baseUrl}/nearby?lat=20.0059&lng=73.7904&radius=5000&category=temple`);
    const data7 = await res7.json();
    assert(res7.status === 200, 'Status code 200');
    assert(data7.data.length > 0, 'Found nearby temples');
    assert(data7.data.every(p => p.category === 'temple'), 'All nearby returned items are temples');

    // Test 8: GET /api/places/nearby validation errors (missing / invalid lat/lng)
    console.log('\n--- 8. Test nearby parameter validation ---');
    const res8a = await fetch(`${baseUrl}/nearby?lng=73.7904`);
    const data8a = await res8a.json();
    assert(res8a.status === 400, 'Status 400 when lat is missing');
    assert(data8a.success === false, 'data.success === false');

    const res8b = await fetch(`${baseUrl}/nearby?lat=999&lng=73.7904`);
    const data8b = await res8b.json();
    assert(res8b.status === 400, 'Status 400 when lat > 90');

    const res8c = await fetch(`${baseUrl}/nearby?lat=20.0059&lng=73.7904&radius=-100`);
    const data8c = await res8c.json();
    assert(res8c.status === 400, 'Status 400 when radius <= 0');

    // Test 9: GET /api/places/:id (valid ID)
    console.log('\n--- 9. Test GET /api/places/:id with valid ID ---');
    const res9 = await fetch(`${baseUrl}/${sampleId}`);
    const data9 = await res9.json();
    assert(res9.status === 200, 'Status code 200');
    assert(data9.success === true, 'Response success: true');
    assert(data9.data._id === sampleId, 'Returned place _id matches requested ID');
    assert(typeof data9.data.name === 'string', 'Place has name string');

    // Test 10: GET /api/places/:id with invalid ObjectId format
    console.log('\n--- 10. Test GET /api/places/:id with invalid ObjectId ---');
    const res10 = await fetch(`${baseUrl}/invalid-id-xyz`);
    const data10 = await res10.json();
    assert(res10.status === 400, 'Status code 400 for invalid ObjectId');
    assert(data10.success === false, 'Response success: false');
    assert(typeof data10.error === 'string', 'Error message returned');

    // Test 11: GET /api/places/:id with non-existent valid ObjectId (404)
    console.log('\n--- 11. Test GET /api/places/:id with 404 non-existent ID ---');
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const res11 = await fetch(`${baseUrl}/${nonExistentId}`);
    const data11 = await res11.json();
    assert(res11.status === 404, 'Status code 404 for non-existent ID');
    assert(data11.success === false, 'Response success: false');
    assert(typeof data11.error === 'string', 'Error message returned');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise(r => server.close(r));
    }
    await mongoose.disconnect();
    setTimeout(() => {
      process.exit(failed > 0 ? 1 : 0);
    }, 100);
  }
}

runTests();
