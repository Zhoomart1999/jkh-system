# 🏠 ЖКХ Система - React Frontend

Простое React приложение для управления жилищно-коммунальным хозяйством.

## 🚀 Быстрый запуск

```bash
npm install
npm run dev
```

## 📋 Роли пользователей

| Роль | PIN-код |
|------|---------|
| **Админ** | `11111111` |
| **Инженер** | `22222222` |
| **Бухгалтер** | `33333333` |
| **Контролер** | `44444444` |

## 🛠️ Установка

```bash
npm install
```

## 🚀 Запуск

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## 🏗️ Технологии

- **React 19** - Основной фреймворк
- **TypeScript** - Типизация
- **Vite** - Сборщик
- **React Router** - Маршрутизация
- **Recharts** - Графики

## 📁 Структура

```
├── components/     # React компоненты
├── pages/         # Страницы приложения
├── services/      # Mock API
├── context/       # React Context
└── types.ts       # TypeScript типы
```
│   └── context/       # React контексты
├── electron/          # Electron конфигурация
├── public/           # Статические файлы
└── build/           # Сборка приложения
```

## 🔧 Настройка разработки

### Переменные окружения
Создайте файл `.env.local`:
```env
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=ЖКХ Токмок
```

### Скрипты разработки
```bash
# Запуск всех сервисов
npm run start

# Только веб-версия
npm run dev

# Только десктопная версия
npm run electron:dev

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

## 📦 Сборка приложения

### Для Windows
```bash
npm run electron:dist -- --win
```

### Для macOS
```bash
npm run electron:dist -- --mac
```

### Для Linux
```bash
npm run electron:dist -- --linux
```

## 🐛 Отладка

### DevTools
В десктопном приложении DevTools открываются автоматически в режиме разработки.

### Логи
Логи приложения выводятся в консоль терминала.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте версию Node.js (должна быть 18+)
2. Удалите node_modules и package-lock.json
3. Выполните `npm install` заново
4. Очистите кэш: `npm run dev -- --force`

## 📄 Лицензия

© 2024 Токмок Водоканал. Все права защищены.
