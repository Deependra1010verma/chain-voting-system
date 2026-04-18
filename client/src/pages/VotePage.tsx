import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import API_URL from '../config';

interface Candidate {
    _id: string;
    name: string;
    party: string;
    position: string;
    image: string;
    voteCount?: number;
}

interface ElectionData {
    _id: string;
    electionName: string;
    electionId: string;
    isActive: boolean;
    hasVoted: boolean;
    startDate?: string;
    endDate?: string;
    candidates: Candidate[];
}

const VotePage: React.FC = () => {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestedElectionId = searchParams.get('electionId');

    const [electionData, setElectionData] = useState<ElectionData | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchElection = async () => {
            if (!user) {
                setIsFetching(false);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/elections`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch election: ${response.status}`);
                }

                const data: ElectionData[] = await response.json();
                const resolvedElection = requestedElectionId
                    ? data.find((election) => election.electionId === requestedElectionId) || null
                    : data.find((election) => election.isActive) || null;

                if (!resolvedElection) {
                    setError(
                        requestedElectionId
                            ? 'The selected election could not be loaded.'
                            : 'No active election is available for voting right now.'
                    );
                    return;
                }

                setElectionData(resolvedElection);
                setCandidates(resolvedElection.candidates || []);
            } catch (err) {
                console.error('Error fetching election:', err);
                setError('Failed to load election. Please try again later.');
            } finally {
                setIsFetching(false);
            }
        };

        fetchElection();
    }, [requestedElectionId, user]);

    if (!user) {
        return <div className="text-center mt-20">Please log in to vote.</div>;
    }

    if (isFetching) {
        return <div className="text-center mt-20 text-gray-400">Loading election...</div>;
    }

    if (error) {
        return (
            <div className="text-center mt-20 space-y-4">
                <p className="text-red-400">{error}</p>
                <Button onClick={() => navigate('/elections')}>Back to Elections</Button>
            </div>
        );
    }

    if (!electionData) {
        return (
            <div className="text-center mt-20 space-y-4">
                <p className="text-gray-400">No election is available for voting right now.</p>
                <Button onClick={() => navigate('/elections')}>Back to Elections</Button>
            </div>
        );
    }

    if (electionData.hasVoted) {
        return (
            <div className="text-center mt-20 space-y-4">
                <CheckCircle size={64} className="mx-auto text-green-500" />
                <h2 className="text-3xl font-bold">You have already voted</h2>
                <p className="text-gray-400">
                    Your vote for {electionData.electionName} is securely recorded on the blockchain.
                </p>
                <Button onClick={() => navigate('/elections')}>Back to Elections</Button>
            </div>
        );
    }

    if (!electionData.isActive) {
        return (
            <div className="text-center mt-20 space-y-4">
                <Shield size={64} className="mx-auto text-yellow-500" />
                <h2 className="text-3xl font-bold">Voting is Closed</h2>
                <p className="text-gray-400">{electionData.electionName} is not active anymore.</p>
                <Button onClick={() => navigate(`/results?electionId=${encodeURIComponent(electionData.electionId)}`)}>
                    View Results
                </Button>
            </div>
        );
    }

    const handleVote = async () => {
        if (!selectedCandidate) {
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/vote/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({
                    candidate: selectedCandidate,
                    electionId: electionData.electionId,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.message || `Voting failed: ${response.status}`);
            }

            const currentVotedElections = Array.isArray(user.votedElections) ? user.votedElections : [];
            const updatedUser = {
                ...user,
                hasVoted: true,
                votedElections: currentVotedElections.includes(electionData.electionId)
                    ? currentVotedElections
                    : [...currentVotedElections, electionData.electionId],
            };

            login(updatedUser);
            navigate(`/results?electionId=${encodeURIComponent(electionData.electionId)}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="text-center space-y-2">
                <div className="flex justify-center">
                    <Link
                        to="/elections"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Elections</span>
                    </Link>
                </div>
                <h1 className="text-3xl font-bold">Cast Your Vote</h1>
                <p className="text-gray-400">{electionData.electionName}</p>
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
                        className={`cursor-pointer transition-all duration-300 border-2 ${selectedCandidate === candidate._id
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-transparent hover:border-gray-600'
                            }`}
                    >
                        <div onClick={() => setSelectedCandidate(candidate._id)} className="text-center space-y-4">
                            <img
                                src={
                                    candidate.image ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&color=fff&size=200`
                                }
                                alt={candidate.name}
                                className="w-32 h-32 rounded-full mx-auto border-4 border-gray-700 shadow-xl object-cover"
                            />
                            <div>
                                <h3 className="text-xl font-bold">{candidate.name}</h3>
                                <p className="text-blue-400 text-sm">{candidate.party}</p>
                                <p className="text-gray-400 text-xs mt-1">{candidate.position}</p>
                            </div>
                            <Button
                                variant={selectedCandidate === candidate._id ? 'primary' : 'secondary'}
                                className="w-full"
                                type="button"
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
