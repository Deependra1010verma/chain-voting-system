import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', isLoading, children, className, ...props }) => {
    const baseStyles = "px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50 focus:ring-blue-500",
        secondary: "bg-gray-700 hover:bg-gray-600 text-white shadow-lg shadow-gray-500/30 focus:ring-gray-500",
        danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50 focus:ring-red-500",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className || ''}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                </div>
            ) : children}
        </button>
    );
};

export default Button;
