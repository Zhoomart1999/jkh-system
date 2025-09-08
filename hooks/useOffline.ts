import { useState, useEffect, useCallback } from 'react';

interface OfflineData {
  [key: string]: any;
}

interface UseOfflineReturn {
  isOnline: boolean;
  isOffline: boolean;
  offlineData: OfflineData;
  saveOfflineData: (key: string, data: any) => void;
  getOfflineData: (key: string) => any;
  syncOfflineData: () => Promise<void>;
  clearOfflineData: () => void;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({});

  // Проверяем онлайн статус
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Соединение восстановлено');
      
      // Запускаем синхронизацию при восстановлении соединения
      if ('serviceWorker' in navigator && 'sync' in (window.ServiceWorkerRegistration?.prototype || {})) {
        navigator.serviceWorker.ready.then(registration => {
          (registration as any).sync.register('background-sync');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Соединение потеряно - переходим в офлайн режим');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Загружаем сохраненные офлайн данные при инициализации
  useEffect(() => {
    const savedData = localStorage.getItem('jkh-offline-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setOfflineData(parsed);
        console.log('📱 Загружены офлайн данные:', Object.keys(parsed));
      } catch (error) {
        console.log('❌ Ошибка загрузки офлайн данных:', error);
      }
    }
  }, []);

  // Сохраняем данные для офлайн использования
  const saveOfflineData = useCallback((key: string, data: any) => {
    const newOfflineData = {
      ...offlineData,
      [key]: {
        data,
        timestamp: Date.now(),
        version: '1.0'
      }
    };
    
    setOfflineData(newOfflineData);
    localStorage.setItem('jkh-offline-data', JSON.stringify(newOfflineData));
    
    // Отправляем данные в Service Worker для кэширования
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_DATA',
        data: data,
        key: key
      });
    }
    
    console.log(`💾 Данные сохранены для офлайн использования: ${key}`);
  }, [offlineData]);

  // Получаем офлайн данные
  const getOfflineData = useCallback((key: string) => {
    const item = offlineData[key];
    if (item && item.data) {
      console.log(`📱 Получены офлайн данные: ${key}`);
      return item.data;
    }
    return null;
  }, [offlineData]);

  // Синхронизация офлайн данных
  const syncOfflineData = useCallback(async () => {
    if (!isOnline) {
      console.log('❌ Нет соединения для синхронизации');
      return;
    }

    console.log('🔄 Начинаем синхронизацию офлайн данных...');
    
    try {
      // Здесь можно добавить логику синхронизации с сервером
      // Например, отправка накопленных изменений
      
      // Очищаем офлайн данные после успешной синхронизации
      setOfflineData({});
      localStorage.removeItem('jkh-offline-data');
      
      console.log('✅ Офлайн данные успешно синхронизированы');
    } catch (error) {
      console.log('❌ Ошибка синхронизации:', error);
    }
  }, [isOnline]);

  // Очистка офлайн данных
  const clearOfflineData = useCallback(() => {
    setOfflineData({});
    localStorage.removeItem('jkh-offline-data');
    console.log('🗑️ Офлайн данные очищены');
  }, []);

  // Слушаем сообщения от Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
          console.log('🔄 Получен сигнал синхронизации от Service Worker');
          syncOfflineData();
        }
      };

      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [syncOfflineData]);

  return {
    isOnline,
    isOffline: !isOnline,
    offlineData,
    saveOfflineData,
    getOfflineData,
    syncOfflineData,
    clearOfflineData
  };
}

export default useOffline; 