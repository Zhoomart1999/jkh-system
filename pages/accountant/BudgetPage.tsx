import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';

interface BudgetItem {
    id: string;
    category: string;
    planned: number;
    actual: number;
    month: string;
    year: number;
}

const BudgetPage: React.FC = () => {
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { showNotification } = useNotifications();

    useEffect(() => {
        // Имитация загрузки бюджета
        setTimeout(() => {
            setBudgetItems([
                {
                    id: '1',
                    category: 'Зарплаты',
                    planned: 500000,
                    actual: 485000,
                    month: 'Январь',
                    year: 2024
                },
                {
                    id: '2',
                    category: 'Коммунальные услуги',
                    planned: 150000,
                    actual: 145000,
                    month: 'Январь',
                    year: 2024
                },
                {
                    id: '3',
                    category: 'Материалы и оборудование',
                    planned: 300000,
                    actual: 320000,
                    month: 'Январь',
                    year: 2024
                },
                {
                    id: '4',
                    category: 'Транспортные расходы',
                    planned: 80000,
                    actual: 75000,
                    month: 'Январь',
                    year: 2024
                },
                {
                    id: '5',
                    category: 'Прочие расходы',
                    planned: 100000,
                    actual: 95000,
                    month: 'Январь',
                    year: 2024
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredBudget = budgetItems.filter(item => item.year === selectedYear);

    const getTotalPlanned = () => {
        return filteredBudget.reduce((sum, item) => sum + item.planned, 0);
    };

    const getTotalActual = () => {
        return filteredBudget.reduce((sum, item) => sum + item.actual, 0);
    };

    const getVariance = () => {
        return getTotalActual() - getTotalPlanned();
    };

    const getVariancePercentage = () => {
        if (getTotalPlanned() === 0) return 0;
        return (getVariance() / getTotalPlanned()) * 100;
    };

    const getVarianceColor = () => {
        const variance = getVariance();
        if (variance < 0) return 'text-green-600'; // Экономия
        if (variance > 0) return 'text-red-600';   // Перерасход
        return 'text-gray-600';                    // В рамках
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка бюджета...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Бюджет</h1>
                <div>
                    <label className="block text-sm font-medium mb-1">Год</label>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={2023}>2023</option>
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                    </select>
                </div>
            </div>

            {/* Общая статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Планируемые расходы</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {getTotalPlanned().toLocaleString()} сом
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Фактические расходы</p>
                        <p className="text-2xl font-bold text-green-600">
                            {getTotalActual().toLocaleString()} сом
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">Отклонение</p>
                        <p className={`text-2xl font-bold ${getVarianceColor()}`}>
                            {getVariance().toLocaleString()} сом
                        </p>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <p className="text-sm text-gray-600">% отклонения</p>
                        <p className={`text-2xl font-bold ${getVarianceColor()}`}>
                            {getVariancePercentage().toFixed(1)}%
                        </p>
                    </div>
                </Card>
            </div>

            {/* Детализация бюджета */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Детализация по категориям</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Категория
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Планируемые
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Фактические
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Отклонение
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    % выполнения
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBudget.map((item) => {
                                const variance = item.actual - item.planned;
                                const variancePercentage = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                                const varianceColor = variance < 0 ? 'text-green-600' : variance > 0 ? 'text-red-600' : 'text-gray-600';
                                
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.planned.toLocaleString()} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.actual.toLocaleString()} сом
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${varianceColor}`}>
                                            {variance.toLocaleString()} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {variancePercentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* График выполнения бюджета */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Выполнение бюджета</h2>
                <div className="space-y-4">
                    {filteredBudget.map((item) => {
                        const percentage = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                        const barColor = percentage <= 100 ? 'bg-green-500' : 'bg-red-500';
                        
                        return (
                            <div key={item.id} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-900">{item.category}</span>
                                    <span className="text-gray-600">
                                        {item.actual.toLocaleString()} / {item.planned.toLocaleString()} сом
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full ${barColor}`}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                    {percentage.toFixed(1)}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default BudgetPage; 