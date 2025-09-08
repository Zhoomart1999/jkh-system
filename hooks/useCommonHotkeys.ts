import { useEffect } from 'react';

interface HotkeyHandlers {
    onNew?: () => void;
    onSave?: () => void;
    onFind?: () => void;
    onPrint?: () => void;
    onEscape?: () => void;
}

export function useCommonHotkeys(handlers: HotkeyHandlers) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + N - Новый
            if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
                event.preventDefault();
                handlers.onNew?.();
            }
            
            // Ctrl/Cmd + S - Сохранить
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handlers.onSave?.();
            }
            
            // Ctrl/Cmd + F - Поиск
            if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
                event.preventDefault();
                handlers.onFind?.();
            }
            
            // Ctrl/Cmd + P - Печать
            if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
                event.preventDefault();
                handlers.onPrint?.();
            }
            
            // Escape - Закрыть/Отмена
            if (event.key === 'Escape') {
                handlers.onEscape?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handlers]);
} 