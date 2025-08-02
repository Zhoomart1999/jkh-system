import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import { ActionLog } from '../../types';
import Card from '../../components/ui/Card';
import { ClockIcon, DownloadIcon, FilterIcon } from '../../components/ui/Icons';

const ActionLogsPage: React.FC = () => {
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user: '',
        action: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.getAuditLogs();
                setLogs(data);
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const userMatch = !filters.user || log.userId.toLowerCase().includes(filters.user.toLowerCase());
        const actionMatch = !filters.action || log.action.toLowerCase().includes(filters.action.toLowerCase());
        const dateMatch = !filters.startDate || !filters.endDate || 
            (new Date(log.timestamp) >= new Date(filters.startDate) && 
             new Date(log.timestamp) <= new Date(filters.endDate));
        
        return userMatch && actionMatch && dateMatch;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU');
    };

    const handleExport = () => {
        // Заглушка для экспорта
        alert('Функция экспорта временно недоступна');
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Журнал действий</h1>
                    <button className="btn-secondary flex items-center gap-2" onClick={handleExport}>
                        <DownloadIcon className="w-4 h-4" />
                        Экспорт
                    </button>
                </div>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка журнала действий...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Журнал действий</h1>
                <button className="btn-secondary flex items-center gap-2" onClick={handleExport}>
                    <DownloadIcon className="w-4 h-4" />
                    Экспорт
                </button>
            </div>

            {/* Фильтры */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <FilterIcon className="w-5 h-5 text-slate-500" />
                    <h3 className="text-lg font-semibold">Фильтры</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Пользователь..."
                        value={filters.user}
                        onChange={(e) => setFilters({...filters, user: e.target.value})}
                        className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="text"
                        placeholder="Действие..."
                        value={filters.action}
                        onChange={(e) => setFilters({...filters, action: e.target.value})}
                        className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </Card>

            {/* Таблица логов */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Время
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Пользователь
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Действие
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Детали
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    IP адрес
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {formatDate(log.timestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {log.userId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-900">
                                            <div className="max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.ipAddress || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">Журнал действий пуст</h3>
                                        <p className="text-slate-500">Действия пользователей будут отображаться здесь</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ActionLogsPage; 