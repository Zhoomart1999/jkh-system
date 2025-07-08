import React from 'react';
import { ReceiptDetails } from '../../types';

const MinimalReceiptTemplate: React.FC<{ details: ReceiptDetails }> = ({ details }) => {
    const { abonent, period, personalAccount, controllerName, waterService, garbageService, totalToPay, companySettings } = details;
    return (
        <div className="receipt-minimal p-4 text-xs font-sans bg-white border border-slate-300 rounded max-w-md mx-auto">
            <header className="text-center mb-2">
                <h1 className="font-bold text-base">{companySettings.name}</h1>
                <p>{companySettings.address}</p>
                <p>{companySettings.phone}</p>
            </header>
            <div className="flex justify-between mb-2">
                <span className="font-bold">Квитанция / Квитанциясы</span>
                <span>{period}</span>
            </div>
            <div className="mb-2">
                <div><b>Абонент / Абонент:</b> {abonent.fullName}</div>
                <div><b>Лицевой счет / Жеке эсеп:</b> {personalAccount}</div>
                <div><b>Адрес / Дарек:</b> {abonent.address}</div>
                {controllerName && <div><b>Контролёр / Контролёр:</b> {controllerName}</div>}
            </div>
            <table className="w-full text-xs border mb-2">
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border px-1">Услуга / Кызмат</th>
                        <th className="border px-1">Начислено / Чегерилди</th>
                        <th className="border px-1">К оплате / Төлөөгө</th>
                    </tr>
                </thead>
                <tbody>
                    {waterService && (
                        <tr>
                            <td className="border px-1">Вода / Суу</td>
                            <td className="border px-1 text-right">{waterService.charges.accrued.toFixed(2)}</td>
                            <td className="border px-1 text-right">{waterService.charges.total.toFixed(2)}</td>
                        </tr>
                    )}
                    {garbageService && (
                        <tr>
                            <td className="border px-1">Мусор / Таштандылар</td>
                            <td className="border px-1 text-right">{garbageService.charges.accrued.toFixed(2)}</td>
                            <td className="border px-1 text-right">{garbageService.charges.total.toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex justify-between items-center mt-2">
                <span className="font-bold">Итого / Жалпы: {totalToPay.toFixed(2)} сом</span>
                <span className="border border-dashed border-slate-400 px-4 py-2 text-slate-400">QR</span>
            </div>
            <div className="mt-2 text-xs text-center text-slate-500">
                <p>Оплатите до 15 числа следующего месяца / Кийинки айдын 15ине чейин төлөңүз</p>
            </div>
        </div>
    );
};

export default MinimalReceiptTemplate; 