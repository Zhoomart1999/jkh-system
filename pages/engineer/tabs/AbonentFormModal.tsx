import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Abonent, AbonentStatus, WaterTariffType, User } from '../../../types';
import { api } from "../../../src/firebase/real-api";

interface AbonentFormModalProps {
    abonent?: Abonent | null;
    onSave: () => void;
    onClose: () => void;
    controllers: User[];
    isOpen: boolean; // added
}

const AbonentFormModal: React.FC<AbonentFormModalProps> = ({
    abonent,
    onSave,
    onClose,
    controllers,
    isOpen
}) => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        apartment: '',
        waterService: true,
        garbageService: true,
        waterTariff: WaterTariffType.ByPerson,
        status: AbonentStatus.Active,
        waterDebt: 0,
        garbageDebt: 0,
        debtComment: '',
        controllerId: '',
        hasGarden: false,
        personalAccount: '',
        prevMeterReading: '',
        currentMeterReading: '',
        penaltyRate: '0',
        gardenTariff: '0'
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (abonent) {
            setFormData({
                fullName: abonent.fullName || '',
                phone: abonent.phone || '',
                address: abonent.address || '',
                apartment: abonent.apartment || '',
                waterService: abonent.waterService !== false,
                garbageService: abonent.garbageService !== false,
                waterTariff: abonent.waterTariff || WaterTariffType.ByPerson,
                status: abonent.status || AbonentStatus.Active,
                waterDebt: abonent.waterDebt || 0,
                garbageDebt: abonent.garbageDebt || 0,
                debtComment: abonent.debtComment || '',
                controllerId: abonent.controllerId || '',
                hasGarden: abonent.hasGarden || false,
                personalAccount: abonent.personalAccount || '',
                prevMeterReading: abonent.prevMeterReading || '',
                currentMeterReading: abonent.currentMeterReading || '',
                penaltyRate: abonent.penaltyRate || '0',
                gardenTariff: abonent.gardenTariff || '0'
            });
        }
    }, [abonent]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.fullName.trim()) {
            newErrors.fullName = 'ФИО обязательно для заполнения';
        }
        
        if (!formData.address.trim()) {
            newErrors.address = 'Адрес обязателен для заполнения';
        }
        
        if (formData.waterDebt < 0) {
            newErrors.waterDebt = 'Долг за воду не может быть отрицательным';
        }
        
        if (formData.garbageDebt < 0) {
            newErrors.garbageDebt = 'Долг за мусор не может быть отрицательным';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        
        try {
            const abonentData = {
                ...formData,
                waterDebt: Number(formData.waterDebt),
                garbageDebt: Number(formData.garbageDebt),
                balance: Number(formData.waterDebt) + Number(formData.garbageDebt)
            };
            
            if (abonent) {
                // Обновление существующего абонента
                await api.updateAbonent(abonent.id, abonentData);
            } else {
                // Создание нового абонента
                await api.createAbonent(abonentData);
            }
            
            onSave();
        } catch (error) {
            console.error('Ошибка при сохранении абонента:', error);
            setErrors({ submit: (error as Error).message });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Modal 
            title={abonent ? 'Редактировать абонента' : 'Добавить абонента'} 
            isOpen={isOpen} 
            onClose={onClose}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Основная информация */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* ФИО */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            ФИО *
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.fullName ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Введите ФИО"
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Телефон */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Телефон
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="+996 555 123 456"
                        />
                    </div>

                    {/* Адрес */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            Адрес *
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Введите адрес"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* Квартира */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Квартира
                        </label>
                        <input
                            type="text"
                            value={formData.apartment}
                            onChange={(e) => handleInputChange('apartment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1"
                        />
                    </div>
                </div>

                {/* Услуги и тарифы */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Услуги */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">
                            Услуги
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.waterService}
                                    onChange={(e) => handleInputChange('waterService', e.target.checked)}
                                    className="mr-2"
                                />
                                Вода
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.garbageService}
                                    onChange={(e) => handleInputChange('garbageService', e.target.checked)}
                                    className="mr-2"
                                />
                                Мусор
                            </label>
                        </div>
                    </div>

                    {/* Тариф на воду */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Тариф на воду
                        </label>
                        <select
                            value={formData.waterTariff}
                            onChange={(e) => handleInputChange('waterTariff', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={WaterTariffType.ByPerson}>По количеству людей</option>
                            <option value={WaterTariffType.ByMeter}>По счетчику</option>
                        </select>
                    </div>

                    {/* Статус */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Статус
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={AbonentStatus.Active}>Активный</option>
                            <option value={AbonentStatus.Disconnected}>Отключенный</option>
                            <option value={AbonentStatus.Archived}>Архивный</option>
                        </select>
                    </div>
                </div>

                {/* Показания счетчика (если выбран тариф по счетчику) */}
                {formData.waterTariff === WaterTariffType.ByMeter && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Предыдущие показания счетчика
                            </label>
                            <input
                                type="number"
                                value={formData.prevMeterReading || ''}
                                onChange={(e) => handleInputChange('prevMeterReading', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Текущие показания счетчика
                            </label>
                            <input
                                type="number"
                                value={formData.currentMeterReading || ''}
                                onChange={(e) => handleInputChange('currentMeterReading', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Расход (м³)
                            </label>
                            <input
                                type="number"
                                value={((Number(formData.currentMeterReading) || 0) - (Number(formData.prevMeterReading) || 0)) || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>
                )}

                {/* Долги */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Долг за воду */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Текущий долг за воду (сом)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.waterDebt}
                            onChange={(e) => handleInputChange('waterDebt', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.waterDebt ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                        />
                        {errors.waterDebt && (
                            <p className="text-red-500 text-sm mt-1">{errors.waterDebt}</p>
                        )}
                    </div>

                    {/* Долг за мусор */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Текущий долг за мусор (сом)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.garbageDebt}
                            onChange={(e) => handleInputChange('garbageDebt', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.garbageDebt ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                        />
                        {errors.garbageDebt && (
                            <p className="text-red-500 text-sm mt-1">{errors.garbageDebt}</p>
                        )}
                    </div>

                    {/* Пеня */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Пеня (%)
                        </label>
                        <select
                            value={formData.penaltyRate || '0'}
                            onChange={(e) => handleInputChange('penaltyRate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="0">Без пени</option>
                            <option value="1">1%</option>
                            <option value="2">2%</option>
                            <option value="3">3%</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                        </select>
                    </div>
                </div>

                {/* Огород и контролер */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Огород/участок */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Огород/участок
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.hasGarden}
                                    onChange={(e) => handleInputChange('hasGarden', e.target.checked)}
                                    className="mr-2"
                                />
                                Есть огород/участок
                            </label>
                            {formData.hasGarden && (
                                <div className="ml-6">
                                    <label className="block text-sm font-medium mb-1">
                                        Тариф за сотку (сом)
                                    </label>
                                    <select
                                        value={formData.gardenTariff || '0'}
                                        onChange={(e) => handleInputChange('gardenTariff', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="0">Выберите тариф</option>
                                        <option value="50">50 сом/сотка</option>
                                        <option value="75">75 сом/сотка</option>
                                        <option value="100">100 сом/сотка</option>
                                        <option value="150">150 сом/сотка</option>
                                        <option value="200">200 сом/сотка</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Контролер */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Контролер
                        </label>
                        <select
                            value={formData.controllerId}
                            onChange={(e) => handleInputChange('controllerId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Не назначен</option>
                            {controllers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Лицевой счет */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Лицевой счет
                        </label>
                        <input
                            type="text"
                            value={formData.personalAccount}
                            onChange={(e) => handleInputChange('personalAccount', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Л/С (автоматически)"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Лицевой счет будет автоматически сгенерирован
                        </p>
                    </div>
                </div>

                {/* Комментарий к долгу */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Комментарий к долгу
                    </label>
                    <textarea
                        value={formData.debtComment}
                        onChange={(e) => handleInputChange('debtComment', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Укажите причину изменения долга или обстоятельства..."
                    />
                </div>

                {/* Ошибка отправки */}
                {errors.submit && (
                    <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-red-700">{errors.submit}</p>
                    </div>
                )}

                {/* Кнопки */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Сохранение...' : (abonent ? 'Сохранить' : 'Добавить')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AbonentFormModal; 