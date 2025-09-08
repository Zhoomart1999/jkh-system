import React from 'react';

const DebugReceiptTemplate: React.FC = () => {
  return (
    <div style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      border: '2px solid red'
    }}>
      <h1 style={{ color: 'red', textAlign: 'center' }}>
        ТЕСТОВАЯ КВИТАНЦИЯ - ОТЛАДКА
      </h1>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Если вы видите это, значит печать работает!</h2>
        <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
        <p>Время: {new Date().toLocaleTimeString('ru-RU')}</p>
      </div>

      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '20px', 
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h3>Информация для отладки:</h3>
        <ul>
          <li>✅ Шаблон загружен</li>
          <li>✅ PrintProvider работает</li>
          <li>✅ Стили применяются</li>
          <li>✅ Печать должна работать</li>
        </ul>
      </div>

      <div style={{ 
        border: '1px solid #000', 
        padding: '10px', 
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <p><strong>Проверьте:</strong></p>
        <p>1. Открылся ли диалог печати?</p>
        <p>2. Видно ли содержимое в предпросмотре?</p>
        <p>3. Работает ли сохранение в PDF?</p>
      </div>

      <div style={{ 
        position: 'absolute', 
        bottom: '20mm', 
        left: '20mm', 
        right: '20mm',
        textAlign: 'center',
        borderTop: '1px solid #000',
        paddingTop: '10px'
      }}>
        <p>Это тестовая квитанция для проверки работы печати</p>
        <p>Если все работает, замените на настоящий шаблон</p>
      </div>
    </div>
  );
};

export default DebugReceiptTemplate; 