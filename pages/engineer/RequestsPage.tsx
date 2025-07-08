import React from 'react';
import RequestsTab from './tabs/RequestsTab';

const RequestsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Заявки</h1>
            <RequestsTab />
        </div>
    );
};

export default RequestsPage; 