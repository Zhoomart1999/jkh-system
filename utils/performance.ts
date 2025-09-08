// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Throttle function for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
        const key = resolver ? resolver(...args) : JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = func(...args);
        cache.set(key, result);
        return result;
    }) as T;
};

// Lazy loading utility
export const lazyLoad = <T>(
    importFunc: () => Promise<{ default: T }>
): (() => Promise<T>) => {
    let cached: T | null = null;
    let loading: Promise<T> | null = null;
    
    return async () => {
        if (cached) {
            return cached;
        }
        
        if (loading) {
            return loading;
        }
        
        loading = importFunc().then(module => {
            cached = module.default;
            loading = null;
            return cached;
        });
        
        return loading;
    };
};

// Performance monitoring
export class PerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();
    
    startTimer(label: string): () => void {
        const start = performance.now();
        
        return () => {
            const duration = performance.now() - start;
            if (!this.metrics.has(label)) {
                this.metrics.set(label, []);
            }
            this.metrics.get(label)!.push(duration);
        };
    }
    
    getAverageTime(label: string): number {
        const times = this.metrics.get(label);
        if (!times || times.length === 0) return 0;
        
        return times.reduce((sum, time) => sum + time, 0) / times.length;
    }
    
    getMetrics(): Record<string, number> {
        const result: Record<string, number> = {};
        for (const [label] of this.metrics.entries()) {
            result[label] = this.getAverageTime(label);
        }
        return result;
    }
    
    clear(): void {
        this.metrics.clear();
    }
}

// Global performance monitor
export const performanceMonitor = new PerformanceMonitor();

// Intersection Observer utility for lazy loading
export const createIntersectionObserver = (
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
): IntersectionObserver => {
    return new IntersectionObserver(callback, {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
        ...options
    });
};

// Virtual scrolling utility
export const createVirtualScroller = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number,
    overscan: number = 5
) => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(0 / itemHeight) - overscan);
    const endIndex = Math.min(items.length, startIndex + visibleCount + overscan * 2);
    
    return {
        startIndex,
        endIndex,
        visibleItems: items.slice(startIndex, endIndex),
        totalHeight: items.length * itemHeight,
        offsetY: startIndex * itemHeight
    };
}; 