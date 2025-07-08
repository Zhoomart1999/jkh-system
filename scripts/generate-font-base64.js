/**
 * Этот Node.js скрипт автоматически скачивает файл шрифта Roboto-Regular.ttf,
 * преобразует его в строку base64 и сохраняет как экспортируемую константу
 * в TypeScript файле. Это необходимо для встраивания кириллических шрифтов
 * в PDF-документы, генерируемые с помощью jsPDF.
 *
 * Для запуска скрипта выполните в терминале из корневой папки проекта:
 * node scripts/generate-font-base64.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Стабильная ссылка на шрифт Roboto-Regular.ttf из официального репозитория Google Fonts.
const FONT_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf';

// Путь для временного сохранения скачанного файла.
const TEMP_FONT_PATH = path.resolve(__dirname, 'Roboto-Regular.ttf.tmp');

// Целевая директория и файл для TypeScript-константы.
// Предполагается, что скрипт запускается из корня проекта.
// Если у вас другая структура, измените этот путь.
const OUTPUT_DIR = path.resolve(process.cwd(), 'src', 'assets');
const OUTPUT_TS_PATH = path.join(OUTPUT_DIR, 'Roboto-Regular-base64.ts');


/**
 * Шаг 1: Скачивание файла шрифта.
 * @param {string} url - URL для скачивания.
 * @param {string} dest - Путь для сохранения файла.
 * @returns {Promise<void>}
 */
function downloadFont(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Скачивание шрифта с ${url}...`);
    const fileStream = fs.createWriteStream(dest);
    
    const request = https.get(url, (response) => {
      // Обработка редиректов
      if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFont(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        return reject(new Error(`Ошибка скачивания: статус ${response.statusCode}`));
      }
      response.pipe(fileStream);
    });

    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Шрифт успешно скачан в ${dest}`);
      resolve();
    });

    request.on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });

    fileStream.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
    });
  });
}

/**
 * Шаг 2: Конвертация файла в строку base64.
 * @param {string} filePath - Путь к файлу.
 * @returns {string} - Строка в формате base64.
 */
function convertFontToBase64(filePath) {
  console.log('Конвертация шрифта в base64...');
  const fontBuffer = fs.readFileSync(filePath);
  const base64String = fontBuffer.toString('base64');
  console.log('Конвертация завершена.');
  return base64String;
}

/**
 * Шаг 3: Запись строки base64 в TypeScript файл.
 * @param {string} base64String - Строка для записи.
 */
function writeBase64ToTsFile(base64String) {
  // Убедимся, что директория существует.
  if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Создание директории: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Формируем содержимое TypeScript файла.
  const tsFileContent = `// Внимание! Этот файл сгенерирован автоматически. Не редактируйте его вручную.\n// Содержит шрифт Roboto-Regular в формате base64 для поддержки кириллицы в jsPDF.\n\nexport const robotoRegularBase64 = '${base64String}';\n`;

  // Записываем файл.
  fs.writeFileSync(OUTPUT_TS_PATH, tsFileContent, 'utf8');
  console.log(`Файл со шрифтом успешно создан: ${OUTPUT_TS_PATH}`);
}

/**
 * Шаг 4: Очистка временных файлов.
 */
function cleanup() {
  if (fs.existsSync(TEMP_FONT_PATH)) {
    fs.unlinkSync(TEMP_FONT_PATH);
    console.log('Временный файл удален.');
  }
}

/**
 * Основная функция выполнения скрипта.
 */
async function run() {
  try {
    console.log('--- Начало процесса генерации шрифта ---');
    await downloadFont(FONT_URL, TEMP_FONT_PATH);
    const base64Font = convertFontToBase64(TEMP_FONT_PATH);
    writeBase64ToTsFile(base64Font);
    console.log('\n✅ Процесс успешно завершен!');
    console.log('Теперь вы можете импортировать константу `robotoRegularBase64` в вашем React-компоненте.');
  } catch (error) {
    console.error('\n❌ Произошла ошибка:', error.message);
    process.exit(1); // Выход с кодом ошибки
  } finally {
    cleanup();
    console.log('--- Процесс завершен ---');
  }
}

// Запускаем скрипт
run();
