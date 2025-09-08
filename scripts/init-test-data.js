// Скрипт для инициализации тестовых данных абонентов
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyBBdniQX1DAdz8SJwO5SPgz8BHsXFsQeXA",
  authDomain: "jkh-system-new.firebaseapp.com",
  projectId: "jkh-system-new",
  storageBucket: "jkh-system-new.firebasestorage.app",
  messagingSenderId: "844684475475393",
  appId: "1:844684475393:web:1afb72cbde9b286b545400",
  measurementId: "G-HNZMR544W1"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Тестовые данные абонентов
const testAbonents = [
  {
    fullName: "Абдуллаев Абдулла Абдуллаевич",
    address: "ул. Ленина, 15, кв. 1",
    personalAccount: "25080001",
    balance: -1250.50,
    waterDebt: -800.30,
    garbageDebt: -450.20,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 1250,
    prevMeterReading: 1200,
    controllerId: "controller1",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Байбеков Байбек Байбекович",
    address: "ул. Советская, 25, кв. 5",
    personalAccount: "25080002",
    balance: 450.75,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_person",
    waterService: true,
    garbageService: true,
    hasGarden: true,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerId: "controller1",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Валиев Вали Валиевич",
    address: "ул. Мира, 10, кв. 12",
    personalAccount: "25080003",
    balance: -3200.00,
    waterDebt: -2000.00,
    garbageDebt: -1200.00,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 2100,
    prevMeterReading: 1950,
    controllerId: "controller2",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Газиев Гази Газиевич",
    address: "ул. Пушкина, 8, кв. 3",
    personalAccount: "25080004",
    balance: 125.50,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: true,
    currentMeterReading: 850,
    prevMeterReading: 820,
    controllerId: "controller2",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Давлетов Давлет Давлетович",
    address: "ул. Гагарина, 30, кв. 7",
    personalAccount: "25080005",
    balance: -890.25,
    waterDebt: -600.00,
    garbageDebt: -290.25,
    status: "active",
    waterTariff: "by_person",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerId: "controller1",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Ермеков Ермек Ермекович",
    address: "ул. Фрунзе, 12, кв. 15",
    personalAccount: "25080006",
    balance: 0,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: true,
    currentMeterReading: 1100,
    prevMeterReading: 1100,
    controllerId: "controller2",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Жумаев Жума Жумаевич",
    address: "ул. Калинина, 45, кв. 22",
    personalAccount: "25080007",
    balance: -1750.80,
    waterDebt: -1200.50,
    garbageDebt: -550.30,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 1850,
    prevMeterReading: 1780,
    controllerId: "controller1",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Зайцев Зайц Зайцевич",
    address: "ул. Маяковского, 18, кв. 9",
    personalAccount: "25080008",
    balance: 300.00,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_person",
    waterService: true,
    garbageService: true,
    hasGarden: true,
    currentMeterReading: 0,
    prevMeterReading: 0,
    controllerId: "controller2",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Ибраев Ибра Ибраевич",
    address: "ул. Чехова, 33, кв. 11",
    personalAccount: "25080009",
    balance: -2100.45,
    waterDebt: -1500.00,
    garbageDebt: -600.45,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: false,
    currentMeterReading: 2200,
    prevMeterReading: 2050,
    controllerId: "controller1",
    createdAt: new Date().toISOString()
  },
  {
    fullName: "Калматов Калмат Калматович",
    address: "ул. Толстого, 7, кв. 4",
    personalAccount: "25080010",
    balance: 75.25,
    waterDebt: 0,
    garbageDebt: 0,
    status: "active",
    waterTariff: "by_meter",
    waterService: true,
    garbageService: true,
    hasGarden: true,
    currentMeterReading: 950,
    prevMeterReading: 920,
    controllerId: "controller2",
    createdAt: new Date().toISOString()
  }
];

// Функция для инициализации тестовых данных
async function initTestData() {
  try {
    console.log('Начинаем инициализацию тестовых данных...');
    
    // Проверяем, есть ли уже данные
    const existingAbonents = await getDocs(collection(db, 'abonents'));
    if (!existingAbonents.empty) {
      console.log(`В базе уже есть ${existingAbonents.size} абонентов. Пропускаем инициализацию.`);
      return;
    }
    
    // Добавляем тестовых абонентов
    console.log('Добавляем тестовых абонентов...');
    for (const abonentData of testAbonents) {
      try {
        await addDoc(collection(db, 'abonents'), abonentData);
        console.log(`Добавлен абонент: ${abonentData.fullName}`);
      } catch (error) {
        console.error(`Ошибка при добавлении абонента ${abonentData.fullName}:`, error);
      }
    }
    
    console.log('Тестовые данные успешно добавлены!');
    
  } catch (error) {
    console.error('Ошибка при инициализации тестовых данных:', error);
  }
}

// Запускаем инициализацию
initTestData().then(() => {
  console.log('Скрипт завершен.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 