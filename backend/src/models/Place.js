import mongoose from 'mongoose';

/**
 * GeoJSON Point Schema for 2D/3D spatial indexing and calculations
 */
const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function (coords) {
          return (
            Array.isArray(coords) &&
            coords.length === 2 &&
            coords[0] >= -180 &&
            coords[0] <= 180 &&
            coords[1] >= -90 &&
            coords[1] <= 90
          );
        },
        message: 'Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]'
      }
    }
  },
  { _id: false }
);

/**
 * Valid POI categories across Nashik & Trimbakeshwar for AI KumbhMitra
 */
export const VALID_CATEGORIES = [
  'temple',
  'ghat',
  'kumbh_zone',
  'akhada',
  'ashram',
  'dharamshala',
  'bhakta_niwas',
  'guest_house',
  'hospital',
  'medical',
  'ambulance',
  'blood_bank',
  'pharmacy',
  'police',
  'fire_station',
  'emergency',
  'restaurant',
  'hotel',
  'transport',
  'railway',
  'bus_stand',
  'parking',
  'public_toilet',
  'toilet', // alias for public_toilet
  'water_point',
  'help_center',
  'tourist_spot',
  'fort',
  'cave',
  'waterfall',
  'museum',
  'nature',
  'viewpoint',
  'government_facility',
  'tourist_information',
  'rest_area',
  'other_public_facility',
  'shop' // preserved for backward compatibility
];

/**
 * Place Schema
 * Represents points of interest (POIs) across Nashik and Trimbakeshwar for Kumbh Mela 2027.
 */
const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Place category is required'],
      lowercase: true,
      trim: true,
      enum: VALID_CATEGORIES
    },
    subcategory: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    location: {
      type: pointSchema,
      required: [true, 'GeoJSON location is required']
    },
    address: {
      type: mongoose.Schema.Types.Mixed, // Supports structured { area, city, district, state } or formatted string
      required: false
    },
    contact: {
      type: String,
      trim: true
    },
    openingHours: {
      open: {
        type: String,
        trim: true
      },
      close: {
        type: String,
        trim: true
      }
    },
    accessibility: {
      wheelchairAccessible: {
        type: Boolean,
        default: false
      },
      seniorFriendly: {
        type: Boolean,
        default: true
      }
    },
    facilities: [
      {
        type: String,
        trim: true
      }
    ],
    services: [
      {
        type: String,
        trim: true
      }
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    importance: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    kumbhRelevant: {
      type: Boolean,
      default: false
    },
    verified: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      trim: true
    },

    // Category-specific fields
    foodType: {
      type: String,
      trim: true
    },
    budget: {
      type: String,
      trim: true
    },
    emergency: {
      type: Boolean,
      default: false
    },
    twentyFourSeven: {
      type: Boolean,
      default: false
    },
    ICU: {
      type: Boolean,
      default: false
    },
    ambulance: {
      type: Boolean,
      default: false
    },
    bloodBank: {
      type: Boolean,
      default: false
    },
    capacity: {
      type: Number
    },
    paid: {
      type: Boolean
    },
    vehicleType: [
      {
        type: String,
        trim: true
      }
    ],
    shuttleAvailable: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Geospatial 2dsphere index for proximity/bounding box queries
placeSchema.index({ location: '2dsphere' });

// Compound text index for search across names, descriptions, tags, and subcategory
placeSchema.index({ name: 'text', description: 'text', tags: 'text', subcategory: 'text' });

// Category index for filtering
placeSchema.index({ category: 1 });

// Kumbh relevance index
placeSchema.index({ kumbhRelevant: 1 });

const Place = mongoose.model('Place', placeSchema);

export default Place;
