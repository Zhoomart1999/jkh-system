import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { Abonent, Payment, PaymentMethod } from '../../types';

const PaymentCollectionPage: React.FC = () => {
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [selectedAbonent, setSelectedAbonent] = useState<Abonent | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
    const [comment, setComment] = useState<string>('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showNotification } = useNotifications();

    useEffect(() => {
        fetchAbonents();
    }, []);

    const fetchAbonents = async () => {
        try {
            setLoading(true);
            const data = await api.getAbonents();
            setAbonents(data);
        } catch (error) {
            showNotification('error', 'Не удалось загрузить абонентов');
        } finally {
            setLoading(false);
        }
    };

    const filteredAbonents = abonents.filter(abonent => {
        const matchesSearch = searchQuery === '' || 
            abonent.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            abonent.personalAccount.includes(searchQuery) ||
            abonent.address.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
    });

    const handleAbonentSelect = (abonent: Abonent) => {
        setSelectedAbonent(abonent);
        setPaymentAmount(Math.max(0, abonent.balance || 0));
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSubmit = async () => {
        if (!selectedAbonent || paymentAmount <= 0) {
            showNotification('error', 'Проверьте данные платежа');
            return;
        }

        try {
            const paymentData: Omit<Payment, 'id'> = {
                abonentId: selectedAbonent.id,
                abonentName: selectedAbonent.fullName,
                amount: paymentAmount,
                date: new Date().toISOString(),
                method: paymentMethod,
                paymentMethod: getMethodLabel(paymentMethod),
                collectorId: 'current-user', // TODO: получить ID текущего пользователя
                recordedByName: 'Инженер', // TODO: получить имя текущего пользователя
                comment: comment,
                isPartial: paymentAmount < Math.max(0, selectedAbonent.balance || 0)
            };

            await api.createPayment(paymentData);
            
            // Обновляем баланс абонента
            const newBalance = (selectedAbonent.balance || 0) - paymentAmount;
            await api.updateAbonent(selectedAbonent.id, { balance: newBalance });

            showNotification('success', `Платеж ${paymentAmount} сом принят от ${selectedAbonent.fullName}`);
            
            // Закрываем модал и обновляем данные
            setIsPaymentModalOpen(false);
            setSelectedAbonent(null);
            setPaymentAmount(0);
            setComment('');
            fetchAbonents();
            
        } catch (error) {
            showNotification('error', 'Ошибка при приеме платежа');
        }
    };

    const getMethodLabel = (method: PaymentMethod) => {
        const labels: Record<PaymentMethod, string> = {
            [PaymentMethod.Cash]: 'Наличные',
            [PaymentMethod.Bank]: 'Банк',
            [PaymentMethod.Card]: 'Карта',
            [PaymentMethod.Transfer]: 'Перевод',
            [PaymentMethod.QR]: 'QR-код',
            [PaymentMethod.CashRegister]: 'Касса',
            [PaymentMethod.System]: 'Система'
        };
        return labels[method];
    };

    const getBalanceColor = (balance: number) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    if (loading) {
        return (
            <Card>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка абонентов...</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Прием платежей
                </h1>
                <div className="text-right">
                    <p className="text-sm text-gray-600">Всего абонентов</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {abonents.length}
                    </p>
                </div>
            </div>

            {/* Поиск */}
            <Card>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Поиск абонента</label>
                    <input
                        type="text"
                        placeholder="Поиск по имени, лицевому счету или адресу..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </Card>

            {/* Список абонентов */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Абонент
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Лицевой счет
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Адрес
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Баланс
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAbonents.map((abonent) => (
                                <tr key={abonent.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {abonent.fullName}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {abonent.personalAccount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {abonent.address}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-sm font-medium ${getBalanceColor(abonent.balance || 0)}`}>
                                            {(abonent.balance || 0).toFixed(2)} сом
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleAbonentSelect(abonent)}
                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                                        >
                                            Принять платеж
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Модал приема платежа */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Прием платежа"
            >
                {selectedAbonent && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-900">Абонент</h3>
                            <p className="text-sm text-gray-600">{selectedAbonent.fullName}</p>
                            <p className="text-sm text-gray-600">Лицевой счет: {selectedAbonent.personalAccount}</p>
                            <p className="text-sm text-gray-600">Адрес: {selectedAbonent.address}</p>
                            <p className={`text-sm font-medium ${getBalanceColor(selectedAbonent.balance || 0)}`}>
                                Текущий баланс: {(selectedAbonent.balance || 0).toFixed(2)} сом
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Сумма платежа</label>
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Введите сумму"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Способ оплаты</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.values(PaymentMethod).map(method => (
                                    <option key={method} value={method}>
                                        {getMethodLabel(method)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Комментарий (необязательно)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="Дополнительная информация..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                            >
                                Принять платеж
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PaymentCollectionPage;
