import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        login: loginMock,
    }),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        navigateMock.mockReset();
        loginMock.mockReset();
        vi.stubGlobal('fetch', vi.fn());
    });

    it('logs the user in and redirects on success', async () => {
        vi.mocked(fetch).mockResolvedValue({
            ok: true,
            json: async () => ({
                _id: 'user-1',
                username: 'Deependra',
                email: 'deependra@example.com',
                isAdmin: false,
                hasVoted: false,
                votedElections: [],
                isVerified: true,
                verificationStatus: 'verified',
                token: 'token',
            }),
        } as Response);

        render(
            <MemoryRouter>
                <LoginPage />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'deependra@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(loginMock).toHaveBeenCalled();
            expect(navigateMock).toHaveBeenCalledWith('/dashboard');
        });
    });
});
