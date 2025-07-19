const { app, BrowserWindow, Menu, dialog } = require('electron');
const path = require('path');
const db = require('../src/db/database.cjs');

// Тест: добавление и вывод абонентов
function testDb() {
    // Добавим тестового абонента (если его нет)
    const abonents = db.getAbonents();
    if (!abonents.find(a => a.id === 'test-1')) {
        db.addAbonent({
            id: 'test-1',
            fullName: 'Тестовый Абонент',
            address: 'г. Токмок, ул. Примерная, 1',
            phone: '+996700000000',
            numberOfPeople: 3,
            buildingType: 'apartment',
            waterTariff: 'by_meter',
            status: 'active',
            balance: 0,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Добавлен тестовый абонент');
    }
    // Выводим всех абонентов
    console.log('📋 Список абонентов:', db.getAbonents());
}

let mainWindow;

function createWindow() {
    // Создаем окно браузера
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: true
        },
        title: 'ЖКХ Токмок - Система управления',
        show: false, // Не показываем окно сразу
        autoHideMenuBar: false // Показываем меню
    });

    // Загружаем приложение
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
        // В режиме разработки загружаем с Vite dev server
        mainWindow.loadURL('http://localhost:5175');
        // Открываем DevTools в режиме разработки
        mainWindow.webContents.openDevTools();
    } else {
        // В продакшене загружаем собранное приложение
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Показываем окно когда контент загружен
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Создаем меню приложения
        const template = [
            {
                label: 'Файл',
                submenu: [
                    {
                        label: 'Новое окно',
                        accelerator: 'CmdOrCtrl+N',
                        click: () => {
                            createWindow();
                        }
                    },
                    { type: 'separator' },
                    {
                        label: 'Выход',
                        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                        click: () => {
                            app.quit();
                        }
                    }
                ]
            },
            {
                label: 'Правка',
                submenu: [
                    { role: 'undo', label: 'Отменить' },
                    { role: 'redo', label: 'Повторить' },
                    { type: 'separator' },
                    { role: 'cut', label: 'Вырезать' },
                    { role: 'copy', label: 'Копировать' },
                    { role: 'paste', label: 'Вставить' },
                    { role: 'selectall', label: 'Выбрать все' }
                ]
            },
            {
                label: 'Вид',
                submenu: [
                    { role: 'reload', label: 'Перезагрузить' },
                    { role: 'forceReload', label: 'Принудительная перезагрузка' },
                    { role: 'toggleDevTools', label: 'Инструменты разработчика' },
                    { type: 'separator' },
                    { role: 'resetZoom', label: 'Сбросить масштаб' },
                    { role: 'zoomIn', label: 'Увеличить' },
                    { role: 'zoomOut', label: 'Уменьшить' },
                    { type: 'separator' },
                    { role: 'togglefullscreen', label: 'Полноэкранный режим' }
                ]
            },
            {
                label: 'Окно',
                submenu: [
                    { role: 'minimize', label: 'Свернуть' },
                    { role: 'close', label: 'Закрыть' }
                ]
            },
            {
                label: 'Помощь',
                submenu: [
                    {
                        label: 'О приложении',
                        click: () => {
                            dialog.showMessageBox(mainWindow, {
                                type: 'info',
                                title: 'О приложении',
                                message: 'ЖКХ Токмок - Система управления',
                                detail: 'Версия 1.0.0\nСистема управления жилищно-коммунальным хозяйством города Токмок\n\nРоли пользователей:\n• Админ: 11111111\n• Инженер: 22222222\n• Бухгалтер: 33333333\n• Контролер: 44444444'
                            });
                        }
                    }
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    });

    // Обработка закрытия окна
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Обработка ошибок загрузки
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
        if (isDev) {
            // В режиме разработки пытаемся перезагрузить
            setTimeout(() => {
                mainWindow.loadURL('http://localhost:5175');
            }, 1000);
        }
    });
}

// Создаем окно когда приложение готово
app.whenReady().then(() => {
    testDb();
    createWindow();
});

// Закрываем приложение когда все окна закрыты (кроме macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// На macOS пересоздаем окно при клике на иконку в доке
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Обработка ошибок
app.on('render-process-gone', (event, webContents, details) => {
    console.error('Render process gone:', details);
});

app.on('child-process-gone', (event, details) => {
    console.error('Child process gone:', details);
}); 