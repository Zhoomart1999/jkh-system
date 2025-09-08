import React from 'react';

interface Abonent {
    id: string;
    fullName: string;
    address: string;
    personalAccount?: string;
    waterTariff?: 'by_meter' | 'by_person';
    currentMeterReading?: number;
    prevMeterReading?: number;
    waterDebt?: number;
    garbageDebt?: number;
    balance?: number;
}

interface MeterReadingsRegistryTemplateProps {
    abonents: Abonent[];
    controllerName: string;
    reportDate: string;
}

export const MeterReadingsRegistryTemplate: React.FC<MeterReadingsRegistryTemplateProps> = ({
    abonents,
    controllerName,
    reportDate
}) => {
    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('ru-RU', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="meter-readings-registry" style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '10mm',
            backgroundColor: 'white',
            fontFamily: 'Arial, sans-serif',
            fontSize: '10px',
            lineHeight: '1.2',
            color: '#000'
        }}>
            {/* Заголовок отчета */}
            <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                borderBottom: '2px solid #0066cc',
                paddingBottom: '10px'
            }}>
                <h1 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#0066cc' }}>
                    РЕЕСТР ПОКАЗАНИЙ СЧЕТЧИКОВ ВОДЫ
                </h1>
                <h2 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>
                    МП ЧУЙ ВОДОКАНАЛ
                </h2>
                <div style={{ fontSize: '12px', color: '#666' }}>
                    Дата: {formatDate(reportDate)} | Контролер: {controllerName}
                </div>
            </div>

            {/* Информация о периоде */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
                fontSize: '11px'
            }}>
                <div>
                    <strong>Период:</strong> {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </div>
                <div>
                    <strong>Всего абонентов:</strong> {abonents.length}
                </div>
                <div>
                    <strong>Дата составления:</strong> {new Date().toLocaleDateString('ru-RU')}
                </div>
            </div>

            {/* Таблица показаний счетчиков */}
            <div style={{ marginBottom: '20px' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '9px'
                }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                №
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>
                                ФИО абонента
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>
                                Адрес
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Лицевой счет
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Тариф
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Пред. показания
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Тек. показания
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Расход (м³)
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Долг за воду (сом)
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Долг за мусор (сом)
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Общий долг (сом)
                            </th>
                            <th style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                Примечание
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {abonents.map((abonent, index) => {
                            const consumption = (abonent.currentMeterReading || 0) - (abonent.prevMeterReading || 0);
                            const totalDebt = (abonent.waterDebt || 0) + (abonent.garbageDebt || 0);
                            
                            return (
                                <tr key={abonent.id} style={{
                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                                }}>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                                        {index + 1}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'left', fontWeight: 'bold' }}>
                                        {abonent.fullName}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'left' }}>
                                        {abonent.address}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontFamily: 'monospace' }}>
                                        {abonent.personalAccount || '000000'}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                                        {abonent.waterTariff === 'by_meter' ? 'По счетчику' : 'По людям'}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                                        {abonent.prevMeterReading || 0}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                                        {abonent.currentMeterReading || 0}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                                        {consumption}
                                    </td>
                                    <td style={{ 
                                        border: '1px solid #ccc', 
                                        padding: '4px', 
                                        textAlign: 'right',
                                        color: (abonent.waterDebt || 0) > 0 ? '#dc3545' : '#28a745'
                                    }}>
                                        {formatCurrency(abonent.waterDebt || 0)}
                                    </td>
                                    <td style={{ 
                                        border: '1px solid #ccc', 
                                        padding: '4px', 
                                        textAlign: 'right',
                                        color: (abonent.garbageDebt || 0) > 0 ? '#dc3545' : '#28a745'
                                    }}>
                                        {formatCurrency(abonent.garbageDebt || 0)}
                                    </td>
                                    <td style={{ 
                                        border: '1px solid #ccc', 
                                        padding: '4px', 
                                        textAlign: 'right',
                                        fontWeight: 'bold',
                                        color: totalDebt > 0 ? '#dc3545' : '#28a745'
                                    }}>
                                        {formatCurrency(totalDebt)}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '4px', textAlign: 'center' }}>
                                        {/* Поле для примечаний */}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Итоговая информация */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '20px',
                fontSize: '11px'
            }}>
                <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>Статистика:</h4>
                    <div style={{ lineHeight: '1.5' }}>
                        <div><strong>Всего абонентов:</strong> {abonents.length}</div>
                        <div><strong>С тарифом "По счетчику":</strong> {abonents.filter(a => a.waterTariff === 'by_meter').length}</div>
                        <div><strong>С тарифом "По людям":</strong> {abonents.filter(a => a.waterTariff === 'by_person').length}</div>
                        <div><strong>Общий долг за воду:</strong> {formatCurrency(abonents.reduce((sum, a) => sum + (a.waterDebt || 0), 0))} сом</div>
                        <div><strong>Общий долг за мусор:</strong> {formatCurrency(abonents.reduce((sum, a) => sum + (a.garbageDebt || 0), 0))} сом</div>
                        <div><strong>Общий долг:</strong> {formatCurrency(abonents.reduce((sum, a) => sum + (a.waterDebt || 0) + (a.garbageDebt || 0), 0))} сом</div>
                    </div>
                </div>
                
                <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '10px' }}>Показания счетчиков:</h4>
                    <div style={{ lineHeight: '1.5' }}>
                        <div><strong>Абонентов с показаниями:</strong> {abonents.filter(a => a.currentMeterReading && a.currentMeterReading > 0).length}</div>
                        <div><strong>Абонентов без показаний:</strong> {abonents.filter(a => !a.currentMeterReading || a.currentMeterReading === 0).length}</div>
                        <div><strong>Общий расход:</strong> {abonents.reduce((sum, a) => sum + Math.max(0, (a.currentMeterReading || 0) - (a.prevMeterReading || 0)), 0)} м³</div>
                    </div>
                </div>
            </div>

            {/* Подписи */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px',
                marginTop: '40px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '5px', display: 'inline-block', minWidth: '150px' }}>
                        Подпись контролера: _________________
                    </div>
                    <div style={{ fontSize: '9px', marginTop: '5px' }}>
                        {controllerName}
                    </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <div style={{ borderTop: '1px solid #000', paddingTop: '5px', display: 'inline-block', minWidth: '150px' }}>
                        Подпись проверяющего: _________________
                    </div>
                    <div style={{ fontSize: '9px', marginTop: '5px' }}>
                        Дата: {new Date().toLocaleDateString('ru-RU')}
                    </div>
                </div>
            </div>

            {/* Футер */}
            <div style={{
                position: 'absolute',
                bottom: '10mm',
                left: '10mm',
                right: '10mm',
                textAlign: 'center',
                fontSize: '8px',
                color: '#666',
                borderTop: '1px solid #eee',
                paddingTop: '5px'
            }}>
                <p>МП Чуй Водоканал - Реестр показаний счетчиков</p>
                <p>Дата печати: {new Date().toLocaleDateString('ru-RU')} | Время: {new Date().toLocaleTimeString('ru-RU')}</p>
            </div>
        </div>
    );
};

export default MeterReadingsRegistryTemplate; 