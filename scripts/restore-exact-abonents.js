// Скрипт для восстановления ТОЧНЫХ данных абонентов из списка пользователя
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';

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

// ТОЧНЫЕ данные абонентов из списка пользователя
const exactAbonents = [
  {
    fullName: 'Абакиров',
    address: 'ул. Покровская, дом 55а',
    balance: 1854.04,
    status: 'active',
    personalAccount: '25080001'
  },
  {
    fullName: 'Абасов',
    address: 'ул. Сансызбаева дом 28',
    balance: 496.7,
    status: 'active',
    personalAccount: '25080002'
  },
  {
    fullName: 'Абасова',
    address: 'ул Жантаева дом 7 кв 1',
    balance: -1.24,
    status: 'active',
    personalAccount: '25080003'
  },
  {
    fullName: 'Абдиев Б.',
    address: 'ул. Проектируемая, 1-109',
    balance: 1985.88,
    status: 'active',
    personalAccount: '25080004'
  },
  {
    fullName: 'Абдилазизов К.Т.',
    address: 'ул. Мельничная дом 57',
    balance: 124.66,
    status: 'active',
    personalAccount: '25080005'
  },
  {
    fullName: 'Абдилазизов Т.',
    address: 'ул. Бригадная дом 33',
    balance: 2089.7,
    status: 'active',
    personalAccount: '25080006'
  },
  {
    fullName: 'Абдишев',
    address: 'ул. Межевая, дом 53',
    balance: 742.08,
    status: 'active',
    personalAccount: '25080007'
  },
  {
    fullName: 'Абдраева',
    address: 'ул. Сансызбаева дом 200',
    balance: 2214.42,
    status: 'active',
    personalAccount: '25080008'
  },
  {
    fullName: 'Абдраева Н.Т.',
    address: 'ул. Проектируемая, 3-20',
    balance: 1029.56,
    status: 'active',
    personalAccount: '25080009'
  },
  {
    fullName: 'Абдразакова М.',
    address: 'ул. Межевая, дом 175а',
    balance: 3815.8,
    status: 'active',
    personalAccount: '25080010'
  },
  {
    fullName: 'Абдраимов',
    address: 'ул. Садовая дом 16',
    balance: 823.1,
    status: 'active',
    personalAccount: '25080011'
  },
  {
    fullName: 'Абдраимова',
    address: 'ул. Покровская, дом 15',
    balance: 10438.5,
    status: 'active',
    personalAccount: '25080012'
  },
  {
    fullName: 'Абдраимова',
    address: 'ул. Космонавтов дом 45',
    balance: -500.16,
    status: 'active',
    personalAccount: '25080013'
  },
  {
    fullName: 'Абдраимова',
    address: 'ул. Покровская, дом 11',
    balance: 121.98,
    status: 'active',
    personalAccount: '25080014'
  },
  {
    fullName: 'Абдраимова',
    address: 'ул. Сансызбаева дом 16',
    balance: 5544.32,
    status: 'active',
    personalAccount: '25080015'
  },
  {
    fullName: 'Абдраимова К.О.',
    address: 'ул. Проектируемая, 2-29',
    balance: -249.68,
    status: 'active',
    personalAccount: '25080016'
  },
  {
    fullName: 'Абдрасул уулу К.',
    address: 'ул. Октябрьская дом 22',
    balance: 620,
    status: 'active',
    personalAccount: '25080017'
  },
  {
    fullName: 'Абдрахманов',
    address: 'ул. Покровская, дом 98',
    balance: 247.76,
    status: 'active',
    personalAccount: '25080018'
  },
  {
    fullName: 'Абдрахманов Т.Б.',
    address: 'ул. Проектируемая, 2-45',
    balance: 2830.4,
    status: 'active',
    personalAccount: '25080019'
  },
  {
    fullName: 'Абдрахманова Ч.А.',
    address: 'ул. Проектируемая, 1-83а',
    balance: 246,
    status: 'active',
    personalAccount: '25080020'
  }
];

// Функция для полного восстановления данных
async function restoreExactAbonents() {
  try {
    console.log('🚀 Начинаем восстановление ТОЧНЫХ данных абонентов...');
    
    // Сначала очищаем существующие данные
    console.log('🧹 Очищаем существующие данные...');
    const existingAbonents = await getDocs(collection(db, 'abonents'));
    
    for (const doc of existingAbonents.docs) {
      await deleteDoc(doc.ref);
    }
    
    console.log(`🗑️ Удалено ${existingAbonents.size} существующих абонентов`);
    
    // Теперь добавляем ТОЧНЫЕ данные
    console.log('📝 Добавляем точные данные абонентов...');
    
    for (let i = 0; i < exactAbonents.length; i++) {
      const abonentData = exactAbonents[i];
      
      // Добавляем недостающие поля
      const fullAbonentData = {
        ...abonentData,
        waterDebt: abonentData.balance < 0 ? Math.abs(abonentData.balance) : 0,
        garbageDebt: 0,
        waterTariff: 'by_meter',
        waterService: true,
        garbageService: true,
        hasGarden: false,
        currentMeterReading: 0,
        prevMeterReading: 0,
        controllerName: 'Тагаева С.Ж.',
        createdAt: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'abonents'), fullAbonentData);
      
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Добавлено ${i + 1} абонентов...`);
      }
    }
    
    console.log('🎉 ВСЕ точные данные абонентов восстановлены!');
    
    // Проверяем итоговое количество
    const finalCount = await getDocs(collection(db, 'abonents'));
    console.log(`📊 Итоговое количество абонентов: ${finalCount.size}`);
    
  } catch (error) {
    console.error('❌ Ошибка при восстановлении:', error);
  }
}

// Запускаем восстановление
restoreExactAbonents().then(() => {
  console.log('Скрипт завершен.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 