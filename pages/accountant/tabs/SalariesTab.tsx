import React, { useState, useEffect } from 'react';
import { api } from "../../../src/firebase/real-api"
import { StaffSalary } from '../../../types';
import Card from '../../../components/ui/Card';
import { ConfirmationModal } from '../../../components/ui/Modal';
import { useNotifications } from '../../../context/NotificationContext';
import { Employee } from '../../../types';

const formatDate = (dateString: string | null | undefined) => dateString ? new Date(dateString).toLocaleDateString('ru-RU') : 'N/A';
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом`;

const SalariesTab: React.FC = () => {
    const { showNotification } = useNotifications();
    const [salaries, setSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [payingSalary, setPayingSalary] = useState<StaffSalary | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        const data = await api.getStaffSalaries();
        setSalaries(data);
        setLoading(false);
    }
    useEffect(() => { fetchData() }, []);
    
    const handlePayConfirm = async () => {
        if (!payingSalary) return;
        
        setIsConfirming(true);
        const date = new Date().toISOString().split('T')[0];
        try {
            await api.paySalary(payingSalary.id, date);
            fetchData();
        } catch (error) {
            console.error("Failed to pay salary", error);
            showNotification({
                type: 'error',
                title: 'Ошибка выплаты',
                message: 'Ошибка при выплате зарплаты.'
            });
        } finally {
            setIsConfirming(false);
            setPayingSalary(null);
        }
    }

    return (
        <Card>
            {payingSalary && (
                <ConfirmationModal
                    isOpen={!!payingSalary}
                    onClose={() => setPayingSalary(null)}
                    onConfirm={handlePayConfirm}
                    isConfirming={isConfirming}
                    title="Подтверждение выплаты"
                    message={`Выплатить зарплату ${payingSalary.name} (${formatCurrency(payingSalary.monthlySalary)}) за текущий месяц? Это действие также автоматически создаст запись о расходе.`}
                    confirmText="Выплатить"
                />
            )}
            <h2 className="text-xl font-semibold mb-4">Управление зарплатами</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                     <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Сотрудник</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Роль</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Оклад</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата последней выплаты</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-4">Загрузка...</td></tr>
                        ) : (
                            salaries.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4 text-sm font-medium text-slate-900">{s.name}</td>
                                    <td className="px-4 py-4 text-sm text-slate-500 capitalize">{s.role}</td>
                                    <td className="px-4 py-4 text-sm font-semibold">{formatCurrency(s.monthlySalary)}</td>
                                    <td className="px-4 py-4 text-sm">{formatDate(s.lastPaidDate)}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button
                                            onClick={() => setPayingSalary(s)}
                                            className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                                            disabled={isConfirming || (!!s.lastPaidDate && new Date(s.lastPaidDate).getMonth() === new Date().getMonth())}
                                            title={!!s.lastPaidDate && new Date(s.lastPaidDate).getMonth() === new Date().getMonth() ? "Зарплата за этот месяц уже выплачена" : "Выплатить зарплату"}
                                        >
                                            {isConfirming && payingSalary?.id === s.id ? 'Выплата...' : 'Выплатить'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default SalariesTab;