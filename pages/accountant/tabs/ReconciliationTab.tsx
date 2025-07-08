import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from '../../../services/api';
import { BankStatementTransaction, Payment, ReconciliationStatus } from '../../../types';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');
const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU');

const ReconciliationTab: React.FC = () => {
    const [bankTxs, setBankTxs] = useState<BankStatementTransaction[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReconciling, setIsReconciling] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const [btData, pData] = await Promise.all([api.getBankTransactions(), api.getPayments()]);
        setBankTxs(btData);
        setPayments(pData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReconcile = async () => {
        setIsReconciling(true);
        await api.reconcilePayments();
        await fetchData(); // Refresh data
        setIsReconciling(false);
    };

    const StatusBadge: React.FC<{ status: ReconciliationStatus }> = ({ status }) => {
        const statusMap = {
            [ReconciliationStatus.Unmatched]: { text: 'Не сопоставлено', color: 'bg-red-100 text-red-800' },
            [ReconciliationStatus.Matched]: { text: 'Сопоставлено', color: 'bg-emerald-100 text-emerald-800' },
            [ReconciliationStatus.Manual]: { text: 'Сопоставлено вручную', color: 'bg-blue-100 text-blue-800' },
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status].color}`}>{statusMap[status].text}</span>;
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Сверка с банком</h2>
                <button onClick={handleReconcile} disabled={isReconciling || loading} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">
                    {isReconciling ? 'Выполнение...' : 'Запустить автоматическую сверку'}
                </button>
            </div>
            {loading ? <p>Загрузка данных...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Описание из выписки</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Сумма</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Статус</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {bankTxs.map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-4 py-4">{formatDate(tx.date)}</td>
                                    <td className="px-4 py-4 font-medium">{tx.description}</td>
                                    <td className="px-4 py-4 font-semibold text-emerald-600">{formatCurrency(tx.amount)} сом</td>
                                    <td className="px-4 py-4"><StatusBadge status={tx.status} /></td>
                                    <td className="px-4 py-4">
                                        {tx.status === ReconciliationStatus.Unmatched && (
                                            <button className="text-sm text-blue-600 hover:underline">Найти вручную</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default ReconciliationTab;