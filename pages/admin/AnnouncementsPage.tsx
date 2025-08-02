
import React, { useState, useEffect } from 'react';
import { api } from "../../services/mock-api"
import { Announcement } from '../../types';
import Card from '../../components/ui/Card';
import Modal, { ConfirmationModal } from '../../components/ui/Modal';
import { SaveIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';
import ToggleSwitch from '../../components/ui/ToggleSwitch';

interface FormModalProps {
    announcement: Announcement | null;
    onSave: (data: any) => void;
    onClose: () => void;
}

const AnnouncementFormModal: React.FC<FormModalProps> = ({ announcement, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: announcement?.title || '',
        content: announcement?.content || '',
        isActive: announcement ? announcement.isActive : true,
        notifySubscribers: announcement?.notifySubscribers || false,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (announcement) {
            await onSave({ ...announcement, ...formData });
        } else {
            await onSave(formData);
        }
        setIsSaving(false);
    };

    return (
        <Modal title={announcement ? 'Редактировать объявление' : 'Создать объявление'} isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Заголовок</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Содержание</label>
                    <textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" rows={4}></textarea>
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Сделать активным</label>
                        <ToggleSwitch enabled={formData.isActive} onChange={val => setFormData({...formData, isActive: val})} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Уведомить абонентов по СМС</label>
                        <ToggleSwitch enabled={formData.notifySubscribers} onChange={val => setFormData({...formData, notifySubscribers: val})} />
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

const AnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (data: Announcement | Omit<Announcement, 'id' | 'createdAt'>) => {
        if ('id' in data) {
            await api.updateAnnouncement(data);
        } else {
            await api.addAnnouncement(data);
        }
        fetchData();
        setIsModalOpen(false);
        setEditingAnnouncement(null);
    };

    const handleDeleteConfirm = async () => {
        if (deletingId) {
            await api.deleteAnnouncement(deletingId);
            setDeletingId(null);
            fetchData();
        }
    };

    const handleToggleActive = async (announcement: Announcement) => {
        await api.updateAnnouncement({ ...announcement, isActive: !announcement.isActive });
        fetchData();
    };

    return (
        <div className="space-y-6">
            <ConfirmationModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDeleteConfirm}
                title="Подтверждение удаления"
                message="Вы уверены, что хотите удалить это объявление?"
                confirmText="Удалить"
            />
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Управление объявлениями</h1>
                <button 
                    onClick={() => { setEditingAnnouncement(null); setIsModalOpen(true); }}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Создать объявление
                </button>
            </div>
            
            <Card>
                {loading ? <p>Загрузка...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Заголовок</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Статус</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата создания</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Действия</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {announcements.map((ann) => (
                                    <tr key={ann.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{ann.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <ToggleSwitch enabled={ann.isActive} onChange={() => handleToggleActive(ann)} />
                                            <span className={`ml-3 text-sm ${ann.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {ann.isActive ? 'Активно' : 'Неактивно'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(ann.createdAt).toLocaleDateString('ru-RU')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                            <button onClick={() => { setEditingAnnouncement(ann); setIsModalOpen(true); }} className="p-1 text-slate-500 hover:text-blue-600"><EditIcon className="w-5 h-5"/></button>
                                            <button onClick={() => setDeletingId(ann.id)} className="p-1 text-slate-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <AnnouncementFormModal
                    announcement={editingAnnouncement}
                    onSave={handleSave}
                    onClose={() => { setEditingAnnouncement(null); setIsModalOpen(false); }}
                />
            )}
        </div>
    );
};

export default AnnouncementsPage;