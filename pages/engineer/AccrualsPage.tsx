import React from 'react';
import AccrualsTab from './tabs/AccrualsTab';

const AccrualsPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Начисления</h1>
            <AccrualsTab />
        </div>
    );
};

export default AccrualsPage;
