import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Place from '../src/models/Place.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kumbhmitra';

const SEED_PLACES = [
  {
    name: 'Ram Kund Ghat',
    category: 'ghat',
    location: {
      type: 'Point',
      coordinates: [73.7904, 20.0059] // [longitude, latitude]
    },
    address: 'Panchavati, Godavari Riverbank, Nashik, Maharashtra 422003',
    description: 'Sacred bathing ghat where millions take the holy dip during Kumbh Mela and Shahi Snan rituals.',
    contact: '+91 253 257 0000',
    openingHours: {
      open: '00:00',
      close: '23:59'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['Holy Dip', 'Godavari Aarti', 'Changing Rooms', 'Life Guard Post', 'Lost & Found Booth']
  },
  {
    name: 'Kalaram Temple',
    category: 'temple',
    location: {
      type: 'Point',
      coordinates: [73.7925, 20.0078]
    },
    address: 'Panchavati Main Chowk, Nashik, Maharashtra 422003',
    description: 'Historic 18th-century black stone temple dedicated to Lord Rama, central to Panchavati heritage pilgrimage.',
    contact: '+91 253 251 1234',
    openingHours: {
      open: '05:00',
      close: '22:00'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['Darshan', 'Pooja Booking', 'Prasad Counter', 'Shoe Keeping Facility', 'Drinking Water']
  },
  {
    name: 'Trimbakeshwar Jyotirlinga Temple',
    category: 'temple',
    location: {
      type: 'Point',
      coordinates: [73.5302, 19.9324]
    },
    address: 'Trimbakeshwar, Western Ghats Foothills, Nashik District, Maharashtra 422212',
    description: 'One of the twelve sacred Jyotirlingas, featuring a three-faced linga representing Brahma, Vishnu, and Shiva; primary focal site for Simhastha Kumbh.',
    contact: '+91 2594 233 215',
    openingHours: {
      open: '05:30',
      close: '21:00'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['VIP Darshan Pass', 'Narayan Nagbali Pooja', 'Locker Room', 'Security Escort', 'Kushavarta Kund Access']
  },
  {
    name: 'Nashik Civil Hospital',
    category: 'hospital',
    location: {
      type: 'Point',
      coordinates: [73.7850, 19.9980]
    },
    address: 'Trimbak Road, Near Police Headquarters, Nashik, Maharashtra 422002',
    description: 'Apex government multi-specialty hospital equipped with 24x7 trauma care, emergency triage, ICU, and Kumbh surge medical wing.',
    contact: '+91 253 257 6106',
    openingHours: {
      open: '00:00',
      close: '23:59'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['24x7 Emergency Trauma', 'Ambulance Hub', 'Blood Bank', 'Pharmacy', 'Special Heat Stroke Unit']
  },
  {
    name: 'Tapovan Parking Grounds',
    category: 'parking',
    location: {
      type: 'Point',
      coordinates: [73.8050, 20.0020]
    },
    address: 'Tapovan Outer Ring Road, Near Kapil Dhara, Nashik, Maharashtra 422011',
    description: 'Major satellite holding parking terminal for buses and private vehicles during peak Kumbh entry restrictions.',
    contact: '+91 253 259 8811',
    openingHours: {
      open: '00:00',
      close: '23:59'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['E-Shuttle Boarding', 'Rest Sheds', 'EV Charging', 'Security Surveillance', 'Sanitation Facilities']
  },
  {
    name: 'CBS Bus Stand Nashik',
    category: 'transport',
    location: {
      type: 'Point',
      coordinates: [73.7820, 19.9940]
    },
    address: 'Sharanpur Road / CBS Circle, Nashik, Maharashtra 422002',
    description: 'Central bus terminal providing high-frequency feeder shuttles connecting Nashik city center, railway stations, and Trimbakeshwar.',
    contact: '+91 253 257 5258',
    openingHours: {
      open: '00:00',
      close: '23:59'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['Intercity MSRTC Buses', 'Trimbakeshwar Shuttle', 'Ticket Counters', 'Helpdesk', 'Cloak Room']
  },
  {
    name: 'Panchavati Police Station',
    category: 'police',
    location: {
      type: 'Point',
      coordinates: [73.7910, 20.0065]
    },
    address: 'Near Malegaon Stand, Panchavati, Nashik, Maharashtra 422003',
    description: 'Primary law enforcement and crowd security headquarters covering the Ramkund sacred ghat sector.',
    contact: '+91 253 251 2233',
    openingHours: {
      open: '00:00',
      close: '23:59'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['24x7 Emergency Response', 'Missing Persons Registration', 'Crowd Regulation', 'CCTV Command Post']
  },
  {
    name: 'Sadhugram Help Center',
    category: 'help_center',
    location: {
      type: 'Point',
      coordinates: [73.8100, 20.0100]
    },
    address: 'Sadhugram Sector 4, Tapovan Grounds, Nashik, Maharashtra 422003',
    description: 'Administrative assistance post providing multilingual guidance, camp registration, and lost-and-found coordination for sadhus and pilgrims.',
    contact: '+91 253 253 1077',
    openingHours: {
      open: '06:00',
      close: '23:00'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['Multilingual Information', 'Akhara Coordination', 'Lost & Found Helpdesk', 'Emergency Public Address']
  },
  {
    name: 'Panchavati Thali Restaurant',
    category: 'restaurant',
    location: {
      type: 'Point',
      coordinates: [73.7930, 20.0050]
    },
    address: 'Vakil Wadi Road, Panchavati, Nashik, Maharashtra 422001',
    description: 'Traditional pure vegetarian restaurant serving authentic Maharashtrian and Gujarati thalis for visiting devotees.',
    contact: '+91 253 257 2345',
    openingHours: {
      open: '11:00',
      close: '22:30'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['Pure Vegetarian Dining', 'Clean Drinking Water', 'Takeaway Food Packets', 'Family Seating']
  },
  {
    name: 'Godavari Water Point',
    category: 'water_point',
    location: {
      type: 'Point',
      coordinates: [73.7900, 20.0055]
    },
    address: 'Ramkund Promenade Walkway, Nashik, Maharashtra 422003',
    description: 'Municipal high-capacity chilled RO drinking water station providing safe, continuous hydration for pilgrims along the ghat promenade.',
    contact: '1800 233 0000',
    openingHours: {
      open: '00:00',
      close: '23:59'
    },
    accessibility: {
      wheelchairAccessible: true,
      seniorFriendly: true
    },
    services: ['RO Purified Water', 'Cold Water Dispenser', 'Bottle Refilling Stations', 'Continuous Disinfection']
  }
];

export const seedDatabase = async () => {
  try {
    console.log(`[Seed] Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Database connection established.');

    // Wipe existing collection
    console.log('[Seed] Wiping existing places collection...');
    const deleteResult = await Place.deleteMany({});
    console.log(`[Seed] Removed ${deleteResult.deletedCount} existing place records.`);

    // Insert POIs
    console.log(`[Seed] Seeding ${SEED_PLACES.length} realistic POIs for Nashik & Trimbakeshwar...`);
    const insertedPlaces = await Place.insertMany(SEED_PLACES);
    console.log(`[Seed] Successfully inserted ${insertedPlaces.length} places.`);

    // Ensure geospatial & text indexes are built
    console.log('[Seed] Ensuring 2dsphere and compound text indexes...');
    await Place.createIndexes();
    console.log('[Seed] Indexes successfully verified:');
    const indexes = await Place.collection.indexes();
    indexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

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
seedDatabase();
