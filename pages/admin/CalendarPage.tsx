import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';

interface CalendarEvent {
  id: string;
  type: string;
  date: string;
  details: string;
  status: string;
}

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [period, setPeriod] = useState<{month: number, year: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3001/api/calendar/history');
      const data = await res.json();
      setEvents(data.reverse());
    } catch (e) {
      setError('Ошибка загрузки истории событий');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriod = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/calendar/current-period');
      const data = await res.json();
      setPeriod(data);
    } catch {}
  };

  const handleManualTrigger = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('http://localhost:3001/api/calendar/trigger', { method: 'POST' });
      if (res.ok) {
        setSuccess('Обновление успешно запущено!');
        await fetchEvents();
      } else {
        setError('Ошибка ручного запуска');
      }
    } catch {
      setError('Ошибка ручного запуска');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchPeriod();
  }, []);

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Календарь расчётов ЖКХ</h2>
        <button onClick={handleManualTrigger} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Ручной запуск</button>
      </div>
      {period && (
        <div className="mb-4 text-slate-700">Текущий период: <b>{period.month}.{period.year}</b></div>
      )}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 border">Дата</th>
              <th className="p-2 border">Тип</th>
              <th className="p-2 border">Детали</th>
              <th className="p-2 border">Статус</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr><td colSpan={4} className="text-center p-4">Нет событий</td></tr>
            )}
            {events.map(ev => (
              <tr key={ev.id}>
                <td className="p-2 border">{new Date(ev.date).toLocaleString()}</td>
                <td className="p-2 border">{ev.type}</td>
                <td className="p-2 border">{ev.details}</td>
                <td className={`p-2 border font-semibold ${ev.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{ev.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CalendarPage; 