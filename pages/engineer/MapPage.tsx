import React from 'react';
import MapTab from './tabs/MapTab';

const MapPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Карта (ГИС)</h1>
            <MapTab />
        </div>
    );
};

export default MapPage; 