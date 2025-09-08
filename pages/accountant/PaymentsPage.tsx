import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { Payment, PaymentMethod } from '../../types';

const PaymentsPage: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await api.getPayments();
            setPayments(data);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить платежи');
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
        const matchesSearch = searchQuery === '' || 
            payment.abonentId.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesMethod && matchesSearch;
    });

    const getTotalAmount = () => {
        return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    };

    const getMethodLabel = (method: PaymentMethod) => {
        const labels: Record<PaymentMethod, string> = {
            [PaymentMethod.Cash]: 'Наличные',
            [PaymentMethod.Bank]: 'Банк',
            [PaymentMethod.Card]: 'Карта',
            [PaymentMethod.Transfer]: 'Перевод'
        };
        return labels[method];
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка платежей...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Платежи
                </h1>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Общая сумма</p>
                    <p className="text-2xl font-bold text-green-600">
                        {getTotalAmount().toFixed(2)} сом
                    </p>
                </div>
            </div>

            {/* Фильтры */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Поиск</label>
                        <input
                            type="text"
                            placeholder="Поиск по ID абонента..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Способ оплаты</label>
                        <select
                            value={filterMethod}
                            onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | 'all')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Все способы</option>
                            {Object.values(PaymentMethod).map(method => (
                                <option key={method} value={method}>
                                    {getMethodLabel(method)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Список платежей */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Абонент ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Способ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Статус
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Нет платежей, соответствующих фильтрам
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(payment.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.abonentId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.amount.toFixed(2)} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getMethodLabel(payment.method)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Подтвержден
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                    Показано {filteredPayments.length} из {payments.length} платежей
                </div>
            </Card>
        </div>
    );
};

export default PaymentsPage;
