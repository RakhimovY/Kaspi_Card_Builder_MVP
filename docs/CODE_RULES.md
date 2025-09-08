---
alwaysApply: true
---

# Coding Rules & Best Practices (Frontend + Backend)

## Общие

- **TypeScript strict** везде: front (Next.js App Router) и back (API routes). Запрещены `any`, `// @ts-ignore` (кроме редких, документированных исключений с комментарием `// @reason`).
- ESLint (typescript, react, import, unused-imports), Prettier, sort-imports. CI блокирует PR при ошибках линта/типов/тестов.
- Архитектура: чистые утилиты в `/lib` (front: `/lib/*`, back: `/lib/server/*`). Никаких «божественных» компонентов и монолитных хендлеров.
- Формы: **React Hook Form + Zod**. Схемы валидации переиспользуем на сервере (Zod → типы).

## Репозиторий / Monorepo

- Next.js (App Router) остаётся основой. Бэкенд — **через API Routes** внутри `app/api/*`.
- Папки:
  - `app/(marketing)` — лендинг; `app/(studio)/studio` — основное приложение.
  - `app/api/*` — серверные обработчики (auth, billing, magic-fill, export, webhooks, health).
  - `/lib` — общие утилиты; `/lib/server` — только для сервера (Prisma client, billing SDK, rate limiter, logger).
  - `/db` — Prisma schema, миграции.
  - `/docs` — проектная документация (этот файл и пр.).

## UI/UX

- Tailwind + shadcn/ui. Компоненты атомарные и доступные (aria, focus ring, tab order, контраст ≥ 4.5).
- Скелетоны, пустые состояния, явные ошибки. Без layout-shift — используем placeholders.
- Keyboard-first: основные действия доступны с клавиатуры (например, `Cmd/Ctrl+S` — экспорт).

## Изображения (серверная обработка)

- Лимиты изображений при импорте/экспорте: **минимальная/максимальная сторона 500–5000 px**, **вес ≤ 25 MB**, форматы **JPEG/PNG/WebP**.
- **Удаление фона выполняется на сервере** через API `/api/process-photo`. Клиент выполняет ресайз/сжатие, **убирает EXIF**. По умолчанию сохраняем WebP (если поддерживается), иначе JPEG ~0.82.
- Все функции обработки — чистые и протестированные (resize, compress, validate, sanitize filename).

## i18n

- Default — **RU**, вторая локаль — **KZ**. Ключи человекочитаемые, неймспейсы: `landing`, `studio`, `common`, `pricing`, `account`.
- Никаких хардкодов строк в компонентах (кроме dev-логов). Переводы подгружаются на клиенте, локаль хранится в `localStorage`.

## State & Data (frontend)

- Zustand с `persist` на сессию. Слайсы разделены: `filesSlice`, `settingsSlice`, `formSlice`, `checklistSlice`.
- Не держим большие `ArrayBuffer` в стейте дольше, чем нужно. Тяжёлые операции — через Web Workers.

## Backend (новые правила)

- ORM: **Prisma** (Postgres). Один `PrismaClient` с реюзом, без утечек соединений. Миграции — через Prisma Migrate.
- Auth: **NextAuth** (Google Provider + PrismaAdapter). Сессии — JWT. Endpoint: `app/api/auth/[...nextauth]/route.ts`.
- Billing: **MoR-провайдер** (Lemon Squeezy / Paddle / Polar). Минимальная интеграция через hosted checkout + **webhooks**. Сервер хранит `Subscription` и применяет фичи/квоты.
- Quotas: глобальный `rateLimiter` + счётчики использования (`UsageStat`) по тарифу. Любой серверный эндпоинт вызывает `assertQuota(...)`.
- Magic Fill: `POST /api/magic-fill` — аккуратно агрегирует источники (штрихкод/GTIN, OCR, LLM). Сохраняет `ProductDraft` и `ImageAsset`. Строгая валидация входа/выхода через Zod.
- Image Processing: `POST /api/process-photo` — удаление фона на сервере с использованием `@imgly/background-removal-node`. Проверка квот, логирование операций.
- Export (опционально серверный дубль): `POST /api/export` может собирать ZIP на сервере для Pro-пользователей (для логирования и отчётности), но **по умолчанию экспорт — клиентский**.
- Logging: структурные логи (pino) с userId/traceId. Ошибки — с понятными кодами.
- Безопасность:
  - Секреты — только на сервере (`process.env`). Никогда не лей API-ключи на клиент.
  - Signed URLs и TTL для загрузки в объектное хранилище (если будет добавлено).
  - Вебхуки — проверяем подпись провайдера, обрабатываем идемпотентно.
  - CORS/headers: жёсткие.

## Тесты

- **Vitest** на утилиты (front/back). **React Testing Library** — критичные компоненты (Dropzone, Export, Forms).
- Сервер: юнит-тесты схем/валидаторов, интеграционные тесты API-хендлеров (примеси — msw/undici). Мокаем провайдеров (billing, OCR/LLM).

## Коммиты и CI

- Conventional Commits: `feat|fix|refactor|chore|docs|test: ...`.
- GitHub Actions: `lint`, `typecheck`, `test`. На main — build + e2e smoke.
- Версионирование: semver, теги релизов.

## Производительность

- Динамический импорт тяжёлых модулей (bg-removal). Web Workers для удаления фона/ресайза. Debounce инпутов.
- Сервер: избегаем N+1, используем выборочные колонки. Индексы под частые запросы.

## Документация

- Публичные утилиты — JSDoc. `/docs` содержит: Project Brief, Code Rules, Dev Steps for Cursor, Master Prompt, API.md.
- Перед переходом к следующему шагу из `DEV_STEPS_FOR_CURSOR.md` — дождись команды от пользователя "**дальше к следующему шагу**".

## ENV (минимум)

- `DATABASE_URL` — Postgres (Neon/Render).
- `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (аналитика).
- `BILLING_PROVIDER` (lemon|paddle|polar), ключи провайдера и Store/Business ID.
- `OPENAI_API_KEY` (или другой LLM провайдер) — **на сервере**.
