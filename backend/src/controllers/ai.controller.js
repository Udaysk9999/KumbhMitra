import { processUserMessage } from '../services/ai.service.js';
import { getAIHealth } from '../services/ai/provider.js';

/**
 * @desc    Process natural language question for Ask Mitra Assistant
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        reply: '',
        error: "Field 'message' is required and must be a non-empty string."
      });
    }

    const trimmed = message.trim();
    if (trimmed.length > 1000) {
      return res.status(400).json({
        success: false,
        reply: '',
        error: "Message exceeds the maximum allowed length of 1000 characters."
      });
    }

    const safeContext = (context && typeof context === 'object' && !Array.isArray(context)) ? context : {};

    const result = await processUserMessage(trimmed, safeContext);

    return res.status(200).json({
      success: true,
      reply: result.reply,
      provider: result.provider,
      data: {
        reply: result.reply,
        places: result.places,
        route: result.route
      }
    });
  } catch (error) {
    console.error('[AI Controller] Error:', error.message);
    return res.status(500).json({
      success: false,
      reply: '',
      error: error.message || 'Unable to generate a response.'
    });
  }
};

/**
 * @desc    Diagnostic health check for configured AI provider
 * @route   GET /api/ai/health
 * @access  Public
 */
export const getAIHealthStatus = (req, res) => {
  try {
    const health = getAIHealth();
    return res.status(200).json(health);
  } catch (err) {
    return res.status(500).json({
      success: false,
      provider: process.env.AI_PROVIDER || 'gemini',
      configured: false,
      error: err.message
    });
  }
};

export default {
  chatWithAI,
  getAIHealthStatus
};
