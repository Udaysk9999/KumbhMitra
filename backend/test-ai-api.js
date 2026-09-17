process.env.NODE_ENV = 'test';
import app from './src/server.js';
import mongoose from 'mongoose';

const PORT = 5058;
let server;

async function runTests() {
  console.log('=== RUNNING PHASE 6 AI INTENT EXTRACTION & SAFETY TESTS ===\n');
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

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumbhmitra';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  const chatUrl = `http://localhost:${PORT}/api/ai/chat`;

  try {
    // 1. Search intent: "Find temples in Nashik"
    console.log('--- 1. Search Intent: "Find temples in Nashik" ---');
    const res1 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Find temples in Nashik' })
    });
    const d1 = await res1.json();
    assert(res1.status === 200, 'Status code 200');
    assert(d1.success === true, 'Response success: true');
    assert(Array.isArray(d1.data.places) && d1.data.places.length > 0, `Returned ${d1.data.places?.length} temples`);
    assert(d1.data.places.every(p => p.category === 'temple'), 'All returned places have category === temple');
    assert(d1.data.route === null, 'Route is null for search');

    // 2. Nearby intent: "Places near Ram Kund"
    console.log('\n--- 2. Nearby Intent: "Places near Ram Kund" ---');
    const res2 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Places near Ram Kund' })
    });
    const d2 = await res2.json();
    assert(res2.status === 200, 'Status code 200');
    assert(d2.success === true, 'Response success: true');
    assert(Array.isArray(d2.data.places) && d2.data.places.length > 0, `Found ${d2.data.places?.length} nearby places`);
    assert(d2.data.route === null, 'Route is null for nearby search');
    assert(d2.data.reply.toLowerCase().includes('ram kund'), 'Reply mentions Ram Kund');

    // 3. Place info: "Tell me about Kalaram Temple"
    console.log('\n--- 3. Place Info: "Tell me about Kalaram Temple" ---');
    const res3 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about Kalaram Temple' })
    });
    const d3 = await res3.json();
    assert(res3.status === 200, 'Status code 200');
    assert(d3.success === true, 'Response success: true');
    assert(d3.data.places.length === 1, 'Returns 1 place record');
    assert(d3.data.places[0].name === 'Kalaram Temple', 'Place name matches Kalaram Temple');
    assert(d3.data.route === null, 'Route is null for place info');

    // 4. Route intent: "Route from Ram Kund to Trimbakeshwar"
    console.log('\n--- 4. Route Intent: "Route from Ram Kund to Trimbakeshwar" ---');
    const res4 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Route from Ram Kund to Trimbakeshwar' })
    });
    const d4 = await res4.json();
    assert(res4.status === 200, 'Status code 200');
    assert(d4.success === true, 'Response success: true');
    assert(d4.data.route !== null, 'Route object is present');
    assert(d4.data.route.distanceKm > 20, `Route distance is ${d4.data.route?.distanceKm} km (>20 km)`);
    assert(d4.data.route.durationMins > 0, `Route duration is ${d4.data.route?.durationMins} mins (>0)`);
    assert(d4.data.places.length === 2, 'Returns origin and destination places');

    // 5. Missing route destination
    console.log('\n--- 5. Missing Information: "Give me a route from Ram Kund" ---');
    const res5 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Give me a route from Ram Kund' })
    });
    const d5 = await res5.json();
    assert(res5.status === 200, 'Status code 200');
    assert(d5.success === true, 'Response success: true');
    assert(d5.data.route === null, 'Route is null when destination is missing');
    assert(d5.data.reply.toLowerCase().includes('destination'), 'Reply requests destination clarification');

    // 6. Unknown place: "Tell me about Hogwarts Castle"
    console.log('\n--- 6. Unknown Place: "Tell me about Hogwarts Castle" ---');
    const res6 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Tell me about Hogwarts Castle' })
    });
    const d6 = await res6.json();
    assert(res6.status === 200, 'Status code 200');
    assert(d6.success === true, 'Response success: true');
    assert(Array.isArray(d6.data.places) && d6.data.places.length === 0, 'Does not return fake places for unknown site');
    assert(d6.data.route === null, 'Route is null');
    assert(d6.data.reply.includes('not have verified information') || d6.data.reply.includes('could not find'), 'Reply explains information is unavailable');

    // 7. Unsupported/out-of-scope request: "Find pizza places on Mars"
    console.log('\n--- 7. Unsupported / Out-of-Scope: "Find pizza places on Mars" ---');
    const res7 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Find pizza places on Mars' })
    });
    const d7 = await res7.json();
    assert(res7.status === 200, 'Status code 200');
    assert(d7.success === true, 'Response success: true');
    assert(Array.isArray(d7.data.places) && d7.data.places.length === 0, 'No fabricated places returned (places is empty array)');
    assert(d7.data.route === null, 'Route is null');
    assert(d7.data.reply.includes('Nashik and Trimbakeshwar') || d7.data.reply.includes('could not find'), 'Reply explains scope boundary');

    // 8. Prompt asking AI to invent a place
    console.log('\n--- 8. Fabrication Protection: "Invent a new temple in Nashik with magical powers" ---');
    const res8 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Invent a new temple in Nashik with magical powers' })
    });
    const d8 = await res8.json();
    assert(res8.status === 200, 'Status code 200');
    assert(d8.success === true, 'Response success: true');
    assert(Array.isArray(d8.data.places) && d8.data.places.length === 0, 'Zero fabricated places in database output');
    assert(d8.data.route === null, 'Route is null');
    assert(d8.data.reply.toLowerCase().includes('cannot invent') || d8.data.reply.toLowerCase().includes('verified'), 'Reply refuses fabrication and insists on verified data');

    console.log(`\n========================================`);
    console.log(`PHASE 6 TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exitCode = 1;
    }
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
