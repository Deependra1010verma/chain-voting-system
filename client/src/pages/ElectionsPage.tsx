import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import {
    Vote,
    Trophy,
    Clock,
    CheckCircle2,
    ChevronRight,
    Zap,
    BarChart3,
    Users,
    CalendarDays,
} from 'lucide-react';
import API_URL from '../config';

interface ElectionCandidate {
    _id: string;
    name: string;
    party: string;
    position: string;
    image: string;
    voteCount: number;
}

interface Election {
    _id: string;
    electionName: string;
    electionId: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    resultDeclared: boolean;
    declaredAt?: string;
    candidates: ElectionCandidate[];
    hasVoted: boolean;
    winner?: {
        name: string;
        party: string;
        voteCount: number;
    };
}

const ElectionsPage: React.FC = () => {
    const { user } = useAuth();
    const [elections, setElections] = useState<Election[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchElections = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/elections`, {
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setElections(data);
                } else {
                    setError('Failed to fetch elections.');
                }
            } catch (err) {
                console.error(err);
                setError('Network error. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchElections();
    }, [user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-gray-400 text-lg">Please log in to view elections.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400">Loading elections...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-red-400 text-lg">{error}</p>
            </div>
        );
    }

    const activeElections = elections.filter(e => e.isActive);
    const declaredElections = elections.filter(e => !e.isActive && e.resultDeclared);

    return (
        <div className="space-y-10 animate-fade-in-up">
            {/* Header */}
            <header className="text-center space-y-3">
                <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-500/20">
                    <Zap size={14} />
                    <span>Blockchain Secured</span>
                </div>
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    All Elections
                </h1>
                <p className="text-gray-400 max-w-lg mx-auto">
                    View ongoing elections, cast your vote, or check past results — all secured on the blockchain.
                </p>
            </header>

            {/* Active Elections */}
            {activeElections.length > 0 && (
                <section className="space-y-5">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        <h2 className="text-2xl font-bold text-white">Live Elections</h2>
                        <span className="bg-emerald-500/15 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/25">
                            {activeElections.length} ACTIVE
                        </span>
                    </div>

                    <div className="grid gap-6">
                        {activeElections.map((election) => (
                            <ElectionCard key={election.electionId} election={election} type="active" />
                        ))}
                    </div>
                </section>
            )}

            {/* No active elections message */}
            {activeElections.length === 0 && (
                <div className="text-center py-8 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                    <Clock size={40} className="mx-auto text-gray-500 mb-3" />
                    <p className="text-gray-400 text-lg font-medium">No active elections right now</p>
                    <p className="text-gray-500 text-sm mt-1">Check back later or view past results below.</p>
                </div>
            )}

            {/* Result Declared Elections */}
            {declaredElections.length > 0 && (
                <section className="space-y-5">
                    <div className="flex items-center space-x-3">
                        <Trophy size={20} className="text-yellow-400" />
                        <h2 className="text-2xl font-bold text-white">Past Elections</h2>
                        <span className="bg-yellow-500/15 text-yellow-400 text-xs font-bold px-3 py-1 rounded-full border border-yellow-500/25">
                            {declaredElections.length} RESULTS
                        </span>
                    </div>

                    <div className="grid gap-6">
                        {declaredElections.map((election) => (
                            <ElectionCard key={election.electionId} election={election} type="declared" />
                        ))}
                    </div>
                </section>
            )}

            {elections.length === 0 && (
                <div className="text-center py-16">
                    <Vote size={48} className="mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400 text-xl font-medium">No elections found</p>
                    <p className="text-gray-500 mt-2">Elections will appear here once an admin creates one.</p>
                </div>
            )}
        </div>
    );
};

// ——— Election Card Component ———
interface ElectionCardProps {
    election: Election;
    type: 'active' | 'declared';
}

const ElectionCard: React.FC<ElectionCardProps> = ({ election, type }) => {
    const navigate = useNavigate();
    const isActive = type === 'active';
    const totalVotes = election.candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);
    const canVote = isActive && !election.hasVoted;
    const canShowResults = !isActive;

    // Find winner for declared elections
    const winner = election.winner
        ? election.winner
        : election.candidates.length > 0
            ? election.candidates.reduce((a, b) => (a.voteCount > b.voteCount ? a : b))
            : null;

    return (
        <div
            onClick={() => {
                if (canShowResults) {
                    navigate(`/results?electionId=${encodeURIComponent(election.electionId)}`);
                }
            }}
            onKeyDown={(event) => {
                if (canShowResults && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    navigate(`/results?electionId=${encodeURIComponent(election.electionId)}`);
                }
            }}
            className={`
                relative overflow-hidden rounded-2xl border transition-all duration-300
                hover:shadow-2xl hover:-translate-y-0.5
                ${isActive
                    ? 'bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-emerald-900/20 border-emerald-500/30 hover:border-emerald-400/50 shadow-lg shadow-emerald-500/5'
                    : 'bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-yellow-900/10 border-gray-700/60 hover:border-yellow-500/30'
                }
                ${canShowResults ? 'cursor-pointer' : ''}
            `}
            role={canShowResults ? 'button' : undefined}
            tabIndex={canShowResults ? 0 : undefined}
        >
            {/* Glow effect */}
            {isActive && (
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
            )}

            <div className="p-6 md:p-8">
                {/* Top Row: Badge + Date */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                    <div className="flex items-center space-x-3">
                        {isActive ? (
                            <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 animate-pulse">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                <span>LIVE</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center space-x-1.5 bg-yellow-500/15 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/25">
                                <Trophy size={12} />
                                <span>RESULT DECLARED</span>
                            </span>
                        )}
                        <h3 className="text-xl md:text-2xl font-bold text-white">{election.electionName}</h3>
                    </div>
                    {election.declaredAt && (
                        <div className="flex items-center space-x-1.5 text-gray-500 text-xs">
                            <CalendarDays size={13} />
                            <span>Declared: {new Date(election.declaredAt).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}</span>
                        </div>
                    )}
                    {isActive && election.startDate && (
                        <div className="flex items-center space-x-1.5 text-gray-500 text-xs">
                            <CalendarDays size={13} />
                            <span>Started: {new Date(election.startDate).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            })}</span>
                        </div>
                    )}
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center space-x-2 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700/50">
                        <Users size={16} className="text-blue-400" />
                        <span className="text-sm text-gray-300">
                            <span className="font-bold text-white">{election.candidates.length}</span> Candidates
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700/50">
                        <BarChart3 size={16} className="text-purple-400" />
                        <span className="text-sm text-gray-300">
                            <span className="font-bold text-white">{totalVotes}</span> Votes
                        </span>
                    </div>
                    {election.hasVoted && (
                        <div className="flex items-center space-x-2 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">You Voted</span>
                        </div>
                    )}
                </div>

                {/* Candidate Preview (show top 3) */}
                <div className="flex -space-x-2 mb-6">
                    {election.candidates.slice(0, 5).map((c) => (
                        <img
                            key={c._id}
                            src={c.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=374151&color=fff&size=40`}
                            alt={c.name}
                            title={`${c.name} (${c.party})`}
                            className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover hover:scale-110 transition-transform"
                        />
                    ))}
                    {election.candidates.length > 5 && (
                        <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-300 font-bold">
                            +{election.candidates.length - 5}
                        </div>
                    )}
                </div>

                {/* Winner banner for declared elections */}
                {!isActive && winner && (
                    <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-xl p-4 mb-6 flex items-center space-x-3">
                        <Trophy size={24} className="text-yellow-400 flex-shrink-0" />
                        <div>
                            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Winner</p>
                            <p className="text-white font-bold text-lg">{winner.name}
                                <span className="text-gray-400 font-normal text-sm ml-2">({winner.party})</span>
                            </p>
                            <p className="text-gray-400 text-xs">{winner.voteCount} votes</p>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="flex justify-end">
                    {canVote ? (
                        <Link
                            to={`/vote?electionId=${encodeURIComponent(election.electionId)}`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Button variant="primary" className="group flex items-center space-x-2">
                                <Vote size={18} />
                                <span>Vote Now</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    ) : isActive ? (
                        <Button variant="secondary" className="flex items-center space-x-2" disabled>
                            <CheckCircle2 size={18} />
                            <span>Already Voted</span>
                        </Button>
                    ) : (
                        <Link
                            to={`/results?electionId=${encodeURIComponent(election.electionId)}`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <Button variant="secondary" className="group flex items-center space-x-2">
                                <BarChart3 size={18} />
                                <span>Show Results</span>
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ElectionsPage;
