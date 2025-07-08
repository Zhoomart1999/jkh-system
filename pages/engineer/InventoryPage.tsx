import React from 'react';
import InventoryTab from './tabs/InventoryTab';

const InventoryPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Склад</h1>
            <InventoryTab />
        </div>
    );
};

export default InventoryPage; 