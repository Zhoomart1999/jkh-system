import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import Card from '../../components/ui/Card';
import { ExclamationTriangleIcon, CheckIcon, ClockIcon, PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';

interface WarehouseItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    unit: string;
    price: number;
    supplier: string;
    lastRestock: string;
}

interface AutoRequest {
    id: string;
    itemId: string;
    itemName: string;
    requestedQuantity: number;
    reason: 'low_stock' | 'out_of_stock' | 'maintenance' | 'emergency';
    status: 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
    requestedBy: string;
    requestedAt: string;
    approvedAt?: string;
    receivedAt?: string;
    notes?: string;
}

const AutoWarehousePage: React.FC = () => {
    const [warehouseItems, setWarehouseItems] = useState<WarehouseItem[]>([]);
    const [autoRequests, setAutoRequests] = useState<AutoRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateRequest, setShowCreateRequest] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Форма создания запроса
    const [formData, setFormData] = useState({
        itemId: '',
        requestedQuantity: 1,
        reason: 'low_stock' as AutoRequest['reason'],
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Имитация загрузки данных
            const mockItems: WarehouseItem[] = [
                {
                    id: '1',
                    name: 'Насос водяной',
                    category: 'Оборудование',
                    currentStock: 2,
                    minStock: 3,
                    maxStock: 10,
                    unit: 'шт',
                    price: 15000,
                    supplier: 'ООО "Насосы"',
                    lastRestock: '2024-12-15'
                },
                {
                    id: '2',
                    name: 'Труба ПВХ 50мм',
                    category: 'Материалы',
                    currentStock: 50,
                    minStock: 100,
                    maxStock: 500,
                    unit: 'м',
                    price: 120,
                    supplier: 'ООО "Трубы"',
                    lastRestock: '2024-12-10'
                },
                {
                    id: '3',
                    name: 'Кран шаровый',
                    category: 'Арматура',
                    currentStock: 0,
                    minStock: 5,
                    maxStock: 20,
                    unit: 'шт',
                    price: 800,
                    supplier: 'ООО "Арматура"',
                    lastRestock: '2024-12-01'
                }
            ];

            const mockRequests: AutoRequest[] = [
                {
                    id: '1',
                    itemId: '3',
                    itemName: 'Кран шаровый',
                    requestedQuantity: 10,
                    reason: 'out_of_stock',
                    status: 'approved',
                    requestedBy: 'Инженер Петров',
                    requestedAt: '2025-01-10',
                    approvedAt: '2025-01-11',
                    notes: 'Срочно для ремонта'
                }
            ];

            setWarehouseItems(mockItems);
            setAutoRequests(mockRequests);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createAutoRequest = async () => {
        if (!formData.itemId || formData.requestedQuantity <= 0) return;

        setProcessing(true);
        try {
            const item = warehouseItems.find(i => i.id === formData.itemId);
            if (!item) return;

            const newRequest: AutoRequest = {
                id: Date.now().toString(),
                itemId: formData.itemId,
                itemName: item.name,
                requestedQuantity: formData.requestedQuantity,
                reason: formData.reason,
                status: 'pending',
                requestedBy: 'Инженер',
                requestedAt: new Date().toISOString().split('T')[0],
                notes: formData.notes
            };

            setAutoRequests([newRequest, ...autoRequests]);
            setShowCreateRequest(false);
            setFormData({
                itemId: '',
                requestedQuantity: 1,
                reason: 'low_stock',
                notes: ''
            });
            
            alert('Запрос на склад создан!');
        } catch (error) {
            alert('Ошибка при создании запроса');
        } finally {
            setProcessing(false);
        }
    };

    const updateRequestStatus = async (requestId: string, status: AutoRequest['status']) => {
        setProcessing(true);
        try {
            setAutoRequests(requests => 
                requests.map(req => 
                    req.id === requestId 
                        ? { 
                            ...req, 
                            status,
                            approvedAt: status === 'approved' ? new Date().toISOString().split('T')[0] : req.approvedAt,
                            receivedAt: status === 'received' ? new Date().toISOString().split('T')[0] : req.receivedAt
                        }
                        : req
                )
            );
            alert('Статус запроса обновлен!');
        } catch (error) {
            alert('Ошибка при обновлении статуса');
        } finally {
            setProcessing(false);
        }
    };

    const deleteRequest = async (requestId: string) => {
        if (!confirm('Удалить запрос?')) return;
        
        setProcessing(true);
        try {
            setAutoRequests(requests => requests.filter(req => req.id !== requestId));
            alert('Запрос удален!');
        } catch (error) {
            alert('Ошибка при удалении запроса');
        } finally {
            setProcessing(false);
        }
    };

    const getLowStockItems = () => warehouseItems.filter(item => item.currentStock <= item.minStock);
    const getOutOfStockItems = () => warehouseItems.filter(item => item.currentStock === 0);
    const getPendingRequests = () => autoRequests.filter(req => req.status === 'pending');
    const getApprovedRequests = () => autoRequests.filter(req => req.status === 'approved');

    const getReasonLabel = (reason: string) => {
        switch (reason) {
            case 'low_stock': return 'Низкий запас';
            case 'out_of_stock': return 'Нет в наличии';
            case 'maintenance': return 'Техобслуживание';
            case 'emergency': return 'Аварийная ситуация';
            default: return reason;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Ожидает';
            case 'approved': return 'Одобрен';
            case 'ordered': return 'Заказан';
            case 'received': return 'Получен';
            case 'cancelled': return 'Отменен';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'ordered': return 'bg-purple-100 text-purple-800';
            case 'received': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Автоматические запросы на склад</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Автоматические запросы на склад</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getOutOfStockItems().length}
                                </div>
                                <div className="text-sm text-slate-600">Нет в наличии</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-orange-500" />
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {getLowStockItems().length}
                                </div>
                                <div className="text-sm text-slate-600">Низкий запас</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="w-8 h-8 text-yellow-500" />
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {getPendingRequests().length}
                                </div>
                                <div className="text-sm text-slate-600">Ожидают одобрения</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getApprovedRequests().length}
                                </div>
                                <div className="text-sm text-slate-600">Одобрены</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Критические позиции */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                        <h3 className="text-lg font-semibold">Критические позиции</h3>
                    </div>
                    <button
                        onClick={() => setShowCreateRequest(!showCreateRequest)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showCreateRequest ? 'Отмена' : 'Создать запрос'}
                    </button>
                </div>

                {showCreateRequest && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Товар
                                </label>
                                <select
                                    value={formData.itemId}
                                    onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите товар...</option>
                                    {warehouseItems.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} ({item.currentStock}/{item.minStock} {item.unit})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Количество
                                </label>
                                <input
                                    type="number"
                                    value={formData.requestedQuantity}
                                    onChange={(e) => setFormData({...formData, requestedQuantity: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Причина
                                </label>
                                <select
                                    value={formData.reason}
                                    onChange={(e) => setFormData({...formData, reason: e.target.value as AutoRequest['reason']})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="low_stock">Низкий запас</option>
                                    <option value="out_of_stock">Нет в наличии</option>
                                    <option value="maintenance">Техобслуживание</option>
                                    <option value="emergency">Аварийная ситуация</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Примечания
                                </label>
                                <input
                                    type="text"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <button
                            onClick={createAutoRequest}
                            disabled={processing || !formData.itemId || formData.requestedQuantity <= 0}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {processing ? 'Создание...' : 'Создать запрос'}
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Товар
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Категория
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Текущий запас
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Минимум
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Поставщик
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {getLowStockItems().map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${item.currentStock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                            {item.currentStock} {item.unit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.minStock} {item.unit}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            item.currentStock === 0 ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                        }`}>
                                            {item.currentStock === 0 ? 'Нет в наличии' : 'Низкий запас'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.supplier}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {getLowStockItems().length === 0 && (
                    <div className="text-center py-12">
                        <CheckIcon className="mx-auto h-12 w-12 text-green-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Все позиции в норме</h3>
                        <p className="text-slate-500">Нет критических позиций на складе</p>
                    </div>
                )}
            </Card>

            {/* Запросы на склад */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <ClockIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Запросы на склад</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Товар
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Количество
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Причина
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Запросил
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {autoRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {request.itemName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {request.requestedQuantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {getReasonLabel(request.reason)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                            {getStatusLabel(request.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {request.requestedBy}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        {new Date(request.requestedAt).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            {request.status === 'pending' && (
                                                <button
                                                    onClick={() => updateRequestStatus(request.id, 'approved')}
                                                    disabled={processing}
                                                    className="bg-green-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:bg-green-300"
                                                >
                                                    Одобрить
                                                </button>
                                            )}
                                            {request.status === 'approved' && (
                                                <button
                                                    onClick={() => updateRequestStatus(request.id, 'received')}
                                                    disabled={processing}
                                                    className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                                                >
                                                    Получено
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteRequest(request.id)}
                                                disabled={processing}
                                                className="bg-red-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:bg-red-300"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {autoRequests.length === 0 && (
                    <div className="text-center py-12">
                        <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет запросов на склад</h3>
                        <p className="text-slate-500">Создайте первый запрос на пополнение склада</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AutoWarehousePage; 