import express from 'express';
import { getBlockchain, castVote, getResults } from '../controllers/voteController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/chain', getBlockchain);
router.post('/vote', protect, castVote);
router.get('/results', getResults);

export default router;
