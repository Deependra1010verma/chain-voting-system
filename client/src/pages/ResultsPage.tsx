import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import { Shield, Database } from 'lucide-react';

interface VoteResult {
    [candidate: string]: number;
}

interface Transaction {
    type: 'VOTE' | 'REGISTRATION' | 'ADMIN_ACTION';
    data: any;
    timestamp: number;
}

interface Block {
    index: number;
    timestamp: number;
    transaction: Transaction;
    previousHash: string;
    hash: string;
    nonce: number;
}

const ResultsPage: React.FC = () => {
    const [results, setResults] = useState<VoteResult>({});
    const [chain, setChain] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsRes, chainRes] = await Promise.all([
                    fetch('http://localhost:5000/api/vote/results'),
                    fetch('http://localhost:5000/api/vote/chain')
                ]);

                if (resultsRes.ok) setResults(await resultsRes.json());
                if (chainRes.ok) setChain(await chainRes.json());
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-12 animate-fade-in-up">
            <header className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Election Results</h1>
                <p className="text-gray-400">Live tally from the blockchain.</p>
            </header>

            {isLoading && !totalVotes ? (
                <div className="text-center">Loading blockchain data...</div>
            ) : (
                <div className="grid md:grid-cols-2 gap-8">
                    <Card title="Vote Tally" className="space-y-6">
                        {Object.entries(results).length === 0 ? (
                            <p className="text-gray-400 text-center py-8">No votes cast yet.</p>
                        ) : (
                            Object.entries(results).map(([candidate, count]) => (
                                <div key={candidate} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-semibold">{candidate}</span>
                                        <span>{count} votes ({totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(1) : 0}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                                        <div
                                            className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${totalVotes > 0 ? (count / totalVotes) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div className="pt-4 border-t border-gray-700 flex justify-between items-center">
                            <span className="text-gray-400">Total Votes Cast</span>
                            <span className="text-2xl font-bold">{totalVotes}</span>
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card title="Blockchain Audit" className="h-[500px] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {chain.map((block) => (
                                    <div key={block.hash} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 space-y-2 font-mono text-xs break-all">
                                        <div className="flex justify-between items-center text-blue-400 border-b border-gray-800 pb-2 mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Database size={14} />
                                                <span className="font-bold">Block #{block.index}</span>
                                            </div>
                                            <span>{new Date(block.timestamp).toLocaleTimeString()}</span>
                                        </div>

                                        <div className="grid grid-cols-[80px_1fr] gap-2">
                                            <span className="text-gray-500">Hash:</span>
                                            <span className="text-green-500">{block.hash.substring(0, 20)}...</span>

                                            <span className="text-gray-500">Prev Hash:</span>
                                            <span className="text-gray-400">{block.previousHash ? block.previousHash.substring(0, 20) + '...' : 'Genesis'}</span>

                                            {block.index > 0 && block.transaction && (
                                                <>
                                                    <span className="text-gray-500">Action:</span>
                                                    <span className={block.transaction.type === 'VOTE' ? "text-green-500" : "text-yellow-500"}>
                                                        {block.transaction.type}
                                                        {block.transaction.type === 'VOTE' && block.transaction.data.candidate && ` (${block.transaction.data.candidate})`}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        {block.index === 0 && <div className="text-center text-gray-500 italic mt-2">Genesis Block</div>}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            <div className="text-center text-sm text-gray-500 flex justify-center items-center space-x-2">
                <Shield size={16} />
                <span>Verified by Custom Proof-of-Work Blockchain</span>
            </div>
        </div>
    );
};

export default ResultsPage;
