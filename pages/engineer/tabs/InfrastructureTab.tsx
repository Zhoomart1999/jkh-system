
import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import { api } from "../../../services/mock-api"
import { InfrastructureZone } from '../../../types';
import { MapPinIcon, SaveIcon } from '../../../components/ui/Icons';

const InfrastructureTab: React.FC = () => {
    const [zones, setZones] = useState<InfrastructureZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newZoneName, setNewZoneName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getInfrastructureZones();
            setZones(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (error) {
            console.error("Failed to fetch infrastructure zones:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddZone = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newZoneName.trim()) return;

        setIsSaving(true);
        try {
            await api.addInfrastructureZone(newZoneName);
            setNewZoneName('');
            setIsModalOpen(false);
            fetchData(); // Refresh the list
        } catch (error) {
            console.error("Failed to add zone:", error);
            alert("Не удалось добавить зону.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Управление инфраструктурой (Зоны)</h2>
                    <p className="text-sm text-slate-500">Добавляйте и просматривайте зоны обслуживания.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">Добавить зону</button>
            </div>

            {loading ? <p>Загрузка зон...</p> : (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {zones.map(zone => (
                        <div key={zone.id} className="p-4 bg-slate-50 rounded-lg flex items-center">
                            <MapPinIcon className="w-6 h-6 text-blue-500 mr-3" />
                            <span className="font-medium text-slate-800">{zone.name}</span>
                        </div>
                    ))}
                    {zones.length === 0 && <p className="text-slate-500 col-span-full">Нет созданных зон. Добавьте первую.</p>}
                </div>
            )}

            {isModalOpen && (
                <Modal title="Добавить новую зону" isOpen={true} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleAddZone} className="space-y-4">
                        <div>
                            <label htmlFor="zoneName" className="block text-sm font-medium text-slate-700">Название зоны</label>
                            <input
                                type="text"
                                id="zoneName"
                                value={newZoneName}
                                onChange={(e) => setNewZoneName(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Например, 'Центральный район'"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Отмена</button>
                            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">
                                <SaveIcon className="w-5 h-5" />
                                {isSaving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </Card>
    );
};

export default InfrastructureTab;
