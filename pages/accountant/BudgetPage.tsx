import React from 'react';
import BudgetTab from './tabs/BudgetTab';

const BudgetPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Финансовые планы</h1>
            <BudgetTab />
        </div>
    );
};

export default BudgetPage; 