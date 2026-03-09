import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';

const router = express.Router();

import { protect } from '../middleware/authMiddleware';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;
