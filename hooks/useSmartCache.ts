import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheOptions {
    maxSize: number;
    defaultTTL: number;
    cleanupInterval: number;
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export function useSmartCache<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    options: CacheOptions
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
    const lastFetchRef = useRef<number>(0);

    const cleanup = useCallback(() => {
        const now = Date.now();
        for (const [cacheKey, entry] of cacheRef.current.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                cacheRef.current.delete(cacheKey);
            }
        }
    }, []);

    const fetchData = useCallback(async () => {
        const now = Date.now();
        const cacheKey = key;
        const cachedEntry = cacheRef.current.get(cacheKey);

        // Проверяем кэш
        if (cachedEntry && (now - cachedEntry.timestamp) < cachedEntry.ttl) {
            setData(cachedEntry.data);
            return;
        }

        // Проверяем частоту запросов
        if (now - lastFetchRef.current < 1000) {
            return;
        }

        setLoading(true);
        setError(null);
        lastFetchRef.current = now;

        try {
            const result = await fetchFunction();
            
            // Сохраняем в кэш
            cacheRef.current.set(cacheKey, {
                data: result,
                timestamp: now,
                ttl: options.defaultTTL
            });

            // Очищаем старые записи если превышен лимит
            if (cacheRef.current.size > options.maxSize) {
                const entries = Array.from(cacheRef.current.entries());
                entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
                const toDelete = entries.slice(0, entries.length - options.maxSize);
                toDelete.forEach(([key]) => cacheRef.current.delete(key));
            }

            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [key, fetchFunction, options.defaultTTL, options.maxSize]);

    const refresh = useCallback(() => {
        cacheRef.current.delete(key);
        fetchData();
    }, [key, fetchData]);

    useEffect(() => {
        fetchData();
        
        const cleanupInterval = setInterval(cleanup, options.cleanupInterval);
        return () => clearInterval(cleanupInterval);
    }, [fetchData, cleanup, options.cleanupInterval]);

    return { data, loading, error, refresh };
} 