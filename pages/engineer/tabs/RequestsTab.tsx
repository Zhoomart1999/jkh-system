
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../../components/ui/Card';
import { api } from "../../../services/mock-api"
import { TechnicalRequest, RequestStatus, RequestStatusLabels, RequestType, RequestTypeLabels, User, Role, RequestPriority, RequestPriorityLabels, Abonent } from '../../../types';
import Pagination from '../../../components/ui/Pagination';
import WorkOrderModal from './WorkOrderModal';
import Modal from '../../../components/ui/Modal';
import { SaveIcon } from '../../../components/ui/Icons';

const ITEMS_PER_PAGE = 10;
const formatDate = (dateString: string) => new Date(dateString).toLocaleString('ru-RU');

const PriorityBadge: React.FC<{ priority: RequestPriority }> = ({ priority }) => {
    const priorityMap = {
        [RequestPriority.Normal]: { text: 'Обычный', color: 'bg-slate-100 text-slate-800' },
        [RequestPriority.High]: { text: 'Высокий', color: 'bg-yellow-100 text-yellow-800' },
        [RequestPriority.Critical]: { text: 'Критический', color: 'bg-red-100 text-red-800' },
    };
    if (priority === RequestPriority.Normal) return null;
    return <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${priorityMap[priority].color}`}>{priorityMap[priority].text}</span>;
};

const CreateRequestModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [formData, setFormData] = useState({ abonentId: '', type: RequestType.LeakReport, priority: RequestPriority.Normal, details: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        api.getAbonents().then(data => setAbonents(data.filter(a => a.status === 'active')));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.createTechnicalRequest(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Ошибка при создании заявки");
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <Modal title="Создать новую заявку" isOpen={true} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <select value={formData.abonentId} onChange={e => setFormData({...formData, abonentId: e.target.value})} required className="w-full px-3 py-2 border rounded-md">
                    <option value="">Выберите абонента</option>
                    {abonents.map(a => <option key={a.id} value={a.id}>{a.fullName} - {a.address}</option>)}
                </select>
                 <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as RequestType})} className="w-full px-3 py-2 border rounded-md">
                    {Object.values(RequestType).map(t => <option key={t} value={t}>{RequestTypeLabels[t]}</option>)}
                </select>
                 <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as RequestPriority})} className="w-full px-3 py-2 border rounded-md">
                    {Object.values(RequestPriority).map(p => <option key={p} value={p}>{RequestPriorityLabels[p]}</option>)}
                </select>
                <textarea value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} required placeholder="Детали заявки..." rows={4} className="w-full px-3 py-2 border rounded-md"/>
                <div className="flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded-lg">Отмена</button><button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300"><SaveIcon className="w-5 h-5 inline mr-2"/>{isSaving ? 'Сохранение...' : 'Создать'}</button></div>
            </form>
        </Modal>
    )
}

const RequestsTab: React.FC = () => {
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
            console.error("Failed to fetch data", error);
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
            const termMatch = req.abonentName.toLowerCase().includes(filters.term.toLowerCase()) ||
                              req.abonentAddress.toLowerCase().includes(filters.term.toLowerCase()) ||
                              req.details.toLowerCase().includes(filters.term.toLowerCase());
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
                                <tr key={req.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedRequest(req)}>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{formatDate(req.createdAt)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div>{req.abonentName}</div>
                                        <div className="text-xs text-slate-500" title={req.details}>{req.abonentAddress}</div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        {RequestTypeLabels[req.type]}
                                        <PriorityBadge priority={req.priority} />
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm">{req.assignedToName || 'Не назначен'}</td>
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <StatusBadge status={req.status} />
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