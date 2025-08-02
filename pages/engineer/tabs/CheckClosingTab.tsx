import React, { useState, useEffect, useContext } from 'react';
import { api } from "../../../services/mock-api"
import { CheckClosingPayment, CheckClosing, User, Role, PaymentMethod, BankType } from '../../../types';
import Card from '../../../components/ui/Card';
import { AuthContext } from '../../../context/AuthContext';
import { 
    ReceiptIcon, 
    UsersIcon, 
    CalendarIcon, 
    DollarSignIcon,
    CreditCardIcon,
    CheckIcon,
    XIcon,
    EyeIcon,
    DownloadIcon
} from '../../../components/ui/Icons';

const CheckClosingTab: React.FC = () => {
    const [payments, setPayments] = useState<CheckClosingPayment[]>([]);
    const [controllers, setControllers] = useState<User[]>([]);
    const [checkClosings, setCheckClosings] = useState<CheckClosing[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedController, setSelectedController] = useState<string>('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState({
        date: selectedDate,
        controllerId: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useContext(AuthContext)!;

    useEffect(() => {
        fetchData();
    }, [selectedDate, selectedController]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [paymentsData, controllersData, closingsData] = await Promise.all([
                api.getPaymentsForCheckClosing(selectedDate, selectedController || undefined),
                api.getUsers(),
                api.getCheckClosings({ date: selectedDate })
            ]);
            
            setPayments(paymentsData);
            setControllers(controllersData.filter(u => u.role === Role.Controller));
            setCheckClosings(closingsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCheckClosing = async () => {
        if (!formData.controllerId || payments.length === 0) return;
        
        setIsSubmitting(true);
        try {
            await api.createCheckClosing({
                date: formData.date,
                controllerId: formData.controllerId,
                payments,
                notes: formData.notes
            });
            
            setShowCreateForm(false);
            setFormData({ date: selectedDate, controllerId: '', notes: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create check closing:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConfirmClosing = async (closingId: string) => {
        try {
            await api.confirmCheckClosing(closingId);
            fetchData();
        } catch (error) {
            console.error('Failed to confirm check closing:', error);
        }
    };

    const handleCancelClosing = async (closingId: string) => {
        const reason = prompt('Укажите причину отмены:');
        if (reason) {
            try {
                await api.cancelCheckClosing(closingId, reason);
                fetchData();
            } catch (error) {
                console.error('Failed to cancel check closing:', error);
            }
        }
    };

    const formatPaymentMethod = (method: PaymentMethod) => {
        switch (method) {
            case PaymentMethod.Cash: return 'Наличные';
            case PaymentMethod.Bank: return 'Банк';
            case PaymentMethod.Card: return 'Карта';
            case PaymentMethod.QR: return 'QR-код';
            case PaymentMethod.CashRegister: return 'Касса';
            case PaymentMethod.System: return 'Система';
            default: return 'Неизвестно';
        }
    };

    const getStatusBadge = (status: CheckClosing['status']) => {
        switch (status) {
            case 'pending':
                return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Ожидает</span>;
            case 'confirmed':
                return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Подтвержден</span>;
            case 'cancelled':
                return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Отменен</span>;
        }
    };

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const bankPayments = payments.filter(p => p.isBankPayment);
    const cashPayments = payments.filter(p => !p.isBankPayment);

    if (loading) {
        return <Card><div className="flex justify-center items-center h-64">Загрузка...</div></Card>;
    }

    return (
        <div className="space-y-6">
            {/* Заголовок и фильтры */}
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ReceiptIcon className="w-6 h-6" />
                        Закрытие чека
                    </h2>
                    <button
                        onClick={() => setShowCreateForm(true)}
                        disabled={payments.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <ReceiptIcon className="w-4 h-4" />
                        Закрыть чек
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Дата</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Контролёр</label>
                        <select
                            value={selectedController}
                            onChange={(e) => setSelectedController(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="">Все контролёры</option>
                            {controllers.map(controller => (
                                <option key={controller.id} value={controller.id}>
                                    {controller.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={fetchData}
                            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                            Обновить
                        </button>
                    </div>
                </div>
            </Card>

            {/* Сводка по платежам */}
            {payments.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Сводка по платежам за {selectedDate}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <DollarSignIcon className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold">Общая сумма</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} сом</p>
                            <p className="text-sm text-gray-600">{payments.length} платежей</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5 text-green-600" />
                                <span className="font-semibold">Банковские</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {bankPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} сом
                            </p>
                            <p className="text-sm text-gray-600">{bankPayments.length} платежей</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <DollarSignIcon className="w-5 h-5 text-yellow-600" />
                                <span className="font-semibold">Наличные</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">
                                {cashPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} сом
                            </p>
                            <p className="text-sm text-gray-600">{cashPayments.length} платежей</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <UsersIcon className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold">Контролёров</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                                {new Set(payments.map(p => p.paymentId)).size}
                            </p>
                            <p className="text-sm text-gray-600">активных</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Список платежей */}
            {payments.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold mb-4">Список платежей</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Абонент
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Сумма
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Способ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Банк
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Комментарий
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.map((payment) => (
                                    <tr key={payment.paymentId}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {payment.abonentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.amount.toLocaleString()} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatPaymentMethod(payment.paymentMethod)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.bankType || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {payment.comment || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* История закрытых чеков */}
            {checkClosings.length > 0 && (
                <Card>
                    <h3 className="text-lg font-semibold mb-4">История закрытых чеков</h3>
                    <div className="space-y-4">
                        {checkClosings.map((closing) => (
                            <div key={closing.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-semibold">Чек от {closing.date}</h4>
                                        <p className="text-sm text-gray-600">
                                            Контролёр: {closing.controllerName} | 
                                            Закрыл: {closing.closedByName} | 
                                            Сумма: {closing.totalAmount.toLocaleString()} сом
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(closing.status)}
                                        {closing.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleConfirmClosing(closing.id)}
                                                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                                                    title="Подтвердить"
                                                >
                                                    <CheckIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleCancelClosing(closing.id)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                    title="Отменить"
                                                >
                                                    <XIcon className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={async () => {
                                                const url = await api.exportCheckClosingReport(closing.id);
                                                window.open(url, '_blank');
                                            }}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                            title="Экспорт"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {closing.notes && (
                                    <p className="text-sm text-gray-600 mt-2">{closing.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Модальное окно создания закрытия чека */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Закрытие чека</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Дата</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Контролёр</label>
                                <select
                                    value={formData.controllerId}
                                    onChange={(e) => setFormData({...formData, controllerId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Выберите контролёра</option>
                                    {controllers.map(controller => (
                                        <option key={controller.id} value={controller.id}>
                                            {controller.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Примечания</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Дополнительная информация..."
                                />
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded">
                                <p className="text-sm text-gray-600">
                                    Будет закрыто {payments.length} платежей на общую сумму {totalAmount.toLocaleString()} сом
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowCreateForm(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleCreateCheckClosing}
                                disabled={isSubmitting || !formData.controllerId}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Создание...' : 'Создать'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Сообщение если нет платежей */}
            {payments.length === 0 && !loading && (
                <Card>
                    <div className="text-center py-8">
                        <ReceiptIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет платежей</h3>
                        <p className="text-gray-600">
                            На выбранную дату ({selectedDate}) не найдено платежей для закрытия чека.
                        </p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CheckClosingTab; 