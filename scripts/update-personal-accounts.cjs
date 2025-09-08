const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, query, orderBy } = require('firebase/firestore');

// Конфигурация Firebase для проекта jkh-system-new
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

// Функция для генерации лицевого счета
function generatePersonalAccount(index, createdAt) {
  let year, month;
  
  if (createdAt) {
    const date = new Date(createdAt);
    year = date.getFullYear().toString().slice(-2);
    month = (date.getMonth() + 1).toString().padStart(2, '0');
  } else {
    // Если дата создания не указана, используем текущую
    const now = new Date();
    year = now.getFullYear().toString().slice(-2);
    month = (now.getMonth() + 1).toString().padStart(2, '0');
  }
  
  const number = (index + 1).toString().padStart(4, '0');
  return `${year}${month}${number}`;
}

// Основная функция обновления
async function updatePersonalAccounts() {
  try {
    console.log('🔄 Начинаем обновление лицевых счетов...');
    
    // Получаем всех абонентов, отсортированных по дате создания
    const abonentsRef = collection(db, 'abonents');
    const q = query(abonentsRef, orderBy('createdAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    const abonents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Найдено ${abonents.length} абонентов`);
    
    // Счетчики для статистики
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    
    // Обновляем каждого абонента
    for (let i = 0; i < abonents.length; i++) {
      const abonent = abonents[i];
      
      try {
        // Проверяем, есть ли уже лицевой счет
        if (abonent.personalAccount) {
          console.log(`⏭️  Пропускаем ${abonent.fullName} - уже есть лицевой счет: ${abonent.personalAccount}`);
          skipped++;
          continue;
        }
        
        // Генерируем новый лицевой счет
        const personalAccount = generatePersonalAccount(i, abonent.createdAt);
        
        // Обновляем документ в Firestore
        const abonentRef = doc(db, 'abonents', abonent.id);
        await updateDoc(abonentRef, {
          personalAccount: personalAccount
        });
        
        console.log(`✅ Обновлен ${abonent.fullName}: ${personalAccount}`);
        updated++;
        
        // Небольшая задержка чтобы не перегружать Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Ошибка при обновлении ${abonent.fullName}:`, error);
        errors++;
      }
    }
    
    // Выводим итоговую статистику
    console.log('\n📈 ИТОГОВАЯ СТАТИСТИКА:');
    console.log(`✅ Обновлено: ${updated}`);
    console.log(`⏭️  Пропущено: ${skipped}`);
    console.log(`❌ Ошибок: ${errors}`);
    console.log(`📊 Всего обработано: ${updated + skipped + errors}`);
    
    if (updated > 0) {
      console.log('\n🎉 Лицевые счета успешно обновлены!');
      console.log('Теперь все абоненты имеют уникальные лицевые счета в формате YYMM0001');
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  }
}

// Запускаем скрипт
updatePersonalAccounts()
  .then(() => {
    console.log('🏁 Скрипт завершен');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ошибка выполнения скрипта:', error);
    process.exit(1);
  }); 