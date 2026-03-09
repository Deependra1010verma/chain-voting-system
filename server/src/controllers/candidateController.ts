import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import { IUser } from '../models/User';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';

interface AuthRequest extends Request {
    user?: IUser;
}

export const registerAsCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, party, position, image } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            res.status(401).json({ message: 'User not authenticated' });
            return;
        }

        // Check if user is already a candidate
        const existingCandidate = await Candidate.findOne({ userId });
        if (existingCandidate) {
            res.status(400).json({ message: 'You are already registered as a candidate' });
            return;
        }

        const candidate = await Candidate.create({
            name,
            party,
            position,
            image,
            userId
        });

        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};

export const addCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, party, position, image } = req.body;
        const userId = req.user?._id;

        const candidate = await Candidate.create({
            name,
            party,
            position,
            image
        });

        await AuditLog.create({
            action: 'ADMIN_ACTION',
            details: { type: 'ADD_CANDIDATE', candidateId: candidate._id, name, party },
            userId
        });
        blockchain.addTransaction({
            type: 'ADMIN_ACTION',
            data: { action: 'ADD_CANDIDATE', candidateId: candidate._id, name, party, userId },
            timestamp: Date.now()
        });

        res.status(201).json(candidate);
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};

export const getCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        const candidates = await Candidate.find({});
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        if (candidate) {
            res.json(candidate);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const updateCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, party, position, image } = req.body;
        const userId = req.user?._id;

        const candidate = await Candidate.findById(req.params.id);

        if (candidate) {
            candidate.name = name || candidate.name;
            candidate.party = party || candidate.party;
            candidate.position = position || candidate.position;
            candidate.image = image || candidate.image;

            const updatedCandidate = await candidate.save();

            await AuditLog.create({
                action: 'ADMIN_ACTION',
                details: { type: 'UPDATE_CANDIDATE', candidateId: candidate._id, name: candidate.name },
                userId
            });
            blockchain.addTransaction({
                type: 'ADMIN_ACTION',
                data: { action: 'UPDATE_CANDIDATE', candidateId: candidate._id, name: candidate.name, userId },
                timestamp: Date.now()
            });

            res.json(updatedCandidate);
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const deleteCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const candidate = await Candidate.findById(req.params.id);
        const userId = req.user?._id;

        if (candidate) {
            await candidate.deleteOne();

            await AuditLog.create({
                action: 'ADMIN_ACTION',
                details: { type: 'DELETE_CANDIDATE', candidateId: candidate._id, name: candidate.name },
                userId
            });
            blockchain.addTransaction({
                type: 'ADMIN_ACTION',
                data: { action: 'DELETE_CANDIDATE', candidateId: candidate._id, name: candidate.name, userId },
                timestamp: Date.now()
            });

            res.json({ message: 'Candidate removed' });
        } else {
            res.status(404).json({ message: 'Candidate not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};

