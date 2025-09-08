import React, { useEffect, useState } from 'react';
import { CheckIcon, XIcon, ExclamationTriangleIcon, InformationCircleIcon } from './Icons';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

interface NotificationToastProps {
    notification: Notification;
    onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onClose(notification.id), 300);
        }, notification.duration || 5000);

        return () => clearTimeout(timer);
    }, [notification.id, notification.duration, onClose]);

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckIcon className="w-5 h-5 text-green-500" />;
            case 'error':
                return <XIcon className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            case 'info':
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = () => {
        switch (notification.type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
                return 'text-blue-800';
            default:
                return 'text-blue-800';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div className={`${getBgColor()} border rounded-lg shadow-lg p-4`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${getTextColor()}`}>
                            {notification.title}
                        </h3>
                        <p className={`mt-1 text-sm ${getTextColor()}`}>
                            {notification.message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setTimeout(() => onClose(notification.id), 300);
                            }}
                            className={`inline-flex rounded-md p-1.5 ${getTextColor()} hover:bg-white hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600`}
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast; 