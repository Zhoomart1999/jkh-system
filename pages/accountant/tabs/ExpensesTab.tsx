
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { api } from "../../../services/mock-api"
import { Expense, User, ExpenseCategory, ExpenseCategoryLabels } from '../../../types';
import Card from '../../../components/ui/Card';
import Modal, { ConfirmationModal } from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import { AuthContext } from '../../../context/AuthContext';
import { EditIcon, TrashIcon, SaveIcon, FileTextIcon } from '../../../components/ui/Icons';

const ITEMS_PER_PAGE = 10;
const formatDate = (dateString: string | null | undefined) => dateString ? new Date(dateString).toLocaleDateString('ru-RU') : 'N/A';
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом`;

interface ExpenseFormModalProps {
    expense: Expense | null;
    users: User[];
    onSave: () => void;
    onClose: () => void;
}
const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({ expense, users, onSave, onClose }) => {
    const auth = useContext(AuthContext);
    const [formData, setFormData] = useState({
        date: expense?.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0],
        amount: expense?.amount || 0,
        category: expense?.category || ExpenseCategory.Office,
        description: expense?.description || '',
        responsiblePersonId: expense?.responsiblePersonId || auth?.user?.id || '',
        documentUrl: expense?.documentUrl || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({...prev, documentUrl: reader.result as string}));
            };
            reader.readAsDataURL(file);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const responsiblePerson = users.find(u => u.id === formData.responsiblePersonId);
        if(!responsiblePerson) {
             alert('Responsible person not found');
             setIsSaving(false);
             return;
        }

        const dataToSave = { 
            ...formData, 
            amount: Number(formData.amount),
            responsiblePersonName: responsiblePerson.name 
        };

        try {
            if (expense) {
                await api.updateExpense({ ...expense, ...dataToSave });
            } else {
                await api.addExpense(dataToSave);
            }
            onSave();
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Modal title={expense ? 'Редактировать расход' : 'Добавить расход'} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium">Дата</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Категория</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        {Object.entries(ExpenseCategoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Сумма</label>
                    <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium">Описание</label>
                    <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Ответственный</label>
                    <select value={formData.responsiblePersonId} onChange={e => setFormData({...formData, responsiblePersonId: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Документ (чек, фото)</label>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {formData.documentUrl && (
                        <div className="mt-2">
                            <img src={formData.documentUrl} alt="Preview" className="max-h-24 rounded-md border"/>
                            <button type="button" onClick={() => setFormData({...formData, documentUrl: ''})} className="text-xs text-red-500 hover:underline">Удалить</button>
                        </div>
                    )}
                </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"><SaveIcon className="w-5 h-5"/>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </form>
        </Modal>
    );
};

const ExpensesTab: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [expData, usersData] = await Promise.all([api.getExpenses(), api.getUsers()]);
            setExpenses(expData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setUsers(usersData);
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        await fetchData();
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const handleDeleteConfirm = async () => {
        if (deletingId) {
            await api.deleteExpense(deletingId);
            setDeletingId(null);
            fetchData();
        }
    };

    const paginatedExpenses = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return expenses.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [expenses, currentPage]);
    
    return (
        <Card>
            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот расход?"
                confirmText="Удалить"
            />
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Управление расходами</h2>
                    <p className="text-sm text-slate-500">Отслеживание и категоризация всех расходов компании.</p>
                </div>
                <button onClick={() => { setEditingExpense(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">Добавить расход</button>
            </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Категория</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Сумма</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Описание</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ответственный</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {paginatedExpenses.map(e => (
                            <tr key={e.id} className="hover:bg-slate-50">
                                <td className="px-4 py-4 text-sm">{formatDate(e.date)}</td>
                                <td className="px-4 py-4 text-sm">{ExpenseCategoryLabels[e.category]}</td>
                                <td className="px-4 py-4 text-sm font-semibold text-red-600">{formatCurrency(e.amount)}</td>
                                <td className="px-4 py-4 text-sm max-w-xs truncate">
                                    {e.description}
                                    {e.documentUrl && (
                                        <button
                                            type="button"
                                            onClick={(evt) => {
                                                evt.stopPropagation();
                                                setViewingImage(e.documentUrl!);
                                            }}
                                            className="ml-2 p-0 border-none bg-transparent text-blue-500 hover:text-blue-700 cursor-pointer align-middle"
                                            title="Просмотреть документ"
                                        >
                                            <FileTextIcon className="w-4 h-4 inline-block" />
                                        </button>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-sm">{e.responsiblePersonName}</td>
                                <td className="px-4 py-4 text-right">
                                     <button onClick={() => {setEditingExpense(e); setIsModalOpen(true);}} className="p-1 text-slate-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                     <button onClick={() => setDeletingId(e.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             <Pagination currentPage={currentPage} totalItems={expenses.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
            {isModalOpen && <ExpenseFormModal expense={editingExpense} users={users} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
            {viewingImage && (
                <Modal title="Просмотр документа" isOpen={true} onClose={() => setViewingImage(null)}>
                    <img src={viewingImage} alt="Документ" className="max-w-full max-h-[80vh] mx-auto"/>
                </Modal>
            )}
        </Card>
    );
};

export default ExpensesTab;