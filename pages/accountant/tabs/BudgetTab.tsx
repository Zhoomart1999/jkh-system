
import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Modal, { ConfirmationModal } from '../../../components/ui/Modal';
import { api } from '../../../services/api';
import { FinancialPlan, ExpenseCategory, ExpenseCategoryLabels } from '../../../types';
import { SaveIcon, EditIcon, TrashIcon } from '../../../components/ui/Icons';

const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
const formatCurrency = (amount: number) => amount.toLocaleString('ru-RU') + ' сом';

interface PlanFormProps {
    plan: FinancialPlan | null;
    onSave: () => void;
    onClose: () => void;
}

const FinancialPlanFormModal: React.FC<PlanFormProps> = ({ plan, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        revenueTarget: plan?.revenueTarget || 100000,
        startDate: plan?.startDate ? plan.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
        period: plan?.period || 'monthly',
    });
    const [ceilings, setCeilings] = useState<{[key:string]: number}>(plan?.expenseCeilings || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleCeilingChange = (category: ExpenseCategory, value: string) => {
        setCeilings(prev => ({ ...prev, [category]: Number(value) || 0 }));
    };
    
    const calculateEndDate = (start: string, period: 'monthly' | 'quarterly'): string => {
        const startDate = new Date(start);
        if (period === 'monthly') {
            return new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).toISOString().split('T')[0];
        } else { // quarterly
            return new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0).toISOString().split('T')[0];
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const planData = {
            ...formData,
            period: formData.period as 'monthly' | 'quarterly',
            endDate: calculateEndDate(formData.startDate, formData.period as 'monthly' | 'quarterly'),
            expenseCeilings: ceilings,
        };

        try {
            if (plan) {
                await api.updateFinancialPlan({ ...plan, ...planData });
            } else {
                await api.addFinancialPlan(planData);
            }
            onSave();
        } catch(error) {
            console.error("Failed to save plan", error);
            alert("Ошибка при сохранении плана");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal title={plan ? "Редактировать план" : "Создать финансовый план"} isOpen={true} onClose={onClose} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Период</label>
                        <select value={formData.period} onChange={e => setFormData({...formData, period: e.target.value as 'monthly' | 'quarterly'})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="monthly">Месяц</option>
                            <option value="quarterly">Квартал</option>
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium">Дата начала</label>
                        <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Цель по доходам (сом)</label>
                    <input type="number" step="1000" value={formData.revenueTarget} onChange={e => setFormData({...formData, revenueTarget: Number(e.target.value)})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2">Лимиты расходов по категориям (сом)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        {Object.entries(ExpenseCategoryLabels).map(([key, label]) => (
                            <div key={key}>
                                <label className="text-xs">{label}</label>
                                <input 
                                    type="number" 
                                    step="100"
                                    placeholder="0"
                                    value={ceilings[key] || ''} 
                                    onChange={(e) => handleCeilingChange(key as ExpenseCategory, e.target.value)} 
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-1 text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"><SaveIcon className="w-5 h-5"/>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </form>
        </Modal>
    );
};

const BudgetTab: React.FC = () => {
    const [plans, setPlans] = useState<FinancialPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<FinancialPlan | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getFinancialPlans();
            setPlans(data);
        } catch (error) {
            console.error("Failed to fetch financial plans:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = () => {
        fetchData();
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleDeleteConfirm = async () => {
        if (deletingId) {
            await api.deleteFinancialPlan(deletingId);
            setDeletingId(null);
            fetchData();
        }
    };

    return (
        <Card>
            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот финансовый план?"
                confirmText="Удалить"
            />
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Финансовые планы (Бюджет)</h2>
                    <p className="text-sm text-slate-500">Создавайте и отслеживайте выполнение финансовых планов.</p>
                </div>
                <button onClick={() => { setEditingPlan(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">Создать план</button>
            </div>

            {loading ? <p>Загрузка планов...</p> : (
                <div className="space-y-4">
                    {plans.map(plan => (
                        <div key={plan.id} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-blue-700">План на {formatDate(plan.startDate)}</h3>
                                <div className="flex items-center gap-2">
                                     <span className={`px-2 py-1 text-xs font-bold rounded-full ${plan.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                        {plan.status === 'active' ? 'Активен' : 'Завершен'}
                                    </span>
                                    <button onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} className="p-1 text-slate-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => setDeletingId(plan.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Цель по доходам</p>
                                    <p className="font-semibold text-lg">{formatCurrency(plan.revenueTarget)}</p>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${Math.min((plan.collected / plan.revenueTarget) * 100, 100)}%` }}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Собрано: {formatCurrency(plan.collected)}</p>
                                </div>
                                 <div>
                                    <p className="text-slate-500">Расходы</p>
                                    <p className="font-semibold text-lg">{formatCurrency(plan.totalExpenses)}</p>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                                         <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${Math.min((plan.totalExpenses / Object.values(plan.expenseCeilings).reduce((s,c)=>s+(c||0),0)) * 100, 100)}%`}}></div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Лимит: {formatCurrency(Object.values(plan.expenseCeilings).reduce((s,c)=>s+(c||0),0))}</p>
                                </div>
                                 <div>
                                    <p className="text-slate-500">Лимиты по категориям</p>
                                    <ul className="text-xs mt-1">
                                        {Object.entries(plan.expenseCeilings).map(([cat, val]) => (
                                            <li key={cat}>
                                                <span className="font-medium">{ExpenseCategoryLabels[cat as ExpenseCategory]}:</span> {formatCurrency(val || 0)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
             {isModalOpen && <FinancialPlanFormModal plan={editingPlan} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </Card>
    );
};

export default BudgetTab;