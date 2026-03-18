import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';

const generateToken = (id: string, isAdmin: boolean) => {
    return jwt.sign({ id, isAdmin }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            passwordHash,
        });

        if (user) {
            // Log Registration
            await AuditLog.create({
                action: 'REGISTRATION',
                details: { username, email },
                userId: user.id
            });

            await blockchain.addTransaction({
                type: 'REGISTRATION',
                data: { userId: user.id, username, email },
                timestamp: Date.now()
            });

            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user.id, user.isAdmin),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                hasVoted: user.hasVoted,
                token: generateToken(user.id, user.isAdmin),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error instanceof Error ? error.message : 'Server Error' });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    // Middleware should attach user to req usually, simplified here
    try {
        // @ts-ignore - Middleware will add user. We need to define types for Request later
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
