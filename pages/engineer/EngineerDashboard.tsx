import React from 'react';
import OverviewTab from './tabs/OverviewTab';
import QuickActions from '../../components/ui/QuickActions';

const EngineerDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Обзор</h1>
            <QuickActions />
            <OverviewTab />
        </div>
    );
};

export default EngineerDashboard;
