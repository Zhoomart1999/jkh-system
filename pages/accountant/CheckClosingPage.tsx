import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';

interface CheckClosing {
    id: string;
    abonentId: string;
    abonentName: string;
    amount: number;
    date: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdBy: string;
    createdAt: string;
}

const CheckClosingPage: React.FC = () => {
    const [checkClosings, setCheckClosings] = useState<CheckClosing[]>([]);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchCheckClosings();
    }, []);

    const fetchCheckClosings = async () => {
        try {
            setLoading(true);
            const data = await api.getCheckClosings();
            setCheckClosings(data);
        } catch (error) {
            showNotification('error', 'Ошибка', 'Не удалось загрузить данные о закрытии чеков');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (id: string) => {
        try {
            await api.confirmCheckClosing(id);
            showNotification('success', 'Успешно', 'Чек подтвержден');
            fetchCheckClosings();
        } catch (error) {
            showNotification('error', 'Ошибка', 'Не удалось подтвердить чек');
        }
    };

    const handleCancel = async (id: string) => {
        try {
            await api.cancelCheckClosing(id);
            showNotification('success', 'Успешно', 'Чек отменен');
            fetchCheckClosings();
        } catch (error) {
            showNotification('error', 'Ошибка', 'Не удалось отменить чек');
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка данных...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Закрытие чеков
                </h1>
            </div>

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
                                    Сумма
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
                            {checkClosings.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Нет данных о закрытии чеков
                                    </td>
                                </tr>
                            ) : (
                                checkClosings.map((closing) => (
                                    <tr key={closing.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(closing.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {closing.abonentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {closing.amount.toFixed(2)} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                closing.status === 'confirmed' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : closing.status === 'cancelled'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {closing.status === 'confirmed' ? 'Подтвержден' :
                                                 closing.status === 'cancelled' ? 'Отменен' : 'Ожидает'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {closing.status === 'pending' && (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleConfirm(closing.id)}
                                                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md text-xs"
                                                    >
                                                        Подтвердить
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(closing.id)}
                                                        className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md text-xs"
                                                    >
                                                        Отменить
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default CheckClosingPage; 