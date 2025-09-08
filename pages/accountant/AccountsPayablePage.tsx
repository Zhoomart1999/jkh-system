import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import Card from '../../components/ui/Card';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, ClockIcon, BanknotesIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
    taxId: string;
    category: string;
}

interface Invoice {
    id: string;
    supplierId: string;
    supplierName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'pending' | 'partial' | 'paid' | 'overdue';
    category: string;
    description: string;
    paymentTerms: string;
}

interface Payment {
    id: string;
    invoiceId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference: string;
    notes?: string;
}

const AccountsPayablePage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddInvoice, setShowAddInvoice] = useState(false);
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    // Форма добавления счета
    const [invoiceForm, setInvoiceForm] = useState({
        supplierId: '',
        invoiceNumber: '',
        invoiceDate: '',
        dueDate: '',
        amount: 0,
        category: '',
        description: '',
        paymentTerms: ''
    });

    // Форма добавления платежа
    const [paymentForm, setPaymentForm] = useState({
        amount: 0,
        paymentDate: '',
        paymentMethod: 'bank_transfer',
        reference: '',
        notes: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Имитация загрузки данных
            const mockSuppliers: Supplier[] = [
                {
                    id: '1',
                    name: 'ООО "Энергоснабжение"',
                    contactPerson: 'Иванов И.И.',
                    phone: '+996 555 123 456',
                    email: 'info@energo.kg',
                    address: 'г. Бишкек, ул. Ленина, 123',
                    taxId: '1234567890',
                    category: 'Электроэнергия'
                },
                {
                    id: '2',
                    name: 'ООО "Трубы и фитинги"',
                    contactPerson: 'Петров П.П.',
                    phone: '+996 555 234 567',
                    email: 'sales@tubes.kg',
                    address: 'г. Бишкек, ул. Советская, 45',
                    taxId: '0987654321',
                    category: 'Материалы'
                },
                {
                    id: '3',
                    name: 'ООО "Химия для очистки"',
                    contactPerson: 'Сидоров С.С.',
                    phone: '+996 555 345 678',
                    email: 'info@chemistry.kg',
                    address: 'г. Бишкек, ул. Мира, 67',
                    taxId: '1122334455',
                    category: 'Химикаты'
                }
            ];

            const mockInvoices: Invoice[] = [
                {
                    id: '1',
                    supplierId: '1',
                    supplierName: 'ООО "Энергоснабжение"',
                    invoiceNumber: 'INV-2025-001',
                    invoiceDate: '2025-01-01',
                    dueDate: '2025-01-31',
                    amount: 150000,
                    paidAmount: 0,
                    remainingAmount: 150000,
                    status: 'pending',
                    category: 'Электроэнергия',
                    description: 'Электроэнергия за декабрь 2024',
                    paymentTerms: '30 дней'
                },
                {
                    id: '2',
                    supplierId: '2',
                    supplierName: 'ООО "Трубы и фитинги"',
                    invoiceNumber: 'INV-2025-002',
                    invoiceDate: '2025-01-05',
                    dueDate: '2025-02-04',
                    amount: 75000,
                    paidAmount: 25000,
                    remainingAmount: 50000,
                    status: 'partial',
                    category: 'Материалы',
                    description: 'Трубы ПВХ 50мм, 100м',
                    paymentTerms: '30 дней'
                },
                {
                    id: '3',
                    supplierId: '3',
                    supplierName: 'ООО "Химия для очистки"',
                    invoiceNumber: 'INV-2024-150',
                    invoiceDate: '2024-12-15',
                    dueDate: '2025-01-14',
                    amount: 45000,
                    paidAmount: 0,
                    remainingAmount: 45000,
                    status: 'overdue',
                    category: 'Химикаты',
                    description: 'Хлор для очистки воды',
                    paymentTerms: '30 дней'
                }
            ];

            const mockPayments: Payment[] = [
                {
                    id: '1',
                    invoiceId: '2',
                    amount: 25000,
                    paymentDate: '2025-01-10',
                    paymentMethod: 'bank_transfer',
                    reference: 'REF-001',
                    notes: 'Частичная оплата'
                }
            ];

            setSuppliers(mockSuppliers);
            setInvoices(mockInvoices);
            setPayments(mockPayments);
        } catch (error) {
            console.error('Failed to fetch accounts payable data:', error);
        } finally {
            setLoading(false);
        }
    };

    const addInvoice = async () => {
        if (!invoiceForm.supplierId || !invoiceForm.invoiceNumber || invoiceForm.amount <= 0) return;

        setProcessing(true);
        try {
            const supplier = suppliers.find(s => s.id === invoiceForm.supplierId);
            if (!supplier) return;

            const newInvoice: Invoice = {
                id: Date.now().toString(),
                supplierId: invoiceForm.supplierId,
                supplierName: supplier.name,
                invoiceNumber: invoiceForm.invoiceNumber,
                invoiceDate: invoiceForm.invoiceDate,
                dueDate: invoiceForm.dueDate,
                amount: invoiceForm.amount,
                paidAmount: 0,
                remainingAmount: invoiceForm.amount,
                status: 'pending',
                category: invoiceForm.category,
                description: invoiceForm.description,
                paymentTerms: invoiceForm.paymentTerms
            };

            setInvoices([...invoices, newInvoice]);
            setShowAddInvoice(false);
            setInvoiceForm({
                supplierId: '',
                invoiceNumber: '',
                invoiceDate: '',
                dueDate: '',
                amount: 0,
                category: '',
                description: '',
                paymentTerms: ''
            });
            
            showNotification({
                type: 'success',
                title: 'Счет добавлен',
                message: 'Счет добавлен!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка добавления',
                message: 'Ошибка при добавлении счета'
            });
        } finally {
            setProcessing(false);
        }
    };

    const addPayment = async () => {
        if (!selectedInvoice || paymentForm.amount <= 0) return;

        setProcessing(true);
        try {
            const newPayment: Payment = {
                id: Date.now().toString(),
                invoiceId: selectedInvoice,
                amount: paymentForm.amount,
                paymentDate: paymentForm.paymentDate,
                paymentMethod: paymentForm.paymentMethod,
                reference: paymentForm.reference,
                notes: paymentForm.notes
            };

            // Обновляем счет
            setInvoices(invoices => 
                invoices.map(invoice => {
                    if (invoice.id === selectedInvoice) {
                        const newPaidAmount = invoice.paidAmount + paymentForm.amount;
                        const newRemainingAmount = invoice.amount - newPaidAmount;
                        let newStatus: Invoice['status'] = 'partial';
                        
                        if (newRemainingAmount <= 0) {
                            newStatus = 'paid';
                        } else if (new Date(invoice.dueDate) < new Date() && newRemainingAmount > 0) {
                            newStatus = 'overdue';
                        }

                        return {
                            ...invoice,
                            paidAmount: newPaidAmount,
                            remainingAmount: Math.max(0, newRemainingAmount),
                            status: newStatus
                        };
                    }
                    return invoice;
                })
            );

            setPayments([...payments, newPayment]);
            setShowAddPayment(false);
            setSelectedInvoice('');
            setPaymentForm({
                amount: 0,
                paymentDate: '',
                paymentMethod: 'bank_transfer',
                reference: '',
                notes: ''
            });
            
            showNotification({
                type: 'success',
                title: 'Платеж добавлен',
                message: 'Платеж добавлен!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка добавления',
                message: 'Ошибка при добавлении платежа'
            });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'partial': return 'bg-blue-100 text-blue-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Ожидает оплаты';
            case 'partial': return 'Частично оплачен';
            case 'paid': return 'Оплачен';
            case 'overdue': return 'Просрочен';
            default: return status;
        }
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'bank_transfer': return 'Банковский перевод';
            case 'cash': return 'Наличные';
            case 'check': return 'Чек';
            default: return method;
        }
    };

    const getPendingInvoices = () => invoices.filter(inv => inv.status === 'pending');
    const getOverdueInvoices = () => invoices.filter(inv => inv.status === 'overdue');
    const getPartialInvoices = () => invoices.filter(inv => inv.status === 'partial');
    const getPaidInvoices = () => invoices.filter(inv => inv.status === 'paid');

    const getTotalPayable = () => invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const getTotalOverdue = () => getOverdueInvoices().reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const getTotalPaid = () => invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

    const getDaysOverdue = (dueDate: string) => {
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Кредиторская задолженность</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <BanknotesIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Кредиторская задолженность</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <BanknotesIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {getTotalPayable().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">К оплате</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <BanknotesIcon className="w-8 h-8 text-orange-500" />
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {getTotalOverdue().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Просрочено</div>
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
                                    {getTotalPaid().toLocaleString()} сом
                                </div>
                                <div className="text-sm text-slate-600">Оплачено</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {getOverdueInvoices().length}
                                </div>
                                <div className="text-sm text-slate-600">Просроченных счетов</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Добавление счета */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <BanknotesIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Добавление счета</h3>
                    </div>
                    <button
                        onClick={() => setShowAddInvoice(!showAddInvoice)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showAddInvoice ? 'Отмена' : 'Новый счет'}
                    </button>
                </div>

                {showAddInvoice && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Поставщик
                                </label>
                                <select
                                    value={invoiceForm.supplierId}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, supplierId: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите поставщика...</option>
                                    {suppliers.map(supplier => (
                                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Номер счета
                                </label>
                                <input
                                    type="text"
                                    value={invoiceForm.invoiceNumber}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, invoiceNumber: e.target.value})}
                                    placeholder="INV-2025-001"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Дата счета
                                </label>
                                <input
                                    type="date"
                                    value={invoiceForm.invoiceDate}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, invoiceDate: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Срок оплаты
                                </label>
                                <input
                                    type="date"
                                    value={invoiceForm.dueDate}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, dueDate: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Сумма (сом)
                                </label>
                                <input
                                    type="number"
                                    value={invoiceForm.amount}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, amount: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Категория
                                </label>
                                <input
                                    type="text"
                                    value={invoiceForm.category}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, category: e.target.value})}
                                    placeholder="Электроэнергия"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Условия оплаты
                                </label>
                                <input
                                    type="text"
                                    value={invoiceForm.paymentTerms}
                                    onChange={(e) => setInvoiceForm({...invoiceForm, paymentTerms: e.target.value})}
                                    placeholder="30 дней"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Описание
                            </label>
                            <textarea
                                value={invoiceForm.description}
                                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
                                rows={3}
                                placeholder="Описание товаров/услуг"
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={addInvoice}
                            disabled={processing || !invoiceForm.supplierId || !invoiceForm.invoiceNumber || invoiceForm.amount <= 0}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {processing ? 'Добавление...' : 'Добавить счет'}
                        </button>
                    </div>
                )}
            </Card>

            {/* Счета к оплате */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <BanknotesIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Счета к оплате</h3>
                    </div>
                    <button
                        onClick={() => setShowAddPayment(!showAddPayment)}
                        className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {showAddPayment ? 'Отмена' : 'Добавить платеж'}
                    </button>
                </div>

                {showAddPayment && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Счет
                                </label>
                                <select
                                    value={selectedInvoice}
                                    onChange={(e) => setSelectedInvoice(e.target.value)}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Выберите счет...</option>
                                    {invoices.filter(inv => inv.remainingAmount > 0).map(invoice => (
                                        <option key={invoice.id} value={invoice.id}>
                                            {invoice.invoiceNumber} - {invoice.supplierName} ({invoice.remainingAmount.toLocaleString()} сом)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Сумма платежа (сом)
                                </label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({...paymentForm, amount: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Дата платежа
                                </label>
                                <input
                                    type="date"
                                    value={paymentForm.paymentDate}
                                    onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Способ оплаты
                                </label>
                                <select
                                    value={paymentForm.paymentMethod}
                                    onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="bank_transfer">Банковский перевод</option>
                                    <option value="cash">Наличные</option>
                                    <option value="check">Чек</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Референс
                                </label>
                                <input
                                    type="text"
                                    value={paymentForm.reference}
                                    onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                                    placeholder="REF-001"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Примечания
                            </label>
                            <textarea
                                value={paymentForm.notes}
                                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                                rows={2}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={addPayment}
                            disabled={processing || !selectedInvoice || paymentForm.amount <= 0}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {processing ? 'Добавление...' : 'Добавить платеж'}
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Счет
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Поставщик
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Оплачено
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Остаток
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Срок
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {invoice.supplierName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {invoice.amount.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        {invoice.paidAmount.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                        {invoice.remainingAmount.toLocaleString()} сом
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <div>{new Date(invoice.dueDate).toLocaleDateString('ru-RU')}</div>
                                        {invoice.status === 'overdue' && (
                                            <div className="text-xs text-red-600">
                                                Просрочен на {Math.abs(getDaysOverdue(invoice.dueDate))} дн.
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                            {getStatusLabel(invoice.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {invoices.length === 0 && (
                    <div className="text-center py-12">
                        <BanknotesIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет счетов к оплате</h3>
                        <p className="text-slate-500">Добавьте первые счета от поставщиков</p>
                    </div>
                )}
            </Card>

            {/* История платежей */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CheckIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">История платежей</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Счет
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Способ
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Референс
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Примечания
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {payments.map((payment) => {
                                const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                                return (
                                    <tr key={payment.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {new Date(payment.paymentDate).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {invoice?.invoiceNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                            {payment.amount.toLocaleString()} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {getPaymentMethodLabel(payment.paymentMethod)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {payment.reference}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {payment.notes}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {payments.length === 0 && (
                    <div className="text-center py-12">
                        <CheckIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет платежей</h3>
                        <p className="text-slate-500">Добавьте первые платежи по счетам</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AccountsPayablePage; 