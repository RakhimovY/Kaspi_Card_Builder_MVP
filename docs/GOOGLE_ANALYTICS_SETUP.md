# Google Analytics Setup

## Обзор

В проект добавлена интеграция с Google Analytics для отслеживания пользовательской активности.

## Что было добавлено

### 1. Компонент GoogleAnalytics

Создан компонент `src/components/GoogleAnalytics.tsx`, который:
- Загружает Google Analytics скрипт асинхронно
- Инициализирует gtag с переданным ID
- Работает только если установлена переменная окружения `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`

### 2. Интеграция в Layout

Компонент добавлен в `src/app/layout.tsx` в секцию `<head>`:
- Размещен после PlausibleScript
- Загружается на всех страницах сайта

### 3. Переменные окружения

Добавлена переменная `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` в:
- `env.production.example` - закомментирована

## Настройка

### Локальная разработка

Создайте файл `.env.local` и добавьте:
```bash


### Production

В Vercel Dashboard → Settings → Environment Variables добавьте:
```

## Проверка работы

1. Откройте сайт в браузере
2. Откройте Developer Tools → Network
3. Найдите запросы к `googletagmanager.com`
4. В Console должно быть доступно `window.gtag`

## Особенности реализации

- Использует Next.js Script компонент с `strategy="afterInteractive"`
- Не блокирует загрузку страницы
- Автоматически отключается если не установлен GA ID
- Совместим с существующей Plausible аналитикой
