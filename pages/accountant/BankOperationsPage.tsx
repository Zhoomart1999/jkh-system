import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { BankTransaction, BankType, BankTypeLabels } from '../../types';

const BankOperationsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<BankType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const data = await api.getBankTransactions();
            setTransactions(data);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить банковские операции');
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(transaction => {
        const matchesType = filterType === 'all' || transaction.type === filterType;
        const matchesSearch = searchQuery === '' || 
            transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.accountNumber.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesType && matchesSearch;
    });

    const getTotalAmount = () => {
        return filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка банковских операций...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Банковские операции
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
                            placeholder="Поиск по описанию или номеру счета..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Тип операции</label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as BankType | 'all')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">Все типы</option>
                            {Object.values(BankType).map(type => (
                                <option key={type} value={type}>
                                    {BankTypeLabels[type]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Список операций */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Описание
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Тип
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Статус
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Нет операций, соответствующих фильтрам
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(transaction.date).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {BankTypeLabels[transaction.type]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.amount.toFixed(2)} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                Подтверждена
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                    Показано {filteredTransactions.length} из {transactions.length} операций
                </div>
            </Card>
        </div>
    );
};

export default BankOperationsPage; 