import React from 'react';
import DebtManagementTab from './tabs/DebtManagementTab';

const DebtorsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Должники</h1>
            <DebtManagementTab />
        </div>
    );
};

export default DebtorsPage; 