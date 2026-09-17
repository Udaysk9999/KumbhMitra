/**
 * Health check controller for AI KumbhMitra backend
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI KumbhMitra backend is running",
    data: {
      status: "healthy",
      service: "ai-kumbhmitra-backend",
      scope: "Nashik & Trimbakeshwar",
      timestamp: new Date().toISOString()
    }
  });
};

export default {
  getHealth
};
