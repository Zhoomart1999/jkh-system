import React, { useState, useEffect, useRef } from 'react';
import { api } from "../services/mock-api"
import { SystemNotification, SystemNotificationType } from '../types';
import { BellIcon, UsersIcon, WrenchIcon, ToolIcon, DollarSignIcon } from './ui/Icons';

const NOTIFICATION_ICONS: { [key in SystemNotificationType]: React.ReactNode } = {
    [SystemNotificationType.NewUser]: <UsersIcon className="w-5 h-5 text-blue-500" />,
    [SystemNotificationType.TaskAssigned]: <WrenchIcon className="w-5 h-5 text-amber-500" />,
    [SystemNotificationType.LowStock]: <ToolIcon className="w-5 h-5 text-red-500" />,
    [SystemNotificationType.PaymentReversed]: <DollarSignIcon className="w-5 h-5 text-rose-500" />,
    [SystemNotificationType.CriticalTask]: <WrenchIcon className="w-5 h-5 text-red-700" />,
};

const NotificationCenter: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<SystemNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const data = await api.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleToggle = async () => {
        setIsOpen(prev => !prev);
        if (!isOpen && unreadCount > 0) {
            await api.markNotificationAsRead('all');
            setUnreadCount(0); // Optimistic update
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
                    <div className="p-3 font-semibold border-b">Уведомления</div>
                    <ul className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(n => (
                            <li key={n.id} className={`p-3 flex items-start gap-3 hover:bg-slate-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                                <div className="mt-1">{NOTIFICATION_ICONS[n.type]}</div>
                                <div>
                                    <p className="text-sm text-slate-700">{n.message}</p>
                                    <p className="text-xs text-slate-400">{new Date(n.createdAt).toLocaleString('ru-RU')}</p>
                                </div>
                            </li>
                        )) : (
                            <li className="p-4 text-center text-sm text-slate-500">Нет новых уведомлений</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;