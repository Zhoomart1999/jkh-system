import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { api } from "../../src/firebase/real-api";
import { Abonent, Payment, PaymentMethod } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

interface CashRegisterPageProps {}

interface CashReport {
  cash: number;
  bank: number;
  qr: number;
  total: number;
  payments: Payment[];
}

const CashRegisterPage: React.FC<CashRegisterPageProps> = () => {
  const [abonents, setAbonents] = useState<Abonent[]>([]);
  const [selectedAbonent, setSelectedAbonent] = useState<Abonent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [isClosingShift, setIsClosingShift] = useState(false);
  const [cashReport, setCashReport] = useState<CashReport>({
    cash: 0,
    bank: 0,
    qr: 0,
    total: 0,
    payments: []
  });

  useEffect(() => {
    loadAbonents();
    loadRecentPayments();
    calculateCashReport();
  }, []);

  const loadAbonents = async () => {
    try {
      const data = await api.getAbonents();
      setAbonents(data);
    } catch (error) {
      console.error('Error loading abonents:', error);
    }
  };

  const loadRecentPayments = async () => {
    try {
      const payments = await api.getPayments();
      setRecentPayments(payments.slice(0, 10)); // Последние 10 платежей
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const calculateCashReport = async () => {
    try {
      const payments = await api.getPayments();
      const today = new Date().toDateString();
      
      const todayPayments = payments.filter(payment => 
        new Date(payment.date).toDateString() === today
      );

      const cash = todayPayments
        .filter(p => p.method === PaymentMethod.Cash)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const bank = todayPayments
        .filter(p => p.method === PaymentMethod.Bank)
        .reduce((sum, p) => sum + p.amount, 0);
      
      const qr = todayPayments
        .filter(p => p.method === PaymentMethod.QR)
        .reduce((sum, p) => sum + p.amount, 0);

      setCashReport({
        cash,
        bank,
        qr,
        total: cash + bank + qr,
        payments: todayPayments
      });
    } catch (error) {
      console.error('Error calculating cash report:', error);
    }
  };

  const handleAbonentSelect = (abonent: Abonent) => {
    setSelectedAbonent(abonent);
    setIsPaymentModalOpen(true);
  };

  const handlePayment = async () => {
    if (!selectedAbonent || !paymentAmount) return;

    setIsProcessing(true);
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        showNotification({
          type: 'warning',
          title: 'Некорректная сумма',
          message: 'Введите корректную сумму'
        });
        return;
      }

      const paymentData = {
        abonentId: selectedAbonent.id,
        abonentName: selectedAbonent.fullName,
        amount: amount,
        date: new Date().toISOString(),
        method: paymentMethod,
        paymentMethod: paymentMethod,
        collectorId: '1',
        recordedByName: 'Кассир',
        recordedBy: '1',
        comment: `Оплата в кассе - ${selectedAbonent.fullName}`
      };

      await api.createPayment(paymentData);
      
      // Обновляем баланс абонента
      const newBalance = (selectedAbonent.balance || 0) + amount;
      await api.updateAbonent(selectedAbonent.id, { balance: newBalance });

      showNotification({
        type: 'success',
        title: 'Платеж принят',
        message: `Платеж успешно принят!\nСумма: ${amount} сом\nСпособ: ${getPaymentMethodName(paymentMethod)}`
      });
      
      // Закрываем модальное окно и обновляем данные
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setSelectedAbonent(null);
      loadAbonents();
      loadRecentPayments();
      calculateCashReport();
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка обработки',
        message: 'Ошибка при обработке платежа'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseShift = async () => {
    setIsClosingShift(true);
    try {
      const report = `ОТЧЕТ ПО КАССЕ\n${new Date().toLocaleDateString('ru-RU')}\n\n` +
        `Наличные: ${formatCurrency(cashReport.cash)} сом\n` +
        `Банк: ${formatCurrency(cashReport.bank)} сом\n` +
        `QR: ${formatCurrency(cashReport.qr)} сом\n` +
        `ОБЩАЯ СУММА: ${formatCurrency(cashReport.total)} сом\n\n` +
        `Количество платежей: ${cashReport.payments.length}`;
      
      showNotification({
        type: 'info',
        title: 'Отчет о смене',
        message: report
      });
      
      // Здесь можно добавить сохранение отчета в базу данных
      console.log('Cash report saved:', report);
    } catch (error) {
      showNotification({
        type: 'error',
        title: 'Ошибка закрытия',
        message: 'Ошибка при закрытии смены'
      });
    } finally {
      setIsClosingShift(false);
    }
  };

  const filteredAbonents = abonents.filter(abonent =>
    abonent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    abonent.personalAccount?.includes(searchTerm) ||
    abonent.phone?.includes(searchTerm)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.Cash: return 'Наличные';
      case PaymentMethod.Bank: return 'Банк';
      case PaymentMethod.QR: return 'QR код';
      default: return method;
    }
  };

  const { showNotification } = useNotifications();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Касса</h1>
        <div className="flex gap-2">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('ru-RU')}
          </div>
          <button
            onClick={handleCloseShift}
            disabled={isClosingShift}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isClosingShift ? 'Закрытие...' : 'Закрыть смену'}
          </button>
        </div>
      </div>

      {/* Отчет по кассе */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Отчет по кассе (сегодня)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600">Наличные</div>
              <div className="text-xl font-bold text-green-700">{formatCurrency(cashReport.cash)} сом</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600">Банк</div>
              <div className="text-xl font-bold text-blue-700">{formatCurrency(cashReport.bank)} сом</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600">QR код</div>
              <div className="text-xl font-bold text-purple-700">{formatCurrency(cashReport.qr)} сом</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">ОБЩАЯ СУММА</div>
              <div className="text-xl font-bold text-gray-700">{formatCurrency(cashReport.total)} сом</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Поиск абонента */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Поиск абонента</h2>
          <div className="flex gap-4 mb-6">
            <input
              type="text"
              placeholder="Поиск по ФИО, лицевому счету или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Список абонентов */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredAbonents.map((abonent) => (
              <div
                key={abonent.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAbonentSelect(abonent)}
              >
                <div className="flex-1">
                  <div className="font-medium">{abonent.fullName}</div>
                  <div className="text-sm text-gray-600">
                    Л/С: {abonent.personalAccount} | {abonent.address}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${abonent.balance && abonent.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(abonent.balance || 0)} сом
                  </div>
                  <div className="text-sm text-gray-500">{abonent.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Последние платежи */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Последние платежи</h2>
          <div className="space-y-2">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">
                    {abonents.find(a => a.id === payment.abonentId)?.fullName || 'Неизвестный абонент'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(payment.date).toLocaleDateString('ru-RU')} - {payment.comment}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    +{formatCurrency(payment.amount)} сом
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {getPaymentMethodName(payment.method)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Модальное окно платежа */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Прием платежа"
      >
        {selectedAbonent && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">{selectedAbonent.fullName}</h3>
              <p className="text-sm text-gray-600">
                Л/С: {selectedAbonent.personalAccount} | {selectedAbonent.address}
              </p>
              <p className={`font-bold ${selectedAbonent.balance && selectedAbonent.balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                Текущий баланс: {formatCurrency(selectedAbonent.balance || 0)} сом
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Сумма платежа (сом)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Способ оплаты
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={PaymentMethod.Cash}>Наличные</option>
                <option value={PaymentMethod.Bank}>Банк</option>
                <option value={PaymentMethod.QR}>QR код</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                disabled={isProcessing}
              >
                Отмена
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing || !paymentAmount}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Обработка...' : 'Принять платеж'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashRegisterPage; 