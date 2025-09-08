import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from "../../../src/firebase/real-api";
import { Abonent, Role, WaterTariffType, AbonentStatus } from '../../../types';
import Card from '../../../components/ui/Card';
import { EditIcon, TrashIcon, EyeIcon, CheckIcon, PrinterIcon, DownloadIcon, PlusIcon } from '../../../components/ui/Icons';
import { useNotifications } from '../../../context/NotificationContext';
import AbonentFormModal from './AbonentFormModal';
import AbonentHistoryModal from './AbonentHistoryModal';
import MassPrintModal from '../../../components/ui/MassPrintModal';
import { useAuth } from '../../../context/AuthContext';

// Простой Modal компонент
const SimpleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`bg-white rounded-lg shadow-xl w-full mx-4 ${sizeClasses[size]}`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const AbonentsTab: React.FC = () => {
    const { showNotification } = useNotifications();
    const [abonents, setAbonents] = useState<Abonent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ term: '', status: 'all', tariff: 'all', controllerId: 'all', searchType: 'all' });
    const [selectedAbonents, setSelectedAbonents] = useState<Set<string>>(new Set());
    const [controllers, setControllers] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAbonent, setEditingAbonent] = useState<Abonent | null>(null);
    const [historyAbonent, setHistoryAbonent] = useState<Abonent | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [abonentToDelete, setAbonentToDelete] = useState<Abonent | null>(null);
    const [isMassPrintModalOpen, setIsMassPrintModalOpen] = useState(false);
    
    // Для виртуализации и бесконечной прокрутки
    const [displayedAbonents, setDisplayedAbonents] = useState<Abonent[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);
    const itemsPerPage = 50; // Показываем по 50 абонентов за раз

    // Добавляем недостающие функции
    const handleSelectAllVisible = () => {
        const visibleAbonents = displayedAbonents.map(a => a.id);
        setSelectedAbonents(new Set(visibleAbonents));
    };

    const handleDeselectAllVisible = () => {
        setSelectedAbonents(new Set());
    };

    const handleExportToExcel = async (abonentsToExport: Abonent[]) => {
        try {
            // Создаем CSV данные (Excel формат)
            const headers = ['ID', 'ФИО', 'Адрес', 'Лицевой счет', 'Баланс', 'Долг за воду', 'Долг за мусор', 'Статус', 'Контролер'];
            const csvData = [
                headers.join(','),
                ...abonentsToExport.map(abonent => [
                    abonent.id,
                    `"${abonent.fullName}"`,
                    `"${abonent.address}"`,
                    abonent.personalAccount || '',
                    abonent.balance || 0,
                    abonent.waterDebt || 0,
                    abonent.garbageDebt || 0,
                    abonent.status,
                    abonent.controllerId || ''
                ].join(','))
            ].join('\n');

            // Создаем и скачиваем файл
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `абоненты_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showNotification({
                type: 'success',
                title: 'Экспорт завершен',
                message: 'Данные успешно экспортированы в Excel'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка экспорта',
                message: 'Не удалось экспортировать данные: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')
            });
        }
    };

    const handleMassUpdate = async () => {
        if (selectedAbonents.size === 0) return;
        
        try {
            const selectedAbonentsList = Array.from(selectedAbonents).map(id => abonents.find(a => a.id === id)!).filter(Boolean);
            
            // Показываем модальное окно для массового обновления
            const updateData = prompt('Введите данные для массового обновления (JSON формат):\nПример: {"status": "active", "waterService": true}');
            
            if (updateData) {
                const parsedData = JSON.parse(updateData);
                
                // Обновляем каждого выбранного абонента
                for (const abonent of selectedAbonentsList) {
                    await api.updateAbonent(abonent.id, parsedData);
                }
                
                // Обновляем локальное состояние
                setAbonents(prev => prev.map(abonent => 
                    selectedAbonents.has(abonent.id) 
                        ? { ...abonent, ...parsedData }
                        : abonent
                ));
                
                showNotification({
                    type: 'success',
                    title: 'Массовое обновление',
                    message: `Успешно обновлено ${selectedAbonentsList.length} абонентов!`
                });
                setSelectedAbonents(new Set()); // Сбрасываем выбор
            }
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка обновления',
                message: 'Ошибка при массовом обновлении: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')
            });
        }
    };

    const handleBulkDelete = async () => {
        if (selectedAbonents.size === 0) return;
        
        const confirmed = confirm(`Вы уверены, что хотите удалить ${selectedAbonents.size} абонентов? Это действие нельзя отменить!`);
        if (!confirmed) return;
        
        try {
            const selectedAbonentsList = Array.from(selectedAbonents).map(id => abonents.find(a => a.id === id)!).filter(Boolean);
            
            // Удаляем каждого выбранного абонента
            for (const abonent of selectedAbonentsList) {
                await api.deleteAbonent(abonent.id);
            }
            
            // Обновляем локальное состояние
            setAbonents(prev => prev.filter(abonent => !selectedAbonents.has(abonent.id)));
            setSelectedAbonents(new Set()); // Сбрасываем выбор
            
            showNotification({
                type: 'success',
                title: 'Массовое удаление',
                message: `Успешно удалено ${selectedAbonentsList.length} абонентов!`
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: 'Ошибка при массовом удалении: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')
            });
        }
    };

    // Временные данные для тестирования (если Firebase не работает)
    const fallbackAbonents = [
        {
            id: '1',
            fullName: 'Эгембердиев',
            address: 'ул. Покровская, дом 85',
            personalAccount: '25080646',
            balance: 124.10,
            waterDebt: 0,
            garbageDebt: 0,
            status: 'active',
            waterTariff: 'by_meter',
            waterService: true,
            garbageService: true,
            hasGarden: false,
            currentMeterReading: 0,
            prevMeterReading: 0,
            controllerName: 'Тагаева С.Ж.',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            fullName: 'Тагаева С.Ж.',
            address: 'ул. Космонавтов дом 74',
            personalAccount: '25080308',
            balance: 326.78,
            waterDebt: 0,
            garbageDebt: 0,
            status: 'active',
            waterTariff: 'by_meter',
            waterService: true,
            garbageService: true,
            hasGarden: false,
            currentMeterReading: 0,
            prevMeterReading: 0,
            controllerName: 'Тагаева С.Ж.',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            fullName: 'Эдилалиев',
            address: 'ул. Космонавтов дом 74',
            personalAccount: '25080308',
            balance: 326.78,
            waterDebt: 0,
            garbageDebt: 0,
            status: 'active',
            waterTariff: 'by_meter',
            waterService: true,
            garbageService: true,
            hasGarden: false,
            currentMeterReading: 0,
            prevMeterReading: 0,
            controllerName: 'Тагаева С.Ж.',
            createdAt: new Date().toISOString()
        }
    ];

    // Загружаем абонентов и контроллеров при монтировании
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [abonentsData, controllersData] = await Promise.all([
                    api.getAbonents(),
                    api.getControllers()
                ]);
                setAbonents(abonentsData);
                setControllers(controllersData);
                setDisplayedAbonents(abonentsData.slice(0, itemsPerPage));
            } catch (error) {
                showNotification('error', 'Ошибка загрузки', 'Не удалось загрузить данные');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [showNotification]);

    // Загружаем абонентов для текущей страницы
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newAbonents = abonents.slice(startIndex, endIndex);

        if (currentPage === 1) {
            setDisplayedAbonents(newAbonents);
        } else {
            setDisplayedAbonents(prev => [...prev, ...newAbonents]);
        }

        setHasMore(endIndex < abonents.length);
    }, [abonents, currentPage]);

    // Загружаем контролеров
    useEffect(() => {
        const loadControllers = async () => {
            try {
                const controllersData = await api.getControllers();
                setControllers(controllersData);
            } catch (error) {
                // Создаем тестовых контролеров если API не работает
                const fallbackControllers = [
                    { id: '1', name: 'Тагаева С.Ж.' },
                    { id: '2', name: 'Иванов И.И.' },
                    { id: '3', name: 'Петров П.П.' },
                    { id: '4', name: 'Сидоров С.С.' }
                ];
                setControllers(fallbackControllers);
            }
        };
        loadControllers();
    }, []);

    // Обработчик скролла для бесконечной прокрутки
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !isLoadingMore) {
            setIsLoadingMore(true);
            setTimeout(() => {
                setCurrentPage(prev => prev + 1);
                setIsLoadingMore(false);
            }, 500);
        }
    }, [hasMore, isLoadingMore]);

    // Расширенная фильтрация с поиском по мусору и воде
    const filteredAbonents = useMemo(() => {
        let filtered = displayedAbonents;
        
        // Фильтр по типу поиска
        if (filters.searchType === 'garbage') {
            filtered = filtered.filter(a => 
                a.fullName.toLowerCase().includes('мусор') ||
                a.address.toLowerCase().includes('мусор') ||
                a.fullName.toLowerCase().includes('garbage') ||
                a.address.toLowerCase().includes('garbage') ||
                a.fullName.toLowerCase().includes('таштанды') ||
                a.address.toLowerCase().includes('таштанды')
            );
        } else if (filters.searchType === 'water') {
            filtered = filtered.filter(a => 
                a.fullName.toLowerCase().includes('вода') ||
                a.address.toLowerCase().includes('вода') ||
                a.fullName.toLowerCase().includes('water') ||
                a.address.toLowerCase().includes('water') ||
                a.fullName.toLowerCase().includes('суу') ||
                a.address.toLowerCase().includes('суу') ||
                a.waterTariff === 'by_meter' ||
                a.waterTariff === 'by_person'
            );
        }
        
        // Обычные фильтры
        filtered = filtered.filter(a => 
            a.fullName.toLowerCase().includes(filters.term.toLowerCase()) ||
            a.address.toLowerCase().includes(filters.term.toLowerCase())
        );
        
        filtered = filtered.filter(a => filters.status === 'all' || a.status === filters.status);
        filtered = filtered.filter(a => filters.tariff === 'all' || a.waterTariff === filters.tariff);
        filtered = filtered.filter(a => filters.controllerId === 'all' || a.controllerId === filters.controllerId);
        
        return filtered;
    }, [displayedAbonents, filters]);

    const handleSelectAbonent = (id: string, isSelected: boolean) => {
        const newSelection = new Set(selectedAbonents);
        if (isSelected) {
            newSelection.add(id);
        } else {
            newSelection.delete(id);
        }
        setSelectedAbonents(newSelection);
    };

    // Выбрать всех абонентов (включая тех, что еще не загружены)
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Выбираем всех абонентов из всех страниц
            const allIds = abonents.map(a => a.id);
            setSelectedAbonents(new Set(allIds));
        } else {
            setSelectedAbonents(new Set());
        }
    };

    // Функция для открытия квитанций
    const handleOpenReceiptModal = () => {
        if (selectedAbonents.size === 0) {
            showNotification({
                type: 'warning',
                title: 'Предупреждение',
                message: 'Выберите абонентов для печати квитанций.'
            });
            return;
        }
        setIsReceiptModalOpen(true);
    };

    // Функция для открытия реестра
    const handleOpenRegistryModal = () => {
        if (selectedAbonents.size === 0) {
            showNotification({
                type: 'warning',
                title: 'Предупреждение',
                message: 'Выберите абонентов для реестра показаний.'
            });
            return;
        }
        // Открываем массовую печать с реестром
        setIsMassPrintModalOpen(true);
    };

    // Функция для закрытия чека
    const handleCloseCheck = async (abonent: Abonent) => {
        try {
            // Создаем закрытие чека
            const checkClosing = await api.createCheckClosing({
                abonentId: abonent.id,
                abonentName: abonent.fullName,
                abonentAddress: abonent.address,
                personalAccount: abonent.personalAccount || '',
                waterDebt: abonent.waterDebt || 0,
                garbageDebt: abonent.garbageDebt || 0,
                totalDebt: Math.abs(abonent.balance),
                controllerName: controllers.find(c => c.id === abonent.controllerId)?.name || 'Не назначен',
                closingDate: new Date().toISOString(),
                status: 'closed'
            });

            // Обновляем долг абонента (уменьшаем)
            const updatedAbonent = { ...abonent };
            if (abonent.balance < 0) {
                // Если есть долг, уменьшаем его
                const debtReduction = Math.min(Math.abs(abonent.balance), 100); // Уменьшаем на 100 сом или весь долг
                updatedAbonent.balance = abonent.balance + debtReduction;
                updatedAbonent.waterDebt = Math.max(0, (abonent.waterDebt || 0) - debtReduction * 0.7);
                updatedAbonent.garbageDebt = Math.max(0, (abonent.garbageDebt || 0) - debtReduction * 0.3);
            }

            // Обновляем абонента в базе
            await api.updateAbonent(abonent.id, updatedAbonent);

            // Обновляем локальное состояние
            setAbonents(prev => prev.map(a => a.id === abonent.id ? updatedAbonent : a));

            showNotification({
                type: 'success',
                title: 'Чек закрыт',
                message: 'Долг абонента обновлен.'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка закрытия чека',
                message: 'Ошибка при закрытии чека: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')
            });
        }
    };

    const handleDeleteAbonent = (abonent: Abonent) => {
        setAbonentToDelete(abonent);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteAbonent = async () => {
        if (!abonentToDelete) return;

        try {
            await api.deleteAbonent(abonentToDelete.id);
            
            // Обновляем локальное состояние
            setAbonents(prev => prev.filter(a => a.id !== abonentToDelete.id));
            setSelectedAbonents(prev => {
                const newSet = new Set(prev);
                newSet.delete(abonentToDelete.id);
                return newSet;
            });
            
            setAbonentToDelete(null);
            setIsDeleteModalOpen(false);
            showNotification({
                type: 'success',
                title: 'Удаление абонента',
                message: 'Абонент успешно удален!'
            });
        } catch (error) {
            showNotification({
                type: 'error',
                title: 'Ошибка удаления',
                message: 'Ошибка при удалении абонента. Попробуйте еще раз.'
            });
        }
    };

    if (loading) return <p>Загрузка абонентов...</p>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6">
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                <h2 className="text-xl font-semibold">Управление абонентами</h2>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Добавить абонента
                    </button>
                    <button onClick={handleOpenReceiptModal} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Квитанции
                    </button>
                    <button 
                        onClick={handleOpenRegistryModal} 
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Реестр показаний
                    </button>
                    <button
                        onClick={() => setIsMassPrintModalOpen(true)}
                        disabled={selectedAbonents.size === 0}
                        className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                    >
                        Массовая печать ({selectedAbonents.size})
                    </button>
                </div>
            </div>
            
            {/* Массовые операции */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Массовые операции:</h4>
                <div className="flex gap-2 flex-wrap items-center">
                    <button
                        onClick={handleSelectAllVisible}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                        Выбрать всех видимых
                    </button>
                    <button
                        onClick={handleDeselectAllVisible}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                    >
                        Снять выбор с видимых
                    </button>
                    <span className="text-sm text-gray-600 ml-2">
                        Выбрано: {selectedAbonents.size} из {abonents.length}
                    </span>
                    <button
                        onClick={async () => {
                            try {
                                const selectedAbonentsList = Array.from(selectedAbonents).map(id => abonents.find(a => a.id === id)!).filter(Boolean);
                                await handleExportToExcel(selectedAbonentsList);
                            } catch (error) {
                                showNotification({
                                    type: 'error',
                                    title: 'Ошибка экспорта',
                                    message: 'Ошибка при экспорте: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')
                                });
                            }
                        }}
                        disabled={selectedAbonents.size === 0}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
                    >
                        Экспорт ({selectedAbonents.size})
                    </button>
                    <button
                        onClick={handleMassUpdate}
                        disabled={selectedAbonents.size === 0}
                        className="px-3 py-1 bg-orange-500 text-white rounded text-sm disabled:bg-gray-300"
                    >
                        Массовое обновление ({selectedAbonents.size})
                    </button>
                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedAbonents.size === 0}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:bg-gray-300"
                    >
                        Массовое удаление ({selectedAbonents.size})
                    </button>
                </div>
            </div>
            
            {/* Расширенный поиск */}
            <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">🌐 Расширенный поиск</h4>
                    <div className="flex space-x-2 mb-3">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, searchType: 'all' }))}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                filters.searchType === 'all'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Все
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, searchType: 'water' }))}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                filters.searchType === 'water'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🌊 Только вода
                        </button>
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, searchType: 'garbage' }))}
                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                filters.searchType === 'garbage'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🗑️ Только мусор
                        </button>
                    </div>
                    <input
                        type="text"
                        placeholder={
                            filters.searchType === 'water' ? 'Поиск по воде...' :
                            filters.searchType === 'garbage' ? 'Поиск по мусору...' :
                            'Умный поиск...'
                        }
                        value={filters.term}
                        onChange={e => setFilters(prev => ({ ...prev, term: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Поиск по имени/адресу..."
                    value={filters.term}
                    onChange={e => setFilters({...filters, term: e.target.value})}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm md:col-span-1"
                />
                <select
                    value={filters.status}
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="all">Все статусы</option>
                    <option value="active">Активные</option>
                    <option value="disconnected">Отключенные</option>
                    <option value="archived">Архивные</option>
                </select>
                <select
                    value={filters.tariff}
                    onChange={e => setFilters({...filters, tariff: e.target.value})}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="all">Все тарифы на воду</option>
                    <option value="by_meter">По счетчику</option>
                    <option value="by_person">По количеству людей</option>
                </select>
                <select
                    value={filters.controllerId}
                    onChange={e => setFilters({...filters, controllerId: e.target.value})}
                    className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="all">Все контролёры</option>
                    {controllers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            
            {/* Информация о результатах */}
            <div className="mb-4 text-sm text-gray-600">
                Показано {filteredAbonents.length} из {displayedAbonents.length} загруженных, всего {abonents.length} абонентов
                {filters.searchType !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {filters.searchType === 'water' ? '🌊 Фильтр: только вода' : '🗑️ Фильтр: только мусор'}
                    </span>
                )}
                {hasMore && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        🔄 Прокрутите вниз для загрузки еще
                    </span>
                )}
            </div>
            
            {/* Виртуализированная таблица с бесконечной прокруткой */}
            <div
                ref={tableRef}
                className="overflow-y-auto border border-gray-200 rounded-lg"
                style={{ height: '600px' }}
                onScroll={handleScroll}
            >
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <input
                                    type="checkbox"
                                    checked={selectedAbonents.size === abonents.length && abonents.length > 0}
                                    onChange={handleSelectAll}
                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    title="Выбрать всех абонентов"
                                />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ФИО
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Адрес
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Лицевой счет
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Контролер
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div>
                                    Баланс
                                    <div className="text-xs text-slate-400 font-normal mt-1">
                                        🟢 Должен нам | 🔴 Переплатил
                                    </div>
                                </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Статус
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAbonents.map((abonent) => (
                            <tr key={abonent.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="checkbox"
                                        checked={selectedAbonents.has(abonent.id)}
                                        onChange={(e) => handleSelectAbonent(abonent.id, e.target.checked)}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="font-medium text-slate-900">{abonent.fullName}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span>{abonent.address}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                                        {abonent.personalAccount || 'Не назначен'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm">
                                        {controllers.find(c => c.id === abonent.controllerId)?.name || '-'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                        abonent.balance < 0
                                            ? 'bg-red-100 text-red-800 border border-red-200'
                                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}>
                                        {abonent.balance < 0 ? '🔴' : '🟢'}
                                        {abonent.balance < 0 ? '-' : '+'}
                                        {Math.abs(abonent.balance).toLocaleString('ru-RU', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })} сом
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        abonent.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                        {abonent.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-1 justify-end">
                                        <button 
                                            onClick={() => {
                                                // Показываем детали абонента
                                                showNotification({
                                                    type: 'info',
                                                    title: 'Детали абонента',
                                                    message: `ФИО: ${abonent.fullName}\nАдрес: ${abonent.address}\nЛицевой счет: ${abonent.personalAccount || 'Не назначен'}\nБаланс: ${abonent.balance} сом\nКонтролер: ${controllers.find(c => c.id === abonent.controllerId)?.name || 'Не назначен'}`
                                                });
                                            }}
                                            className="text-slate-500 hover:text-blue-600 p-1"
                                            title="Детали"
                                        >
                                            👁️
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditingAbonent(abonent);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-slate-500 hover:text-blue-600 p-1"
                                            title="Редактировать"
                                        >
                                            ✏️
                                        </button>
                                        <button 
                                            onClick={() => handleCloseCheck(abonent)}
                                            className="text-slate-500 hover:text-green-600 p-1" 
                                            title="Закрыть чек"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAbonent(abonent)}
                                            className="text-slate-500 hover:text-red-600 p-1"
                                            title="Удалить"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Индикатор загрузки */}
                        {isLoadingMore && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Загрузка еще абонентов...</span>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Сообщение о конце списка */}
                        {!hasMore && filteredAbonents.length > 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    Все абоненты загружены
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Модальные окна */}
            {/* Модальное окно для добавления/редактирования абонента */}
            <AbonentFormModal
                abonent={editingAbonent}
                onSave={() => {
                    setIsModalOpen(false);
                    setEditingAbonent(null);
                    // Перезагружаем список абонентов
                    // loadAbonents(); // This function is not defined in the original file
                }}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAbonent(null);
                }}
                controllers={controllers}
                isOpen={isModalOpen}
            />

            {/* Модальное окно для квитанций */}
            <SimpleModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                title="Печать квитанций"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Выбранные абоненты для печати квитанций:</h4>
                        <div className="space-y-2">
                            {Array.from(selectedAbonents).map(id => {
                                const abonent = abonents.find(a => a.id === id);
                                return abonent ? (
                                    <div key={id} className="flex justify-between items-center p-2 bg-white rounded border">
                                        <span>{abonent.fullName}</span>
                                        <span className="text-sm text-gray-600">{abonent.personalAccount}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Информация о печати:</h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Будут сгенерированы квитанции для всех выбранных абонентов.</li>
                            <li>• Убедитесь, что принтер подключен и готов к работе.</li>
                            <li>• Всего абонентов: {selectedAbonents.size}</li>
                        </ul>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsReceiptModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={() => {
                                setIsReceiptModalOpen(false);
                                setIsMassPrintModalOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Печатать квитанции
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* Модальное окно для удаления */}
            <SimpleModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Подтверждение удаления"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Вы уверены, что хотите удалить абонента <strong>{abonentToDelete?.fullName}</strong>?
                    </p>
                    <p className="text-sm text-red-600">
                        Это действие нельзя отменить!
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={confirmDeleteAbonent}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                            Удалить
                        </button>
                    </div>
                </div>
            </SimpleModal>

            {/* Модальное окно массовой печати */}
            {isMassPrintModalOpen && (
                <MassPrintModal
                    isOpen={isMassPrintModalOpen}
                    onClose={() => setIsMassPrintModalOpen(false)}
                    selectedAbonents={Array.from(selectedAbonents).map(id => abonents.find(a => a.id === id)!).filter(Boolean)}
                />
            )}
        </div>
    );
};

export default AbonentsTab;