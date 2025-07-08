import React, { useState } from 'react';
import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card from '../../../components/ui/Card';
import { api } from '../../../services/api';
import { DebtorsReportItem, UsedMaterialReportItem } from '../../../types';

const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} сом`;
type ReportType = 'debtors_report' | 'used_materials_report';

const DebtorsReport = () => {
    const [minDebt, setMinDebt] = useState<number>(500);
    const [reportData, setReportData] = useState<DebtorsReportItem[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateReport = async () => {
        setLoading(true);
        try {
            const data = await api.getDebtorsReport(minDebt);
            setReportData(data);
        } catch (error) {
            console.error("Failed to generate debtors report:", error);
            alert("Ошибка при создании отчета.");
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        if (!reportData) return;
        const dataToExport = reportData.map(item => ({ 'ФИО': item.fullName, 'Адрес': item.address, 'Телефон': item.phone, 'Долг': item.balance.toFixed(2) }));
        if (format === 'excel') {
            const worksheet = xlsx.utils.json_to_sheet(dataToExport);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Debtors');
            xlsx.writeFile(workbook, 'debtors_report.xlsx');
        } else {
            const response = await fetch('/fonts/Roboto-VariableFont_wdth,wght.ttf');
            const buffer = await response.arrayBuffer();
            const font = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            const doc = new jsPDF();
            doc.addFileToVFS('Roboto-VariableFont_wdth,wght.ttf', font);
            doc.addFont('Roboto-VariableFont_wdth,wght.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
            (doc as any).autoTable({ 
                head: [['ФИО', 'Адрес', 'Телефон', 'Долг (сом)']], 
                body: dataToExport.map(Object.values),
                styles: { font: 'Roboto' },
            });
            doc.save('debtors_report.pdf');
        }
    };

    return (
        <div>
            <div className="flex items-end gap-4 p-4 bg-slate-50 rounded-lg">
                <div>
                    <label htmlFor="min-debt" className="block text-sm font-medium text-slate-700">Минимальная сумма долга (сом)</label>
                    <input id="min-debt" type="number" value={minDebt} onChange={(e) => setMinDebt(Number(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md"/>
                </div>
                <button onClick={handleGenerateReport} disabled={loading} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg">{loading ? 'Генерация...' : 'Сформировать отчет'}</button>
            </div>
            {reportData && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2"><h3 className="font-semibold">Найдено {reportData.length} должников</h3><div className="flex gap-2"><button onClick={() => handleExport('excel')} className="text-sm bg-slate-200 px-3 py-1.5 rounded-lg">Excel</button><button onClick={() => handleExport('pdf')} className="text-sm bg-slate-200 px-3 py-1.5 rounded-lg">PDF</button></div></div>
                    <div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="p-2 text-left text-xs font-medium">ФИО</th><th className="p-2 text-left text-xs font-medium">Адрес</th><th className="p-2 text-left text-xs font-medium">Телефон</th><th className="p-2 text-right text-xs font-medium">Долг</th></tr></thead><tbody className="bg-white divide-y divide-slate-200">{reportData.map(item => (<tr key={item.id}><td className="p-2 font-medium">{item.fullName}</td><td className="p-2 text-sm">{item.address}</td><td className="p-2 text-sm">{item.phone}</td><td className="p-2 font-semibold text-red-600 text-right">{formatCurrency(item.balance)}</td></tr>))}</tbody></table></div>
                </div>
            )}
        </div>
    );
};

const UsedMaterialsReport = () => {
    const [reportData, setReportData] = useState<UsedMaterialReportItem[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const handleGenerateReport = async () => {
        setLoading(true);
        const data = await api.getUsedMaterialsReport(dates.start, dates.end);
        setReportData(data);
        setLoading(false);
    };

    const handleExport = async (format: 'excel' | 'pdf') => {
        if (!reportData) return;
        const dataToExport = reportData.map(item => ({ 'Наименование': item.name, 'Количество': item.quantity, 'Ед. изм.': item.unit }));
        if (format === 'excel') {
            const worksheet = xlsx.utils.json_to_sheet(dataToExport);
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Used Materials');
            xlsx.writeFile(workbook, `used_materials_${dates.start}_${dates.end}.xlsx`);
        } else {
            const response = await fetch('/fonts/Roboto-VariableFont_wdth,wght.ttf');
            const buffer = await response.arrayBuffer();
            const font = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            const doc = new jsPDF();
            doc.addFileToVFS('Roboto-VariableFont_wdth,wght.ttf', font);
            doc.addFont('Roboto-VariableFont_wdth,wght.ttf', 'Roboto', 'normal');
            doc.setFont('Roboto');
            doc.text(`Отчет по материалам с ${dates.start} по ${dates.end}`, 14, 15);
            (doc as any).autoTable({ startY: 20, head: [['Наименование', 'Количество', 'Ед. изм.']], body: dataToExport.map(Object.values), styles: { font: 'Roboto' } });
            doc.save(`used_materials_${dates.start}_${dates.end}.pdf`);
        }
    };
    
    return (
        <div>
            <div className="flex items-end gap-4 p-4 bg-slate-50 rounded-lg">
                <input type="date" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} className="mt-1 block px-3 py-2 border border-slate-300 rounded-md"/>
                <input type="date" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} className="mt-1 block px-3 py-2 border border-slate-300 rounded-md"/>
                <button onClick={handleGenerateReport} disabled={loading} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg">{loading ? 'Генерация...' : 'Сформировать'}</button>
            </div>
            {reportData && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2"><h3 className="font-semibold">Найдено {reportData.length} позиций</h3><div className="flex gap-2"><button onClick={() => handleExport('excel')} className="text-sm bg-slate-200 px-3 py-1.5 rounded-lg">Excel</button><button onClick={() => handleExport('pdf')} className="text-sm bg-slate-200 px-3 py-1.5 rounded-lg">PDF</button></div></div>
                    <div className="overflow-x-auto border rounded-lg"><table className="min-w-full divide-y divide-slate-200"><thead className="bg-slate-50"><tr><th className="p-2 text-left text-xs font-medium">Наименование</th><th className="p-2 text-right text-xs font-medium">Количество</th><th className="p-2 text-left text-xs font-medium">Ед. изм.</th></tr></thead><tbody className="bg-white divide-y divide-slate-200">{reportData.map(item => (<tr key={item.itemId}><td className="p-2 font-medium">{item.name}</td><td className="p-2 text-right font-semibold">{item.quantity}</td><td className="p-2">{item.unit}</td></tr>))}</tbody></table></div>
                </div>
            )}
        </div>
    )
}

const ReportsTab: React.FC = () => {
    const [activeReport, setActiveReport] = useState<ReportType>('debtors_report');

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Отчеты</h2>
                <select
                    value={activeReport}
                    onChange={(e) => setActiveReport(e.target.value as ReportType)}
                    className="block px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                    <option value="debtors_report">Отчет по должникам</option>
                    <option value="used_materials_report">Отчет по материалам</option>
                </select>
            </div>
            {activeReport === 'debtors_report' && <DebtorsReport />}
            {activeReport === 'used_materials_report' && <UsedMaterialsReport />}
        </Card>
    );
};

export default ReportsTab;

async function generatePDFWithCyrillic(text: string) {
    const response = await fetch("/fonts/Roboto-Regular.ttf");
    const buffer = await response.arrayBuffer();
    const font = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const doc = new jsPDF();
    doc.addFileToVFS("Roboto-Regular.ttf", font);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");
    doc.text(text, 10, 10);
    doc.save("report.pdf");
}
