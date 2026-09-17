import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";
import placeRoutes from "./routes/place.routes.js";
import connectDB from "./config/db.js";

// Load environment variables
dotenv.config();

// Connect to Database if configured
if (process.env.MONGO_URI || process.env.MONGODB_URI) {
  connectDB().catch((err) => {
    console.error(`[MongoDB] Server startup connection warning: ${err.message}`);
  });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", healthRoutes);
app.use("/api/places", placeRoutes);

// Fallback 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[AI KumbhMitra Backend] Server running on port ${PORT}`);
    console.log(`[AI KumbhMitra Backend] Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
