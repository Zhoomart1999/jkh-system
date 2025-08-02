import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import Card from '../../components/ui/Card';
import { FileTextIcon, DownloadIcon, CalculatorIcon, CalendarIcon, ClockIcon, CheckIcon } from '../../components/ui/Icons';

interface TaxReport {
    id: string;
    type: 'income' | 'expense' | 'vat' | 'property';
    period: string;
    status: 'draft' | 'ready' | 'submitted';
    createdAt: string;
    submittedAt?: string;
    totalAmount: number;
    downloadUrl?: string;
}

const TaxReportsPage: React.FC = () => {
    const [reports, setReports] = useState<TaxReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));
    const [selectedType, setSelectedType] = useState<'income' | 'expense' | 'vat' | 'property'>('income');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            // Имитация загрузки отчетов
            const mockReports: TaxReport[] = [
                {
                    id: '1',
                    type: 'income',
                    period: '2025-01',
                    status: 'submitted',
                    createdAt: '2025-01-15',
                    submittedAt: '2025-01-20',
                    totalAmount: 1250000,
                    downloadUrl: '#'
                },
                {
                    id: '2',
                    type: 'vat',
                    period: '2025-01',
                    status: 'ready',
                    createdAt: '2025-01-25',
                    totalAmount: 150000,
                    downloadUrl: '#'
                },
                {
                    id: '3',
                    type: 'expense',
                    period: '2024-12',
                    status: 'submitted',
                    createdAt: '2024-12-15',
                    submittedAt: '2024-12-20',
                    totalAmount: 850000,
                    downloadUrl: '#'
                }
            ];
            setReports(mockReports);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setGenerating(true);
        try {
            // Имитация генерации отчета
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const newReport: TaxReport = {
                id: Date.now().toString(),
                type: selectedType,
                period: selectedPeriod,
                status: 'ready',
                createdAt: new Date().toISOString().split('T')[0],
                totalAmount: Math.floor(Math.random() * 1000000) + 100000
            };
            
            setReports([newReport, ...reports]);
            alert('Отчет успешно сгенерирован!');
        } catch (error) {
            alert('Ошибка при генерации отчета');
        } finally {
            setGenerating(false);
        }
    };

    const submitReport = async (reportId: string) => {
        try {
            // Имитация отправки отчета
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setReports(reports.map(report => 
                report.id === reportId 
                    ? { ...report, status: 'submitted', submittedAt: new Date().toISOString().split('T')[0] }
                    : report
            ));
            
            alert('Отчет успешно отправлен в налоговую!');
        } catch (error) {
            alert('Ошибка при отправке отчета');
        }
    };

    const downloadReport = async (reportId: string) => {
        try {
            // Имитация скачивания
            await new Promise(resolve => setTimeout(resolve, 500));
            alert('Отчет скачивается...');
        } catch (error) {
            alert('Ошибка при скачивании отчета');
        }
    };

    const getReportTypeLabel = (type: string) => {
        switch (type) {
            case 'income': return 'Доходы';
            case 'expense': return 'Расходы';
            case 'vat': return 'НДС';
            case 'property': return 'Имущество';
            default: return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Черновик';
            case 'ready': return 'Готов';
            case 'submitted': return 'Отправлен';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Налоговые отчеты</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка отчетов...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Налоговые отчеты</h1>

            {/* Генерация нового отчета */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CalculatorIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Генерация налогового отчета</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Тип отчета
                        </label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as any)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="income">Отчет о доходах</option>
                            <option value="expense">Отчет о расходах</option>
                            <option value="vat">Отчет по НДС</option>
                            <option value="property">Отчет об имуществе</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Период
                        </label>
                        <input
                            type="month"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={generateReport}
                            disabled={generating}
                            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2"
                        >
                            <CalculatorIcon className="w-4 h-4" />
                            {generating ? 'Генерация...' : 'Создать отчет'}
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Информация о налоговых отчетах:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p>• <strong>Отчет о доходах</strong> - ежемесячный отчет о полученных платежах</p>
                        <p>• <strong>Отчет о расходах</strong> - ежемесячный отчет о произведенных расходах</p>
                        <p>• <strong>Отчет по НДС</strong> - квартальный отчет по налогу на добавленную стоимость</p>
                        <p>• <strong>Отчет об имуществе</strong> - годовой отчет о движимом и недвижимом имуществе</p>
                    </div>
                </div>
            </Card>

            {/* Список отчетов */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <FileTextIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Список отчетов</h3>
                </div>
                
                {reports.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Тип отчета
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Период
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Сумма
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Дата создания
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {getReportTypeLabel(report.type)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {new Date(report.period + '-01').toLocaleDateString('ru-RU', { 
                                                year: 'numeric', 
                                                month: 'long' 
                                            })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {report.totalAmount.toLocaleString('ru-RU')} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                                                {getStatusLabel(report.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {new Date(report.createdAt).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => downloadReport(report.id)}
                                                    className="bg-slate-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-slate-700 transition-colors flex items-center gap-1"
                                                >
                                                    <DownloadIcon className="w-3 h-3" />
                                                    Скачать
                                                </button>
                                                {report.status === 'ready' && (
                                                    <button
                                                        onClick={() => submitReport(report.id)}
                                                        className="bg-green-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <CheckIcon className="w-3 h-3" />
                                                        Отправить
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileTextIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет созданных отчетов</h3>
                        <p className="text-slate-500">Создайте первый налоговый отчет</p>
                    </div>
                )}
            </Card>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <FileTextIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {reports.length}
                                </div>
                                <div className="text-sm text-slate-600">Всего отчетов</div>
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
                                    {reports.filter(r => r.status === 'submitted').length}
                                </div>
                                <div className="text-sm text-slate-600">Отправлено</div>
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
                                    {reports.filter(r => r.status === 'ready').length}
                                </div>
                                <div className="text-sm text-slate-600">Готово к отправке</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CalculatorIcon className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {reports.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString('ru-RU')}
                                </div>
                                <div className="text-sm text-slate-600">Общая сумма</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TaxReportsPage; 