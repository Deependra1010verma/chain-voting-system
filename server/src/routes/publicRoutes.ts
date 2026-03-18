import express from 'express';
import User from '../models/User';
import Settings from '../models/Settings';
import Candidate from '../models/Candidate';
import { blockchain } from '../blockchainInstance';

const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        // 1. Total users registered (for turnout percentage without exposing user data)
        const totalUsers = await User.countDocuments();

        // 2. Total votes cast
        const totalVotes = await User.countDocuments({ hasVoted: true });

        // 3. Candidate data
        const candidates = await Candidate.find({}, 'name party position image voteCount');

        // 4. Basic Blockchain Health Proof
        const isChainValid = blockchain.isChainValid();
        const blockHeight = blockchain.chain.length;
        const lastMinedBlockStamp = blockchain.getLatestBlock().timestamp;

        // 5. Election Status with populated winner
        const settings = await Settings.findOne().populate('declaredWinnerId', 'name party position image voteCount');

        // Build declared result info
        let declaredResult = null;
        if (settings?.resultDeclared && settings.declaredWinnerId) {
            const winner = settings.declaredWinnerId as any;
            declaredResult = {
                declared: true,
                declaredAt: settings.declaredAt,
                winner: {
                    _id: winner._id,
                    name: winner.name,
                    party: winner.party,
                    position: winner.position,
                    image: winner.image,
                    voteCount: winner.voteCount
                }
            };
        }

        res.json({
            election: {
                name: settings?.electionName || 'Election',
                isActive: settings?.isActive || false,
                startDate: settings?.startDate,
                endDate: settings?.endDate,
            },
            statistics: {
                totalUsers,
                totalVotes,
                turnoutPercentage: totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(1) : 0,
            },
            candidates,
            blockchain: {
                isValid: isChainValid,
                blockHeight,
                lastBlockTimestamp: lastMinedBlockStamp
            },
            declaredResult
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching public stats' });
    }
});

export default router;
