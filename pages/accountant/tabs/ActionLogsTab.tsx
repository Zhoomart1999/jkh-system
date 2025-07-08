import React from 'react';
import Card from '../../../components/ui/Card';

const ActionLogsTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Журнал действий</h2>
            </div>

            <Card>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">История действий пользователей</h3>
                    <p className="text-gray-500">
                        Здесь будет отображаться журнал всех действий пользователей системы для аудита и контроля.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default ActionLogsTab; 