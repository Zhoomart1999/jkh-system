import React from 'react';
import AppealsTab from './tabs/AppealsTab';

const AppealsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Обращения</h1>
            <AppealsTab />
        </div>
    );
};

export default AppealsPage; 