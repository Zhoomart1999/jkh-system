import React, { useRef } from 'react';
import { Abonent } from '../../types';
import * as xlsx from 'xlsx';
import PrintProvider from '../ui/PrintProvider';

interface ControllerReportTableProps {
  abonents: Abonent[];
}

const printStyle = `
  @media print {
    body { -webkit-print-color-adjust: exact; color-adjust: exact; }
    .controller-report-table { font-size: 14px; }
    th, td { font-size: 14px !important; }
    .no-print { display: none !important; }
  }
`;

const ControllerReportTable: React.FC<ControllerReportTableProps> = ({ abonents }) => {
  const tableRef = useRef<HTMLTableElement>(null);

  const handleExportExcel = () => {
    const dataToExport = abonents.map((a, idx) => ({
      '№': idx + 1,
      'ФИО': a.fullName,
      'Адрес': a.address,
      'Лицевой счёт': a.personalAccount || '',
      'Телефон': a.phone || '',
      'Долг': a.balance.toFixed(2),
    }));
    const worksheet = xlsx.utils.json_to_sheet(dataToExport);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Абоненты');
    xlsx.writeFile(workbook, 'controller_report.xlsx');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow max-w-5xl mx-auto">
      <style>{printStyle}</style>
      <div className="flex justify-between items-center mb-4 no-print">
        <h2 className="text-xl font-bold">Ведомость по абонентам для контролёра</h2>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Экспорт в Excel</button>
          <PrintProvider printStyle={printStyle} title="Ведомость по абонентам" onAfterPrint={() => {}}>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Печать</button>
          </PrintProvider>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table ref={tableRef} className="controller-report-table min-w-full border border-black">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black px-2 py-1">№</th>
              <th className="border border-black px-2 py-1">ФИО</th>
              <th className="border border-black px-2 py-1">Адрес</th>
              <th className="border border-black px-2 py-1">Лицевой счёт</th>
              <th className="border border-black px-2 py-1">Телефон</th>
              <th className="border border-black px-2 py-1">Долг</th>
              <th className="border border-black px-2 py-1">Примечание</th>
            </tr>
          </thead>
          <tbody>
            {abonents.map((a, idx) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="border border-black px-2 py-1 text-center">{idx + 1}</td>
                <td className="border border-black px-2 py-1">{a.fullName}</td>
                <td className="border border-black px-2 py-1">{a.address}</td>
                <td className="border border-black px-2 py-1">{a.personalAccount || ''}</td>
                <td className="border border-black px-2 py-1">{a.phone || ''}</td>
                <td className={`border border-black px-2 py-1 text-right font-bold ${a.balance < 0 ? 'text-red-600' : ''}`}>{a.balance.toFixed(2)}</td>
                <td className="border border-black px-2 py-1 min-w-[80px]">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-xs text-slate-500 no-print">Для печати используйте кнопку выше. В "Примечание" можно вписывать вручную: подпись, дату, комментарии и т.д.</div>
    </div>
  );
};

export default ControllerReportTable; 