import React from 'react';
import { ReceiptDetails } from '../../types';

const ChuiReceiptTemplate: React.FC<{ details: ReceiptDetails }> = ({ details }) => {
  const { abonent, companySettings, waterService, garbageService, totalToPay } = details;
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ru-RU', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      year: 'numeric', 
      month: 'long' 
    }).toUpperCase();
  };

  // Получаем текущий месяц и год
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('ru-RU', { month: 'long' }).toUpperCase();
  const currentYear = currentDate.getFullYear();

  // Вычисляем долги за воду и мусор
  const waterDebt = waterService?.charges?.debt || 0;
  const garbageDebt = garbageService?.charges?.debt || 0;
  const totalDebt = waterDebt + garbageDebt;

  return (
    <div className="chui-receipt" style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '10mm',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      lineHeight: '1.4',
      color: '#000',
      boxSizing: 'border-box'
    }}>
      {/* Заголовок с логотипом */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
        borderBottom: '2px solid #0066cc',
        paddingBottom: '10px'
      }}>
        <div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#0066cc',
            margin: '0 0 5px 0'
          }}>
            МП "ЧУЙ ВОДОКАНАЛ"
          </h1>
          <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>
            г. Токмок, ул. Ленина 1<br/>
            Телефон: 6-69-37, 0559909143
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>
            Квитанция № {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
          <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>
            {currentMonth} {currentYear}
          </p>
        </div>
      </div>

      {/* Информация об абоненте */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Абонент:</span>
          <span>{abonent.fullName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Адрес:</span>
          <span>{abonent.address}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Контролер:</span>
          <span>{abonent.controllerName || 'Тагаева С.Ж.'}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 'bold' }}>Количество проживающих:</span>
          <span>{abonent.residentsCount || 3} человек</span>
        </div>
      </div>

      {/* Блок холодной воды и стоков */}
      <div style={{
        border: '2px solid #0066cc',
        borderRadius: '8px',
        marginBottom: '15px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#0066cc',
          color: 'white',
          padding: '8px 12px',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          МУЗДАК СУУ ЖАНА АГЫНДЫЛАР / ХОЛОДНАЯ ВОДА И СТОКИ
        </div>
        
        <div style={{ padding: '12px' }}>
          {/* Таблица расчетов за воду */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#0066cc'
            }}>
              СУУ / ВОДА
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Показатель</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>Сумма (сом)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Карыз/Долг</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterDebt)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Сарпталышы/Расход (м.куб.)</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {waterService?.consumption || 15.6}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Эсептелди/Начислено</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.current || 206.55)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>CAC 3%</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.tax || 6.2)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Туум/Пеня</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.penalty || 7.41)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Итого</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.total || 937.78)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Таблица расчетов за стоки */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#0066cc'
            }}>
              АГЫНДЫ / СТОКИ
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Показатель</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>Сумма (сом)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Карыз/Долг</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(garbageDebt)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Сарпталышы/Расход (м.куб.)</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {waterService?.consumption || 15.6}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Эсептелди/Начислено</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.sewerage || 105.93)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>НСП 3%</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.sewerageTax || 3.18)}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Туум/Пеня</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.seweragePenalty || 4.35)}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>Итого</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                    {formatCurrency(waterService?.charges?.sewerageTotal || 482.67)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Показания счетчика */}
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ 
              fontSize: '13px', 
              fontWeight: 'bold', 
              marginBottom: '8px',
              color: '#0066cc'
            }}>
              СУУ САНАГЫЧЫ / ВОДОМЕР
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>Мурунку көрсөткүч / Предыдущие показания</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>Учурдагы көрсөткүч / Текущие показания</th>
                  <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>Сарпталыш / Расход</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>_____</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>_____</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>_____</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Итого к оплате за воду и стоки */}
          <div style={{
            backgroundColor: '#e3f2fd',
            padding: '10px',
            borderRadius: '5px',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', color: '#0066cc' }}>
              ИТОГО К ОПЛАТЕ ЗА ВОДУ И СТОКИ: {formatCurrency(waterService?.charges?.total + waterService?.charges?.sewerageTotal || 1420.45)} сом
            </p>
          </div>

          {/* QR код место */}
          <div style={{
            textAlign: 'center',
            marginBottom: '10px',
            padding: '10px',
            border: '2px dashed #ccc',
            borderRadius: '5px'
          }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#666' }}>QR-код ELQR</p>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#f0f0f0',
              border: '1px solid #ddd',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#999'
            }}>
              QR CODE
            </div>
          </div>

          {/* Важное примечание */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '5px',
            padding: '8px',
            marginBottom: '10px'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: '10px', 
              color: '#856404',
              fontWeight: 'bold'
            }}>
              ⚠️ Эгер 25.07.2025 чейин төлөбөсөңүз, сизге туум эсептелинет жана суу өчүрүлөт.<br/>
              В случае неоплаты до 25.07.2025, Вам будет начисляться пеня и прекращено водоснабжение.
            </p>
          </div>

          {/* Запрет */}
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '5px',
            padding: '8px'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: '10px', 
              color: '#721c24',
              fontWeight: 'bold'
            }}>
              🚫 Полив зеленых насаждений огородов, мытье ковров, паласов, дворов, машин и т.д. питьевой водой категорически запрещается!
            </p>
          </div>
        </div>
      </div>

      {/* Блок вывоза мусора */}
      <div style={{
        border: '2px solid #28a745',
        borderRadius: '8px',
        marginBottom: '15px',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#28a745',
          color: 'white',
          padding: '8px 12px',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          ТАШТАНДЫЛАРДЫ ЧЫГАРУУ / ВЫВОЗ МУСОРА
        </div>
        
        <div style={{ padding: '12px' }}>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ margin: '0', fontSize: '11px' }}>
              <strong>Месяц расчета:</strong> {currentMonth} {currentYear}
            </p>
            <p style={{ margin: '0', fontSize: '11px' }}>
              <strong>Поставщик услуг:</strong> ОсОО "Экологист"
            </p>
            <p style={{ margin: '0', fontSize: '11px' }}>
              <strong>Количество проживающих:</strong> {abonent.residentsCount || 2} человек
            </p>
            <p style={{ margin: '0', fontSize: '11px' }}>
              <strong>Лицевой счет Эколога:</strong> {abonent.personalAccount || '1005412-0'}
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'left' }}>Показатель</th>
                <th style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>Сумма (сом)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>Мурунку ай/Предыдущий месяц</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                  {formatCurrency(garbageService?.charges?.debt || 1367)}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>Эсептелди/Начислено</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                  {formatCurrency(garbageService?.charges?.current || 62)}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>Туум/Пеня</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                  {formatCurrency(garbageService?.charges?.penalty || 208.25)}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#d4edda', fontWeight: 'bold' }}>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>Итого к оплате за мусор</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>
                  {formatCurrency(garbageService?.charges?.total || 1637.25)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Важное примечание для мусора */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '5px',
            padding: '8px'
          }}>
            <p style={{ 
              margin: '0', 
              fontSize: '10px', 
              color: '#856404',
              fontWeight: 'bold'
            }}>
              ⚠️ Эгер 25.07.2025 чейин төлөбөсөңүз, туум эсептелет.<br/>
              В случае неоплаты до 25.07.2025 Вам будет начислена пеня.
            </p>
          </div>
        </div>
      </div>

      {/* Итоговый блок */}
      <div style={{
        border: '3px solid #dc3545',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#dc3545',
          margin: '0 0 15px 0'
        }}>
          ИТОГО К ОПЛАТЕ
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Токмок Водоканал:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(waterService?.charges?.total + waterService?.charges?.sewerageTotal || 1420.45)} сом</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Экологист:</span>
            <span style={{ fontWeight: 'bold' }}>{formatCurrency(garbageService?.charges?.total || 1637.25)} сом</span>
          </div>
          <hr style={{ border: '1px solid #ddd', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
            <span>ИТОГО К ОПЛАТЕ:</span>
            <span>{formatCurrency(totalToPay || 3057.70)} сом</span>
          </div>
        </div>

        {/* QR код место для общей оплаты */}
        <div style={{
          textAlign: 'center',
          marginBottom: '15px',
          padding: '10px',
          border: '2px dashed #ccc',
          borderRadius: '5px'
        }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: '#666' }}>QR-код ELQR</p>
          <div style={{
            width: '100px',
            height: '100px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ddd',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            color: '#999'
          }}>
            QR CODE
          </div>
        </div>

        {/* Призыв к цифровизации */}
        <div style={{
          backgroundColor: '#d1ecf1',
          border: '1px solid #bee5eb',
          borderRadius: '5px',
          padding: '10px',
          textAlign: 'center'
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: '11px', 
            color: '#0c5460',
            fontWeight: 'bold'
          }}>
            📱 Не ждите бумажные квитанции! Скачайте приложение mydom.kg, получайте квитанции в цифровом формате и оплачивайте коммунальные услуги без комиссии!
          </p>
        </div>
      </div>

      {/* Подпись */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '10px',
        color: '#666'
      }}>
        <p style={{ margin: '0' }}>
          Квитанция сформирована автоматически • {new Date().toLocaleString('ru-RU')}
        </p>
      </div>
    </div>
  );
};

export default ChuiReceiptTemplate;
