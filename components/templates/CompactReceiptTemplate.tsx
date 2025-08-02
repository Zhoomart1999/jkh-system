import React from 'react';
import { ReceiptDetails } from '../../types';

interface CompactReceiptTemplateProps {
    details: ReceiptDetails;
}

export const CompactReceiptTemplate: React.FC<CompactReceiptTemplateProps> = ({ details }) => {
    const { abonent, period, personalAccount, controllerName, companySettings, waterService, garbageService, totalToPay } = details;

    return (
        <div className="realistic-receipt compact-receipt bg-white border border-gray-300 rounded-lg p-2 text-xs w-full">
            {/* Заголовок */}
            <div className="text-center border-b border-gray-300 pb-1 mb-2">
                <div className="font-bold text-xs">{companySettings.name}</div>
                <div className="text-xs text-gray-600">{companySettings.address}</div>
                <div className="text-xs text-gray-600">Тел: {companySettings.phone}</div>
            </div>

            {/* Информация об абоненте */}
            <div className="mb-2">
                <div className="receipt-row">
                    <span className="font-semibold">Абонент:</span>
                    <span className="text-xs">{abonent.fullName}</span>
                </div>
                <div className="receipt-row">
                    <span className="font-semibold">Лиц. счет:</span>
                    <span className="text-xs">{personalAccount}</span>
                </div>
                <div className="receipt-row">
                    <span className="font-semibold">Адрес:</span>
                    <span className="text-xs">{abonent.address}</span>
                </div>
                <div className="receipt-row">
                    <span className="font-semibold">Период:</span>
                    <span className="text-xs">{period}</span>
                </div>
                <div className="receipt-row">
                    <span className="font-semibold">Контролёр:</span>
                    <span className="text-xs">{controllerName} (№{abonent.controllerId || 'Н/Д'})</span>
                </div>
            </div>

            {/* Показания счетчиков */}
            {waterService && (
                <div className="mb-2 border-t border-gray-300 pt-1">
                    <div className="font-semibold text-xs mb-1">Показания счетчиков:</div>
                    <div className="receipt-row">
                        <span>Предыдущие:</span>
                        <span>{waterService.prevReading || 0}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Текущие:</span>
                        <span>{waterService.currentReading || 0}</span>
                    </div>
                    <div className="receipt-row">
                        <span>Расход:</span>
                        <span>{waterService.charges.consumption} м³</span>
                    </div>
                </div>
            )}

            {/* Таблица начислений */}
            <div className="mb-2 border-t border-gray-300 pt-1">
                <div className="font-semibold text-xs mb-1">Начисления:</div>
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-gray-300">
                            <th className="text-left">Услуга</th>
                            <th className="text-right">Начислено</th>
                            <th className="text-right">Долг</th>
                            <th className="text-right">Пеня</th>
                            <th className="text-right">Итого</th>
                        </tr>
                    </thead>
                    <tbody>
                        {waterService && (
                            <tr>
                                <td>Вода</td>
                                <td className="text-right">{waterService.charges.accrued.toFixed(2)}</td>
                                <td className="text-right">{waterService.charges.debt?.toFixed(2) || '0.00'}</td>
                                <td className="text-right">{waterService.charges.penalty?.toFixed(2) || '0.00'}</td>
                                <td className="text-right font-semibold">{waterService.charges.total.toFixed(2)}</td>
                            </tr>
                        )}
                        {garbageService && (
                            <tr>
                                <td>Мусор</td>
                                <td className="text-right">{garbageService.charges.accrued.toFixed(2)}</td>
                                <td className="text-right">{garbageService.charges.debt?.toFixed(2) || '0.00'}</td>
                                <td className="text-right">{garbageService.charges.penalty?.toFixed(2) || '0.00'}</td>
                                <td className="text-right font-semibold">{garbageService.charges.total.toFixed(2)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Итого */}
            <div className="border-t border-gray-300 pt-1 mb-2">
                <div className="receipt-row">
                    <span className="font-bold text-sm">ИТОГО К ОПЛАТЕ:</span>
                    <span className="font-bold text-sm">{totalToPay.toFixed(2)} сом</span>
                </div>
            </div>

            {/* Тарифы */}
            <div className="mb-2 border-t border-gray-300 pt-1">
                <div className="font-semibold text-xs mb-1">Тарифы:</div>
                <div className="receipt-row">
                    <span>Вода:</span>
                    <span>7.96 сом/м³</span>
                </div>
                <div className="receipt-row">
                    <span>Мусор:</span>
                    <span>30.00 сом/чел</span>
                </div>
            </div>

            {/* Предупреждения */}
            <div className="mb-2 border-t border-gray-300 pt-1">
                <div className="text-xs text-red-600 font-semibold">
                    ⚠️ Оплатите до 15 числа следующего месяца
                </div>
                <div className="text-xs text-gray-600">
                    При оплате через терминалы комиссия взимается с абонента
                </div>
            </div>

            {/* Подпись */}
            <div className="border-t border-gray-300 pt-1">
                <div className="text-center">
                    <div className="text-xs text-gray-600">Подпись: ___________</div>
                    <div className="text-xs text-gray-600">Дата: {new Date().toLocaleDateString('ru-RU')}</div>
                </div>
            </div>
        </div>
    );
}; 