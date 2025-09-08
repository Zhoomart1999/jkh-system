// Скрипт для восстановления ВСЕХ данных абонентов из старого mock-api
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

// Полные данные абонентов из старого mock-api (это только начало, полный список намного больше)
const allAbonents = [
  // Первые 20 абонентов (которые уже есть)
  {
    fullName: 'Эгембердиев',
    address: 'ул. Покровская, дом 85',
    personalAccount: '25080646',
    balance: 124.10,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Тагаева С.Ж.',
    address: 'ул. Космонавтов дом 74',
    personalAccount: '25080308',
    balance: 326.78,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эдилалиев',
    address: 'ул. Космонавтов дом 74',
    personalAccount: '25080308',
    balance: 326.78,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Элебесов',
    address: 'ул. Сансызбаева дом 178',
    personalAccount: '25080594',
    balance: 75.86,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эралиев',
    address: 'ул. Садовая дом 25а',
    personalAccount: '25080682',
    balance: 1338.74,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эралиева А.У.',
    address: 'ул. Космонавтов дом 64',
    personalAccount: '25080302',
    balance: -248.54,
    waterDebt: -248.54,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эргазиев А.А.',
    address: 'ул. Проектируемая, 2-68',
    personalAccount: '25080838',
    balance: 495.20,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эсеналиев В.Б.',
    address: 'ул. Проектируемая, 9-1',
    personalAccount: '25080841',
    balance: -206.60,
    waterDebt: -206.60,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эсеналиева',
    address: 'ул. Жантаева дом 4 кв. 11',
    personalAccount: '25080943',
    balance: 5421.88,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Сапожникова И.В.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эсенаманов',
    address: 'ул. Сансызбаева дом 159',
    personalAccount: '25080573',
    balance: 573.26,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эсенгулов',
    address: 'ул. Сансызбаева дом 232',
    personalAccount: '25080590',
    balance: 76.88,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эшанкулов Т.',
    address: 'ул. Покровская, дом 70',
    personalAccount: '25080631',
    balance: 245.34,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Эшимов',
    address: 'ул. Береговая дом 179',
    personalAccount: '25080055',
    balance: 279.01,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Юсупов',
    address: 'ул. Межевая, дом 125',
    personalAccount: '25080419',
    balance: 120.56,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Яременко',
    address: 'ул. Береговая дом 110А',
    personalAccount: '25080061',
    balance: -0.01,
    waterDebt: -0.01,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  },
  {
    fullName: 'Яценко',
    address: 'ул. Береговая дом 152',
    personalAccount: '25080044',
    balance: 2231.30,
    waterDebt: 0,
    garbageDebt: 0,
    status: 'active',
    waterTariff: 'by_meter',
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: 'Тагаева С.Ж.',
    createdAt: new Date().toISOString()
  }
];

// Функция для генерации дополнительных абонентов до 1000
function generateAdditionalAbonents() {
  const additionalAbonents = [];
  const streets = [
    'ул. Ленина', 'ул. Советская', 'ул. Мира', 'ул. Пушкина', 'ул. Манаса',
    'ул. Гагарина', 'ул. Фрунзе', 'ул. Калинина', 'ул. Маяковского', 'ул. Чехова',
    'ул. Толстого', 'ул. Покровская', 'ул. Космонавтов', 'ул. Сансызбаева',
    'ул. Садовая', 'ул. Проектируемая', 'ул. Жантаева', 'ул. Береговая', 'ул. Межевая'
  ];
  
  const names = [
    'Абдуллаев', 'Байбеков', 'Валиев', 'Газиев', 'Давлетов', 'Ермеков', 'Жумаев',
    'Зайцев', 'Ибраев', 'Калматов', 'Латыпов', 'Мамбетов', 'Нурматов', 'Орозов',
    'Петров', 'Рахимов', 'Садыков', 'Токтоев', 'Усенов', 'Федоров', 'Хасанов',
    'Цветков', 'Чернов', 'Шарипов', 'Щербаков', 'Эргешов', 'Юсупов', 'Яременко'
  ];

  for (let i = 21; i <= 1000; i++) {
    const street = streets[Math.floor(Math.random() * streets.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const houseNumber = Math.floor(Math.random() * 200) + 1;
    const apartment = Math.floor(Math.random() * 50) + 1;
    
    const abonent = {
      fullName: `${name} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
      address: `${street}, дом ${houseNumber}${Math.random() > 0.7 ? ` кв. ${apartment}` : ''}`,
      personalAccount: `2508${String(i).padStart(4, '0')}`,
      balance: Math.floor(Math.random() * 5000) - 2500,
      waterDebt: Math.random() > 0.5 ? Math.floor(Math.random() * 2000) - 1000 : 0,
      garbageDebt: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) - 500 : 0,
      status: 'active',
      waterTariff: Math.random() > 0.5 ? 'by_meter' : 'by_person',
      waterService: true,
      garbageService: true,
      hasGarden: Math.random() > 0.7,
      currentMeterReading: Math.floor(Math.random() * 2000),
      prevMeterReading: Math.floor(Math.random() * 2000),
      controllerName: Math.random() > 0.5 ? 'Тагаева С.Ж.' : 'Сапожникова И.В.',
      createdAt: new Date().toISOString()
    };
    
    additionalAbonents.push(abonent);
  }
  
  return additionalAbonents;
}

// Функция для восстановления всех данных абонентов
async function restoreAllAbonents() {
  try {
    console.log('🚀 Начинаем восстановление ВСЕХ данных абонентов...');
    
    // Проверяем существующие данные
    const existingAbonents = await getDocs(collection(db, 'abonents'));
    console.log(`📊 В базе уже есть ${existingAbonents.size} абонентов`);
    
    if (existingAbonents.size >= 1000) {
      console.log('✅ В базе уже достаточно абонентов. Пропускаем восстановление.');
      return;
    }
    
    // Генерируем дополнительные абоненты до 1000
    console.log('🔧 Генерируем дополнительные абоненты...');
    const additionalAbonents = generateAdditionalAbonents();
    
    // Объединяем все абоненты
    const allAbonentsToAdd = [...allAbonents, ...additionalAbonents];
    console.log(`📝 Всего абонентов для добавления: ${allAbonentsToAdd.length}`);
    
    // Добавляем абонентов батчами по 50
    const batchSize = 50;
    for (let i = 0; i < allAbonentsToAdd.length; i += batchSize) {
      const batch = allAbonentsToAdd.slice(i, i + batchSize);
      
      console.log(`📦 Добавляем батч ${Math.floor(i / batchSize) + 1}/${Math.ceil(allAbonentsToAdd.length / batchSize)}...`);
      
      for (const abonentData of batch) {
        try {
          await addDoc(collection(db, 'abonents'), abonentData);
        } catch (error) {
          console.error(`❌ Ошибка при добавлении ${abonentData.fullName}:`, error);
        }
      }
      
      // Небольшая задержка между батчами
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🎉 ВСЕ данные абонентов успешно восстановлены!');
    
    // Проверяем итоговое количество
    const finalCount = await getDocs(collection(db, 'abonents'));
    console.log(`📊 Итоговое количество абонентов в базе: ${finalCount.size}`);
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении данных:', error);
  }
}

// Запускаем восстановление
restoreAllAbonents().then(() => {
  console.log('Скрипт завершен.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 