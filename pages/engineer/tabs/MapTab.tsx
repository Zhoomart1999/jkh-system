import React from 'react';
import Card from '../../../components/ui/Card';

const MapTab: React.FC = () => {
    return (
        <Card>
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-4">GIS Карта инфраструктуры</h2>
                <p className="text-slate-500 mb-6">
                    Функция карты временно недоступна. В будущих версиях здесь будет интерактивная карта 
                    с отображением труб, задвижек, гидрантов и других объектов инфраструктуры.
                </p>
                <div className="bg-slate-100 rounded-lg p-8 max-w-md mx-auto">
                    <div className="text-4xl mb-4">🗺️</div>
                    <h3 className="font-semibold mb-2">Планируемые функции:</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Интерактивная карта с объектами</li>
                        <li>• Добавление новых объектов</li>
                        <li>• Просмотр статуса оборудования</li>
                        <li>• Планирование маршрутов</li>
                        <li>• Экспорт данных карты</li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default MapTab;