import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';

const LandingPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center space-y-12">
            <section className="text-center space-y-6 mt-12 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        Blockchain
                    </span>{' '}
                    Voting System
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Secure, transparent, and immutable voting platform powered by custom blockchain technology.
                    Ensure your vote counts and verify it on the chain.
                </p>
                <div className="flex justify-center space-x-4">
                    <Link to="/register">
                        <Button className="text-lg px-8 py-3">Get Started</Button>
                    </Link>
                    <Link to="/transparency">
                        <Button variant="secondary" className="text-lg px-8 py-3">View Public Dashboard</Button>
                    </Link>
                </div>
            </section>

            <section className="grid md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                <Card title="Secure" className="hover:border-blue-500/50">
                    <p className="text-gray-400">
                        Votes are encrypted and stored on a distributed ledger. Tamper-proof design ensures
                        election integrity.
                    </p>
                </Card>
                <Card title="Transparent" className="hover:border-purple-500/50">
                    <p className="text-gray-400">
                        Anyone can audit the blockchain to verify votes. Results are calculated automatically
                        and visible to all.
                    </p>
                </Card>
                <Card title="Anonymous" className="hover:border-green-500/50">
                    <p className="text-gray-400">
                        Voter identity is protected. Your vote is linked to your unique ID but kept partialy anonymous on the public view.
                    </p>
                </Card>
            </section>
        </div>
    );
};

export default LandingPage;
