import React, { createContext, useContext, useState, useCallback } from 'react';
import { Notification } from '../components/ui/NotificationToast';

interface NotificationContextType {
    notifications: Notification[];
    showNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = `notification_${Date.now()}_${Math.random()}`;
        const newNotification: Notification = {
            id,
            ...notification,
            duration: notification.duration || 5000
        };

        setNotifications(prev => [...prev, newNotification]);

        // Автоматически удаляем уведомление после указанной длительности
        setTimeout(() => {
            removeNotification(id);
        }, newNotification.duration);
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value: NotificationContextType = {
        notifications,
        showNotification,
        removeNotification,
        clearNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}; 