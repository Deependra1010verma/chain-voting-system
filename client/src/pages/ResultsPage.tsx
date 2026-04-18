import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Crown, Shield, Vote } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import API_URL from '../config';

interface ElectionCandidate {
    _id?: string;
    name: string;
    party: string;
    position?: string;
    image?: string;
    voteCount: number;
}

interface ElectionResult {
    _id: string;
    electionName: string;
    electionId: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    resultDeclared: boolean;
    declaredAt?: string;
    hasVoted: boolean;
    candidates: ElectionCandidate[];
    winner?: {
        name: string;
        party: string;
        voteCount: number;
    };
}

const ResultsPage: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const electionId = searchParams.get('electionId');

    const [election, setElection] = useState<ElectionResult | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            if (!user) {
                setIsLoading(false);
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

                const data: ElectionResult[] = await response.json();
                const resolvedElection = electionId
                    ? data.find((item) => item.electionId === electionId) || null
                    : data[0] || null;

                if (!resolvedElection) {
                    throw new Error('No election results are available.');
                }

                setElection(resolvedElection);
            } catch (err) {
                console.error('Error fetching election results:', err);
                setError('Unable to load election results right now.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [electionId, user]);

    if (!user) {
        return <div className="text-center mt-20">Please log in to view results.</div>;
    }

    if (isLoading) {
        return <div className="text-center mt-20 text-gray-400">Loading election results...</div>;
    }

    if (error || !election) {
        return (
            <div className="text-center mt-20 space-y-4">
                <p className="text-red-400">{error || 'Election results are unavailable.'}</p>
                <Link to="/elections" className="text-blue-400 hover:text-blue-300">
                    Back to Elections
                </Link>
            </div>
        );
    }

    const sortedCandidates = [...election.candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + (candidate.voteCount || 0), 0);
    const winner = election.winner || sortedCandidates[0] || null;

    return (
        <div className="space-y-12 animate-fade-in-up">
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
                <h1 className="text-3xl font-bold">{election.electionName}</h1>
                <p className="text-gray-400">
                    {election.isActive ? 'Live standings for the ongoing election.' : 'Official result for the selected election.'}
                </p>
            </header>

            {winner && (
                <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-600/20 to-yellow-500/10 border-2 border-yellow-500 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-[0_0_30px_rgba(234,179,8,0.15)] relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/20 blur-3xl rounded-full"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-600/20 blur-3xl rounded-full"></div>

                    <div className="flex-shrink-0">
                        <Crown size={56} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                    </div>
                    <div className="flex-1 text-center md:text-left z-10">
                        <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-1">
                            {election.isActive ? 'Current Leader' : 'Official Winner'}
                        </p>
                        <h2 className="text-3xl font-extrabold text-white">{winner.name}</h2>
                        <p className="text-gray-300 text-sm">
                            {winner.party} · {winner.voteCount} votes
                        </p>
                        {election.declaredAt && (
                            <p className="text-gray-500 text-xs mt-1">
                                Declared on {new Date(election.declaredAt).toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                <Card title="Election Summary" className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-semibold ${election.isActive ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {election.isActive ? 'Running' : 'Completed'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                        <span className="text-gray-400">Candidates</span>
                        <span>{sortedCandidates.length}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                        <span className="text-gray-400">Votes Cast</span>
                        <span>{totalVotes}</span>
                    </div>
                    {election.startDate && (
                        <div className="flex items-start justify-between gap-4 border-b border-gray-700 pb-3">
                            <span className="text-gray-400 inline-flex items-center gap-2">
                                <CalendarDays size={14} />
                                Started
                            </span>
                            <span className="text-right">{new Date(election.startDate).toLocaleString()}</span>
                        </div>
                    )}
                    {election.declaredAt && (
                        <div className="flex items-start justify-between gap-4">
                            <span className="text-gray-400 inline-flex items-center gap-2">
                                <CalendarDays size={14} />
                                Declared
                            </span>
                            <span className="text-right">{new Date(election.declaredAt).toLocaleString()}</span>
                        </div>
                    )}
                </Card>

                <Card title="Vote Tally" className="space-y-6 md:col-span-2">
                    {sortedCandidates.length === 0 ? (
                        <p className="text-gray-400 text-center py-8">No candidates or votes available for this election.</p>
                    ) : (
                        sortedCandidates.map((candidate) => (
                            <div key={`${election.electionId}-${candidate.name}`} className="space-y-2">
                                <div className="flex justify-between text-sm gap-4">
                                    <div>
                                        <p className="font-semibold">{candidate.name}</p>
                                        <p className="text-xs text-gray-400">
                                            {candidate.party}
                                            {candidate.position ? ` · ${candidate.position}` : ''}
                                        </p>
                                    </div>
                                    <span>
                                        {candidate.voteCount} votes ({totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : '0.0'}%)
                                    </span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-full rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))
                    )}
                    <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                        <span className="text-gray-400 inline-flex items-center gap-2">
                            <Vote size={16} />
                            Total Votes Cast
                        </span>
                        <span className="text-2xl font-bold">{totalVotes}</span>
                    </div>
                </Card>
            </div>

            <div className="text-center text-sm text-gray-500 flex justify-center items-center space-x-2">
                <Shield size={16} />
                <span>
                    {election.isActive
                        ? 'This page is showing the live standing for the ongoing election.'
                        : 'This page is showing the preserved result for the selected completed election.'}
                </span>
            </div>
        </div>
    );
};

export default ResultsPage;
