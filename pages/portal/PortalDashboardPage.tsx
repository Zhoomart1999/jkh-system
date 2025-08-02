
import React, { useState, useEffect, useContext } from 'react';
import { api } from "../../services/mock-api"
import { AbonentPortalData } from '../../types';
import { PortalAuthContext } from '../../context/PortalAuthContext';
import Card from '../../components/ui/Card';

const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const PortalDashboardPage: React.FC = () => {
    const auth = useContext(PortalAuthContext);
    const [data, setData] = useState<AbonentPortalData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth?.abonent) {
            api.getAbonentPortalData(auth.abonent.id)
                .then(setData)
                .finally(() => setLoading(false));
        }
    }, [auth?.abonent]);
    
    if(loading || !data){
        return <p>Загрузка данных...</p>
    }

    const { abonent, history } = data;
    const allHistory = [
        ...history.payments.map(p => ({ ...p, type: 'payment' })),
        ...history.accruals.map(a => ({ ...a, type: 'accrual' }))
    ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Добро пожаловать, {abonent.fullName}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <h2 className="text-lg font-semibold mb-2">Текущий баланс</h2>
                    <p className={`text-4xl font-bold ${abonent.balance < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {formatCurrency(abonent.balance)} сом
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{abonent.balance < 0 ? 'Ваша задолженность' : 'На вашем счету'}</p>
                    <button className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700">Оплатить онлайн (симуляция)</button>
                </Card>
                 <Card className="md:col-span-2">
                    <h2 className="text-lg font-semibold mb-2">Последние операции</h2>
                     <ul className="space-y-2">
                         {allHistory.map(item => (
                             <li key={item.id} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-50">
                                 <div>
                                    <p>{item.type === 'payment' ? 'Оплата' : 'Начисление'}</p>
                                    <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
                                 </div>
                                 <p className={`font-semibold ${item.type === 'payment' ? 'text-emerald-600' : 'text-red-600'}`}>
                                     {item.type === 'payment' ? '+' : '-'}{formatCurrency(item.amount)}
                                 </p>
                             </li>
                         ))}
                     </ul>
                </Card>
            </div>
        </div>
    );
};

export default PortalDashboardPage;