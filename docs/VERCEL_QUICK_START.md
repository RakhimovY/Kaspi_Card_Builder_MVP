# 🚀 Быстрый старт: Настройка Vercel

## Что нужно сделать:

### 1. Подключи GitHub к Vercel
1. Иди на [vercel.com/dashboard](https://vercel.com/dashboard)
2. Нажми "Add New..." → "Project"
3. Выбери репозиторий `Kaspi_Card_Builder_MVP`
4. Нажми "Import"

### 2. Настрой Environment Variables
В Vercel Dashboard → Settings → Environment Variables добавь:

**Обязательные:**
```
DATABASE_URL = postgresql://username:password@host:port/database
NEXTAUTH_SECRET = openssl rand -base64 32
NEXTAUTH_URL = https://your-project.vercel.app
GOOGLE_CLIENT_ID = your-google-client-id
GOOGLE_CLIENT_SECRET = your-google-client-secret
OPENAI_API_KEY = your-openai-api-key
LEMON_SQUEEZY_WEBHOOK_SECRET = your-webhook-secret
LEMON_SQUEEZY_API_KEY = your-api-key
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID = your-product-id
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID = your-variant-id
UPCITEMDB_USER_KEY = your-upcitemdb-user-key
NEXT_PUBLIC_PLAUSIBLE_DOMAIN = your-project.vercel.app
NODE_ENV = production
LOG_LEVEL = info
```

### 3. Запусти деплой
1. Нажми "Deploy" в Vercel
2. Дождись завершения (2-3 минуты)
3. Скопируй URL деплоя
4. Обнови `NEXTAUTH_URL` на реальный URL
5. Запусти новый деплой

### 4. Проверь работу
- Открой URL деплоя
- Проверь `/api/health` - должен показать статус всех сервисов
- Протестируй основные функции

## Готово! 🎉

Теперь у тебя есть:
- ✅ Автоматические деплои при push в main
- ✅ SSL сертификат
- ✅ CDN для быстрой загрузки
- ✅ Мониторинг и логи

**Следующий шаг:** Настройка CI/CD для автоматизации тестов
