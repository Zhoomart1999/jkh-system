import React from 'react';
import useOffline from '../../hooks/useOffline';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, offlineData, syncOfflineData, clearOfflineData } = useOffline();

  if (isOnline) {
    return null; // Не показываем индикатор когда онлайн
  }

  const offlineDataCount = Object.keys(offlineData).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">Офлайн режим</span>
        </div>
        
        <p className="text-sm mb-3">
          Приложение работает без интернета. 
          {offlineDataCount > 0 && (
            <span className="block mt-1">
              📱 {offlineDataCount} набор данных сохранен для синхронизации
            </span>
          )}
        </p>
        
        {offlineDataCount > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={syncOfflineData}
              className="bg-white text-red-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              🔄 Синхронизировать
            </button>
            <button
              onClick={clearOfflineData}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              🗑️ Очистить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator; 