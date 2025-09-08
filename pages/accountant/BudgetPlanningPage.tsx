import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import Card from '../../components/ui/Card';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, ChartBarIcon, CalendarIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface BudgetItem {
    id: string;
    category: string;
    type: 'income' | 'expense';
    name: string;
    plannedAmount: number;
    actualAmount: number;
    month: string;
    year: number;
    status: 'on_track' | 'over_budget' | 'under_budget';
    notes?: string;
}

interface BudgetPlan {
    id: string;
    name: string;
    period: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    status: 'draft' | 'approved' | 'active' | 'completed';
    createdAt: string;
    approvedAt?: string;
}

const BudgetPlanningPage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreatePlan, setShowCreatePlan] = useState(false);
    const [showAddItem, setShowAddItem] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    // Форма создания плана
    const [planForm, setPlanForm] = useState({
        name: '',
        period: '',
        notes: ''
    });

    // Форма добавления статьи
    const [itemForm, setItemForm] = useState({
        category: '',
        type: 'expense' as 'income' | 'expense',
        name: '',
        plannedAmount: 0,
        month: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Имитация загрузки данных
            const mockItems: BudgetItem[] = [
                {
                    id: '1',
                    category: 'Доходы от абонентов',
                    type: 'income',
                    name: 'Платежи за воду',
                    plannedAmount: 500000,
                    actualAmount: 480000,
                    month: '2025-01',
                    year: 2025,
                    status: 'under_budget',
                    notes: 'Снижение платежей из-за отключений'
                },
                {
                    id: '2',
                    category: 'Эксплуатационные расходы',
                    type: 'expense',
                    name: 'Электроэнергия',
                    plannedAmount: 80000,
                    actualAmount: 85000,
                    month: '2025-01',
                    year: 2025,
                    status: 'over_budget',
                    notes: 'Повышение тарифов'
                },
                {
                    id: '3',
                    category: 'Заработная плата',
                    type: 'expense',
                    name: 'Оклад персонала',
                    plannedAmount: 200000,
                    actualAmount: 200000,
                    month: '2025-01',
                    year: 2025,
                    status: 'on_track'
                }
            ];

            const mockPlans: BudgetPlan[] = [
                {
                    id: '1',
                    name: 'Бюджет на январь 2025',
                    period: '2025-01',
                    totalIncome: 500000,
                    totalExpenses: 350000,
                    balance: 150000,
                    status: 'active',
                    createdAt: '2024-12-15',
                    approvedAt: '2024-12-20'
                },
                {
                    id: '2',
                    name: 'Бюджет на февраль 2025',
                    period: '2025-02',
                    totalIncome: 520000,
                    totalExpenses: 360000,
                    balance: 160000,
                    status: 'draft',
                    createdAt: '2025-01-10'
                }
            ];

            setBudgetItems(mockItems);
            setBudgetPlans(mockPlans);
        } catch (error) {
            console.error('Failed to fetch budget data:', error);
        } finally {
            setLoading(false);
        }
    };

    const createBudgetPlan = async () => {
        if (!planForm.name || !planForm.period) return;

        setProcessing(true);
        try {
            const newPlan: BudgetPlan = {
                id: Date.now().toString(),
                name: planForm.name,
                period: planForm.period,
                totalIncome: 0,
                totalExpenses: 0,
                balance: 0,
                status: 'draft',
                createdAt: new Date().toISOString().split('T')[0]
            };

            setBudgetPlans([...budgetPlans, newPlan]);
            setShowCreatePlan(false);
            setPlanForm({
                name: '',
                period: '',
                notes: ''
            });
            
            showNotification({
                type: 'success',
                title: 'План создан',
                message: 'Бюджетный план создан!'
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

    const addBudgetItem = async () => {
        if (!itemForm.name || itemForm.plannedAmount <= 0 || !selectedPlan) return;

        setProcessing(true);
        try {
            const newItem: BudgetItem = {
                id: Date.now().toString(),
                category: itemForm.category,
                type: itemForm.type,
                name: itemForm.name,
                plannedAmount: itemForm.plannedAmount,
                actualAmount: 0,
                month: itemForm.month,
                year: parseInt(itemForm.month.split('-')[0]),
                status: 'on_track',
                notes: itemForm.notes
            };

            setBudgetItems([...budgetItems, newItem]);
            setShowAddItem(false);
            setItemForm({
                category: '',
                type: 'expense',
                name: '',
                plannedAmount: 0,
                month: '',
                notes: ''
            });
            
            showNotification({
                type: 'success',
                title: 'Статья добавлена',
                message: 'Статья бюджета добавлена!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка добавления',
                message: 'Ошибка при добавлении статьи'
            });
        } finally {
            setProcessing(false);
        }
    };

    const updatePlanStatus = async (planId: string, status: BudgetPlan['status']) => {
        setProcessing(true);
        try {
            setBudgetPlans(plans => 
                plans.map(plan => 
                    plan.id === planId 
                        ? { 
                            ...plan, 
                            status,
                            approvedAt: status === 'approved' ? new Date().toISOString().split('T')[0] : plan.approvedAt
                        }
                        : plan
                )
            );
            showNotification({
                type: 'success',
                title: 'Статус обновлен',
                message: 'Статус плана обновлен!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка обновления',
                message: 'Ошибка при обновлении статуса'
            });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-slate-100 text-slate-800';
            case 'approved': return 'bg-blue-100 text-blue-800';
            case 'active': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Черновик';
            case 'approved': return 'Одобрен';
            case 'active': return 'Активен';
            case 'completed': return 'Завершен';
            default: return status;
        }
    };

    const getItemStatusColor = (status: string) => {
        switch (status) {
            case 'on_track': return 'bg-green-100 text-green-800';
            case 'over_budget': return 'bg-red-100 text-red-800';
            case 'under_budget': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getItemStatusLabel = (status: string) => {
        switch (status) {
            case 'on_track': return 'В норме';
            case 'over_budget': return 'Превышен';
            case 'under_budget': return 'Недостаточно';
            default: return status;
        }
    };

    const getIncomeItems = () => budgetItems.filter(item => item.type === 'income');
    const getExpenseItems = () => budgetItems.filter(item => item.type === 'expense');
    const getTotalIncome = () => getIncomeItems().reduce((sum, item) => sum + item.plannedAmount, 0);
    const getTotalExpenses = () => getExpenseItems().reduce((sum, item) => sum + item.plannedAmount, 0);
    const getBalance = () => getTotalIncome() - getTotalExpenses();

    const getDraftPlans = () => budgetPlans.filter(plan => plan.status === 'draft');
    const getActivePlans = () => budgetPlans.filter(plan => plan.status === 'active');

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Бюджетное планирование</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <CalendarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Бюджетное планирование</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getTotalIncome().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Планируемые доходы</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getTotalExpenses().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Планируемые расходы</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ChartBarIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className={`text-2xl font-bold ${getBalance() >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                    {getBalance().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Баланс</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-purple-500" />
                            <div>
                                <div className="text-2xl font-bold text-purple-600">
                                    {getActivePlans().length}
                                </div>
                                <div className="text-sm text-slate-600">Активные планы</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Создание плана */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Создание бюджетного плана</h3>
                    </div>
                    <button
                        onClick={() => setShowCreatePlan(!showCreatePlan)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showCreatePlan ? 'Отмена' : 'Новый план'}
                    </button>
                </div>

                {showCreatePlan && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Название плана
                                </label>
                                <input
                                    type="text"
                                    value={planForm.name}
                                    onChange={(e) => setPlanForm({...planForm, name: e.target.value})}
                                    placeholder="Бюджет на январь 2025"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Период (YYYY-MM)
                                </label>
                                <input
                                    type="text"
                                    value={planForm.period}
                                    onChange={(e) => setPlanForm({...planForm, period: e.target.value})}
                                    placeholder="2025-01"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Примечания
                            </label>
                            <textarea
                                value={planForm.notes}
                                onChange={(e) => setPlanForm({...planForm, notes: e.target.value})}
                                rows={3}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={createBudgetPlan}
                            disabled={processing || !planForm.name || !planForm.period}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {processing ? 'Создание...' : 'Создать план'}
                        </button>
                    </div>
                )}
            </Card>

            {/* Бюджетные планы */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Бюджетные планы</h3>
                    </div>
                    <button
                        onClick={() => setShowAddItem(!showAddItem)}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {showAddItem ? 'Отмена' : 'Добавить статью'}
                    </button>
                </div>

                {showAddItem && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    План
                                </label>
                                <select
                                    value={selectedPlan}
                                    onChange={(e) => setSelectedPlan(e.target.value)}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите план...</option>
                                    {getDraftPlans().map(plan => (
                                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Тип
                                </label>
                                <select
                                    value={itemForm.type}
                                    onChange={(e) => setItemForm({...itemForm, type: e.target.value as 'income' | 'expense'})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="income">Доход</option>
                                    <option value="expense">Расход</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Категория
                                </label>
                                <input
                                    type="text"
                                    value={itemForm.category}
                                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                                    placeholder="Доходы от абонентов"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Название статьи
                                </label>
                                <input
                                    type="text"
                                    value={itemForm.name}
                                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                                    placeholder="Платежи за воду"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Планируемая сумма (сом)
                                </label>
                                <input
                                    type="number"
                                    value={itemForm.plannedAmount}
                                    onChange={(e) => setItemForm({...itemForm, plannedAmount: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Месяц (YYYY-MM)
                                </label>
                                <input
                                    type="text"
                                    value={itemForm.month}
                                    onChange={(e) => setItemForm({...itemForm, month: e.target.value})}
                                    placeholder="2025-01"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Примечания
                            </label>
                            <textarea
                                value={itemForm.notes}
                                onChange={(e) => setItemForm({...itemForm, notes: e.target.value})}
                                rows={2}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={addBudgetItem}
                            disabled={processing || !itemForm.name || itemForm.plannedAmount <= 0 || !selectedPlan}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {processing ? 'Добавление...' : 'Добавить статью'}
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    План
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Период
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Доходы
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Расходы
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Баланс
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {budgetPlans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {plan.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {plan.period}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        {plan.totalIncome.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                        {plan.totalExpenses.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`font-medium ${plan.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {plan.balance.toLocaleString()} сом
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                                            {getStatusLabel(plan.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            {plan.status === 'draft' && (
                                                <button
                                                    onClick={() => updatePlanStatus(plan.id, 'approved')}
                                                    disabled={processing}
                                                    className="bg-green-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:bg-green-300"
                                                >
                                                    Одобрить
                                                </button>
                                            )}
                                            {plan.status === 'approved' && (
                                                <button
                                                    onClick={() => updatePlanStatus(plan.id, 'active')}
                                                    disabled={processing}
                                                    className="bg-blue-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                                                >
                                                    Активировать
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {budgetPlans.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет бюджетных планов</h3>
                        <p className="text-slate-500">Создайте первый бюджетный план</p>
                    </div>
                )}
            </Card>

            {/* Статьи бюджета */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CalendarIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Статьи бюджета</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Категория
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Название
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Тип
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Планируемая сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Фактическая сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Месяц
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {budgetItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.category}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            item.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {item.type === 'income' ? 'Доход' : 'Расход'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.plannedAmount.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {item.actualAmount.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getItemStatusColor(item.status)}`}>
                                            {getItemStatusLabel(item.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {item.month}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {budgetItems.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет статей бюджета</h3>
                        <p className="text-slate-500">Добавьте первые статьи в бюджетный план</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default BudgetPlanningPage; 