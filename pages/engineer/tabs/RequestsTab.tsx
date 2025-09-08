
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { api } from "../../../src/firebase/real-api"
import { TechnicalRequest, RequestStatus, RequestStatusLabels, RequestType, RequestTypeLabels, User, Role, RequestPriority, RequestPriorityLabels, Abonent } from '../../../types';
import Pagination from '../../../components/ui/Pagination';
import WorkOrderModal from './WorkOrderModal';
import { SaveIcon, PlusIcon, EyeIcon, ClockIcon, ExclamationTriangleIcon } from '../../../components/ui/Icons';
import { useNotifications } from '../../../context/NotificationContext';

// Простой Modal компонент
const SimpleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]}`}>
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

const ITEMS_PER_PAGE = 10;
const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ru-RU');

const PriorityBadge: React.FC<{ priority: RequestPriority }> = ({ priority }) => {
    const priorityMap = {
        [RequestPriority.Low]: { text: 'Низкий', color: 'bg-slate-100 text-slate-800' },
        [RequestPriority.Normal]: { text: 'Обычный', color: 'bg-slate-100 text-slate-800' },
        [RequestPriority.High]: { text: 'Высокий', color: 'bg-yellow-100 text-yellow-800' },
        [RequestPriority.Critical]: { text: 'Критический', color: 'bg-red-100 text-red-800' },
        [RequestPriority.Urgent]: { text: 'Срочный', color: 'bg-orange-100 text-orange-800' }
    };
    if (priority === RequestPriority.Normal) return null;
    return <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityMap[priority].color}`}>{priorityMap[priority].text}</span>;
};

const CreateRequestModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { showNotification } = useNotifications();
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [formData, setFormData] = useState({ 
        abonentId: '', 
        type: RequestType.LeakReport, 
        priority: RequestPriority.Normal, 
        details: '' 
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.getAbonents().then(data => setAbonents(data.filter(a => a.status === 'active')));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.abonentId || !formData.details.trim()) {
            showNotification({
                type: 'warning',
                title: 'Внимание',
                message: 'Заполните все обязательные поля'
            });
            return;
        }

        setIsSaving(true);
        try {
            await api.createTechnicalRequest({
                abonentId: formData.abonentId,
                type: formData.type,
                status: RequestStatus.Pending,
                priority: formData.priority,
                description: formData.details
            });
            
            showNotification({
                type: 'success',
                title: 'Заявка создана',
                message: 'Техническая заявка успешно создана'
            });
            onClose();
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка создания',
                message: 'Ошибка при создании заявки'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const selectedAbonent = abonents.find(a => a.id === formData.abonentId);

    return (
        <SimpleModal isOpen={true} onClose={onClose} title="Создать новую заявку" size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Выбор абонента */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Выберите абонента *
                    </label>
                    <select 
                        value={formData.abonentId} 
                        onChange={e => setFormData({...formData, abonentId: e.target.value})} 
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">-- Выберите абонента --</option>
                        {abonents.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.fullName} - {a.address}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Информация об абоненте */}
                {selectedAbonent && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Информация об абоненте:</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-blue-700">ФИО:</span>
                                <p className="font-medium">{selectedAbonent.fullName}</p>
                            </div>
                            <div>
                                <span className="text-blue-700">Адрес:</span>
                                <p className="font-medium">{selectedAbonent.address}</p>
                            </div>
                            <div>
                                <span className="text-blue-700">Лицевой счет:</span>
                                <p className="font-medium">{selectedAbonent.personalAccount}</p>
                            </div>
                            <div>
                                <span className="text-blue-700">Телефон:</span>
                                <p className="font-medium">{selectedAbonent.phone || 'Не указан'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Тип заявки */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Тип заявки
                    </label>
                    <select 
                        value={formData.type} 
                        onChange={e => setFormData({...formData, type: e.target.value as RequestType})} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Object.values(RequestType).map(t => (
                            <option key={t} value={t}>{RequestTypeLabels[t]}</option>
                        ))}
                    </select>
                </div>

                {/* Приоритет */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Приоритет
                    </label>
                    <select 
                        value={formData.priority} 
                        onChange={e => setFormData({...formData, priority: e.target.value as RequestPriority})} 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Object.values(RequestPriority).map(p => (
                            <option key={p} value={p}>{RequestPriorityLabels[p]}</option>
                        ))}
                    </select>
                </div>

                {/* Описание проблемы */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Описание проблемы *
                    </label>
                    <textarea 
                        value={formData.details} 
                        onChange={e => setFormData({...formData, details: e.target.value})} 
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Опишите проблему подробно..."
                    />
                </div>

                {/* Кнопки */}
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                    >
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Создание...
                            </>
                        ) : (
                            <>
                                <SaveIcon className="w-5 h-5 mr-2" />
                                Создать заявку
                            </>
                        )}
                    </button>
                </div>
            </form>
        </SimpleModal>
    );
};

const RequestsTab: React.FC = () => {
    const { showNotification } = useNotifications();
    const [requests, setRequests] = useState<TechnicalRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRequest, setSelectedRequest] = useState<TechnicalRequest | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        term: '',
        status: 'all',
        priority: 'all',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [requestsData, usersData] = await Promise.all([
                api.getTechnicalRequests(),
                api.getUsers()
            ]);
            setRequests(requestsData);
            setUsers(usersData.filter(u => u.role === Role.Engineer || u.role === Role.Controller));
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка загрузки',
                message: 'Не удалось загрузить заявки'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleModalClose = () => {
        setSelectedRequest(null);
        fetchData();
    };

    const handleCreateModalClose = () => {
        setIsCreateModalOpen(false);
        fetchData();
    }
    
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const termMatch = (req.abonentName || '').toLowerCase().includes(filters.term.toLowerCase()) ||
                              (req.abonentAddress || '').toLowerCase().includes(filters.term.toLowerCase()) ||
                              (req.description || '').toLowerCase().includes(filters.term.toLowerCase());
            const statusMatch = filters.status === 'all' || req.status === filters.status;
            const priorityMatch = filters.priority === 'all' || req.priority === filters.priority;
            return termMatch && statusMatch && priorityMatch;
        });
    }, [requests, filters]);

    const paginatedRequests = useMemo(() => {
        return filteredRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    }, [filteredRequests, currentPage]);
    
    const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        let colorClasses = "";
        switch (status) {
            case RequestStatus.New: colorClasses = "bg-blue-100 text-blue-800"; break;
            case RequestStatus.InProgress: colorClasses = "bg-amber-100 text-amber-800"; break;
            case RequestStatus.Resolved: colorClasses = "bg-emerald-100 text-emerald-800"; break;
            case RequestStatus.Cancelled: colorClasses = "bg-slate-100 text-slate-800"; break;
        }
        return <span className={`${baseClasses} ${colorClasses}`}>{RequestStatusLabels[status]}</span>;
    };

    return (
        <Card>
            <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">Технические заявки / Рабочие наряды</h2>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Создать заявку
                    </button>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Поиск по абоненту, адресу, деталям..." value={filters.term} onChange={e => setFilters({...filters, term: e.target.value})} className="md:col-span-3 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md">
                    <option value="all">Все статусы</option>
                    {Object.values(RequestStatus).map(s => <option key={s} value={s}>{RequestStatusLabels[s]}</option>)}
                </select>
                <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} className="block w-full px-3 py-2 border border-slate-300 rounded-md">
                    <option value="all">Все приоритеты</option>
                     {Object.values(RequestPriority).map(p => <option key={p} value={p}>{RequestPriorityLabels[p]}</option>)}
                </select>
            </div>
            {loading ? <p>Загрузка заявок...</p> : (
                <>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Дата</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Абонент</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Тип заявки / Приоритет</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Исполнитель</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Статус</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {paginatedRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900">{formatDate(req.createdAt)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <div>
                                            <div className="font-medium text-slate-900">{req.abonentName || 'Не указано'}</div>
                                            <div className="text-slate-500">{req.abonentAddress || 'Не указано'}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <div className="flex items-center">
                                            <span>{RequestTypeLabels[req.type]}</span>
                                            <PriorityBadge priority={req.priority} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                                        {req.assignedToId ? 'Назначен' : 'Не назначен'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setSelectedRequest(req)} className="text-blue-600 hover:text-blue-900">Просмотр</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredRequests.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={setCurrentPage}
                />
                </>
            )}
            {selectedRequest && <WorkOrderModal request={selectedRequest} users={users} onClose={handleModalClose}/>}
            {isCreateModalOpen && <CreateRequestModal onClose={handleCreateModalClose} />}
        </Card>
    );
};

export default RequestsTab;