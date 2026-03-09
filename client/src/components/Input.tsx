import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
    return (
        <div className="flex flex-col space-y-1 w-full">
            {label && (
                <label className="text-sm font-medium text-gray-300 ml-1">
                    {label}
                </label>
            )}
            <input
                className={`px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className || ''}`}
                {...props}
            />
            {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
        </div>
    );
};

export default Input;
