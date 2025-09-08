import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'accrual' | 'payment' | 'maintenance' | 'reading' | 'reminder';
    description?: string;
    isCompleted?: boolean;
    priority?: 'low' | 'medium' | 'high';
}

interface CalendarProps {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onDateClick?: (date: Date) => void;
    showReminders?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({ 
    events = [], 
    onEventClick, 
    onDateClick,
    showReminders = true 
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Получаем текущий месяц
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Получаем дни недели для отображения
    const weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Понедельник
    const weekEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Навигация по месяцам
    const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Получаем события для выбранной даты
    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(event => isSameDay(event.date, selectedDate));
    }, [selectedDate, events]);

    // Получаем события для конкретной даты
    const getEventsForDate = (date: Date) => {
        return events.filter(event => isSameDay(event.date, date));
    };

    // Проверяем, есть ли напоминания (за 10 дней до месячных начислений)
    const hasReminders = (date: Date) => {
        const today = new Date();
        const daysUntilMonthEnd = Math.ceil((endOfMonth(today).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilMonthEnd <= 10 && daysUntilMonthEnd > 0;
    };

    // Получаем цвет приоритета события
    const getEventColor = (type: string, priority?: string) => {
        if (type === 'reminder') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (type === 'accrual') return 'bg-blue-100 text-blue-800 border-blue-200';
        if (type === 'payment') return 'bg-green-100 text-green-800 border-green-200';
        if (type === 'maintenance') return 'bg-orange-100 text-orange-800 border-orange-200';
        if (type === 'reading') return 'bg-purple-100 text-purple-800 border-purple-200';
        
        if (priority === 'high') return 'bg-red-100 text-red-800 border-red-200';
        if (priority === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Получаем иконку для типа события
    const getEventIcon = (type: string) => {
        switch (type) {
            case 'accrual': return '💰';
            case 'payment': return '💳';
            case 'maintenance': return '🔧';
            case 'reading': return '📊';
            case 'reminder': return '⏰';
            default: return '📅';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Заголовок календаря */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                    Календарь {format(currentDate, 'MMMM yyyy', { locale: ru })}
                </h2>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={goToPreviousMonth}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        ←
                    </button>
                    <button
                        onClick={goToToday}
                        className="px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                        Сегодня
                    </button>
                    <button
                        onClick={goToNextMonth}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        →
                    </button>
                </div>
            </div>

            {/* Дни недели */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                        {day}
                    </div>
                ))}
            </div>

            {/* Календарная сетка */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day: Date, index: number) => {
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const dayEvents = getEventsForDate(day);
                    const hasReminderToday = hasReminders(day);

                    return (
                        <div
                            key={index}
                            className={`
                                min-h-[100px] p-2 border border-gray-200 cursor-pointer transition-colors
                                ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                                ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                                ${isSelected ? 'bg-blue-100 border-blue-400' : ''}
                                hover:bg-gray-50
                            `}
                            onClick={() => {
                                setSelectedDate(day);
                                onDateClick?.(day);
                            }}
                        >
                            {/* Номер дня */}
                            <div className={`
                                text-sm font-medium mb-1
                                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                ${isToday ? 'text-blue-600' : ''}
                            `}>
                                {format(day, 'd')}
                            </div>

                            {/* События дня */}
                            <div className="space-y-1">
                                {dayEvents.slice(0, 3).map(event => (
                                    <div
                                        key={event.id}
                                        className={`
                                            text-xs p-1 rounded border cursor-pointer
                                            ${getEventColor(event.type, event.priority)}
                                            hover:opacity-80
                                        `}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick?.(event);
                                        }}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{getEventIcon(event.type)}</span>
                                            <span className="truncate">{event.title}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* Показать больше событий если есть */}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-gray-500 text-center">
                                        +{dayEvents.length - 3} еще
                                    </div>
                                )}

                                {/* Напоминание о начислениях */}
                                {showReminders && hasReminderToday && (
                                    <div className="text-xs bg-yellow-100 text-yellow-800 p-1 rounded border border-yellow-200">
                                        ⏰ Начисления через {Math.ceil((endOfMonth(new Date()).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} дней
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Панель выбранной даты */}
            {selectedDate && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-3">
                        {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: ru })}
                    </h3>
                    
                    {selectedDateEvents.length > 0 ? (
                        <div className="space-y-2">
                            {selectedDateEvents.map(event => (
                                <div
                                    key={event.id}
                                    className={`
                                        p-3 rounded-lg border cursor-pointer
                                        ${getEventColor(event.type, event.priority)}
                                        ${event.isCompleted ? 'opacity-60' : ''}
                                    `}
                                    onClick={() => onEventClick?.(event)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getEventIcon(event.type)}</span>
                                            <div>
                                                <div className="font-medium">{event.title}</div>
                                                {event.description && (
                                                    <div className="text-sm opacity-80">{event.description}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs opacity-70">
                                            {format(event.date, 'HH:mm')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">На этот день событий не запланировано</p>
                    )}
                </div>
            )}

            {/* Легенда */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Легенда:</h4>
                <div className="flex flex-wrap gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                        <span>💰</span>
                        <span>Начисления</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span>💳</span>
                        <span>Платежи</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span>🔧</span>
                        <span>Обслуживание</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span>📊</span>
                        <span>Показания</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span>⏰</span>
                        <span>Напоминания</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar; 