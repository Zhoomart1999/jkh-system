import React, { useState } from 'react';

export const HotkeysHelp: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                className="fixed bottom-4 left-4 bg-gray-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
                title="Показать горячие клавиши"
            >
                ⌨️
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Горячие клавиши</h3>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between">
                        <span>Ctrl/Cmd + N</span>
                        <span className="text-gray-600">Новый абонент</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ctrl/Cmd + S</span>
                        <span className="text-gray-600">Сохранить</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ctrl/Cmd + F</span>
                        <span className="text-gray-600">Поиск</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Ctrl/Cmd + P</span>
                        <span className="text-gray-600">Печать</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Escape</span>
                        <span className="text-gray-600">Закрыть/Отмена</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Компонент для отображения горячих клавиш в интерфейсе
export function HotkeysIndicator({ hotkeys }: { hotkeys: Array<{ key: string; description?: string }> }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
        title="Горячие клавиши"
      >
        ⌨️
      </button>

      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-lg z-10 min-w-[200px]">
          <div className="font-medium mb-2">Горячие клавиши:</div>
          {hotkeys.slice(0, 5).map((hotkey, index) => (
            <div key={index} className="flex justify-between items-center mb-1">
              <span className="text-slate-300">{hotkey.description}</span>
              <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">{hotkey.key}</kbd>
            </div>
          ))}
          {hotkeys.length > 5 && (
            <div className="text-xs text-slate-400 mt-2">
              И еще {hotkeys.length - 5}...
            </div>
          )}
          <div className="text-xs text-slate-400 mt-2">
            Нажмите Ctrl+? для полной справки
          </div>
        </div>
      )}
    </div>
  );
}

export default HotkeysHelp; 