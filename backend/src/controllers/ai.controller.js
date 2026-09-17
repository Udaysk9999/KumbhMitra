import { processUserMessage } from '../services/ai.service.js';

/**
 * @desc    Process natural language question for AI KumbhMitra Assistant
 * @route   POST /api/ai/chat
 * @access  Public
 */
export const chatWithAI = async (req, res, next) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Field 'message' is required and must be a non-empty string."
      });
    }

    const result = await processUserMessage(message.trim());

    return res.status(200).json({
      success: true,
      data: {
        reply: result.reply,
        places: result.places,
        route: result.route
      }
    });
  } catch (error) {
    next(error);
  }
};

export default {
  chatWithAI
};
