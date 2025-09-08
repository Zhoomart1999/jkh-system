import React from 'react';

const SimpleReceiptTemplate: React.FC = () => {
  return (
    <div style={{
      width: '210mm',
      minHeight: '297mm',
      padding: '20mm',
      backgroundColor: 'white',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      border: '2px solid #0066cc'
    }}>
      <h1 style={{ color: '#0066cc', textAlign: 'center', marginBottom: '20px' }}>
        ТЕСТОВАЯ КВИТАНЦИЯ
      </h1>
      
      <div style={{ margin: '20px 0' }}>
        <h2>Если вы видите это, печать работает!</h2>
        <p><strong>Дата:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
        <p><strong>Время:</strong> {new Date().toLocaleTimeString('ru-RU')}</p>
      </div>

      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <h3>Информация:</h3>
        <ul>
          <li>✅ Шаблон загружен</li>
          <li>✅ Стили применяются</li>
          <li>✅ Размеры правильные</li>
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

export default SimpleReceiptTemplate; 