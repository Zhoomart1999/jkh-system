import React from 'react';
import BankOperationsTab from './tabs/BankOperationsTab';

const BankOperationsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Банковские операции</h1>
            <BankOperationsTab />
        </div>
    );
};

export default BankOperationsPage; 