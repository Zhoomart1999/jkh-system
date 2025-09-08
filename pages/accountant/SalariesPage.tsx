import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { StaffSalary } from '../../types';

const SalariesPage: React.FC = () => {
    const [salaries, setSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'position' | 'amount' | 'date'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchSalaries();
    }, []);

    const fetchSalaries = async () => {
        try {
            setLoading(true);
            const data = await api.getSalaries();
            setSalaries(data);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить зарплаты');
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedSalaries = salaries
        .filter(salary => {
            return searchQuery === '' || 
                salary.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                salary.role.toLowerCase().includes(searchQuery.toLowerCase());
        })
        .sort((a, b) => {
            let aValue, bValue;
            
            if (sortBy === 'name') {
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            } else if (sortBy === 'position') {
                aValue = a.role.toLowerCase();
                bValue = b.role.toLowerCase();
            } else if (sortBy === 'amount') {
                aValue = a.monthlySalary;
                bValue = b.monthlySalary;
            } else {
                aValue = a.lastPaidDate ? new Date(a.lastPaidDate).getTime() : 0;
                bValue = b.lastPaidDate ? new Date(b.lastPaidDate).getTime() : 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const getTotalAmount = () => {
        return filteredAndSortedSalaries.reduce((sum, salary) => sum + salary.monthlySalary, 0);
    };

    const getPositionStats = () => {
        const stats = new Map<string, { count: number; total: number }>();
        filteredAndSortedSalaries.forEach(salary => {
            const current = stats.get(salary.role) || { count: 0, total: 0 };
            stats.set(salary.role, {
                count: current.count + 1,
                total: current.total + salary.monthlySalary
            });
        });
        return Array.from(stats.entries()).map(([role, data]) => ({
            position: role,
            count: data.count,
            total: data.total,
            average: data.total / data.count
        }));
    };

    const handleSort = (field: 'name' | 'position' | 'amount' | 'date') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 font-medium">Загрузка зарплат...</p>
                    <p className="text-sm text-gray-500 mt-2">Подготавливаем данные для вас</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Заголовок и статистика */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                                Зарплаты
                            </h1>
                            <p className="text-gray-600 mt-2">Управление зарплатами сотрудников компании</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 font-medium">Общий фонд зарплат</p>
                            <p className="text-4xl font-bold text-green-600">
                                {getTotalAmount().toLocaleString()} сом
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {filteredAndSortedSalaries.length} сотрудников
                            </p>
                        </div>
                    </div>
                </div>

                {/* Статистика по должностям */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getPositionStats().map((stat) => (
                        <div key={stat.position} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="text-center">
                                <div className="text-2xl mb-2">👷</div>
                                <p className="text-sm text-gray-600 font-medium">Должность</p>
                                <p className="text-lg font-semibold text-gray-900 mb-2">
                                    {stat.position}
                                </p>
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-500">
                                        Сотрудников: <span className="font-semibold text-blue-600">{stat.count}</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Общая сумма: <span className="font-semibold text-green-600">{stat.total.toLocaleString()} сом</span>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Средняя: <span className="font-semibold text-purple-600">{stat.average.toFixed(0)} сом</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Фильтры и поиск */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🔍 Поиск по имени или должности
                            </label>
                            <input
                                type="text"
                                placeholder="Введите текст для поиска..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📊 Сортировка
                            </label>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field as 'name' | 'position' | 'amount' | 'date');
                                    setSortOrder(order as 'asc' | 'desc');
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="date-desc">Дата выплаты (новые)</option>
                                <option value="date-asc">Дата выплаты (старые)</option>
                                <option value="name-asc">Имя А-Я</option>
                                <option value="name-desc">Имя Я-А</option>
                                <option value="position-asc">Должность А-Я</option>
                                <option value="position-desc">Должность Я-А</option>
                                <option value="amount-desc">Зарплата (большие)</option>
                                <option value="amount-asc">Зарплата (малые)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Список зарплат */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600">
                        <h2 className="text-xl font-semibold text-white">Детализация зарплат</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>👤 Сотрудник</span>
                                            {sortBy === 'name' && (
                                                <span className="text-green-600">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleSort('position')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>💼 Должность</span>
                                            {sortBy === 'position' && (
                                                <span className="text-green-600">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleSort('amount')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>💰 Сумма</span>
                                            {sortBy === 'amount' && (
                                                <span className="text-green-600">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleSort('date')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>📅 Дата выплаты</span>
                                            {sortBy === 'date' && (
                                                <span className="text-green-600">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        ✅ Статус
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {filteredAndSortedSalaries.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <div className="text-6xl mb-4">📭</div>
                                                <p className="text-lg font-medium">Нет зарплат</p>
                                                <p className="text-sm">Попробуйте изменить фильтры поиска</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedSalaries.map((salary, index) => (
                                        <tr 
                                            key={salary.id} 
                                            className="hover:bg-green-50 transition-all duration-200 transform hover:scale-[1.01]"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {salary.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {salary.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-lg font-bold text-green-600">
                                                    {salary.monthlySalary.toLocaleString()} сом
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {salary.lastPaidDate ? new Date(salary.lastPaidDate).toLocaleDateString('ru-RU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : 'Не выплачено'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {salary.lastPaidDate ? new Date(salary.lastPaidDate).toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    }) : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                                    ✅ Выплачено
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>
                                Показано {filteredAndSortedSalaries.length} из {salaries.length} зарплат
                            </span>
                            <span>
                                Последнее обновление: {new Date().toLocaleTimeString('ru-RU')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalariesPage; 