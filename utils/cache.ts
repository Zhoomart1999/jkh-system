// Простой кэш для оптимизации запросов к Firebase
class Cache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const cache = new Cache();

// Ключи для кэширования
export const CACHE_KEYS = {
  ABONENTS: 'abonents',
  USERS: 'users',
  TARIFFS: 'tariffs',
  PAYMENTS: 'payments',
  NOTIFICATIONS: 'notifications',
  DASHBOARD_DATA: 'dashboard_data',
  RECEIPT_DETAILS: 'receipt_details',
} as const; 