import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db', () => ({
    default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../models/BlockModel', () => ({
    default: {
        find: vi.fn(() => ({
            sort: vi.fn().mockResolvedValue([]),
        })),
        create: vi.fn().mockResolvedValue({}),
    },
}));

vi.mock('../models/User', () => ({
    default: {
        findById: vi.fn(),
    },
}));

vi.mock('../models/Candidate', () => ({
    default: {
        findById: vi.fn(),
    },
}));

vi.mock('../models/Settings', () => ({
    default: {
        findOne: vi.fn(),
    },
}));

vi.mock('../models/AuditLog', () => ({
    default: {
        create: vi.fn(),
    },
}));

import app from '../index';
import User from '../models/User';
import Candidate from '../models/Candidate';
import Settings from '../models/Settings';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';
import jwt from 'jsonwebtoken';

describe('vote APIs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(blockchain, 'ensureInitialized').mockResolvedValue(undefined);
        vi.spyOn(blockchain, 'addTransaction').mockResolvedValue(undefined);
        vi.spyOn(blockchain, 'getLatestBlock').mockReturnValue({
            index: 1,
            timestamp: Date.now(),
            transaction: { type: 'VOTE', data: {}, timestamp: Date.now() },
            previousHash: '0',
            hash: 'hash',
            nonce: 0,
        } as any);
        vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'user-1', isAdmin: false } as any);
    });

    it('blocks unverified voters', async () => {
        vi.mocked(Settings.findOne).mockResolvedValue({
            isActive: true,
            currentElectionId: 'election-1',
        } as any);
        vi.mocked(User.findById).mockResolvedValue({
            id: 'user-1',
            isVerified: false,
            votedElections: [],
        } as any);

        const response = await request(app)
            .post('/api/vote/vote')
            .set('Authorization', 'Bearer voter-token')
            .send({ candidate: 'candidate-1', electionId: 'election-1' });

        expect(response.status).toBe(403);
        expect(response.body.message).toContain('pending');
    });

    it('records votes for verified voters', async () => {
        const saveUser = vi.fn().mockResolvedValue(undefined);
        const saveCandidate = vi.fn().mockResolvedValue(undefined);

        vi.mocked(Settings.findOne).mockResolvedValue({
            isActive: true,
            currentElectionId: 'election-1',
        } as any);
        vi.mocked(User.findById).mockResolvedValue({
            id: 'user-1',
            isVerified: true,
            hasVoted: false,
            votedElections: [],
            save: saveUser,
        } as any);
        vi.mocked(Candidate.findById).mockResolvedValue({
            _id: 'candidate-1',
            voteCount: 0,
            save: saveCandidate,
        } as any);
        vi.mocked(AuditLog.create).mockResolvedValue({} as any);

        const response = await request(app)
            .post('/api/vote/vote')
            .set('Authorization', 'Bearer voter-token')
            .send({ candidate: 'candidate-1', electionId: 'election-1' });

        expect(response.status).toBe(201);
        expect(blockchain.addTransaction).toHaveBeenCalled();
        expect(saveUser).toHaveBeenCalled();
        expect(saveCandidate).toHaveBeenCalled();
    });
});
