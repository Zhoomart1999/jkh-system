
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { api } from "../../../src/firebase/real-api"
import { WaterQualitySample } from '../../../types';
// import Modal from '../../../components/ui/Modal';
import { SaveIcon } from '../../../components/ui/Icons';

// Простой Modal компонент
const SimpleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const WaterQualityFormModal: React.FC<{onSave: () => void, onClose: () => void}> = ({onSave, onClose}) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        location: '',
        ph: 7.0,
        chlorine: 0.3,
        turbidity: 0.5,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await api.addWaterQualitySample(formData);
        setIsSaving(false);
        onSave();
    };

    return (
        <SimpleModal
            isOpen={true}
            onClose={onClose}
            title="Добавить пробу воды"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="px-3 py-2 border border-slate-300 rounded-md"/>
                    <input type="text" placeholder="Точка отбора" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required className="px-3 py-2 border border-slate-300 rounded-md"/>
                    <input type="number" step="0.1" placeholder="pH" value={formData.ph} onChange={e => setFormData({...formData, ph: Number(e.target.value)})} required className="px-3 py-2 border border-slate-300 rounded-md"/>
                    <input type="number" step="0.01" placeholder="Хлор" value={formData.chlorine} onChange={e => setFormData({...formData, chlorine: Number(e.target.value)})} required className="px-3 py-2 border border-slate-300 rounded-md"/>
                    <input type="number" step="0.01" placeholder="Мутность" value={formData.turbidity} onChange={e => setFormData({...formData, turbidity: Number(e.target.value)})} required className="px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg"><SaveIcon className="w-5 h-5 inline-block mr-2" />{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </form>
        </SimpleModal>
    )
}

const WaterQualityTab: React.FC = () => {
    const [samples, setSamples] = useState<WaterQualitySample[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = () => {
        setLoading(true);
        api.getWaterQualitySamples().then(data => {
            setSamples(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const isAbnormal = (sample: WaterQualitySample, key: keyof WaterQualitySample) => {
        const value = sample[key];
        if (typeof value !== 'number') return false;
        if (key === 'ph') return value < 6.5 || value > 8.5;
        if (key === 'chlorine') return value < 0.2 || value > 0.5;
        if (key === 'turbidity') return value >= 1.0;
        return false;
    };

    const handleSave = () => {
        setIsModalOpen(false);
        fetchData();
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Контроль качества воды</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">Добавить пробу</button>
            </div>
            {loading ? <p>Загрузка...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Точка отбора</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">pH</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Хлор (мг/л)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Мутность (NTU)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {samples.map(sample => (
                                <tr key={sample.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4">{formatDate(sample.date)}</td>
                                    <td className="px-4 py-4 font-medium">{sample.location}</td>
                                    <td className={`px-4 py-4 ${isAbnormal(sample, 'ph') ? 'text-red-600 font-bold' : ''}`}>{sample.ph.toFixed(1)}</td>
                                    <td className={`px-4 py-4 ${isAbnormal(sample, 'chlorine') ? 'text-red-600 font-bold' : ''}`}>{sample.chlorine.toFixed(2)}</td>
                                    <td className={`px-4 py-4 ${isAbnormal(sample, 'turbidity') ? 'text-red-600 font-bold' : ''}`}>{sample.turbidity.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <WaterQualityFormModal onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </Card>
    );
};

export default WaterQualityTab;