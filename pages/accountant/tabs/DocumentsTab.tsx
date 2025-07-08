import React from 'react';
import Card from '../../../components/ui/Card';

const DocumentsTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Документы</h2>
            </div>

            <Card>
                <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Управление документами</h3>
                    <p className="text-gray-500">
                        Здесь будет функционал для загрузки, просмотра и управления документами абонентов.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default DocumentsTab; 