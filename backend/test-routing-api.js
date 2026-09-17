process.env.NODE_ENV = 'test';
import app from './src/server.js';

const PORT = 5056; // Dedicated test port
let server;

async function runTests() {
  console.log('=== RUNNING OSRM ROUTING API TESTS ===\n');
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

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  const baseUrl = `http://localhost:${PORT}/api/routes`;

  try {
    // Test 1: POST /api/routes - Valid Driving Route (Ram Kund to Trimbakeshwar)
    console.log('\n--- 1. Test POST /api/routes (Driving: Ram Kund -> Trimbakeshwar) ---');
    const res1 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 20.0059, lng: 73.7904 },
        destination: { lat: 19.9324, lng: 73.5302 },
        mode: 'driving'
      })
    });
    const data1 = await res1.json();
    assert(res1.status === 200, 'Status code 200');
    assert(data1.success === true, 'Response has success: true');
    assert(typeof data1.data.distanceKm === 'number' && data1.data.distanceKm > 20, `distanceKm is ${data1.data?.distanceKm} km (>20 km)`);
    assert(typeof data1.data.durationMins === 'number' && data1.data.durationMins > 0, `durationMins is ${data1.data?.durationMins} mins (>0)`);
    assert(data1.data.geometry?.type === 'LineString', 'Geometry is a GeoJSON LineString');
    assert(Array.isArray(data1.data.geometry?.coordinates) && data1.data.geometry.coordinates.length > 10, 'Geometry has multiple coordinate points');
    assert(Array.isArray(data1.data.steps) && data1.data.steps.length > 0, `Returned ${data1.data.steps?.length} turn-by-turn steps`);
    assert(typeof data1.data.steps[0].instruction === 'string', 'Step has human-readable instruction string');

    // Test 2: POST /api/routes - Valid Foot Route (Ram Kund to Kalaram Temple)
    console.log('\n--- 2. Test POST /api/routes (Foot: Ram Kund -> Kalaram) ---');
    const res2 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 20.0059, lng: 73.7904 },
        destination: { lat: 20.0078, lng: 73.7925 },
        mode: 'foot'
      })
    });
    const data2 = await res2.json();
    assert(res2.status === 200, 'Status code 200');
    assert(data2.success === true, 'Response success: true');
    assert(data2.data.mode === 'foot', 'Mode is foot');
    assert(data2.data.distanceKm < 3, `Foot distance is short (${data2.data?.distanceKm} km)`);
    assert(data2.data.geometry?.type === 'LineString', 'Foot route geometry is LineString');

    // Test 3: POST /api/routes - Missing Origin
    console.log('\n--- 3. Test Missing Origin validation ---');
    const res3 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination: { lat: 19.9324, lng: 73.5302 }
      })
    });
    const data3 = await res3.json();
    assert(res3.status === 400, 'Status 400 for missing origin');
    assert(data3.success === false, 'success: false');
    assert(typeof data3.error === 'string', 'Error message returned');

    // Test 4: POST /api/routes - Missing Destination
    console.log('\n--- 4. Test Missing Destination validation ---');
    const res4 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 20.0059, lng: 73.7904 }
      })
    });
    const data4 = await res4.json();
    assert(res4.status === 400, 'Status 400 for missing destination');
    assert(data4.success === false, 'success: false');

    // Test 5: POST /api/routes - Invalid Coordinate Out of Range
    console.log('\n--- 5. Test Coordinate Out of Range validation ---');
    const res5 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 95.0, lng: 73.7904 },
        destination: { lat: 19.9324, lng: 73.5302 }
      })
    });
    const data5 = await res5.json();
    assert(res5.status === 400, 'Status 400 for latitude > 90');
    assert(data5.success === false, 'success: false');
    assert(data5.error.includes('latitude between -90 and 90'), 'Error specifies latitude bounds');

    // Test 6: POST /api/routes - Unsupported Mode
    console.log('\n--- 6. Test Unsupported Mode validation ---');
    const res6 = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 20.0059, lng: 73.7904 },
        destination: { lat: 19.9324, lng: 73.5302 },
        mode: 'helicopter'
      })
    });
    const data6 = await res6.json();
    assert(res6.status === 400, 'Status 400 for invalid mode');
    assert(data6.success === false, 'success: false');
    assert(data6.error.includes('Supported modes are'), 'Error mentions supported modes');

    console.log(`\n========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) {
      await new Promise((r) => server.close(r));
    }
    setTimeout(() => {
      process.exit(failed > 0 ? 1 : 0);
    }, 100);
  }
}

runTests();
