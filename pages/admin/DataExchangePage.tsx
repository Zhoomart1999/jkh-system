import React, { useState, useRef } from 'react';
import { api } from '../../services/api';
import Card from '../../components/ui/Card';
import { UploadIcon, DownloadIcon } from '../../components/ui/Icons';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = xlsx.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = xlsx.utils.sheet_to_json(worksheet) as any[];

                // --- Улучшенная валидация ---
                const validStatuses = Object.values(AbonentStatus);
                const validBuildingTypes = Object.values(BuildingType);
                const validWaterTariffs = Object.values(WaterTariffType);

                const abonentsToImport: Omit<Abonent, 'id' | 'balance' | 'createdAt'>[] = [];

                for (const [index, row] of json.entries()) {
                    const rowNum = index + 2; // Excel rows are 1-based, plus header

                    if (!row.fullName || !row.address || !row.phone || row.numberOfPeople === undefined || !row.buildingType || !row.waterTariff || !row.status) {
                        throw new Error(`Ошибка в строке ${rowNum}: Отсутствуют обязательные данные (fullName, address, phone, numberOfPeople, buildingType, waterTariff, status).`);
                    }

                    if (!validStatuses.includes(row.status)) {
                        throw new Error(`Ошибка в строке ${rowNum}: Неверный статус '${row.status}'. Допустимые: ${validStatuses.join(', ')}.`);
                    }
                    if (!validBuildingTypes.includes(row.buildingType)) {
                        throw new Error(`Ошибка в строке ${rowNum}: Неверный тип здания '${row.buildingType}'. Допустимые: ${validBuildingTypes.join(', ')}.`);
                    }
                     if (!validWaterTariffs.includes(row.waterTariff)) {
                        throw new Error(`Ошибка в строке ${rowNum}: Неверный тип тарифа на воду '${row.waterTariff}'. Допустимые: ${validWaterTariffs.join(', ')}.`);
                    }
                    const numberOfPeople = Number(row.numberOfPeople);
                     if (isNaN(numberOfPeople) || numberOfPeople <= 0) {
                        throw new Error(`Ошибка в строке ${rowNum}: Неверное количество жильцов '${row.numberOfPeople}'.`);
                    }
                    
                    abonentsToImport.push({
                        fullName: String(row.fullName),
                        address: String(row.address),
                        phone: String(row.phone),
                        numberOfPeople: numberOfPeople,
                        buildingType: row.buildingType as BuildingType,
                        waterTariff: row.waterTariff as WaterTariffType,
                        status: row.status as AbonentStatus,
                        hasGarden: row.hasGarden === true || String(row.hasGarden).toLowerCase() === 'true',
                        gardenSize: row.gardenSize ? Number(row.gardenSize) : undefined,
                        controllerId: row.controllerId ? String(row.controllerId) : undefined,
                    });
                }
                
                // await api.bulkAddAbonents(abonentsToImport);
                for (const abonent of abonentsToImport) {
                  await api.createAbonent({
                    ...abonent,
                    balance: 0,
                    createdAt: new Date().toISOString(),
                  });
                }
                setImportMessage({ type: 'success', text: `Успешно импортировано ${abonentsToImport.length} абонентов.` });

            } catch (error: any) {
                setImportMessage({ type: 'error', text: error.message || 'Не удалось обработать файл.' });
            } finally {
                setImportLoading(false);
                if(fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExport = async (type: 'abonents' | 'payments', format: 'excel' | 'pdf') => {
        const loadingKey = `${type}-${format}`;
        setExportLoading(loadingKey);
        try {
            if (format === 'excel') {
                const data = type === 'abonents' ? await api.getAbonents() : await api.getPayments();
                const worksheet = xlsx.utils.json_to_sheet(data);
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet, 'Data');
                xlsx.writeFile(workbook, `${type}_export.xlsx`);
            } else if (format === 'pdf') {
                const doc = new jsPDF();
                
                const response = await fetch('/fonts/Roboto-VariableFont_wdth,wght.ttf');
                const buffer = await response.arrayBuffer();
                const font = btoa(String.fromCharCode(...new Uint8Array(buffer)));
                doc.addFileToVFS('Roboto-VariableFont_wdth,wght.ttf', font);
                doc.addFont('Roboto-VariableFont_wdth,wght.ttf', 'Roboto', 'normal');
                doc.setFont('Roboto');

                if (type === 'abonents') {
                    const data = await api.getAbonents();
                    (doc as any).autoTable({
                        head: [['ФИО', 'Адрес', 'Телефон', 'Баланс', 'Статус']],
                        body: data.map(a => [a.fullName, a.address, a.phone, a.balance.toFixed(2), a.status]),
                        styles: { font: 'Roboto' },
                    });
                } else if (type === 'payments') {
                    const data = await api.getPayments();
                    (doc as any).autoTable({
                        head: [['Дата', 'Абонент', 'Сумма', 'Кем записан']],
                        body: data.map(p => [new Date(p.date).toLocaleDateString(), p.abonentName, p.amount.toFixed(2), p.recordedByName]),
                        styles: { font: 'Roboto' },
                    });
                }
                doc.save(`${type}_export.pdf`);
            }
        } catch (error) {
            console.error(`Failed to export ${type} to ${format}:`, error);
        } finally {
            setExportLoading(null);
        }
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

                <Card>
                    <h2 className="text-xl font-semibold mb-4">Экспорт данных</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-2">Абоненты</h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleExport('abonents', 'excel')} disabled={!!exportLoading} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:bg-emerald-300">
                                    {exportLoading === 'abonents-excel' ? 'Экспорт...' : 'Excel'}
                                </button>
                                <button onClick={() => handleExport('abonents', 'pdf')} disabled={!!exportLoading} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:bg-rose-300">
                                    {exportLoading === 'abonents-pdf' ? 'Экспорт...' : 'PDF'}
                                </button>
                            </div>
                        </div>
                         <div>
                            <h3 className="font-medium mb-2">Платежи</h3>
                            <div className="flex space-x-2">
                                <button onClick={() => handleExport('payments', 'excel')} disabled={!!exportLoading} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:bg-emerald-300">
                                    {exportLoading === 'payments-excel' ? 'Экспорт...' : 'Excel'}
                                </button>
                                <button onClick={() => handleExport('payments', 'pdf')} disabled={!!exportLoading} className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:bg-rose-300">
                                     {exportLoading === 'payments-pdf' ? 'Экспорт...' : 'PDF'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DataExchangePage;
