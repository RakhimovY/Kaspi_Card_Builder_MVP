# 🚀 Настройка Vercel для деплоя

## Этап 3: Настройка Vercel

### 🤖 AI Assistant - что делаю:

#### 3.1 Оптимизирую конфигурацию Vercel
- ✅ Увеличил timeout для тяжелых API (magic-fill, process-photo) до 60 секунд
- ✅ Добавил security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- ✅ Настроил редиректы для SEO

#### 3.2 Создаю валидацию environment variables
```typescript
// lib/server/env-validation.ts
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  BILLING_PROVIDER: z.enum(['lemon-squeezy', 'paddle', 'polar']),
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(1),
  LEMON_SQUEEZY_API_KEY: z.string().min(1),
  NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: z.string().min(1),
  NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID: z.string().min(1),
  GTIN_PROVIDER: z.enum(['upcitemdb', 'barcodelookup']),
  UPCITEMDB_USER_KEY: z.string().min(1),
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production']),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
})

export const env = envSchema.parse(process.env)
```

### 👤 Пользователь - что делаешь:

#### 3.1 Подключаешь GitHub репозиторий к Vercel

1. **Зайди в Vercel Dashboard**
   - Открой [vercel.com/dashboard](https://vercel.com/dashboard)
   - Нажми "Add New..." → "Project"

2. **Импортируй репозиторий**
   - Выбери свой GitHub репозиторий `Kaspi_Card_Builder_MVP`
   - Нажми "Import"

3. **Настрой проект**
   - Framework Preset: **Next.js** (должен определиться автоматически)
   - Root Directory: `./` (по умолчанию)
   - Build Command: `npm run build` (по умолчанию)
   - Output Directory: `.next` (по умолчанию)
   - Install Command: `npm ci` (по умолчанию)

#### 3.2 Настраиваешь переменные окружения

1. **Открой Environment Variables**
   - В проекте Vercel найди "Settings" → "Environment Variables"
   - Нажми "Add New"

2. **Добавь все переменные из env.production.example:**

   **Обязательные переменные:**
   ```
   DATABASE_URL = postgresql://username:password@host:port/database
   NEXTAUTH_SECRET = your-32-character-secret-here
   NEXTAUTH_URL = https://your-domain.vercel.app (пока оставь пустым)
   GOOGLE_CLIENT_ID = your-google-client-id
   GOOGLE_CLIENT_SECRET = your-google-client-secret
   OPENAI_API_KEY = your-openai-api-key
   BILLING_PROVIDER = lemon-squeezy
   LEMON_SQUEEZY_WEBHOOK_SECRET = your-webhook-secret
   LEMON_SQUEEZY_API_KEY = your-api-key
   NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID = your-product-id
   NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID = your-variant-id
   GTIN_PROVIDER = upcitemdb
   UPCITEMDB_USER_KEY = your-upcitemdb-user-key
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN = your-domain.vercel.app
   NODE_ENV = production
   LOG_LEVEL = info
   ```

3. **Генерируй NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

4. **Установи Environment для всех переменных:**
   - Выбери "Production" для всех переменных
   - Некоторые переменные (NEXT_PUBLIC_*) будут доступны и в Preview

#### 3.3 Выполняешь первый деплой

1. **Запусти деплой**
   - Нажми "Deploy" в Vercel
   - Дождись завершения сборки (обычно 2-3 минуты)

2. **Проверь результат**
   - Скопируй URL деплоя (например: `https://kaspi-card-builder-mvp.vercel.app`)
   - Открой его в браузере
   - Убедись, что сайт загружается

3. **Обнови NEXTAUTH_URL**
   - Вернись в Environment Variables
   - Обнови `NEXTAUTH_URL` на твой реальный URL деплоя
   - Запусти новый деплой

#### 3.4 Проверяешь функциональность

1. **Тестируй основные функции:**
   - [ ] Загрузка главной страницы
   - [ ] Переход в Studio
   - [ ] Загрузка изображений
   - [ ] Magic Fill (может не работать без API ключей)
   - [ ] Экспорт карточек

2. **Проверь логи:**
   - В Vercel Dashboard → "Functions"
   - Посмотри логи API endpoints
   - Убедись, что нет критических ошибок

#### 3.5 Настраиваешь автоматические деплои

1. **Проверь настройки Git**
   - В Vercel Dashboard → "Settings" → "Git"
   - Убедись, что подключен правильный репозиторий
   - Branch для Production: `main`

2. **Протестируй автоматический деплой**
   - Сделай небольшое изменение в коде
   - Закоммить и запушь в main ветку
   - Проверь, что Vercel автоматически запустил деплой

### 🔧 Дополнительные настройки

#### Performance Optimization
- В Vercel Dashboard → "Settings" → "Functions"
- Убедись, что "Edge Functions" включены для статических страниц

#### Analytics
- В Vercel Dashboard → "Settings" → "Analytics"
- Включи "Web Analytics" для отслеживания производительности

#### Monitoring
- В Vercel Dashboard → "Functions"
- Настрой уведомления об ошибках
- Проверь логи регулярно

### ⚠️ Важные моменты

1. **Не коммить .env файлы** - все секреты только в Vercel Environment Variables
2. **Проверь все API ключи** - убедись, что они работают в продакшене
3. **Тестируй после каждого деплоя** - особенно критичные функции
4. **Мониторь логи** - следи за ошибками и производительностью

### 🎯 Следующий шаг

После успешного деплоя на Vercel переходи к **Этапу 4: Настройка CI/CD** для автоматизации процесса.

**Готово? Напиши "готов к этапу 4"**
