// Скрипт для проверки данных абонентов в Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, limit } from 'firebase/firestore';

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

// Функция для проверки данных абонентов
async function checkAbonentsData() {
  try {
    console.log('🔍 Проверяем данные абонентов в Firebase...');
    
    // Получаем первые 50 абонентов для проверки
    const abonentsRef = collection(db, 'abonents');
    const querySnapshot = await getDocs(abonentsRef);
    
    console.log(`📊 Всего абонентов в базе: ${querySnapshot.size}`);
    
    if (querySnapshot.size === 0) {
      console.log('❌ В базе нет абонентов');
      return;
    }
    
    // Показываем первые 20 абонентов
    console.log('\n📋 Первые 20 абонентов:');
    console.log('='.repeat(80));
    
    let count = 0;
    querySnapshot.forEach((doc) => {
      if (count >= 20) return;
      
      const data = doc.data();
      console.log(`${count + 1}. ID: ${doc.id}`);
      console.log(`   Имя: ${data.fullName || 'НЕТ ИМЕНИ'}`);
      console.log(`   Адрес: ${data.address || 'НЕТ АДРЕСА'}`);
      console.log(`   Лицевой счет: ${data.personalAccount || 'НЕТ'}`);
      console.log(`   Баланс: ${data.balance || 0} сом`);
      console.log(`   Контролер: ${data.controllerName || 'НЕ НАЗНАЧЕН'}`);
      console.log('   ' + '-'.repeat(40));
      
      count++;
    });
    
    // Проверяем, есть ли абоненты с неправильными именами
    console.log('\n🔍 Поиск абонентов с неправильными именами...');
    let badNamesCount = 0;
    let goodNamesCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.fullName && 
          (data.fullName.includes('Абонент') || 
           data.fullName.includes('абонент') ||
           data.fullName.includes('undefined') ||
           !data.fullName.trim())) {
        badNamesCount++;
        if (badNamesCount <= 10) {
          console.log(`❌ Плохое имя: "${data.fullName}" (ID: ${doc.id})`);
        }
      } else if (data.fullName && data.fullName.trim()) {
        goodNamesCount++;
      }
    });
    
    console.log(`\n📊 Статистика имен:`);
    console.log(`   - Хорошие имена: ${goodNamesCount}`);
    console.log(`   - Плохие имена: ${badNamesCount}`);
    console.log(`   - Всего: ${querySnapshot.size}`);
    
    // Проверяем адреса
    console.log('\n🔍 Поиск абонентов с неправильными адресами...');
    let badAddressesCount = 0;
    let goodAddressesCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.address && 
          (data.address.includes('undefined') || 
           !data.address.trim() ||
           data.address.length < 5)) {
        badAddressesCount++;
        if (badAddressesCount <= 10) {
          console.log(`❌ Плохой адрес: "${data.address}" (ID: ${doc.id})`);
        }
      } else if (data.address && data.address.trim()) {
        goodAddressesCount++;
      }
    });
    
    console.log(`\n📊 Статистика адресов:`);
    console.log(`   - Хорошие адреса: ${goodAddressesCount}`);
    console.log(`   - Плохие адреса: ${badAddressesCount}`);
    console.log(`   - Всего: ${querySnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  }
}

// Запускаем проверку
checkAbonentsData().then(() => {
  console.log('\n✅ Проверка завершена.');
  process.exit(0);
}).catch((error) => {
  console.error('Критическая ошибка:', error);
  process.exit(1);
}); 