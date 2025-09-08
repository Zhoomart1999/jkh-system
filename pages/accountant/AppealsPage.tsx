import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';

interface Appeal {
    id: string;
    abonentName: string;
    abonentPhone: string;
    subject: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved' | 'closed';
    createdAt: string;
    resolvedAt?: string;
}

const AppealsPage: React.FC = () => {
    const [appeals, setAppeals] = useState<Appeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<Appeal['status'] | 'all'>('all');
    const { showNotification } = useNotifications();

    useEffect(() => {
        // Имитация загрузки обращений
        setTimeout(() => {
            setAppeals([
                {
                    id: '1',
                    abonentName: 'Иванов Иван Иванович',
                    abonentPhone: '+996 555 123 456',
                    subject: 'Жалоба на качество воды',
                    message: 'Вода имеет неприятный запах и цвет',
                    status: 'new',
                    createdAt: '2024-01-20T10:00:00Z'
                },
                {
                    id: '2',
                    abonentName: 'Петров Петр Петрович',
                    abonentPhone: '+996 555 789 012',
                    subject: 'Вопрос по тарифам',
                    message: 'Хочу уточнить новые тарифы на воду',
                    status: 'in_progress',
                    createdAt: '2024-01-19T14:30:00Z'
                },
                {
                    id: '3',
                    abonentName: 'Сидоров Сидор Сидорович',
                    abonentPhone: '+996 555 345 678',
                    subject: 'Благодарность',
                    message: 'Спасибо за быстрое решение проблемы',
                    status: 'resolved',
                    createdAt: '2024-01-18T09:15:00Z',
                    resolvedAt: '2024-01-19T16:00:00Z'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredAppeals = appeals.filter(appeal => {
        return filterStatus === 'all' || appeal.status === filterStatus;
    });

    const getStatusLabel = (status: Appeal['status']) => {
        const labels: Record<Appeal['status'], string> = {
            new: 'Новое',
            in_progress: 'В работе',
            resolved: 'Решено',
            closed: 'Закрыто'
        };
        return labels[status];
    };

    const getStatusColor = (status: Appeal['status']) => {
        const colors: Record<Appeal['status'], string> = {
            new: 'bg-blue-100 text-blue-800',
            in_progress: 'bg-yellow-100 text-yellow-800',
            resolved: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800'
        };
        return colors[status];
    };

    const handleStatusChange = (appealId: string, newStatus: Appeal['status']) => {
        setAppeals(prev => 
            prev.map(appeal => 
                appeal.id === appealId 
                    ? { 
                        ...appeal, 
                        status: newStatus,
                        resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : appeal.resolvedAt
                    }
                    : appeal
            )
        );
        showNotification('success', 'Статус обращения обновлен');
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка обращений...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Обращения</h1>

            {/* Фильтры */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Статус</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as Appeal['status'] | 'all')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Все статусы</option>
                            <option value="new">Новые</option>
                            <option value="in_progress">В работе</option>
                            <option value="resolved">Решенные</option>
                            <option value="closed">Закрытые</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Список обращений */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Абонент
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Тема
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
                            {filteredAppeals.map((appeal) => (
                                <tr key={appeal.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(appeal.createdAt).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {appeal.abonentName}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {appeal.abonentPhone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {appeal.subject}
                                            </div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                {appeal.message}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appeal.status)}`}>
                                            {getStatusLabel(appeal.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <select
                                            value={appeal.status}
                                            onChange={(e) => handleStatusChange(appeal.id, e.target.value as Appeal['status'])}
                                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="new">Новое</option>
                                            <option value="in_progress">В работе</option>
                                            <option value="resolved">Решено</option>
                                            <option value="closed">Закрыто</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                    Показано {filteredAppeals.length} из {appeals.length} обращений
                </div>
            </Card>
        </div>
    );
};

export default AppealsPage; 