import React, { useState, useEffect } from 'react';
import Calendar, { CalendarEvent } from '../../components/ui/Calendar';
import { api } from "../../src/firebase/real-api";
import Modal from '../../components/ui/Modal';
import { useNotifications } from '../../context/NotificationContext';

const CalendarPage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        type: 'reminder' as CalendarEvent['type'],
        priority: 'medium' as CalendarEvent['priority'],
        date: new Date().toISOString().split('T')[0],
        time: '09:00'
    });

    // Загружаем события из Firebase
    useEffect(() => {
        const loadEvents = async () => {
            try {
                // Здесь можно загружать события из Firebase
                // Пока используем демо данные
                const demoEvents: CalendarEvent[] = [
                    {
                        id: '1',
                        title: 'Месячные начисления',
                        date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                        type: 'accrual',
                        description: 'Начисление за воду и мусор за текущий месяц',
                        priority: 'high'
                    },
                    {
                        id: '2',
                        title: 'Плановое обслуживание',
                        date: new Date(new Date().getFullYear(), new Date().getMonth(), 15),
                        type: 'maintenance',
                        description: 'Проверка водопроводных сетей',
                        priority: 'medium'
                    },
                    {
                        id: '3',
                        title: 'Сбор показаний счетчиков',
                        date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
                        type: 'reading',
                        description: 'Обход абонентов для сбора показаний',
                        priority: 'high'
                    },
                    {
                        id: '4',
                        title: 'Напоминание о начислениях',
                        date: new Date(new Date().getFullYear(), new Date().getMonth(), 20),
                        type: 'reminder',
                        description: 'За 10 дней до месячных начислений',
                        priority: 'medium'
                    }
                ];

                setEvents(demoEvents);
            } catch (error) {
                console.error('Error loading events:', error);
            }
        };

        loadEvents();
    }, []);

    // Обработчик клика по событию
    const handleEventClick = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    // Обработчик клика по дате
    const handleDateClick = (date: Date) => {
        setNewEvent(prev => ({
            ...prev,
            date: date.toISOString().split('T')[0]
        }));
        setIsAddEventModalOpen(true);
    };

    // Добавление нового события
    const handleAddEvent = async () => {
        try {
            const eventData: Omit<CalendarEvent, 'id'> = {
                title: newEvent.title,
                description: newEvent.description,
                type: newEvent.type,
                priority: newEvent.priority,
                date: new Date(`${newEvent.date}T${newEvent.time}`),
                isCompleted: false
            };

            // Здесь можно сохранять в Firebase
            const newEventWithId: CalendarEvent = {
                ...eventData,
                id: Date.now().toString()
            };

            setEvents(prev => [...prev, newEventWithId]);
            setIsAddEventModalOpen(false);
            setNewEvent({
                title: '',
                description: '',
                type: 'reminder',
                priority: 'medium',
                date: new Date().toISOString().split('T')[0],
                time: '09:00'
            });

            showNotification({
                type: 'success',
                title: 'Событие добавлено',
                message: 'Событие добавлено успешно!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка добавления',
                message: 'Ошибка при добавлении события'
            });
        }
    };

    // Удаление события
    const handleDeleteEvent = async (eventId: string) => {
        try {
            setEvents(prev => prev.filter(e => e.id !== eventId));
            setIsEventModalOpen(false);
            setSelectedEvent(null);
            showNotification({
                type: 'success',
                title: 'Событие удалено',
                message: 'Событие удалено успешно!'
            });
        } catch (error) {
            console.error('Error deleting event:', error);
            showNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: 'Ошибка при удалении события'
            });
        }
    };

    // Отметка события как выполненного
    const handleToggleEventCompletion = async (eventId: string) => {
        try {
            setEvents(prev => prev.map(e => 
                e.id === eventId ? { ...e, isCompleted: !e.isCompleted } : e
            ));
            showNotification({
                type: 'success',
                title: 'Статус обновлен',
                message: 'Статус события обновлен!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка обновления',
                message: 'Ошибка при обновлении статуса'
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Заголовок страницы */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Календарь событий</h1>
                <button
                    onClick={() => setIsAddEventModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Добавить событие
                </button>
            </div>

            {/* Календарь */}
            <Calendar
                events={events}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                showReminders={true}
            />

            {/* Модальное окно просмотра события */}
            {isEventModalOpen && selectedEvent && (
                <Modal
                    isOpen={isEventModalOpen}
                    onClose={() => setIsEventModalOpen(false)}
                    title="Детали события"
                >
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                            <p className="text-gray-600">{selectedEvent.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium">Тип:</span>
                                <span className="ml-2 capitalize">{selectedEvent.type}</span>
                            </div>
                            <div>
                                <span className="font-medium">Приоритет:</span>
                                <span className="ml-2 capitalize">{selectedEvent.priority}</span>
                            </div>
                            <div>
                                <span className="font-medium">Дата:</span>
                                <span className="ml-2">{selectedEvent.date.toLocaleDateString('ru-RU')}</span>
                            </div>
                            <div>
                                <span className="font-medium">Статус:</span>
                                <span className={`ml-2 ${selectedEvent.isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                                    {selectedEvent.isCompleted ? 'Выполнено' : 'В работе'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => handleToggleEventCompletion(selectedEvent.id)}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    selectedEvent.isCompleted
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                {selectedEvent.isCompleted ? 'Отменить выполнение' : 'Отметить выполненным'}
                            </button>
                            <button
                                onClick={() => handleDeleteEvent(selectedEvent.id)}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Модальное окно добавления события */}
            {isAddEventModalOpen && (
                <Modal
                    isOpen={isAddEventModalOpen}
                    onClose={() => setIsAddEventModalOpen(false)}
                    title="Добавить новое событие"
                >
                    <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Название события
                            </label>
                            <input
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Описание
                            </label>
                            <textarea
                                value={newEvent.description}
                                onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Тип события
                                </label>
                                <select
                                    value={newEvent.type}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as CalendarEvent['type'] }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="reminder">Напоминание</option>
                                    <option value="accrual">Начисления</option>
                                    <option value="payment">Платежи</option>
                                    <option value="maintenance">Обслуживание</option>
                                    <option value="reading">Показания счетчиков</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Приоритет
                                </label>
                                <select
                                    value={newEvent.priority}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, priority: e.target.value as CalendarEvent['priority'] }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="low">Низкий</option>
                                    <option value="medium">Средний</option>
                                    <option value="high">Высокий</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Дата
                                </label>
                                <input
                                    type="date"
                                    value={newEvent.date}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Время
                                </label>
                                <input
                                    type="time"
                                    value={newEvent.time}
                                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsAddEventModalOpen(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Добавить событие
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default CalendarPage; 