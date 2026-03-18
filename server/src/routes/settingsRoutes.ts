import express from 'express';
import { getSettings, updateSettings, getAnalytics, declareResult, undeclareResult, getElectionHistory } from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

// Public route to get settings (so users can see election name/dates on Dashboard)
router.get('/', getSettings);
router.get('/history', protect, getElectionHistory);

// Admin routes
router.put('/', protect, admin, updateSettings);
router.get('/analytics', protect, admin, getAnalytics);
router.post('/declare-result', protect, admin, declareResult);
router.delete('/declare-result', protect, admin, undeclareResult);

export default router;

