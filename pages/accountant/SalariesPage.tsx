import React from 'react';
import SalariesTab from './tabs/SalariesTab';

const SalariesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Зарплаты</h1>
            <SalariesTab />
        </div>
    );
};

export default SalariesPage; 