import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Shield, Database, Hash, Clock, Server } from 'lucide-react';

interface Vote {
    voterId: string;
    candidate: string;
    timestamp: number;
}

interface Block {
    index: number;
    timestamp: number;
    vote: Vote;
    previousHash: string;
    hash: string;
    nonce: number;
}

const AuditPage: React.FC = () => {
    const [chain, setChain] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlockchain = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/vote/chain');
                if (!response.ok) throw new Error('Failed to fetch blockchain data');
                const data = await response.json();
                setChain(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error connecting to blockchain node');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlockchain();
    }, []);

    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Database className="text-blue-500" />
                        Blockchain Audit Explorer
                    </h1>
                    <p className="text-gray-400 mt-2">Transparently verify the immutability of the election ledger.</p>
                </div>
                <div className="bg-gray-900/80 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-3">
                    <Server size={18} className={error ? "text-red-500" : "text-green-500"} />
                    <span className="text-sm font-medium">Node Status: {error ? 'Offline' : 'Syncing'}</span>
                </div>
            </header>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-blue-500">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                    <p>Downloading ledger blocks...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-6 rounded-lg text-center">
                    <Shield size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold text-lg mb-2">Node Connection Error</p>
                    <p>{error}</p>
                </div>
            ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                    {chain.map((block, i) => (
                        <div key={block.hash} className="relative">
                            {/* Visual link between blocks (except the first one) */}
                            {i !== 0 && (
                                <div className="absolute top-0 left-1/2 -mt-6 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 transform -translate-x-1/2"></div>
                            )}

                            <Card className="border-2 border-gray-700 hover:border-blue-500/50 transition-colors duration-300">
                                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg font-mono font-bold text-xl">
                                            #{block.index}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {block.index === 0 ? 'Genesis Block' : `Block ${block.index}`}
                                            </h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock size={14} />
                                                {formatTimestamp(block.timestamp)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-500 block mb-1">Nonce</span>
                                        <span className="font-mono bg-gray-900 px-2 py-1 rounded text-gray-300 border border-gray-800">
                                            {block.nonce}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4 font-mono text-sm break-all">
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                                        <div className="flex items-start gap-2 mb-2">
                                            <Hash size={16} className="text-purple-400 mt-1 flex-shrink-0" />
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Current Hash</span>
                                                <span className="text-green-400">{block.hash}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start gap-2 pt-3 border-t border-gray-800/50">
                                            <Hash size={16} className="text-gray-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <span className="text-gray-500 text-xs uppercase tracking-wider block mb-1">Previous Hash</span>
                                                <span className="text-gray-400">{block.previousHash}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="text-gray-400 text-xs uppercase tracking-wider mb-3">Stored Vote</h4>
                                        {block.index === 0 ? (
                                            <p className="text-gray-600 bg-gray-900/30 p-3 rounded italic text-center text-xs">Genesis Block (No real vote)</p>
                                        ) : !block.vote ? (
                                            <p className="text-gray-600 bg-gray-900/30 p-3 rounded italic text-center text-xs">No vote data</p>
                                        ) : (
                                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                                <div className="bg-gray-900/80 p-3 rounded border border-gray-800 text-xs grid grid-cols-1 md:grid-cols-3 gap-2">
                                                    <div><span className="text-gray-500">Voter:</span> {block.vote.voterId.substring(0, 8)}...</div>
                                                    <div><span className="text-gray-500">Candidate:</span> {block.vote.candidate.substring(0, 8)}...</div>
                                                    <div><span className="text-gray-500">Time:</span> {new Date(block.vote.timestamp).toLocaleTimeString()}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuditPage;
