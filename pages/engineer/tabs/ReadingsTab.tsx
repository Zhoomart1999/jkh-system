
import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from '../../../services/api';
import { Abonent, MeterReading, WaterTariffType } from '../../../types';
import { SaveIcon } from '../../../components/ui/Icons';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const ReadingsTab: React.FC = () => {
    const [abonentsWithMeters, setAbonentsWithMeters] = useState<Abonent[]>([]);
    const [selectedAbonentId, setSelectedAbonentId] = useState<string>('');
    const [readingsHistory, setReadingsHistory] = useState<MeterReading[]>([]);
    const [newReading, setNewReading] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        const fetchAbonents = async () => {
            setLoading(true);
            try {
                const allAbonents = await api.getAbonents();
                const filtered = allAbonents.filter(a => a.waterTariff === WaterTariffType.ByMeter);
                setAbonentsWithMeters(filtered);
            } catch (error) {
                console.error("Failed to fetch abonents with meters", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAbonents();
    }, []);

    useEffect(() => {
        if (selectedAbonentId) {
            const fetchHistory = async () => {
                setHistoryLoading(true);
                setMessage(null);
                try {
                    const history = await api.getMeterReadings(selectedAbonentId);
                    setReadingsHistory(history);
                } catch (error) {
                    console.error("Failed to fetch readings history", error);
                } finally {
                    setHistoryLoading(false);
                }
            };
            fetchHistory();
        } else {
            setReadingsHistory([]);
        }
    }, [selectedAbonentId]);

    const handleSaveReading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAbonentId || !newReading) return;
        
        setIsSaving(true);
        setMessage(null);
        try {
            const readingValue = parseFloat(newReading);
            const savedReading = await api.addMeterReading({
                abonentId: selectedAbonentId,
                date: new Date().toISOString(),
                value: readingValue
            });
            setReadingsHistory([savedReading, ...readingsHistory]);
            setNewReading('');
            setMessage({type: 'success', text: `Показание ${readingValue} успешно сохранено!`});
        } catch (error) {
            console.error("Failed to save reading", error);
            setMessage({type: 'error', text: 'Ошибка при сохранении показания.'});
        } finally {
            setIsSaving(false);
        }
    };
    
    const lastReading = readingsHistory[0]?.value;

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">Внесение показаний счетчиков</h2>
            {loading ? <p>Загрузка абонентов...</p> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="abonent-select" className="block text-sm font-medium text-slate-700 mb-1">Выберите абонента</label>
                        <select 
                            id="abonent-select"
                            value={selectedAbonentId}
                            onChange={e => setSelectedAbonentId(e.target.value)}
                            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                            <option value="">-- Не выбрано --</option>
                            {abonentsWithMeters.map(a => (
                                <option key={a.id} value={a.id}>{a.fullName} - {a.address}</option>
                            ))}
                        </select>
                        
                        {selectedAbonentId && (
                             <form onSubmit={handleSaveReading} className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg">
                                <p className="text-sm">Последнее показание: <span className="font-bold">{lastReading ?? 'N/A'}</span></p>
                                <div>
                                    <label htmlFor="new-reading" className="block text-sm font-medium text-slate-700">Новое показание</label>
                                     <input
                                        id="new-reading"
                                        type="number"
                                        step="0.01"
                                        value={newReading}
                                        onChange={e => setNewReading(e.target.value)}
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Введите значение"
                                    />
                                </div>
                                <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">
                                    <SaveIcon className="w-5 h-5"/>
                                    {isSaving ? 'Сохранение...' : 'Сохранить показание'}
                                </button>
                                {message && (
                                    <p className={`text-sm text-center ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {message.text}
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                     <div>
                        <h3 className="font-semibold">История показаний</h3>
                        {historyLoading ? <p>Загрузка истории...</p> : readingsHistory.length > 0 ? (
                             <div className="mt-2 border rounded-lg max-h-96 overflow-y-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Дата</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Значение</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {readingsHistory.map(r => (
                                            <tr key={r.id} className={`${r.isAbnormal ? 'bg-red-50' : ''} hover:bg-slate-50`}>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(r.date)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold">{r.value} {r.isAbnormal && <span className="text-red-600">(аномальное)</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 mt-2">{selectedAbonentId ? 'Нет истории показаний для этого абонента.' : 'Выберите абонента для просмотра истории.'}</p>
                        )}
                    </div>
                 </div>
            )}
        </Card>
    );
};

export default ReadingsTab;
