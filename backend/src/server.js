import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api", healthRoutes);

// Fallback 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found`
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[AI KumbhMitra Backend] Server running on port ${PORT}`);
  console.log(`[AI KumbhMitra Backend] Health check: http://localhost:${PORT}/api/health`);
});

export default app;
