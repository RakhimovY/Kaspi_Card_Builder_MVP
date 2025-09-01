'use client';

import { useEffect, useState } from 'react';
import { useCurrentLocale, preloadTranslations, loadTranslations } from './i18n';
import type { Translations } from './i18n';

export function useTranslations() {
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocale, setCurrentLocale] = useState(useCurrentLocale());

  // Предзагрузка переводов при первом рендере
  useEffect(() => {
    preloadTranslations();
  }, []);

  // Загрузка переводов для текущей локали
  useEffect(() => {
    async function loadTranslationsForLocale() {
      try {
        setLoading(true);
        setError(null);
        
        const messages = await loadTranslations(currentLocale);
        setTranslations(messages);
      } catch (err) {
        console.error('Failed to load translations:', err);
        setError('Failed to load translations');
      } finally {
        setLoading(false);
      }
    }

    loadTranslationsForLocale();
  }, [currentLocale]);

  // Слушаем события смены языка
  useEffect(() => {
    const handleLocaleChange = (event: CustomEvent) => {
      const newLocale = event.detail.locale;
      setCurrentLocale(newLocale);
    };

    window.addEventListener('localeChanged', handleLocaleChange as EventListener);
    
    return () => {
      window.removeEventListener('localeChanged', handleLocaleChange as EventListener);
    };
  }, []);

  const t = (key: string): string => {
    if (!translations) {
      return key;
    }

    const keys = key.split('.');
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return {
    t,
    translations,
    loading,
    error,
    locale: currentLocale,
  };
}

// Типизированные хуки для конкретных разделов
export function useCommonTranslations() {
  const { t, loading, error } = useTranslations();
  
  return {
    loading: t('common.loading'),
    error: t('common.error'),
    success: t('common.success'),
    cancel: t('common.cancel'),
    save: t('common.save'),
    delete: t('common.delete'),
    edit: t('common.edit'),
    close: t('common.close'),
    next: t('common.next'),
    back: t('common.back'),
    submit: t('common.submit'),
    download: t('common.download'),
    upload: t('common.upload'),
    select: t('common.select'),
    search: t('common.search'),
    filter: t('common.filter'),
    sort: t('common.sort'),
    language: t('common.language'),
    isLoading: loading,
    hasError: !!error,
  };
}

export function useLandingTranslations() {
  const { t, loading, error } = useTranslations();
  
  return {
    hero: {
      title: t('landing.hero.title'),
      subtitle: t('landing.hero.subtitle'),
      cta: t('landing.hero.cta'),
    },
    features: {
      kaspi_check: t('landing.features.kaspi_check'),
      generator: t('landing.features.generator'),
      export: t('landing.features.export'),
    },
    how_it_works: {
      title: t('landing.how_it_works.title'),
      step1: t('landing.how_it_works.step1'),
      step2: t('landing.how_it_works.step2'),
      step3: t('landing.how_it_works.step3'),
      step4: t('landing.how_it_works.step4'),
    },
    faq: {
      title: t('landing.faq.title'),
      q1: t('landing.faq.q1'),
      a1: t('landing.faq.a1'),
      q2: t('landing.faq.q2'),
      a2: t('landing.faq.a2'),
      q3: t('landing.faq.q3'),
      a3: t('landing.faq.a3'),
    },
    isLoading: loading,
    hasError: !!error,
  };
}

export function useStudioTranslations() {
  const { t, loading, error } = useTranslations();
  
  return {
    title: t('studio.title'),
    file_drop: {
      title: t('studio.file_drop.title'),
      subtitle: t('studio.file_drop.subtitle'),
      supported_formats: t('studio.file_drop.supported_formats'),
      max_size: t('studio.file_drop.max_size'),
    },
    preview: {
      before: t('studio.preview.before'),
      after: t('studio.preview.after'),
      processing: t('studio.preview.processing'),
      error: t('studio.preview.error'),
    },
    form: {
      brand: t('studio.form.brand'),
      type: t('studio.form.type'),
      model: t('studio.form.model'),
      key_spec: t('studio.form.key_spec'),
      sku_base: t('studio.form.sku_base'),
      category: t('studio.form.category'),
      price: t('studio.form.price'),
      quantity: t('studio.form.quantity'),
    },
    export: {
      title: t('studio.export.title'),
      download_zip: t('studio.export.download_zip'),
      processing: t('studio.export.processing'),
      success: t('studio.export.success'),
    },
    isLoading: loading,
    hasError: !!error,
  };
}
