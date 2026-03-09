import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Vote, Link, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import API_URL from '../config';

interface PublicStats {
    election: {
        name: string;
        isActive: boolean;
        startDate?: string;
        endDate?: string;
    };
    statistics: {
        totalUsers: number;
        totalVotes: number;
        turnoutPercentage: number;
    };
    candidates: {
        _id: string;
        name: string;
        party: string;
        position: string;
        image: string;
        voteCount: number;
    }[];
    blockchain: {
        isValid: boolean;
        blockHeight: number;
        lastBlockTimestamp: number;
    };
}

const PublicDashboardPage: React.FC = () => {
    const [data, setData] = useState<PublicStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_URL}/api/public/stats`);
                if (!response.ok) throw new Error('Failed to fetch public stats');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError('Could not securely connect to the election network.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-blue-500">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-xl font-medium animate-pulse">Syncing with blockchain network...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <Shield size={64} className="text-red-500/50 mb-6" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">Network Error</h2>
                <p className="text-gray-400 max-w-md">{error}</p>
            </div>
        );
    }

    // Sort candidates by vote count descending
    const sortedCandidates = [...data.candidates].sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="text-center pt-8 pb-4">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-500 bg-clip-text text-transparent"
                >
                    Public Transparency Dashboard
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-gray-400 max-w-2xl mx-auto"
                >
                    {data.election.name} — Real-time immutable results and election integrity proof.
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 border border-gray-800"
                >
                    <div className={`w-3 h-3 rounded-full ${data.election.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="font-medium text-sm text-gray-300">
                        {data.election.isActive ? 'Election is currently ACTIVE' : 'Election is currently CLOSED'}
                    </span>
                </motion.div>
            </section>

            {/* Live Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center justify-center p-8 text-center hover:border-blue-500/30 transition-colors">
                    <Vote className="text-blue-500 mb-4" size={40} />
                    <h3 className="text-gray-400 font-medium mb-1">Total Votes Cast</h3>
                    <p className="text-4xl font-black text-white">{data.statistics.totalVotes}</p>
                </Card>
                
                <Card className="border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center justify-center p-8 text-center hover:border-purple-500/30 transition-colors">
                    <Users className="text-purple-500 mb-4" size={40} />
                    <h3 className="text-gray-400 font-medium mb-1">Voter Turnout</h3>
                    <p className="text-4xl font-black text-white">{data.statistics.turnoutPercentage}%</p>
                    <p className="text-xs text-gray-500 mt-2">({data.statistics.totalVotes} / {data.statistics.totalUsers} registered)</p>
                </Card>

                <Card className="border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center justify-center p-8 text-center hover:border-green-500/30 transition-colors">
                    <CheckCircle className={data.blockchain.isValid ? "text-green-500 mb-4" : "text-red-500 mb-4"} size={40} />
                    <h3 className="text-gray-400 font-medium mb-1">Network Integrity</h3>
                    <p className={`text-2xl font-black ${data.blockchain.isValid ? 'text-green-400' : 'text-red-400'}`}>
                        {data.blockchain.isValid ? 'SECURE' : 'COMPROMISED'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Cryptographically verified</p>
                </Card>

                <Card className="border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col items-center justify-center p-8 text-center hover:border-orange-500/30 transition-colors">
                    <Link className="text-orange-500 mb-4" size={40} />
                    <h3 className="text-gray-400 font-medium mb-1">Blockchain Height</h3>
                    <p className="text-4xl font-black text-white">{data.blockchain.blockHeight}</p>
                    <p className="text-xs text-gray-500 mt-2 truncate max-w-full">
                        Last block: {new Date(data.blockchain.lastBlockTimestamp).toLocaleTimeString()}
                    </p>
                </Card>
            </section>

            {/* Live Results / Roster */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                    <Shield className="text-blue-500" />
                    <h2 className="text-2xl font-bold">Live Candidate Standings</h2>
                </div>

                {sortedCandidates.length === 0 ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center text-gray-400">
                        No candidates are registered for this election yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedCandidates.map((candidate, index) => {
                            // Calculate percentage for progress bar
                            const rawPercentage = data.statistics.totalVotes > 0 
                                ? ((candidate.voteCount || 0) / data.statistics.totalVotes) * 100 
                                : 0;
                            // Add minimum width so empty votes still have a tiny sliver if others have none 
                            const displayPercentage = Math.max(rawPercentage, 1); 

                            return (
                                <motion.div 
                                    key={candidate._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="relative overflow-hidden border border-gray-800 bg-gray-900/80 hover:bg-gray-800 transition-all p-6">
                                        {/* Rank indicator */}
                                        <div className={`absolute top-0 right-0 w-16 h-16 transform translate-x-8 -translate-y-8 rotate-45 flex items-end justify-center pb-2 text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-500/20 text-yellow-500' : 
                                            index === 1 ? 'bg-gray-300/20 text-gray-300' : 
                                            index === 2 ? 'bg-orange-500/20 text-orange-500' : 
                                            'bg-gray-800 text-gray-500'
                                        }`}>
                                             #{index + 1}
                                        </div>

                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800 flex-shrink-0">
                                                {candidate.image ? (
                                                    <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                                                        {candidate.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
                                                <p className="text-sm text-gray-400">{candidate.party} - {candidate.position}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-sm text-gray-400 font-medium">Current Votes</span>
                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-white">{candidate.voteCount || 0}</span>
                                                    <span className="text-sm text-gray-500 ml-2">({rawPercentage.toFixed(1)}%)</span>
                                                </div>
                                            </div>
                                            <div className="h-4 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${displayPercentage}%` }}
                                                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                                    className={`h-full rounded-full ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-700'}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default PublicDashboardPage;
