import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";
import placeRoutes from "./routes/place.routes.js";
import routeRoutes from "./routes/route.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import connectDB from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/error.middleware.js";

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

// CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", healthRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/ai", aiRoutes);

// 404 Fallback Handler
app.use(notFoundHandler);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[AI KumbhMitra Backend] Server running on port ${PORT}`);
    console.log(`[AI KumbhMitra Backend] Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
