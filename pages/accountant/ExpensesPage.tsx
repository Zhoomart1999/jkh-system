import React from 'react';
import ExpensesTab from './tabs/ExpensesTab';

const ExpensesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Расходы</h1>
            <ExpensesTab />
        </div>
    );
};

export default ExpensesPage; 