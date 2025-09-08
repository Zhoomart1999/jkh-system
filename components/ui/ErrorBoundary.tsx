import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNotifications } from '../../context/NotificationContext';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props & { showNotification: (notification: any) => void }, State> {
    constructor(props: Props & { showNotification: (notification: any) => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // Показываем уведомление об ошибке
        this.props.showNotification({
            type: 'error',
            title: 'Произошла ошибка',
            message: 'Что-то пошло не так. Попробуйте обновить страницу.'
        });

        // Здесь можно добавить логирование в Firebase
        // logErrorToFirebase(error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Что-то пошло не так
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Произошла неожиданная ошибка. Попробуйте обновить страницу или обратитесь к администратору.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Обновить страницу
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Обертка для использования с хуками
const ErrorBoundaryWrapper: React.FC<Props> = ({ children, fallback }) => {
    const { showNotification } = useNotifications();
    
    return (
        <ErrorBoundary showNotification={showNotification} fallback={fallback}>
            {children}
        </ErrorBoundary>
    );
};

export default ErrorBoundaryWrapper; 