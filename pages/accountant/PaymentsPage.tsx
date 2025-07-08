import React from 'react';
import RevenueTab from './tabs/RevenueTab';

const PaymentsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Платежи</h1>
            <RevenueTab />
        </div>
    );
};

export default PaymentsPage;
