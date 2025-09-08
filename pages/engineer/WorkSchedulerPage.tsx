import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import Card from '../../components/ui/Card';
import { PlusIcon, TrashIcon, EditIcon, CheckIcon, ClockIcon, CalendarIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface ScheduledWork {
    id: string;
    title: string;
    description: string;
    type: 'maintenance' | 'repair' | 'inspection' | 'installation';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    startDate: string;
    endDate: string;
    location: string;
    assignedTo: string;
    estimatedHours: number;
    actualHours?: number;
    materials: string[];
    notes?: string;
}

const WorkSchedulerPage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [scheduledWorks, setScheduledWorks] = useState<ScheduledWork[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedWork, setSelectedWork] = useState<ScheduledWork | null>(null);
    const [processing, setProcessing] = useState(false);

    // Форма создания работы
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'maintenance' as ScheduledWork['type'],
        priority: 'medium' as ScheduledWork['priority'],
        startDate: '',
        endDate: '',
        location: '',
        assignedTo: '',
        estimatedHours: 1,
        materials: '',
        notes: ''
    });

    useEffect(() => {
        fetchScheduledWorks();
    }, []);

    const fetchScheduledWorks = async () => {
        try {
            // Имитация загрузки данных
            const mockWorks: ScheduledWork[] = [
                {
                    id: '1',
                    title: 'Плановый осмотр водопровода',
                    description: 'Осмотр магистрального водопровода на ул. Ленина',
                    type: 'inspection',
                    priority: 'medium',
                    status: 'scheduled',
                    startDate: '2025-01-15',
                    endDate: '2025-01-15',
                    location: 'ул. Ленина, 1-50',
                    assignedTo: 'Инженер Петров',
                    estimatedHours: 4,
                    materials: ['фонарик', 'инструменты'],
                    notes: 'Проверить состояние труб'
                },
                {
                    id: '2',
                    title: 'Ремонт насосной станции',
                    description: 'Замена насоса в насосной станции №2',
                    type: 'repair',
                    priority: 'high',
                    status: 'in_progress',
                    startDate: '2025-01-10',
                    endDate: '2025-01-12',
                    location: 'Насосная станция №2',
                    assignedTo: 'Инженер Сидоров',
                    estimatedHours: 16,
                    actualHours: 8,
                    materials: ['новый насос', 'уплотнители', 'инструменты'],
                    notes: 'Насос доставлен, начат монтаж'
                }
            ];
            setScheduledWorks(mockWorks);
        } catch (error) {
            console.error('Failed to fetch scheduled works:', error);
        } finally {
            setLoading(false);
        }
    };

    const createScheduledWork = async () => {
        if (!formData.title || !formData.startDate) return;

        setProcessing(true);
        try {
            const newWork: ScheduledWork = {
                id: Date.now().toString(),
                title: formData.title,
                description: formData.description,
                type: formData.type,
                priority: formData.priority,
                status: 'scheduled',
                startDate: formData.startDate,
                endDate: formData.endDate,
                location: formData.location,
                assignedTo: formData.assignedTo,
                estimatedHours: formData.estimatedHours,
                materials: formData.materials.split(',').map(m => m.trim()).filter(m => m),
                notes: formData.notes
            };

            setScheduledWorks([...scheduledWorks, newWork]);
            setShowCreateForm(false);
            setFormData({
                title: '',
                description: '',
                type: 'maintenance',
                priority: 'medium',
                startDate: '',
                endDate: '',
                location: '',
                assignedTo: '',
                estimatedHours: 1,
                materials: '',
                notes: ''
            });
            
            showNotification({
                type: 'success',
                title: 'Работа запланирована',
                message: 'Работа успешно запланирована!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка планирования',
                message: 'Ошибка при создании работы'
            });
        } finally {
            setProcessing(false);
        }
    };

    const updateWorkStatus = async (workId: string, status: ScheduledWork['status']) => {
        setProcessing(true);
        try {
            setScheduledWorks(works => 
                works.map(work => 
                    work.id === workId 
                        ? { ...work, status }
                        : work
                )
            );
            showNotification({
                type: 'success',
                title: 'Статус обновлен',
                message: 'Статус работы обновлен!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка обновления',
                message: 'Ошибка при обновлении статуса'
            });
        } finally {
            setProcessing(false);
        }
    };

    const deleteScheduledWork = async (workId: string) => {
        if (!confirm('Удалить запланированную работу?')) return;
        
        setProcessing(true);
        try {
            setScheduledWorks(works => works.filter(work => work.id !== workId));
            showNotification({
                type: 'success',
                title: 'Работа удалена',
                message: 'Работа удалена!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: 'Ошибка при удалении работы'
            });
        } finally {
            setProcessing(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'maintenance': return 'Обслуживание';
            case 'repair': return 'Ремонт';
            case 'inspection': return 'Осмотр';
            case 'installation': return 'Монтаж';
            default: return type;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Запланировано';
            case 'in_progress': return 'В работе';
            case 'completed': return 'Завершено';
            case 'cancelled': return 'Отменено';
            default: return status;
        }
    };

    const getUpcomingWorks = () => scheduledWorks.filter(w => 
        new Date(w.startDate) >= new Date() && w.status === 'scheduled'
    );
    const getInProgressWorks = () => scheduledWorks.filter(w => w.status === 'in_progress');
    const getCompletedWorks = () => scheduledWorks.filter(w => w.status === 'completed');

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Планировщик работ</h1>
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Загрузка данных...</p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Планировщик работ</h1>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CalendarIcon className="w-8 h-8 text-blue-500" />
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {getUpcomingWorks().length}
                                </div>
                                <div className="text-sm text-slate-600">Предстоящие работы</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="w-8 h-8 text-yellow-500" />
                            <div>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {getInProgressWorks().length}
                                </div>
                                <div className="text-sm text-slate-600">В работе</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <CheckIcon className="w-8 h-8 text-green-500" />
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {getCompletedWorks().length}
                                </div>
                                <div className="text-sm text-slate-600">Завершено</div>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="p-4">
                        <div className="flex items-center gap-3">
                            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {scheduledWorks.filter(w => w.priority === 'urgent').length}
                                </div>
                                <div className="text-sm text-slate-600">Срочные работы</div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Создание новой работы */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <CalendarIcon className="w-6 h-6 text-slate-500" />
                        <h3 className="text-lg font-semibold">Запланировать работу</h3>
                    </div>
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        {showCreateForm ? 'Отмена' : 'Новая работа'}
                    </button>
                </div>

                {showCreateForm && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Название работы
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Тип работы
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value as ScheduledWork['type']})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="maintenance">Обслуживание</option>
                                    <option value="repair">Ремонт</option>
                                    <option value="inspection">Осмотр</option>
                                    <option value="installation">Монтаж</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Описание
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Приоритет
                                </label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value as ScheduledWork['priority']})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                    <option value="urgent">Срочный</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Дата начала
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Дата окончания
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Место проведения
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Ответственный
                                </label>
                                <input
                                    type="text"
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({...formData, assignedTo: e.target.value})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Ожидаемые часы
                                </label>
                                <input
                                    type="number"
                                    value={formData.estimatedHours}
                                    onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Материалы (через запятую)
                                </label>
                                <input
                                    type="text"
                                    value={formData.materials}
                                    onChange={(e) => setFormData({...formData, materials: e.target.value})}
                                    placeholder="фонарик, инструменты, насос"
                                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Примечания
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                rows={2}
                                className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            onClick={createScheduledWork}
                            disabled={processing || !formData.title || !formData.startDate}
                            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300"
                        >
                            {processing ? 'Создание...' : 'Запланировать работу'}
                        </button>
                    </div>
                )}
            </Card>

            {/* Список работ */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <CalendarIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Запланированные работы</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Работа
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Тип
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Приоритет
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Статус
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Даты
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Ответственный
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {scheduledWorks.map((work) => (
                                <tr key={work.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{work.title}</div>
                                            <div className="text-sm text-slate-500">{work.location}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {getTypeLabel(work.type)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(work.priority)}`}>
                                            {work.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(work.status)}`}>
                                            {getStatusLabel(work.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        <div>{new Date(work.startDate).toLocaleDateString('ru-RU')}</div>
                                        {work.endDate !== work.startDate && (
                                            <div className="text-slate-500">до {new Date(work.endDate).toLocaleDateString('ru-RU')}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                        {work.assignedTo}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex gap-2">
                                            {work.status === 'scheduled' && (
                                                <button
                                                    onClick={() => updateWorkStatus(work.id, 'in_progress')}
                                                    disabled={processing}
                                                    className="bg-yellow-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-yellow-700 transition-colors disabled:bg-yellow-300"
                                                >
                                                    Начать
                                                </button>
                                            )}
                                            {work.status === 'in_progress' && (
                                                <button
                                                    onClick={() => updateWorkStatus(work.id, 'completed')}
                                                    disabled={processing}
                                                    className="bg-green-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:bg-green-300"
                                                >
                                                    Завершить
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteScheduledWork(work.id)}
                                                disabled={processing}
                                                className="bg-red-600 text-white font-semibold px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:bg-red-300"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {scheduledWorks.length === 0 && (
                    <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Нет запланированных работ</h3>
                        <p className="text-slate-500">Создайте первую запланированную работу</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default WorkSchedulerPage; 