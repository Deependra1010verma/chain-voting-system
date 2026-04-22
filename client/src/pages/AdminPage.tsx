import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Trash2, Edit2, Plus, Users, Settings, BarChart2, Trophy, Crown, RotateCcw, BadgeCheck } from 'lucide-react';
import SettingsTab from '../components/SettingsTab';
import AnalyticsTab from '../components/AnalyticsTab';
import API_URL from '../config';

interface Candidate {
    _id: string;
    name: string;
    party: string;
    position: string;
    image: string;
    voteCount: number;
}

interface DeclaredResult {
    declared: boolean;
    declaredAt: string;
    winner: Candidate;
}

interface Voter {
    _id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    hasVoted: boolean;
    votedElections: string[];
    isVerified: boolean;
    verificationStatus: 'pending' | 'verified';
    verifiedAt?: string | null;
}

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'settings' | 'candidates' | 'voters' | 'analytics' | 'results'>('settings');
    const [voters, setVoters] = useState<Voter[]>([]);
    const [isVotersLoading, setIsVotersLoading] = useState(true);
    const [voterMessage, setVoterMessage] = useState('');

    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        party: '',
        position: '',
        image: ''
    });

    // Results Tab State
    const [declaredResult, setDeclaredResult] = useState<DeclaredResult | null>(null);
    const [isDeclaring, setIsDeclaring] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    const fetchCandidates = async () => {
        try {
            const response = await fetch(`${API_URL}/api/candidates`);
            if (!response.ok) throw new Error('Failed to fetch candidates');
            const data = await response.json();
            setCandidates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load candidates');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDeclaredResult = async () => {
        try {
            const response = await fetch(`${API_URL}/api/public/stats`);
            if (response.ok) {
                const data = await response.json();
                setDeclaredResult(data.declaredResult || null);
            }
        } catch (err) {
            console.error('Failed to fetch declared result', err);
        }
    };

    const fetchVoters = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch voters');
            }

            const data = await response.json();
            setVoters(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load voters');
        } finally {
            setIsVotersLoading(false);
        }
    };

    useEffect(() => {
        fetchCandidates();
        fetchDeclaredResult();
        if (user?.token) {
            fetchVoters();
        }
    }, [user?.token]);

    // If not admin, redirect
    if (!user || !user.isAdmin) {
        return <Navigate to="/" />;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ name: '', party: '', position: '', image: '' });
    };

    const handleEdit = (candidate: Candidate) => {
        setIsEditing(true);
        setEditId(candidate._id);
        setFormData({
            name: candidate.name,
            party: candidate.party,
            position: candidate.position,
            image: candidate.image || ''
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this candidate?')) return;

        try {
            const response = await fetch(`${API_URL}/api/candidates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete candidate');
            fetchCandidates();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error deleting candidate');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = isEditing
                ? `${API_URL}/api/candidates/${editId}`
                : `${API_URL}/api/candidates`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to save candidate');

            resetForm();
            fetchCandidates();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error saving candidate');
        }
    };

    const handleVerifyVoter = async (voterId: string) => {
        setVoterMessage('');

        try {
            const response = await fetch(`${API_URL}/api/users/${voterId}/verify`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify voter');
            }

            setVoters((current) =>
                current.map((voter) => (voter._id === voterId ? data.voter : voter))
            );
            setVoterMessage(data.message);
        } catch (err) {
            setVoterMessage(err instanceof Error ? err.message : 'Error verifying voter');
        }
    };

    const handleDeclareWinner = async (candidateId: string, candidateName: string) => {
        if (!window.confirm(`Are you sure you want to officially declare "${candidateName}" as the election winner?\n\nThis action will be permanently recorded on the blockchain.`)) return;

        setIsDeclaring(true);
        setResultMessage('');
        try {
            const response = await fetch(`${API_URL}/api/settings/declare-result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ candidateId })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to declare result');

            setResultMessage(`✅ ${data.message}`);
            await fetchDeclaredResult();
        } catch (err) {
            setResultMessage(`❌ ${err instanceof Error ? err.message : 'Error declaring result'}`);
        } finally {
            setIsDeclaring(false);
        }
    };

    const handleRetractResult = async () => {
        if (!window.confirm('Are you sure you want to retract the declared result?\n\nNote: The blockchain record of this declaration will remain immutable.')) return;

        setIsDeclaring(true);
        setResultMessage('');
        try {
            const response = await fetch(`${API_URL}/api/settings/declare-result`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to retract result');

            setResultMessage(`✅ ${data.message}`);
            setDeclaredResult(null);
        } catch (err) {
            setResultMessage(`❌ ${err instanceof Error ? err.message : 'Error retracting result'}`);
        } finally {
            setIsDeclaring(false);
        }
    };

    const sortedCandidates = [...candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
    const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="text-blue-500" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-400 mt-2">Manage election details, candidates, and view results securely.</p>
                </div>
            </header>

            <div className="flex space-x-2 border-b border-gray-800 pb-px mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'settings' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <Settings size={18} /> Election Details
                </button>
                <button
                    onClick={() => setActiveTab('candidates')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'candidates' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <Users size={18} /> Candidates
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'analytics' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <BarChart2 size={18} /> Analytics &amp; Export
                </button>
                <button
                    onClick={() => setActiveTab('voters')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'voters' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <BadgeCheck size={18} /> Voter Approval
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'results' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <Trophy size={18} /> Declare Result
                </button>
            </div>

            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}

            {activeTab === 'voters' && (
                <Card>
                    <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BadgeCheck size={20} className="text-emerald-400" />
                                Voter Verification Queue
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Approve registered users before they are allowed to vote.
                            </p>
                        </div>
                        <span className="text-sm text-gray-500">
                            {voters.filter((voter) => !voter.isVerified && !voter.isAdmin).length} pending
                        </span>
                    </div>

                    {voterMessage && (
                        <div className={`mb-4 rounded-lg border p-3 text-sm ${voterMessage.toLowerCase().includes('success') ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-blue-500/20 bg-blue-500/10 text-blue-300'}`}>
                            {voterMessage}
                        </div>
                    )}

                    {isVotersLoading ? (
                        <div className="text-center py-8 text-gray-400">Loading voters...</div>
                    ) : (
                        <div className="space-y-4">
                            {voters.filter((voter) => !voter.isAdmin).map((voter) => (
                                <div
                                    key={voter._id}
                                    className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-4 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <h3 className="font-semibold text-white">{voter.username}</h3>
                                        <p className="text-sm text-gray-400">{voter.email}</p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Votes cast: {voter.votedElections?.length || 0}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-start gap-3 md:items-end">
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${voter.isVerified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            {voter.isVerified ? 'Verified' : 'Pending approval'}
                                        </span>
                                        {voter.isVerified ? (
                                            <p className="text-xs text-gray-500">
                                                Verified {voter.verifiedAt ? new Date(voter.verifiedAt).toLocaleString() : 'recently'}
                                            </p>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => handleVerifyVoter(voter._id)}
                                                className="flex items-center gap-2"
                                            >
                                                <BadgeCheck size={16} />
                                                Approve Voter
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

            {/* ─── CANDIDATES TAB ─── */}
            {activeTab === 'candidates' && (
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <Card className="lg:col-span-1 h-fit sticky top-24">
                        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">
                            {isEditing ? 'Edit Candidate' : 'Add New Candidate'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Rahul Verma" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Party</label>
                                <Input name="party" value={formData.party} onChange={handleInputChange} placeholder="e.g. Reform Party" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                                <Input name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g. President" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                                <Input name="image" value={formData.image} onChange={handleInputChange} placeholder="https://..." />
                                <p className="text-xs text-gray-500 mt-1">Leave blank to use an auto-generated avatar.</p>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="submit" className="flex-1 flex justify-center items-center gap-2">
                                    {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                                    {isEditing ? 'Update' : 'Add Candidate'}
                                </Button>

                                {isEditing && (
                                    <Button type="button" variant="secondary" onClick={resetForm}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Card>

                    {/* List Section */}
                    <Card className="lg:col-span-2">
                        <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Current Candidates</h2>

                        {isLoading ? (
                            <div className="text-center py-8 text-gray-400">Loading candidates...</div>
                        ) : error ? (
                            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg">{error}</div>
                        ) : candidates.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No candidates found. Add one to get started!</div>
                        ) : (
                            <div className="space-y-4">
                                {candidates.map(candidate => (
                                    <div key={candidate._id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={candidate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&color=fff`}
                                                alt={candidate.name}
                                                className="w-12 h-12 rounded-full border-2 border-gray-700"
                                            />
                                            <div>
                                                <h3 className="font-bold">{candidate.name}</h3>
                                                <p className="text-sm text-gray-400">{candidate.party} • {candidate.position}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(candidate)}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(candidate._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* ─── RESULTS / DECLARE WINNER TAB ─── */}
            {activeTab === 'results' && (
                <div className="space-y-8">

                    {/* Current Declaration Status */}
                    {declaredResult?.declared && (
                        <div className="relative overflow-hidden rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-yellow-500/10 via-yellow-400/5 to-transparent p-8">
                            {/* Decorative glow */}
                            <div className="absolute -top-10 -right-10 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="relative flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-shrink-0">
                                    <Crown size={56} className="text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <p className="text-yellow-400 font-semibold text-sm uppercase tracking-widest mb-1">✅ Official Result Declared</p>
                                    <h2 className="text-3xl font-extrabold text-white">{declaredResult.winner.name}</h2>
                                    <p className="text-gray-300 mt-1">{declaredResult.winner.party} — {declaredResult.winner.position}</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        {declaredResult.winner.voteCount} votes · Declared on {new Date(declaredResult.declaredAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <img
                                        src={declaredResult.winner.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(declaredResult.winner.name)}&background=ca8a04&color=fff&size=128`}
                                        alt={declaredResult.winner.name}
                                        className="w-20 h-20 rounded-full border-4 border-yellow-500/50 object-cover"
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-center md:justify-start">
                                <button
                                    onClick={handleRetractResult}
                                    disabled={isDeclaring}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/40 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RotateCcw size={14} />
                                    Retract Declaration
                                </button>
                            </div>
                        </div>
                    )}

                    {resultMessage && (
                        <div className={`p-4 rounded-lg text-sm font-medium ${resultMessage.startsWith('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {resultMessage}
                        </div>
                    )}

                    {/* Candidate Standings */}
                    <Card>
                        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500" /> Candidate Standings
                            </h2>
                            <span className="text-sm text-gray-500">{totalVotes} total votes</span>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-8 text-gray-400">Loading...</div>
                        ) : sortedCandidates.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">No candidates registered yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {sortedCandidates.map((candidate, index) => {
                                    const pct = totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes) * 100 : 0;
                                    const isCurrentWinner = declaredResult?.declared && declaredResult.winner._id === candidate._id;

                                    return (
                                        <div
                                            key={candidate._id}
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isCurrentWinner ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gray-800 bg-gray-900/50 hover:border-gray-600'}`}
                                        >
                                            {/* Rank */}
                                            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : index === 1 ? 'bg-gray-400/20 text-gray-300' : index === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-500'}`}>
                                                {index + 1}
                                            </div>

                                            {/* Avatar */}
                                            <img
                                                src={candidate.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&color=fff`}
                                                alt={candidate.name}
                                                className={`w-12 h-12 rounded-full border-2 flex-shrink-0 ${isCurrentWinner ? 'border-yellow-500' : 'border-gray-700'}`}
                                            />

                                            {/* Info + bar */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-white truncate">{candidate.name}</p>
                                                    {isCurrentWinner && <Crown size={14} className="text-yellow-400 flex-shrink-0" />}
                                                </div>
                                                <p className="text-xs text-gray-400 mb-2">{candidate.party} · {candidate.position}</p>
                                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' : 'bg-gray-600'}`}
                                                        style={{ width: `${Math.max(pct, 2)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Vote count */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-xl font-bold text-white">{candidate.voteCount || 0}</p>
                                                <p className="text-xs text-gray-500">{pct.toFixed(1)}%</p>
                                            </div>

                                            {/* Declare button */}
                                            {!declaredResult?.declared && (
                                                <button
                                                    onClick={() => handleDeclareWinner(candidate._id, candidate.name)}
                                                    disabled={isDeclaring}
                                                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:border-yellow-500/60 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                                                >
                                                    <Trophy size={14} />
                                                    Declare Winner
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
                        <strong>ℹ️ Note:</strong> Declaring a result is recorded as an immutable block on the blockchain. Retracting a declaration removes the public announcement, but the blockchain record remains permanent as an audit trail.
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;
