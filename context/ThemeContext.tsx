import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  currentTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Получаем сохраненную тему из localStorage
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'auto';
  });

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Определяем, должна ли тема быть темной на основе времени
  const shouldBeDark = () => {
    const now = new Date();
    const hour = now.getHours();
    
    // Темная тема с 18:00 до 6:00 (ночной режим)
    return hour >= 18 || hour < 6;
  };

  // Применяем тему к документу
  const applyTheme = (newTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    setCurrentTheme(newTheme);
  };

  // Обновляем тему
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'auto') {
      const shouldDark = shouldBeDark();
      applyTheme(shouldDark ? 'dark' : 'light');
    } else {
      applyTheme(newTheme);
    }
  };

  // Переключаем тему
  const toggleTheme = () => {
    if (theme === 'auto') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('auto');
    }
  };

  // Эффект для автоматического переключения темы
  useEffect(() => {
    if (theme === 'auto') {
      const updateTheme = () => {
        const shouldDark = shouldBeDark();
        applyTheme(shouldDark ? 'dark' : 'light');
      };

      // Обновляем тему сразу
      updateTheme();

      // Проверяем каждую минуту
      const interval = setInterval(updateTheme, 60000);

      // Слушаем изменения видимости страницы
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          updateTheme();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Эффект для применения CSS переменных
  useEffect(() => {
    const root = document.documentElement;
    
    if (currentTheme === 'dark') {
      // Темная тема
      root.style.setProperty('--bg-primary', '#1f2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--bg-tertiary', '#4b5563');
      root.style.setProperty('--text-primary', '#f9fafb');
      root.style.setProperty('--text-secondary', '#d1d5db');
      root.style.setProperty('--text-tertiary', '#9ca3af');
      root.style.setProperty('--border-primary', '#4b5563');
      root.style.setProperty('--border-secondary', '#6b7280');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#1d4ed8');
      root.style.setProperty('--success', '#10b981');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
    } else {
      // Светлая тема
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f9fafb');
      root.style.setProperty('--bg-tertiary', '#f3f4f6');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#4b5563');
      root.style.setProperty('--text-tertiary', '#6b7280');
      root.style.setProperty('--border-primary', '#d1d5db');
      root.style.setProperty('--border-secondary', '#e5e7eb');
      root.style.setProperty('--accent-primary', '#3b82f6');
      root.style.setProperty('--accent-secondary', '#1d4ed8');
      root.style.setProperty('--success', '#10b981');
      root.style.setProperty('--warning', '#f59e0b');
      root.style.setProperty('--error', '#ef4444');
    }
  }, [currentTheme]);

  const value: ThemeContextType = {
    theme,
    currentTheme,
    setTheme,
    toggleTheme,
    isDark: currentTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 