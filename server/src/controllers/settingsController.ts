import { Request, Response } from 'express';
import Settings from '../models/Settings';
import User from '../models/User';
import Candidate from '../models/Candidate';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';

// Get Current Settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            // Initialize default settings if none exist
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
            settings.electionName = electionName !== undefined ? electionName : settings.electionName;
            settings.startDate = startDate !== undefined ? startDate : settings.startDate;
            settings.endDate = endDate !== undefined ? endDate : settings.endDate;
            settings.isActive = isActive !== undefined ? isActive : settings.isActive;

            const updatedSettings = await settings.save();

            // Log Admin Action
            await AuditLog.create({
                action: 'ADMIN_ACTION',
                details: { type: 'UPDATE_SETTINGS', electionName, startDate, endDate, isActive },
                userId
            });
            blockchain.addTransaction({
                type: 'ADMIN_ACTION',
                data: { action: 'UPDATE_SETTINGS', electionName, startDate, endDate, isActive, userId },
                timestamp: Date.now()
            });

            res.json(updatedSettings);
        } else {
            // Should theoretically never hit this because of initialization, but just in case
            settings = await Settings.create({ electionName, startDate, endDate, isActive });
            
            await AuditLog.create({
                action: 'ADMIN_ACTION',
                details: { type: 'INITIALIZE_SETTINGS', electionName, startDate, endDate, isActive },
                userId
            });
            blockchain.addTransaction({
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

// Get Analytics
export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVotesCast = await User.countDocuments({ hasVoted: true });
        
        // Return summary stats
        res.json({
            totalUsers,
            totalVotesCast,
            turnoutPercentage: totalUsers > 0 ? ((totalVotesCast / totalUsers) * 100).toFixed(2) : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
