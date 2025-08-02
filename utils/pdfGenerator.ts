import { ReceiptDetails } from '../types';

// Простая функция для генерации PDF квитанции
export const generateReceiptPDF = async (receiptDetails: ReceiptDetails): Promise<string> => {
  // В реальности здесь был бы вызов библиотеки типа jsPDF или puppeteer
  // Пока возвращаем URL для демонстрации
  
  const { abonent, totalToPay, period } = receiptDetails;
  
  // Создаем простой HTML для квитанции
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Квитанция - ${abonent.fullName}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .company { font-size: 18px; font-weight: bold; }
        .info { margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #333; padding: 8px; text-align: left; }
        .table th { background-color: #f0f0f0; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin: 20px 0; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">МП "Токмок Водоканал"</div>
        <div>г. Токмок, ул. Ленина 1</div>
        <div>Телефон: 6-69-37, 0755 755 043</div>
      </div>
      
      <div class="info">
        <div class="info-row">
          <strong>Абонент:</strong> ${abonent.fullName}
        </div>
        <div class="info-row">
          <strong>Лицевой счет:</strong> ${receiptDetails.personalAccount}
        </div>
        <div class="info-row">
          <strong>Адрес:</strong> ${abonent.address}
        </div>
        <div class="info-row">
          <strong>Период:</strong> ${period}
        </div>
        <div class="info-row">
          <strong>Контролёр:</strong> ${receiptDetails.controllerName}
        </div>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Услуга</th>
            <th>Расход</th>
            <th>Тариф</th>
            <th>Начислено</th>
            <th>Долг</th>
            <th>Пеня</th>
            <th>Итого</th>
          </tr>
        </thead>
        <tbody>
          ${receiptDetails.waterService ? `
            <tr>
              <td>Вода</td>
              <td>${receiptDetails.waterService.charges.consumption} м³</td>
                              <td>7.96</td>
              <td>${receiptDetails.waterService.charges.accrued.toFixed(2)}</td>
              <td>${receiptDetails.waterService.charges.debt?.toFixed(2) || '0.00'}</td>
              <td>${receiptDetails.waterService.charges.penalty?.toFixed(2) || '0.00'}</td>
              <td>${receiptDetails.waterService.charges.total.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${receiptDetails.garbageService ? `
            <tr>
              <td>Вывоз мусора</td>
              <td>${receiptDetails.garbageService.charges.consumption} чел.</td>
                              <td>30.00</td>
              <td>${receiptDetails.garbageService.charges.accrued.toFixed(2)}</td>
              <td>${receiptDetails.garbageService.charges.debt?.toFixed(2) || '0.00'}</td>
              <td>${receiptDetails.garbageService.charges.penalty?.toFixed(2) || '0.00'}</td>
              <td>${receiptDetails.garbageService.charges.total.toFixed(2)}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
      
      <div class="total">
        ИТОГО К ОПЛАТЕ: ${totalToPay.toFixed(2)} сом
      </div>
      
      <div class="footer">
        <p>Оплатите до 15 числа следующего месяца</p>
        <p>При оплате через терминалы или банки, комиссия взимается с абонента</p>
        <p>Дата печати: ${new Date().toLocaleDateString('ru-RU')}</p>
      </div>
    </body>
    </html>
  `;
  
  // Создаем Blob с HTML контентом
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  return url;
};

// Функция для скачивания PDF
export const downloadReceiptPDF = async (receiptDetails: ReceiptDetails): Promise<void> => {
  try {
    const url = await generateReceiptPDF(receiptDetails);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = `квитанция_${receiptDetails.abonent.fullName}_${receiptDetails.period}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Освобождаем URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при генерации PDF:', error);
    alert('Ошибка при генерации квитанции');
  }
}; 