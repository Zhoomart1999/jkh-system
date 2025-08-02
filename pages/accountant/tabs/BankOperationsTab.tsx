import React, { useState, useEffect, useContext } from 'react';
import { api } from "../../../services/mock-api"
import { BankStatementTransaction, BankType, Abonent } from '../../../types';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { ArrowUpTrayIcon, CheckIcon, XMarkIcon, EyeIcon } from '../../../components/ui/Icons';
import { AuthContext } from '../../../context/AuthContext';

const BankOperationsTab: React.FC = () => {
    const [transactions, setTransactions] = useState<BankStatementTransaction[]>([]);
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<BankStatementTransaction | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmData, setConfirmData] = useState({ abonentId: '', transactionId: '' });
    const { user } = useContext(AuthContext)!;

    const [importData, setImportData] = useState({
        bankType: BankType.Other,
        csvData: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [transactionsData, abonentsData] = await Promise.all([
                api.getBankTransactions(),
                api.getAbonents()
            ]);
            setTransactions(transactionsData);
            setAbonents(abonentsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            // Парсим CSV данные
            const lines = importData.csvData.trim().split('\n');
            const headers = lines[0].split(',');
            const transactions = lines.slice(1).map(line => {
                const values = line.split(',');
                return {
                    date: values[0] || new Date().toISOString().split('T')[0],
                    amount: parseFloat(values[1]) || 0,
                    description: values[2] || '',
                    bankType: importData.bankType,
                    isConfirmed: false
                };
            });

            await api.importBankTransactions(transactions);
            setIsImportModalOpen(false);
            setImportData({ bankType: BankType.Other, csvData: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to import transactions:', error);
            alert('Ошибка при импорте транзакций');
        }
    };

    const handleConfirm = async () => {
        if (!user) return;

        try {
            await api.confirmBankTransaction(
                confirmData.transactionId,
                confirmData.abonentId,
                user.id
            );
            setIsConfirmModalOpen(false);
            setConfirmData({ abonentId: '', transactionId: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to confirm transaction:', error);
            alert('Ошибка при подтверждении транзакции');
        }
    };

    const getBankTypeLabel = (type: BankType) => {
        switch (type) {
            case BankType.KICB: return 'KICB';
            case BankType.Demir: return 'Демир Банк';
            case BankType.MBank: return 'МБанк';
            case BankType.Bakai: return 'Бакай Банк';
            case BankType.Other: return 'Другой';
            default: return type;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 });
    };

    if (loading) return <div className="flex justify-center items-center h-64">Загрузка...</div>;

    const unconfirmedTransactions = transactions.filter(t => !t.isConfirmed);
    const confirmedTransactions = transactions.filter(t => t.isConfirmed);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Банковские операции</h2>
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <ArrowUpTrayIcon className="w-5 h-5" />
                    Импорт выписки
                </button>
            </div>

            {/* Неподтвержденные транзакции */}
            <Card>
                <h3 className="text-lg font-medium mb-4">Неподтвержденные транзакции ({unconfirmedTransactions.length})</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Описание
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Банк
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {unconfirmedTransactions.map((transaction) => (
                                <tr key={transaction.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(transaction.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatAmount(transaction.amount)} сом
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {transaction.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getBankTypeLabel(transaction.bankType)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedTransaction(transaction);
                                                setIsConfirmModalOpen(true);
                                                setConfirmData({ ...confirmData, transactionId: transaction.id });
                                            }}
                                            className="text-green-600 hover:text-green-900 mr-3"
                                            title="Подтвердить"
                                        >
                                            <CheckIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedTransaction(transaction)}
                                            className="text-blue-600 hover:text-blue-900"
                                            title="Просмотр"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Подтвержденные транзакции */}
            <Card>
                <h3 className="text-lg font-medium mb-4">Подтвержденные транзакции ({confirmedTransactions.length})</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Сумма
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Описание
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Банк
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Абонент
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Подтверждено
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {confirmedTransactions.map((transaction) => {
                                const abonent = abonents.find(a => a.id === transaction.abonentId);
                                return (
                                    <tr key={transaction.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(transaction.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {formatAmount(transaction.amount)} сом
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {transaction.description}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getBankTypeLabel(transaction.bankType)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {abonent?.fullName || 'Неизвестный абонент'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {transaction.matchedAt ? formatDate(transaction.matchedAt) : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Модальное окно импорта */}
            <Modal
                title="Импорт банковской выписки"
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                size="lg"
            >
                <form onSubmit={handleImport} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Банк
                        </label>
                        <select
                            value={importData.bankType}
                            onChange={(e) => setImportData({...importData, bankType: e.target.value as BankType})}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={BankType.KICB}>KICB</option>
                            <option value={BankType.Demir}>Демир Банк</option>
                            <option value={BankType.MBank}>МБанк</option>
                            <option value={BankType.Bakai}>Бакай Банк</option>
                            <option value={BankType.Other}>Другой</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CSV данные (дата, сумма, описание)
                        </label>
                        <textarea
                            value={importData.csvData}
                            onChange={(e) => setImportData({...importData, csvData: e.target.value})}
                            required
                            rows={10}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                            placeholder="2024-01-15,1000.00,Оплата за воду Иванов И.И.&#10;2024-01-16,500.00,Платеж Петров П.П."
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Формат: дата, сумма, описание (каждая транзакция с новой строки)
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Импортировать
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Модальное окно подтверждения */}
            <Modal
                title="Подтвердить транзакцию"
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                size="md"
            >
                <div className="space-y-4">
                    {selectedTransaction && (
                        <div>
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2">Детали транзакции:</h4>
                                <p><strong>Дата:</strong> {formatDate(selectedTransaction.date)}</p>
                                <p><strong>Сумма:</strong> {formatAmount(selectedTransaction.amount)} сом</p>
                                <p><strong>Описание:</strong> {selectedTransaction.description}</p>
                                <p><strong>Банк:</strong> {getBankTypeLabel(selectedTransaction.bankType)}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Выберите абонента
                        </label>
                        <select
                            value={confirmData.abonentId}
                            onChange={(e) => setConfirmData({...confirmData, abonentId: e.target.value})}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Выберите абонента</option>
                            {abonents.map(abonent => (
                                <option key={abonent.id} value={abonent.id}>
                                    {abonent.fullName} - {abonent.address}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!confirmData.abonentId}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                        >
                            Подтвердить
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BankOperationsTab; 