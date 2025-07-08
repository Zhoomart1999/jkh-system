import React from 'react';
import AbonentsTab from './tabs/AbonentsTab';

const AbonentsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Абоненты</h1>
            <AbonentsTab />
        </div>
    );
};

export default AbonentsPage; 