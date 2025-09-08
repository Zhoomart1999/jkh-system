import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api"
import { Abonent, DebtRestructuring } from '../../types';
import Card from '../../components/ui/Card';
import { CalculatorIcon, CalendarIcon, DollarSignIcon, CheckIcon, ClockIcon, ExclamationTriangleIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface RestructuringPlan {
    id: string;
    abonentId: string;
    abonentName: string;
    address: string;
    originalDebt: number;
    restructuredAmount: number;
    monthlyPayment: number;
    totalPayments: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'defaulted';
    payments: { date: string; amount: number; status: 'paid' | 'missed' }[];
}

const DebtRestructuringPage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [plans, setPlans] = useState<RestructuringPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAbonent, setSelectedAbonent] = useState<Abonent | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Форма создания плана
    const [formData, setFormData] = useState({
        monthlyPayment: 0,
        months: 12,
        discount: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [abonentsData, plansData] = await Promise.all([
                api.getAbonents(),
                api.getDebtRestructuringPlans()
            ]);
            setAbonents(abonentsData);
            setPlans(plansData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createRestructuringPlan = async () => {
        if (!selectedAbonent || formData.monthlyPayment <= 0) return;

        setProcessing(true);
        try {
            const originalDebt = selectedAbonent.balance;
            const discountAmount = (originalDebt * formData.discount) / 100;
            const restructuredAmount = originalDebt - discountAmount;
            const totalPayments = formData.monthlyPayment * formData.months;
            
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date(Date.now() + formData.months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const newPlan: RestructuringPlan = {
                id: Date.now().toString(),
                abonentId: selectedAbonent.id,
                abonentName: selectedAbonent.fullName,
                address: selectedAbonent.address,
                originalDebt,
                restructuredAmount,
                monthlyPayment: formData.monthlyPayment,
                totalPayments,
                startDate,
                endDate,
                status: 'active',
                payments: []
            };

            // Имитация API вызова
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setPlans([...plans, newPlan]);
            setShowCreateForm(false);
            setSelectedAbonent(null);
            setFormData({ monthlyPayment: 0, months: 12, discount: 0 });
            
            showNotification({
                type: 'success',
                title: 'План создан',
                message: 'План реструктуризации создан успешно!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка создания',
                message: 'Ошибка при создании плана'
            });
        } finally {
            setProcessing(false);
        }
    };

    const recordPayment = async (planId: string, amount: number) => {
        setProcessing(true);
        try {
            const plan = plans.find(p => p.id === planId);
            if (!plan) return;

            const payment = {
                date: new Date().toISOString().split('T')[0],
                amount,
                status: 'paid' as const
            };

            const updatedPlan = {
                ...plan,
                payments: [...plan.payments, payment]
            };

            setPlans(plans.map(p => p.id === planId ? updatedPlan : p));
            showNotification({
                type: 'success',
                title: 'Платеж зарегистрирован',
                message: 'Платеж зарегистрирован!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка регистрации',
                message: 'Ошибка при регистрации платежа'
            });
        } finally {
            setProcessing(false);
        }
    };

    const getDebtors = () => abonents.filter(a => a.balance > 1000);
    const getActivePlans = () => plans.filter(p => p.status === 'active');
    const getCompletedPlans = () => plans.filter(p => p.status === 'completed');

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Реструктуризация долгов</h1>
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Реструктуризация долгов</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getDebtors().length}
                                </div>
                                <div className="text-sm text-slate-600">Крупные должники</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CalculatorIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {getActivePlans().length}
                                </div>
                                <div className="text-sm text-slate-600">Активные планы</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getCompletedPlans().length}
                                </div>
                                <div className="text-sm text-slate-600">Завершенные планы</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <DollarSignIcon className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {plans.reduce((sum, p) => sum + p.restructuredAmount, 0).toLocaleString('ru-RU')}
                                </div>
                                <div className="text-sm text-slate-600">Сумма реструктуризации</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Создание нового плана */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <CalculatorIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Создать план реструктуризации</h3>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showCreateForm ? 'Отмена' : 'Новый план'}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Выберите абонента
                                </label>
                                <select
                                    value={selectedAbonent?.id || ''}
                                    onChange={(e) => {
                                        const abonent = abonents.find(a => a.id === e.target.value);
                                        setSelectedAbonent(abonent || null);
                                    }}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите абонента...</option>
                                    {getDebtors().map(abonent => (
                                        <option key={abonent.id} value={abonent.id}>
                                            {abonent.fullName} - {abonent.balance.toLocaleString('ru-RU')} сом
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedAbonent && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-sm">
                                        <strong>Текущий долг:</strong> {selectedAbonent.balance.toLocaleString('ru-RU')} сом
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedAbonent && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Ежемесячный платеж (сом)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.monthlyPayment}
                                        onChange={(e) => setFormData({...formData, monthlyPayment: Number(e.target.value)})}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Срок (месяцев)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.months}
                                        onChange={(e) => setFormData({...formData, months: Number(e.target.value)})}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Скидка (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({...formData, discount: Number(e.target.value)})}
                                        className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {selectedAbonent && formData.monthlyPayment > 0 && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Предварительный расчет:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-green-700">Сумма после скидки:</span>
                                        <span className="font-medium ml-2">
                                            {(selectedAbonent.balance * (100 - formData.discount) / 100).toLocaleString('ru-RU')} сом
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-green-700">Общая сумма платежей:</span>
                                        <span className="font-medium ml-2">
                                            {(formData.monthlyPayment * formData.months).toLocaleString('ru-RU')} сом
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-green-700">Экономия для абонента:</span>
                                        <span className="font-medium ml-2 text-green-600">
                                            {(selectedAbonent.balance - (formData.monthlyPayment * formData.months)).toLocaleString('ru-RU')} сом
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={createRestructuringPlan}
                                    disabled={processing}
                                    className="mt-3 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                                >
                                    {processing ? 'Создание...' : 'Создать план'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Активные планы */}
            {getActivePlans().length > 0 && (
                <Card>
                    <div className="flex items-center gap-4 mb-4">
                        <CalendarIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Активные планы реструктуризации</h3>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Абонент
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Исходный долг
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Ежемесячный платеж
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Срок
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Прогресс
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {getActivePlans().map((plan) => {
                                    const paidAmount = plan.payments.reduce((sum, p) => sum + p.amount, 0);
                                    const progress = (paidAmount / plan.restructuredAmount) * 100;
                                    const remainingPayments = Math.ceil((plan.restructuredAmount - paidAmount) / plan.monthlyPayment);
                                    
                                    return (
                                        <tr key={plan.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                {plan.abonentName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {plan.originalDebt.toLocaleString('ru-RU')} сом
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {plan.monthlyPayment.toLocaleString('ru-RU')} сом
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                {new Date(plan.startDate).toLocaleDateString('ru-RU')} - {new Date(plan.endDate).toLocaleDateString('ru-RU')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 bg-slate-200 rounded-full h-2">
                                                        <div 
                                                            className="bg-blue-600 h-2 rounded-full" 
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {paidAmount.toLocaleString('ru-RU')} / {plan.restructuredAmount.toLocaleString('ru-RU')} сом
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => recordPayment(plan.id, plan.monthlyPayment)}
                                                    disabled={processing}
                                                    className="bg-green-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:bg-green-300"
                                                >
                                                    Записать платеж
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {getActivePlans().length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <CalculatorIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет активных планов реструктуризации</h3>
                        <p className="text-slate-500">Создайте план реструктуризации для крупных должников</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DebtRestructuringPage; 