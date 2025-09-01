# Руководство по i18n

## Обзор

Проект использует систему интернационализации (i18n) для поддержки русского (RU) и казахского (KZ) языков. Система построена на основе кастомных хуков для удобного использования переводов в Next.js App Router.

## Структура файлов

```
src/
├── messages/
│   ├── ru.json          # Русские переводы
│   └── kz.json          # Казахские переводы
├── lib/
│   ├── i18n.ts          # Основные утилиты i18n
│   └── useTranslations.ts # Хуки для использования переводов
└── components/
    └── LanguageSwitcher.tsx # Компонент переключения языка
```

## Конфигурация

### App Router совместимость

Система i18n адаптирована для работы с Next.js App Router. В отличие от Pages Router, App Router не поддерживает встроенную конфигурацию i18n в `next.config.ts`, поэтому используется клиентская система с localStorage.

### Файлы переводов

Переводы хранятся в JSON файлах в папке `src/messages/`. Структура переводов:

```json
{
  "common": {
    "loading": "Загрузка...",
    "error": "Ошибка",
    // ...
  },
  "landing": {
    "hero": {
      "title": "Заголовок",
      "subtitle": "Подзаголовок",
      "cta": "Кнопка действия"
    }
    // ...
  }
}
```

## Использование

### 1. Основной хук useTranslations

```typescript
import { useTranslations } from '@/lib/useTranslations';

function MyComponent() {
  const { t, translations, loading, error, locale } = useTranslations();
  
  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки переводов</div>;
  
  return (
    <div>
      <h1>{t('landing.hero.title')}</h1>
      <p>{t('landing.hero.subtitle')}</p>
    </div>
  );
}
```

### 2. Типизированные хуки

Для удобства созданы типизированные хуки для конкретных разделов:

```typescript
import { useLandingTranslations } from '@/lib/useTranslations';

function LandingPage() {
  const { hero, features, how_it_works, faq } = useLandingTranslations();
  
  return (
    <div>
      <h1>{hero.title}</h1>
      <p>{hero.subtitle}</p>
      <button>{hero.cta}</button>
    </div>
  );
}
```

### 3. Переключение языка

```typescript
import LanguageSwitcher from '@/components/LanguageSwitcher';

function Header() {
  return (
    <header>
      <h1>Kaspi Card Builder</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

### 4. Программное переключение

```typescript
import { useLocaleSwitcher } from '@/lib/i18n';

function MyComponent() {
  const { switchLocale } = useLocaleSwitcher();
  
  const handleLanguageChange = (locale: 'ru' | 'kz') => {
    switchLocale(locale);
  };
  
  return (
    <div>
      <button onClick={() => handleLanguageChange('ru')}>RU</button>
      <button onClick={() => handleLanguageChange('kz')}>KZ</button>
    </div>
  );
}
```

## Особенности App Router

### 1. Клиентская система

Поскольку App Router не поддерживает серверную i18n конфигурацию, система работает полностью на клиенте:

- Локаль сохраняется в localStorage
- Переводы загружаются динамически
- Переключение языка происходит мгновенно без перезагрузки

### 2. SSR совместимость

Все компоненты с i18n должны быть клиентскими:

```typescript
'use client';

import { useTranslations } from '@/lib/useTranslations';

export default function MyComponent() {
  const { t } = useTranslations();
  
  return <div>{t('common.loading')}</div>;
}
```

### 3. Оптимизация производительности

Система оптимизирована для максимальной производительности:

- **Предзагрузка переводов** - все переводы загружаются сразу при первом рендере
- **Кэширование** - переводы хранятся в памяти для мгновенного доступа
- **События** - переключение языка происходит через события без перезагрузки
- **Плавные переходы** - все элементы анимируются при смене языка

## Производительность

### 1. Предзагрузка

```typescript
// Автоматически вызывается при первом рендере
useEffect(() => {
  preloadTranslations();
}, []);
```

### 2. Кэширование

```typescript
// Переводы кэшируются в памяти
const translationsCache = new Map<Locale, Translations>();
```

### 3. Мгновенное переключение

```typescript
// Переключение происходит через события
window.dispatchEvent(new CustomEvent('localeChanged', { 
  detail: { locale: newLocale } 
}));
```

## Добавление новых переводов

### 1. Добавить ключи в файлы переводов

В `src/messages/ru.json`:
```json
{
  "new_section": {
    "title": "Новый заголовок",
    "description": "Новое описание"
  }
}
```

В `src/messages/kz.json`:
```json
{
  "new_section": {
    "title": "Жаңа тақырып",
    "description": "Жаңа сипаттама"
  }
}
```

### 2. Обновить типы

В `src/lib/i18n.ts` добавить новые типы:

```typescript
export interface Translations {
  // ... существующие типы
  new_section: {
    title: string;
    description: string;
  };
}
```

### 3. Создать типизированный хук (опционально)

В `src/lib/useTranslations.ts`:

```typescript
export function useNewSectionTranslations() {
  const { t, loading, error } = useTranslations();
  
  return {
    title: t('new_section.title'),
    description: t('new_section.description'),
    isLoading: loading,
    hasError: !!error,
  };
}
```

## Лучшие практики

### 1. Структура ключей

Используйте иерархическую структуру ключей:
- `common.*` - общие переводы
- `landing.*` - переводы для лендинга
- `studio.*` - переводы для студии
- `form.*` - переводы для форм

### 2. Именование ключей

- Используйте snake_case для ключей
- Делайте ключи описательными
- Группируйте связанные переводы

### 3. Fallback

Система автоматически использует русский язык как fallback при ошибках загрузки переводов.

### 4. Производительность

- Переводы загружаются один раз и кэшируются
- Переключение языка происходит мгновенно
- Плавные анимации для лучшего UX

### 5. App Router специфика

- Все компоненты с i18n должны быть клиентскими
- Используйте плавные переходы для лучшего UX
- Предзагрузка переводов устраняет лоадинг

## Тестирование

Для тестирования i18n можно использовать:

```typescript
// Проверка текущей локали
const locale = useCurrentLocale();
console.log('Current locale:', locale);

// Проверка загрузки переводов
const { translations, loading, error } = useTranslations();
console.log('Translations loaded:', !!translations);
```

## Отладка

### Проверка текущей локали

```typescript
import { useCurrentLocale } from '@/lib/i18n';

function DebugComponent() {
  const locale = useCurrentLocale();
  console.log('Current locale:', locale);
  
  return <div>Current locale: {locale}</div>;
}
```

### Проверка загрузки переводов

```typescript
function DebugTranslations() {
  const { translations, loading, error } = useTranslations();
  
  console.log('Translations:', translations);
  console.log('Loading:', loading);
  console.log('Error:', error);
  
  return null;
}
```

### Проверка localStorage

```typescript
function DebugLocalStorage() {
  useEffect(() => {
    const locale = localStorage.getItem('preferred-locale');
    console.log('Stored locale:', locale);
  }, []);
  
  return null;
}
```

## Миграция с существующего кода

Если у вас есть компоненты с хардкодными строками:

### До:
```typescript
function OldComponent() {
  return (
    <div>
      <h1>Заголовок</h1>
      <p>Описание</p>
      <button>Кнопка</button>
    </div>
  );
}
```

### После:
```typescript
'use client';

function NewComponent() {
  const { t } = useTranslations();
  
  return (
    <div>
      <h1>{t('component.title')}</h1>
      <p>{t('component.description')}</p>
      <button>{t('component.button')}</button>
    </div>
  );
}
```

## Ограничения

### 1. App Router ограничения

- Нет серверной поддержки i18n
- Все компоненты должны быть клиентскими
- SEO может быть ограничен

### 2. SEO

- Поисковые системы могут не видеть переведенный контент при первом рендере
- Рекомендуется использовать мета-теги для указания языка

### 3. Производительность

- Дополнительная загрузка переводов при первом рендере
- Кэширование решает проблему последующих загрузок

## Заключение

Система i18n обеспечивает:
- ✅ Поддержку русского и казахского языков
- ✅ Типобезопасность переводов
- ✅ Удобные хуки для использования
- ✅ Совместимость с App Router
- ✅ Fallback на русский язык
- ✅ Мгновенное переключение языка
- ✅ Плавные анимации
- ✅ Кэширование для производительности
- ✅ Простоту интеграции в существующий код 
