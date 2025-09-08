import React, { Suspense, lazy, ComponentType } from 'react';

interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: any;
}

// Красивый индикатор загрузки
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="relative">
      {/* Внешний круг */}
      <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-pulse"></div>
      {/* Вращающийся внутренний круг */}
      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
      {/* Точка в центре */}
      <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
    </div>
    <div className="ml-4 text-blue-600 font-medium">Загрузка...</div>
  </div>
);

// Компонент для ленивой загрузки
export function LazyLoader({ component, fallback = <LoadingSpinner />, props }: LazyLoaderProps) {
  const LazyComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Хук для создания ленивого компонента
export function useLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazy(importFunc);
}

// Предзагрузка компонентов
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return () => {
    importFunc();
  };
}

// Компонент с прогрессивной загрузкой
export function ProgressiveLoader({ 
  component, 
  fallback, 
  props,
  onLoadStart,
  onLoadComplete,
  onLoadError 
}: LazyLoaderProps & {
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onLoadError?: (error: Error) => void;
}) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    setLoading(true);
    onLoadStart?.();
    
    component()
      .then(() => {
        setLoading(false);
        onLoadComplete?.();
      })
      .catch((err) => {
        setError(err);
        onLoadError?.(err);
      });
  }, [component, onLoadStart, onLoadComplete, onLoadError]);

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="font-medium">Ошибка загрузки</div>
          <div className="text-sm text-gray-500 mt-1">{error.message}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return fallback || <LoadingSpinner />;
  }

  const LazyComponent = lazy(component);
  return (
    <Suspense fallback={fallback || <LoadingSpinner />}>
      <LazyComponent {...props} />
    </Suspense>
  );
} 