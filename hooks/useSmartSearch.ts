import { useState, useEffect, useCallback, useMemo } from 'react';
import { Abonent, Payment, User } from '../types';

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: 'abonent' | 'payment' | 'user' | 'general';
  timestamp: number;
  resultCount: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'abonent' | 'payment' | 'user' | 'address' | 'phone' | 'general';
  relevance: number;
  data?: any;
}

export interface SearchOptions {
  includeAbonents: boolean;
  includePayments: boolean;
  includeUsers: boolean;
  includeAddresses: boolean;
  includePhones: boolean;
  maxResults: number;
  searchInHistory: boolean;
  fuzzySearch: boolean;
}

export const defaultSearchOptions: SearchOptions = {
  includeAbonents: true,
  includePayments: true,
  includeUsers: true,
  includeAddresses: true,
  includePhones: true,
  maxResults: 50,
  searchInHistory: true,
  fuzzySearch: true
};

export const useSmartSearch = (options: SearchOptions = defaultSearchOptions) => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Загрузка истории поиска из localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('jkh-search-history');
      const savedFavorites = localStorage.getItem('jkh-search-favorites');
      const savedRecent = localStorage.getItem('jkh-recent-searches');
      
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      if (savedRecent) {
        setRecentSearches(JSON.parse(savedRecent));
      }
    } catch (error) {
      console.error('Ошибка загрузки истории поиска:', error);
    }
  }, []);

  // Сохранение истории поиска в localStorage
  const saveSearchHistory = useCallback((history: SearchHistoryItem[]) => {
    try {
      localStorage.setItem('jkh-search-history', JSON.stringify(history));
    } catch (error) {
      console.error('Ошибка сохранения истории поиска:', error);
    }
  }, []);

  // Сохранение избранного в localStorage
  const saveFavorites = useCallback((favs: string[]) => {
    try {
      localStorage.setItem('jkh-search-favorites', JSON.stringify(favs));
    } catch (error) {
      console.error('Ошибка сохранения избранного:', error);
    }
  }, []);

  // Сохранение недавних поисков
  const saveRecentSearches = useCallback((recent: string[]) => {
    try {
      localStorage.setItem('jkh-recent-searches', JSON.stringify(recent));
    } catch (error) {
      console.error('Ошибка сохранения недавних поисков:', error);
    }
  }, []);

  // Добавление в историю поиска
  const addToHistory = useCallback((query: string, type: SearchHistoryItem['type'], resultCount: number) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query,
      type,
      timestamp: Date.now(),
      resultCount
    };

    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== query);
      const newHistory = [newItem, ...filtered].slice(0, 100); // Максимум 100 записей
      saveSearchHistory(newHistory);
      return newHistory;
    });

    // Добавляем в недавние поиски
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== query);
      const newRecent = [query, ...filtered].slice(0, 10); // Максимум 10 записей
      saveRecentSearches(newRecent);
      return newRecent;
    });
  }, [saveSearchHistory, saveRecentSearches]);

  // Добавление/удаление из избранного
  const toggleFavorite = useCallback((query: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(query)
        ? prev.filter(fav => fav !== query)
        : [...prev, query];
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, [saveFavorites]);

  // Очистка истории поиска
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    setRecentSearches([]);
    saveSearchHistory([]);
    saveRecentSearches([]);
  }, [saveSearchHistory, saveRecentSearches]);

  // Очистка избранного
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, [saveFavorites]);

  // Удаление элемента из истории
  const removeFromHistory = useCallback((id: string) => {
    setSearchHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      saveSearchHistory(newHistory);
      return newHistory;
    });
  }, [saveSearchHistory]);

  // Генерация предложений на основе истории и избранного
  const generateSuggestions = useCallback((query: string): SearchSuggestion[] => {
    if (!query.trim()) return [];

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Поиск в избранном
    favorites.forEach(fav => {
      if (fav.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: fav,
          type: 'general',
          relevance: 100,
          data: { isFavorite: true }
        });
      }
    });

    // Поиск в недавних поисках
    recentSearches.forEach(recent => {
      if (recent.toLowerCase().includes(lowerQuery) && !suggestions.find(s => s.text === recent)) {
        suggestions.push({
          text: recent,
          type: 'general',
          relevance: 80,
          data: { isRecent: true }
        });
      }
    });

    // Поиск в истории
    searchHistory.forEach(item => {
      if (item.query.toLowerCase().includes(lowerQuery) && !suggestions.find(s => s.text === item.query)) {
        suggestions.push({
          text: item.query,
          type: item.type,
          relevance: 60,
          data: { 
            historyItem: item,
            resultCount: item.resultCount
          }
        });
      }
    });

    // Сортируем по релевантности
    return suggestions.sort((a, b) => b.relevance - a.relevance);
  }, [favorites, recentSearches, searchHistory]);

  // Умный поиск с автодополнением
  const smartSearch = useCallback(async (query: string): Promise<{
    abonents: Abonent[];
    payments: Payment[];
    users: User[];
    suggestions: SearchSuggestion[];
  }> => {
    if (!query.trim()) {
      return { abonents: [], payments: [], users: [], suggestions: [] };
    }

    setIsLoading(true);
    const suggestions = generateSuggestions(query);

    try {
      const { api } = await import('../services/mock-api');
      const results = {
        abonents: [] as Abonent[],
        payments: [] as Payment[],
        users: [] as User[],
        suggestions
      };

      // Поиск абонентов
      if (options.includeAbonents) {
        const abonents = await api.getAbonents();
        results.abonents = abonents.filter(abonent => {
          const searchFields = [
            abonent.fullName,
            abonent.address,
            abonent.personalAccount,
            abonent.phone,
            abonent.controllerId
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchFields.includes(query.toLowerCase());
        }).slice(0, options.maxResults);
      }

      // Поиск платежей
      if (options.includePayments) {
        const payments = await api.getPayments();
        results.payments = payments.filter(payment => {
          const searchFields = [
            payment.abonentName,
            payment.method,
            payment.comment
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchFields.includes(query.toLowerCase());
        }).slice(0, options.maxResults);
      }

      // Поиск пользователей
      if (options.includeUsers) {
        const users = await api.getUsers();
        results.users = users.filter(user => {
          const searchFields = [
            user.name,
            user.role,
            user.pin
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchFields.includes(query.toLowerCase());
        }).slice(0, options.maxResults);
      }

      // Добавляем в историю
      const totalResults = results.abonents.length + results.payments.length + results.users.length;
      addToHistory(query, 'general', totalResults);

      return results;
    } catch (error) {
      console.error('Ошибка умного поиска:', error);
      return { abonents: [], payments: [], users: [], suggestions };
    } finally {
      setIsLoading(false);
    }
  }, [options, generateSuggestions, addToHistory]);

  // Поиск по мусору
  const searchGarbage = useCallback(async (query: string): Promise<Abonent[]> => {
    try {
      const { api } = await import('../services/mock-api');
      const abonents = await api.getAbonents();
      
      // Фильтруем абонентов по мусорным тарифам
      return abonents.filter(abonent => {
        const searchFields = [
          abonent.fullName,
          abonent.address,
          abonent.personalAccount
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Ищем по тексту и по типу тарифа (мусор)
        const isGarbageRelated = query.toLowerCase().includes('мусор') || 
                               query.toLowerCase().includes('garbage') ||
                               query.toLowerCase().includes('таштанды');
        
        return searchFields.includes(query.toLowerCase()) && isGarbageRelated;
      }).slice(0, 20);
    } catch (error) {
      console.error('Ошибка поиска по мусору:', error);
      return [];
    }
  }, []);

  // Поиск только по воде
  const searchWaterOnly = useCallback(async (query: string): Promise<Abonent[]> => {
    try {
      const { api } = await import('../services/mock-api');
      const abonents = await api.getAbonents();
      
      // Фильтруем абонентов только по водным тарифам
      return abonents.filter(abonent => {
        const searchFields = [
          abonent.fullName,
          abonent.address,
          abonent.personalAccount
        ].filter(Boolean).join(' ').toLowerCase();
        
        // Ищем по тексту и по типу тарифа (вода)
        const isWaterRelated = query.toLowerCase().includes('вода') || 
                             query.toLowerCase().includes('water') ||
                             query.toLowerCase().includes('суу') ||
                             abonent.waterTariff === 'by_meter' ||
                             abonent.waterTariff === 'by_person';
        
        return searchFields.includes(query.toLowerCase()) && isWaterRelated;
      }).slice(0, 20);
    } catch (error) {
      console.error('Ошибка поиска по воде:', error);
      return [];
    }
  }, []);

  // Поиск по адресам
  const searchAddresses = useCallback(async (query: string): Promise<string[]> => {
    try {
      const { api } = await import('../services/mock-api');
      const abonents = await api.getAbonents();
      
      const addresses = abonents
        .map(a => a.address)
        .filter(Boolean)
        .filter(addr => addr.toLowerCase().includes(query.toLowerCase()));
      
      return [...new Set(addresses)].slice(0, 20);
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      return [];
    }
  }, []);

  // Поиск по телефонам
  const searchPhones = useCallback(async (query: string): Promise<string[]> => {
    try {
      const { api } = await import('../services/mock-api');
      const abonents = await api.getAbonents();
      
      const phones = abonents
        .map(a => a.phone)
        .filter(Boolean)
        .filter(phone => phone.includes(query));
      
      return [...new Set(phones)].slice(0, 20);
    } catch (error) {
      console.error('Ошибка поиска телефонов:', error);
      return [];
    }
  }, []);

  // Получение статистики поиска
  const getSearchStats = useMemo(() => {
    const totalSearches = searchHistory.length;
    const totalResults = searchHistory.reduce((sum, item) => sum + item.resultCount, 0);
    const averageResults = totalSearches > 0 ? totalResults / totalSearches : 0;
    
    const searchesByType = searchHistory.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSearches,
      totalResults,
      averageResults: Math.round(averageResults * 100) / 100,
      searchesByType,
      favoritesCount: favorites.length,
      recentCount: recentSearches.length
    };
  }, [searchHistory, favorites, recentSearches]);

  return {
    // Состояние
    searchHistory,
    favorites,
    recentSearches,
    suggestions,
    isLoading,
    
    // Функции поиска
    smartSearch,
    searchGarbage,
    searchWaterOnly,
    searchAddresses,
    searchPhones,
    generateSuggestions,
    
    // Управление историей
    addToHistory,
    toggleFavorite,
    removeFromHistory,
    clearHistory,
    clearFavorites,
    
    // Статистика
    getSearchStats
  };
};

export default useSmartSearch; 