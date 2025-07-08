import React from 'react';
import Card from '../../../components/ui/Card';

const AppealsTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Обращения абонентов</h2>
            </div>

            <Card>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Обращения и жалобы</h3>
                    <p className="text-gray-500">
                        Здесь будет функционал для работы с обращениями, жалобами и запросами абонентов.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default AppealsTab; 