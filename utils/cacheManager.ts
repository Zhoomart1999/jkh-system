interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // время жизни в миллисекундах
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 минут по умолчанию

  // Сохранить данные в кэш
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Сохранить в localStorage для оффлайн режима
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }));
    } catch (error) {
      console.warn('Не удалось сохранить в localStorage:', error);
    }
  }

  // Получить данные из кэша
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      // Попробовать получить из localStorage
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Date.now() - parsed.timestamp < parsed.ttl) {
            this.cache.set(key, parsed);
            return parsed.data;
          }
        }
      } catch (error) {
        console.warn('Не удалось прочитать из localStorage:', error);
      }
      return null;
    }

    // Проверить, не истек ли срок действия
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Проверить, есть ли данные в кэше
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Удалить данные из кэша
  delete(key: string): void {
    this.cache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('Не удалось удалить из localStorage:', error);
    }
  }

  // Очистить весь кэш
  clear(): void {
    this.cache.clear();
    try {
      // Удалить все кэшированные данные из localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Не удалось очистить localStorage:', error);
    }
  }

  // Получить статистику кэша
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheManager = new CacheManager(); 