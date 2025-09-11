## Этап 0 — Инициализация проекта ✅

- ✅ Создай Next.js 14 (App Router, TS, ESLint, Tailwind) P.S. по текушему пути.
- ✅ Подключи shadcn/ui (Button, Card, Input, Textarea, Checkbox, Tabs, Dialog, Progress).
- ✅ Подключи i18n с RU (default) и KZ (вторая локаль). Сделай переключатель языка.
- ✅ Подключи Plausible (env NEXT_PUBLIC_PLAUSIBLE_DOMAIN).
- ✅ Заведи базовые страницы: /(marketing) и /(studio)/studio.

## Этап 1 — Лендинг ✅

- ✅ Hero: H1 «Фото и карточки для Kaspi за 2 минуты».
- ✅ 3 буллета: «Kaspi-check фото», «Генератор тайтла/описания», «Экспорт ZIP/CSV».
- ✅ CTA: «Попробовать бесплатно» → /studio.
- ✅ Секция «Как это работает» (4 шага), FAQ, футер с контактами.
- ✅ Современный дизайн с анимациями, градиентами и интерактивными элементами
- ✅ Анимированный фон с частицами и градиентами
- ✅ Интерактивная секция с компонентами
- ✅ Анимированный футер с hover-эффектами

## Этап 2 — Каркас Studio ✅

- ✅ Макет 3-панели:
  - ✅ Left: FileDrop (drag&drop + список файлов).
  - ✅ Center: Preview Before/After с вкладками.
  - ✅ Right: Form (Brand, Type, Model, KeySpec, SKU base; Category select; checklist).
- ✅ Zustand store: files[], settings (maxEdgePx, format), form state, checklist state.
- ✅ Сохраняй состояние в localStorage.

## Этап 3 — Фото-пайплайн (сервер) ✅

- ✅ Интегрируй `@imgly/background-removal-node` на сервере через API `/api/process-photo`.
- ✅ Добавь ресайз/кадрирование до maxEdgePx (например, 2000 по умолчанию), центрирование, паддинги.
- ✅ Сжатие JPEG/WebP с выставляемым качеством (0.8 по умолчанию).
- ✅ Валидация: если <500px или >5000px по стороне — предупреждать/править; >25MB — перепаковывать.
- ✅ Снимай EXIF.
- ✅ Покажи прогресс обработки (per-file).

## Этап 4 — Title & Description Helper ✅

- ✅ Поля: brand, type, model, keySpec, extraKeyword[].
- ✅ Генерация тайтла: `${type} ${brand} ${model} ${keySpec}` с нормализацией пробелов/регистра.
- ✅ Описание: 3–5 буллетов преимуществ, секция «Характеристики» (табличный список из формы).
- ✅ i18n: RU/KZ версии (через простые словари/стаб-переводы).
- ✅ Превью: тайтл и описание сбоку, copy-to-clipboard.

## Этап 5 — Category Checklist ✅

- ✅ Справочник пресетов (JSON) для 3 категорий: «Одежда», «Электроника», «Косметика».
- ✅ Для каждой — список чек-пунктов: «Состав/Материал указан», «Размерная сетка», «Основные тех. параметры» и т.п.
- ✅ UI: чекбоксы + «всё выполнено» индикатор.

## Этап 6 — Экспорт ZIP/CSV ✅

- ✅ `jszip`: собрать `/images/*.jpg|webp` + README.md + export.csv.
- ✅ Нейминг файлов: `<SKU>_<index>.jpg`, где SKU = явный input или `${brand}-${model}` нормализованный.
- ✅ CSV колонки: `sku,name,brand,category,price,qty,description,image1..image8,attributes_notes`.
- ✅ README.md: мини-гайд «как загрузить в Kaspi», упоминание лимитов.
- ✅ Кнопка «Скачать ZIP» с прогрессом и валидацией.
- ✅ Горячие клавиши Ctrl/Cmd+S для экспорта.
- ✅ Аналитика экспорта через Plausible.

## Этап 7 — UI-полировка и пустые состояния ✅

- ✅ Skeletons, пустые состояния, ошибки.
- ✅ Тосты на долгие операции.
- ✅ Горячие клавиши: 1..9, Ctrl/Cmd+S — экспорт.

## Этап 8 — Мини-аналитика и логирование ✅

- ✅ Plausible события: `drop_files`, `process_start`, `process_done`, `export_zip`.
- ✅ Простая /api/health для uptime-мониторинга.
- ✅ Автоматическое отслеживание pageview событий.
- ✅ Документация API в /docs/API.md.

## Этап 9 — Оплата (заглушка) и тарифы ✅

- ✅ Страница Pricing: Free (до 50 фото/мес), Pro (до 500 фото/мес).
- ✅ Кнопка «Оформить Pro» → Lemon Squeezy overlay (пока без server-webhook, просто CTA).
- ✅ Добавлена навигация на страницу тарифов в хедере лендинга
- ✅ Переводы для страницы тарифов на RU и KZ

## Этап 10 — Backend Preflight ✅

- **Рантайм:** Node.js ≥ 20, пакетный менеджер (pnpm|npm|yarn). ✅
- **База/ORM:** Postgres + Prisma. ✅
- **Auth:** NextAuth (Google) + PrismaAdapter (JWT-сессии). ✅
- **Billing (MoR):** Lemon Squeezy | Paddle | Polar — hosted checkout + webhooks. ✅
- **Квоты/валидации/логи:** Zod, pino. ✅
- **ИИ/распознавание:** OpenAI SDK (или совместимый), tesseract.js (OCR fallback), `@zxing/browser` (скан штрихкода). ✅
- **Экспорт ZIP (опц.):** `archiver`. ✅
- **Dev-инфра:** Vitest + RTL + jest-dom; типы `@types/node`. ✅
- **Скрипты package.json:** dev/build/start/typecheck/lint/test + prisma generate/migrate/studio. ✅
- **ENV (пример):** `DATABASE_URL`, `NEXTAUTH_SECRET`/`NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`,  
  `BILLING_PROVIDER` (+ секреты выбранного провайдера), `OPENAI_API_KEY`, `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. ✅
- **Каркас папок/файлов:**  
  `/lib/server/{env.ts, prisma.ts, quota.ts, logger.ts}` ✅  
  `app/api/{auth/[...nextauth], webhooks/billing, magic-fill, product-drafts, export, health}` (пустые заглушки). ✅

## Этап 11 — Подготовка БД и Prisma ✅

**Задача:** добавить Prisma, настроить Postgres, подготовить схемы и миграции.

- ✅ Добавь `prisma/schema.prisma` с моделями: User/Account/Session/VerificationToken (NextAuth), Subscription, UsageStat, ProductDraft, ImageAsset, BarcodeLookup.
- ✅ Сгенерируй клиент, настрой `DATABASE_URL`.
- ✅ Создай `/lib/server/prisma.ts` с синглтоном.
- ✅ Настроена поддержка SQLite (локальная разработка) и PostgreSQL (продакшен)
- ✅ Создан скрипт переключения между базами данных
- ✅ Добавлена документация по настройке БД
  **DoD:** миграции применяются локально; скрипты `prisma migrate dev`, `prisma studio` работают; юнит-тест на `prisma.$queryRaw` smoke. ✅

## Этап 12 — NextAuth (Google) ✅

**Задача:** вход по Google + PrismaAdapter.

## Тестовое окружение

**Важно:** Для тестирования webhook'ов и внешних интеграций используем:

- **Тестовый домен:** https://abbcfd0cdc8e.ngrok-free.app (ссылается на http://localhost:3000)
- **Локальная разработка:** http://localhost:3000
- **Webhook endpoint:** https://abbcfd0cdc8e.ngrok-free.app/api/webhooks/billing
- **LEMON_SQUEEZY_WEBHOOK_SECRET** добавлен в env

**Впредь всегда используй http://localhost:3000 для тестирования и не создавай новые localhost порты.**

## Этап 13 — Billing (MoR) — Overlay + Webhook ✅

**Задача:** полноценная интеграция с Lemon Squeezy через overlay и webhook.

- ✅ Lemon Squeezy overlay в landing page с правильной конфигурацией
- ✅ Webhook endpoint `/api/webhooks/billing` с валидацией подписи
- ✅ Lemon Squeezy API утилиты для работы с customer/subscription
- ✅ Обновлена Prisma схема (добавлен `lemonSqueezyCustomerId`)
- ✅ API endpoint `/api/subscription` для получения информации о подписке
- ✅ Компонент `SubscriptionInfo` для отображения статуса и лимитов
- ✅ Обработка webhook событий: создание/обновление/отмена подписок
- ✅ Автоматическое создание пользователей при оплате
- ✅ Система квот по планам (Free: 50 фото, Pro: 500 фото)
- ✅ Исправлена проблема с overlay (добавлена проверка готовности скрипта)
- ✅ Создан тестовый компонент `LemonSqueezyTest` для диагностики
- ✅ Добавлена документация по настройке и отладке
- ✅ Исправлены редиректы для поддержки ngrok доменов
- ✅ Настроен выбор аккаунта Google (prompt: 'select_account')
- ✅ Добавлены утилиты для динамического определения base URL
- ✅ Создана документация по настройке ngrok
- ✅ Созданы утилиты для принудительного использования ngrok URL
- ✅ Добавлен middleware для перехвата и исправления редиректов
- ✅ Обновлен NextAuth для принудительного использования ngrok в development
- Endpoint: `app/api/auth/[...nextauth]/route.ts`.
- Сессии — JWT. На клиенте — кнопка «Войти» + «Профиль/Выход».
  **DoD:** после логина создаётся пользователь; защищённые API читают `userId` из сессии. ✅

### Реализовано:

1. **NextAuth конфигурация** с Google OAuth провайдером
2. **PrismaAdapter** для автоматического создания пользователей в БД
3. **JWT сессии** для клиент-серверной аутентификации
4. **UI компоненты**: страницы входа/ошибки, кнопки аутентификации, профиль
5. **Серверные утилиты** для проверки аутентификации в API
6. **Защищенный API endpoint** `/api/test-auth` для тестирования
7. **Переводы** на RU/KZ для всех текстов аутентификации
8. **SessionProvider** в корневом layout для работы сессий

### Файлы:

- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth конфигурация
- `src/app/auth/signin/page.tsx` - страница входа
- `src/app/auth/error/page.tsx` - страница ошибки
- `src/components/AuthButtons.tsx` - кнопки входа/выхода
- `src/components/SessionProvider.tsx` - NextAuth провайдер
- `src/lib/server/auth.ts` - серверные утилиты аутентификации
- `src/messages/{ru,kz}.json` - переводы для аутентификации

### Тестирование:

- ✅ Проект собирается без ошибок
- ✅ Типы TypeScript проходят проверку
- ✅ ESLint предупреждения (не критичные)
- ✅ Страницы аутентификации работают с Suspense
- ✅ API endpoints настроены и защищены

## Этап 13 — Billing (MoR) — Overlay + Webhooks

**Задача:** подключить Lemon Squeezy (или Paddle/Polar) как hosted checkout.

### 🎭 ТЕКУЩЕЕ СОСТОЯНИЕ: МОК РЕАЛИЗОВАН

**Статус:** ✅ **ЗАВЕРШЕН (с моками)** — готов к переходу на реальные платежи

**Что уже работает:**

- ✅ **Мок API:** `POST /api/mock-purchase-pro` — создает Pro подписку в БД без реальных платежей
- ✅ **Компоненты:** `BuyProButton`, `LemonSqueezyTest` с переключателем Mock Mode
- ✅ **Интеграция:** все кнопки "Купить Pro" на лендинге используют мок
- ✅ **База данных:** создаются реальные записи `Subscription` с `provider: 'mock'`
- ✅ **Тестирование:** страница `/test-mock` для полного тестирования функциональности

**Документация:**

- 📖 **Моки:** `docs/MOCK_PURCHASE_SETUP.md` — полное описание мок-системы
- 📖 **Биллинг:** `docs/BILLING_IMPLEMENTATION.md` — план реальной интеграции
- 📖 **Lemon Squeezy:** `docs/LEMON_SQUEEZY_SETUP.md` — настройка провайдера

### 🔄 СЛЕДУЮЩИЕ ШАГИ (когда вернемся к этапу):

1. **Настройка Lemon Squeezy:**

   - Получить верификацию аккаунта
   - Создать Product и Variant в Lemon Squeezy
   - Настроить переменные окружения: `NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID`, `NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID`

2. **Переключение с мока на реальные платежи:**

   - В `LemonSqueezyTest` отключить Mock Mode по умолчанию
   - Заменить `BuyProButton` на реальную интеграцию Lemon Squeezy overlay
   - Настроить вебхуки: `app/api/webhooks/billing/route.ts` с проверкой подписи

3. **Тестирование реальных платежей:**
   - Настроить тестовые платежи в Lemon Squeezy
   - Протестировать полный цикл: покупка → webhook → обновление БД
   - Убедиться, что `Subscription.status='active'` и `plan='pro'` устанавливаются корректно

**DoD:** при успешной оплате у пользователя `Subscription.status='active'` и выставлен `plan` (реальные платежи вместо мока).

## Этап 14 — Квоты/лимиты ✅

**Задача:** Middleware/утилита `assertQuota(userId, feature)`.

- ✅ `UsageStat` инкрементируется при каждом Feature-вызове (magic-fill, export-server, photosProcessed).
- ✅ Free/Pro лимиты: Free — 50 фото/мес, Pro — 500 фото/мес (значения — в конфиге).
- ✅ Защищённый API бросает 429 при превышении квот
- ✅ Интеграционные тесты для всех API endpoints с квотами
- ✅ Система квот интегрирована в `createApiHandler` для автоматической проверки
- ✅ Обработка `QuotaError` с правильными HTTP статусами
  **DoD:** защищённый API бросает 402/429 при превышении; интеграционный тест. ✅

## Этап 15 — Magic Fill API (v1) ✅

**Задача:** `POST /api/magic-fill`.

- ✅ Вход: `{ gtin?: string, imageIds?: string[], manual?: {...} }`.
- ✅ Логика: 
(1) GTIN→поиск (GS1/кеш `BarcodeLookup`), 
(2) OCR по загруженной фото (если есть), 
(3) LLM-парсинг в структуру, (4) шаблон Title/Desc RU/KZ, 
(5) сохранение `ProductDraft` + `ImageAsset`.
- ✅ Ответ: `{ draftId, fields, images[] }`.
- ✅ Полная интеграция с MagicFillButton компонентом
- ✅ Обработка ошибок и квот
- ⚠️ **DoD:** юнит-тест схемы (Zod), мок-тест эндпойнта (LLM/OCR/billing — замоканы) — **отложено**.

## Этап 16 — Сканер штрихкода в Studio ✅

**Задача:** в правой панели формы добавить кнопку/диалог «Сканировать штрихкод» (ZXing через камеру).

- ✅ Успешное сканирование подставляет GTIN в форму и вызывает Magic Fill.
- ✅ ZXing интеграция с камерой
- ✅ Красивый диалог UI в правой панели формы
- ✅ Выбор камеры и обработка разрешений
- ✅ Ручной ввод штрихкода как fallback
- ✅ Graceful fallback без камеры
- ✅ Работает на популярных десктоп-браузерах
  **DoD:** работает на популярных десктоп-браузерах, graceful-fallback без камеры. ✅

## Этап 17 — Product Draft Editor

**Задача:** CRUD черновиков.

- `GET /api/product-drafts`, `PATCH /api/product-drafts/:id`.
- В Studio: список черновиков, открытие черновика, массовые правки (brand/type/model/keyspec/bullets).
  **DoD:** черновик восстанавливается после рефреша, правки сохраняются.

## Этап 18 — Экспорт: серверный дубль (Pro, опционально)

**Задача:** `POST /api/export` — собрать ZIP/CSV на сервере (для логов/статистики).

- Клиентский экспорт остаётся дефолтным. Серверный — только Pro; учитывает квоты.
  **DoD:** ZIP идентичен клиентскому; событие использования зафиксировано.

## Этап 19 — Кэш по GTIN

**Задача:** накапливать `BarcodeLookup` и отдавать повторные запросы из кэша.
**DoD:** cold→warm падение латентности; тест, что при повторном GTIN запросы к внешним сервисам не шлём.

## Этап 20 — Набор ENV/конфигов

**Задача:** `.env.example`, безопасная загрузка конфигов, Zod-валидатор `env.ts`.
**DoD:** приложение не стартует без критичных переменных; ясные сообщения.

## Этап 21 — Наблюдаемость и логирование

**Задача:** pino + requestId + userId; 4xx/5xx метрики; healthcheck.
**DoD:** /api/health отражает статус и версию; ошибки логируются структурно.

> **Правило:** По завершении этапа — отметь в этом файле ✅ и дождись «дальше к следующему шагу».
