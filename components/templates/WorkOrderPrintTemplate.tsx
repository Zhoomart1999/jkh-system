import React from 'react';
import { TechnicalRequest, RequestTypeLabels, RequestStatusLabels, RequestPriorityLabels } from '../../types';

interface WorkOrderPrintTemplateProps {
    request: TechnicalRequest;
}

const formatDate = (dateString: string | undefined) => dateString ? new Date(dateString).toLocaleString('ru-RU') : 'N/A';
const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const WorkOrderPrintTemplate: React.FC<WorkOrderPrintTemplateProps> = ({ request }) => {
    return (
        <div className="p-8 font-sans">
            <header className="flex justify-between items-start pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-bold">Рабочий наряд №{request.id.split('-')[1]}</h1>
                    <p className="text-slate-500">Дата создания: {formatDate(request.createdAt)}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{RequestTypeLabels[request.type]}</p>
                    <p>Приоритет: {RequestPriorityLabels[request.priority]}</p>
                </div>
            </header>
            
            <main className="mt-6 grid grid-cols-2 gap-8">
                <section>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2">Детали заявки</h2>
                    <div className="space-y-1 text-sm">
                        <p><strong>Абонент:</strong> {request.abonentName}</p>
                        <p><strong>Адрес:</strong> {request.abonentAddress}</p>
                        <p><strong>Описание:</strong> {request.details}</p>
                    </div>
                </section>
                <section>
                    <h2 className="text-lg font-semibold border-b pb-1 mb-2">Статус и исполнитель</h2>
                    <div className="space-y-1 text-sm">
                        <p><strong>Статус:</strong> {RequestStatusLabels[request.status]}</p>
                        <p><strong>Исполнитель:</strong> {request.assignedToName || 'Не назначен'}</p>
                        <p><strong>Дата выполнения:</strong> {formatDate(request.workOrder?.completedAt)}</p>
                        <p><strong>Затрачено часов:</strong> {request.workOrder?.hoursSpent || 'N/A'}</p>
                    </div>
                </section>
            </main>

            {request.workOrder && (
                <div className="mt-6">
                    <section className="mt-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">История работ</h2>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            {request.workOrder.history?.map((entry, index) => (
                                <li key={index}>
                                    <strong>{formatDate(entry.date)} ({entry.userName}):</strong> {entry.action}
                                </li>
                            ))}
                         {(!request.workOrder.history || request.workOrder.history.length === 0) && <p className="text-sm text-slate-500">Записей нет.</p>}
                    </ul>
                    </section>
                
                    <section className="mt-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Общие заметки</h2>
                        <p className="text-sm whitespace-pre-wrap bg-slate-50 p-2 rounded-md">{request.workOrder.notes || 'Нет заметок.'}</p>
                    </section>

                    <section className="mt-6">
                        <h2 className="text-lg font-semibold border-b pb-1 mb-2">Использованные материалы</h2>
                        {request.workOrder.usedMaterials && request.workOrder.usedMaterials.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead><tr className="text-left"><th className="p-1">Наименование</th><th className="p-1">Количество</th></tr></thead>
                                <tbody>
                                    {request.workOrder.usedMaterials.map((mat, i) => (
                                        <tr key={i} className="border-t"><td className="p-1">{mat.name}</td><td className="p-1">{mat.quantity} {mat.unit}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p className="text-sm text-slate-500">Материалы не использовались.</p>}
                    </section>
                </div>
            )}

            <footer className="mt-12 pt-4 border-t text-center text-xs text-slate-500">
                <p>Подпись исполнителя: _________________________</p>
                <p className="mt-4">Подпись абонента: _________________________</p>
            </footer>
        </div>
    );
};

export default WorkOrderPrintTemplate;