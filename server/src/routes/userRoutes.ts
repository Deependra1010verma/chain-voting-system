import express from 'express';
import { getVoters, verifyVoter } from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

router.get('/', protect, admin, getVoters);
router.patch('/:id/verify', protect, admin, verifyVoter);

export default router;
