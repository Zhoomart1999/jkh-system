import React, { useState, useEffect } from 'react';
import { api } from "../../src/firebase/real-api";
import { Abonent, ReceiptDetails, CompanySettings } from '../../types';
import { PrinterIcon, DownloadIcon, EyeIcon, CheckIcon } from './Icons';
import TokmokStyleReceiptTemplate from '../templates/TokmokStyleReceiptTemplate';
import TokmokStyleMeterReportTemplate from '../templates/TokmokStyleMeterReportTemplate';
import { useNotifications } from '../../context/NotificationContext';

interface MassPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAbonents: Abonent[];
}

interface PrintOptions {
  includeReceipts: boolean;
  includeRegistry: boolean;
  includeCheckNotices: boolean;
  paperSize: 'A4' | 'A5';
  orientation: 'portrait' | 'landscape';
  copies: number;
  groupByController: boolean;
}

const MassPrintModal: React.FC<MassPrintModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedAbonents 
}) => {
  const { showNotification } = useNotifications();
  const [printOptions, setPrintOptions] = useState<PrintOptions>({
    includeReceipts: true,
    includeRegistry: false,
    includeCheckNotices: false,
    paperSize: 'A4',
    orientation: 'portrait',
    copies: 1,
    groupByController: false
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setGeneratedFiles([]);
      setProgress(0);
      setCurrentStep('');
    }
  }, [isOpen]);

  const handleOptionChange = (key: keyof PrintOptions, value: any) => {
    setPrintOptions(prev => ({ ...prev, [key]: value }));
  };

  const generateMassPrint = async () => {
    if (selectedAbonents.length === 0) {
      showNotification('warning', 'Абоненты не выбраны', 'Не выбрано ни одного абонента');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Подготовка данных...');

    try {
      const files: string[] = [];
      const totalSteps = Object.values(printOptions).filter(Boolean).length;
      let currentStepIndex = 0;

      // Группируем абонентов по контроллерам если нужно
      let abonentsToProcess = selectedAbonents;
      if (printOptions.groupByController) {
        abonentsToProcess = selectedAbonents.sort((a, b) => 
          (a.controllerId || '').localeCompare(b.controllerId || '')
        );
      }

      // Генерируем квитанции
      if (printOptions.includeReceipts) {
        setCurrentStep('Генерация квитанций...');
        const receiptsFile = await generateReceipts(abonentsToProcess);
        if (receiptsFile) files.push(receiptsFile);
        currentStepIndex++;
        setProgress((currentStepIndex / totalSteps) * 100);
      }

      // Генерируем реестр
      if (printOptions.includeRegistry) {
        setCurrentStep('Генерация реестра...');
        const registryFile = await generateRegistry(abonentsToProcess);
        if (registryFile) files.push(registryFile);
        currentStepIndex++;
        setProgress((currentStepIndex / totalSteps) * 100);
      }

      // Генерируем извещения
      if (printOptions.includeCheckNotices) {
        setCurrentStep('Генерация извещений...');
        const noticesFile = await generateCheckNotices(abonentsToProcess);
        if (noticesFile) files.push(noticesFile);
        currentStepIndex++;
        setProgress((currentStepIndex / totalSteps) * 100);
      }

      setGeneratedFiles(files);
      setCurrentStep('Готово!');
      setProgress(100);

      // Логируем массовую печать
      try {
        await api.logMassPrint({
          abonentIds: selectedAbonents.map(a => a.id),
          options: printOptions,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        // Игнорируем ошибки логирования
      }
    } catch (error) {
      // Игнорируем ошибки генерации документов
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReceipts = async (abonents: Abonent[]): Promise<string | null> => {
    try {
      // Получаем настройки компании
      const companySettings: CompanySettings = {
        name: 'МП "ЧУЙ ВОДОКАНАЛ"',
        address: 'г. Токмок, ул. Ленина 1',
        phone: '6-69-37, 0559909143',
        instagram: 'mp_tokmokvodokanal',
        receiptTemplate: 'tokmok'
      };

      // Создаем HTML с нашим красивым шаблоном
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Массовая печать квитанций</title>
          <style>
            @media print {
              body { 
                background-color: white !important; 
                margin: 0 !important; 
                padding: 0 !important; 
              }
              .receipt-container { 
                margin: 0 !important; 
                page-break-after: always !important; 
                box-shadow: none !important;
                border-radius: 0 !important;
              }
              .receipt-container:last-child { 
                page-break-after: avoid !important; 
              }
              .receipt-content {
                box-shadow: none !important;
                border-radius: 0 !important;
              }
            }
            
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              background-color: #f5f5f5;
            }
            .receipt-container {
              margin: 10px;
              page-break-after: always;
              page-break-inside: avoid;
            }
            .receipt-container:last-child {
              page-break-after: avoid;
            }
            .receipt-content {
              width: 100%;
              max-width: 210mm;
              height: 99mm;
              padding: 8px;
              margin-bottom: 1mm;
              background-color: white;
              font-family: Arial, sans-serif;
              font-size: 10px;
              line-height: 1.2;
              color: #000;
              box-sizing: border-box;
              margin: 0 auto;
              border: 1px solid #ddd;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
      `;

      for (const abonent of abonents) {
        try {
          // Получаем детали квитанции для каждого абонента
          const receiptDetails = await api.getReceiptDetails(abonent.id);
          
          // Генерируем HTML квитанции с нашим шаблоном
          html += generateReceiptHTML(receiptDetails, companySettings);
        } catch (error) {
          // Создаем базовую квитанцию если API недоступен
          const basicReceipt: ReceiptDetails = {
            abonent: abonent,
            period: new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
            personalAccount: abonent.personalAccount || 'N/A',
            controllerName: 'Тагаева С.Ж.',
            companySettings: companySettings,
            waterService: {
              charges: {
                name: 'Холодная вода',
                debt: abonent.waterDebt || 0,
                accrued: 0,
                total: abonent.waterDebt || 0
              }
            },
            garbageService: {
              charges: {
                name: 'Стоки',
                debt: abonent.garbageDebt || 0,
                accrued: 0,
                total: abonent.garbageDebt || 0
              }
            },
            totalToPay: (abonent.waterDebt || 0) + (abonent.garbageDebt || 0)
          };
          html += generateReceiptHTML(basicReceipt, companySettings);
        }
      }

      html += '</body></html>';

      // Создаем файл
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error) {
      // Игнорируем ошибку генерации квитанций
      return null;
    }
  };

  const generateReceiptHTML = (receiptDetails: ReceiptDetails, companySettings: CompanySettings): string => {
    // Создаем контейнер для квитанции
    return `
      <div class="receipt-container">
        <div class="receipt-content">
          <!-- Заголовок с логотипом -->
          <div style="
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
            border-bottom: 3px solid #0066cc;
            padding-bottom: 15px;
            flex-wrap: wrap;
            gap: 15px;
          ">
            <!-- Логотип МП ЧУЙ ВОДОКАНАЛ -->
            <div style="
              width: 100px;
              height: 100px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #0066cc;
              border-radius: 50%;
              border: 3px solid #0099ff;
              color: white;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
              line-height: 1.2;
              padding: 8px;
            ">
              МП<br/>ЧУЙ<br/>ВОДОКАНАЛ
            </div>

            <!-- Информация о компании -->
            <div style="
              text-align: right;
              flex: 1;
              min-width: 200px;
            ">
              <div style="
                font-size: 20px;
                font-weight: bold;
                color: #0066cc;
                margin-bottom: 5px;
              ">
                МП "ЧУЙ ВОДОКАНАЛ"
              </div>
              <div style="
                font-size: 14px;
                color: #666;
                margin-bottom: 3px;
              ">
                г. Токмок, ул. Ленина 1
              </div>
              <div style="font-size: 14px; margin-bottom: 5px;">
                Тел: ${companySettings.phone}
              </div>
              <div style="font-size: 14px; margin-bottom: 5px;">
                Instagram: ${companySettings.instagram}
              </div>
              <div style="
                font-size: 16px;
                font-weight: bold;
                margin-top: 10px;
                color: #0066cc;
              ">
                ${new Date().toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase()} ${new Date().getFullYear()}
              </div>
            </div>
          </div>

          <!-- Основная информация об абоненте -->
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
          ">
            <div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0066cc;">
                Абонент:
              </div>
              <div style="font-size: 18px; font-weight: bold;">
                ${receiptDetails.abonent.fullName}
              </div>
            </div>
            
            <div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0066cc;">
                Адрес:
              </div>
              <div style="font-size: 16px;">
                ${receiptDetails.abonent.address}
              </div>
            </div>

            <div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0066cc;">
                Лицевой счет:
              </div>
              <div style="
                font-size: 20px;
                font-weight: bold;
                background-color: #0066cc;
                color: white;
                padding: 8px 15px;
                border-radius: 6px;
                display: inline-block;
              ">
                ${receiptDetails.personalAccount}
              </div>
            </div>

            <div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: #0066cc;">
                Контролер:
              </div>
              <div style="font-size: 16px;">
                ${receiptDetails.controllerName}
              </div>
            </div>
          </div>

          <!-- Итоговая сумма -->
          <div style="
            text-align: center;
            margin-bottom: 25px;
            padding: 20px;
            background-color: #0066cc;
            color: white;
            border-radius: 8px;
          ">
            <div style="font-size: 18px; margin-bottom: 10px;">
              ТӨЛӨӨГӨ / К ОПЛАТЕ:
            </div>
            <div style="font-size: 32px; font-weight: bold;">
              ${receiptDetails.totalToPay.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
            </div>
          </div>

          <!-- Подписи -->
          <div style="
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 30px;
          ">
            <div style="text-align: center;">
              <div style="
                border-top: 2px solid #000;
                padding-top: 10px;
                margin-top: 30px;
              ">
                Подпись контролера
              </div>
            </div>
            
            <div style="text-align: center;">
              <div style="
                border-top: 2px solid #000;
                padding-top: 10px;
                margin-top: 30px;
              ">
                Подпись бухгалтера
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const generateRegistry = async (abonents: Abonent[]): Promise<string | null> => {
    try {
      // Создаем HTML реестра с нашим шаблоном
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Реестр показаний счетчиков</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #f5f5f5;
            }
            .registry-container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background-color: #0066cc;
              color: white;
              padding: 20px;
              text-align: center;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 0;
            }
            th, td { 
              border: 1px solid #dee2e6; 
              padding: 12px; 
              text-align: left; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
              color: #0066cc;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            @media print {
              body { background-color: white; }
              .registry-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="registry-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">ОТЧЕТ ПО ВОДОМЕРАМ</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">
                Дата: ${new Date().toLocaleDateString('ru-RU')}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px;">
                Количество абонентов: ${abonents.length}
              </p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Лицевой счет</th>
                  <th>ФИО</th>
                  <th>Адрес</th>
                  <th>Контролер</th>
                  <th>Долг (сом)</th>
                </tr>
              </thead>
              <tbody>
      `;

      abonents.forEach((abonent, index) => {
        html += `
          <tr>
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td>${abonent.personalAccount || 'Н/Д'}</td>
            <td>${abonent.fullName}</td>
            <td>${abonent.address}</td>
            <td>${abonent.controllerId || 'Н/Д'}</td>
            <td style="text-align: right; font-weight: bold;">${(abonent.balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </div>
        </body>
      </html>
      `;

      // Создаем файл
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error) {
      // Игнорируем ошибку генерации реестра
      return null;
    }
  };

  const generateCheckNotices = async (abonents: Abonent[]): Promise<string | null> => {
    try {
      // Создаем HTML извещений
      let html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Извещения о проверке</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background-color: #f5f5f5;
            }
            .notice-container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              padding: 20px;
              margin-bottom: 20px;
              page-break-inside: avoid;
            }
            .notice-container:last-child {
              margin-bottom: 0;
            }
            .header {
              background-color: #0066cc;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .abonent-info {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 6px;
              border-left: 4px solid #0066cc;
            }
            .info-label {
              font-weight: bold;
              color: #0066cc;
              margin-bottom: 5px;
            }
            @media print {
              body { background-color: white; }
              .notice-container { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">ИЗВЕЩЕНИЯ О ПРОВЕРКЕ</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">
              Дата: ${new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>
      `;

      abonents.forEach((abonent, index) => {
        html += `
          <div class="notice-container">
            <h3 style="color: #0066cc; margin-top: 0;">Извещение №${index + 1}</h3>
            <div class="abonent-info">
              <div class="info-item">
                <div class="info-label">ФИО:</div>
                <div>${abonent.fullName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Адрес:</div>
                <div>${abonent.address}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Лицевой счет:</div>
                <div>${abonent.personalAccount || 'Н/Д'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Долг:</div>
                <div style="font-weight: bold; color: ${(abonent.balance || 0) > 0 ? '#dc3545' : '#28a745'};">
                  ${(abonent.balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
                </div>
              </div>
            </div>
            <div style="
              padding: 15px;
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 6px;
              color: #856404;
            ">
              <strong>Внимание!</strong> Пожалуйста, подготовьте доступ к водомеру для проверки показаний.
            </div>
          </div>
        `;
      });

      html += '</body></html>';

      // Создаем файл
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      return url;
    } catch (error) {
      // Игнорируем ошибку генерации извещений
      return null;
    }
  };

  const handlePrint = (fileUrl: string) => {
    try {
      if (selectedAbonents.length === 0) {
            showNotification({
                type: 'warning',
                title: 'Абоненты не выбраны',
                message: 'Не выбрано ни одного абонента'
            });
            return;
        }
      // Создаем новое окно для печати
      const printWindow = window.open(fileUrl, '_blank', 'width=800,height=600');
      
      if (printWindow) {
        printWindow.focus();
        
        // Ждем загрузки содержимого и затем открываем принтер
        printWindow.onload = () => {
          setTimeout(() => {
            try {
              printWindow.print();
            } catch (error) {
              // Если не удалось открыть принтер, показываем содержимое
              printWindow.focus();
            }
          }, 500);
        };
        
        // Fallback если onload не сработал
        setTimeout(() => {
          if (printWindow.document.readyState === 'complete') {
            try {
              printWindow.print();
            } catch (error) {
              // Если не удалось открыть принтер, показываем содержимое
              printWindow.focus();
            }
          }
        }, 2000);
      } else {
        // Если не удалось открыть окно, показываем ошибку
        showNotification({
          type: 'warning',
          title: 'Ошибка печати',
          message: 'Не удалось открыть окно печати. Проверьте блокировщик всплывающих окон.'
        });
      }
    } catch (error) {
      // Игнорируем ошибку в handlePrint
      showNotification({
        type: 'error',
        title: 'Ошибка принтера',
        message: 'Ошибка при открытии принтера: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка')
      });
    }
  };

  const handleDownload = (fileUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <PrinterIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Массовая печать</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {selectedAbonents.length} абонентов
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Опции печати */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Опции печати</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printOptions.includeReceipts}
                  onChange={(e) => handleOptionChange('includeReceipts', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Квитанции
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printOptions.includeRegistry}
                  onChange={(e) => handleOptionChange('includeRegistry', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Реестр показаний
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printOptions.includeCheckNotices}
                  onChange={(e) => handleOptionChange('includeCheckNotices', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Извещения о проверке
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={printOptions.groupByController}
                  onChange={(e) => handleOptionChange('groupByController', e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                Группировать по контроллерам
              </label>
            </div>
          </div>

          {/* Настройки печати */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Настройки печати</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Размер бумаги
                </label>
                <select
                  value={printOptions.paperSize}
                  onChange={(e) => handleOptionChange('paperSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="A4">A4</option>
                  <option value="A5">A5</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ориентация
                </label>
                <select
                  value={printOptions.orientation}
                  onChange={(e) => handleOptionChange('orientation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="portrait">Книжная</option>
                  <option value="landscape">Альбомная</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Копии
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={printOptions.copies}
                  onChange={(e) => handleOptionChange('copies', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Прогресс */}
          {isProcessing && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{currentStep}</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Сгенерированные файлы */}
          {generatedFiles.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Сгенерированные файлы</h3>
              <div className="space-y-2">
                {generatedFiles.map((fileUrl, index) => {
                  const fileType = printOptions.includeReceipts && index === 0 ? 'Квитанции' :
                                  printOptions.includeRegistry && (index === 0 || (printOptions.includeReceipts && index === 1)) ? 'Реестр' : 'Извещения';
                  const filename = `mass_print_${fileType.toLowerCase()}_${new Date().toISOString().split('T')[0]}.html`;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{fileType}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Сначала показываем содержимое
                            const previewWindow = window.open(fileUrl, '_blank', 'width=1000,height=800');
                            if (previewWindow) {
                              previewWindow.focus();
                            }
                          }}
                          className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Просмотр</span>
                        </button>
                        <button
                          onClick={() => handlePrint(fileUrl)}
                          className="flex items-center space-x-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          <PrinterIcon className="w-4 h-4" />
                          <span>Печать</span>
                        </button>
                        <button
                          onClick={() => handleDownload(fileUrl, filename)}
                          className="flex items-center space-x-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-700 transition-colors"
                        >
                          <DownloadIcon className="w-4 h-4" />
                          <span>Скачать</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Инструкции по печати */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💡 Инструкции по печати:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• <strong>Просмотр</strong> - откроет документ в новом окне для проверки</li>
                  <li>• <strong>Печать</strong> - откроет диалог принтера автоматически</li>
                  <li>• <strong>Скачать</strong> - сохранит HTML файл на компьютер</li>
                  <li>• Если принтер не открывается, проверьте блокировщик всплывающих окон</li>
                </ul>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={generateMassPrint}
              disabled={isProcessing || (!printOptions.includeReceipts && !printOptions.includeRegistry && !printOptions.includeCheckNotices)}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                isProcessing || (!printOptions.includeReceipts && !printOptions.includeRegistry && !printOptions.includeCheckNotices)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isProcessing ? 'Генерация...' : 'Генерировать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MassPrintModal; 