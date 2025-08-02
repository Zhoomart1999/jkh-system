import React, { useState, useEffect } from 'react';
import { api } from "../../../services/mock-api"
import { AccountantDashboardData, RecentTransaction } from '../../../types';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import { DollarSignIcon, TrendingUpIcon, UsersIcon } from '../../../components/ui/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU');

const OverviewTab: React.FC = () => {
    const [data, setData] = useState<AccountantDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await api.getAccountantDashboardData();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch accountant dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading || !data) {
        return <Card><p>Загрузка данных...</p></Card>;
    }

    const TransactionRow: React.FC<{ tx: RecentTransaction }> = ({ tx }) => {
        const isIncome = tx.type === 'income';
        return (
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
                <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('ru-RU')}</p>
                </div>
                <p className={`text-sm font-semibold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)} сом
                </p>
            </li>
        );
    };

    // Подготовка данных для графика
    const chartData = data.revenueVsExpense.map(item => ({
        ...item,
        revenue: Math.round(item.revenue),
        expense: Math.round(item.expense)
    }));

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<TrendingUpIcon />} title="Платежей сегодня" value={data.paymentsToday} />
                <StatCard icon={<DollarSignIcon />} title="Доход в этом месяце" value={`${formatCurrency(data.totalPaidThisMonth)} сом`} />
                <StatCard icon={<UsersIcon />} title="Общая задолженность" value={`${formatCurrency(data.totalDebt)} сом`} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3">
                    <h2 className="text-lg font-semibold mb-4">Доходы vs Расходы (6 мес.)</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip 
                                    formatter={(value: number) => [`${formatCurrency(value)} сом`, '']}
                                    labelFormatter={(label) => `Месяц: ${label}`}
                                />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" name="Доходы" />
                                <Bar dataKey="expense" fill="#ef4444" name="Расходы" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                     <h2 className="text-lg font-semibold mb-4">Последние транзакции</h2>
                     <ul className="space-y-1">
                        {data.recentTransactions.map(tx => <TransactionRow key={tx.id} tx={tx} />)}
                     </ul>
                </Card>
            </div>
        </div>
    );
};

export default OverviewTab;
