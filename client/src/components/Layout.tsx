import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
            <footer className="bg-gray-900 border-t border-gray-800 py-6 text-center text-gray-500">
                <p>&copy; {new Date().getFullYear()} ChainVote. Secure Blockchain Voting System.</p>
            </footer>
        </div>
    );
};

export default Layout;
