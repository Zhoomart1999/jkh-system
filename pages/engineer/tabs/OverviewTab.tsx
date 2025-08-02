
import React, { useState, useEffect, useContext } from 'react';
import Card from '../../../components/ui/Card';
import StatCard from '../../../components/ui/StatCard';
import { api } from "../../../services/mock-api"
import { UsersIcon, WrenchIcon, MapPinIcon, ActivityIcon } from '../../../components/ui/Icons';
import { AuthContext } from '../../../context/AuthContext';
import { Role, ControllerOverviewData, RequestTypeLabels } from '../../../types';

const OverviewTab: React.FC = () => {
    const auth = useContext(AuthContext);
    const [data, setData] = useState<ControllerOverviewData | null>(null);
    const [loading, setLoading] = useState(true);

    const isController = auth?.user?.role === Role.Controller;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let overviewData: ControllerOverviewData;
                if (isController && auth?.user?.id) {
                    overviewData = await api.getControllerOverviewData(auth.user.id);
                } else {
                    const stats = await api.getEngineerDashboardData();
                    overviewData = { stats, myAbonents: [], myRequests: [] };
                }
                setData(overviewData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isController, auth?.user?.id]);

    if (loading || !data) {
        return <Card><p>Загрузка статистики...</p></Card>;
    }
    
    const { stats } = data;

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={<UsersIcon className="w-6 h-6"/>} 
                    title="Всего абонентов" 
                    value={stats.totalAbonents} 
                />
                <StatCard 
                    icon={<UsersIcon className="w-6 h-6 text-emerald-500"/>} 
                    title="Активные абоненты" 
                    value={stats.activeAbonents} 
                />
                 <StatCard 
                    icon={<UsersIcon className="w-6 h-6 text-slate-500"/>} 
                    title="Отключенные абоненты" 
                    value={stats.disconnectedAbonents} 
                />
                <StatCard 
                    icon={<WrenchIcon className="w-6 h-6 text-amber-500"/>} 
                    title="Новые заявки" 
                    value={stats.pendingRequests} 
                />
            </div>

            {isController && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <Card>
                        <h2 className="text-lg font-semibold mb-2">Мои Абоненты</h2>
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                           {data.myAbonents.map(a => (
                               <li key={a.id} className="text-sm p-2 bg-slate-50 rounded-md">
                                   <p className="font-medium">{a.fullName}</p>
                                   <p className="text-xs text-slate-500">{a.address}</p>
                               </li>
                           ))}
                            {data.myAbonents.length === 0 && <p className="text-sm text-slate-500">Нет назначенных абонентов.</p>}
                        </ul>
                    </Card>
                     <Card>
                        <h2 className="text-lg font-semibold mb-2">Мои Заявки</h2>
                        <ul className="space-y-2 max-h-60 overflow-y-auto">
                           {data.myRequests.map(r => (
                               <li key={r.id} className="text-sm p-2 bg-slate-50 rounded-md">
                                   <p className="font-medium">{RequestTypeLabels[r.type]}</p>
                                   <p className="text-xs text-slate-500">Абонент: {r.abonentName}</p>
                               </li>
                           ))}
                           {data.myRequests.length === 0 && <p className="text-sm text-slate-500">Нет активных заявок.</p>}
                        </ul>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
