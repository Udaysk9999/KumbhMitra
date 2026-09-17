import express from 'express';
import { chatWithAI } from '../controllers/ai.controller.js';

const router = express.Router();

/**
 * @route   POST /api/ai/chat (or /chat if mounted at /api/ai)
 * @desc    Chat with AI KumbhMitra assistant
 * @access  Public
 */
router.post(['/chat', '/api/ai/chat'], chatWithAI);

export default router;
