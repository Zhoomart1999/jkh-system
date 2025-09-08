import React, { useState } from 'react';

interface Abonent {
    id: string;
    fullName: string;
    balance: number;
}

interface BulkOperationsProps {
    selectedAbonents: Abonent[];
    onBulkUpdate: (updates: any[]) => void;
    onBulkDelete: () => void;
    onBulkExport: () => void;
    onBulkImport: (file: File) => void;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
    selectedAbonents,
    onBulkUpdate,
    onBulkDelete,
    onBulkExport,
    onBulkImport
}) => {
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImportFile(file);
        }
    };

    const handleImport = () => {
        if (importFile) {
            onBulkImport(importFile);
            setIsImportModalOpen(false);
            setImportFile(null);
        }
    };

    const totalBalance = selectedAbonents.reduce((sum, a) => sum + a.balance, 0);
    const averageBalance = selectedAbonents.length > 0 ? totalBalance / selectedAbonents.length : 0;

    return (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Массовые операции:</h4>
            <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm text-gray-600 mr-2">
                    Выбрано: {selectedAbonents.length} абонентов
                </span>
                {selectedAbonents.length > 0 && (
                    <>
                        <span className="text-sm text-gray-600">
                            Общий баланс: {totalBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
                        </span>
                        <span className="text-sm text-gray-600">
                            Средний баланс: {averageBalance.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
                        </span>
                    </>
                )}
                <button
                    onClick={onBulkExport}
                    disabled={selectedAbonents.length === 0}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm disabled:bg-gray-300"
                >
                    Экспорт ({selectedAbonents.length})
                </button>
                <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                    Импорт
                </button>
                <button
                    onClick={() => onBulkUpdate([])}
                    disabled={selectedAbonents.length === 0}
                    className="px-3 py-1 bg-orange-500 text-white rounded text-sm disabled:bg-gray-300"
                >
                    Массовое обновление ({selectedAbonents.length})
                </button>
                <button
                    onClick={onBulkDelete}
                    disabled={selectedAbonents.length === 0}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm disabled:bg-gray-300"
                >
                    Массовое удаление ({selectedAbonents.length})
                </button>
            </div>

            {/* Модальное окно импорта */}
            {isImportModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Импорт абонентов</h3>
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Выберите файл Excel</label>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="text-sm text-gray-600">
                                <p>Поддерживаемые форматы: .xlsx, .xls, .csv</p>
                                <p>Файл должен содержать колонки: ФИО, Адрес, Телефон</p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsImportModalOpen(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={!importFile}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                Импортировать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 