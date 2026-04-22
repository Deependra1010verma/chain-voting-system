import { Request, Response } from 'express';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';

interface AuthRequest extends Request {
    user?: {
        id?: string;
        isAdmin?: boolean;
    };
}

const serializeUserForAdmin = (user: any) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    hasVoted: user.hasVoted,
    votedElections: user.votedElections || [],
    isVerified: user.isVerified,
    verificationStatus: user.verificationStatus,
    verifiedAt: user.verifiedAt,
    verifiedBy: user.verifiedBy,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});

export const getVoters = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
        res.json(users.map(serializeUserForAdmin));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const verifyVoter = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const adminUserId = req.user?.id;
        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({ message: 'Voter not found' });
            return;
        }

        user.isVerified = true;
        user.verificationStatus = 'verified';
        user.verifiedAt = new Date();
        user.verifiedBy = adminUserId as any;
        await user.save();

        await AuditLog.create({
            action: 'ADMIN_ACTION',
            details: { type: 'VERIFY_VOTER', voterId: user._id, email: user.email },
            userId: adminUserId,
        });

        await blockchain.addTransaction({
            type: 'ADMIN_ACTION',
            data: {
                action: 'VERIFY_VOTER',
                voterId: user._id,
                email: user.email,
                adminUserId,
            },
            timestamp: Date.now(),
        });

        res.json({
            message: 'Voter verified successfully',
            voter: serializeUserForAdmin(user),
        });
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};
