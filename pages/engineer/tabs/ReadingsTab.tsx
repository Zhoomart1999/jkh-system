
import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from "../../../src/firebase/real-api"
import { Abonent, WaterTariffType } from '../../../types';
import { SaveIcon, EyeIcon, ClockIcon, TrendingUpIcon } from '../../../components/ui/Icons';
import { useNotifications } from '../../../context/NotificationContext';

interface MeterReading {
    id: string;
    abonentId: string;
    date: string;
    value: number;
    previousValue?: number;
    consumption?: number;
}

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const ReadingsTab: React.FC = () => {
    const { showNotification } = useNotifications();
    const [abonentsWithMeters, setAbonentsWithMeters] = useState<Abonent[]>([]);
    const [selectedAbonentId, setSelectedAbonentId] = useState<string>('');
    const [readingsHistory, setReadingsHistory] = useState<MeterReading[]>([]);
    const [newReading, setNewReading] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchAbonents = async () => {
            setLoading(true);
            try {
                const allAbonents = await api.getAbonents();
                const filtered = allAbonents.filter(a => a.waterTariff === WaterTariffType.ByMeter);
                setAbonentsWithMeters(filtered);
            } catch (error) {
                showNotification({
                    type: 'error',
                    title: 'Ошибка загрузки',
                    message: 'Не удалось загрузить абонентов со счетчиками'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAbonents();
    }, [showNotification]);

    useEffect(() => {
        if (selectedAbonentId) {
            const fetchHistory = async () => {
                setHistoryLoading(true);
                try {
                    // Создаем мок историю показаний
                    const mockHistory: MeterReading[] = [
                        {
                            id: '1',
                            abonentId: selectedAbonentId,
                            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                            value: 1250,
                            previousValue: 1200,
                            consumption: 50
                        },
                        {
                            id: '2',
                            abonentId: selectedAbonentId,
                            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                            value: 1200,
                            previousValue: 1150,
                            consumption: 50
                        }
                    ];
                    setReadingsHistory(mockHistory);
                } catch (error) {
                    showNotification({
                        type: 'error',
                        title: 'Ошибка загрузки',
                        message: 'Не удалось загрузить историю показаний'
                    });
                } finally {
                    setHistoryLoading(false);
                }
            };
            fetchHistory();
        } else {
            setReadingsHistory([]);
        }
    }, [selectedAbonentId, showNotification]);

    const handleSaveReading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAbonentId || !newReading) return;
        
        setIsSaving(true);
        try {
            const readingValue = parseFloat(newReading);
            const previousValue = readingsHistory[0]?.value || 0;
            const consumption = readingValue - previousValue;
            
            const savedReading: MeterReading = {
                id: Date.now().toString(),
                abonentId: selectedAbonentId,
                date: new Date().toISOString(),
                value: readingValue,
                previousValue,
                consumption
            };
            
            setReadingsHistory([savedReading, ...readingsHistory]);
            setNewReading('');
            
            // Обновляем абонента с новыми показаниями
            const selectedAbonent = abonentsWithMeters.find(a => a.id === selectedAbonentId);
            if (selectedAbonent) {
                await api.updateAbonent(selectedAbonentId, {
                    currentMeterReading: readingValue,
                    prevMeterReading: previousValue
                });
            }
            
            showNotification({
                type: 'success',
                title: 'Показание сохранено',
                message: `Показание ${readingValue} м³ успешно сохранено! Потребление: ${consumption} м³`
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка',
                message: 'Не удалось сохранить показание'
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    const selectedAbonent = abonentsWithMeters.find(a => a.id === selectedAbonentId);
    const lastReading = readingsHistory[0]?.value;
    const previousReading = readingsHistory[0]?.previousValue || 0;
    const consumption = lastReading ? lastReading - previousReading : 0;

    return (
        <Card>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Показания счетчиков</h2>
                <p className="text-gray-600">Внесение и просмотр показаний водомеров абонентов</p>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка абонентов...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Левая панель - Ввод показаний */}
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">➕ Внести новое показание</h3>
                            
                            <form onSubmit={handleSaveReading} className="space-y-4">
                                <div>
                                    <label htmlFor="abonent-select" className="block text-sm font-medium text-gray-700 mb-2">
                                        Выберите абонента
                                    </label>
                                    <select 
                                        id="abonent-select"
                                        value={selectedAbonentId}
                                        onChange={e => setSelectedAbonentId(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        <option value="">-- Выберите абонента --</option>
                                        {abonentsWithMeters.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.fullName} - {a.address}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedAbonent && (
                                    <div className="bg-white p-4 rounded-lg border">
                                        <h4 className="font-medium text-gray-900 mb-2">Информация об абоненте:</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">ФИО:</span>
                                                <p className="font-medium">{selectedAbonent.fullName}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Адрес:</span>
                                                <p className="font-medium">{selectedAbonent.address}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Лицевой счет:</span>
                                                <p className="font-medium">{selectedAbonent.personalAccount}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Последнее показание:</span>
                                                <p className="font-medium">{lastReading || 'Нет данных'} м³</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label htmlFor="new-reading" className="block text-sm font-medium text-gray-700 mb-2">
                                        Новое показание (м³)
                                    </label>
                                    <input
                                        id="new-reading"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={newReading}
                                        onChange={e => setNewReading(e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Введите показание счетчика"
                                        required
                                    />
                                </div>

                                {newReading && lastReading && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-center text-green-800">
                                            <TrendingUpIcon className="w-5 h-5 mr-2" />
                                            <span className="font-medium">
                                                Потребление: {parseFloat(newReading) - lastReading} м³
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!selectedAbonentId || !newReading || isSaving}
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Сохранение...
                                        </>
                                    ) : (
                                        <>
                                            <SaveIcon className="w-5 h-5 mr-2" />
                                            Сохранить показание
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Правая панель - История показаний */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">📈 История показаний</h3>
                            
                            {!selectedAbonentId ? (
                                <div className="text-center py-8 text-gray-500">
                                    <EyeIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>Выберите абонента для просмотра истории</p>
                                </div>
                            ) : historyLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Загрузка истории...</p>
                                </div>
                            ) : readingsHistory.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>История показаний пуста</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {readingsHistory.map((reading, index) => (
                                        <div key={reading.id} className="bg-white p-3 rounded-lg border">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {formatDate(reading.date)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Показание: {reading.value} м³
                                                    </p>
                                                    {reading.consumption && (
                                                        <p className="text-sm text-green-600">
                                                            Потребление: {reading.consumption} м³
                                                        </p>
                                                    )}
                                                </div>
                                                {index === 0 && (
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        Последнее
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Статистика */}
                        {selectedAbonent && lastReading && (
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium text-gray-900 mb-3">📊 Статистика</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">{lastReading}</p>
                                        <p className="text-sm text-gray-600">Текущее показание (м³)</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-green-600">{consumption}</p>
                                        <p className="text-sm text-gray-600">Потребление (м³)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};

export default ReadingsTab;
