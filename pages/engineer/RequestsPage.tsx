import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { RequestType, RequestStatus, RequestPriority, RequestTypeLabels, RequestStatusLabels, RequestPriorityLabels } from '../../types';

interface TechnicalRequest {
    id: string;
    type: RequestType;
    status: RequestStatus;
    priority: RequestPriority;
    abonentName: string;
    address: string;
    description: string;
    createdAt: string;
    assignedToId?: string;
    assignedToName?: string;
}

const RequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<TechnicalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<RequestPriority | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await api.getTechnicalRequests();
            setRequests(data);
        } catch (error) {
            showNotification('error', 'Ошибка', 'Не удалось загрузить заявки');
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(request => {
        const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
        const matchesSearch = searchQuery === '' || 
            request.abonentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesStatus && matchesPriority && matchesSearch;
    });

    const getStatusColor = (status: RequestStatus) => {
        switch (status) {
            case RequestStatus.Pending: return 'bg-yellow-100 text-yellow-800';
            case RequestStatus.InProgress: return 'bg-blue-100 text-blue-800';
            case RequestStatus.Completed: return 'bg-green-100 text-green-800';
            case RequestStatus.Cancelled: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: RequestPriority) => {
        switch (priority) {
            case RequestPriority.Low: return 'bg-gray-100 text-gray-800';
            case RequestPriority.Normal: return 'bg-blue-100 text-blue-800';
            case RequestPriority.High: return 'bg-orange-100 text-orange-800';
            case RequestPriority.Critical: return 'bg-red-100 text-red-800';
            case RequestPriority.Urgent: return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка заявок...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Технические заявки
                </h1>
            </div>

            {/* Фильтры */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Поиск</label>
                        <input
                            type="text"
                            placeholder="Поиск по абоненту, адресу, деталям..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Статус</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as RequestStatus | 'all')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Все статусы</option>
                            {Object.values(RequestStatus).map(status => (
                                <option key={status} value={status}>
                                    {RequestStatusLabels[status]}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Приоритет</label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as RequestPriority | 'all')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Все приоритеты</option>
                            {Object.values(RequestPriority).map(priority => (
                                <option key={priority} value={priority}>
                                    {RequestPriorityLabels[priority]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Список заявок */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ДАТА
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ТИП
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    АБОНЕНТ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    АДРЕС
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    СТАТУС
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ПРИОРИТЕТ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ИСПОЛНИТЕЛЬ
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                        Нет заявок, соответствующих фильтрам
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {RequestTypeLabels[request.type]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {request.abonentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {request.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                {RequestStatusLabels[request.status]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                                                {RequestPriorityLabels[request.priority]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {request.assignedToName || 'Не назначен'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                    Показано {filteredRequests.length} из {requests.length} заявок
                </div>
            </Card>
        </div>
    );
};

export default RequestsPage; 