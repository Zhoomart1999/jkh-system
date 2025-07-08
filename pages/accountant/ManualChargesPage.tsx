import React from 'react';
import ManualChargesTab from './tabs/ManualChargesTab';

const ManualChargesPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ручные начисления</h1>
            <ManualChargesTab />
        </div>
    );
};

export default ManualChargesPage; 