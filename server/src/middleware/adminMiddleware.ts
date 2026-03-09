import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
    user?: any;
}

export const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};
