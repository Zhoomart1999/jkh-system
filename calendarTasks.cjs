const express = require('express');
const cron = require('node-cron');
const app = express();

let events = []; // История событий (в реальном проекте — хранить в БД)

function getCurrentPeriod() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

// Функция автоматического расчёта
function runMonthlyTasks(triggeredBy = 'auto') {
  const { month, year } = getCurrentPeriod();
  // 1. Создать квитанции для всех абонентов (заглушка)
  // 2. Сбросить флаг зарплат
  // 3. Записать событие
  events.push({
    id: Date.now().toString(),
    type: 'monthly_update',
    date: new Date().toISOString(),
    details: `Расчёты за ${month}.${year} (${triggeredBy})`,
    status: 'success'
  });
  // 4. Отправить уведомления (заглушка)
  console.log('Monthly ЖКХ tasks done for', month, year);
}

// Cron: запускать 1-го числа каждого месяца в 00:05
cron.schedule('5 0 1 * *', () => runMonthlyTasks());

// API: ручной запуск
app.post('/api/calendar/trigger', (req, res) => {
  runMonthlyTasks('manual');
  res.json({ ok: true });
});

// API: история событий
app.get('/api/calendar/history', (req, res) => {
  res.json(events);
});

// API: текущий период
app.get('/api/calendar/current-period', (req, res) => {
  res.json(getCurrentPeriod());
});

app.listen(3001, () => console.log('Calendar backend running on port 3001')); 