# Trade Card Builder — Project Brief (v2)

## Цель проекта

Сделать self-serve инструмент, который готовит **пакет для карточек Kaspi** за 2–3 минуты и теперь поддерживает **аккаунты, подписки, квоты и Magic Fill** (скан штрихкода + авто-заполнение полей + черновики в БД).

## Ключевые возможности

1. **Photo Fixer (клиент):** удаление фона (WASM), ресайз/сжатие, проверка правил (500–5000 px; ≤25 MB; JPEG/PNG/WebP), EXIF-strip.
2. **Title & Description Helper:** шаблон из Brand/Type/Model/Key spec; краткие буллеты; RU/KZ.
3. **Category Checklist:** пресеты для модерации по категории.
4. **Export:** ZIP (`/images/<SKU>_1.jpg…`) + CSV + README. Импорт в Kaspi через Excel/CSV.
5. **Accounts & Billing:** вход Google, тарифы Free/Pro, MoR-платежи (Lemon Squeezy/Paddle/Polar), квоты/лимиты.
6. **Magic Fill:** штрихкод (GTIN) + OCR/LLM → автозаполнение формы и создание **Product Draft** в БД. Кэш по GTIN.

## Почему это нужно

Карточки на Kaspi требуют качества фото/контента, а ручной процесс медленный и ошибкоопасный. Мы сокращаем клики и ошибки, повышаем конверсию модерации.

## Профиль пользователя

- Малый/средний продавец (50–1000 SKU), контент-менеджер. Работает с ноутбука/ПК.

## KPI v2

- Time-to-first-upload: < 15 минут.
- 10–20 карточек/час у нового пользователя.
- Free→Pro конверсия ≥ 5%.
- **Precision Magic Fill**: ≥ 80% автозаполнения базовых полей при наличии GTIN.

## Объём v2

- **Frontend-first** сохраняется: фото-пайплайн и экспорт остаются на клиенте.
- **Backend минимальный**: учетные записи, биллинг (вебхуки), квоты, Magic Fill, хранение черновиков и активов.

## Архитектура

- Next.js (App Router, TS). API Routes: `auth`, `billing/webhooks`, `magic-fill`, `export` (опц.), `health`.
- БД: Postgres (Prisma). Модели:
  - `User`, `Account` (NextAuth), `Session` (JWT use),
  - `Subscription` { provider, plan, status, currentPeriodEnd, customerId },
  - `UsageStat` { userId, periodYM, magicFillCount, photosProcessed },
  - `ProductDraft` { sku, brand, type, model, keySpec, titleRU, titleKZ, descRU, descKZ, category, attributesJson },
  - `ImageAsset` { draftId, source('upload'|'web'|'ai'|'composite'), width, height, bytes, hash, licenseNote },
  - `BarcodeLookup` { gtin, source, brand, name, model, rawJson }.
- Billing: MoR hosted checkout + webhooks → обновление `Subscription`.
- Логи: pino/structured. Аналитика: Plausible.

## Потоки

1. **Onboarding**: Landing → Google Sign-In → Pricing → /studio.
2. **Studio**: Drop images → авто-обработка → форма → чек-лист → Export ZIP/CSV (Free/Pro лимиты).
3. **Magic Fill**: Скан GTIN → `POST /api/magic-fill` → предзаполненная форма + сохранённый черновик → правки → Export.
4. **Billing**: Checkout → webhook → `Subscription` активен → повышенные квоты.

## Не-цели

- Автоматическая загрузка в Kaspi кабинет (сейчас вручную).
- Генеративные рендеры, которые вводят в заблуждение (риски модерации).
- Глубокий учёт/ERP.

## Безопасность

- Ключи/модели/LLM — только на сервере. Вебхуки с проверкой подписи. Idempotency-ключи.
- Фото Free — не покидают устройство. Pro-хранилище (объектка) — через signed URLs + авто-удаление TTL.

## Планы после v2

- Очередь для пакетной серверной обработки (BullMQ + Upstash Redis).
- XLSX-шаблон Kaspi и валидатор перед импортом.
- Дополнительные категории/пресеты; улучшение OCR и парсинга.
