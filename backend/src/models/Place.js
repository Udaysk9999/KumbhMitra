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
      enum: [
        'temple',
        'ghat',
        'tourist_spot',
        'restaurant',
        'hotel',
        'hospital',
        'parking',
        'police',
        'fire_station',
        'transport',
        'toilet',
        'water_point',
        'help_center',
        'shop'
      ]
    },
    location: {
      type: pointSchema,
      required: [true, 'GeoJSON location is required']
    },
    address: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
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
    services: [
      {
        type: String,
        trim: true
      }
    ]
  },
  {
    timestamps: true
  }
);

// Geospatial 2dsphere index for proximity/bounding box queries
placeSchema.index({ location: '2dsphere' });

// Compound text index for search across names and descriptions
placeSchema.index({ name: 'text', description: 'text' });

const Place = mongoose.model('Place', placeSchema);

export default Place;
