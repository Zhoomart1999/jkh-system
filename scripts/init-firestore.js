import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc } from 'firebase/firestore';

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

// Данные пользователей
const users = [
  {
    name: 'Администратор',
    role: 'admin',
    pin: '11111111',
    isActive: true
  },
  {
    name: 'Инженер',
    role: 'engineer',
    pin: '22222222',
    isActive: true
  },
  {
    name: 'Бухгалтер',
    role: 'accountant',
    pin: '33333333',
    isActive: true
  },
  {
    name: 'Контролёр №1',
    role: 'controller',
    pin: '44444444',
    isActive: true,
    controllerNumber: '1'
  }
];

// Данные абонентов
const abonents = [
  {
    fullName: 'Иванов Иван Иванович',
    address: 'г. Токмок, ул. Ленина 15, кв. 5',
    phone: '0700 123 456',
    numberOfPeople: 3,
    buildingType: 'apartment',
    waterTariff: 'by_meter',
    status: 'active',
    balance: -1250.50,
    createdAt: '2024-01-15T10:00:00Z',
    hasGarden: false,
    personalAccount: '24010001',
    controllerId: '4',
    lastMeterReading: 1250,
    currentMeterReading: 1350,
    meterReadingMonth: '2025-01',
    hasWaterService: true,
    hasGarbageService: true
  },
  {
    fullName: 'Петров Петр Петрович',
    address: 'г. Токмок, ул. Советская 42, кв. 12',
    phone: '0555 789 012',
    numberOfPeople: 2,
    buildingType: 'apartment',
    waterTariff: 'by_person',
    status: 'active',
    balance: -890.25,
    createdAt: '2024-02-20T14:30:00Z',
    hasGarden: false,
    personalAccount: '24010002',
    controllerId: '4',
    hasWaterService: true,
    hasGarbageService: true
  },
  {
    fullName: 'Сидорова Анна Владимировна',
    address: 'г. Токмок, ул. Мира 8, кв. 3',
    phone: '0777 345 678',
    numberOfPeople: 4,
    buildingType: 'apartment',
    waterTariff: 'by_meter',
    status: 'active',
    balance: 0.00,
    createdAt: '2024-03-10T09:15:00Z',
    hasGarden: true,
    gardenSize: 0.3,
    personalAccount: '24010003',
    controllerId: '4',
    lastMeterReading: 890,
    currentMeterReading: 920,
    meterReadingMonth: '2025-01',
    hasWaterService: true,
    hasGarbageService: true
  }
];

// Данные тарифов
const tariffs = {
  waterByMeter: 7.80, // 7.8 тыйын (базовый)
  waterByPerson: 40.51, // 40.51 т. (базовый)
  garbagePrivate: 19.60, // 19.60 т. (базовый)
  garbageApartment: 29.41, // 29.41 т. (базовый)
  waterForGarden: {
    '0.2': 297,   // 0.2 сотки = 297 сом
    '0.3': 445.5, // 0.3 сотки = 445.5 сом
    '0.5': 442.5, // 0.5 сотки = 442.5 сом
    '1.0': 1485   // 1.0 сотка = 1485 сом
  },
  salesTaxPercent: 2.00,
  penaltyRatePercent: 0.00, // Пеня - жок (нет)
  createdAt: new Date().toISOString()
};

// Функция инициализации
async function initializeFirestore() {
  try {
    console.log('🚀 Начинаем инициализацию Firestore...');

    // Добавляем пользователей
    console.log('👥 Добавляем пользователей...');
    for (const user of users) {
      await addDoc(collection(db, 'users'), user);
      console.log(`✅ Пользователь ${user.name} добавлен`);
    }

    // Добавляем абонентов
    console.log('🏠 Добавляем абонентов...');
    for (const abonent of abonents) {
      await addDoc(collection(db, 'abonents'), abonent);
      console.log(`✅ Абонент ${abonent.fullName} добавлен`);
    }

    // Добавляем тарифы
    console.log('💰 Добавляем тарифы...');
    await addDoc(collection(db, 'tariffs'), tariffs);
    console.log('✅ Тарифы добавлены');

    console.log('🎉 Инициализация Firestore завершена успешно!');
  } catch (error) {
    console.error('❌ Ошибка при инициализации:', error);
  }
}

// Запускаем инициализацию
initializeFirestore(); 