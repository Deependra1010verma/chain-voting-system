import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Shield, CheckCircle, XCircle } from 'lucide-react';
import API_URL from '../config';

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [electionData, setElectionData] = React.useState<any>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${API_URL}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setElectionData(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchSettings();
    }, []);

    if (!user) {
        return <div className="text-center mt-20">Please log in to view dashboard.</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-400">Welcome back, {user.username}</p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Voter Profile" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User size={100} />
                    </div>
                    <div className="space-y-2 relative z-10">
                        <p className="text-gray-400 text-sm">Voter ID</p>
                        <p className="font-mono bg-gray-900/50 p-2 rounded text-sm break-all border border-gray-700">
                            {user._id}
                        </p>
                        <p className="text-gray-400 text-sm mt-4">Email</p>
                        <p>{user.email}</p>
                        <p className="text-gray-400 text-sm mt-4">Verification</p>
                        <p className={user.isVerified ? 'text-green-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                            {user.isVerified ? 'Verified by admin' : 'Pending admin approval'}
                        </p>
                    </div>
                </Card>

                <Card title="Election Status" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield size={100} className="text-purple-500" />
                    </div>
                    <div className="flex flex-col items-center justify-center h-full space-y-4 relative z-10">
                        {electionData?.isActive ? (
                            <>
                                <div className="text-emerald-400 flex items-center space-x-2">
                                    <CheckCircle size={32} />
                                    <span className="text-2xl font-bold">Election Live</span>
                                </div>
                                <p className="text-center text-gray-400">
                                    {electionData?.electionName || 'Election'} is currently active.
                                    View all elections to cast your vote or check results.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-yellow-500 flex items-center space-x-2">
                                    <XCircle size={32} />
                                    <span className="text-2xl font-bold">No Active Election</span>
                                </div>
                                <p className="text-center text-gray-400">
                                    Voting is currently closed. View past election results below.
                                </p>
                            </>
                        )}
                        <Link to="/elections" className="w-full">
                            <Button variant="primary" className="w-full">
                                {electionData?.isActive ? 'Vote Election' : 'View Elections'}
                            </Button>
                        </Link>
                    </div>
                </Card>

                <Card title="Blockchain Status" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield size={100} />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Network</span>
                            <span className="text-green-400 font-bold">Active</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                            <span className="text-gray-400">Current Block</span>
                            <span className="font-mono">#124 (Mock)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Difficulty</span>
                            <span className="font-mono">2</span>
                        </div>
                        <Link to="/audit">
                            <Button variant="secondary" className="w-full mt-2 text-sm">Audit Chain</Button>
                        </Link>
                    </div>
                </Card>
                <Card title="Candidate Portal" className="relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User size={100} />
                    </div>
                    <div className="flex flex-col items-center justify-center h-full space-y-4 relative z-10">
                        <div className="text-blue-500 flex items-center space-x-2">
                            <Shield size={32} />
                            <span className="text-2xl font-bold">Stand in Election</span>
                        </div>
                        <p className="text-center text-gray-400">
                            Apply to be a candidate for the upcoming election.
                        </p>
                        <Link to="/candidate-register" className="w-full">
                            <Button className="w-full" variant="primary">Register as Candidate</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
