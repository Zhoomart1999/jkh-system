import React from 'react';
import TokmokStyleReceiptTemplate from '../components/templates/TokmokStyleReceiptTemplate';
import TokmokStyleMeterReportTemplate from '../components/templates/TokmokStyleMeterReportTemplate';
import { Abonent, ReceiptDetails, AbonentStatus, WaterTariffType } from '../types';

const TestTemplatesPage: React.FC = () => {
  // Mock data for testing
  const mockReceiptDetails: ReceiptDetails = {
    abonent: {
      id: '1',
      fullName: 'Абдраева Н.Т.',
      address: 'ул. Космонавтов, дом 9',
      personalAccount: '25080009',
      balance: -4407.00,
      waterDebt: 3084.90,
      garbageDebt: 1322.10,
      status: AbonentStatus.Active,
      waterTariff: WaterTariffType.ByPerson,
      waterService: true,
      garbageService: true,
      hasGarden: false,
      currentMeterReading: 0,
      prevMeterReading: 0,
      penaltyRate: '0',
      gardenTariff: '0',
      createdAt: new Date().toISOString()
    },
    period: 'Декабрь 2024',
    personalAccount: '25080009',
    controllerName: 'Тагаева С.Ж.',
    companySettings: {
      name: 'МП "ЧУЙ ВОДОКАНАЛ"',
      address: 'г. Токмок, ул. Ленина 1',
      phone: '6-69-37, 0559909143',
      instagram: 'mp_tokmokvodokanal',
      receiptTemplate: 'tokmok'
    },
    waterService: {
      charges: {
        name: 'Холодная вода',
        debt: 3084.90,
        accrued: 0,
        total: 3084.90
      }
    },
    garbageService: {
      charges: {
        name: 'Стоки',
        debt: 1322.10,
        accrued: 0,
        total: 1322.10
      }
    },
    totalToPay: 4407.00
  };

  const mockAbonents: Abonent[] = [
    {
      id: '1',
      fullName: 'Абдраева Н.Т.',
      address: 'ул. Космонавтов, дом 9',
      personalAccount: '25080009',
      balance: -4407.00,
      waterDebt: 3084.90,
      garbageDebt: 1322.10,
      status: AbonentStatus.Active,
      waterTariff: WaterTariffType.ByPerson,
      waterService: true,
      garbageService: true,
      hasGarden: false,
      currentMeterReading: 0,
      prevMeterReading: 0,
      penaltyRate: '0',
      gardenTariff: '0',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      fullName: 'Абдразакова М.',
      address: 'ул. Октябрьская, дом 10 кв. 10',
      personalAccount: '25080010',
      balance: -1420.00,
      waterDebt: 994.00,
      garbageDebt: 426.00,
      status: AbonentStatus.Active,
      waterTariff: WaterTariffType.ByPerson,
      waterService: true,
      garbageService: true,
      hasGarden: false,
      currentMeterReading: 0,
      prevMeterReading: 0,
      penaltyRate: '0',
      gardenTariff: '0',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      fullName: 'Абдраимова',
      address: 'ул. Ключевая, дом 12',
      personalAccount: '25080012',
      balance: -3293.00,
      waterDebt: 2305.10,
      garbageDebt: 987.90,
      status: AbonentStatus.Active,
      waterTariff: WaterTariffType.ByPerson,
      waterService: true,
      garbageService: true,
      hasGarden: false,
      currentMeterReading: 0,
      prevMeterReading: 0,
      penaltyRate: '0',
      gardenTariff: '0',
      createdAt: new Date().toISOString()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Тестирование Шаблонов</h1>
          <p className="mt-2 text-gray-600">
            Страница для тестирования новых шаблонов квитанций и отчетов
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Тест квитанции */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Шаблон Квитанции (Стиль Токмок)
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50">
              <TokmokStyleReceiptTemplate details={mockReceiptDetails} />
            </div>
          </div>

          {/* Тест отчета по показаниям */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Отчет по Показаниям (Стиль Токмок)
            </h2>
            <div className="border rounded-lg p-4 bg-gray-50">
              <TokmokStyleMeterReportTemplate abonents={mockAbonents} />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Инструкции по Тестированию
          </h2>
          <div className="prose max-w-none">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                <strong>Квитанция:</strong> Проверьте корректность отображения всех данных,
                правильность расчета сумм и форматирование
              </li>
              <li>
                <strong>Отчет по показаниям:</strong> Убедитесь, что таблица корректно
                отображает данные абонентов и правильно форматируется
              </li>
              <li>
                <strong>Печать:</strong> Протестируйте печать (Ctrl+P) для проверки
                корректности отображения на бумаге
              </li>
              <li>
                <strong>Адаптивность:</strong> Проверьте отображение на разных размерах экрана
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTemplatesPage; 