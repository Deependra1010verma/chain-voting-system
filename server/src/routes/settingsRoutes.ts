import express from 'express';
import { getSettings, updateSettings, getAnalytics } from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

// Public route to get settings (so users can see election name/dates on Dashboard)
router.get('/', getSettings);

// Admin routes
router.put('/', protect, admin, updateSettings);
router.get('/analytics', protect, admin, getAnalytics);

export default router;
