import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path ? 'text-blue-500 font-bold' : 'text-gray-300 hover:text-white';

    return (
        <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                            ChainVote
                        </Link>
                        <div className="hidden md:block ml-10 flex items-baseline space-x-4">
                            <Link to="/dashboard" className={`${isActive('/dashboard')} px-3 py-2 rounded-md transition-colors`}>Dashboard</Link>
                            <Link to="/vote" className={`${isActive('/vote')} px-3 py-2 rounded-md transition-colors`}>Vote</Link>
                            <Link to="/results" className={`${isActive('/results')} px-3 py-2 rounded-md transition-colors`}>Results</Link>
                            <Link to="/audit" className={`${isActive('/audit')} px-3 py-2 rounded-md transition-colors`}>Audit Chain</Link>
                            {user?.isAdmin && (
                                <Link to="/admin" className={`${isActive('/admin')} px-3 py-2 rounded-md transition-colors text-purple-400 hover:text-purple-300`}>
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>
                    <div>
                        {user ? (
                            <Button variant="secondary" onClick={handleLogout} className="text-sm">Logout</Button>
                        ) : (
                            <div className="space-x-2">
                                <Link to="/login"><Button variant="secondary" className="text-sm">Login</Button></Link>
                                <Link to="/register"><Button className="text-sm">Register</Button></Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
