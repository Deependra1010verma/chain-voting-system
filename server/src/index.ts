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

// Database
connectDB();

// Routes
import authRoutes from './routes/authRoutes';
import voteRoutes from './routes/voteRoutes';
import candidateRoutes from './routes/candidateRoutes';
import settingsRoutes from './routes/settingsRoutes';
import auditRoutes from './routes/auditRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/audit', auditRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Chain Voting API is running 🚀',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me'
            },
            candidates: {
                list: 'GET /api/candidates',
                create: 'POST /api/candidates (Admin)',
                update: 'PUT /api/candidates/:id (Admin)',
                delete: 'DELETE /api/candidates/:id (Admin)'
            },
            vote: {
                chain: 'GET /api/vote/chain',
                cast: 'POST /api/vote/vote',
                results: 'GET /api/vote/results'
            }
        }
    });
});

// Start Server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
