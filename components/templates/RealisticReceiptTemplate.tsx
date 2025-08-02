import React from 'react';
import { ReceiptDetails, WaterTariffType } from '../../types';

const RealisticReceiptTemplate: React.FC<{ details: ReceiptDetails }> = ({ details }) => {
    const { abonent, period, personalAccount, controllerName, waterService, garbageService, totalToPay, companySettings } = details;
    
    const formatValue = (val: any, empty = '-') => (val === undefined || val === null || val === '' ? empty : val);
    const isByMeter = abonent.waterTariff === WaterTariffType.ByMeter;
    
    // Генерируем QR-код (в реальности это будет API банка)
    const generateQRCode = () => {
        return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    };

    return (
        <div className="realistic-receipt bg-white p-6 max-w-2xl mx-auto font-sans text-sm" style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            border: '1px solid #ccc',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            {/* Заголовок компании */}
            <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                <h1 className="text-xl font-bold text-gray-800 mb-2">{companySettings.name}</h1>
                <p className="text-gray-600 mb-1">Адрес: {companySettings.address}</p>
                <p className="text-gray-600 mb-1">Телефон: {companySettings.phone}</p>
                <p className="text-gray-600 mb-1">Контролёр: {controllerName}</p>
                <p className="text-gray-600">Жашоочулар/Кол-во чел.: {abonent.numberOfPeople || 3}</p>
            </div>

            {/* Информация об абоненте */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold text-gray-800">Абонент / Абонент:</p>
                        <p className="text-gray-700">{abonent.fullName}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Лицевой счет / Жеке эсеп:</p>
                        <p className="text-gray-700">{personalAccount}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="font-semibold text-gray-800">Адрес / Дарек:</p>
                        <p className="text-gray-700">{abonent.address}</p>
                    </div>
                </div>
            </div>

            {/* Секция воды и стоков */}
            {waterService && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 text-center border-b border-gray-300 pb-2">
                        Холодная вода и стоки / Муздак суу жана агындылар
                    </h2>
                    
                    {/* Таблица воды */}
                    <div className="mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-400 px-2 py-1 text-left">Төлөө-түрү / Вид платежа</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Карыз/Ашык телем. Долг(+)/Переплата (-)</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Төлөндү/Оплачено</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Сарпталышы Расход (м.куб.)</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Эсептелди Начислено</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">САС 3%</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">НСП 3%</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Кайра эсептев Перерасчет</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Туум/Пеня</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Итого</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1">Суу / Вода</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.debt)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.paid)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.consumption)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.accrued)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.tax)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.recalculation)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(waterService.charges.penalty)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right font-bold">{formatValue(waterService.charges.total)}</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1">Агынды / Стоки</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right font-bold">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Показания счетчика */}
                    {isByMeter && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <h3 className="font-semibold mb-2">Водомер / Суу өлчөгүч</h3>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="font-medium">Пред. показания:</p>
                                    <p>{formatValue(waterService.prevReading)}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Тек. показания:</p>
                                    <p>{formatValue(waterService.currentReading)}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Сарпталган/Расходы:</p>
                                    <p>{formatValue(waterService.charges.consumption)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Тарифы */}
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                        <p className="font-semibold mb-1">Тариф: Вода - 7.96, стоки - 2.39</p>
                    </div>

                    {/* Предупреждения */}
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-semibold mb-2">⚠️ Внимание / Көңүл бургула:</p>
                        <p className="text-xs mb-1">
                            Эгер 10.01.2025 чейин төлөбөсөңүз, сизге туум эсептелинет жана суу өчүрүлөт.
                        </p>
                        <p className="text-xs mb-1">
                            В случае неоплаты до 10.01.2025, Вам будет начисляться пеня и прекращено водоснабжение.
                        </p>
                        <p className="text-xs">
                            Полив зеленых насаждений огородов, мытье ковров, паласов, дворов, машин ти т.д. питьевой водой категорически запрещается!
                        </p>
                    </div>

                    {/* Итого по воде */}
                    <div className="text-right mb-4">
                        <p className="text-lg font-bold">
                            Төлөөгө/К оплате: {waterService.charges.total.toFixed(2)} сом
                        </p>
                    </div>
                </div>
            )}

            {/* Секция вывоза мусора */}
            {garbageService && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 text-center border-b border-gray-300 pb-2">
                        Таштандыларды чыгаруу / Вывоз мусора
                    </h2>
                    
                    <div className="mb-4 p-3 bg-gray-50 rounded">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold">Компания:</p>
                                <p>ОсОО "ЭкоЛогист"</p>
                            </div>
                            <div>
                                <p className="font-semibold">1 жашоочуга баасы/рацсенка на 1 жителя:</p>
                                <p>31 сом</p>
                            </div>
                        </div>
                    </div>

                    {/* Таблица мусора */}
                    <div className="mb-4">
                        <table className="w-full border-collapse border border-gray-400 text-xs">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-400 px-2 py-1 text-left">Мурунку ай/Предыдущий месяц</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Карыз/Долг</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Төлөндү/Оплачено</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Ашык төлөм(-)/төлөбөгөн Переплата(-)/недоплата</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Эсептелди/Начислено</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Салык/Налог</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Сумма</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Туум/Пеня</th>
                                    <th className="border border-gray-400 px-2 py-1 text-center">Төлөөгө/К оплате</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-400 px-2 py-1">{formatValue(garbageService.charges.debt)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(garbageService.charges.paid)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(garbageService.charges.accrued)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(garbageService.charges.tax)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">-</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right">{formatValue(garbageService.charges.penalty)}</td>
                                    <td className="border border-gray-400 px-2 py-1 text-right font-bold">{formatValue(garbageService.charges.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Предупреждения по мусору */}
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs">
                            Эгер 25.01.2025 чейин төлөбөсөңүз, туум эсептелет.
                        </p>
                        <p className="text-xs">
                            В случае неоплаты до 25.01.2025 Вам будет начислена пеня.
                        </p>
                    </div>

                    {/* Итого по мусору */}
                    <div className="text-right mb-4">
                        <p className="text-lg font-bold">
                            Төлөөгө/К оплате: {garbageService.charges.total.toFixed(2)} сом
                        </p>
                    </div>
                </div>
            )}

            {/* Объединенная квитанция */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h2 className="text-lg font-bold text-center mb-4">
                    Объединенная квитанция коммунальных услуг / Коммуналдык тейлөөлөрдүн бириктирилген дүмүрчөгү
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p className="font-semibold">Адрес / Дарек:</p>
                        <p>{abonent.address}</p>
                    </div>
                    <div>
                        <p className="font-semibold">ФИО:</p>
                        <p>{abonent.fullName}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                        <tbody>
                            <tr>
                                <td className="border border-gray-400 px-3 py-2 font-semibold">Токмок Водоканал</td>
                                <td className="border border-gray-400 px-3 py-2 text-right">{waterService?.charges.total.toFixed(2) || '0.00'}</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-400 px-3 py-2 font-semibold">Экологист</td>
                                <td className="border border-gray-400 px-3 py-2 text-right">{garbageService?.charges.total.toFixed(2) || '0.00'}</td>
                            </tr>
                            <tr className="bg-gray-100">
                                <td className="border border-gray-400 px-3 py-2 font-bold">ИТОГО К ОПЛАТЕ</td>
                                <td className="border border-gray-400 px-3 py-2 text-right font-bold text-lg">{totalToPay.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* QR код и инструкции */}
                <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-600 max-w-xs">
                        <p className="font-semibold mb-2">Кагаз эсептерди күтпөңүз!</p>
                        <p className="mb-1">Не ждите бумажные квитанции!</p>
                        <p className="mb-1">mydom.kg тиркемесин жүктөп, эсептерди электрондук форматта алып, коммуналдык төлөмдөрдү комиссиясыз төлөңүз!</p>
                        <p>Скачайте приложение mydom.kg, получайте квитанции в цифровом формате и оплачивайте коммунальные услуги без комиссии!</p>
                    </div>
                    <div className="text-center">
                        <img 
                            src={generateQRCode()} 
                            alt="QR Code for Payment" 
                            className="w-20 h-20 border border-gray-300 mx-auto mb-2"
                            style={{ imageRendering: 'pixelated' }}
                        />
                        <p className="text-xs text-gray-600">наведите камеру для оплаты или регистрации дома в приложении</p>
                    </div>
                </div>
            </div>

            {/* Подпись */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">Подпись контролёра: _________________</p>
                <p className="text-sm text-gray-600">Дата: {new Date().toLocaleDateString('ru-RU')}</p>
            </div>
            
            {/* Кнопка печати (только для экрана) */}
            <div className="no-print mt-4 text-center">
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    🖨️ Печать на принтер
                </button>
            </div>
        </div>
    );
};

export default RealisticReceiptTemplate; 