import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './db';
// We'll import routes later

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('[server error]:', err);
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV !== 'production' ? err.message : undefined
    });
});

import mongoose from 'mongoose';

// Middleware to ensure DB connection
const ensureDbConnection = async (req: Request, res: Response, next: any) => {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
        await blockchain.ensureInitialized();
        return next();
    }
    
    try {
        console.log('[server]: Connecting to Database lazily...');
        await connectDB();
        await blockchain.ensureInitialized();
        next();
    } catch (err) {
        console.error('[server lazy db connection error]:', err);
        res.status(500).json({
            message: 'Database connection failed. Likely missing Environment Variables on Vercel.',
            error: process.env.NODE_ENV !== 'production' && err instanceof Error ? err.message : undefined
        });
    }
};

// Apply the DB connection check to all /api routes
app.use('/api', ensureDbConnection);

// Routes
import authRoutes from './routes/authRoutes';
import voteRoutes from './routes/voteRoutes';
import candidateRoutes from './routes/candidateRoutes';
import settingsRoutes from './routes/settingsRoutes';
import auditRoutes from './routes/auditRoutes';
import publicRoutes from './routes/publicRoutes';
import electionRoutes from './routes/electionRoutes';
import { blockchain } from './blockchainInstance';

app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/elections', electionRoutes);

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, async () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
        // Locally, we can try to connect immediately, but it won't crash the server if it fails
        try {
            await connectDB();
            await blockchain.ensureInitialized();
        } catch (err) {
            console.error('[server startup db connection/blockchain init error]:', err);
        }
    });
}

// Export for Vercel
export default app;
