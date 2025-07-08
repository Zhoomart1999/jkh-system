import React, { useState, useEffect, useMemo, useContext } from 'react';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { api } from '../../../services/api';
import { Payment, Abonent, AbonentStatus, BuildingType, PaymentMethod, ReceiptDetails } from '../../../types';
import Card from '../../../components/ui/Card';
import Modal, { ConfirmationModal } from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import { EditIcon, TrashIcon, SaveIcon, PrinterIcon } from '../../../components/ui/Icons';
import PrintProvider from '../../../components/ui/PrintProvider';
import { receiptTemplates, ReceiptTemplateKey } from '../../../components/templates';

const ITEMS_PER_PAGE = 10;
const RECEIPT_PRINT_STYLE = `
    @media print {
        body { -webkit-print-color-adjust: exact; color-adjust: exact; }
        .receipt-container { width: 148mm; height: 210mm; margin: auto; }
    }
    @page { size: A5; margin: 0; }
    body { margin: 0; background-color: #f0f2f5; }
    .receipt-container {
         width: 148mm;
         height: 210mm;
         margin: 20px auto;
         background-color: white;
         box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
`;

const formatDate = (dateString: string | null | undefined) => dateString ? new Date(dateString).toLocaleDateString('ru-RU') : 'N/A';
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом`;
const formatPaymentMethod = (method?: PaymentMethod) => {
    switch (method) {
        case PaymentMethod.Cash: return 'Наличные';
        case PaymentMethod.Card: return 'Карта/Перевод';
        case PaymentMethod.System: return 'Система';
        default: return 'Не указан';
    }
};

interface PaymentFormModalProps {
    payment: Payment | null;
    abonents: Abonent[];
    onSave: () => void;
    onClose: () => void;
}
const PaymentFormModal: React.FC<PaymentFormModalProps> = ({ payment, abonents, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        abonentId: payment?.abonentId || '',
        amount: payment?.amount || 0,
        date: payment?.date ? payment.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (payment) {
                await api.updatePayment({ ...payment, ...formData, amount: Number(formData.amount) });
            } else {
                await api.addPayment({ ...formData, amount: Number(formData.amount) });
            }
            onSave();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal title={payment ? 'Редактировать платеж' : 'Внести платеж'} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Абонент</label>
                    <select value={formData.abonentId} onChange={(e) => setFormData({...formData, abonentId: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" disabled={!!payment}>
                        <option value="" disabled>Выберите абонента</option>
                        {abonents.map(a => <option key={a.id} value={a.id}>{a.fullName} - {a.address}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Сумма</label>
                    <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Дата</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"><SaveIcon className="w-5 h-5"/>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </form>
        </Modal>
    );
};

const RevenueTab: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [filters, setFilters] = useState({ term: '', start: '', end: '', abonentType: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const [printingReceipt, setPrintingReceipt] = useState<ReceiptDetails | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsData, abonentsData] = await Promise.all([api.getPayments(), api.getAbonents()]);
            setPayments(paymentsData);
            setAbonents(abonentsData);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        await fetchData();
        setIsModalOpen(false);
        setEditingPayment(null);
    };
    
    const handleDeleteConfirm = async () => {
        if (deletingId) {
            await api.deletePayment(deletingId);
            setDeletingId(null);
            fetchData();
        }
    };

    const handlePrintReceipt = async (abonentId: string) => {
        try {
            const details = await api.getReceiptDetails(abonentId);
            setPrintingReceipt(details);
            await api.logReceiptPrint([abonentId]);
        } catch (error) {
            console.error("Failed to generate receipt:", error);
            alert("Ошибка при создании квитанции.");
        }
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        const dataToExport = filteredPayments.map(p => ({
            'Дата': formatDate(p.date),
            'Абонент': p.abonentName,
            'Сумма': p.amount,
            'Метод': formatPaymentMethod(p.paymentMethod),
            'Принял': p.collectorId ? p.recordedByName : 'Бухгалтерия',
            'Статус': p.status,
        }));

        if (format === 'excel') {
            const worksheet = xlsx.utils.json_to_sheet(dataToExport);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Payments');
            xlsx.writeFile(workbook, 'payments_export.xlsx');
        } else {
            const doc = new jsPDF();
            const response = await fetch('/fonts/Roboto-VariableFont_wdth,wght.ttf');
            const buffer = await response.arrayBuffer();
            const font = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            doc.addFileToVFS('Roboto-VariableFont_wdth,wght.ttf', font);
            doc.addFont('Roboto-VariableFont_wdth,wght.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
            (doc as any).autoTable({
                head: [['Дата', 'Абонент', 'Сумма', 'Метод', 'Принял', 'Статус']],
                body: dataToExport.map(Object.values),
                styles: { font: 'Roboto' }
            });
            doc.save('payments_export.pdf');
        }
    };

    const filteredPayments = useMemo(() => {
        const abonentMap = new Map(abonents.map(a => [a.id, a]));
        return payments
            .filter(p => p.abonentName.toLowerCase().includes(filters.term.toLowerCase()))
            .filter(p => !filters.start || new Date(p.date) >= new Date(filters.start))
            .filter(p => !filters.end || new Date(p.date) <= new Date(filters.end))
            .filter(p => {
                if (filters.abonentType === 'all') return true;
                const abonent = abonentMap.get(p.abonentId);
                return abonent?.buildingType === filters.abonentType;
            });
    }, [payments, abonents, filters]);

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredPayments, currentPage]);

    return (
        <Card>
            {printingReceipt && (
                <PrintProvider onAfterPrint={() => setPrintingReceipt(null)} printStyle={RECEIPT_PRINT_STYLE}>
                    {(() => {
                        const key = (printingReceipt.companySettings.receiptTemplate || 'classic') as ReceiptTemplateKey;
                        const Template = receiptTemplates[key];
                        return <Template details={printingReceipt} />;
                    })()}
                </PrintProvider>
            )}
             <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить этот платеж? Это действие нельзя отменить."
                confirmText="Удалить"
            />
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                <div>
                    <h2 className="text-xl font-semibold">Управление платежами (Доходы)</h2>
                    <p className="text-sm text-slate-500">Просмотр, добавление и экспорт платежей от абонентов.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleExport('excel')} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Excel</button>
                    <button onClick={() => handleExport('pdf')} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">PDF</button>
                    <button onClick={() => { setEditingPayment(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">Внести платеж</button>
                </div>
            </div>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input type="text" placeholder="Поиск по имени..." value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm lg:col-span-2"/>
                <input type="date" value={filters.start} onChange={e => setFilters({...filters, start: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                <input type="date" value={filters.end} onChange={e => setFilters({...filters, end: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                <select value={filters.abonentType} onChange={e => setFilters({...filters, abonentType: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="all">Все типы абонентов</option>
                    <option value={BuildingType.Private}>Частный дом</option>
                    <option value={BuildingType.Apartment}>Квартира</option>
                </select>
            </div>
            
            {loading ? <p>Загрузка...</p> : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Дата</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Абонент</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Сумма</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Метод</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Принял</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {paginatedPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{formatDate(p.date)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.abonentName}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{formatCurrency(p.amount)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">{formatPaymentMethod(p.paymentMethod)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500">{p.collectorId ? p.recordedByName : 'Бухгалтерия'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handlePrintReceipt(p.abonentId)} className="p-1 text-slate-500 hover:text-blue-600" title="Печать квитанции"><PrinterIcon className="w-5 h-5"/></button>
                                            <button onClick={() => {setEditingPayment(p); setIsModalOpen(true);}} className="p-1 text-slate-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setDeletingId(p.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                    </table>
                </div>
                <Pagination currentPage={currentPage} totalItems={filteredPayments.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
                </>
            )}
            {isModalOpen && <PaymentFormModal payment={editingPayment} abonents={abonents.filter(a=> a.status === AbonentStatus.Active)} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </Card>
    );
};

export default RevenueTab;
