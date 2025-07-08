import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Tariffs } from '../../types';
import Card from '../../components/ui/Card';
import { SaveIcon } from '../../components/ui/Icons';

const TariffInput: React.FC<{ label: string; value: number; name: keyof Omit<Tariffs, 'waterForGarden' | 'penaltyRatePercent'> | 'penaltyRatePercent'; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit: string }> = ({ label, value, name, onChange, unit }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-slate-300 rounded-md"
                step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-500 sm:text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

const TariffsPage: React.FC = () => {
    const [tariffs, setTariffs] = useState<Tariffs | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchTariffs = async () => {
            setLoading(true);
            const data = await api.getTariffs();
            setTariffs(data);
            setLoading(false);
        };
        fetchTariffs();
    }, []);
    
    const calculateFinalValue = (base: number, tax: number) => {
        return (base * (1 + tax / 100)).toFixed(2);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!tariffs) return;
        const { name, value } = e.target;
        setTariffs({ ...tariffs, [name as keyof Omit<Tariffs, 'waterForGarden'>]: parseFloat(value) || 0 });
    };

    const handleGardenTariffChange = (size: string, value: string) => {
        if (!tariffs) return;
        setTariffs({
            ...tariffs,
            waterForGarden: {
                ...tariffs.waterForGarden,
                [size]: parseFloat(value) || 0,
            },
        });
    };

    const handleSave = async () => {
        if (!tariffs) return;
        setIsSaving(true);
        setSaveMessage(null);
        try {
            if ((tariffs as any).id) {
                await api.updateTariff((tariffs as any).id, tariffs);
            } else {
                await api.createTariff(tariffs);
            }
            setSaveMessage("Тарифы успешно обновлены!");
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error("Failed to save tariffs:", error);
            setSaveMessage("Ошибка при сохранении тарифов.");
             setTimeout(() => setSaveMessage(null), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <p>Загрузка тарифов...</p>;
    if (!tariffs) return <p>Не удалось загрузить тарифы.</p>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800">Управление тарифами</h1>
            
            <Card>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-900">Тарифы на воду</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TariffInput label="Вода по счетчику (базовый)" value={tariffs.waterByMeter} name="waterByMeter" onChange={handleChange} unit="сом/м³" />
                            <div className="p-4 bg-slate-50 rounded-md">
                                <p className="text-sm text-slate-500">Итоговая цена (с НсП {tariffs.salesTaxPercent}%)</p>
                                <p className="text-lg font-bold text-blue-600">{calculateFinalValue(tariffs.waterByMeter, tariffs.salesTaxPercent)} сом/м³</p>
                            </div>
                            <TariffInput label="Вода на человека (базовый)" value={tariffs.waterByPerson} name="waterByPerson" onChange={handleChange} unit="сом/чел" />
                             <div className="p-4 bg-slate-50 rounded-md">
                                <p className="text-sm text-slate-500">Итоговая цена (с НсП {tariffs.salesTaxPercent}%)</p>
                                <p className="text-lg font-bold text-blue-600">{calculateFinalValue(tariffs.waterByPerson, tariffs.salesTaxPercent)} сом/чел</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-semibold text-slate-900">Тарифы на вывоз мусора</h2>
                         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TariffInput label="Частный сектор (базовый)" value={tariffs.garbagePrivate} name="garbagePrivate" onChange={handleChange} unit="сом/чел" />
                             <div className="p-4 bg-slate-50 rounded-md">
                                <p className="text-sm text-slate-500">Итоговая цена (с НсП {tariffs.salesTaxPercent}%)</p>
                                <p className="text-lg font-bold text-blue-600">{calculateFinalValue(tariffs.garbagePrivate, tariffs.salesTaxPercent)} сом/чел</p>
                            </div>
                            <TariffInput label="Многоквартирный дом (базовый)" value={tariffs.garbageApartment} name="garbageApartment" onChange={handleChange} unit="сом/чел" />
                             <div className="p-4 bg-slate-50 rounded-md">
                                <p className="text-sm text-slate-500">Итоговая цена (с НсП {tariffs.salesTaxPercent}%)</p>
                                <p className="text-lg font-bold text-blue-600">{calculateFinalValue(tariffs.garbageApartment, tariffs.salesTaxPercent)} сом/чел</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-semibold text-slate-900">Тарифы на воду для полива (годовая ставка)</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(tariffs.waterForGarden).sort((a,b) => Number(b[0]) - Number(a[0])).map(([size, rate]) => (
                                <div key={size}>
                                    <label htmlFor={`garden-${size}`} className="block text-sm font-medium text-slate-700">{`Участок ${size} сотки`}</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <input
                                            type="number"
                                            name={size}
                                            id={`garden-${size}`}
                                            value={rate}
                                            onChange={(e) => handleGardenTariffChange(e.target.name, e.target.value)}
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-16 sm:text-sm border-slate-300 rounded-md"
                                            step="0.1"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 sm:text-sm">сом/год</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                     <div className="border-t border-slate-200 pt-6">
                        <h2 className="text-xl font-semibold text-slate-900">Налоги и Штрафы</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TariffInput label="Налог с продаж (НсП)" value={tariffs.salesTaxPercent} name="salesTaxPercent" onChange={handleChange} unit="%" />
                            <TariffInput label="Пеня за просрочку (в день)" value={tariffs.penaltyRatePercent} name="penaltyRatePercent" onChange={handleChange} unit="%" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 items-center gap-4">
                         {saveMessage && (
                            <span className="text-sm text-emerald-600 transition-opacity duration-300">
                                {saveMessage}
                            </span>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2">
                            <SaveIcon className="w-5 h-5" />
                            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TariffsPage;