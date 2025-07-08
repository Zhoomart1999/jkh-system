import React from 'react';
import ReportsTab from './tabs/ReportsTab';

const ReportsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Отчеты</h1>
            <ReportsTab />
        </div>
    );
};

export default ReportsPage; 