import React from 'react';
import CheckClosingTab from './tabs/CheckClosingTab';

const CheckClosingPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Закрытие чека</h1>
            <CheckClosingTab />
        </div>
    );
};

export default CheckClosingPage; 