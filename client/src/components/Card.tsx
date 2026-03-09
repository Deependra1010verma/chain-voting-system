import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const Card: React.FC<CardProps> = ({ children, className, title }) => {
    return (
        <div className={`bg-gray-800/50 backdrop-blur-xl border border-gray-700 p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ${className || ''}`}>
            {title && (
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};

export default Card;
