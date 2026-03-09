import express from 'express';
import {
    addCandidate,
    getCandidates,
    getCandidateById,
    updateCandidate,
    deleteCandidate,
    registerAsCandidate
} from '../controllers/candidateController';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';

const router = express.Router();

router.route('/')
    .get(getCandidates)
    .post(protect, admin, addCandidate);

router.post('/register', protect, registerAsCandidate);

router.route('/:id')
    .get(getCandidateById)
    .put(protect, admin, updateCandidate)
    .delete(protect, admin, deleteCandidate);

export default router;
