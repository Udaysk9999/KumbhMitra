import express from 'express';
import { createRoute } from '../controllers/route.controller.js';
import { validateRouteBody } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/routes (or / if mounted at /api/routes)
 * @desc    Calculate route between origin and destination coordinates
 * @access  Public
 */
router.post(['/', '/routes'], validateRouteBody, createRoute);

export default router;
