import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Connect to MongoDB using Mongoose.
 * Prioritizes process.env.MONGO_URI, with fallback to process.env.MONGODB_URI.
 */
export const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGO_URI is not defined in environment variables. Please check your .env file.';
    console.error(`[MongoDB] Configuration Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection Failed: ${error.message}`);
    throw error;
  }
};

export default connectDB;
