import React from 'react';
import WaterQualityTab from './tabs/WaterQualityTab';

const WaterQualityPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Качество воды</h1>
            <WaterQualityTab />
        </div>
    );
};

export default WaterQualityPage; 