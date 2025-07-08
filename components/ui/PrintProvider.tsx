
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PrintProviderProps {
  children: React.ReactNode;
  onAfterPrint: () => void;
  title?: string;
  printStyle?: string;
}

const PrintProvider: React.FC<PrintProviderProps> = ({ children, onAfterPrint, title = 'Печать', printStyle }) => {
    const printWindowRef = useRef<Window | null>(null);
    const mountNodeRef = useRef<HTMLElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (!printWindow) {
            console.error("Could not open print window. Please check your browser's pop-up settings.");
            onAfterPrint();
            return;
        }

        printWindowRef.current = printWindow;
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>${title}</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    ${printStyle ? `<style>${printStyle}</style>` : ''}
                </head>
                <body>
                    <div id="print-root"></div>
                </body>
            </html>
        `);
        printWindow.document.close();

        mountNodeRef.current = printWindow.document.getElementById('print-root');
        setIsReady(true);

        const handleAfterPrint = () => {
            printWindow.close();
            onAfterPrint();
        };
        
        printWindow.addEventListener('afterprint', handleAfterPrint);
        
        const timer = setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);

        return () => {
            clearTimeout(timer);
            printWindow.removeEventListener('afterprint', handleAfterPrint);
            if (printWindow && !printWindow.closed) {
                printWindow.close();
            }
        };
    }, []);

    if (!isReady || !mountNodeRef.current) {
        return null;
    }

    return createPortal(children, mountNodeRef.current);
};

export default PrintProvider;
