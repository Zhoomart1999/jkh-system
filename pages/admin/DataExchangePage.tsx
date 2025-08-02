import React, { useState, useRef } from 'react';
import { api } from "../../services/mock-api"
import Card from '../../components/ui/Card';
import { UploadIcon, DownloadIcon } from '../../components/ui/Icons';
import { Abonent, Payment, FinancialPlan, AbonentStatus, BuildingType, WaterTariffType } from '../../types';


const DataExchangePage: React.FC = () => {
    const [importLoading, setImportLoading] = useState(false);
    const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [exportLoading, setExportLoading] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        setImportLoading(true);
        setImportMessage(null);
        
        // Простая заглушка для импорта
        setTimeout(() => {
            setImportMessage({ type: 'success', text: 'Функция импорта временно недоступна. Используйте форму добавления абонентов.' });
                setImportLoading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }, 1000);
    };




    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Импорт / Экспорт данных</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-xl font-semibold mb-2">Импорт абонентов</h2>
                    <p className="text-sm text-slate-500 mb-4">Загрузите файл .xlsx для массового добавления абонентов. Файл должен содержать столбцы: fullName, address, phone, numberOfPeople, buildingType, waterTariff, status.</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".xlsx"
                    />
                    <button
                        onClick={handleImportClick}
                        disabled={importLoading}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        <UploadIcon className="w-5 h-5" />
                        {importLoading ? 'Обработка...' : 'Выбрать файл для импорта'}
                    </button>
                    {importMessage && (
                        <div className={`mt-4 p-3 rounded-md text-sm ${importMessage.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {importMessage.text}
                        </div>
                    )}
                </Card>


            </div>
        </div>
    );
};

export default DataExchangePage;
