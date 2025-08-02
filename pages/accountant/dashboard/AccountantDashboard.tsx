import React, { useState, useEffect, useContext } from 'react';
import { api } from "../../../services/mock-api"
import { AccountantDashboardData } from '../../../types';
import Card from '../../../components/ui/Card';
import { AuthContext } from '../../../context/AuthContext';
import OverviewTab from '../tabs/OverviewTab';

const AccountantDashboard: React.FC = () => {
    const [data, setData] = useState<AccountantDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashboardData = await api.getAccountantDashboardData();
                setData(dashboardData);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-64">Загрузка...</div>;
    if (!data) return <div className="text-red-500">Ошибка загрузки данных</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Обзор</h1>
                <div className="text-sm text-slate-500">
                    Добро пожаловать, {user?.name}
                </div>
            </div>
            <OverviewTab />
        </div>
    );
};

export default AccountantDashboard; 