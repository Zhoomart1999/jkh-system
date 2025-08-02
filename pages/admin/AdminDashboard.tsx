
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { UsersIcon, DollarSignIcon, HistoryIcon, PieChartIcon } from '../../components/ui/Icons';
import { api } from "../../services/mock-api"
import { AuditLog, AdminDashboardData, AbonentStatus } from '../../types';

const PIE_COLORS = {
    [AbonentStatus.Active]: '#10b981',
    [AbonentStatus.Disconnected]: '#f59e0b',
    [AbonentStatus.Archived]: '#6b7280',
};

const AdminDashboard: React.FC = () => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsData = await api.getAdminDashboardData();
                setData(statsData);
            } catch (error) {
                console.error("Failed to fetch admin dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading || !data) {
        return <div className="text-center p-8">Загрузка данных...</div>;
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Панель администратора</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<UsersIcon />} title="Всего абонентов" value={data.totalAbonents} />
                <StatCard icon={<DollarSignIcon />} title="Общая задолженность" value={`${(data.totalDebt || 0).toLocaleString('ru-RU')} сом`} />
                <StatCard icon={<UsersIcon />} title="Пользователей системы" value={data.totalUsers} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                     <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChartIcon className="w-6 h-6 text-blue-500" /> Распределение абонентов</h2>
                    <div style={{ width: '100%', height: 250 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data.abonentStatusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {data.abonentStatusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as AbonentStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number, name: string) => [value, name]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                 <Card className="lg:col-span-1">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Топ контролеров</h2>
                     <ul className="space-y-3">
                        {data.topControllers.map((controller, index) => (
                             <li key={index} className="flex items-center">
                                <div className="text-lg font-bold text-slate-400 w-8">{index + 1}.</div>
                                <div>
                                    <p className="text-sm font-medium">{controller.name}</p>
                                    <p className="text-xs text-slate-500">{controller.count} абонентов</p>
                                </div>
                             </li>
                        ))}
                         {data.topControllers.length === 0 && <p className="text-sm text-slate-500">Нет данных</p>}
                    </ul>
                </Card>

                <Card className="lg:col-span-1">
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Последние действия</h2>
                    <ul className="space-y-3">
                        {data.recentLogs.map(log => (
                             <li key={log.id} className="flex items-start">
                                <div className="p-2 bg-slate-100 rounded-full mr-3 mt-1">
                                    <HistoryIcon className="w-4 h-4 text-slate-500" />
                                 </div>
                                <div>
                                    <p className="text-sm font-medium">{log.details}</p>
                                    <p className="text-xs text-slate-500">{log.userName} - {new Date(log.timestamp).toLocaleString('ru-RU')}</p>
                                </div>
                             </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;