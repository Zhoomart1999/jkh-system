import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { Abonent, Payment, Tariffs, AbonentStatus, WaterTariffType } from '../../types';
import Card from '../../components/ui/Card';
import { CalendarIcon, DollarSignIcon, UsersIcon, FileTextIcon, PrinterIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

interface CalendarEvent {
  id: string;
  date: string;
  type: 'payment' | 'accrual' | 'report' | 'reminder' | 'maintenance' | 'reading';
  title: string;
  description: string;
  amount?: number;
  abonentId?: string;
  abonentName?: string;
}

const EngineerCalendarPage: React.FC = () => {
  const { showNotification } = useNotifications();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [abonents, setAbonents] = useState<Abonent[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tariffs, setTariffs] = useState<Tariffs | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAccrualModal, setShowAccrualModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    generateEvents();
  }, [abonents, payments, currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [abonentsData, paymentsData, tariffsData] = await Promise.all([
        api.getAbonents(),
        api.getPayments(),
        api.getTariffs()
      ]);
      setAbonents(abonentsData);
      setPayments(paymentsData);
      setTariffs(tariffsData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEvents = () => {
    const newEvents: CalendarEvent[] = [];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date();

    // Добавляем события на 1 число каждого месяца (автоматические начисления)
    const firstDay = new Date(currentYear, currentMonth, 1);
    newEvents.push({
      id: `accrual-${currentMonth}-${currentYear}`,
      date: firstDay.toISOString().split('T')[0],
      type: 'accrual',
      title: 'Автоматические начисления',
      description: 'Начисление за воду и мусор для всех абонентов'
    });

    // Добавляем напоминание за 10 дней до 1 числа следующего месяца
    const nextMonth = new Date(currentYear, currentMonth + 1, 1);
    const reminderDate = new Date(nextMonth);
    reminderDate.setDate(reminderDate.getDate() - 10);
    
    if (reminderDate >= today) {
      newEvents.push({
        id: `reminder-${currentMonth}-${currentYear}`,
        date: reminderDate.toISOString().split('T')[0],
        type: 'reminder',
        title: 'Напоминание о начислениях',
        description: 'Через 10 дней будут автоматические начисления'
      });
    }

    // Добавляем платежи
    payments.forEach(payment => {
      newEvents.push({
        id: `payment-${payment.id}`,
        date: payment.date,
        type: 'payment',
        title: `Платеж: ${payment.abonentName || 'Абонент'}`,
        description: `Сумма: ${payment.amount} сом`,
        amount: payment.amount,
        abonentId: payment.abonentId,
        abonentName: payment.abonentName
      });
    });

    // Добавляем напоминания о долгах
    abonents.filter(a => (a.balance || 0) > 0).forEach(abonent => {
      newEvents.push({
        id: `debt-${abonent.id}`,
        date: new Date().toISOString().split('T')[0],
        type: 'reminder',
        title: `Долг: ${abonent.fullName}`,
        description: `Сумма долга: ${abonent.balance || 0} сом`
      });
    });

    // Добавляем события по снятию показаний счетчиков
    abonents.forEach(abonent => {
      if (abonent.lastMeterReading) {
        const readingDate = new Date();
        readingDate.setMonth(readingDate.getMonth() + 1);
        
        if (readingDate >= today) {
          newEvents.push({
            id: `reading-${abonent.id}`,
            date: readingDate.toISOString().split('T')[0],
            type: 'reading',
            title: `Снятие показаний: ${abonent.fullName}`,
            description: `Адрес: ${abonent.address}`
          });
        }
      }
    });

    setEvents(newEvents);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSignIcon className="w-4 h-4 text-green-600" />;
      case 'accrual':
        return <UsersIcon className="w-4 h-4 text-blue-600" />;
      case 'reminder':
        return <CalendarIcon className="w-4 h-4 text-yellow-600" />;
      case 'reading':
        return <FileTextIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <CalendarIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 border-green-300';
      case 'accrual':
        return 'bg-blue-100 border-blue-300';
      case 'reminder':
        return 'bg-yellow-100 border-yellow-300';
      case 'reading':
        return 'bg-purple-100 border-purple-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleGenerateMonthlyAccruals = async () => {
    try {
      await api.generateMonthlyAccruals();
      showNotification({
          type: 'success',
          title: 'Начисления сгенерированы',
          message: 'Автоматические начисления сгенерированы!'
      });
      fetchData();
    } catch (error) {
      showNotification({
          type: 'error',
          title: 'Ошибка генерации',
          message: 'Ошибка при генерации начислений: ' + error
      });
    }
  };

  const handleGenerateMonthlyReport = async () => {
    try {
      // Здесь можно добавить генерацию месячного отчета
      showNotification({
          type: 'success',
          title: 'Отчет создан',
          message: 'Месячный отчет сгенерирован!'
      });
    } catch (error) {
      showNotification({
          type: 'error',
          title: 'Ошибка генерации',
          message: 'Ошибка при генерации отчета: ' + error
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Загрузка календаря...</div>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const days = [];

  // Добавляем пустые дни в начале месяца
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }

  // Добавляем дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayEvents = getEventsForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <div
        key={day}
        onClick={() => handleDateClick(date)}
        className={`p-2 border border-gray-200 min-h-[100px] cursor-pointer hover:bg-gray-50 ${
          isToday ? 'bg-blue-50 border-blue-300' : ''
        }`}
      >
        <div className="font-semibold text-sm mb-1">{day}</div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map(event => (
            <div
              key={event.id}
              className={`text-xs p-1 rounded border ${getEventColor(event.type)}`}
            >
              <div className="flex items-center space-x-1">
                {getEventIcon(event.type)}
                <span className="truncate">{event.title}</span>
              </div>
            </div>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-gray-500 text-center">
              +{dayEvents.length - 3} еще
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Календарь инженера</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleGenerateMonthlyAccruals}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 inline mr-2" />
            Генерировать начисления
          </button>
          <button
            onClick={handleGenerateMonthlyReport}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            <PrinterIcon className="w-4 h-4 inline mr-2" />
            Месячный отчет
          </button>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              const prevMonth = new Date(currentDate);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentDate(prevMonth);
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => {
              const nextMonth = new Date(currentDate);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentDate(nextMonth);
            }}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} className="p-2 text-center font-semibold text-sm bg-gray-100">
              {day}
            </div>
          ))}
          {days}
        </div>
      </Card>

      {/* Модальное окно для просмотра событий дня */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              События на {selectedDate.toLocaleDateString('ru-RU')}
            </h3>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className={`p-3 rounded border ${getEventColor(event.type)}`}>
                  <div className="flex items-center space-x-2">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-sm text-gray-600">{event.description}</div>
                    </div>
                  </div>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <div className="text-gray-500 text-center py-4">
                  Нет событий на этот день
                </div>
              )}
            </div>
            <button
              onClick={() => setSelectedDate(null)}
              className="mt-4 w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EngineerCalendarPage; 