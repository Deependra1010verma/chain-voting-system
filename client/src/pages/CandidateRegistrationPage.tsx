import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import API_URL from '../config';

const CandidateRegistrationPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [party, setParty] = useState('');
    const [position, setPosition] = useState('');
    const [image, setImage] = useState('');
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!user) {
        return <div className="text-center mt-20">Please log in to register as a candidate.</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        if (!name || !party || !position || !image) {
            setError('All fields are required.');
            return;
        }

        setLoading(true);

        try {
            const token = user.token;

            const response = await fetch(`${API_URL}/api/candidates/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    party,
                    position,
                    image
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to register as candidate. You might already be registered.');
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to register as candidate. You might already be registered.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6 mt-10 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-center">Register as Candidate</h1>
            <p className="text-gray-400 text-center">Fill out the form below to stand in the election.</p>
            
            <Card>
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-500/20 text-green-400 p-3 rounded mb-4">Successfully registered! Redirecting to dashboard...</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="John Doe"
                        />
                    </div>
                    <div>
                        <label htmlFor="party" className="block text-sm font-medium text-gray-300 mb-1">Party</label>
                        <input
                            id="party"
                            type="text"
                            value={party}
                            onChange={(e) => setParty(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="Independent / Democratic / etc"
                        />
                    </div>
                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-1">Position</label>
                        <input
                            id="position"
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="President, Mayor, etc"
                        />
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                        <input
                            id="image"
                            type="text"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                    
                    <Button type="submit" className="w-full mt-4" disabled={loading || success}>
                        {loading ? 'Registering...' : 'Register'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default CandidateRegistrationPage;
