import { useEffect, useCallback, useRef } from 'react';

interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

interface HotkeyMap {
  [key: string]: HotkeyConfig;
}

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  const hotkeyMap = useRef<HotkeyMap>({});
  const pressedKeys = useRef<Set<string>>(new Set());

  // Создаем карту горячих клавиш
  useEffect(() => {
    hotkeyMap.current = {};
    hotkeys.forEach(hotkey => {
      const key = createHotkeyKey(hotkey);
      hotkeyMap.current[key] = hotkey;
    });
  }, [hotkeys]);

  // Создаем уникальный ключ для горячей клавиши
  const createHotkeyKey = (hotkey: HotkeyConfig): string => {
    const modifiers = [];
    if (hotkey.ctrl) modifiers.push('ctrl');
    if (hotkey.shift) modifiers.push('shift');
    if (hotkey.alt) modifiers.push('alt');
    if (hotkey.meta) modifiers.push('meta');
    
    return [...modifiers, hotkey.key.toLowerCase()].join('+');
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;
    const meta = event.metaKey;

    // Добавляем нажатую клавишу в набор
    pressedKeys.current.add(key);

    // Проверяем все возможные комбинации
    Object.values(hotkeyMap.current).forEach(hotkey => {
      if (
        hotkey.key.toLowerCase() === key &&
        hotkey.ctrl === ctrl &&
        hotkey.shift === shift &&
        hotkey.alt === alt &&
        hotkey.meta === meta
      ) {
        if (hotkey.preventDefault !== false) {
          event.preventDefault();
        }
        hotkey.action();
      }
    });
  }, []);

  // Обработчик отпускания клавиш
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeys.current.delete(key);
  }, []);

  // Регистрируем обработчики
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Проверяем, нажата ли клавиша
  const isKeyPressed = useCallback((key: string): boolean => {
    return pressedKeys.current.has(key.toLowerCase());
  }, []);

  // Получаем список всех зарегистрированных горячих клавиш
  const getHotkeysList = useCallback((): Array<{ key: string; description?: string }> => {
    return Object.values(hotkeyMap.current).map(hotkey => ({
      key: createHotkeyKey(hotkey),
      description: hotkey.description
    }));
  }, []);

  return {
    isKeyPressed,
    getHotkeysList
  };
}

// Предустановленные горячие клавиши
export const COMMON_HOTKEYS = {
  NEW: { key: 'n', ctrl: true, description: 'Новый элемент' },
  SAVE: { key: 's', ctrl: true, description: 'Сохранить' },
  FIND: { key: 'f', ctrl: true, description: 'Поиск' },
  PRINT: { key: 'p', ctrl: true, description: 'Печать' },
  UNDO: { key: 'z', ctrl: true, description: 'Отменить' },
  REDO: { key: 'y', ctrl: true, description: 'Повторить' },
  DELETE: { key: 'Delete', description: 'Удалить' },
  ESCAPE: { key: 'Escape', description: 'Отмена/Закрыть' },
  ENTER: { key: 'Enter', description: 'Подтвердить' },
  SPACE: { key: ' ', description: 'Пробел' },
  TAB: { key: 'Tab', description: 'Следующий элемент' },
  SHIFT_TAB: { key: 'Tab', shift: true, description: 'Предыдущий элемент' },
  ARROW_UP: { key: 'ArrowUp', description: 'Вверх' },
  ARROW_DOWN: { key: 'ArrowDown', description: 'Вниз' },
  ARROW_LEFT: { key: 'ArrowLeft', description: 'Влево' },
  ARROW_RIGHT: { key: 'ArrowRight', description: 'Вправо' },
  HOME: { key: 'Home', description: 'В начало' },
  END: { key: 'End', description: 'В конец' },
  PAGE_UP: { key: 'PageUp', description: 'Страница вверх' },
  PAGE_DOWN: { key: 'PageDown', description: 'Страница вниз' }
};

// Хук для быстрого создания горячих клавиш
export function useCommonHotkeys(actions: {
  onNew?: () => void;
  onSave?: () => void;
  onFind?: () => void;
  onPrint?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
}) {
  const hotkeys: HotkeyConfig[] = [];

  if (actions.onNew) hotkeys.push({ ...COMMON_HOTKEYS.NEW, action: actions.onNew });
  if (actions.onSave) hotkeys.push({ ...COMMON_HOTKEYS.SAVE, action: actions.onSave });
  if (actions.onFind) hotkeys.push({ ...COMMON_HOTKEYS.FIND, action: actions.onFind });
  if (actions.onPrint) hotkeys.push({ ...COMMON_HOTKEYS.PRINT, action: actions.onPrint });
  if (actions.onUndo) hotkeys.push({ ...COMMON_HOTKEYS.UNDO, action: actions.onUndo });
  if (actions.onRedo) hotkeys.push({ ...COMMON_HOTKEYS.REDO, action: actions.onRedo });
  if (actions.onDelete) hotkeys.push({ ...COMMON_HOTKEYS.DELETE, action: actions.onDelete });
  if (actions.onEscape) hotkeys.push({ ...COMMON_HOTKEYS.ESCAPE, action: actions.onEscape });
  if (actions.onEnter) hotkeys.push({ ...COMMON_HOTKEYS.ENTER, action: actions.onEnter });

  return useHotkeys(hotkeys);
} 