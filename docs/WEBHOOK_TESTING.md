# Webhook Testing Guide

## Lemon Squeezy Webhook Testing

### 1. Настройка тестового окружения

Убедитесь, что у вас настроены следующие переменные окружения:

```bash
# .env
BILLING_PROVIDER="lemon-squeezy"
LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
LEMON_SQUEEZY_API_KEY="your-api-key"
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID="your-product-id"
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID="your-variant-id"
```

### 2. Тестирование webhook endpoint

#### Локальное тестирование

1. **Запустите приложение:**

   ```bash
   npm run dev
   ```

2. **Тест без подписи (должен вернуть 401):**

   ```bash
   curl -X POST http://localhost:3000/api/webhooks/billing \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
   ```

3. **Тест с правильной подписью:**
   ```bash
   node scripts/test-webhook.js
   ```

#### Тестирование через ngrok

1. **Webhook URL для Lemon Squeezy:**

   ```
   https://abbcfd0cdc8e.ngrok-free.app/api/webhooks/billing
   ```

2. **В Lemon Squeezy Dashboard:**
   - Перейдите в Store Settings → Webhooks
   - Добавьте webhook URL
   - Выберите события для отслеживания:
     - `subscription_created`
     - `subscription_updated`
     - `subscription_cancelled`
     - `subscription_expired`
     - `subscription_paused`
     - `subscription_resumed`
     - `subscription_payment_failed`

### 3. Тестовые данные

#### Webhook Payload Structure

```json
{
  "meta": {
    "event_name": "subscription_created",
    "custom_data": {}
  },
  "data": {
    "id": "test-sub-123",
    "type": "subscriptions",
    "attributes": {
      "store_id": 12345,
      "customer_id": 67890,
      "product_id": 111,
      "variant_id": 222,
      "product_name": "Trade Card Builder Pro",
      "variant_name": "Monthly",
      "status": "active",
      "status_formatted": "Active",
      "trial_ends_at": null,
      "renews_at": "2024-10-02T00:00:00.000000Z",
      "ends_at": null,
      "created_at": "2024-10-02T00:00:00.000000Z",
      "updated_at": "2024-10-02T00:00:00.000000Z",
      "test_mode": true
    },
    "relationships": {
      "store": {
        "data": {
          "id": "12345",
          "type": "stores"
        }
      },
      "customer": {
        "data": {
          "id": "67890",
          "type": "customers"
        }
      }
    }
  }
}
```

### 4. Проверка работы webhook

#### Логи

Webhook логируются через pino logger. Проверьте консоль сервера для отладочной информации:

```json
{
  "level": "info",
  "message": "Webhook received",
  "signature": true,
  "requestId": "uuid",
  "endpoint": "webhooks/billing"
}
```

#### База данных

После успешной обработки webhook'а проверьте:

1. **Создание пользователя:**

   ```sql
   SELECT * FROM User WHERE lemonSqueezyCustomerId = '67890';
   ```

2. **Создание подписки:**
   ```sql
   SELECT * FROM Subscription WHERE providerId = 'test-sub-123';
   ```

### 5. Тестирование Lemon Squeezy Overlay

#### В браузере

1. Откройте `/` (landing page)
2. Нажмите "Оформить Pro" в секции Pricing
3. Должен открыться Lemon Squeezy overlay

#### Fallback

Если overlay не работает, пользователь будет перенаправлен на Lemon Squeezy checkout страницу.

### 6. Отладка

#### Common Issues

1. **401 Unauthorized:**

   - Проверьте `LEMON_SQUEEZY_WEBHOOK_SECRET`
   - Убедитесь, что подпись передается в заголовке `x-signature`

2. **500 Internal Server Error:**

   - Проверьте логи сервера
   - Убедитесь, что база данных доступна
   - Проверьте Prisma схему

3. **Overlay не открывается:**
   - Проверьте `NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID`
   - Убедитесь, что Lemon Squeezy script загружается

#### Логирование

Все webhook операции логируются с `requestId` для трассировки:

```json
{
  "level": "info",
  "message": "Processing Lemon Squeezy webhook",
  "eventName": "subscription_created",
  "subscriptionId": "test-sub-123",
  "status": "active",
  "requestId": "uuid",
  "endpoint": "webhooks/billing"
}
```

### 7. Production Checklist

- [ ] `LEMON_SQUEEZY_WEBHOOK_SECRET` установлен в production
- [ ] `LEMON_SQUEEZY_API_KEY` установлен в production
- [ ] Webhook URL обновлен на production домен
- [ ] SSL сертификат валиден
- [ ] Rate limiting настроен
- [ ] Мониторинг webhook'ов настроен
