import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Trash2, Edit2, Plus, Users, Settings, BarChart2 } from 'lucide-react';
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

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'settings' | 'candidates' | 'analytics'>('settings');
    
    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        party: '',
        position: '',
        image: ''
    });

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

    useEffect(() => {
        fetchCandidates();
    }, []);

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

            <div className="flex space-x-2 border-b border-gray-800 pb-px mb-6">
                <button 
                    onClick={() => setActiveTab('settings')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'settings' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <Settings size={18} /> Election Details
                </button>
                <button 
                    onClick={() => setActiveTab('candidates')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'candidates' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <Users size={18} /> Candidates
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'analytics' ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                    <BarChart2 size={18} /> Analytics & Export
                </button>
            </div>

            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
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
                            <Input 
                                name="name" 
                                value={formData.name} 
                                onChange={handleInputChange} 
                                placeholder="e.g. Rahul Verma" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Party</label>
                            <Input 
                                name="party" 
                                value={formData.party} 
                                onChange={handleInputChange} 
                                placeholder="e.g. Reform Party" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Position</label>
                            <Input 
                                name="position" 
                                value={formData.position} 
                                onChange={handleInputChange} 
                                placeholder="e.g. President" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Image URL</label>
                            <Input 
                                name="image" 
                                value={formData.image} 
                                onChange={handleInputChange} 
                                placeholder="https://..." 
                            />
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
        </div>
    );
};

export default AdminPage;
