import React from 'react';
import MaintenanceTab from './tabs/MaintenanceTab';

const MaintenancePage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Обслуживание</h1>
            <MaintenanceTab />
        </div>
    );
};

export default MaintenancePage; 