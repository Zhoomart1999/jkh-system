
import React, { useEffect } from 'react';

interface PrintProviderProps {
    children: React.ReactNode;
    onAfterPrint?: () => void;
    title?: string;
    printStyle?: string;
}

export const PrintProvider: React.FC<PrintProviderProps> = ({
    children,
    onAfterPrint,
    title = 'Печать',
    printStyle = ''
}) => {
    useEffect(() => {
        const handleBeforePrint = () => {
            // Добавляем стили для печати
            if (printStyle) {
                const styleElement = document.createElement('style');
                styleElement.id = 'print-styles';
                styleElement.textContent = printStyle;
                document.head.appendChild(styleElement);
            }
        };

        const handleAfterPrint = () => {
            // Удаляем стили для печати
            const styleElement = document.getElementById('print-styles');
            if (styleElement) {
                styleElement.remove();
            }
            
            // Вызываем callback
            onAfterPrint?.();
        };

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, [onAfterPrint, printStyle]);

    return (
        <div className="print-content">
            {children}
        </div>
    );
};

// Default export для обратной совместимости
export default PrintProvider;
