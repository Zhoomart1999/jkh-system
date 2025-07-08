
import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from '../../../services/api';
import { InventoryItem } from '../../../types';
import { EditIcon, SaveIcon } from '../../../components/ui/Icons';
import Modal from '../../../components/ui/Modal';

interface FormModalProps {
    item: InventoryItem | null;
    onSave: () => void;
    onClose: () => void;
}

const InventoryFormModal: React.FC<FormModalProps> = ({ item, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        unit: item?.unit || 'шт.',
        quantity: item?.quantity || 0,
        lowStockThreshold: item?.lowStockThreshold || 10,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (item) {
                await api.updateInventoryItem({ ...item, ...formData });
            } else {
                await api.addInventoryItem(formData);
            }
            onSave();
        } catch (error) {
            console.error("Failed to save inventory item:", error);
            alert("Ошибка при сохранении данных.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal title={item ? `Редактировать: ${item.name}` : "Добавить на склад"} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Наименование</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={!!item} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm disabled:bg-slate-100" />
                </div>
                 <div>
                    <label className="block text-sm font-medium">Ед. измерения</label>
                    <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required disabled={!!item} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm disabled:bg-slate-100" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Количество</label>
                    <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium">Минимальный остаток</label>
                    <input type="number" value={formData.lowStockThreshold} onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300">Отмена</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        <SaveIcon className="w-5 h-5 inline-block mr-2" />
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const InventoryTab: React.FC = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getInventory();
            setInventory(data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = () => {
        fetchData();
        setEditingItem(null);
        setIsModalOpen(false);
    };
    
    const handleOpenModal = (item: InventoryItem | null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Складские запасы</h2>
                <button onClick={() => handleOpenModal(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Добавить наименование
                </button>
            </div>
            {loading ? <p>Загрузка...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Наименование</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Количество</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ед. изм.</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Мин. остаток</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {inventory.map(item => (
                                <tr key={item.id} className={item.quantity <= item.lowStockThreshold ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}>
                                    <td className="px-4 py-4 font-medium">{item.name}</td>
                                    <td className={`px-4 py-4 font-bold ${item.quantity <= item.lowStockThreshold ? 'text-red-600' : ''}`}>
                                        {item.quantity}
                                        {item.quantity <= item.lowStockThreshold && ' (Мало!)'}
                                    </td>
                                    <td className="px-4 py-4">{item.unit}</td>
                                    <td className="px-4 py-4">{item.lowStockThreshold}</td>
                                    <td className="px-4 py-4 text-right">
                                        <button onClick={() => handleOpenModal(item)} className="p-1 text-slate-500 hover:text-blue-600">
                                            <EditIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <InventoryFormModal item={editingItem} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
        </Card>
    );
};

export default InventoryTab;