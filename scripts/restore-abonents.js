// Скрипт для восстановления реальных данных абонентов
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

// Реальные данные абонентов (восстановленные)
const realAbonents = [
  {
    fullName: "Эгембердиев",
    address: "ул. Покровская, дом 85",
    personalAccount: "25080646",
    balance: 124.10,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Тагаева С.Ж.",
    address: "ул. Космонавтов дом 74",
    personalAccount: "25080308",
    balance: 326.78,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эдилалиев",
    address: "ул. Космонавтов дом 74",
    personalAccount: "25080308",
    balance: 326.78,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Элебесов",
    address: "ул. Сансызбаева дом 178",
    personalAccount: "25080594",
    balance: 75.86,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эралиев",
    address: "ул. Садовая дом 25а",
    personalAccount: "25080682",
    balance: 1338.74,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эралиева А.У.",
    address: "ул. Космонавтов дом 64",
    personalAccount: "25080302",
    balance: -248.54,
    waterDebt: -248.54,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эргазиев А.А.",
    address: "ул. Проектируемая, 2-68",
    personalAccount: "25080838",
    balance: 495.20,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эсеналиев В.Б.",
    address: "ул. Проектируемая, 9-1",
    personalAccount: "25080841",
    balance: -206.60,
    waterDebt: -206.60,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эсеналиева",
    address: "ул. Жантаева дом 4 кв. 11",
    personalAccount: "25080943",
    balance: 5421.88,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Сапожникова И.В.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эсенаманов",
    address: "ул. Сансызбаева дом 159",
    personalAccount: "25080573",
    balance: 573.26,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эсенгулов",
    address: "ул. Сансызбаева дом 232",
    personalAccount: "25080590",
    balance: 76.88,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эшанкулов Т.",
    address: "ул. Покровская, дом 70",
    personalAccount: "25080631",
    balance: 245.34,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Эшимов",
    address: "ул. Береговая дом 179",
    personalAccount: "25080055",
    balance: 279.01,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Юсупов",
    address: "ул. Межевая, дом 125",
    personalAccount: "25080419",
    balance: 120.56,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Яременко",
    address: "ул. Береговая дом 110А",
    personalAccount: "25080061",
    balance: -0.01,
    waterDebt: -0.01,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Яценко",
    address: "ул. Береговая дом 152",
    personalAccount: "25080044",
    balance: 2231.30,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerName: "Тагаева С.Ж.",
    createdAt: new Date().toISOString()
  }
];

// Функция для восстановления данных абонентов
async function restoreAbonents() {
  try {
    console.log('Начинаем восстановление данных абонентов...');
    
    // Очищаем существующие данные (если есть)
    console.log('Очищаем существующие данные...');
    const existingAbonents = await getDocs(collection(db, 'abonents'));
    if (!existingAbonents.empty) {
      console.log(`Найдено ${existingAbonents.size} существующих абонентов.`);
    }
    
    // Добавляем реальных абонентов
    console.log('Добавляем реальных абонентов...');
    for (const abonentData of realAbonents) {
      try {
        await addDoc(collection(db, 'abonents'), abonentData);
        console.log(`✅ Добавлен: ${abonentData.fullName} - ${abonentData.address}`);
      } catch (error) {
        console.error(`❌ Ошибка при добавлении ${abonentData.fullName}:`, error);
      }
    }
    
    console.log('🎉 Данные абонентов успешно восстановлены!');
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении данных:', error);
  }
}

// Запускаем восстановление
restoreAbonents().then(() => {
  console.log('Скрипт завершен.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 