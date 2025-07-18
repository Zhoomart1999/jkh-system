# 🏠 ЖКХ Токмок - Система управления

Система управления жилищно-коммунальным хозяйством города Токмок.

## 🚀 Быстрый запуск

### Как десктопное приложение (рекомендуется)
```bash
./start-app.sh
```

### Как веб-приложение
```bash
npm run dev
```

## 📋 Роли пользователей

| Роль | PIN-код | Описание |
|------|---------|----------|
| **Админ** | `11111111` | Полный доступ к системе |
| **Инженер** | `22222222` | Управление техническими заявками |
| **Бухгалтер** | `33333333` | Финансовые операции и отчеты |
| **Контролер** | `44444444` | Работа с абонентами |

## 🛠️ Установка и настройка

### Требования
- Node.js 18+ 
- npm

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
# Десктопное приложение
npm run electron:dev

# Веб-приложение
npm run dev
```

### Сборка для продакшена
```bash
# Сборка веб-версии
npm run build

# Сборка десктопного приложения
npm run electron:dist
```

## 🎯 Основные функции

### 👨‍💼 Админ
- Управление пользователями
- Настройка тарифов
- Аудит системы
- Объявления
- Настройки компании

### 🔧 Инженер
- Технические заявки
- GIS карта инфраструктуры
- Плановое обслуживание
- Контроль качества воды
- Складские материалы

### 💰 Бухгалтер
- Платежи и начисления
- Расходы и зарплаты
- Банковские операции
- Финансовые отчеты
- Должники и взыскания

### 👥 Контролер
- Работа с абонентами
- Снятие показаний счетчиков
- Прием платежей
- Чек-извещения

## 🏗️ Архитектура

- **Frontend**: React + TypeScript + Vite
- **Desktop**: Electron
- **UI**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: Leaflet
- **PDF**: jsPDF

## 📁 Структура проекта

```
├── src/
│   ├── components/     # React компоненты
│   ├── pages/         # Страницы приложения
│   ├── services/      # API и сервисы
│   ├── types/         # TypeScript типы
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
