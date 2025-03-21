import express from 'express';
import { chatWithAICoach, getChatHistory, clearChatHistory } from '../Controller/coachAI.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Chat with AI Coach
router.post('/chat', chatWithAICoach);

// Get chat history
router.get('/history', getChatHistory);

// Clear chat history
router.delete('/history', clearChatHistory);

export default router;