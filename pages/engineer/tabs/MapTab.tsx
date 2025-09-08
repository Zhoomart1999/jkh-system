import React from 'react';
import Card from '../../../components/ui/Card';

const MapTab: React.FC = () => {
    return (
        <Card>
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">GIS Карта инфраструктуры</h2>
                <div className="bg-slate-100 rounded-lg p-8 max-w-md mx-auto">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="font-semibold mb-2">Карта в разработке</h3>
                    <p className="text-sm text-slate-600">
                        Интерактивная карта с отображением труб, задвижек, гидрантов и других объектов инфраструктуры.
                    </p>
                </div>
            </div>
        </Card>
    );
};

export default MapTab;