
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/Pagination';
import { api } from "../../../services/mock-api"
import { FuelLog } from '../../../types';
import { EditIcon, TrashIcon, SaveIcon } from '../../../components/ui/Icons';

const ITEMS_PER_PAGE = 10;
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} сом`;

interface FuelFormModalProps {
    log: FuelLog | null;
    onSave: () => void;
    onClose: () => void;
}

const FuelFormModal: React.FC<FuelFormModalProps> = ({ log, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        date: log?.date ? log.date.split('T')[0] : new Date().toISOString().split('T')[0],
        truckId: log?.truckId || '',
        driverName: log?.driverName || '',
        liters: log?.liters || 0,
        cost: log?.cost || 0,
        route: log?.route || '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (log) {
                await api.updateFuelLog({ ...log, ...formData });
            } else {
                await api.addFuelLog(formData);
            }
            onSave();
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Modal title={log ? "Редактировать запись ГСМ" : "Добавить запись ГСМ"} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Дата</label>
                        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Гос. номер транспорта</label>
                        <input type="text" value={formData.truckId} onChange={e => setFormData({...formData, truckId: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="KG 01 123 ABC"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">ФИО Водителя</label>
                        <input type="text" value={formData.driverName} onChange={e => setFormData({...formData, driverName: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Маршрут</label>
                        <input type="text" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Центр"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Литры</label>
                        <input type="number" step="0.1" value={formData.liters} onChange={e => setFormData({...formData, liters: Number(e.target.value)})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Стоимость (сом)</label>
                        <input type="number" step="0.01" value={formData.cost} onChange={e => setFormData({...formData, cost: Number(e.target.value)})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors flex items-center justify-center gap-2">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300"><SaveIcon className="w-5 h-5"/>{isSaving ? 'Сохранение...' : 'Сохранить'}</button>
                </div>
            </form>
        </Modal>
    );
};

const FuelTab: React.FC = () => {
    const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<FuelLog | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getFuelLogs();
            setFuelLogs(data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = () => {
        fetchData();
        setIsModalOpen(false);
        setEditingLog(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Удалить эту запись о расходе топлива?")) {
            await api.deleteFuelLog(id);
            fetchData();
        }
    };

    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return fuelLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [fuelLogs, currentPage]);

    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-xl font-semibold">Учет расходов на ГСМ</h2>
                    <p className="text-sm text-slate-500">Добавляйте и отслеживайте расходы на топливо для транспорта.</p>
                </div>
                <button onClick={() => { setEditingLog(null); setIsModalOpen(true); }} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300">Добавить запись</button>
            </div>
            {loading ? <p>Загрузка...</p> : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Транспорт</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Водитель</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Литры</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Стоимость</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Маршрут</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Действия</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-slate-200">
                             {paginatedLogs.map(log => (
                                 <tr key={log.id} className="hover:bg-slate-50">
                                     <td className="px-4 py-4 text-sm">{formatDate(log.date)}</td>
                                     <td className="px-4 py-4 text-sm font-medium">{log.truckId}</td>
                                     <td className="px-4 py-4 text-sm">{log.driverName}</td>
                                     <td className="px-4 py-4 text-sm">{log.liters} л.</td>
                                     <td className="px-4 py-4 text-sm font-semibold text-red-600">{formatCurrency(log.cost)}</td>
                                     <td className="px-4 py-4 text-sm">{log.route}</td>
                                     <td className="px-4 py-4 text-right">
                                         <button onClick={() => {setEditingLog(log); setIsModalOpen(true);}} className="p-1 text-slate-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                         <button onClick={() => handleDelete(log.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                    </table>
                </div>
                 <Pagination currentPage={currentPage} totalItems={fuelLogs.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCurrentPage} />
                </>
            )}
            {isModalOpen && <FuelFormModal log={editingLog} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </Card>
    );
};

export default FuelTab;