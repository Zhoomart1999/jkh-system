import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { DebtorsReportItem } from '../../types';

const DebtorsPage: React.FC = () => {
    const [debtors, setDebtors] = useState<DebtorsReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'balance'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchDebtors();
    }, []);

    const fetchDebtors = async () => {
        try {
            setLoading(true);
            const data = await api.getDebtorsReport();
            setDebtors(data);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить список должников');
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedDebtors = debtors
        .filter(debtor => 
            searchQuery === '' || 
            debtor.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            debtor.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            debtor.phone.includes(searchQuery)
        )
        .sort((a, b) => {
            let aValue, bValue;
            
            if (sortBy === 'name') {
                aValue = a.fullName.toLowerCase();
                bValue = b.fullName.toLowerCase();
            } else {
                aValue = a.balance;
                bValue = b.balance;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const getTotalDebt = () => {
        return filteredAndSortedDebtors.reduce((sum, debtor) => sum + debtor.balance, 0);
    };

    const getDebtorsCount = () => {
        return filteredAndSortedDebtors.length;
    };

    const handleSort = (field: 'name' | 'balance') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка списка должников...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Должники</h1>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Количество должников</p>
                    <p className="text-2xl font-bold text-red-600">{getDebtorsCount()}</p>
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Общий долг</p>
                        <p className="text-3xl font-bold text-red-600">
                            {getTotalDebt().toFixed(2)} сом
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Средний долг</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {getDebtorsCount() > 0 ? (getTotalDebt() / getDebtorsCount()).toFixed(2) : '0.00'} сом
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Максимальный долг</p>
                        <p className="text-3xl font-bold text-red-700">
                            {Math.max(...filteredAndSortedDebtors.map(d => d.balance)).toFixed(2)} сом
                        </p>
                    </div>
                </Card>
            </div>

            {/* Фильтры */}
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Поиск</label>
                        <input
                            type="text"
                            placeholder="Поиск по ФИО, адресу или телефону..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Список должников */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        ФИО
                                        {sortBy === 'name' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Адрес
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Телефон
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('balance')}
                                >
                                    <div className="flex items-center">
                                        Долг
                                        {sortBy === 'balance' && (
                                            <span className="ml-1">
                                                {sortOrder === 'asc' ? '↑' : '↓'}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAndSortedDebtors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                        Нет должников, соответствующих фильтрам
                                    </td>
                                </tr>
                            ) : (
                                filteredAndSortedDebtors.map((debtor) => (
                                    <tr key={debtor.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {debtor.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {debtor.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {debtor.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                            {debtor.balance.toFixed(2)} сом
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-sm text-gray-600">
                    Показано {filteredAndSortedDebtors.length} из {debtors.length} должников
                </div>
            </Card>
        </div>
    );
};

export default DebtorsPage; 