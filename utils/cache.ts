// Интерфейс для кэш элемента
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live в миллисекундах
}

// Класс кэша
class Cache {
  private storage = new Map<string, CacheItem<any>>();
  private maxSize = 100; // Maximum number of cached items

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Clean up expired items
    this.cleanup();

    // Remove oldest item if cache is full
    if (this.storage.size >= this.maxSize) {
      const oldestKey = this.storage.keys().next().value;
      if (oldestKey) {
        this.storage.delete(oldestKey);
      }
    }

    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item is expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  size(): number {
    this.cleanup();
    return this.storage.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.storage.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.storage.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new Cache();

// Cache keys
export const cacheKeys = {
  ABONENTS: 'abonents',
  USERS: 'users',
  PAYMENTS: 'payments',
  REPORTS: 'reports',
  SETTINGS: 'settings'
} as const;

// Cache TTL values (in milliseconds)
export const cacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000  // 1 hour
} as const;

// Utility functions
export const getCachedData = <T>(key: string): T | null => {
  return cache.get<T>(key);
};

export const setCachedData = <T>(key: string, data: T, ttl: number = cacheTTL.MEDIUM): void => {
  cache.set(key, data, ttl);
};

export const invalidateCache = (key?: string): void => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export const isCached = (key: string): boolean => {
  return cache.has(key);
};

// Cache utilities for collections
export const cacheUtils = {
  // Invalidate all cache keys that start with a prefix
  invalidateByPrefix: (prefix: string): void => {
    for (const key of cache['storage'].keys()) {
      if (key.startsWith(prefix)) {
        cache.delete(key);
      }
    }
  },

  // Get cache statistics
  getStats: () => ({
    size: cache.size(),
    maxSize: cache['maxSize']
  }),

  // Clear expired items
  cleanup: (): void => {
    cache['cleanup']();
  }
}; 