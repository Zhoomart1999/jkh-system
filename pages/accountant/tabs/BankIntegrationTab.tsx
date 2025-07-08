import React from 'react';
import Card from '../../../components/ui/Card';

const BankIntegrationTab: React.FC = () => {
    return (
        <Card>
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Банковская интеграция</h2>
                <p className="text-slate-600">Здесь будет интерфейс для управления интеграцией с банками</p>
            </div>
        </Card>
    );
};

export default BankIntegrationTab; 