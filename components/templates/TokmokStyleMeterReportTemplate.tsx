import React from 'react';
import { Abonent } from '../../types';
import Logo from '../ui/Logo';

interface TokmokStyleMeterReportTemplateProps {
  abonents: Abonent[];
  reportDate: string;
  controllerName: string;
}

const TokmokStyleMeterReportTemplate: React.FC<TokmokStyleMeterReportTemplateProps> = ({
  abonents,
  reportDate,
  controllerName
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
      year: '2-digit'
    });
  };

  return (
    <div className="tokmok-meter-report" style={{
      width: '100%',
      maxWidth: '210mm',
      minHeight: '297mm',
      padding: '15px',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#000',
      boxSizing: 'border-box',
      margin: '0 auto',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      borderRadius: '8px'
    }}>
      {/* Заголовок с логотипом */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        borderBottom: '3px solid #0066cc',
        paddingBottom: '15px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {/* Логотип МП ЧУЙ ВОДОКАНАЛ */}
        <div style={{
          width: '80px',
          height: '80px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Logo size={80} />
        </div>

        {/* Заголовок отчета */}
        <div style={{ 
          textAlign: 'center', 
          flex: '1',
          minWidth: '300px'
        }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: '#0066cc',
            textTransform: 'uppercase'
          }}>
            ОТЧЕТ ПО ВОДОМЕРАМ
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: '#0066cc'
          }}>
            НА {formatDate(reportDate)}
          </div>
          <div style={{ 
            fontSize: '16px',
            marginTop: '10px',
            color: '#666'
          }}>
            Контроллер: {controllerName}
          </div>
        </div>

        {/* Печать */}
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#0066cc',
          textAlign: 'right',
          flexShrink: 0
        }}>
          Печать
        </div>
      </div>

      {/* Таблица показаний */}
      <div style={{
        marginBottom: '25px'
      }}>
        <div className="registry-content">
          {/* Заголовок */}
          <div style={{
            textAlign: 'center',
            marginBottom: '20px',
            padding: '15px',
            borderBottom: '2px solid #0066cc',
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#0066cc',
              marginBottom: '10px',
            }}>
              МП "ЧУЙ ВОДОКАНАЛ"
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '5px',
            }}>
              ОТЧЕТ ПО ВОДОМЕРАМ
            </div>
            <div style={{
              fontSize: '14px',
              color: '#666',
            }}>
              Дата: {new Date().toLocaleDateString('ru-RU')} | Количество абонентов: {abonents.length}
            </div>
          </div>

          {/* Таблица */}
          <div style={{
            overflowX: 'auto',
            fontSize: '11px', // Уменьшаем размер шрифта
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #ddd',
              fontSize: '11px', // Уменьшаем размер шрифта
            }}>
              <thead>
                <tr style={{
                  backgroundColor: '#0066cc',
                  color: 'white',
                  fontSize: '11px', // Уменьшаем размер шрифта
                }}>
                  <th style={{
                    padding: '6px 4px', // Уменьшаем отступы
                    border: '1px solid #0052cc',
                    textAlign: 'center',
                    fontSize: '11px', // Уменьшаем размер шрифта
                    fontWeight: 'bold',
                  }}>
                    №
                  </th>
                  <th style={{
                    padding: '6px 4px', // Уменьшаем отступы
                    border: '1px solid #0052cc',
                    textAlign: 'left',
                    fontSize: '11px', // Уменьшаем размер шрифта
                    fontWeight: 'bold',
                  }}>
                    Лицевой счет
                  </th>
                  <th style={{
                    padding: '6px 4px', // Уменьшаем отступы
                    border: '1px solid #0052cc',
                    textAlign: 'left',
                    fontSize: '11px', // Уменьшаем размер шрифта
                    fontWeight: 'bold',
                  }}>
                    ФИО
                  </th>
                  <th style={{
                    padding: '6px 4px', // Уменьшаем отступы
                    border: '1px solid #0052cc',
                    textAlign: 'left',
                    fontSize: '11px', // Уменьшаем размер шрифта
                    fontWeight: 'bold',
                  }}>
                    Адрес
                  </th>
                  <th style={{
                    padding: '6px 4px', // Уменьшаем отступы
                    border: '1px solid #0052cc',
                    textAlign: 'left',
                    fontSize: '11px', // Уменьшаем размер шрифта
                    fontWeight: 'bold',
                  }}>
                    Контролер
                  </th>
                  <th style={{
                    padding: '6px 4px', // Уменьшаем отступы
                    border: '1px solid #0052cc',
                    textAlign: 'right',
                    fontSize: '11px', // Уменьшаем размер шрифта
                    fontWeight: 'bold',
                  }}>
                    Долг (сом)
                  </th>
                </tr>
              </thead>
              <tbody>
                {abonents.map((abonent, index) => (
                  <tr key={abonent.id} style={{
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
                    fontSize: '11px', // Уменьшаем размер шрифта
                  }}>
                    <td style={{
                      padding: '4px 6px', // Уменьшаем отступы
                      border: '1px solid #ddd',
                      textAlign: 'center',
                      fontSize: '11px', // Уменьшаем размер шрифта
                      fontWeight: 'bold',
                    }}>
                      {index + 1}
                    </td>
                    <td style={{
                      padding: '4px 6px', // Уменьшаем отступы
                      border: '1px solid #ddd',
                      textAlign: 'left',
                      fontSize: '11px', // Уменьшаем размер шрифта
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                    }}>
                      {abonent.personalAccount || 'N/A'}
                    </td>
                    <td style={{
                      padding: '4px 6px', // Уменьшаем отступы
                      border: '1px solid #ddd',
                      textAlign: 'left',
                      fontSize: '11px', // Уменьшаем размер шрифта
                      fontWeight: 'bold',
                    }}>
                      {abonent.fullName}
                    </td>
                    <td style={{
                      padding: '4px 6px', // Уменьшаем отступы
                      border: '1px solid #ddd',
                      textAlign: 'left',
                      fontSize: '11px', // Уменьшаем размер шрифта
                    }}>
                      {abonent.address}
                    </td>
                    <td style={{
                      padding: '4px 6px', // Уменьшаем отступы
                      border: '1px solid #ddd',
                      textAlign: 'left',
                      fontSize: '11px', // Уменьшаем размер шрифта
                    }}>
                      {abonent.controllerId || 'Не назначен'}
                    </td>
                    <td style={{
                      padding: '4px 6px', // Уменьшаем отступы
                      border: '1px solid #ddd',
                      textAlign: 'right',
                      fontSize: '11px', // Уменьшаем размер шрифта
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      color: (abonent.balance || 0) < 0 ? '#dc3545' : '#28a745',
                    }}>
                      {(abonent.balance || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Итоги */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            fontSize: '12px', // Уменьшаем размер шрифта
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              fontSize: '12px', // Уменьшаем размер шрифта
            }}>
              <div>
                <strong>Всего абонентов:</strong> {abonents.length}
              </div>
              <div>
                <strong>С долгом:</strong> {abonents.filter(a => (a.balance || 0) < 0).length}
              </div>
              <div>
                <strong>Без долга:</strong> {abonents.filter(a => (a.balance || 0) >= 0).length}
              </div>
              <div>
                <strong>Общий долг:</strong> {abonents.reduce((sum, a) => sum + Math.max(0, -(a.balance || 0)), 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} сом
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Итоги */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '25px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#0066cc' }}>
            Всего абонентов:
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {abonents.length}
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#0066cc' }}>
            Дата составления:
          </div>
          <div style={{ fontSize: '16px' }}>
            {formatDate(reportDate)}
          </div>
        </div>
      </div>

      {/* Подписи */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            borderTop: '2px solid #000', 
            paddingTop: '10px',
            marginTop: '30px'
          }}>
            Подпись контролера
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            borderTop: '2px solid #000', 
            paddingTop: '10px',
            marginTop: '30px'
          }}>
            Подпись бухгалтера
          </div>
        </div>
      </div>

      {/* Адаптивные стили для печати */}
      <style>{`
        @media print {
          .tokmok-meter-report {
            box-shadow: none;
            border-radius: 0;
            margin: 0;
            padding: 10mm;
          }
        }
        
        @media (max-width: 768px) {
          .tokmok-meter-report {
            padding: 10px;
            font-size: 12px;
          }
          
          .tokmok-meter-report table {
            font-size: 10px;
          }
          
          .tokmok-meter-report th,
          .tokmok-meter-report td {
            padding: 4px;
          }
        }
        
        @media (max-width: 480px) {
          .tokmok-meter-report {
            font-size: 11px;
          }
          
          .tokmok-meter-report table {
            font-size: 9px;
          }
          
          .tokmok-meter-report th,
          .tokmok-meter-report td {
            padding: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default TokmokStyleMeterReportTemplate; 