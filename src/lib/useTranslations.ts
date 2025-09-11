"use client";

import { useEffect, useState } from "react";
import {
  useCurrentLocale,
  preloadTranslations,
  loadTranslations,
} from "./i18n";
import type { Translations } from "./i18n";

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
        console.error("Failed to load translations:", err);
        setError("Failed to load translations");
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

    window.addEventListener(
      "localeChanged",
      handleLocaleChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "localeChanged",
        handleLocaleChange as EventListener
      );
    };
  }, []);

  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!translations) {
      return key;
    }

    const keys = key.split(".");
    let value: unknown = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        // Translation key not found
        return key;
      }
    }

    let result = typeof value === "string" ? value : key;

    // Интерполяция параметров
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        result = result.replace(
          new RegExp(`\\{${param}\\}`, "g"),
          String(value)
        );
      });
    }

    return result;
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
    loading: t("common.loading"),
    error: t("common.error"),
    success: t("common.success"),
    cancel: t("common.cancel"),
    save: t("common.save"),
    delete: t("common.delete"),
    edit: t("common.edit"),
    close: t("common.close"),
    next: t("common.next"),
    back: t("common.back"),
    submit: t("common.submit"),
    download: t("common.download"),
    upload: t("common.upload"),
    select: t("common.select"),
    search: t("common.search"),
    filter: t("common.filter"),
    sort: t("common.sort"),
    language: t("common.language"),
    isLoading: loading,
    hasError: !!error,
  };
}

export function useLandingTranslations() {
  const { t, loading, error } = useTranslations();

  return {
    nav: {
      pricing: t("landing.nav.pricing"),
    },
    hero: {
      badge: t("landing.hero.badge"),
      title: t("landing.hero.title"),
      subtitle: t("landing.hero.subtitle"),
      subtitle_highlight: t("landing.hero.subtitle_highlight"),
      cta: t("landing.hero.cta"),
      stats: {
        scan: t("landing.hero.stats.scan"),
        scan_desc: t("landing.hero.stats.scan_desc"),
        time: t("landing.hero.stats.time"),
        time_desc: t("landing.hero.stats.time_desc"),
        manual: t("landing.hero.stats.manual"),
        manual_desc: t("landing.hero.stats.manual_desc"),
      },
    },
    features: {
      title: t("landing.features.title"),
      subtitle: t("landing.features.subtitle"),
      kaspi_check: t("landing.features.kaspi_check"),
      kaspi_check_desc: t("landing.features.kaspi_check_desc"),
      generator: t("landing.features.generator"),
      generator_desc: t("landing.features.generator_desc"),
      export: t("landing.features.export"),
      export_desc: t("landing.features.export_desc"),
    },
    how_it_works: {
      title: t("landing.how_it_works.title"),
      subtitle: t("landing.how_it_works.subtitle"),
      step1: t("landing.how_it_works.step1"),
      step2: t("landing.how_it_works.step2"),
      step3: t("landing.how_it_works.step3"),
      step4: t("landing.how_it_works.step4"),
    },
    faq: {
      title: t("landing.faq.title"),
      subtitle: t("landing.faq.subtitle"),
      q1: t("landing.faq.q1"),
      a1: t("landing.faq.a1"),
      q2: t("landing.faq.q2"),
      a2: t("landing.faq.a2"),
      q3: t("landing.faq.q3"),
      a3: t("landing.faq.a3"),
      q4: t("landing.faq.q4"),
      a4: t("landing.faq.a4"),
      q5: t("landing.faq.q5"),
      a5: t("landing.faq.a5"),
      q6: t("landing.faq.q6"),
      a6: t("landing.faq.a6"),
    },
    pricing: {
      title: t("landing.pricing.title"),
      subtitle: t("landing.pricing.subtitle"),
      mostPopular: t("landing.pricing.mostPopular"),
      free: {
        title: t("landing.pricing.free.title"),
        price: t("landing.pricing.free.price"),
        description: t("landing.pricing.free.description"),
        limit: t("landing.pricing.free.limit"),
        cta: t("landing.pricing.free.cta"),
        features: {
          "1": t("landing.pricing.free.features.1"),
          "2": t("landing.pricing.free.features.2"),
          "3": t("landing.pricing.free.features.3"),
          "4": t("landing.pricing.free.features.4"),
        },
      },
      pro: {
        title: t("landing.pricing.pro.title"),
        price: t("landing.pricing.pro.price"),
        description: t("landing.pricing.pro.description"),
        limit: t("landing.pricing.pro.limit"),
        cta: t("landing.pricing.pro.cta"),
        features: {
          "1": t("landing.pricing.pro.features.1"),
          "2": t("landing.pricing.pro.features.2"),
          "3": t("landing.pricing.pro.features.3"),
          "4": t("landing.pricing.pro.features.4"),
          "5": t("landing.pricing.pro.features.5"),
          "6": t("landing.pricing.pro.features.6"),
        },
      },
    },
    cta: {
      title: t("landing.cta.title"),
      subtitle: t("landing.cta.subtitle"),
      start_free: t("landing.cta.start_free"),
      buy_pro: t("landing.cta.buy_pro"),
    },
    footer: {
      title: t("landing.footer.title"),
      description: t("landing.footer.description"),
      product: t("landing.footer.product"),
      studio: t("landing.footer.studio"),
      pricing: t("landing.footer.pricing"),
      docs: t("landing.footer.docs"),
      support: t("landing.footer.support"),
      email: t("landing.footer.email"),
      telegram: t("landing.footer.telegram"),
      faq: t("landing.footer.faq"),
      contacts: t("landing.footer.contacts"),
      info_email: t("landing.footer.info_email"),
      telegram_handle: t("landing.footer.telegram_handle"),
      working_hours: t("landing.footer.working_hours"),
      whatsapp: t("landing.footer.whatsapp"),
      whatsapp_desc: t("landing.footer.whatsapp_desc"),
      telegram_contact: t("landing.footer.telegram_contact"),
      telegram_desc: t("landing.footer.telegram_desc"),
      copyright: t("landing.footer.copyright"),
    },
    user_status: {
      already_registered: t("landing.user_status.already_registered"),
      already_pro: t("landing.user_status.already_pro"),
    },
    isLoading: loading,
    hasError: !!error,
  };
}

export function useStudioTranslations() {
  const { t, loading, error } = useTranslations();

  return {
    title: t("studio.title"),
    file_drop: {
      title: t("studio.file_drop.title"),
      subtitle: t("studio.file_drop.subtitle"),
      supported_formats: t("studio.file_drop.supported_formats"),
      max_size: t("studio.file_drop.max_size"),
    },
    preview: {
      before: t("studio.preview.before"),
      after: t("studio.preview.after"),
      processing: t("studio.preview.processing"),
      error: t("studio.preview.error"),
    },
    form: {
      brand: t("studio.form.brand"),
      type: t("studio.form.type"),
      model: t("studio.form.model"),
      key_spec: t("studio.form.key_spec"),
      sku_base: t("studio.form.sku_base"),
      category: t("studio.form.category"),
      price: t("studio.form.price"),
      quantity: t("studio.form.quantity"),
    },
    export: {
      title: t("studio.export.title"),
      download_zip: t("studio.export.download_zip"),
      processing: t("studio.export.processing"),
      success: t("studio.export.success"),
    },
    isLoading: loading,
    hasError: !!error,
  };
}

export function useAuthTranslations() {
  const { t, loading, error } = useTranslations();

  return {
    signin: {
      title: t("auth.signin.title"),
      description: t("auth.signin.description"),
      google: t("auth.signin.google"),
      signIn: t("auth.signin.signIn"),
    },
    error: {
      title: t("auth.error.title"),
      configuration: t("auth.error.configuration"),
      accessDenied: t("auth.error.accessDenied"),
      verification: t("auth.error.verification"),
      default: t("auth.error.default"),
      help: t("auth.error.help"),
      tryAgain: t("auth.error.tryAgain"),
      goHome: t("auth.error.goHome"),
    },
    profile: {
      view: t("auth.profile.view"),
      pageTitle: t("auth.profile.pageTitle"),
      settings: t("auth.profile.settings"),
      signOut: t("auth.profile.signOut"),
      backToHome: t("auth.profile.backToHome"),
      lastLogin: t("auth.profile.lastLogin"),
      userId: t("auth.profile.userId"),
      usageStats: t("auth.profile.usageStats"),
      processedPhotos: t("auth.profile.processedPhotos"),
      exports: t("auth.profile.exports"),
      sessions: t("auth.profile.sessions"),
      quickActions: t("auth.profile.quickActions"),
      openStudio: t("auth.profile.openStudio"),
      securitySettings: t("auth.profile.securitySettings"),
      currentPlan: t("auth.profile.currentPlan"),
      freePlan: t("auth.profile.freePlan"),
      freePlanLimit: t("auth.profile.freePlanLimit"),
      upgrade: t("auth.profile.upgrade"),
      loadingProfile: t("auth.profile.loadingProfile"),
    },
    isLoading: loading,
    hasError: !!error,
  };
}
