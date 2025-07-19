#!/bin/bash

echo "🚀 Запуск ЖКХ Токмок как десктопного приложения..."

# Проверяем, запущен ли Vite dev server
if ! curl -s http://localhost:5177 > /dev/null; then
    echo "📡 Запускаем Vite dev server..."
    npm run dev &
    sleep 3
fi

echo "🖥️  Запускаем Electron приложение..."
npm run electron:dev

echo "✅ Приложение запущено!"
echo ""
echo "📋 Информация для входа:"
echo "• Админ: 11111111"
echo "• Инженер: 22222222" 
echo "• Бухгалтер: 33333333"
echo "• Контролер: 44444444"
echo ""
echo "🌐 Также доступно в браузере: http://localhost:5177" 