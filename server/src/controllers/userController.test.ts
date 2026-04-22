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
        find: vi.fn(),
        findById: vi.fn(),
    },
}));

vi.mock('../models/AuditLog', () => ({
    default: {
        create: vi.fn(),
    },
}));

import app from '../index';
import User from '../models/User';
import AuditLog from '../models/AuditLog';
import { blockchain } from '../blockchainInstance';
import jwt from 'jsonwebtoken';

describe('voter verification APIs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(blockchain, 'ensureInitialized').mockResolvedValue(undefined);
        vi.spyOn(blockchain, 'addTransaction').mockResolvedValue(undefined);
        vi.spyOn(jwt, 'verify').mockReturnValue({ id: 'admin-1', isAdmin: true } as any);
    });

    it('lists voters for admins', async () => {
        vi.mocked(User.find).mockReturnValue({
            sort: vi.fn().mockResolvedValue([
                {
                    _id: 'user-1',
                    username: 'Test User',
                    email: 'test@example.com',
                    isAdmin: false,
                    hasVoted: false,
                    votedElections: [],
                    isVerified: false,
                    verificationStatus: 'pending',
                },
            ]),
        } as any);

        const response = await request(app)
            .get('/api/users')
            .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].verificationStatus).toBe('pending');
    });

    it('verifies a voter', async () => {
        const save = vi.fn().mockResolvedValue(undefined);
        vi.mocked(User.findById).mockResolvedValue({
            _id: 'user-2',
            username: 'Pending User',
            email: 'voter@example.com',
            isAdmin: false,
            hasVoted: false,
            votedElections: [],
            isVerified: false,
            verificationStatus: 'pending',
            save,
        } as any);
        vi.mocked(AuditLog.create).mockResolvedValue({} as any);

        const response = await request(app)
            .patch('/api/users/user-2/verify')
            .set('Authorization', 'Bearer admin-token');

        expect(response.status).toBe(200);
        expect(response.body.voter.isVerified).toBe(true);
        expect(response.body.voter.verificationStatus).toBe('verified');
        expect(save).toHaveBeenCalled();
        expect(blockchain.addTransaction).toHaveBeenCalled();
    });
});
