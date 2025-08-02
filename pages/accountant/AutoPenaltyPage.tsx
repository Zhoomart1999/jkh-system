import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import { Abonent, PaymentMethod } from '../../types';
import Card from '../../components/ui/Card';
import { CalculatorIcon, ExclamationTriangleIcon, CheckIcon, ClockIcon } from '../../components/ui/Icons';

interface PenaltyCalculation {
    abonentId: string;
    abonentName: string;
    address: string;
    currentDebt: number;
    daysOverdue: number;
    penaltyAmount: number;
    totalWithPenalty: number;
    lastPaymentDate: string;
}

const AutoPenaltyPage: React.FC = () => {
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [calculations, setCalculations] = useState<PenaltyCalculation[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [penaltyRate, setPenaltyRate] = useState(0.5); // 0.5% в день
    const [minDebtForPenalty, setMinDebtForPenalty] = useState(100); // Минимальный долг для начисления пени
    const [gracePeriod, setGracePeriod] = useState(10); // Льготный период в днях

    useEffect(() => {
        fetchAbonents();
    }, []);

    const fetchAbonents = async () => {
        try {
            const data = await api.getAbonents();
            setAbonents(data);
        } catch (error) {
            console.error('Failed to fetch abonents:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculatePenalties = () => {
        const today = new Date();
        const calculations: PenaltyCalculation[] = [];

        abonents.forEach(abonent => {
            if (abonent.balance >= minDebtForPenalty) {
                // Имитация данных о последнем платеже
                const lastPaymentDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
                const daysOverdue = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));
                
                if (daysOverdue > gracePeriod) {
                    const penaltyAmount = (abonent.balance * penaltyRate * (daysOverdue - gracePeriod)) / 100;
                    const totalWithPenalty = abonent.balance + penaltyAmount;

                    calculations.push({
                        abonentId: abonent.id,
                        abonentName: abonent.fullName,
                        address: abonent.address,
                        currentDebt: abonent.balance,
                        daysOverdue,
                        penaltyAmount: Math.round(penaltyAmount * 100) / 100,
                        totalWithPenalty: Math.round(totalWithPenalty * 100) / 100,
                        lastPaymentDate: lastPaymentDate.toLocaleDateString('ru-RU')
                    });
                }
            }
        });

        setCalculations(calculations);
    };

    const applyPenalties = async () => {
        if (!confirm(`Применить пени к ${calculations.length} абонентам?`)) return;
        
        setProcessing(true);
        try {
            // Имитация применения пеней
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Здесь был бы реальный API вызов
            alert(`Пени успешно применены к ${calculations.length} абонентам`);
            setCalculations([]);
        } catch (error) {
            alert('Ошибка при применении пеней');
        } finally {
            setProcessing(false);
        }
    };

    const sendNotifications = async () => {
        if (!confirm(`Отправить уведомления о пени ${calculations.length} абонентам?`)) return;
        
        setProcessing(true);
        try {
            // Имитация отправки уведомлений
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`Уведомления отправлены ${calculations.length} абонентам`);
        } catch (error) {
            alert('Ошибка при отправке уведомлений');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Автоматическое начисление пеней</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Автоматическое начисление пеней</h1>

            {/* Настройки */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CalculatorIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Настройки начисления пеней</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Ставка пени (% в день)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={penaltyRate}
                            onChange={(e) => setPenaltyRate(Number(e.target.value))}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Минимальный долг для пени (сом)
                        </label>
                        <input
                            type="number"
                            value={minDebtForPenalty}
                            onChange={(e) => setMinDebtForPenalty(Number(e.target.value))}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Льготный период (дней)
                        </label>
                        <input
                            type="number"
                            value={gracePeriod}
                            onChange={(e) => setGracePeriod(Number(e.target.value))}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="mt-4 flex gap-3">
                    <button
                        onClick={calculatePenalties}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <CalculatorIcon className="w-4 h-4" />
                        Рассчитать пени
                    </button>
                </div>
            </Card>

            {/* Результаты расчета */}
            {calculations.length > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                            <h3 className="text-lg font-semibold">
                                Абоненты для начисления пеней ({calculations.length})
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={sendNotifications}
                                disabled={processing}
                                className="bg-yellow-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-yellow-300"
                            >
                                Отправить уведомления
                            </button>
                            <button
                                onClick={applyPenalties}
                                disabled={processing}
                                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 flex items-center gap-2"
                            >
                                <CheckIcon className="w-4 h-4" />
                                {processing ? 'Применение...' : 'Применить пени'}
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Абонент
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Адрес
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Долг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Дней просрочки
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Сумма пени
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Итого к оплате
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Последний платеж
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {calculations.map((calc, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {calc.abonentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {calc.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {calc.currentDebt.toLocaleString('ru-RU')} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                calc.daysOverdue > 30 ? 'bg-red-100 text-red-800' :
                                                calc.daysOverdue > 15 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {calc.daysOverdue} дн.
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                            {calc.penaltyAmount.toLocaleString('ru-RU')} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            {calc.totalWithPenalty.toLocaleString('ru-RU')} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {calc.lastPaymentDate}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">Итоги расчета</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-blue-700">Общая сумма долгов:</span>
                                <span className="font-medium ml-2">
                                    {calculations.reduce((sum, calc) => sum + calc.currentDebt, 0).toLocaleString('ru-RU')} сом
                                </span>
                            </div>
                            <div>
                                <span className="text-blue-700">Общая сумма пеней:</span>
                                <span className="font-medium ml-2 text-red-600">
                                    {calculations.reduce((sum, calc) => sum + calc.penaltyAmount, 0).toLocaleString('ru-RU')} сом
                                </span>
                            </div>
                            <div>
                                <span className="text-blue-700">Итого к взысканию:</span>
                                <span className="font-medium ml-2">
                                    {calculations.reduce((sum, calc) => sum + calc.totalWithPenalty, 0).toLocaleString('ru-RU')} сом
                                </span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {calculations.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <CalculatorIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет абонентов для начисления пеней</h3>
                        <p className="text-slate-500">Нажмите "Рассчитать пени" для анализа задолженностей</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AutoPenaltyPage; 