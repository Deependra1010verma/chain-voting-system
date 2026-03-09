import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { admin } from '../middleware/adminMiddleware';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';

const router = express.Router();

router.get('/', protect, admin, async (req, res) => {
    try {
        const dbLogs = await AuditLog.find().sort({ timestamp: -1 }).populate('userId', 'username email');
        const chainLogs = blockchain.chain; // Just returning the whole chain

        res.json({
            databaseLogs: dbLogs,
            blockchainLogs: chainLogs
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching audit logs' });
    }
});

export default router;
