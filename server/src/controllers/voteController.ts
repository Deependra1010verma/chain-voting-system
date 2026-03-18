import { Request, Response } from 'express';
import { blockchain } from '../blockchainInstance';
import User from '../models/User';
import Candidate from '../models/Candidate';
import Settings from '../models/Settings';
import AuditLog from '../models/AuditLog';
import { Transaction } from '../types';

interface AuthRequest extends Request {
    user?: any;
}

export const getBlockchain = (req: Request, res: Response): void => {
    res.json(blockchain.chain);
};

export const castVote = async (req: AuthRequest, res: Response): Promise<void> => {
    const { candidate: candidateId } = req.body;
    const voterId = req.user.id;

    try {
        const user = await User.findById(voterId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const settings = await Settings.findOne();
        if (settings && !settings.isActive) {
            res.status(400).json({ message: 'Voting is currently closed.' });
            return;
        }

        if (user.hasVoted) {
            res.status(400).json({ message: 'User has already voted' });
            return;
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        const newTransaction: Transaction = {
            type: 'VOTE',
            data: { 
                voterId: user.id, 
                candidate: candidateId,
                electionId: settings?.currentElectionId || 'unknown'
            },
            timestamp: Date.now(),
        };

        await blockchain.addTransaction(newTransaction);

        await AuditLog.create({
            action: 'VOTE',
            details: { candidateId },
            userId: user.id
        });

        user.hasVoted = true;
        await user.save();

        candidate.voteCount = (candidate.voteCount || 0) + 1;
        await candidate.save();

        res.status(201).json({ message: 'Vote cast successfully', block: blockchain.getLatestBlock() });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getResults = (req: Request, res: Response): void => {
    const transactions = blockchain.getVotes();
    const results: { [key: string]: number } = {};

    transactions.forEach((tx) => {
        const candidate = tx.data.candidate;
        if (results[candidate]) {
            results[candidate]++;
        } else {
            results[candidate] = 1;
        }
    });

    res.json(results);
};
