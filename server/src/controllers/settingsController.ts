import { Request, Response } from 'express';
import Settings from '../models/Settings';
import User from '../models/User';
import Candidate from '../models/Candidate';
import AuditLog from '../models/AuditLog';
import ElectionHistory from '../models/ElectionHistory';
import { blockchain } from '../blockchainInstance';
import mongoose from 'mongoose';

// Get Current Settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { electionName, startDate, endDate, isActive } = req.body;
        const userId = (req as any).user?.id;

        let settings = await Settings.findOne();

        if (settings) {
            const isStartingNew = isActive === true && settings.isActive === false;

            settings.electionName = electionName !== undefined ? electionName : settings.electionName;
            settings.startDate = startDate !== undefined ? startDate : settings.startDate;
            settings.endDate = endDate !== undefined ? endDate : settings.endDate;
            settings.isActive = isActive !== undefined ? isActive : settings.isActive;

            if (isStartingNew) {
                // If we are starting a new election, reset everything for a fresh start
                settings.currentElectionId = new mongoose.Types.ObjectId().toString();
                settings.resultDeclared = false;
                settings.declaredWinnerId = undefined;
                settings.declaredAt = undefined;

                // Reset all users' voting status so they can vote in the NEW election
                await User.updateMany({}, { hasVoted: false });

                // Reset all candidates' vote counts for the NEW election
                await Candidate.updateMany({}, { voteCount: 0 });
                
                console.log(`New election started: ${settings.electionName} (${settings.currentElectionId})`);
            }

            const updatedSettings = await settings.save();

            await AuditLog.create({
                action: 'ADMIN_ACTION',
                details: { type: 'UPDATE_SETTINGS', electionName, startDate, endDate, isActive },
                userId
            });
            await blockchain.addTransaction({
                type: 'ADMIN_ACTION',
                data: { action: 'UPDATE_SETTINGS', electionName, startDate, endDate, isActive, userId },
                timestamp: Date.now()
            });

            res.json(updatedSettings);
        } else {
            settings = await Settings.create({ electionName, startDate, endDate, isActive });

            await AuditLog.create({
                action: 'ADMIN_ACTION',
                details: { type: 'INITIALIZE_SETTINGS', electionName, startDate, endDate, isActive },
                userId
            });
            await blockchain.addTransaction({
                type: 'ADMIN_ACTION',
                data: { action: 'INITIALIZE_SETTINGS', electionName, startDate, endDate, isActive, userId },
                timestamp: Date.now()
            });

            res.status(201).json(settings);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Declare Election Result (Admin Only)
export const declareResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { candidateId } = req.body;
        const userId = (req as any).user?.id;

        if (!candidateId) {
            res.status(400).json({ message: 'candidateId is required' });
            return;
        }

        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            res.status(404).json({ message: 'Candidate not found' });
            return;
        }

        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        settings.resultDeclared = true;
        settings.declaredWinnerId = candidate._id as any;
        settings.declaredAt = new Date();
        settings.isActive = false; 
        await settings.save();

        // Archive result to history
        const allCandidates = await Candidate.find({});
        await ElectionHistory.create({
            electionName: settings.electionName,
            electionId: settings.currentElectionId,
            winner: {
                name: candidate.name,
                party: candidate.party,
                voteCount: candidate.voteCount
            },
            results: allCandidates.map(c => ({
                name: c.name,
                party: c.party,
                voteCount: c.voteCount
            })),
            declaredAt: settings.declaredAt
        });

        await AuditLog.create({
            action: 'ADMIN_ACTION',
            details: {
                type: 'DECLARE_RESULT',
                candidateId: candidate._id,
                candidateName: candidate.name,
                party: candidate.party
            },
            userId
        });

        await blockchain.addTransaction({
            type: 'ADMIN_ACTION',
            data: {
                action: 'DECLARE_RESULT',
                candidateId: candidate._id,
                candidateName: candidate.name,
                party: candidate.party,
                declaredAt: new Date().toISOString(),
                userId
            },
            timestamp: Date.now()
        });

        res.json({
            message: `Result declared. Winner: ${candidate.name}`,
            winner: {
                _id: candidate._id,
                name: candidate.name,
                party: candidate.party,
                position: candidate.position,
                image: candidate.image,
                voteCount: candidate.voteCount
            },
            declaredAt: settings.declaredAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error declaring result' });
    }
};

// Retract / Undeclare Election Result (Admin Only)
export const undeclareResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        let settings = await Settings.findOne();
        if (!settings) {
            res.status(404).json({ message: 'Settings not found' });
            return;
        }

        settings.resultDeclared = false;
        settings.declaredWinnerId = undefined;
        settings.declaredAt = undefined;
        await settings.save();

        await AuditLog.create({
            action: 'ADMIN_ACTION',
            details: { type: 'RETRACT_RESULT' },
            userId
        });

        await blockchain.addTransaction({
            type: 'ADMIN_ACTION',
            data: { action: 'RETRACT_RESULT', userId },
            timestamp: Date.now()
        });

        res.json({ message: 'Result declaration retracted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error retracting result' });
    }
};

// Get Analytics
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVotesCast = await User.countDocuments({ hasVoted: true });

        res.json({
            totalUsers,
            totalVotesCast,
            turnoutPercentage: totalUsers > 0 ? ((totalVotesCast / totalUsers) * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Election History
export const getElectionHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const history = await ElectionHistory.find().sort({ declaredAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching history' });
    }
};
