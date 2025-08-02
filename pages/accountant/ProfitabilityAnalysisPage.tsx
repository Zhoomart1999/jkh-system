import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import Card from '../../components/ui/Card';
import { TrendingUpIcon, TrendingDownIcon, CalculatorIcon, DollarSignIcon, ChartBarIcon } from '../../components/ui/Icons';

interface ServiceProfitability {
    id: string;
    serviceName: string;
    category: string;
    revenue: number;
    costs: number;
    profit: number;
    profitMargin: number;
    customerCount: number;
    averageRevenuePerCustomer: number;
    period: string;
    trend: 'increasing' | 'decreasing' | 'stable';
}

interface CostBreakdown {
    id: string;
    serviceName: string;
    category: string;
    laborCosts: number;
    materialCosts: number;
    energyCosts: number;
    maintenanceCosts: number;
    otherCosts: number;
    totalCosts: number;
    period: string;
}

const ProfitabilityAnalysisPage: React.FC = () => {
    const [profitabilityData, setProfitabilityData] = useState<ServiceProfitability[]>([]);
    const [costBreakdown, setCostBreakdown] = useState<CostBreakdown[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('2025-01');
    const [selectedService, setSelectedService] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Имитация загрузки данных
            const mockProfitability: ServiceProfitability[] = [
                {
                    id: '1',
                    serviceName: 'Водоснабжение',
                    category: 'Основные услуги',
                    revenue: 800000,
                    costs: 450000,
                    profit: 350000,
                    profitMargin: 43.75,
                    customerCount: 1200,
                    averageRevenuePerCustomer: 667,
                    period: '2025-01',
                    trend: 'increasing'
                },
                {
                    id: '2',
                    serviceName: 'Водоотведение',
                    category: 'Основные услуги',
                    revenue: 600000,
                    costs: 380000,
                    profit: 220000,
                    profitMargin: 36.67,
                    customerCount: 1200,
                    averageRevenuePerCustomer: 500,
                    period: '2025-01',
                    trend: 'stable'
                },
                {
                    id: '3',
                    serviceName: 'Техобслуживание',
                    category: 'Дополнительные услуги',
                    revenue: 150000,
                    costs: 120000,
                    profit: 30000,
                    profitMargin: 20.00,
                    customerCount: 200,
                    averageRevenuePerCustomer: 750,
                    period: '2025-01',
                    trend: 'decreasing'
                }
            ];

            const mockCostBreakdown: CostBreakdown[] = [
                {
                    id: '1',
                    serviceName: 'Водоснабжение',
                    category: 'Основные услуги',
                    laborCosts: 200000,
                    materialCosts: 100000,
                    energyCosts: 80000,
                    maintenanceCosts: 50000,
                    otherCosts: 20000,
                    totalCosts: 450000,
                    period: '2025-01'
                },
                {
                    id: '2',
                    serviceName: 'Водоотведение',
                    category: 'Основные услуги',
                    laborCosts: 150000,
                    materialCosts: 80000,
                    energyCosts: 60000,
                    maintenanceCosts: 40000,
                    otherCosts: 50000,
                    totalCosts: 380000,
                    period: '2025-01'
                }
            ];

            setProfitabilityData(mockProfitability);
            setCostBreakdown(mockCostBreakdown);
        } catch (error) {
            console.error('Failed to fetch profitability data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUpIcon className="w-4 h-4 text-green-500" />;
            case 'decreasing': return <TrendingDownIcon className="w-4 h-4 text-red-500" />;
            case 'stable': return <ChartBarIcon className="w-4 h-4 text-blue-500" />;
            default: return <ChartBarIcon className="w-4 h-4 text-slate-500" />;
        }
    };

    const getTrendLabel = (trend: string) => {
        switch (trend) {
            case 'increasing': return 'Растет';
            case 'decreasing': return 'Падает';
            case 'stable': return 'Стабильно';
            default: return trend;
        }
    };

    const getProfitMarginColor = (margin: number) => {
        if (margin >= 40) return 'text-green-600';
        if (margin >= 25) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getFilteredData = () => {
        if (selectedService === 'all') return profitabilityData;
        return profitabilityData.filter(item => item.serviceName === selectedService);
    };

    const getServices = () => {
        const services = [...new Set(profitabilityData.map(item => item.serviceName))];
        return services;
    };

    const getTotalRevenue = () => getFilteredData().reduce((sum, item) => sum + item.revenue, 0);
    const getTotalCosts = () => getFilteredData().reduce((sum, item) => sum + item.costs, 0);
    const getTotalProfit = () => getFilteredData().reduce((sum, item) => sum + item.profit, 0);
    const getAverageProfitMargin = () => {
        const data = getFilteredData();
        if (data.length === 0) return 0;
        return data.reduce((sum, item) => sum + item.profitMargin, 0) / data.length;
    };

    const getMostProfitableService = () => {
        const data = getFilteredData();
        if (data.length === 0) return null;
        return data.reduce((max, item) => item.profitMargin > max.profitMargin ? item : max);
    };

    const getLeastProfitableService = () => {
        const data = getFilteredData();
        if (data.length === 0) return null;
        return data.reduce((min, item) => item.profitMargin < min.profitMargin ? item : min);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Анализ рентабельности</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <CalculatorIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Анализ рентабельности</h1>

            {/* Фильтры */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CalculatorIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Настройки анализа</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Период
                        </label>
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="2025-01">Январь 2025</option>
                            <option value="2024-12">Декабрь 2024</option>
                            <option value="2024-11">Ноябрь 2024</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Услуга
                        </label>
                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Все услуги</option>
                            {getServices().map(service => (
                                <option key={service} value={service}>{service}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Общая статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <TrendingUpIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getTotalRevenue().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Общий доход</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <TrendingDownIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getTotalCosts().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Общие расходы</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <DollarSignIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {getTotalProfit().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Общая прибыль</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CalculatorIcon className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className={`text-2xl font-bold ${getProfitMarginColor(getAverageProfitMargin())}`}>
                                    {getAverageProfitMargin().toFixed(1)}%
                                </div>
                                <div className="text-sm text-slate-600">Средняя рентабельность</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Анализ по услугам */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Рентабельность по услугам</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Услуга
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Категория
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Доход
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Расходы
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Прибыль
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Рентабельность
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Клиенты
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Тренд
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {getFilteredData().map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.serviceName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        {item.revenue.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                        {item.costs.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                                        {item.profit.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${getProfitMarginColor(item.profitMargin)}`}>
                                            {item.profitMargin.toFixed(1)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.customerCount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center gap-2">
                                            {getTrendIcon(item.trend)}
                                            <span className="text-xs text-slate-600">
                                                {getTrendLabel(item.trend)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {getFilteredData().length === 0 && (
                    <div className="text-center py-12">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет данных о рентабельности</h3>
                        <p className="text-slate-500">Добавьте данные о доходах и расходах</p>
                    </div>
                )}
            </Card>

            {/* Детализация расходов */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CalculatorIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Детализация расходов</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Услуга
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Труд
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Материалы
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Энергия
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Обслуживание
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Прочее
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Итого
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {costBreakdown.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.serviceName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.laborCosts.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.materialCosts.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.energyCosts.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.maintenanceCosts.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.otherCosts.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                        {item.totalCosts.toLocaleString()} сом
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {costBreakdown.length === 0 && (
                    <div className="text-center py-12">
                        <CalculatorIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет данных о расходах</h3>
                        <p className="text-slate-500">Добавьте детализацию расходов по услугам</p>
                    </div>
                )}
            </Card>

            {/* Рекомендации */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <TrendingUpIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Рекомендации по улучшению рентабельности</h3>
                </div>
                
                <div className="space-y-4">
                    {getMostProfitableService() && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">✅ Самая прибыльная услуга:</h4>
                            <p className="text-sm text-green-700">
                                <strong>{getMostProfitableService()?.serviceName}</strong> с рентабельностью {getMostProfitableService()?.profitMargin.toFixed(1)}%. 
                                Рассмотрите возможность расширения этой услуги.
                            </p>
                        </div>
                    )}
                    
                    {getLeastProfitableService() && getLeastProfitableService()!.profitMargin < 25 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Требует оптимизации:</h4>
                            <p className="text-sm text-yellow-700">
                                <strong>{getLeastProfitableService()?.serviceName}</strong> имеет низкую рентабельность {getLeastProfitableService()?.profitMargin.toFixed(1)}%. 
                                Рекомендуется анализ расходов и возможное повышение тарифов.
                            </p>
                        </div>
                    )}
                    
                    {getAverageProfitMargin() < 30 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">🚨 Общая рентабельность низкая:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>• Проведите аудит всех расходов</li>
                                <li>• Рассмотрите повышение тарифов</li>
                                <li>• Оптимизируйте процессы для снижения затрат</li>
                                <li>• Изучите возможности диверсификации услуг</li>
                            </ul>
                        </div>
                    )}
                    
                    {getAverageProfitMargin() >= 35 && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">✅ Отличные показатели:</h4>
                            <p className="text-sm text-green-700">
                                Средняя рентабельность {getAverageProfitMargin().toFixed(1)}% показывает эффективную работу. 
                                Продолжайте текущую стратегию развития.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ProfitabilityAnalysisPage; 