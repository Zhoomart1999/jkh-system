import React from 'react';
import ReadingsTab from './tabs/ReadingsTab';

const ReadingsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Показания</h1>
            <ReadingsTab />
        </div>
    );
};

export default ReadingsPage; 