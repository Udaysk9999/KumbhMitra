import express from "express";
import { getHealth } from "../controllers/health.controller.js";

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify backend status
 * @access  Public
 */
router.get("/health", getHealth);

export default router;
