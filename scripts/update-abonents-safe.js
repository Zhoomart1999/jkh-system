// БЕЗОПАСНЫЙ скрипт для обновления абонентов (без удаления)
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

// ТОЧНЫЕ данные абонентов из списка пользователя (первые 50)
const exactAbonents = [
  { fullName: 'Абакиров', address: 'ул. Покровская, дом 55а', balance: 1854.04, personalAccount: '25080001' },
  { fullName: 'Абасов', address: 'ул. Сансызбаева дом 28', balance: 496.7, personalAccount: '25080002' },
  { fullName: 'Абасова', address: 'ул Жантаева дом 7 кв 1', balance: -1.24, personalAccount: '25080003' },
  { fullName: 'Абдиев Б.', address: 'ул. Проектируемая, 1-109', balance: 1985.88, personalAccount: '25080004' },
  { fullName: 'Абдилазизов К.Т.', address: 'ул. Мельничная дом 57', balance: 124.66, personalAccount: '25080005' },
  { fullName: 'Абдилазизов Т.', address: 'ул. Бригадная дом 33', balance: 2089.7, personalAccount: '25080006' },
  { fullName: 'Абдишев', address: 'ул. Межевая, дом 53', balance: 742.08, personalAccount: '25080007' },
  { fullName: 'Абдраева', address: 'ул. Сансызбаева дом 200', balance: 2214.42, personalAccount: '25080008' },
  { fullName: 'Абдраева Н.Т.', address: 'ул. Проектируемая, 3-20', balance: 1029.56, personalAccount: '25080009' },
  { fullName: 'Абдразакова М.', address: 'ул. Межевая, дом 175а', balance: 3815.8, personalAccount: '25080010' },
  { fullName: 'Абдраимов', address: 'ул. Садовая дом 16', balance: 823.1, personalAccount: '25080011' },
  { fullName: 'Абдраимова', address: 'ул. Покровская, дом 15', balance: 10438.5, personalAccount: '25080012' },
  { fullName: 'Абдраимова', address: 'ул. Космонавтов дом 45', balance: -500.16, personalAccount: '25080013' },
  { fullName: 'Абдраимова', address: 'ул. Покровская, дом 11', balance: 121.98, personalAccount: '25080014' },
  { fullName: 'Абдраимова', address: 'ул. Сансызбаева дом 16', balance: 5544.32, personalAccount: '25080015' },
  { fullName: 'Абдраимова К.О.', address: 'ул. Проектируемая, 2-29', balance: -249.68, personalAccount: '25080016' },
  { fullName: 'Абдрасул уулу К.', address: 'ул. Октябрьская дом 22', balance: 620, personalAccount: '25080017' },
  { fullName: 'Абдрахманов', address: 'ул. Покровская, дом 98', balance: 247.76, personalAccount: '25080018' },
  { fullName: 'Абдрахманов Т.Б.', address: 'ул. Проектируемая, 2-45', balance: 2830.4, personalAccount: '25080019' },
  { fullName: 'Абдрахманова Ч.А.', address: 'ул. Проектируемая, 1-83а', balance: 246, personalAccount: '25080020' },
  { fullName: 'Абдулаева', address: 'ул. Покровская, дом 67б', balance: 744.38, personalAccount: '25080021' },
  { fullName: 'Абдулаева', address: 'ул. Сансызбаева дом 20', balance: 157.68, personalAccount: '25080022' },
  { fullName: 'Абдулазизов К.Т.', address: 'ул. Клубная дом 23', balance: 276.76, personalAccount: '25080023' },
  { fullName: 'Абдулин', address: 'ул. Сансызбаева дом 30', balance: 4106.56, personalAccount: '25080024' },
  { fullName: 'Абдурахманов', address: 'Ключевая дом 5', balance: 493.68, personalAccount: '25080025' },
  { fullName: 'Абдурашитов А.А.', address: 'ул. Октябрьская дом 52', balance: 145.54, personalAccount: '25080026' },
  { fullName: 'Абдухаликова', address: 'ул. Мельничная дом 70', balance: 23.6, personalAccount: '25080027' },
  { fullName: 'Абдыгулова', address: 'ул. Покровская, дом 46', balance: -414.58, personalAccount: '25080028' },
  { fullName: 'Абдыжамылов', address: 'ул. Октябрьская дом 34-2', balance: 2339.6, personalAccount: '25080029' },
  { fullName: 'Абдыжапаров', address: 'ул. Покровская, дом 66', balance: 157.86, personalAccount: '25080030' },
  { fullName: 'Абдыжапарова С.И.', address: 'ул. Проектируемая, 1-79', balance: -260.68, personalAccount: '25080031' },
  { fullName: 'Абдыканов', address: 'ул Жантаева дом 7 кв 5', balance: 2975.04, personalAccount: '25080032' },
  { fullName: 'Абдыкеримов', address: 'ул. Межевая, дом 129', balance: 474.52, personalAccount: '25080033' },
  { fullName: 'Абдыкеримов', address: 'ул. Береговая дом 135', balance: 122.87, personalAccount: '25080034' },
  { fullName: 'Абдыкулов', address: 'ул. Межевая, дом 96а', balance: 124.72, personalAccount: '25080035' },
  { fullName: 'Абдыкулов', address: 'ул. Межевая, дом 131', balance: 337.3, personalAccount: '25080036' },
  { fullName: 'Абдылданов', address: 'ул. Клубная дом 17', balance: 0, personalAccount: '25080037' },
  { fullName: 'Абдылдаев', address: 'ул. Покровская, дом 160', balance: 319.62, personalAccount: '25080038' },
  { fullName: 'Абдылдаев Э.Ш.', address: 'ул. Проектируемая, 37-60', balance: 243.2, personalAccount: '25080039' },
  { fullName: 'Абдылдаева', address: 'ул. Покровская, дом 112', balance: 124, personalAccount: '25080040' },
  { fullName: 'Абдылдаева', address: 'ул. Пионерская дом 17', balance: 2971.14, personalAccount: '25080041' },
  { fullName: 'Абдылдаева Н.Э.', address: 'ул. Проектируемая, 3-182-9', balance: 13, personalAccount: '25080042' },
  { fullName: 'Абдылханов М.', address: 'ул. Ключевая, дом 57', balance: 371.78, personalAccount: '25080043' },
  { fullName: 'Абдымомунов', address: 'ул. Октябрьская дом 142', balance: 82.72, personalAccount: '25080044' },
  { fullName: 'Абдыраева', address: 'ул. Межевая, дом 97', balance: -414.27, personalAccount: '25080045' },
  { fullName: 'Абдыраимова', address: 'ул. Западная дом 17', balance: 124.6, personalAccount: '25080046' },
  { fullName: 'Абдырасулова', address: 'ул. Садовая дом 11', balance: 328.6, personalAccount: '25080047' },
  { fullName: 'Абдыщукуров', address: 'ул. Береговая дом 83', balance: 38.1, personalAccount: '25080048' },
  { fullName: 'Абыкеев', address: 'ул Жантаева дом 6 кв 3', balance: 0, personalAccount: '25080049' },
  { fullName: 'Абыкеев А.', address: 'ул. Октябрьская дом 50', balance: 121.5, personalAccount: '25080050' }
];

// Функция для безопасного обновления абонентов
async function updateAbonentsSafe() {
  try {
    console.log('🔄 Начинаем БЕЗОПАСНОЕ обновление абонентов...');
    
    // Получаем существующих абонентов
    const existingAbonents = await getDocs(collection(db, 'abonents'));
    console.log(`📊 Найдено ${existingAbonents.size} существующих абонентов`);
    
    if (existingAbonents.size === 0) {
      console.log('❌ В базе нет абонентов для обновления');
      return;
    }
    
    // Обновляем первые 50 абонентов точными данными
    console.log('📝 Обновляем первые 50 абонентов точными данными...');
    
    let updatedCount = 0;
    
    for (let i = 0; i < Math.min(exactAbonents.length, existingAbonents.docs.length); i++) {
      const abonentDoc = existingAbonents.docs[i];
      const exactData = exactAbonents[i];
      
      try {
        // Обновляем документ точными данными
        await updateDoc(doc(db, 'abonents', abonentDoc.id), {
          fullName: exactData.fullName,
          address: exactData.address,
          balance: exactData.balance,
          personalAccount: exactData.personalAccount,
          waterDebt: exactData.balance < 0 ? Math.abs(exactData.balance) : 0,
          garbageDebt: 0,
          controllerName: 'Тагаева С.Ж.'
        });
        
        updatedCount++;
        
        if (updatedCount % 10 === 0) {
          console.log(`✅ Обновлено ${updatedCount} абонентов...`);
        }
        
      } catch (error) {
        console.error(`❌ Ошибка при обновлении ${exactData.fullName}:`, error);
      }
      
      // Небольшая задержка между обновлениями
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log('🎉 Безопасное обновление завершено!');
    console.log(`📊 Обновлено: ${updatedCount} абонентов`);
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении:', error);
  }
}

// Запускаем безопасное обновление
updateAbonentsSafe().then(() => {
  console.log('Скрипт завершен.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 