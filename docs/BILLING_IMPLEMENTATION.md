# Billing Implementation - Этап 13

## Обзор

Этап 13 реализует полноценную интеграцию с Lemon Squeezy для обработки платежей и управления подписками через overlay и webhook систему.

## Архитектура

### 1. Lemon Squeezy Overlay

**Файл:** `src/app/landing/page.tsx`

- Интеграция с Lemon Squeezy JavaScript SDK
- Overlay для оформления подписки Pro
- Fallback на redirect checkout страницу
- Callback'и для обработки успешной оплаты и закрытия

**Конфигурация:**

```typescript
createLemonSqueezy({
  productId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID,
  variantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID,
  name: "Trade Card Builder Pro",
  successCallback: (data) => {
    /* redirect to studio */
  },
  closedCallback: () => {
    /* reset loading state */
  },
  loadingCallback: (loading) => {
    /* update UI state */
  },
});
```

### 2. Webhook Endpoint

**Файл:** `src/app/api/webhooks/billing/route.ts`

- Валидация подписи Lemon Squeezy (HMAC SHA256)
- Обработка webhook событий:
  - `subscription_created` - создание подписки
  - `subscription_updated` - обновление подписки
  - `subscription_cancelled` - отмена подписки
  - `subscription_expired` - истечение подписки
  - `subscription_paused` - приостановка подписки
  - `subscription_resumed` - возобновление подписки
  - `subscription_payment_failed` - неудачный платеж

**Безопасность:**

- Проверка подписи через `x-signature` заголовок
- Валидация payload через Zod схемы
- Логирование всех операций с requestId

### 3. Lemon Squeezy API Integration

**Файл:** `src/lib/server/lemonsqueezy.ts`

- Класс `LemonSqueezyAPI` для работы с REST API
- Методы:
  - `getCustomer(customerId)` - получение информации о клиенте
  - `getSubscription(subscriptionId)` - получение информации о подписке
  - `listSubscriptions(customerId)` - список подписок клиента

**Использование:**

```typescript
import { lemonSqueezyAPI } from "@/lib/server/lemonsqueezy";

const customer = await lemonSqueezyAPI.getCustomer(12345);
const subscriptions = await lemonSqueezyAPI.listSubscriptions(12345);
```

### 4. Database Schema

**Файл:** `prisma/schema.prisma`

**Обновления:**

- `User.lemonSqueezyCustomerId` - связь с внешним customer ID
- `Subscription` модель для хранения подписок
- `UsageStat` для отслеживания использования

**Миграция:**

```bash
npx prisma migrate dev --name add_lemon_squeezy_customer_id
```

### 5. Subscription API

**Файл:** `src/app/api/subscription/route.ts`

- GET `/api/subscription` - информация о подписке пользователя
- Аутентификация через NextAuth
- Возвращает:
  - Текущий план (free/pro)
  - Статус подписки
  - Лимиты использования
  - Текущее использование
  - Детали подписки

### 6. Subscription Info Component

**Файл:** `src/components/SubscriptionInfo.tsx`

- Отображение статуса подписки
- Прогресс-бары использования
- Кнопка обновления до Pro
- Детали подписки и следующего списания

## Конфигурация

### Environment Variables

```bash
# Billing Provider
BILLING_PROVIDER="lemon-squeezy"

# Lemon Squeezy
LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
LEMON_SQUEEZY_API_KEY="your-api-key"
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID="your-product-id"
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID="your-variant-id"
```

### Webhook URL

```
https://your-domain.com/api/webhooks/billing
```

## Поток данных

### 1. Оформление подписки

1. Пользователь нажимает "Оформить Pro"
2. Открывается Lemon Squeezy overlay
3. Пользователь вводит данные и оплачивает
4. Lemon Squeezy отправляет webhook на наш endpoint
5. Webhook создает/обновляет пользователя и подписку
6. Пользователь перенаправляется в studio

### 2. Обработка webhook'а

1. Получение webhook payload
2. Валидация подписи
3. Парсинг и валидация данных
4. Поиск/создание пользователя по email
5. Обновление/создание подписки
6. Логирование результата

### 3. Управление квотами

1. API endpoint `/api/subscription` возвращает лимиты
2. Компонент `SubscriptionInfo` отображает прогресс
3. Логика приложения проверяет лимиты перед операциями

## Система квот

### Free Plan

- Фото: 50/месяц
- Magic Fill: 10/месяц
- Экспорты: 5/месяц

### Pro Plan

- Фото: 500/месяц
- Magic Fill: 100/месяц
- Экспорты: 50/месяц

## Тестирование

### Локальное тестирование

1. **Webhook без подписи:**

   ```bash
   curl -X POST http://localhost:3000/api/webhooks/billing \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
   # Ожидается: 401 Unauthorized
   ```

2. **Webhook с подписью:**
   ```bash
   node scripts/test-webhook.js
   ```

### Тестирование через ngrok

1. Настройте ngrok для локального порта 3000
2. Обновите webhook URL в Lemon Squeezy Dashboard
3. Протестируйте реальные платежи

## Мониторинг и логирование

### Логирование

Все операции логируются через pino logger с контекстом:

- `requestId` - уникальный ID для трассировки
- `endpoint` - endpoint API
- `userId` - ID пользователя
- `subscriptionId` - ID подписки

### Метрики

- Количество webhook'ов
- Успешность обработки
- Время обработки
- Ошибки валидации

## Безопасность

### Webhook Security

- HMAC SHA256 подпись
- Timing-safe сравнение подписей
- Валидация payload через Zod
- Rate limiting (планируется)

### API Security

- Аутентификация через NextAuth
- Проверка сессии для protected endpoints
- Валидация входных данных

## Production Checklist

- [ ] SSL сертификат настроен
- [ ] Webhook secret обновлен
- [ ] API key обновлен
- [ ] Product/Variant ID настроены
- [ ] Мониторинг настроен
- [ ] Rate limiting настроен
- [ ] Backup webhook endpoint настроен

## Troubleshooting

### Common Issues

1. **Webhook возвращает 401:**

   - Проверьте `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - Убедитесь, что подпись передается в `x-signature`

2. **Overlay не открывается:**

   - Проверьте `NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID`
   - Убедитесь, что Lemon Squeezy script загружается

3. **Ошибки в базе данных:**
   - Проверьте Prisma схему
   - Убедитесь, что миграции применены

### Debug Mode

В development режиме включено детальное логирование:

- Webhook payload
- Подпись и валидация
- Операции с базой данных
- Ошибки и исключения

## Следующие шаги

1. **Rate Limiting** - добавить ограничения на webhook endpoint
2. **Retry Logic** - обработка временных сбоев
3. **Webhook Queue** - асинхронная обработка через очередь
4. **Analytics** - отслеживание конверсии и churn
5. **Email Notifications** - уведомления об изменениях подписки
6. **Billing Portal** - управление подпиской пользователем
