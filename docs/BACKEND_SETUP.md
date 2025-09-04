# Backend Setup Guide

## Обзор

Бэкенд Trade Card Builder построен на Next.js API Routes с использованием:

- **Prisma** + PostgreSQL для базы данных
- **NextAuth** для аутентификации (Google OAuth)
- **Zod** для валидации данных
- **Pino** для структурированного логирования
- **Система квот** для Free/Pro пользователей

## Требования

- Node.js ≥ 20
- PostgreSQL (локально или в облаке)
- Google OAuth credentials
- OpenAI API key (для Magic Fill)

## Установка и настройка

### 1. Переменные окружения

Скопируйте `env.example` в `.env.local` и заполните:

```bash
# База данных
DATABASE_URL="postgresql://username:password@localhost:5432/trade_card_builder"

# NextAuth
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Billing (опционально)
BILLING_PROVIDER="lemon-squeezy"
LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
```

### 2. База данных

```bash
# Создать базу данных
createdb trade_card_builder

# Применить миграции
npm run prisma:migrate

# Открыть Prisma Studio
npm run prisma:studio
```

### 3. Генерация Prisma клиента

```bash
npm run prisma:generate
```

## Структура API

### Аутентификация

- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Основные API

- `POST /api/magic-fill` - Автозаполнение формы по GTIN/OCR/LLM
- `GET/POST /api/product-drafts` - CRUD черновиков продуктов
- `POST /api/export` - Серверный экспорт (только Pro)

### Webhooks

- `POST /api/webhooks/billing` - Обработка платежей

### Мониторинг

- `GET /api/health` - Проверка состояния системы

## Модели данных

### User

- Основная модель пользователя (NextAuth)
- Связи: subscriptions, usageStats, productDrafts, imageAssets

### Subscription

- Подписки на тарифные планы
- Статусы: active, canceled, past_due, unpaid

### UsageStat

- Статистика использования по месяцам
- Отслеживание: magicFill, photosProcessed, export

### ProductDraft

- Черновики продуктов с RU/KZ локализацией
- Связи с изображениями и штрихкодами

### ImageAsset

- Метаданные изображений
- Источники: upload, web, ai, composite

### BarcodeLookup

- Кэш поиска по GTIN
- Источники: gs1, cache, manual

## Система квот

```typescript
// Проверка квоты перед операцией
await assertQuota(userId, "magicFill");

// Увеличение счетчика использования
await incrementUsage(userId, "magicFill");
```

### Лимиты по планам

- **Free**: 50 фото/мес, 10 Magic Fill/мес, 5 экспортов/мес
- **Pro**: 500 фото/мес, 100 Magic Fill/мес, 50 экспортов/мес

## Разработка

### Запуск

```bash
npm run dev          # Разработка
npm run build        # Сборка
npm run start        # Продакшн
```

### Тестирование

```bash
npm run test         # Запуск тестов
npm run test:ui      # UI для тестов
npm run test:coverage # Покрытие кода
```

### Линтинг и типы

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript проверка
```

### Prisma команды

```bash
npm run prisma:generate  # Генерация клиента
npm run prisma:migrate   # Миграции
npm run prisma:studio    # GUI для БД
npm run prisma:db:push   # Push схемы (dev)
```

## Логирование

Все API endpoints используют структурированное логирование:

```typescript
const log = logger.child({ requestId, endpoint: "magic-fill" });
log.info({ message: "Request processed", userId, gtin });
log.error({ error: "Processing failed", details });
```

## Безопасность

- Все секреты хранятся в `process.env`
- API endpoints защищены NextAuth сессиями
- Webhook подписи проверяются
- Квоты применяются ко всем операциям

## Мониторинг

Health endpoint `/api/health` проверяет:

- Подключение к базе данных
- Конфигурацию сервисов
- Статус аутентификации и биллинга

## Следующие шаги

1. **Интеграция с реальными сервисами**:

   - GS1 API для GTIN lookup
   - OCR провайдер (Tesseract.js или облачный)
   - LLM провайдер (OpenAI, Anthropic)

2. **Биллинг**:

   - Lemon Squeezy/Paddle/Polar интеграция
   - Webhook обработка
   - Управление подписками

3. **Хранилище**:

   - Объектное хранилище для Pro изображений
   - Signed URLs с TTL
   - Автоматическая очистка

4. **Производительность**:
   - Кэширование Redis
   - Очереди для тяжелых операций
   - CDN для статических ресурсов
