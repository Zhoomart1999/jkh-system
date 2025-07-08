
import React, { useState, useEffect, useContext } from 'react';
import Card from '../../components/ui/Card';
import { api } from '../../services/api';
import { MeterReading, WaterTariffType } from '../../types';
import { PortalAuthContext } from '../../context/PortalAuthContext';
import { SaveIcon } from '../../components/ui/Icons';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const PortalReadingsPage: React.FC = () => {
    const auth = useContext(PortalAuthContext);
    const [readingsHistory, setReadingsHistory] = useState<MeterReading[]>([]);
    const [newReading, setNewReading] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const usesMeter = auth?.abonent?.waterTariff === WaterTariffType.ByMeter;

    const fetchHistory = async () => {
        if (auth?.abonent && usesMeter) {
            setLoading(true);
            try {
                const history = await api.getMeterReadings(auth.abonent.id);
                setReadingsHistory(history);
            } catch (error) {
                console.error("Failed to fetch readings history", error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchHistory();
    }, [auth?.abonent]);


    const handleSaveReading = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth?.abonent || !newReading) return;
        
        setIsSaving(true);
        setMessage(null);
        try {
            const readingValue = parseFloat(newReading);
            await api.addMeterReadingByAbonent(auth.abonent.id, readingValue);
            setNewReading('');
            setMessage({type: 'success', text: `Показание ${readingValue} успешно передано!`});
            fetchHistory(); // Refresh history
        } catch (error) {
            console.error("Failed to save reading", error);
            setMessage({type: 'error', text: 'Ошибка при сохранении показания.'});
        } finally {
            setIsSaving(false);
        }
    };
    
    const lastReading = readingsHistory[0]?.value;

    if (!usesMeter) {
        return (
            <Card>
                <h1 className="text-xl font-bold mb-4">Передача показаний</h1>
                <p>Вы используете тариф по норме на человека. Передача показаний счетчика не требуется.</p>
            </Card>
        );
    }
    
    return (
        <Card>
            <h1 className="text-xl font-bold mb-4">Передача показаний</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <form onSubmit={handleSaveReading} className="mt-4 space-y-3 p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm">Последнее показание от {readingsHistory[0] ? formatDate(readingsHistory[0].date) : '-'}: <span className="font-bold">{lastReading ?? 'N/A'}</span></p>
                        <div>
                            <label htmlFor="new-reading" className="block text-sm font-medium text-slate-700">Новое показание</label>
                             <input
                                id="new-reading"
                                type="number"
                                step="0.01"
                                value={newReading}
                                onChange={e => setNewReading(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"
                                placeholder="Введите значение"
                            />
                        </div>
                        <button type="submit" disabled={isSaving} className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            <SaveIcon className="w-5 h-5 inline mr-2" />
                            {isSaving ? 'Отправка...' : 'Передать показание'}
                        </button>
                        {message && (
                            <p className={`text-sm text-center ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}
                    </form>
                </div>
                 <div>
                    <h3 className="font-semibold">История показаний</h3>
                    {loading ? <p>Загрузка истории...</p> : readingsHistory.length > 0 ? (
                         <div className="mt-2 border rounded-lg max-h-96 overflow-y-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 sticky top-0"><tr><th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Дата</th><th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Значение</th></tr></thead>
                                <tbody className="bg-white divide-y divide-slate-200">{readingsHistory.map(r => (<tr key={r.id}><td className="px-4 py-2 text-sm">{formatDate(r.date)}</td><td className="px-4 py-2 text-sm font-semibold">{r.value}</td></tr>))}</tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 mt-2">Нет истории показаний.</p>
                    )}
                </div>
             </div>
        </Card>
    );
};

export default PortalReadingsPage;