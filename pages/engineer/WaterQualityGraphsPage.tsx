import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import Card from '../../components/ui/Card';
import { ChartBarIcon, TrendingUpIcon, TrendingDownIcon, ExclamationTriangleIcon, CheckIcon } from '../../components/ui/Icons';

interface WaterQualitySample {
    id: string;
    location: string;
    date: string;
    ph: number;
    turbidity: number;
    chlorine: number;
    hardness: number;
    bacteria: number;
    status: 'good' | 'warning' | 'critical';
    notes?: string;
}

interface QualityTrend {
    date: string;
    ph: number;
    turbidity: number;
    chlorine: number;
    hardness: number;
}

const WaterQualityGraphsPage: React.FC = () => {
    const [samples, setSamples] = useState<WaterQualitySample[]>([]);
    const [trends, setTrends] = useState<QualityTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState('all');
    const [selectedParameter, setSelectedParameter] = useState<'ph' | 'turbidity' | 'chlorine' | 'hardness'>('ph');
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Имитация загрузки данных
            const mockSamples: WaterQualitySample[] = [
                {
                    id: '1',
                    location: 'Насосная станция №1',
                    date: '2025-01-15',
                    ph: 7.2,
                    turbidity: 2.1,
                    chlorine: 0.8,
                    hardness: 150,
                    bacteria: 5,
                    status: 'good',
                    notes: 'Все показатели в норме'
                },
                {
                    id: '2',
                    location: 'Насосная станция №2',
                    date: '2025-01-15',
                    ph: 6.8,
                    turbidity: 5.2,
                    chlorine: 0.3,
                    hardness: 180,
                    bacteria: 15,
                    status: 'warning',
                    notes: 'Повышенная мутность'
                },
                {
                    id: '3',
                    location: 'Резервуар №1',
                    date: '2025-01-14',
                    ph: 7.5,
                    turbidity: 1.8,
                    chlorine: 1.2,
                    hardness: 120,
                    bacteria: 2,
                    status: 'good'
                }
            ];

            const mockTrends: QualityTrend[] = [
                { date: '2025-01-10', ph: 7.1, turbidity: 2.0, chlorine: 0.9, hardness: 145 },
                { date: '2025-01-11', ph: 7.3, turbidity: 1.8, chlorine: 0.8, hardness: 150 },
                { date: '2025-01-12', ph: 7.0, turbidity: 2.2, chlorine: 0.7, hardness: 155 },
                { date: '2025-01-13', ph: 6.9, turbidity: 2.5, chlorine: 0.6, hardness: 160 },
                { date: '2025-01-14', ph: 7.2, turbidity: 2.1, chlorine: 0.8, hardness: 150 },
                { date: '2025-01-15', ph: 7.1, turbidity: 2.3, chlorine: 0.7, hardness: 155 }
            ];

            setSamples(mockSamples);
            setTrends(mockTrends);
        } catch (error) {
            console.error('Failed to fetch water quality data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'good': return 'bg-green-100 text-green-800';
            case 'warning': return 'bg-yellow-100 text-yellow-800';
            case 'critical': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'good': return 'Хорошее';
            case 'warning': return 'Предупреждение';
            case 'critical': return 'Критическое';
            default: return status;
        }
    };

    const getParameterLabel = (parameter: string) => {
        switch (parameter) {
            case 'ph': return 'pH';
            case 'turbidity': return 'Мутность (NTU)';
            case 'chlorine': return 'Хлор (мг/л)';
            case 'hardness': return 'Жесткость (мг/л)';
            default: return parameter;
        }
    };

    const getParameterRange = (parameter: string) => {
        switch (parameter) {
            case 'ph': return { min: 6.5, max: 8.5, unit: '' };
            case 'turbidity': return { min: 0, max: 5, unit: ' NTU' };
            case 'chlorine': return { min: 0.2, max: 1.0, unit: ' мг/л' };
            case 'hardness': return { min: 100, max: 200, unit: ' мг/л' };
            default: return { min: 0, max: 100, unit: '' };
        }
    };

    const getParameterStatus = (parameter: string, value: number) => {
        const range = getParameterRange(parameter);
        if (value >= range.min && value <= range.max) return 'good';
        if (value < range.min * 0.8 || value > range.max * 1.2) return 'critical';
        return 'warning';
    };

    const getFilteredSamples = () => {
        if (selectedLocation === 'all') return samples;
        return samples.filter(sample => sample.location === selectedLocation);
    };

    const getLocations = () => {
        const locations = [...new Set(samples.map(s => s.location))];
        return locations;
    };

    const getGoodSamples = () => samples.filter(s => s.status === 'good');
    const getWarningSamples = () => samples.filter(s => s.status === 'warning');
    const getCriticalSamples = () => samples.filter(s => s.status === 'critical');

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Графики качества воды</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Графики качества воды</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getGoodSamples().length}
                                </div>
                                <div className="text-sm text-slate-600">Хорошее качество</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {getWarningSamples().length}
                                </div>
                                <div className="text-sm text-slate-600">Предупреждения</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getCriticalSamples().length}
                                </div>
                                <div className="text-sm text-slate-600">Критические</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {samples.length}
                                </div>
                                <div className="text-sm text-slate-600">Всего проб</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Фильтры */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Настройки графиков</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Локация
                        </label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Все локации</option>
                            {getLocations().map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Параметр
                        </label>
                        <select
                            value={selectedParameter}
                            onChange={(e) => setSelectedParameter(e.target.value as any)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="ph">pH</option>
                            <option value="turbidity">Мутность</option>
                            <option value="chlorine">Хлор</option>
                            <option value="hardness">Жесткость</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Период
                        </label>
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as any)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="week">Неделя</option>
                            <option value="month">Месяц</option>
                            <option value="quarter">Квартал</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* График тренда */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <TrendingUpIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Тренд {getParameterLabel(selectedParameter)}</h3>
                </div>
                
                <div className="h-64 bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">График {getParameterLabel(selectedParameter)}</p>
                            <p className="text-sm text-slate-400 mt-2">
                                Данные за {timeRange === 'week' ? 'неделю' : timeRange === 'month' ? 'месяц' : 'квартал'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm font-medium text-green-900">Норма</div>
                        <div className="text-xs text-green-700">
                            {getParameterRange(selectedParameter).min} - {getParameterRange(selectedParameter).max}{getParameterRange(selectedParameter).unit}
                        </div>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm font-medium text-yellow-900">Предупреждение</div>
                        <div className="text-xs text-yellow-700">
                            Выход за пределы нормы
                        </div>
                    </div>
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm font-medium text-red-900">Критично</div>
                        <div className="text-xs text-red-700">
                            Значительное отклонение
                        </div>
                    </div>
                </div>
            </Card>

            {/* Последние пробы */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <ChartBarIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Последние пробы качества воды</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Локация
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    pH
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Мутность
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Хлор
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Жесткость
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {getFilteredSamples().map((sample) => (
                                <tr key={sample.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {sample.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {new Date(sample.date).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${
                                            getParameterStatus('ph', sample.ph) === 'good' ? 'text-green-600' :
                                            getParameterStatus('ph', sample.ph) === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {sample.ph}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${
                                            getParameterStatus('turbidity', sample.turbidity) === 'good' ? 'text-green-600' :
                                            getParameterStatus('turbidity', sample.turbidity) === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {sample.turbidity} NTU
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${
                                            getParameterStatus('chlorine', sample.chlorine) === 'good' ? 'text-green-600' :
                                            getParameterStatus('chlorine', sample.chlorine) === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {sample.chlorine} мг/л
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${
                                            getParameterStatus('hardness', sample.hardness) === 'good' ? 'text-green-600' :
                                            getParameterStatus('hardness', sample.hardness) === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                            {sample.hardness} мг/л
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sample.status)}`}>
                                            {getStatusLabel(sample.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {getFilteredSamples().length === 0 && (
                    <div className="text-center py-12">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет данных о качестве воды</h3>
                        <p className="text-slate-500">Добавьте первые пробы для анализа</p>
                    </div>
                )}
            </Card>

            {/* Рекомендации */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <TrendingDownIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Рекомендации по улучшению качества</h3>
                </div>
                
                <div className="space-y-4">
                    {getWarningSamples().length > 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-yellow-900 mb-2">⚠️ Требуют внимания:</h4>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• Проверьте систему фильтрации на насосной станции №2</li>
                                <li>• Увеличьте дозировку хлора при необходимости</li>
                                <li>• Проведите дополнительный анализ мутности</li>
                            </ul>
                        </div>
                    )}
                    
                    {getCriticalSamples().length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">🚨 Критические проблемы:</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>• Немедленно остановите подачу воды при критических показателях</li>
                                <li>• Проведите экстренную очистку системы</li>
                                <li>• Уведомите руководство о проблеме</li>
                            </ul>
                        </div>
                    )}
                    
                    {getGoodSamples().length === samples.length && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">✅ Все показатели в норме:</h4>
                            <p className="text-sm text-green-700">
                                Качество воды соответствует всем стандартам. Продолжайте регулярный мониторинг.
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default WaterQualityGraphsPage; 