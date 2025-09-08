import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import { DebtorsReportItem, UsedMaterialReportItem } from '../../types';

const ReportsPage: React.FC = () => {
    const [debtorsReport, setDebtorsReport] = useState<DebtorsReportItem[]>([]);
    const [materialsReport, setMaterialsReport] = useState<UsedMaterialReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'debtors' | 'materials'>('debtors');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [debtors, materials] = await Promise.all([
                api.getDebtorsReport(),
                api.getUsedMaterialsReport()
            ]);
            setDebtorsReport(debtors);
            setMaterialsReport(materials);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить отчеты');
        } finally {
            setLoading(false);
        }
    };

    const getTotalDebt = () => {
        return debtorsReport.reduce((sum, item) => sum + item.balance, 0);
    };

    const getTotalMaterialsCost = () => {
        return materialsReport.reduce((sum, item) => sum + item.cost, 0);
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка отчетов...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Отчеты</h1>

            {/* Табы */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('debtors')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'debtors'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Должники
                    </button>
                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'materials'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Использованные материалы
                    </button>
                </nav>
            </div>

            {/* Отчет по должникам */}
            {activeTab === 'debtors' && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Отчет по должникам</h2>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Общий долг</p>
                            <p className="text-2xl font-bold text-red-600">
                                {getTotalDebt().toFixed(2)} сом
                            </p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ФИО
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Адрес
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Телефон
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Долг
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {debtorsReport.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {item.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                                            {item.balance.toFixed(2)} сом
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Отчет по материалам */}
            {activeTab === 'materials' && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Отчет по использованным материалам</h2>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Общая стоимость</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {getTotalMaterialsCost().toFixed(2)} сом
                            </p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Материал
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Количество
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Единица
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Стоимость
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Дата
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {materialsReport.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.materialName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.unit}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.cost.toFixed(2)} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(item.date).toLocaleDateString('ru-RU')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ReportsPage;
