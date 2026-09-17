process.env.NODE_ENV = 'test';
import app from './src/server.js';
import mongoose from 'mongoose';

const PORT = 5057;
let server;

async function verifyAll() {
  console.log('=== PHASE 4 COMPREHENSIVE ENDPOINT VERIFICATION ===\n');

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumbhmitra';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  const base = `http://localhost:${PORT}/api`;
  const results = {};

  try {
    // 1. GET /api/health
    console.log('--- 1. Testing GET /api/health ---');
    const r1 = await fetch(`${base}/health`);
    const d1 = await r1.json();
    console.log(`Status: ${r1.status}`);
    console.log(`Response:`, JSON.stringify(d1, null, 2));
    results['Health'] = r1.status === 200 && d1.success === true ? 'PASS' : 'FAIL';

    // 2. GET /api/places
    console.log('\n--- 2. Testing GET /api/places ---');
    const r2 = await fetch(`${base}/places`);
    const d2 = await r2.json();
    console.log(`Status: ${r2.status}`);
    console.log(`Count: ${d2.count}, Total: ${d2.total}, Page: ${d2.page}`);
    console.log(`First place: ${d2.data?.[0]?.name}`);
    results['Places'] = r2.status === 200 && d2.success === true && d2.count > 0 ? 'PASS' : 'FAIL';

    // 3. GET /api/places?category=temple
    console.log('\n--- 3. Testing GET /api/places?category=temple ---');
    const r3 = await fetch(`${base}/places?category=temple`);
    const d3 = await r3.json();
    console.log(`Status: ${r3.status}`);
    console.log(`Found temples:`, d3.data?.map(p => p.name));
    results['Search/filter'] = r3.status === 200 && d3.success === true && d3.data?.every(p => p.category === 'temple') ? 'PASS' : 'FAIL';

    // 4. GET /api/places/nearby?lat=20.0059&lng=73.7904&radius=5000
    console.log('\n--- 4. Testing GET /api/places/nearby?lat=20.0059&lng=73.7904&radius=5000 ---');
    const r4 = await fetch(`${base}/places/nearby?lat=20.0059&lng=73.7904&radius=5000`);
    const d4 = await r4.json();
    console.log(`Status: ${r4.status}`);
    console.log(`Nearby places count within 5km of Ram Kund: ${d4.count}`);
    console.log(`Closest 3 places:`, d4.data?.slice(0, 3).map(p => p.name));
    results['Nearby'] = r4.status === 200 && d4.success === true && d4.count > 0 ? 'PASS' : 'FAIL';

    // 5. GET /api/places/:id
    console.log('\n--- 5. Testing GET /api/places/:id ---');
    const sampleId = d2.data?.[0]?._id;
    const r5 = await fetch(`${base}/places/${sampleId}`);
    const d5 = await r5.json();
    console.log(`Status: ${r5.status}`);
    console.log(`Place name: ${d5.data?.name}, ID: ${d5.data?._id}`);
    results['Place details'] = r5.status === 200 && d5.success === true && d5.data?._id === sampleId ? 'PASS' : 'FAIL';

    // 6. POST /api/routes
    console.log('\n--- 6. Testing POST /api/routes ---');
    const r6 = await fetch(`${base}/routes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: { lat: 20.0059, lng: 73.7904 },
        destination: { lat: 19.9324, lng: 73.5302 },
        mode: 'driving'
      })
    });
    const d6 = await r6.json();
    console.log(`Status: ${r6.status}`);
    console.log(`Route distance: ${d6.data?.distanceKm} km, Duration: ${d6.data?.durationMins} mins`);
    console.log(`Geometry type: ${d6.data?.geometry?.type}, Steps count: ${d6.data?.steps?.length}`);
    results['Routing'] = r6.status === 200 && d6.success === true && d6.data?.distanceKm > 20 ? 'PASS' : 'FAIL';

    console.log('\n========================================');
    console.log('VERIFICATION SUMMARY:');
    for (const [testName, status] of Object.entries(results)) {
      console.log(`- ${testName}: ${status}`);
    }
    console.log('========================================\n');
  } catch (err) {
    console.error('Verification error:', err);
  } finally {
    if (server) {
      await new Promise(r => server.close(r));
    }
    await mongoose.disconnect();
    setTimeout(() => {
      process.exit(0);
    }, 100);
  }
}

verifyAll();
