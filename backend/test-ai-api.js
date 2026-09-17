process.env.NODE_ENV = 'test';
import app from './src/server.js';
import mongoose from 'mongoose';

const PORT = 5058;
let server;

async function runTests() {
  console.log('=== RUNNING AI ASSISTANT CHAT API TESTS ===\n');
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
    // 1. Search Intent: "Find temples in Nashik"
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
    assert(d1.data.places.every(p => p.category === 'temple'), 'All returned places are temples');
    assert(d1.data.route === null, 'Route is null for search');
    assert(typeof d1.data.reply === 'string' && d1.data.reply.length > 0, 'Reply provided');

    // 2. Nearby Intent: "What places are near Ram Kund?"
    console.log('\n--- 2. Nearby Intent: "What places are near Ram Kund?" ---');
    const res2 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'What places are near Ram Kund?' })
    });
    const d2 = await res2.json();
    assert(res2.status === 200, 'Status code 200');
    assert(d2.success === true, 'Response success: true');
    assert(Array.isArray(d2.data.places) && d2.data.places.length > 0, `Found ${d2.data.places?.length} nearby places`);
    assert(d2.data.reply.toLowerCase().includes('ram kund'), 'Reply mentions Ram Kund');
    assert(d2.data.route === null, 'Route is null for nearby query');

    // 3. Place Info: "Tell me about Kalaram Temple"
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
    assert(d3.data.places[0].name === 'Kalaram Temple', 'Place matches Kalaram Temple');
    assert(d3.data.reply.includes('Kalaram Temple'), 'Reply includes factual details');

    // 4. Route Intent: "Give me a route from Ram Kund to Trimbakeshwar"
    console.log('\n--- 4. Route Intent: "Give me a route from Ram Kund to Trimbakeshwar" ---');
    const res4 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Give me a route from Ram Kund to Trimbakeshwar' })
    });
    const d4 = await res4.json();
    assert(res4.status === 200, 'Status code 200');
    assert(d4.success === true, 'Response success: true');
    assert(d4.data.route !== null, 'Route object is present');
    assert(d4.data.route.distanceKm > 20, `Route distance is ${d4.data.route?.distanceKm} km (>20 km)`);
    assert(d4.data.route.durationMins > 0, `Route duration is ${d4.data.route?.durationMins} mins (>0)`);
    assert(d4.data.places.length === 2, 'Returns origin and destination places');

    // 5. Unknown / Out-of-Scope: "Find pizza places on Mars"
    console.log('\n--- 5. Unknown / Out-of-Scope: "Find pizza places on Mars" ---');
    const res5 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Find pizza places on Mars' })
    });
    const d5 = await res5.json();
    assert(res5.status === 200, 'Status code 200');
    assert(d5.success === true, 'Response success: true');
    assert(Array.isArray(d5.data.places) && d5.data.places.length === 0, 'No fabricated places returned (places is empty array)');
    assert(d5.data.route === null, 'Route is null');
    assert(d5.data.reply.includes('Nashik or Trimbakeshwar') || d5.data.reply.includes('could not find'), 'Reply explains scope boundary');

    // 6. Validation error for empty message
    console.log('\n--- 6. Validation Error: empty message ---');
    const res6 = await fetch(chatUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '' })
    });
    const d6 = await res6.json();
    assert(res6.status === 400, 'Status 400 for empty message');
    assert(d6.success === false, 'success: false on validation failure');

    console.log(`\n========================================`);
    console.log(`AI TESTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
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
