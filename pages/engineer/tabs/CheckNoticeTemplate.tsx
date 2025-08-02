import React from 'react';
import { CheckNoticeZoneGroup, BuildingType, WaterTariffType, AbonentStatus } from '../../../types';

interface CheckNoticeTemplateProps {
    data: CheckNoticeZoneGroup[];
}

export const CheckNoticeTemplate: React.FC<CheckNoticeTemplateProps> = ({ data }) => {
    // Получаем данные из первой зоны (пока поддерживаем только одну зону)
    const zone = data[0];
    const abonents = zone.abonents;
    const statistics = zone.statistics || {
        totalChecked: abonents.length,
        withoutDebt: 0,
        withDebt: abonents.length,
        totalDebt: abonents.reduce((sum, a) => sum + Math.abs(a.balance), 0)
    };

    return (
        <div className="check-notice-template bg-white p-6 max-w-4xl mx-auto">
            {/* Заголовок */}
            <div className="text-center mb-6 border-b border-gray-300 pb-4">
                <h1 className="text-2xl font-bold text-gray-800">МП "Токмок Водоканал"</h1>
                <p className="text-gray-600">г. Токмок, ул. Ленина 1</p>
                <p className="text-gray-600">Телефон: 6-69-37, 0755 755 043</p>
                <h2 className="text-xl font-semibold mt-4 text-gray-800">РЕЕСТР ДОЛЖНИКОВ</h2>
                <p className="text-gray-600">Дата: {new Date().toLocaleDateString('ru-RU')}</p>
            </div>

            {/* Информация о контролёре */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Информация о контролёре:</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="font-medium">ФИО контролёра:</span>
                        <span className="ml-2">Турдубаева Э.Э.</span>
                    </div>
                    <div>
                        <span className="font-medium">Зона обслуживания:</span>
                        <span className="ml-2">{zone.zoneName}</span>
                    </div>
                    <div>
                        <span className="font-medium">Дата проверки:</span>
                        <span className="ml-2">{new Date().toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div>
                        <span className="font-medium">Время проверки:</span>
                        <span className="ml-2">{new Date().toLocaleTimeString('ru-RU')}</span>
                    </div>
                </div>
            </div>

            {/* Таблица абонентов */}
            <div className="mb-6">
                <h3 className="font-semibold text-lg mb-4">Список абонентов с долгами:</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-3 py-2 text-left">№</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">ФИО</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Адрес</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Лицевой счёт</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Телефон</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Кол-во жильцов</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Тип здания</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Тариф</th>
                                <th className="border border-gray-300 px-3 py-2 text-left">Долг (сом)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {abonents.map((abonent, index) => (
                                <tr key={abonent.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 px-3 py-2 font-medium">{abonent.fullName}</td>
                                    <td className="border border-gray-300 px-3 py-2">{abonent.address}</td>
                                    <td className="border border-gray-300 px-3 py-2">{abonent.personalAccount || 'Н/Д'}</td>
                                    <td className="border border-gray-300 px-3 py-2">{abonent.phone || 'Н/Д'}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">{abonent.numberOfPeople || 1}</td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        {abonent.buildingType === 'apartment' ? 'Квартира' : 'Частный дом'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2">
                                        {abonent.tariff || 'По количеству людей'}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-red-600">
                                        {Math.abs(abonent.balance).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Статистика */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Статистика проверки:</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{statistics.totalChecked}</div>
                        <div className="text-sm text-gray-600">Всего проверено</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{statistics.withoutDebt}</div>
                        <div className="text-sm text-gray-600">Без долгов</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{statistics.withDebt}</div>
                        <div className="text-sm text-gray-600">С долгами</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{statistics.totalDebt.toFixed(2)}</div>
                        <div className="text-sm text-gray-600">Общий долг (сом)</div>
                    </div>
                </div>
            </div>

            {/* Подписи */}
            <div className="flex justify-between items-end mt-8">
                <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 w-48">
                        <div className="text-sm text-gray-600">Подпись контролёра</div>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 w-48">
                        <div className="text-sm text-gray-600">Подпись руководителя</div>
                    </div>
                </div>
            </div>

            {/* Примечания */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold mb-2">Примечания:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Абоненты с отрицательным балансом требуют немедленной оплаты</li>
                    <li>• Рекомендуется провести повторную проверку через 7 дней</li>
                    <li>• При неуплате в течение 30 дней будет отключение услуг</li>
                </ul>
            </div>
        </div>
    );
};
