import express from 'express';
import { getFirstAidGuidance } from '../controllers/firstAidController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/v1/first-aid/guidance
 * @desc    Get first aid guidance from n8n chatbot
 * @access  Private
 */
router.post('/guidance', authenticate, getFirstAidGuidance);

export default router;
