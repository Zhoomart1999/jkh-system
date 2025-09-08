import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import Card from '../../components/ui/Card';
import { WifiIcon, WifiOffIcon, CloudIcon, DownloadIcon, UploadIcon } from '../../components/ui/Icons';
import { useNotifications } from '../../context/NotificationContext';

const TestOfflinePage: React.FC = () => {
    const { showNotification } = useNotifications();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [offlineData, setOfflineData] = useState<any[]>([]);
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [testData, setTestData] = useState('');
  const [savedData, setSavedData] = useState<any>(null);

  const handleSaveData = () => {
    if (testData.trim()) {
      const data = {
        message: testData,
        timestamp: new Date().toISOString(),
        type: 'test'
      };
      saveOfflineData('test-message', data);
      setTestData('');
      showNotification({
                type: 'success',
                title: 'Данные сохранены',
                message: 'Данные сохранены для офлайн использования!'
            });
    }
  };

  const handleLoadData = () => {
    const data = getOfflineData('test-message');
    setSavedData(data);
  };

  const handleSync = async () => {
    await syncOfflineData();
    showNotification({
                type: 'success',
                title: 'Синхронизация завершена',
                message: 'Синхронизация завершена!'
            });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Тест офлайн функциональности</h1>
      
      {/* Статус соединения */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Статус соединения</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">
            {isOnline ? '🟢 Онлайн' : '🔴 Офлайн'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {isOnline 
            ? 'Приложение работает с интернетом' 
            : 'Приложение работает в офлайн режиме'
          }
        </p>
      </Card>

      {/* Тест сохранения данных */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Тест сохранения данных</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Введите тестовое сообщение:
            </label>
            <input
              type="text"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сообщение для сохранения..."
            />
          </div>
          <button
            onClick={handleSaveData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            💾 Сохранить для офлайн использования
          </button>
        </div>
      </Card>

      {/* Тест загрузки данных */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Тест загрузки данных</h2>
        <div className="space-y-4">
          <button
            onClick={handleLoadData}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            📱 Загрузить офлайн данные
          </button>
          
          {savedData && (
            <div className="p-4 bg-gray-100 rounded-md">
              <h3 className="font-semibold mb-2">Загруженные данные:</h3>
              <pre className="text-sm text-gray-700">
                {JSON.stringify(savedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </Card>

      {/* Управление офлайн данными */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">Управление офлайн данными</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Сохранено наборов данных: <strong>{Object.keys(offlineData).length}</strong>
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleSync}
              disabled={isOffline}
              className={`px-4 py-2 rounded transition-colors ${
                isOffline 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              🔄 Синхронизировать
            </button>
            
            <button
              onClick={clearOfflineData}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              🗑️ Очистить все данные
            </button>
          </div>
        </div>
      </Card>

      {/* Инструкции по тестированию */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">📋 Инструкции по тестированию</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>1. Тест офлайн режима:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Отключите интернет (WiFi или мобильные данные)</li>
            <li>Попробуйте сохранить тестовые данные</li>
            <li>Проверьте, что данные сохраняются в localStorage</li>
          </ul>
          
          <p className="mt-4"><strong>2. Тест синхронизации:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Включите интернет обратно</li>
            <li>Нажмите "Синхронизировать"</li>
            <li>Проверьте, что данные очистились после синхронизации</li>
          </ul>
          
          <p className="mt-4"><strong>3. Проверка Service Worker:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Откройте DevTools → Application → Service Workers</li>
            <li>Убедитесь, что SW зарегистрирован и активен</li>
            <li>Проверьте кэши в Application → Storage → Cache Storage</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default TestOfflinePage; 