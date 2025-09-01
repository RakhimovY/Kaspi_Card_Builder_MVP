import { useCallback } from 'react';

// Типы для переводов
export type Locale = 'ru' | 'kz';

export interface Translations {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    next: string;
    back: string;
    submit: string;
    download: string;
    upload: string;
    select: string;
    search: string;
    filter: string;
    sort: string;
    language: string;
  };
  landing: {
    hero: {
      title: string;
      subtitle: string;
      cta: string;
    };
    features: {
      kaspi_check: string;
      generator: string;
      export: string;
    };
    how_it_works: {
      title: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
    };
    faq: {
      title: string;
      q1: string;
      a1: string;
      q2: string;
      a2: string;
      q3: string;
      a3: string;
    };
  };
  studio: {
    title: string;
    file_drop: {
      title: string;
      subtitle: string;
      supported_formats: string;
      max_size: string;
    };
    preview: {
      before: string;
      after: string;
      processing: string;
      error: string;
    };
    form: {
      brand: string;
      type: string;
      model: string;
      key_spec: string;
      sku_base: string;
      category: string;
      price: string;
      quantity: string;
    };
    export: {
      title: string;
      download_zip: string;
      processing: string;
      success: string;
    };
  };
}

// Кэш для переводов
const translationsCache = new Map<Locale, Translations>();

// Предзагрузка всех переводов
export async function preloadTranslations(): Promise<void> {
  try {
    const [ruTranslations, kzTranslations] = await Promise.all([
      import('../messages/ru.json'),
      import('../messages/kz.json')
    ]);
    
    translationsCache.set('ru', ruTranslations.default);
    translationsCache.set('kz', kzTranslations.default);
  } catch (error) {
    console.error('Failed to preload translations:', error);
  }
}

// Загрузка переводов с кэшированием
export async function loadTranslations(locale: Locale): Promise<Translations> {
  // Проверяем кэш
  if (translationsCache.has(locale)) {
    return translationsCache.get(locale)!;
  }

  try {
    const messages = await import(`../messages/${locale}.json`);
    translationsCache.set(locale, messages.default);
    return messages.default;
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    // Fallback to Russian if translation fails
    const fallback = await import('../messages/ru.json');
    const fallbackTranslations = fallback.default;
    translationsCache.set(locale, fallbackTranslations);
    return fallbackTranslations;
  }
}

// Хук для переключения языка без перезагрузки
export function useLocaleSwitcher() {
  const switchLocale = useCallback((newLocale: Locale) => {
    // Сохраняем текущую локаль в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-locale', newLocale);
      
      // Вместо перезагрузки страницы, обновляем состояние через событие
      window.dispatchEvent(new CustomEvent('localeChanged', { 
        detail: { locale: newLocale } 
      }));
    }
  }, []);

  return { switchLocale };
}

// Хук для получения текущей локали
export function useCurrentLocale(): Locale {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('preferred-locale') as Locale;
    if (stored && (stored === 'ru' || stored === 'kz')) {
      return stored;
    }
  }
  return 'ru';
}

// Утилита для получения перевода по ключу
export function getTranslationKey(key: string): string {
  return key;
}

// Функция для получения вложенного значения из объекта переводов
export function getNestedTranslation(
  translations: Translations,
  key: string
): string {
  const keys = key.split('.');
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key; // Возвращаем ключ как fallback
    }
  }

  return typeof value === 'string' ? value : key;
}
