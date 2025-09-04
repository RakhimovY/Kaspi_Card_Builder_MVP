# Ngrok Setup Guide для правильной работы редиректов

## Проблема

При использовании ngrok для тестирования webhook'ов возникают проблемы с редиректами:
1. **После входа выбрасывает на localhost** вместо ngrok домена
2. **Редиректы не учитывают текущий домен** (ngrok vs localhost)

## Решение

### 1. Настройка Environment Variables

Добавьте в ваш `.env` файл:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="https://abbcfd0cdc8e.ngrok-free.app"
NEXTAUTH_NGROK_URL="https://abbcfd0cdc8e.ngrok-free.app"

# Billing Configuration
BILLING_PROVIDER="lemon-squeezy"
LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
LEMON_SQUEEZY_API_KEY="your-api-key"
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID="your-product-id"
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID="your-variant-id"
```

### 2. Запуск ngrok

```bash
# Запустите ngrok для порта 3000
ngrok http 3000

# Скопируйте полученный URL (например: https://abbcfd0cdc8e.ngrok-free.app)
```

### 3. Настройка NextAuth

#### Для ngrok домена:
```bash
NEXTAUTH_URL="https://abbcfd0cdc8e.ngrok-free.app"
```

#### Для localhost:
```bash
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Тестирование

#### 1. Запустите приложение:
```bash
npm run dev
```

#### 2. Откройте ngrok URL:
```
https://abbcfd0cdc8e.ngrok-free.app
```

#### 3. Попробуйте войти через Google:
- Должен открыться Google OAuth
- После входа должен остаться на ngrok домене
- Не должно быть редиректа на localhost

### 5. Отладка редиректов

#### Проверьте в Console:

```javascript
// Должно показывать ngrok домен
console.log('Current origin:', window.location.origin)

// Проверьте environment variables
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
```

#### Проверьте Network tab:
- Google OAuth redirect должен вести на ngrok домен
- Callback URL должен быть правильным

### 6. Если редиректы все еще не работают

#### Вариант 1: Принудительная настройка через код (РЕКОМЕНДУЕТСЯ)

Мы создали специальные утилиты для принудительного использования ngrok URL:

```typescript
// В src/lib/utils/force-ngrok.ts
export function forceNgrokUrl(url: string): string
export function forceNgrokRedirect(url: string, baseUrl: string): string
export function getForcedBaseUrl(): string
```

Эти утилиты автоматически заменяют localhost на ngrok URL в development режиме.

#### Вариант 2: Ручная настройка

В `src/lib/server/nextauth-url.ts`:

```typescript
export function getNextAuthUrl(): string {
  // Принудительно используем ngrok для тестирования
  if (process.env.NODE_ENV === 'development') {
    return 'https://abbcfd0cdc8e.ngrok-free.app'
  }
  
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}
```

#### Вариант 2: Проверка через middleware

Создайте `src/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  
  // Логируем для отладки
  console.log('Middleware - Host:', host)
  console.log('Middleware - URL:', request.url)
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/auth/:path*'
}
```

### 7. Проверка webhook'ов

#### 1. В Lemon Squeezy Dashboard:
- Webhook URL: `https://abbcfd0cdc8e.ngrok-free.app/api/webhooks/billing`
- Events: все subscription события

#### 2. Тестирование webhook:
```bash
# Тест без подписи (должен вернуть 401)
curl -X POST https://abbcfd0cdc8e.ngrok-free.app/api/webhooks/billing \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Тест с подписью
node scripts/test-webhook.js
```

### 8. Production Checklist

- [ ] NEXTAUTH_URL настроен правильно
- [ ] Webhook URL обновлен на production домен
- [ ] SSL сертификат валиден
- [ ] CORS настроен правильно
- [ ] Тестирование проведено

### 9. Troubleshooting

#### Проблема: "Invalid redirect_uri"

**Решение:**
1. В Google OAuth Console добавьте ngrok домен:
   ```
   https://abbcfd0cdc8e.ngrok-free.app/api/auth/callback/google
   ```

2. Обновите NEXTAUTH_URL в .env

#### Проблема: "Callback URL mismatch"

**Решение:**
1. Проверьте NEXTAUTH_URL в .env
2. Убедитесь, что он совпадает с доменом в браузере
3. Перезапустите приложение

#### Проблема: "Session not found"

**Решение:**
1. Проверьте NEXTAUTH_SECRET
2. Убедитесь, что cookies работают на ngrok домене
3. Проверьте secure и sameSite настройки cookies

### 10. Полезные команды

```bash
# Проверка environment variables
npm run typecheck

# Запуск с отладкой
NODE_ENV=development DEBUG=* npm run dev

# Проверка webhook endpoint
curl -v https://abbcfd0cdc8e.ngrok-free.app/api/health

# Тестирование утилит редиректа
node scripts/test-redirects.js
```

### 11. Новые утилиты для редиректов

Мы создали специальные утилиты для автоматического исправления редиректов:

#### `forceNgrokUrl(url: string)`
Принудительно заменяет localhost на ngrok URL

#### `forceNgrokRedirect(url: string, baseUrl: string)`
Специально для NextAuth redirect callback

#### `getForcedBaseUrl()`
Возвращает принудительный ngrok URL в development режиме

#### Использование:
```typescript
import { forceNgrokUrl } from '@/lib/utils/force-ngrok'

// Автоматически заменит localhost на ngrok
const callbackUrl = forceNgrokUrl('/studio')
```

### 11. Мониторинг

#### Логи NextAuth:
```typescript
// В auth-config.ts
debug: process.env.NODE_ENV === 'development'
```

#### Логи webhook'ов:
```typescript
// В webhook route
log.info({ message: 'Webhook received', host: request.headers.get('host') })
```

### 12. Альтернативные решения

Если проблемы продолжаются:

1. **Используйте только localhost для разработки**
2. **Настройте ngrok через конфигурационный файл**
3. **Используйте другие туннели (localtunnel, serveo)**

### 13. Полезные ссылки

- [Ngrok Documentation](https://ngrok.com/docs)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
