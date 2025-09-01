import { useEffect } from 'react';
import { toast } from 'sonner';

interface HotkeyConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

/**
 * Хук для обработки горячих клавиш
 */
export function useHotkeys(hotkeys: HotkeyConfig[]): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const hotkey of hotkeys) {
        const {
          key,
          ctrlKey = false,
          metaKey = false,
          shiftKey = false,
          altKey = false,
          callback
        } = hotkey;

        // Проверяем совпадение клавиш
        const keyMatch = event.key.toLowerCase() === key.toLowerCase();
        const ctrlMatch = event.ctrlKey === ctrlKey;
        const metaMatch = event.metaKey === metaKey;
        const shiftMatch = event.shiftKey === shiftKey;
        const altMatch = event.altKey === altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          // Предотвращаем стандартное поведение браузера
          event.preventDefault();
          event.stopPropagation();
          
          // Вызываем callback
          callback();
          break;
        }
      }
    };

    // Добавляем обработчик
    document.addEventListener('keydown', handleKeyDown);

    // Очищаем обработчик при размонтировании
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeys]);
}

/**
 * Хук для экспорта с горячими клавишами
 */
export function useExportHotkeys(onExport: () => void): void {
  useHotkeys([
    {
      key: 's',
      ctrlKey: true,
      metaKey: true, // Поддержка Cmd+S на Mac
      callback: () => {
        onExport();
        toast.info('Экспорт запущен (Ctrl/Cmd+S)');
      },
      description: 'Экспорт ZIP (Ctrl/Cmd+S)'
    }
  ]);
}

/**
 * Хук для выбора файлов с горячими клавишами
 */
export function useFileSelectionHotkeys(
  files: Array<{ id: string; name: string }>,
  onSelectFile: (fileId: string) => void
): void {
  useHotkeys(
    files.slice(0, 9).map((file, index) => ({
      key: (index + 1).toString(),
      callback: () => {
        onSelectFile(file.id);
        toast.info(`Выбран файл: ${file.name} (${index + 1})`);
      },
      description: `Выбрать файл ${index + 1}: ${file.name}`
    }))
  );
}

/**
 * Хук для общих горячих клавиш приложения
 */
export function useAppHotkeys(
  onExport: () => void,
  files: Array<{ id: string; name: string }>,
  onSelectFile: (fileId: string) => void
): void {
  useHotkeys([
    // Экспорт
    {
      key: 's',
      ctrlKey: true,
      metaKey: true,
      callback: () => {
        onExport();
        toast.info('Экспорт запущен (Ctrl/Cmd+S)');
      },
      description: 'Экспорт ZIP (Ctrl/Cmd+S)'
    },
    // Выбор файлов (1-9)
    ...files.slice(0, 9).map((file, index) => ({
      key: (index + 1).toString(),
      callback: () => {
        onSelectFile(file.id);
        toast.info(`Выбран файл: ${file.name} (${index + 1})`);
      },
      description: `Выбрать файл ${index + 1}: ${file.name}`
    }))
  ]);
}
