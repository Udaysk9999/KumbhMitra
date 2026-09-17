import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== VERIFYING GOOGLE MAPS FIX ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Check GoogleMap.jsx source
const googleMapPath = path.join(__dirname, 'src', 'maps', 'GoogleMap.jsx');
const googleMapSource = fs.readFileSync(googleMapPath, 'utf8');

assert(!googleMapSource.includes('new Loader('), 'GoogleMap.jsx does not instantiate new Loader()');
assert(!googleMapSource.includes("import { Loader }"), 'GoogleMap.jsx does not import deprecated Loader class');
assert(googleMapSource.includes('setOptions'), 'GoogleMap.jsx imports and uses setOptions');
assert(googleMapSource.includes('importLibrary'), 'GoogleMap.jsx imports and uses importLibrary');
assert(googleMapSource.includes("key: apiKey"), "GoogleMap.jsx uses 'key' parameter for setOptions instead of deprecated 'apiKey'");
assert(googleMapSource.includes("importLibrary('maps')"), "GoogleMap.jsx imports 'maps' library");
assert(googleMapSource.includes("importLibrary('marker')"), "GoogleMap.jsx imports 'marker' library");
assert(googleMapSource.includes("importLibrary('places')"), "GoogleMap.jsx imports 'places' library");
assert(googleMapSource.includes("importLibrary('geometry')"), "GoogleMap.jsx imports 'geometry' library");
assert(googleMapSource.includes('isOptionsConfigured'), 'GoogleMap.jsx prevents duplicate setOptions / script bootstrap');

// 2. Check MapContainer.jsx
const mapContainerPath = path.join(__dirname, 'src', 'maps', 'MapContainer.jsx');
const mapContainerSource = fs.readFileSync(mapContainerPath, 'utf8');
assert(mapContainerSource.includes('import.meta.env.VITE_GOOGLE_MAPS_API_KEY'), 'MapContainer reads VITE_GOOGLE_MAPS_API_KEY from environment');

// 3. Check Built Vite Bundle in dist
const distDir = path.join(__dirname, 'dist', 'assets');
let distJs = '';
if (fs.existsSync(distDir)) {
  const jsFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
  if (jsFiles.length > 0) {
    distJs = fs.readFileSync(path.join(distDir, jsFiles[0]), 'utf8');
  }
}

assert(distJs.length > 0, 'Production bundle exists in dist/assets');
assert(!distJs.includes('new Loader('), 'Production bundle does not instantiate new Loader()');
assert(!distJs.includes('The Loader class is no longer available in this version'), 'Production bundle does not trigger deprecated Loader exception');

console.log(`\n========================================`);
console.log(`VERIFICATION SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`========================================\n`);

if (failCount > 0) {
  process.exit(1);
}
