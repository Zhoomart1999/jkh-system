import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { Expense, ExpenseCategory, ExpenseCategoryLabels } from '../../types';

const ExpensesPage: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'category'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const data = await api.getExpenses();
            setExpenses(data);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить расходы');
        } finally {
            setLoading(false);
        }
    };

    const filteredAndSortedExpenses = expenses
        .filter(expense => {
            const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
            const matchesSearch = searchQuery === '' || 
                expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            let aValue, bValue;
            
            if (sortBy === 'date') {
                aValue = new Date(a.date).getTime();
                bValue = new Date(b.date).getTime();
            } else if (sortBy === 'amount') {
                aValue = a.amount;
                bValue = b.amount;
            } else {
                aValue = a.category.toLowerCase();
                bValue = b.category.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

    const getTotalAmount = () => {
        return filteredAndSortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const getCategoryStats = () => {
        const stats = new Map<ExpenseCategory, number>();
        filteredAndSortedExpenses.forEach(expense => {
            const current = stats.get(expense.category) || 0;
            stats.set(expense.category, current + expense.amount);
        });
        return Array.from(stats.entries()).map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / getTotalAmount()) * 100
        }));
    };

    const handleSort = (field: 'date' | 'amount' | 'category') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 font-medium">Загрузка расходов...</p>
                    <p className="text-sm text-gray-500 mt-2">Подготавливаем данные для вас</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Заголовок и статистика */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Расходы
                            </h1>
                            <p className="text-gray-600 mt-2">Управление и анализ расходов компании</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 font-medium">Общая сумма расходов</p>
                            <p className="text-4xl font-bold text-red-600">
                                {getTotalAmount().toLocaleString()} сом
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                {filteredAndSortedExpenses.length} записей
                            </p>
                        </div>
                    </div>
                </div>

                {/* Статистика по категориям */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getCategoryStats().map((stat) => (
                        <div key={stat.category} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Категория</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {ExpenseCategoryLabels[stat.category]}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stat.amount.toLocaleString()} сом
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {stat.percentage.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Фильтры и поиск */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🔍 Поиск по описанию или категории
                            </label>
                            <input
                                type="text"
                                placeholder="Введите текст для поиска..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📂 Категория
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="all">Все категории</option>
                                {Object.values(ExpenseCategory).map(category => (
                                    <option key={category} value={category}>
                                        {ExpenseCategoryLabels[category]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📊 Сортировка
                            </label>
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-');
                                    setSortBy(field as 'date' | 'amount' | 'category');
                                    setSortOrder(order as 'asc' | 'desc');
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="date-desc">Дата (новые)</option>
                                <option value="date-asc">Дата (старые)</option>
                                <option value="amount-desc">Сумма (большие)</option>
                                <option value="amount-asc">Сумма (малые)</option>
                                <option value="category-asc">Категория А-Я</option>
                                <option value="category-desc">Категория Я-А</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Список расходов */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                        <h2 className="text-xl font-semibold text-white">Детализация расходов</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleSort('date')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>📅 Дата</span>
                                            {sortBy === 'date' && (
                                                <span className="text-blue-600">
                                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        📝 Описание
                                    </th>
                                    <th 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                        onClick={() => handleSort('category')}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>📂 Категория</span>
                                            {sortBy === 'category' && (
                                                <span className="text-blue-600">
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
                                                <span className="text-blue-600">
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
                                {filteredAndSortedExpenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                <div className="text-6xl mb-4">📭</div>
                                                <p className="text-lg font-medium">Нет расходов</p>
                                                <p className="text-sm">Попробуйте изменить фильтры поиска</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAndSortedExpenses.map((expense, index) => (
                                        <tr 
                                            key={expense.id} 
                                            className="hover:bg-blue-50 transition-all duration-200 transform hover:scale-[1.01]"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {new Date(expense.date).toLocaleDateString('ru-RU', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {new Date(expense.date).toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 max-w-xs">
                                                    {expense.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    {ExpenseCategoryLabels[expense.category]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-lg font-bold text-red-600">
                                                    {expense.amount.toLocaleString()} сом
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                                    ✅ Подтвержден
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
                                Показано {filteredAndSortedExpenses.length} из {expenses.length} расходов
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

export default ExpensesPage; 