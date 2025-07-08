import React from 'react';
import InfrastructureTab from './tabs/InfrastructureTab';

const InfrastructurePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Зоны</h1>
            <InfrastructureTab />
        </div>
    );
};

export default InfrastructurePage; 