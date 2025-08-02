import React, { useState } from 'react';
import { api } from "../../services/mock-api"
import { Abonent, MeterReading } from '../../types';
import Card from '../../components/ui/Card';
import { UploadIcon, DownloadIcon, ExclamationTriangleIcon, CheckIcon, ClockIcon } from '../../components/ui/Icons';

interface ImportedReading {
    abonentId: string;
    abonentName: string;
    address: string;
    oldReading: number;
    newReading: number;
    consumption: number;
    isAbnormal: boolean;
    error?: string;
}

const BulkReadingsPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [importedData, setImportedData] = useState<ImportedReading[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFile = event.target.files?.[0];
        if (uploadedFile && uploadedFile.type === 'text/csv') {
            setFile(uploadedFile);
            processFile(uploadedFile);
        } else {
            alert('Пожалуйста, выберите CSV файл');
        }
    };

    const processFile = async (uploadedFile: File) => {
        setLoading(true);
        try {
            const text = await uploadedFile.text();
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Проверяем структуру файла
            const requiredColumns = ['abonent_id', 'reading'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));
            
            if (missingColumns.length > 0) {
                alert(`Отсутствуют обязательные колонки: ${missingColumns.join(', ')}`);
                return;
            }

            const abonentIdIndex = headers.indexOf('abonent_id');
            const readingIndex = headers.indexOf('reading');

            const readings: ImportedReading[] = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                const abonentId = values[abonentIdIndex];
                const newReading = parseFloat(values[readingIndex]);

                if (isNaN(newReading)) {
                    readings.push({
                        abonentId,
                        abonentName: 'Неизвестно',
                        address: 'Неизвестно',
                        oldReading: 0,
                        newReading: 0,
                        consumption: 0,
                        isAbnormal: false,
                        error: 'Некорректное значение показания'
                    });
                    continue;
                }

                // Имитация получения данных абонента
                const mockAbonent = {
                    id: abonentId,
                    fullName: `Абонент ${abonentId}`,
                    address: `Адрес ${abonentId}`,
                    lastMeterReading: Math.floor(Math.random() * 1000)
                };

                const oldReading = mockAbonent.lastMeterReading;
                const consumption = newReading - oldReading;
                const isAbnormal = consumption < 0 || consumption > 1000; // Аномальное потребление

                readings.push({
                    abonentId,
                    abonentName: mockAbonent.fullName,
                    address: mockAbonent.address,
                    oldReading,
                    newReading,
                    consumption,
                    isAbnormal
                });
            }

            setImportedData(readings);
        } catch (error) {
            alert('Ошибка при обработке файла');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        const template = 'abonent_id,reading\n1,1234\n2,5678\n3,9012';
        const blob = new Blob([template], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_readings.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const saveReadings = async () => {
        if (!confirm(`Сохранить показания для ${importedData.length} абонентов?`)) return;
        
        setProcessing(true);
        try {
            // Имитация сохранения
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            alert(`Показания успешно сохранены для ${importedData.length} абонентов`);
            setImportedData([]);
            setFile(null);
        } catch (error) {
            alert('Ошибка при сохранении показаний');
        } finally {
            setProcessing(false);
        }
    };

    const getAbnormalReadings = () => importedData.filter(r => r.isAbnormal);
    const getValidReadings = () => importedData.filter(r => !r.isAbnormal && !r.error);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Массовый импорт показаний</h1>

            {/* Загрузка файла */}
            <Card>
                <div className="flex items-center gap-4 mb-4">
                    <UploadIcon className="w-6 h-6 text-slate-500" />
                    <h3 className="text-lg font-semibold">Загрузка файла с показаниями</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button
                            onClick={downloadTemplate}
                            className="bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Скачать шаблон
                        </button>
                    </div>
                    
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Формат CSV файла:</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p><strong>abonent_id</strong> - ID абонента</p>
                            <p><strong>reading</strong> - Новое показание счетчика</p>
                        </div>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-900 mb-2">Месяц показаний:</h4>
                        <input
                            type="month"
                            value={currentMonth}
                            onChange={(e) => setCurrentMonth(e.target.value)}
                            className="block px-3 py-2 border border-yellow-300 rounded-md shadow-sm focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                    </div>
                </div>
            </Card>

            {/* Результаты импорта */}
            {importedData.length > 0 && (
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <CheckIcon className="w-6 h-6 text-green-500" />
                            <h3 className="text-lg font-semibold">
                                Результаты импорта ({importedData.length} записей)
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={saveReadings}
                                disabled={processing}
                                className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-300 flex items-center gap-2"
                            >
                                <CheckIcon className="w-4 h-4" />
                                {processing ? 'Сохранение...' : 'Сохранить показания'}
                            </button>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{getValidReadings().length}</div>
                            <div className="text-sm text-green-700">Корректные показания</div>
                        </div>
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{getAbnormalReadings().length}</div>
                            <div className="text-sm text-red-700">Аномальные показания</div>
                        </div>
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">
                                {importedData.filter(r => r.error).length}
                            </div>
                            <div className="text-sm text-yellow-700">Ошибки</div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {getValidReadings().reduce((sum, r) => sum + r.consumption, 0)}
                            </div>
                            <div className="text-sm text-blue-700">Общее потребление</div>
                        </div>
                    </div>

                    {/* Таблица результатов */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Абонент
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Адрес
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Предыдущее
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Новое
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Потребление
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Статус
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {importedData.map((reading, index) => (
                                    <tr key={index} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {reading.abonentName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {reading.address}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {reading.oldReading}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {reading.newReading}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {reading.consumption}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {reading.error ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Ошибка
                                                </span>
                                            ) : reading.isAbnormal ? (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Аномалия
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    OK
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Предупреждения */}
                    {getAbnormalReadings().length > 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                                <span className="font-medium text-yellow-900">Внимание: аномальные показания</span>
                            </div>
                            <p className="text-sm text-yellow-700">
                                Обнаружены показания с необычно высоким или отрицательным потреблением. 
                                Рекомендуется проверить эти показания перед сохранением.
                            </p>
                        </div>
                    )}
                </Card>
            )}

            {importedData.length === 0 && !loading && (
                <Card>
                    <div className="text-center py-12">
                        <UploadIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">Загрузите файл с показаниями</h3>
                        <p className="text-slate-500">Выберите CSV файл с показаниями счетчиков для массового импорта</p>
                    </div>
                </Card>
            )}

            {loading && (
                <Card>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <ClockIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <p className="text-slate-500">Обработка файла...</p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default BulkReadingsPage; 