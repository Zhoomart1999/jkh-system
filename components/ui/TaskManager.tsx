import React, { useState, useEffect } from 'react';
import { ClockIcon, TrashIcon, PlusIcon, CogIcon, ChartBarIcon } from './Icons';
import { taskScheduler, ScheduledTask, TaskExecution } from '../../utils/taskScheduler';
import { useNotifications } from '../../context/NotificationContext';

// Создаем недостающие иконки
const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface TaskManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskManager: React.FC<TaskManagerProps> = ({ isOpen, onClose }) => {
  const { showNotification } = useNotifications();
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [executions, setExecutions] = useState<TaskExecution[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'executions' | 'stats' | 'create'>('tasks');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [stats, setStats] = useState(taskScheduler.getStats());

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setTasks(taskScheduler.getTasks());
    setExecutions(taskScheduler.getExecutions());
    setStats(taskScheduler.getStats());
  };

  const handleCreateTask = (taskData: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    taskScheduler.createTask(taskData);
    loadData();
    setShowCreateModal(false);
    showNotification({
      type: 'success',
      title: 'Задача создана',
      message: 'Задача успешно создана!'
    });
  };

  const handleUpdateTask = (taskId: string, updates: Partial<ScheduledTask>) => {
    taskScheduler.updateTask(taskId, updates);
    loadData();
    setEditingTask(null);
    showNotification({
      type: 'success',
      title: 'Задача обновлена',
      message: 'Задача успешно обновлена!'
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
      taskScheduler.deleteTask(taskId);
      loadData();
      showNotification({
        type: 'success',
        title: 'Задача удалена',
        message: 'Задача успешно удалена!'
      });
    }
  };

  const handleToggleTask = (taskId: string) => {
    taskScheduler.toggleTask(taskId);
    loadData();
    showNotification({
      type: 'success',
      title: 'Задача изменена',
      message: 'Статус задачи успешно изменен!'
    });
  };

  const handleExecuteNow = async (taskId: string) => {
    const success = await taskScheduler.executeTaskNow(taskId);
    if (success) {
      loadData();
      showNotification({
        type: 'success',
        title: 'Задача выполнена',
        message: 'Задача выполнена успешно!'
      });
    } else {
      showNotification({
        type: 'error',
        title: 'Ошибка выполнения',
        message: 'Ошибка выполнения задачи'
      });
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Ежедневно';
      case 'weekly': return 'Еженедельно';
      case 'monthly': return 'Ежемесячно';
      case 'custom': return 'По расписанию';
      default: return type;
    }
  };

  const getTaskStatusIcon = (task: ScheduledTask) => {
    if (!task.isActive) return <PauseIcon className="w-4 h-4 text-gray-400" />;
    
    const now = new Date();
    const nextRun = new Date(task.nextRun);
    
    if (nextRun <= now) {
      return <PlayIcon className="w-4 h-4 text-red-500" />;
    }
    
    return <ClockIcon className="w-4 h-4 text-green-500" />;
  };

  const getExecutionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Управление задачами</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats.activeTasks} активных
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Вкладки */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Задачи ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('executions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'executions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Выполнение ({executions.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Статистика
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Создать задачу
            </button>
          </nav>
        </div>

        {/* Содержимое */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Запланированные задачи</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Новая задача</span>
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет запланированных задач
                </div>
              ) : (
                <div className="grid gap-4">
                  {tasks.map(task => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getTaskStatusIcon(task)}
                            <h4 className="font-semibold">{task.name}</h4>
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                              {getTaskTypeLabel(task.type)}
                            </span>
                            {task.isActive ? (
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                                Активна
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                Неактивна
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Функция: {task.functionName}</div>
                            <div>Следующий запуск: {new Date(task.nextRun).toLocaleString('ru-RU')}</div>
                            {task.lastRun && (
                              <div>Последний запуск: {new Date(task.lastRun).toLocaleString('ru-RU')}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleExecuteNow(task.id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            title="Выполнить сейчас"
                          >
                            <PlayIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                            title={task.isActive ? 'Деактивировать' : 'Активировать'}
                          >
                            {task.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setEditingTask(task)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
                            title="Редактировать"
                          >
                            <CogIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                            title="Удалить"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'executions' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">История выполнения задач</h3>
              
              {executions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Нет записей о выполнении
                </div>
              ) : (
                <div className="space-y-3">
                  {executions.slice(0, 50).map(execution => (
                    <div key={execution.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{execution.taskName}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getExecutionStatusColor(execution.status)}`}>
                              {execution.status === 'completed' ? 'Завершено' :
                               execution.status === 'failed' ? 'Ошибка' :
                               execution.status === 'running' ? 'Выполняется' : execution.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Начало: {new Date(execution.startTime).toLocaleString('ru-RU')}</div>
                            {execution.endTime && (
                              <div>Завершение: {new Date(execution.endTime).toLocaleString('ru-RU')}</div>
                            )}
                            {execution.error && (
                              <div className="text-red-600">Ошибка: {execution.error}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Статистика планировщика</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalTasks}</div>
                  <div className="text-sm text-blue-800">Всего задач</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.activeTasks}</div>
                  <div className="text-sm text-green-800">Активных задач</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalExecutions}</div>
                  <div className="text-sm text-purple-800">Всего выполнений</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.successfulExecutions}</div>
                  <div className="text-sm text-yellow-800">Успешных</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Следующая запланированная задача</h4>
                {stats.nextScheduledTask ? (
                  <div className="text-sm text-gray-600">
                    {new Date(stats.nextScheduledTask).toLocaleString('ru-RU')}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Нет запланированных задач</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Создание новой задачи</h3>
              
              <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setActiveTab('tasks')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно создания/редактирования задачи */}
      {(showCreateModal || editingTask) && (
        <TaskFormModal
          task={editingTask}
          onSubmit={editingTask ? 
            (data) => handleUpdateTask(editingTask.id, data) : 
            handleCreateTask
          }
          onClose={() => {
            setShowCreateModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

// Компонент формы задачи
interface TaskFormProps {
  task?: ScheduledTask | null;
  onSubmit: (data: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    type: task?.type || 'daily' as ScheduledTask['type'],
    cronExpression: task?.cronExpression || '',
    functionName: task?.functionName || 'generateMonthlyAccruals',
    parameters: task?.parameters || {},
    isActive: task?.isActive ?? true,
    nextRun: task?.nextRun || new Date() // Добавляем недостающее поле
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification({
        type: 'warning',
        title: 'Название обязательно',
        message: 'Введите название задачи'
      });
      return;
    }
    onSubmit(formData);
  };

  const taskFunctions = [
    { value: 'generateMonthlyAccruals', label: 'Генерация месячных начислений' },
    { value: 'generateMonthlyReports', label: 'Генерация месячных отчетов' },
    { value: 'cleanupOldData', label: 'Очистка старых данных' },
    { value: 'sendDebtReminders', label: 'Отправка напоминаний о долгах' },
    { value: 'backupDatabase', label: 'Резервное копирование' },
    { value: 'updateTariffs', label: 'Обновление тарифов' },
    { value: 'generateFinancialReport', label: 'Финансовый отчет' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название задачи *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип задачи
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ScheduledTask['type'] }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
            <option value="custom">По расписанию</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Функция
          </label>
          <select
            value={formData.functionName}
            onChange={(e) => setFormData(prev => ({ ...prev, functionName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {taskFunctions.map(func => (
              <option key={func.value} value={func.value}>
                {func.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {formData.type === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cron выражение
          </label>
          <input
            type="text"
            value={formData.cronExpression}
            onChange={(e) => setFormData(prev => ({ ...prev, cronExpression: e.target.value }))}
            placeholder="0 9 * * 1 (каждый понедельник в 9:00)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          Задача активна
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {task ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
};

// Модальное окно формы
interface TaskFormModalProps {
  task?: ScheduledTask | null;
  onSubmit: (data: Omit<ScheduledTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ task, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {task ? 'Редактирование задачи' : 'Создание новой задачи'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <TaskForm
            task={task}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskManager; 