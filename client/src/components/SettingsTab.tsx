import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const SettingsTab: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({
        electionName: '',
        startDate: '',
        endDate: '',
        isActive: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/settings`);
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    electionName: data.electionName || '',
                    startDate: data.startDate ? data.startDate.split('T')[0] : '',
                    endDate: data.endDate ? data.endDate.split('T')[0] : '',
                    isActive: data.isActive
                });
            }
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        if (settings.startDate && settings.endDate && settings.startDate > settings.endDate) {
            setMessageType('error');
            setMessage('End date must be after start date.');
            setSaving(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                const data = await res.json();
                setSettings({
                    electionName: data.electionName || '',
                    startDate: data.startDate ? data.startDate.split('T')[0] : '',
                    endDate: data.endDate ? data.endDate.split('T')[0] : '',
                    isActive: data.isActive
                });
                setMessageType('success');
                setMessage('Settings updated successfully!');
            } else {
                const data = await res.json().catch(() => null);
                setMessageType('error');
                setMessage(data?.message || `Failed to update settings: ${res.status}`);
            }
        } catch (err) {
            setMessageType('error');
            setMessage('Error connecting to server.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <Card>
            <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Election Settings</h2>
            {message && (
                <div className={`${messageType === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-400'} p-3 rounded mb-4`}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Election Name</label>
                    <Input 
                        value={settings.electionName}
                        onChange={(e) => setSettings({...settings, electionName: e.target.value})}
                        required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                        <Input 
                            type="date"
                            value={settings.startDate}
                            onChange={(e) => setSettings({...settings, startDate: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                        <Input 
                            type="date"
                            value={settings.endDate}
                            onChange={(e) => setSettings({...settings, endDate: e.target.value})}
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 py-4 border-y border-gray-700">
                    <label className="text-sm font-medium text-gray-400">Voting Status:</label>
                    <button
                        type="button"
                        onClick={() => setSettings({...settings, isActive: !settings.isActive})}
                        className={`px-4 py-2 rounded font-bold transition-colors ${settings.isActive ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                    >
                        {settings.isActive ? 'OPEN / ACTIVE' : 'CLOSED / INACTIVE'}
                    </button>
                    <span className="text-sm text-gray-500 ml-2">
                        {settings.isActive ? '(Users can cast votes)' : '(Voting is disabled)'}
                    </span>
                </div>

                <p className="text-sm text-gray-500">
                    Reopening a closed election continues the same election. Starting a new election after results have been declared resets current vote counts and current-election vote status, while preserved election history remains available in the elections list.
                </p>

                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </form>
        </Card>
    );
};

export default SettingsTab;
