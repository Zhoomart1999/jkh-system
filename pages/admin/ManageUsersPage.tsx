import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import { SaveIcon } from '../../components/ui/Icons';
import Pagination from '../../components/ui/Pagination';
import ToggleSwitch from '../../components/ui/ToggleSwitch';

const ITEMS_PER_PAGE = 5;

interface UserFormModalProps {
    user: User | null;
    onClose: () => void;
    onSave: (data: Omit<User, 'id'> | (Partial<User> & { id: string })) => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: user?.role || Role.Engineer,
        pin: '', // PIN is always empty on modal open for security
        isActive: user ? user.isActive : true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
     const handleStatusChange = (value: string) => {
        setFormData(prev => ({ ...prev, isActive: value === 'true' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (user) { // Editing existing user
            const dataToSave: Partial<User> & { id: string } = {
                id: user.id,
                name: formData.name,
                role: formData.role,
                isActive: formData.isActive,
            };
            if (formData.pin) { // Only include pin if it was changed
                dataToSave.pin = formData.pin;
            }
            await onSave(dataToSave);
        } else { // Adding new user
            const dataToSave: Omit<User, 'id'> = {
                name: formData.name,
                role: formData.role,
                pin: formData.pin,
                isActive: formData.isActive,
            };
            await onSave(dataToSave);
        }
        setIsSaving(false);
    };

    return (
        <Modal title={user ? 'Редактировать пользователя' : 'Добавить пользователя'} onClose={onClose} isOpen={true}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">ФИО</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">Роль</label>
                    <select name="role" id="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        {Object.values(Role).map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="pin" className="block text-sm font-medium text-slate-700">ПИН-код (8 цифр)</label>
                    <input 
                      type="password" // Use password type to mask input
                      name="pin" 
                      id="pin" 
                      value={formData.pin} 
                      onChange={handleChange} 
                      required={!user} // PIN is required only for new users
                      maxLength={8} 
                      pattern="\d{8}" 
                      placeholder={user ? "Оставьте пустым, чтобы не менять" : "••••••••"}
                      title="ПИН-код должен состоять из 8 цифр" 
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="isActive" className="block text-sm font-medium text-slate-700">Статус</label>
                    <select name="isActive" id="isActive" value={String(formData.isActive)} onChange={(e) => handleStatusChange(e.target.value)} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                       <option value="true">Активен</option>
                       <option value="false">Неактивен</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors">Отмена</button>
                    <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-300">
                        <SaveIcon className="w-5 h-5" />
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        const data = await api.getUsers();
        setUsers(data.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (user: User | null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };

    const handleSaveUser = async (user: Omit<User, 'id'> | (Partial<User> & { id: string })) => {
        if ('id' in user) {
            await api.updateUser(user.id, user);
        } else {
            await api.createUser(user);
        }
        await fetchUsers();
        handleCloseModal();
    };
    
    const handleToggleStatus = async (user: User) => {
        const updatedUser = { ...user, isActive: !user.isActive };
        await api.updateUser(user.id, updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.id === user.id ? updatedUser : u));
    }

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return users.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [users, currentPage]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-800">Управление пользователями</h1>
                <button 
                    onClick={() => handleOpenModal(null)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Добавить пользователя
                </button>
            </div>
            
            <Card>
                {loading ? <p>Загрузка пользователей...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Имя</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Роль</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ПИН</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Статус</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Действия</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 capitalize">{user.role}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono tracking-widest">••••••••</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <ToggleSwitch enabled={user.isActive} onChange={() => handleToggleStatus(user)} />
                                            <span className={`ml-3 ${user.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                                                {user.isActive ? 'Активен' : 'Неактивен'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenModal(user)} className="text-blue-600 hover:text-blue-900">Редактировать</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         <Pagination
                            currentPage={currentPage}
                            totalItems={users.length}
                            itemsPerPage={ITEMS_PER_PAGE}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <UserFormModal 
                    user={editingUser}
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default ManageUsersPage;