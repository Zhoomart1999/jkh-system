// Скрипт для обновления существующих абонентов с правильными именами и адресами
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBBdniQX1DAdz8SJwO5SPgz8BHsXFsQeXA",
  authDomain: "jkh-system-new.firebaseapp.com",
  projectId: "jkh-system-new",
  storageBucket: "jkh-system-new.firebasestorage.app",
  messagingSenderId: "844684475393",
  appId: "1:844684475393:web:1afb72cbde9b286b545400",
  measurementId: "G-HNZMR544W1"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Функция для генерации правильных имен и адресов
function generateProperData(index) {
  const streets = [
    'ул. Ленина', 'ул. Советская', 'ул. Мира', 'ул. Пушкина', 'ул. Манаса',
    'ул. Гагарина', 'ул. Фрунзе', 'ул. Калинина', 'ул. Маяковского', 'ул. Чехова',
    'ул. Толстого', 'ул. Покровская', 'ул. Космонавтов', 'ул. Сансызбаева',
    'ул. Садовая', 'ул. Проектируемая', 'ул. Жантаева', 'ул. Береговая', 'ул. Межевая',
    'ул. Центральная', 'ул. Школьная', 'ул. Больничная', 'ул. Заводская', 'ул. Парковая'
  ];
  
  const names = [
    'Абдуллаев', 'Байбеков', 'Валиев', 'Газиев', 'Давлетов', 'Ермеков', 'Жумаев',
    'Зайцев', 'Ибраев', 'Калматов', 'Латыпов', 'Мамбетов', 'Нурматов', 'Орозов',
    'Петров', 'Рахимов', 'Садыков', 'Токтоев', 'Усенов', 'Федоров', 'Хасанов',
    'Цветков', 'Чернов', 'Шарипов', 'Щербаков', 'Эргешов', 'Юсупов', 'Яременко',
    'Ахмедов', 'Бекиров', 'Волков', 'Григорьев', 'Дмитриев', 'Ершов', 'Жуков',
    'Зуев', 'Иванов', 'Козлов', 'Лебедев', 'Морозов', 'Новиков', 'Осипов'
  ];

  const street = streets[index % streets.length];
  const name = names[index % names.length];
  const houseNumber = (index % 200) + 1;
  const apartment = (index % 50) + 1;
  
  return {
    fullName: `${name} ${String.fromCharCode(65 + (index % 26))}.${String.fromCharCode(65 + ((index + 1) % 26))}.`,
    address: `${street}, дом ${houseNumber}${index % 3 === 0 ? ` кв. ${apartment}` : ''}`,
    controllerName: index % 2 === 0 ? 'Тагаева С.Ж.' : 'Сапожникова И.В.'
  };
}

// Функция для обновления абонентов
async function updateAbonentsNames() {
  try {
    console.log('🔄 Начинаем обновление имен и адресов абонентов...');
    
    // Получаем всех существующих абонентов
    const existingAbonents = await getDocs(collection(db, 'abonents'));
    console.log(`📊 Найдено ${existingAbonents.size} абонентов в базе`);
    
    if (existingAbonents.size === 0) {
      console.log('❌ В базе нет абонентов для обновления');
      return;
    }
    
    // Обновляем абонентов по одному
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < existingAbonents.docs.length; i++) {
      const abonentDoc = existingAbonents.docs[i];
      const abonentData = abonentDoc.data();
      
      // Проверяем, нужно ли обновлять (если имя уже правильное, пропускаем)
      if (abonentData.fullName && 
          !abonentData.fullName.includes('Абонент') && 
          !abonentData.fullName.includes('абонент') &&
          abonentData.address &&
          !abonentData.address.includes('undefined')) {
        skippedCount++;
        continue;
      }
      
      try {
        // Генерируем правильные данные
        const properData = generateProperData(i);
        
        // Обновляем документ
        await updateDoc(doc(db, 'abonents', abonentDoc.id), {
          fullName: properData.fullName,
          address: properData.address,
          controllerName: properData.controllerName
        });
        
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`✅ Обновлено ${updatedCount} абонентов...`);
        }
        
      } catch (error) {
        console.error(`❌ Ошибка при обновлении абонента ${abonentDoc.id}:`, error);
      }
      
      // Небольшая задержка между обновлениями
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log('🎉 Обновление завершено!');
    console.log(`📊 Статистика:`);
    console.log(`   - Обновлено: ${updatedCount} абонентов`);
    console.log(`   - Пропущено: ${skippedCount} абонентов`);
    console.log(`   - Всего: ${existingAbonents.size} абонентов`);
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении абонентов:', error);
  }
}

// Запускаем обновление
updateAbonentsNames().then(() => {
  console.log('Скрипт завершен.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 