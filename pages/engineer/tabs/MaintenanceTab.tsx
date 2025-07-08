import React, { useState, useEffect } from 'react';
import Card from '../../../components/ui/Card';
import { api } from '../../../services/api';
import { PlannedMaintenanceTask, MaintenanceStatus } from '../../../types';

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('ru-RU');

const StatusBadge: React.FC<{ status: MaintenanceStatus }> = ({ status }) => {
    const statusMap = {
        [MaintenanceStatus.Planned]: { text: 'Запланировано', color: 'bg-blue-100 text-blue-800' },
        [MaintenanceStatus.InProgress]: { text: 'В работе', color: 'bg-yellow-100 text-yellow-800' },
        [MaintenanceStatus.Completed]: { text: 'Выполнено', color: 'bg-emerald-100 text-emerald-800' },
        [MaintenanceStatus.Overdue]: { text: 'Просрочено', color: 'bg-red-100 text-red-800' },
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusMap[status].color}`}>{statusMap[status].text}</span>;
};

const MaintenanceTab: React.FC = () => {
    const [tasks, setTasks] = useState<PlannedMaintenanceTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getMaintenanceTasks().then(data => {
            setTasks(data);
            setLoading(false);
        });
    }, []);

    const handleUpdateStatus = async (task: PlannedMaintenanceTask, newStatus: MaintenanceStatus) => {
        const updatedTask = { ...task, status: newStatus };
        if (newStatus === MaintenanceStatus.Completed) {
            updatedTask.lastCompleted = new Date().toISOString().split('T')[0];
            const nextDueDate = new Date(updatedTask.lastCompleted);
            nextDueDate.setDate(nextDueDate.getDate() + task.frequencyDays);
            updatedTask.nextDueDate = nextDueDate.toISOString().split('T')[0];
        }
        await api.updateMaintenanceTask(updatedTask);
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    };

    return (
        <Card>
            <h2 className="text-xl font-semibold mb-4">Плановое обслуживание (ППР)</h2>
            {loading ? <p>Загрузка...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Задача</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Следующий срок</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Статус</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {tasks.map(task => (
                                <tr key={task.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-4 font-medium">{task.title}</td>
                                    <td className="px-4 py-4">{formatDate(task.nextDueDate)}</td>
                                    <td className="px-4 py-4"><StatusBadge status={task.status} /></td>
                                    <td className="px-4 py-4 space-x-2">
                                        {task.status !== MaintenanceStatus.Completed && (
                                            <button onClick={() => handleUpdateStatus(task, MaintenanceStatus.Completed)} className="text-sm font-medium text-emerald-600 hover:text-emerald-800">Выполнено</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default MaintenanceTab;