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

const sanitizeTransaction = (transaction: Transaction): Transaction => {
    const electionId = transaction.data?.electionId;

    if (transaction.type === 'VOTE') {
        return {
            ...transaction,
            data: {
                summary: 'Vote recorded on the blockchain',
                electionId: electionId || 'unknown',
            },
        };
    }

    if (transaction.type === 'REGISTRATION') {
        return {
            ...transaction,
            data: {
                summary: 'New voter registration recorded',
            },
        };
    }

    return {
        ...transaction,
        data: {
            summary: transaction.data?.action
                ? `Administrative action: ${transaction.data.action}`
                : 'Administrative action recorded',
            electionId: electionId || undefined,
        },
    };
};

export const getBlockchain = async (req: Request, res: Response): Promise<void> => {
    await blockchain.ensureInitialized();
    res.json(
        blockchain.chain.map((block) => ({
            ...block,
            transaction: sanitizeTransaction(block.transaction),
        }))
    );
};

export const castVote = async (req: AuthRequest, res: Response): Promise<void> => {
    const { candidate: candidateId, electionId } = req.body;
    const voterId = req.user.id;

    try {
        const user = await User.findById(voterId);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const settings = await Settings.findOne();
        if (!settings || !settings.isActive) {
            res.status(400).json({ message: 'Voting is currently closed.' });
            return;
        }

        if (!electionId || settings.currentElectionId !== electionId) {
            res.status(400).json({ message: 'This election is not available for voting.' });
            return;
        }

        // Prevent double voting for the same election
        const alreadyVoted = user?.votedElections?.includes(electionId);
        if (alreadyVoted) {
            res.status(400).json({ message: 'User has already voted in this election' });
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
                electionId
            },
            timestamp: Date.now(),
        };

        await blockchain.addTransaction(newTransaction);

        await AuditLog.create({
            action: 'VOTE',
            details: { candidateId },
            userId: user.id
        });

        // Record that the user has voted in this election
        const userAny = user as any;
        if (!Array.isArray(userAny.votedElections)) {
            userAny.votedElections = [];
        }
        if (!userAny.votedElections.includes(electionId)) {
            userAny.votedElections.push(electionId);
        }
        // Also set hasVoted for backward compatibility
        userAny.hasVoted = true;
        await userAny.save();

        candidate.voteCount = (candidate.voteCount || 0) + 1;
        await candidate.save();

        res.status(201).json({
            message: 'Vote cast successfully',
            votedElectionId: electionId,
            block: blockchain.getLatestBlock()
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getResults = async (req: Request, res: Response): Promise<void> => {
    await blockchain.ensureInitialized();
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
