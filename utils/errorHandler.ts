import React from 'react';

// Типы ошибок
export enum ErrorType {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

// Интерфейс ошибки
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
  retryable: boolean;
}

// Интерфейс для уведомлений
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Класс для обработки ошибок
class ErrorHandler {
  private notifications: Notification[] = [];
  private retryQueue: Array<{
    id: string;
    operation: () => Promise<any>;
    maxRetries: number;
    currentRetry: number;
    delay: number;
  }> = [];

  // Создание ошибки
  createError(
    type: ErrorType,
    message: string,
    code?: string,
    details?: any,
    retryable: boolean = false
  ): AppError {
    return {
      type,
      message,
      code,
      details,
      timestamp: new Date(),
      retryable
    };
  }

  // Обработка ошибки Firebase
  handleFirebaseError(error: any): AppError {
    console.error('Firebase error:', error);

    // Определяем тип ошибки по коду
    const errorCode = error.code || error.message;
    
    switch (errorCode) {
      case 'permission-denied':
        return this.createError(
          ErrorType.AUTHORIZATION,
          'У вас нет прав для выполнения этого действия',
          errorCode,
          error,
          false
        );
      
      case 'unauthenticated':
        return this.createError(
          ErrorType.AUTHENTICATION,
          'Необходима авторизация. Пожалуйста, войдите в систему',
          errorCode,
          error,
          false
        );
      
      case 'not-found':
        return this.createError(
          ErrorType.NOT_FOUND,
          'Запрашиваемые данные не найдены',
          errorCode,
          error,
          false
        );
      
      case 'already-exists':
        return this.createError(
          ErrorType.VALIDATION,
          'Данные уже существуют',
          errorCode,
          error,
          false
        );
      
      case 'failed-precondition':
        return this.createError(
          ErrorType.VALIDATION,
          'Некорректные данные для операции',
          errorCode,
          error,
          false
        );
      
      case 'resource-exhausted':
        return this.createError(
          ErrorType.SERVER,
          'Превышен лимит запросов. Попробуйте позже',
          errorCode,
          error,
          true
        );
      
      case 'unavailable':
        return this.createError(
          ErrorType.NETWORK,
          'Сервис временно недоступен. Попробуйте позже',
          errorCode,
          error,
          true
        );
      
      case 'deadline-exceeded':
        return this.createError(
          ErrorType.NETWORK,
          'Превышено время ожидания ответа',
          errorCode,
          error,
          true
        );
      
      default:
        return this.createError(
          ErrorType.UNKNOWN,
          'Произошла неизвестная ошибка',
          errorCode,
          error,
          false
        );
    }
  }

  // Обработка сетевых ошибок
  handleNetworkError(error: any): AppError {
    console.error('Network error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK,
        'Нет подключения к интернету. Проверьте соединение',
        'NETWORK_OFFLINE',
        error,
        true
      );
    }
    
    if (error.status === 404) {
      return this.createError(
        ErrorType.NOT_FOUND,
        'Запрашиваемый ресурс не найден',
        'HTTP_404',
        error,
        false
      );
    }
    
    if (error.status >= 500) {
      return this.createError(
        ErrorType.SERVER,
        'Ошибка сервера. Попробуйте позже',
        `HTTP_${error.status}`,
        error,
        true
      );
    }
    
    return this.createError(
      ErrorType.NETWORK,
      'Ошибка сети. Попробуйте позже',
      'NETWORK_ERROR',
      error,
      true
    );
  }

  // Показ уведомления
  showNotification(notification: Omit<Notification, 'id'>): string {
    const id = Math.random().toString(36).substr(2, 9);
    const fullNotification: Notification = {
      id,
      ...notification,
      duration: notification.duration || 5000
    };
    
    this.notifications.push(fullNotification);
    this.emitNotificationChange();
    
    // Автоматическое удаление
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, fullNotification.duration);
    }
    
    return id;
  }

  // Удаление уведомления
  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emitNotificationChange();
  }

  // Получение всех уведомлений
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Retry механизм
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Ждем перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }

  // Добавление операции в очередь retry
  addToRetryQueue(
    operation: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ): string {
    const id = Math.random().toString(36).substr(2, 9);
    
    this.retryQueue.push({
      id,
      operation,
      maxRetries,
      currentRetry: 0,
      delay
    });
    
    // Запускаем обработку очереди
    this.processRetryQueue();
    
    return id;
  }

  // Обработка очереди retry
  private async processRetryQueue(): Promise<void> {
    if (this.retryQueue.length === 0) return;
    
    const item = this.retryQueue.shift();
    if (!item) return;
    
    try {
      await this.retryOperation(item.operation, item.maxRetries, item.delay);
    } catch (error) {
      const appError = this.handleFirebaseError(error);
      this.showNotification({
        type: 'error',
        title: 'Ошибка операции',
        message: appError.message,
        action: {
          label: 'Повторить',
          onClick: () => this.addToRetryQueue(item.operation, item.maxRetries, item.delay)
        }
      });
    }
  }

  // Глобальная обработка необработанных ошибок
  setupGlobalErrorHandling(): void {
    // Обработка необработанных ошибок
    window.addEventListener('error', (event) => {
      console.error('Unhandled error:', event.error);
      
      const appError = this.createError(
        ErrorType.UNKNOWN,
        'Произошла неожиданная ошибка',
        'UNHANDLED_ERROR',
        event.error,
        false
      );
      
      this.showNotification({
        type: 'error',
        title: 'Ошибка приложения',
        message: appError.message
      });
    });

    // Обработка необработанных промисов
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      const appError = this.createError(
        ErrorType.UNKNOWN,
        'Ошибка в асинхронной операции',
        'UNHANDLED_PROMISE',
        event.reason,
        false
      );
      
      this.showNotification({
        type: 'error',
        title: 'Ошибка операции',
        message: appError.message
      });
    });
  }

  // События для уведомлений
  private listeners: Array<() => void> = [];
  
  onNotificationChange(listener: () => void): void {
    this.listeners.push(listener);
  }
  
  private emitNotificationChange(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Создаем глобальный экземпляр
export const errorHandler = new ErrorHandler();

// Устанавливаем глобальную обработку ошибок
if (typeof window !== 'undefined') {
  errorHandler.setupGlobalErrorHandling();
}

// Хук для использования в React компонентах
export const useErrorHandler = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  
  React.useEffect(() => {
    const updateNotifications = () => {
      setNotifications(errorHandler.getNotifications());
    };
    
    errorHandler.onNotificationChange(updateNotifications);
    updateNotifications();
    
    return () => {
      // Cleanup если нужно
    };
  }, []);
  
  return {
    notifications,
    showNotification: errorHandler.showNotification.bind(errorHandler),
    removeNotification: errorHandler.removeNotification.bind(errorHandler),
    retryOperation: errorHandler.retryOperation.bind(errorHandler),
    addToRetryQueue: errorHandler.addToRetryQueue.bind(errorHandler)
  };
}; 