import React from 'react';
import { ReceiptDetails } from '../../types';

interface TokmokStyleReceiptTemplateProps {
  details: ReceiptDetails;
}

const TokmokStyleReceiptTemplate: React.FC<TokmokStyleReceiptTemplateProps> = ({ details }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('ru-RU', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Создаем 3 квитанции на одной странице
  const createReceipt = (index: number) => (
    <div key={index} style={{
      width: '100%',
      maxWidth: '210mm',
      height: '99mm', // 1/3 от A4 (297mm)
      padding: '8px',
      marginBottom: '1mm',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      boxSizing: 'border-box',
      pageBreakInside: 'avoid',
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Заголовок квитанции */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
        borderBottom: '1px solid #000',
        paddingBottom: '5px',
      }}>
        {/* Левая часть - логотип и название */}
        <div style={{ flex: '1' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '3px',
          }}>
            {/* Логотип капли воды */}
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#0066cc',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '8px',
              color: 'white',
              fontSize: '12px',
              fontWeight: 'bold',
            }}>
              💧
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#0066cc',
            }}>
              МП "ЧУЙ ВОДОКАНАЛ"
            </div>
          </div>
          
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '2px',
          }}>
            Муздак суу жана агындылар / Холодная вода и стоки
          </div>
          
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '2px',
            textTransform: 'uppercase',
          }}>
            {currentMonth} {currentYear}
          </div>
          
          <div style={{ fontSize: '9px', marginBottom: '1px' }}>
            г.Токмок, ул. Ленина 1
          </div>
          
          <div style={{ fontSize: '9px', marginBottom: '1px' }}>
            6-69-37, 0559909143, 0704480890
          </div>
          
          <div style={{ fontSize: '9px', marginBottom: '1px' }}>
            Контролер: {details.controllerName}
          </div>
          
          <div style={{ fontSize: '9px', marginBottom: '1px' }}>
            Жашоочулар/Кол-во чел.: 2
          </div>
          
          <div style={{ fontSize: '9px', marginBottom: '1px' }}>
            Вода - 13.24, стоки - 6.79
          </div>
          
          <div style={{ fontSize: '9px' }}>
            Instagram: mp_tokmokvodokanal
          </div>
        </div>

        {/* Правая часть - информация об абоненте */}
        <div style={{
          textAlign: 'right',
          flex: '1',
          marginLeft: '10px',
        }}>
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            <strong>ФИО:</strong> {details.abonent.fullName}
          </div>
          
          <div style={{ fontSize: '10px', marginBottom: '2px' }}>
            <strong>Адрес:</strong> {details.abonent.address}
          </div>
          
          <div style={{ fontSize: '10px', marginBottom: '5px' }}>
            <strong>Лицевой счет:</strong>
          </div>
          
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#0066cc',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            display: 'inline-block',
            border: '2px solid #000',
          }}>
            {details.personalAccount}
          </div>
        </div>
      </div>

      {/* Таблица начислений */}
      <div style={{ marginBottom: '8px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1px solid #000',
          fontSize: '8px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Вид платежа
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Долг(+)/<br/>Переплата(-)
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Оплачено
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Расход<br/>(м.куб.)
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Начислено
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                НСП 3%
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Перерасчет
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Туум/<br/>Пеня
              </th>
              <th style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                Итого
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Холодная вода */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '2px', fontSize: '7px', fontWeight: 'bold' }}>
                Холодная вода
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency(details.waterService?.charges?.debt || 0)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                0.00
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                10.4
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency(details.waterService?.charges?.accrued || 0)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency((details.waterService?.charges?.accrued || 0) * 0.03)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                0.00
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency((details.waterService?.charges?.accrued || 0) * 0.03)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px', fontWeight: 'bold' }}>
                {formatCurrency((details.waterService?.charges?.debt || 0) + (details.waterService?.charges?.accrued || 0) + ((details.waterService?.charges?.accrued || 0) * 0.06))}
              </td>
            </tr>
            
            {/* Стоки */}
            <tr>
              <td style={{ border: '1px solid #000', padding: '2px', fontSize: '7px', fontWeight: 'bold' }}>
                Стоки
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency(details.garbageService?.charges?.debt || 0)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                0.00
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'center', fontSize: '7px' }}>
                10.4
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency(details.garbageService?.charges?.accrued || 0)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency((details.garbageService?.charges?.accrued || 0) * 0.03)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                0.00
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px' }}>
                {formatCurrency((details.garbageService?.charges?.accrued || 0) * 0.03)}
              </td>
              <td style={{ border: '1px solid #000', padding: '2px', textAlign: 'right', fontSize: '7px', fontWeight: 'bold' }}>
                {formatCurrency((details.garbageService?.charges?.debt || 0) + (details.garbageService?.charges?.accrued || 0) + ((details.garbageService?.charges?.accrued || 0) * 0.06))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Нижняя часть квитанции */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        {/* Левая часть - показания счетчика */}
        <div style={{ flex: '1' }}>
          <div style={{ fontSize: '8px', marginBottom: '3px' }}>
            <strong>Показания водомера:</strong>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '5px',
            fontSize: '7px',
          }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>Пред.показания</div>
              <div style={{ border: '1px solid #000', padding: '2px', minHeight: '15px' }}></div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Тек. показания</div>
              <div style={{ border: '1px solid #000', padding: '2px', minHeight: '15px' }}></div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>Сарпталган/Расходы</div>
              <div style={{ border: '1px solid #000', padding: '2px', minHeight: '15px' }}>0</div>
            </div>
          </div>
        </div>

        {/* Правая часть - сумма к оплате */}
        <div style={{
          textAlign: 'center',
          flex: '1',
          marginLeft: '10px',
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '5px',
          }}>
            Төлөөгө/К оплате:
          </div>
          
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: '#0066cc',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '2px solid #000',
            marginBottom: '5px',
          }}>
            {formatCurrency(details.totalToPay)} сом
          </div>
          
          {/* Место для QR кода заменено на лицевой счет */}
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            fontSize: '6px',
            textAlign: 'center',
          }}>
            Лицевой<br/>счет
          </div>
        </div>
      </div>

      {/* Важные уведомления */}
      <div style={{
        marginTop: '5px',
        padding: '3px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '3px',
        fontSize: '6px',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
          ⚠️ ВАЖНО:
        </div>
        <div style={{ marginBottom: '1px' }}>
          • Если не оплатите до 25.{currentDate.getDate().toString().padStart(2, '0')}.{currentYear}, будет начислена пеня и отключена подача воды!
        </div>
        <div>
          • Строго запрещено использовать питьевую воду для полива садов, мытья ковров, дворов, машин и т.д.!
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '0',
      margin: '0',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* 3 квитанции на одной странице А4 */}
      {createReceipt(1)}
      {createReceipt(2)}
      {createReceipt(3)}
    </div>
  );
};

export default TokmokStyleReceiptTemplate; 