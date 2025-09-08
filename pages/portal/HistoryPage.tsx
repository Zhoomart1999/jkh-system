
import React, { useState, useEffect, useContext } from 'react';
import Card from '../../components/ui/Card';
import { api } from "../../src/firebase/real-api"
import { Payment, Accrual } from '../../types';
import { PortalAuthContext } from '../../context/PortalAuthContext';

const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ru-RU');
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом`;

const HistoryPage: React.FC = () => {
    const auth = useContext(PortalAuthContext);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [accruals, setAccruals] = useState<Accrual[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth?.abonent) {
            setLoading(true);
            api.getAbonentHistory(auth.abonent.id)
                .then(data => {
                    setPayments(data.payments);
                    setAccruals(data.accruals);
                })
                .finally(() => setLoading(false));
        }
    }, [auth?.abonent]);
    
    return (
        <Card>
            <h1 className="text-xl font-bold mb-4">История операций</h1>
            {loading ? <p>Загрузка...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="font-semibold text-lg mb-2">Платежи</h2>
                        <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0"><tr><th className="p-2 text-left">Дата</th><th className="p-2 text-right">Сумма</th></tr></thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id} className="border-t">
                                            <td className="p-2">{formatDate(p.date)}</td>
                                            <td className="p-2 text-right font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-slate-500">Нет данных</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     <div>
                        <h2 className="font-semibold text-lg mb-2">Начисления</h2>
                        <div className="border rounded-lg max-h-[60vh] overflow-y-auto">
                           <table className="w-full text-sm">
                                <thead className="bg-slate-50 sticky top-0"><tr><th className="p-2 text-left">Дата</th><th className="p-2 text-right">Сумма</th></tr></thead>
                                <tbody>
                                    {accruals.map(a => (
                                        <tr key={a.id} className="border-t">
                                            <td className="p-2">{formatDate(a.date)}</td>
                                            <td className="p-2 text-right font-semibold text-red-600">-{formatCurrency(a.amount)}</td>
                                        </tr>
                                    ))}
                                    {accruals.length === 0 && <tr><td colSpan={2} className="p-4 text-center text-slate-500">Нет данных</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default HistoryPage;