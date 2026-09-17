import mongoose from 'mongoose';

/**
 * Health check controller for AI KumbhMitra backend
 * Reports server health, MongoDB connectivity, and AI provider status.
 */
export const getHealth = (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  res.status(200).json({
    success: true,
    message: "AI KumbhMitra backend is running",
    data: {
      status: isDbConnected ? "healthy" : "degraded",
      service: "ai-kumbhmitra-backend",
      scope: "Nashik & Trimbakeshwar",
      database: isDbConnected ? "connected" : "disconnected",
      aiProvider: process.env.GEMINI_API_KEY ? "gemini" : "rule_based",
      timestamp: new Date().toISOString()
    }
  });
};

export default {
  getHealth
};
