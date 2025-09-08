import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Abonent, Payment } from '../../../types';
import { api } from "../../../src/firebase/real-api";
import { formatDate, formatCurrency } from '../../../utils/formatUtils';
import { useNotifications } from '../../../context/NotificationContext';

interface AbonentHistoryModalProps {
    abonent: Abonent;
    onClose: () => void;
}

export const AbonentHistoryModal: React.FC<AbonentHistoryModalProps> = ({
    abonent,
    onClose
}) => {
    const { showNotification } = useNotifications();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [quickPaymentAmount, setQuickPaymentAmount] = useState('');
    const [quickPaymentMethod, setQuickPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        loadPaymentHistory();
    }, [abonent.id]);

    const loadPaymentHistory = async () => {
        try {
            setLoading(true);
            const history = await api.getAbonentPaymentHistory(abonent.id);
            setPayments(history);
        } catch (error) {
            console.error('Ошибка при загрузке истории платежей:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async () => {
        if (!quickPaymentAmount || parseFloat(quickPaymentAmount) <= 0) {
            return;
        }

        setIsProcessingPayment(true);
        try {
            const payment: Payment = {
                id: `quick-${Date.now()}`,
                abonentId: abonent.id,
                abonentName: abonent.fullName,
                amount: parseFloat(quickPaymentAmount),
                paymentMethod: quickPaymentMethod,
                date: new Date().toISOString(),
                isBankPayment: quickPaymentMethod === PaymentMethod.Bank || quickPaymentMethod === PaymentMethod.Card || quickPaymentMethod === PaymentMethod.QR,
                bankType: undefined,
                comment: 'Быстрый платеж',
            };

            await api.createPayment(payment);
            setQuickPaymentAmount('');
            showNotification('Платеж успешно записан!');
            loadPaymentHistory();
        } catch (error) {
            console.error('Ошибка при записи платежа:', error);
            showNotification('Ошибка при записи платежа: ' + (error as Error).message);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const handleCreateQRCode = async () => {
        try {
            const qrData = {
                abonentId: abonent.id,
                amount: Math.abs(abonent.balance),
                timestamp: Date.now()
            };
            
            const qrCode = await api.generatePaymentQRCode(qrData);
            // Здесь можно показать QR код в модальном окне
            showNotification('QR код для оплаты создан!');
        } catch (error) {
            console.error('Ошибка при создании QR кода:', error);
            showNotification('Ошибка при создании QR кода');
        }
    };

    const showDetailedReport = (message: string) => {
        showNotification({
            type: 'info',
            title: 'Детальный отчет',
            message: message
        });
    };

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalDebt = Math.abs(abonent.balance);

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`История абонента: ${abonent.fullName}`}
            size="lg"
        >
            <div className="space-y-6">
                {/* Информация об абоненте */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium text-gray-900">Основная информация</h4>
                            <p className="text-sm text-gray-600">ФИО: {abonent.fullName}</p>
                            <p className="text-sm text-gray-600">Адрес: {abonent.address}</p>
                            <p className="text-sm text-gray-600">Лицевой счет: {abonent.personalAccount || 'Не назначен'}</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900">Финансовое состояние</h4>
                            <p className={`text-lg font-bold ${
                                abonent.balance < 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                                {abonent.balance < 0 ? '🔴' : '🟢'}
                                {abonent.balance < 0 ? '-' : '+'}
                                {Math.abs(abonent.balance).toLocaleString('ru-RU', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })} сом
                            </p>
                            <p className="text-sm text-gray-600">Всего оплачено: {totalPaid.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом</p>
                        </div>
                    </div>
                </div>

                {/* Быстрый платеж */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Быстрый платеж</h4>
                    <div className="grid grid-cols-3 gap-3">
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Сумма"
                            value={quickPaymentAmount}
                            onChange={(e) => setQuickPaymentAmount(e.target.value)}
                            className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={quickPaymentMethod}
                            onChange={(e) => setQuickPaymentMethod(e.target.value as PaymentMethod)}
                            className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={PaymentMethod.Cash}>Наличные</option>
                            <option value={PaymentMethod.Bank}>Банк</option>
                            <option value={PaymentMethod.Card}>Карта</option>
                            <option value={PaymentMethod.QR}>QR-код</option>
                        </select>
                        <button
                            onClick={handleRecordPayment}
                            disabled={!quickPaymentAmount || isProcessingPayment}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isProcessingPayment ? 'Запись...' : 'Записать платеж'}
                        </button>
                    </div>
                </div>

                {/* QR код */}
                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3">QR код для оплаты</h4>
                    <button
                        onClick={handleCreateQRCode}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                        Создать QR код
                    </button>
                    <p className="text-sm text-green-700 mt-2">
                        Создайте QR код для оплаты долга: {totalDebt.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
                    </p>
                </div>

                {/* История платежей */}
                <div>
                    <h4 className="font-medium text-gray-900 mb-3">История платежей</h4>
                    {loading ? (
                        <p className="text-gray-500">Загрузка истории...</p>
                    ) : payments.length === 0 ? (
                        <p className="text-gray-500">История платежей пуста</p>
                    ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {payments.map((payment) => (
                                <div key={payment.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                    <div>
                                        <p className="font-medium">{payment.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(payment.date)} • {payment.paymentMethod}
                                        </p>
                                        {payment.comment && (
                                            <p className="text-sm text-gray-500">{payment.comment}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            payment.isBankPayment 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {payment.isBankPayment ? 'Банк' : 'Наличные'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Кнопка закрытия */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </Modal>
    );
}; 