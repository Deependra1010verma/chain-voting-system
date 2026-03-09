import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { Download, PieChart, Users } from 'lucide-react';
import API_URL from '../config';

interface AnalyticsData {
    totalUsers: number;
    totalVotesCast: number;
    turnoutPercentage: string;
}

interface Candidate {
    _id: string;
    name: string;
    party: string;
    voteCount: number;
}

const AnalyticsTab: React.FC = () => {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const fetchData = async () => {
        try {
            const [analyticsRes, candidatesRes] = await Promise.all([
                fetch(`${API_URL}/api/settings/analytics`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                }),
                fetch(`${API_URL}/api/candidates`)
            ]);

            if (analyticsRes.ok && candidatesRes.ok) {
                const analyticsData = await analyticsRes.json();
                const candidatesData = await candidatesRes.json();
                
                setAnalytics(analyticsData);
                // Sort candidates by vote counts descending
                setCandidates(candidatesData.sort((a: Candidate, b: Candidate) => b.voteCount - a.voteCount));
            }
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Name,Party,Votes\n"; // Headers

        candidates.forEach(c => {
            csvContent += `"${c.name}","${c.party}","${c.voteCount}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "election_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center py-8 text-center bg-blue-900/20 border-blue-500/30">
                    <Users size={32} className="text-blue-500 mb-2" />
                    <p className="text-gray-400">Total Registered Voters</p>
                    <p className="text-4xl font-bold">{analytics?.totalUsers}</p>
                </Card>
                <Card className="flex flex-col items-center justify-center py-8 text-center bg-green-900/20 border-green-500/30">
                    <PieChart size={32} className="text-green-500 mb-2" />
                    <p className="text-gray-400">Total Votes Cast</p>
                    <p className="text-4xl font-bold">{analytics?.totalVotesCast}</p>
                </Card>
                <Card className="flex flex-col items-center justify-center py-8 text-center bg-purple-900/20 border-purple-500/30">
                    <div className="text-3xl font-bold text-purple-500 mb-2">{analytics?.turnoutPercentage}%</div>
                    <p className="text-gray-400">Voter Turnout</p>
                </Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-2">
                    <h2 className="text-xl font-bold">Candidate Performance</h2>
                    <Button onClick={exportToCSV} className="flex items-center gap-2" variant="secondary">
                        <Download size={16} /> Export CSV
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400">
                                <th className="py-3 px-4 font-medium">Candidate Name</th>
                                <th className="py-3 px-4 font-medium">Party</th>
                                <th className="py-3 px-4 font-medium text-right">Votes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((c, idx) => (
                                <tr key={c._id} className={idx !== candidates.length - 1 ? "border-b border-gray-800" : ""}>
                                    <td className="py-3 px-4 font-bold">{c.name}</td>
                                    <td className="py-3 px-4 text-gray-400">{c.party}</td>
                                    <td className="py-3 px-4 text-right text-xl font-mono text-accent">{c.voteCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsTab;
