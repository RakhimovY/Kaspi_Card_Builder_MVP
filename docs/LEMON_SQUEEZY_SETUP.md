# Настройка Lemon Squeezy для Trade Card Builder

## Обзор

Lemon Squeezy - это платформа для продажи цифровых продуктов и подписок. Мы используем её для обработки платежей за Pro-подписку.

## Шаг 1: Создание аккаунта

1. Перейдите на [https://app.lemonsqueezy.com](https://app.lemonsqueezy.com)
2. Создайте аккаунт или войдите в существующий
3. Подтвердите email

## Шаг 2: Создание магазина

1. В дашборде нажмите "Create Store"
2. Заполните информацию о магазине:
   - **Store name**: Trade Card Builder
   - **Store URL**: ваш-домен.com
   - **Currency**: USD или KZT (рекомендуется KZT для Казахстана)
3. Нажмите "Create Store"

## Шаг 3: Создание продукта

1. В дашборде магазина нажмите "Create Product"
2. Выберите тип: **Digital Download** или **Subscription**
3. Заполните информацию о продукте:
   - **Product name**: Trade Card Builder Pro
   - **Description**: Профессиональная версия для обработки до 500 фото в месяц
   - **Price**: установите цену (например, $20 или 9000 KZT)
4. Нажмите "Create Product"

## Шаг 4: Получение Product ID и Variant ID

1. После создания продукта вы будете перенаправлены на страницу продукта
2. **Product ID** находится в URL: `https://app.lemonsqueezy.com/product/123456` → ID = `123456`
3. **Variant ID** обычно совпадает с Product ID для простых продуктов
4. Если у вас несколько вариантов, Variant ID будет другим

## Шаг 5: Настройка webhook

1. В настройках магазина перейдите в раздел "Webhooks"
2. Нажмите "Create Webhook"
3. Заполните:
   - **Event**: выберите `order_created`, `subscription_created`, `subscription_updated`, `subscription_cancelled`
   - **URL**: `https://ваш-домен.com/api/webhooks/billing`
   - **Secret**: сгенерируйте случайную строку (минимум 32 символа)
4. Сохраните webhook

## Шаг 6: Получение API ключа

1. В настройках магазина перейдите в раздел "API"
2. Скопируйте ваш API ключ

## Шаг 7: Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```bash
# Lemon Squeezy
LEMON_SQUEEZY_WEBHOOK_SECRET="ваш-webhook-секрет"
LEMON_SQUEEZY_API_KEY="ваш-api-ключ"
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID="ваш-product-id"
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID="ваш-variant-id"
```

## Шаг 8: Тестирование

1. Запустите приложение: `npm run dev`
2. Перейдите на страницу тарифов
3. Нажмите "Оформить Pro"
4. Должен открыться overlay Lemon Squeezy

## Устранение проблем

### Ошибка 404 при checkout

- Убедитесь, что `NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID` установлен правильно
- Проверьте, что продукт опубликован в Lemon Squeezy
- Убедитесь, что у вас есть права на продажу продукта

### Overlay не открывается

- Проверьте консоль браузера на ошибки JavaScript
- Убедитесь, что скрипт Lemon Squeezy загружается
- Проверьте, что все переменные окружения установлены

### Webhook не работает

- Убедитесь, что URL webhook доступен из интернета (используйте ngrok для локальной разработки)
- Проверьте, что `LEMON_SQUEEZY_WEBHOOK_SECRET` совпадает с секретом в настройках
- Проверьте логи сервера на ошибки

## Ngrok для локальной разработки

Для тестирования webhook'ов локально используйте ngrok:

```bash
# Установка ngrok
npm install -g ngrok

# Запуск туннеля
ngrok http 3000

# Используйте полученный URL для webhook'а
# https://abc123.ngrok.io/api/webhooks/billing
```

## Полезные ссылки

- [Lemon Squeezy Dashboard](https://app.lemonsqueezy.com)
- [API Documentation](https://docs.lemonsqueezy.com/api)
- [Webhook Events](https://docs.lemonsqueezy.com/help/webhooks/webhook-events)
- [JavaScript SDK Guide](https://docs.lemonsqueezy.com/help/checkout/checkout-api)

## Проверка конфигурации

После настройки проверьте:

1. **Переменные окружения**:

   ```bash
   echo $NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID
   echo $NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID
   ```

2. **Webhook endpoint**:

   ```bash
   curl -X POST https://ваш-домен.com/api/webhooks/billing \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
   ```

3. **API endpoint**:
   ```bash
   curl https://ваш-домен.com/api/subscription \
     -H "Authorization: Bearer ваш-токен"
   ```

## Безопасность

- Никогда не коммитьте `.env.local` в git
- Используйте HTTPS для webhook'ов в продакшене
- Регулярно обновляйте webhook секреты
- Ограничьте доступ к API ключам
