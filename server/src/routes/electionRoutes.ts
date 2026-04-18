import express from 'express';
import { getAllElections, getElectionById } from '../controllers/electionController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protected route — needs auth to check user's votedElections
router.get('/', protect, getAllElections);
router.get('/:electionId', protect, getElectionById);

export default router;
