import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return isDark ? '🌙' : '☀️';
      default:
        return '🌓';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Светлая';
      case 'dark':
        return 'Темная';
      case 'auto':
        return `Авто (${isDark ? 'ночь' : 'день'})`;
      default:
        return 'Авто';
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Тема:
      </div>
      
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => handleThemeChange('light')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            theme === 'light'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          title="Светлая тема"
        >
          ☀️ Светлая
        </button>
        
        <button
          onClick={() => handleThemeChange('dark')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            theme === 'dark'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          title="Темная тема"
        >
          🌙 Темная
        </button>
        
        <button
          onClick={() => handleThemeChange('auto')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            theme === 'auto'
              ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
          title="Автоматическое переключение по времени"
        >
          🌓 Авто
        </button>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {theme === 'auto' && (
          <span>
            {isDark ? '🌙 Ночной режим' : '☀️ Дневной режим'}
          </span>
        )}
      </div>
    </div>
  );
};

export default ThemeToggle; 