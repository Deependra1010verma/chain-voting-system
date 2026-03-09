import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { CheckCircle, Shield } from 'lucide-react';

interface Candidate {
    _id: string;
    name: string;
    party: string;
    position: string;
    image: string;
}

const VotePage: React.FC = () => {
    const { user, login } = useAuth(); // login used to update user state after voting
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [electionData, setElectionData] = useState<any>(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const [candidatesRes, settingsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/candidates'),
                    fetch('http://localhost:5000/api/settings')
                ]);

                if (!candidatesRes.ok) {
                    throw new Error('Failed to fetch candidates');
                }
                const data = await candidatesRes.json();
                setCandidates(data);
                
                if (settingsRes.ok) {
                    const settings = await settingsRes.json();
                    setElectionData(settings);
                }
            } catch (err) {
                console.error("Error fetching candidates:", err);
                setError('Failed to load candidates. Please try again later.');
            }
        };

        fetchCandidates();
    }, []);

    if (!user) {
        return <div className="text-center mt-20">Please log in to vote.</div>;
    }

    if (user.hasVoted) {
        return (
            <div className="text-center mt-20 space-y-4">
                <CheckCircle size={64} className="mx-auto text-green-500" />
                <h2 className="text-3xl font-bold">You have already voted!</h2>
                <p className="text-gray-400">Your vote is securely recorded on the blockchain.</p>
                <Button onClick={() => navigate('/results')}>View Results</Button>
            </div>
        );
    }

    if (electionData && !electionData.isActive) {
        return (
            <div className="text-center mt-20 space-y-4">
                <Shield size={64} className="mx-auto text-yellow-500" />
                <h2 className="text-3xl font-bold">Voting is Closed</h2>
                <p className="text-gray-400">The election is currently not active.</p>
                <Button onClick={() => navigate('/dashboard')}>Go Back</Button>
            </div>
        );
    }

    const handleVote = async () => {
        if (!selectedCandidate) return;

        setIsLoading(true);
        setError('');

        try {
            const token = user.token; // Assuming user object has token
            const response = await fetch('http://localhost:5000/api/vote/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ candidate: selectedCandidate }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Voting failed');
            }

            // Update user state locally
            const updatedUser = { ...user, hasVoted: true };
            login(updatedUser); // Update context

            navigate('/results');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Cast Your Vote</h1>
                <p className="text-gray-400">Select your preferred candidate securely.</p>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-center mx-auto max-w-md">
                    {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {candidates.map((candidate) => (
                    <Card
                        key={candidate._id}
                        className={`cursor-pointer transition-all duration-300 border-2 ${selectedCandidate === candidate._id ? 'border-blue-500 bg-blue-500/10' : 'border-transparent hover:border-gray-600'}`}
                    >
                        <div onClick={() => setSelectedCandidate(candidate._id)} className="text-center space-y-4">
                            <img
                                src={candidate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&color=fff&size=200`}
                                alt={candidate.name}
                                className="w-32 h-32 rounded-full mx-auto border-4 border-gray-700 shadow-xl"
                            />
                            <div>
                                <h3 className="text-xl font-bold">{candidate.name}</h3>
                                <p className="text-blue-400 text-sm">{candidate.party}</p>
                            </div>
                            <Button
                                variant={selectedCandidate === candidate._id ? 'primary' : 'secondary'}
                                className="w-full"
                            >
                                {selectedCandidate === candidate._id ? 'Selected' : 'Select'}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <Button
                    onClick={handleVote}
                    disabled={!selectedCandidate || isLoading}
                    className="px-12 py-3 text-lg"
                    isLoading={isLoading}
                >
                    Submit Vote
                </Button>
            </div>
        </div>
    );
};

export default VotePage;
