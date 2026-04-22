import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VotePage from './VotePage';

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            _id: 'user-1',
            username: 'Deependra',
            email: 'deependra@example.com',
            isAdmin: false,
            hasVoted: false,
            votedElections: [],
            isVerified: false,
            verificationStatus: 'pending',
            token: 'token',
        },
        login: vi.fn(),
    }),
}));

describe('VotePage', () => {
    beforeEach(() => {
        vi.stubGlobal('fetch', vi.fn());
    });

    it('shows pending verification UI for unverified voters', () => {
        render(
            <MemoryRouter>
                <VotePage />
            </MemoryRouter>
        );

        expect(screen.getByText(/voter verification pending/i)).toBeInTheDocument();
        expect(screen.getByText(/administrator must approve/i)).toBeInTheDocument();
    });
});
