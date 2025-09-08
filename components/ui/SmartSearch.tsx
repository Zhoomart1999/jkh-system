import React, { useState, useEffect, useRef } from 'react';

interface SearchSuggestion {
    id: string;
    type: 'abonent' | 'payment' | 'user' | 'general';
    title: string;
    subtitle?: string;
    data: any;
}

interface SmartSearchProps {
    className?: string;
    onAbonentSelect: (abonent: any) => void;
    onPaymentSelect: (payment: any) => void;
    onUserSelect: (user: any) => void;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({
    className = '',
    onAbonentSelect,
    onPaymentSelect,
    onUserSelect
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Моковые данные для демонстрации
    const mockSuggestions: SearchSuggestion[] = [
        {
            id: '1',
            type: 'abonent',
            title: 'Абакиров А.А.',
            subtitle: 'ул. Покровская, дом 55а',
            data: { id: '1', fullName: 'Абакиров А.А.', address: 'ул. Покровская, дом 55а' }
        },
        {
            id: '2',
            type: 'abonent',
            title: 'Абасов Б.Б.',
            subtitle: 'ул. Сансызбаева дом 28',
            data: { id: '2', fullName: 'Абасов Б.Б.', address: 'ул. Сансызбаева дом 28' }
        },
        {
            id: '3',
            type: 'payment',
            title: 'Платеж 1500 сом',
            subtitle: 'Абакиров А.А. - 15.01.2024',
            data: { id: '3', amount: 1500, abonentName: 'Абакиров А.А.', date: '2024-01-15' }
        }
    ];

    useEffect(() => {
        if (query.trim()) {
            // Фильтруем предложения по запросу
            const filtered = mockSuggestions.filter(suggestion =>
                suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
                suggestion.subtitle?.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered);
            setIsOpen(filtered.length > 0);
            setSelectedIndex(-1);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    handleSuggestionSelect(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
        }
    };

    const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
        switch (suggestion.type) {
            case 'abonent':
                onAbonentSelect(suggestion.data);
                break;
            case 'payment':
                onPaymentSelect(suggestion.data);
                break;
            case 'user':
                onUserSelect(suggestion.data);
                break;
        }
        setQuery('');
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'abonent':
                return '👤';
            case 'payment':
                return '💰';
            case 'user':
                return '👨‍💼';
            default:
                return '🔍';
        }
    };

    return (
        <div className={`relative ${className}`} ref={suggestionsRef}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim() && setIsOpen(suggestions.length > 0)}
                    placeholder="🔍 Умный поиск по абонентам, платежам, пользователям..."
                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                </div>
            </div>

            {/* Выпадающие предложения */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.id}
                            className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                                index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                            }`}
                            onClick={() => handleSuggestionSelect(suggestion)}
                        >
                            <div className="flex items-center">
                                <span className="text-lg mr-3">
                                    {getSuggestionIcon(suggestion.type)}
                                </span>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                        {suggestion.title}
                                    </div>
                                    {suggestion.subtitle && (
                                        <div className="text-sm text-gray-500">
                                            {suggestion.subtitle}
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {suggestion.type === 'abonent' ? 'Абонент' :
                                     suggestion.type === 'payment' ? 'Платеж' :
                                     suggestion.type === 'user' ? 'Пользователь' : 'Результат'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Подсказки по горячим клавишам */}
            {!query && (
                <div className="mt-2 text-xs text-gray-500">
                    💡 Используйте <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+F</kbd> для быстрого поиска
                </div>
            )}
        </div>
    );
}; 