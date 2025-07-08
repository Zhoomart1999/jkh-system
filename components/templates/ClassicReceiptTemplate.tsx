import React from 'react';
import { ReceiptDetails, WaterTariffType } from '../../types';

const ClassicReceiptTemplate: React.FC<{ details: ReceiptDetails }> = ({ details }) => {
    const { abonent, period, personalAccount, controllerName, waterService, garbageService, totalToPay, companySettings } = details;
    // Форматируем значения для таблицы
    const formatValue = (val: any, empty = '-') => (val === undefined || val === null || val === '' ? empty : val);
    const isByMeter = abonent.waterTariff === WaterTariffType.ByMeter;
    
    // Генерируем QR-код для оплаты (в реальности это будет API банка)
    const generateQRCode = () => {
        const qrData = {
            personalAccount: personalAccount,
            amount: totalToPay,
            description: `Оплата за услуги ЖКХ - ${abonent.fullName}`,
            period: period
        };
        
        // В реальности здесь будет вызов API банка для генерации QR-кода
        // Пока используем placeholder
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    };
    
    return (
        <div className="receipt-container p-4 bg-white font-mono text-xs" style={{ width: 600, maxWidth: '100%', margin: '0 auto', border: '1px solid #222', overflowX: 'auto' }}>
            <div className="text-center font-bold text-sm">{companySettings.name}</div>
            <div className="text-center">Адрес: {companySettings.address}, тел.: {companySettings.phone}</div>
            <div className="my-2 border-t border-b border-black border-dashed py-1 text-center tracking-widest">---------------------------------------------</div>
            <div className="flex justify-between mb-1">
                <span className="font-bold">КВИТАНЦИЯ / КВИТАНЦИЯСЫ</span>
                <span>за {period}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 mb-1">
                <div><span className="font-bold">Абонент / Абонент:</span> {abonent.fullName}</div>
                <div><span className="font-bold">Лицевой счет / Жеке эсеп:</span> {personalAccount}</div>
                <div><span className="font-bold">Адрес / Дарек:</span> {abonent.address}</div>
                <div><span className="font-bold">Контролер / Контролёр:</span> {controllerName}</div>
            </div>
            <table className="w-full border border-black border-collapse mb-2" style={{ fontSize: 11, tableLayout: 'fixed', wordBreak: 'break-word' }}>
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-black" rowSpan={2}>Услуга / Кызмат</th>
                        <th className="border border-black" colSpan={3}>На начало периода / Период башында</th>
                        <th className="border border-black" colSpan={4}>Начислено за период / Чегерилди</th>
                        <th className="border border-black" rowSpan={2}>К оплате / Төлөөгө</th>
                    </tr>
                    <tr className="bg-slate-100">
                        <th className="border border-black">Долг / Карыз</th>
                        <th className="border border-black">Оплачено / Төлөндү</th>
                        <th className="border border-black">Показания / Көрсөтмө</th>
                        <th className="border border-black">Начислено / Чегерилди</th>
                        <th className="border border-black">НсП</th>
                        <th className="border border-black">Перерасчет / Кайра эсеп</th>
                        <th className="border border-black">Пеня / Пеня</th>
                    </tr>
                </thead>
                <tbody>
                    {waterService && (
                        <tr>
                            <td className="border border-black">Холодная вода и стоки / Муздак суу жана агындылар</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.debt, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.paid, '0.00')}</td>
                            <td className="border border-black text-center">{isByMeter ? `${formatValue(waterService.prevReading)} - ${formatValue(waterService.currentReading)}` : `${formatValue(waterService.charges.consumption)}`}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.accrued, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.tax, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.recalculation, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.penalty, '0.00')}</td>
                            <td className="border border-black text-right font-bold">{formatValue(waterService.charges.total, '0.00')}</td>
                        </tr>
                    )}
                    {garbageService && (
                        <tr>
                            <td className="border border-black">Вывоз мусора / Таштандыларды чыгаруу</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.debt, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.paid, '0.00')}</td>
                            <td className="border border-black text-center">-</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.accrued, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.tax, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.recalculation, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.penalty, '0.00')}</td>
                            <td className="border border-black text-right font-bold">{formatValue(garbageService.charges.total, '0.00')}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex gap-4 text-xs mb-1">
                <div><b>Тариф / Тариф:</b> {isByMeter ? 'по счетчику / эсептегич боюнча' : 'по норме / норма боюнча'}</div>
                <div><b>Пред. показания / Мурунку көрс.:</b> {isByMeter ? formatValue(waterService?.prevReading) : '-'}</div>
                <div><b>Тек. показания / Азыркы көрс.:</b> {isByMeter ? formatValue(waterService?.currentReading) : '-'}</div>
                <div><b>Расход / Чыгым:</b> {isByMeter ? '-' : formatValue(waterService?.charges.consumption)}</div>
            </div>
            <div className="my-2 border-t border-black border-dashed"></div>
            <div className="text-right font-bold text-base mb-1">ИТОГО К ОПЛАТЕ / ЖАЛПЫ ТӨЛӨӨГӨ: {totalToPay.toFixed(2)} сом</div>
            <div className="text-xs mb-2">
                <p>Оплатите до 15 числа следующего месяца / Кийинки айдын 15ине чейин төлөңүз</p>
                <p>При оплате через терминалы или банки, комиссия взимается с абонента.</p>
                <p className="font-bold text-center">Оплата через QR-код: МБанк, Бакай Банк</p>
            </div>
            <div className="my-2 border-t border-black border-dashed"></div>
            <div className="flex justify-between items-center mb-1">
                <div className="font-bold">{companySettings.name}</div>
                <div className="text-xs">Квитанция за {period} / {period} айы үчүн</div>
                <div className="font-bold">Л/с: {personalAccount}</div>
            </div>
            <div className="flex justify-between items-center mb-1">
                <div>Абонент: {abonent.fullName}</div>
                <div>Адрес: {abonent.address}</div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="font-bold">Сумма к оплате: {totalToPay.toFixed(2)}</span>
                <div className="text-center">
                    <img 
                        src={generateQRCode()} 
                        alt="QR Code for Payment" 
                        className="w-16 h-16 border border-slate-300"
                        style={{ imageRendering: 'pixelated' }}
                    />
                    <div className="text-xs text-slate-600 mt-1">QR-код для оплаты</div>
                </div>
                <span>Подпись: ____________</span>
            </div>
        </div>
    );
};

// Новый компонент секции квитанции (1/3 листа)
export const ReceiptSection: React.FC<{ details: ReceiptDetails; service: 'water' | 'garbage' | 'total'; heightStyle?: React.CSSProperties }> = ({ details, service, heightStyle }) => {
    const { abonent, period, personalAccount, controllerName, waterService, garbageService, totalToPay, companySettings } = details;
    const formatValue = (val: any, empty = '-') => (val === undefined || val === null || val === '' ? empty : val);
    const isByMeter = abonent.waterTariff === WaterTariffType.ByMeter;
    return (
        <div className="receipt-section p-4 bg-white font-mono text-xs border-b border-dashed border-slate-400" style={{ ...heightStyle, width: 600, maxWidth: '100%', margin: '0 auto', overflowX: 'auto' }}>
            <div className="text-center font-bold text-sm">{companySettings.name}</div>
            <div className="text-center">Адрес: {companySettings.address}, тел.: {companySettings.phone}</div>
            <div className="my-2 border-t border-b border-black border-dashed py-1 text-center tracking-widest">---------------------------------------------</div>
            <div className="flex justify-between mb-1">
                <span className="font-bold">КВИТАНЦИЯ / КВИТАНЦИЯСЫ</span>
                <span>за {period}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 mb-1">
                <div><span className="font-bold">Абонент / Абонент:</span> {abonent.fullName}</div>
                <div><span className="font-bold">Лицевой счет / Жеке эсеп:</span> {personalAccount}</div>
                <div><span className="font-bold">Адрес / Дарек:</span> {abonent.address}</div>
                <div><span className="font-bold">Контролер / Контролёр:</span> {controllerName}</div>
            </div>
            <table className="w-full border border-black border-collapse mb-2" style={{ fontSize: 11, tableLayout: 'fixed', wordBreak: 'break-word' }}>
                <thead>
                    <tr className="bg-slate-100">
                        <th className="border border-black">Услуга / Кызмат</th>
                        <th className="border border-black">Долг</th>
                        <th className="border border-black">Оплачено</th>
                        <th className="border border-black">Показания</th>
                        <th className="border border-black">Начислено</th>
                        <th className="border border-black">НсП</th>
                        <th className="border border-black">Перерасчет</th>
                        <th className="border border-black">Пеня</th>
                        <th className="border border-black">К оплате</th>
                    </tr>
                </thead>
                <tbody>
                    {service === 'water' && waterService && (
                        <tr>
                            <td className="border border-black">Холодная вода и стоки</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.debt, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.paid, '0.00')}</td>
                            <td className="border border-black text-center">{isByMeter ? `${formatValue(waterService.prevReading)} - ${formatValue(waterService.currentReading)}` : `${formatValue(waterService.charges.consumption)}`}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.accrued, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.tax, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.recalculation, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(waterService.charges.penalty, '0.00')}</td>
                            <td className="border border-black text-right font-bold">{formatValue(waterService.charges.total, '0.00')}</td>
                        </tr>
                    )}
                    {service === 'garbage' && garbageService && (
                        <tr>
                            <td className="border border-black">Вывоз мусора</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.debt, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.paid, '0.00')}</td>
                            <td className="border border-black text-center">-</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.accrued, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.tax, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.recalculation, '0.00')}</td>
                            <td className="border border-black text-right">{formatValue(garbageService.charges.penalty, '0.00')}</td>
                            <td className="border border-black text-right font-bold">{formatValue(garbageService.charges.total, '0.00')}</td>
                        </tr>
                    )}
                    {service === 'total' && (
                        <tr>
                            <td className="border border-black font-bold">ИТОГО</td>
                            <td className="border border-black" colSpan={7}></td>
                            <td className="border border-black text-right font-bold">{totalToPay.toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="flex gap-4 text-xs mb-1">
                <div><b>Тариф:</b> {isByMeter ? 'по счетчику' : 'по норме'}</div>
                <div><b>Пред. показания:</b> {isByMeter ? formatValue(waterService?.prevReading) : '-'}</div>
                <div><b>Тек. показания:</b> {isByMeter ? formatValue(waterService?.currentReading) : '-'}</div>
                <div><b>Расход:</b> {isByMeter ? '-' : formatValue(waterService?.charges.consumption)}</div>
            </div>
            <div className="my-2 border-t border-black border-dashed"></div>
            <div className="text-right font-bold text-base mb-1">К ОПЛАТЕ: {totalToPay.toFixed(2)} сом</div>
            <div className="text-xs mb-2">
                <p>Оплатите до 15 числа следующего месяца</p>
                <p>При оплате через терминалы или банки, комиссия взимается с абонента.</p>
            </div>
            <div className="my-2 border-t border-black border-dashed"></div>
            <div className="flex justify-between items-center mb-1">
                <div className="font-bold">{companySettings.name}</div>
                <div className="text-xs">Квитанция за {period}</div>
                <div className="font-bold">Л/с: {personalAccount}</div>
            </div>
            <div className="flex justify-between items-center mb-1">
                <div>Абонент: {abonent.fullName}</div>
                <div>Адрес: {abonent.address}</div>
            </div>
            <div className="flex justify-between items-center mt-2">
                <span className="font-bold">Сумма к оплате: {totalToPay.toFixed(2)}</span>
                <span>Подпись: ____________</span>
            </div>
        </div>
    );
};

export default ClassicReceiptTemplate;
