'use client';

import { Button } from '@/components/ui/button';
import { useLocaleSwitcher, useCurrentLocale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  onLocaleChange?: (locale: string) => void;
  currentLocale?: string;
}

export default function LanguageSwitcher({ onLocaleChange, currentLocale }: LanguageSwitcherProps) {
  const { switchLocale } = useLocaleSwitcher();
  const routerLocale = useCurrentLocale();
  
  // Use provided locale or fallback to router locale or 'ru'
  const activeLocale = currentLocale || routerLocale || 'ru';

  const handleLocaleSwitch = (newLocale: string) => {
    if (newLocale === activeLocale) return;
    
    // If we have a callback, use it (for landing page)
    if (onLocaleChange) {
      onLocaleChange(newLocale);
      return;
    }

    // Use the i18n switcher for other pages
    switchLocale(newLocale as 'ru' | 'kz');
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={activeLocale === 'ru' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLocaleSwitch('ru')}
        aria-label="Переключить на русский язык"
        className="transition-all duration-200 hover:scale-105"
      >
        RU
      </Button>
      <Button
        variant={activeLocale === 'kz' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleLocaleSwitch('kz')}
        aria-label="Қазақ тіліне ауыстыру"
        className="transition-all duration-200 hover:scale-105"
      >
        KZ
      </Button>
    </div>
  );
}
