
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
            {children}
        </div>
    );
};

export default Card;