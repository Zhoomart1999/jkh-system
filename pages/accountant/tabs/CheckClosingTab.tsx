import React, { useState, useEffect } from 'react';
import { api } from "../../../src/firebase/real-api";
import Card from '../../../components/ui/Card';

interface CheckClosing {
  id: string;
  abonentId: string;
  abonentName: string;
  abonentAddress: string;
  personalAccount: string;
  waterDebt: number;
  garbageDebt: number;
  totalDebt: number;
  controllerName: string;
  closingDate: string;
  status: string;
}

const CheckClosingTab: React.FC = () => {
  const [checkClosings, setCheckClosings] = useState<CheckClosing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    controllerId: 'all',
    status: 'all'
  });

  useEffect(() => {
    loadCheckClosings();
  }, []);

  const loadCheckClosings = async () => {
    try {
      setLoading(true);
      // Загружаем данные о закрытии чеков
      const data = await api.getCheckClosings();
      setCheckClosings(data);
    } catch (error) {
      console.error('Error loading check closings:', error);
      // Создаем тестовые данные
      setCheckClosings([
        {
          id: '1',
          abonentId: '1',
          abonentName: 'Абакиров',
          abonentAddress: 'ул. Покровская, дом 1 кв. 1',
          personalAccount: '25080001',
          waterDebt: 3000,
          garbageDebt: 1707,
          totalDebt: 4707,
          controllerName: 'Тагаева С.Ж.',
          closingDate: new Date().toISOString(),
          status: 'closed'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом`;
  };

  const filteredCheckClosings = checkClosings.filter(closing => {
    if (filters.dateFrom && new Date(closing.closingDate) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(closing.closingDate) > new Date(filters.dateTo)) return false;
    if (filters.status !== 'all' && closing.status !== filters.status) return false;
    return true;
  });

  const totalAmount = filteredCheckClosings.reduce((sum, closing) => sum + closing.totalDebt, 0);

  if (loading) {
    return <div className="text-center py-8">Загрузка отчетов о закрытии чеков...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Отчеты о закрытии чеков</h2>
        <button
          onClick={loadCheckClosings}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Фильтры */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата с</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата по</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="closed">Закрыто</option>
              <option value="pending">В ожидании</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ dateFrom: '', dateTo: '', controllerId: 'all', status: 'all' })}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Сбросить фильтры
            </button>
          </div>
        </div>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredCheckClosings.length}</div>
            <div className="text-sm text-gray-600">Всего закрытых чеков</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</div>
            <div className="text-sm text-gray-600">Общая сумма долга</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredCheckClosings.filter(c => c.status === 'closed').length}
            </div>
            <div className="text-sm text-gray-600">Успешно закрыто</div>
          </div>
        </Card>
      </div>

      {/* Таблица */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Абонент
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Лицевой счет
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контролер
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Долг за воду
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Долг за мусор
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Общий долг
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCheckClosings.map((closing) => (
                <tr key={closing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(closing.closingDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{closing.abonentName}</div>
                      <div className="text-sm text-gray-500">{closing.abonentAddress}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {closing.personalAccount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {closing.controllerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(closing.waterDebt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(closing.garbageDebt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      {formatCurrency(closing.totalDebt)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      closing.status === 'closed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {closing.status === 'closed' ? 'Закрыто' : 'В ожидании'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CheckClosingTab; 