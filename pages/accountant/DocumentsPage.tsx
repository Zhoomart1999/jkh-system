import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';

interface Document {
    id: string;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    status: 'active' | 'archived';
}

const DocumentsPage: React.FC = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotifications();

    useEffect(() => {
        // Имитация загрузки документов
        setTimeout(() => {
            setDocuments([
                {
                    id: '1',
                    name: 'Договор с поставщиками 2024',
                    type: 'PDF',
                    size: '2.5 MB',
                    uploadDate: '2024-01-15',
                    status: 'active'
                },
                {
                    id: '2',
                    name: 'Лицензия на водоснабжение',
                    type: 'PDF',
                    size: '1.8 MB',
                    uploadDate: '2024-01-10',
                    status: 'active'
                },
                {
                    id: '3',
                    name: 'Отчет по расходам за декабрь 2023',
                    type: 'Excel',
                    size: '856 KB',
                    uploadDate: '2023-12-31',
                    status: 'archived'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleDownload = (document: Document) => {
        showNotification('success', `Скачивание документа: ${document.name}`);
    };

    const handleArchive = (documentId: string) => {
        setDocuments(prev => 
            prev.map(doc => 
                doc.id === documentId 
                    ? { ...doc, status: 'archived' as const }
                    : doc
            )
        );
        showNotification('success', 'Документ перемещен в архив');
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка документов...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Документы</h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Название
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Тип
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Размер
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата загрузки
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Статус
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map((document) => (
                                <tr key={document.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {document.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {document.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {document.size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(document.uploadDate).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            document.status === 'active' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {document.status === 'active' ? 'Активен' : 'В архиве'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleDownload(document)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Скачать
                                            </button>
                                            {document.status === 'active' && (
                                                <button
                                                    onClick={() => handleArchive(document.id)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                >
                                                    В архив
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DocumentsPage; 