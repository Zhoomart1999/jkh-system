import React, { useState, useEffect, useContext } from 'react';
import { api } from "../../../services/mock-api"
import { ManualCharge, ManualChargeType, Abonent, User } from '../../../types';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { PlusIcon, EyeIcon, TrashIcon } from '../../../components/ui/Icons';
import { AuthContext } from '../../../context/AuthContext';

const ManualChargesTab: React.FC = () => {
    const [charges, setCharges] = useState<ManualCharge[]>([]);
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCharge, setSelectedCharge] = useState<ManualCharge | null>(null);
    const { user } = useContext(AuthContext)!;

    const [formData, setFormData] = useState({
        abonentId: '',
        amount: 0,
        type: ManualChargeType.Other,
        reason: '',
        date: new Date().toISOString().split('T')[0],
        period: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [chargesData, abonentsData] = await Promise.all([
                api.getManualCharges(),
                api.getAbonents()
            ]);
            setCharges(chargesData);
            setAbonents(abonentsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            await api.addManualCharge({
                ...formData,
                createdBy: user.id
            });
            setIsModalOpen(false);
            setFormData({
                abonentId: '',
                amount: 0,
                type: ManualChargeType.Other,
                reason: '',
                date: new Date().toISOString().split('T')[0],
                period: ''
            });
            fetchData();
        } catch (error) {
            console.error('Failed to add manual charge:', error);
            alert('Ошибка при добавлении начисления');
        }
    };

    const handleDelete = async (chargeId: string) => {
        if (!confirm('Вы уверены, что хотите удалить это начисление?')) return;
        
        try {
            // В реальном приложении здесь был бы API для удаления
            setCharges(charges.filter(c => c.id !== chargeId));
        } catch (error) {
            console.error('Failed to delete charge:', error);
            alert('Ошибка при удалении начисления');
        }
    };

    const getChargeTypeLabel = (type: ManualChargeType) => {
        switch (type) {
            case ManualChargeType.Penalty: return 'Штраф';
            case ManualChargeType.Adjustment: return 'Корректировка';
            case ManualChargeType.Retroactive: return 'Ретроактивное';
            case ManualChargeType.Other: return 'Другое';
            default: return type;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (loading) return <div className="flex justify-center items-center h-64">Загрузка...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Ручные начисления</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Добавить начисление
                </button>
            </div>

            <Card>
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
                                    Тип
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Причина
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Дата
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {charges.map((charge) => {
                                const abonent = abonents.find(a => a.id === charge.abonentId);
                                return (
                                    <tr key={charge.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {abonent?.fullName || 'Неизвестный абонент'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {charge.amount.toLocaleString()} сом
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                charge.type === ManualChargeType.Penalty ? 'bg-red-100 text-red-800' :
                                                charge.type === ManualChargeType.Adjustment ? 'bg-yellow-100 text-yellow-800' :
                                                charge.type === ManualChargeType.Retroactive ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {getChargeTypeLabel(charge.type)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {charge.reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(charge.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setSelectedCharge(charge)}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(charge.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Модальное окно добавления начисления */}
            <Modal
                title="Добавить ручное начисление"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Абонент
                        </label>
                        <select
                            value={formData.abonentId}
                            onChange={(e) => setFormData({...formData, abonentId: e.target.value})}
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Сумма (сом)
                        </label>
                        <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                            required
                            min="0"
                            step="0.01"
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Тип начисления
                        </label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({...formData, type: e.target.value as ManualChargeType})}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={ManualChargeType.Penalty}>Штраф</option>
                            <option value={ManualChargeType.Adjustment}>Корректировка</option>
                            <option value={ManualChargeType.Retroactive}>Ретроактивное</option>
                            <option value={ManualChargeType.Other}>Другое</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Причина
                        </label>
                        <textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({...formData, reason: e.target.value})}
                            required
                            rows={3}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Укажите причину начисления..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Дата начисления
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                            required
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {formData.type === ManualChargeType.Retroactive && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Период (YYYY-MM)
                            </label>
                            <input
                                type="month"
                                value={formData.period}
                                onChange={(e) => setFormData({...formData, period: e.target.value})}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Добавить
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Модальное окно просмотра начисления */}
            {selectedCharge && (
                <Modal
                    title="Детали начисления"
                    isOpen={!!selectedCharge}
                    onClose={() => setSelectedCharge(null)}
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Абонент</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {abonents.find(a => a.id === selectedCharge.abonentId)?.fullName}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Сумма</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {selectedCharge.amount.toLocaleString()} сом
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Тип</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {getChargeTypeLabel(selectedCharge.type)}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Причина</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedCharge.reason}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Дата</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCharge.date)}</p>
                        </div>
                        {selectedCharge.period && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Период</label>
                                <p className="mt-1 text-sm text-gray-900">{selectedCharge.period}</p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Создано</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedCharge.createdAt)}</p>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManualChargesTab; 