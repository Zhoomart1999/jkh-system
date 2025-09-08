import React from 'react';
import TokmokStyleReceiptTemplate from './TokmokStyleReceiptTemplate';
import TokmokStyleMeterReportTemplate from './TokmokStyleMeterReportTemplate';

// Добавляем недостающие шаблоны
export const receiptTemplates = {
    compact: () => React.createElement('div', null, 'Компактная квитанция'),
    classic: () => React.createElement('div', null, 'Классическая квитанция'),
    minimal: () => React.createElement('div', null, 'Минимальная квитанция'),
    realistic: () => React.createElement('div', null, 'Реалистичная квитанция'),
    tokmok: TokmokStyleReceiptTemplate
};

export const meterReportTemplates = {
    tokmok: TokmokStyleMeterReportTemplate
};

export type ReceiptTemplateKey = keyof typeof receiptTemplates;
export type MeterReportTemplateKey = keyof typeof meterReportTemplates; 