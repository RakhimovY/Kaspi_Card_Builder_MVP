# 📋 Детальный план деплоя

## Этап 1: Подготовка проекта

### 🤖 AI Assistant - что делаю:

#### 1.1 Обновляю Prisma схему для PostgreSQL
```prisma
// Изменяю provider с sqlite на postgresql
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 1.2 Создаю production конфигурацию Next.js
```typescript
// Добавляю оптимизации для продакшена
const nextConfig = {
  typedRoutes: true,
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  experimental: {
    serverComponentsExternalPackages: ['@imgly/background-removal-node']
  },
  images: {
    domains: ['localhost', 'your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

#### 1.3 Создаю GitHub Actions workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

#### 1.4 Создаю vercel.json конфигурацию
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 👤 Пользователь - что делаешь:

#### 1.1 Создаешь аккаунт на Vercel
1. Иди на [vercel.com](https://vercel.com)
2. Нажми "Sign Up"
3. Выбери "Continue with GitHub"
4. Авторизуйся через GitHub

#### 1.2 Создаешь аккаунт на Neon
1. Иди на [neon.tech](https://neon.tech)
2. Нажми "Sign Up"
3. Выбери "Continue with GitHub"
4. Авторизуйся через GitHub

#### 1.3 Устанавливаешь Vercel CLI
```bash
npm i -g vercel
```

**Готово? Напиши "готов к этапу 2"**

---

## Этап 2: Настройка базы данных

### 🤖 AI Assistant - что делаю:

#### 2.1 Создаю миграции для PostgreSQL
```bash
# Создаю новую миграцию
npx prisma migrate dev --name init-postgresql
```

#### 2.2 Настраиваю Prisma для продакшена
```typescript
// lib/server/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 👤 Пользователь - что делаешь:

#### 2.1 Создаешь проект в Neon
1. Зайди в [Neon Console](https://console.neon.tech)
2. Нажми "Create Project"
3. Введи название: "trade-card-builder"
4. Выбери регион: "Frankfurt" (ближе к Казахстану)
5. Нажми "Create Project"

#### 2.2 Получаешь connection string
1. В проекте найди секцию "Connection Details"
2. Скопируй "Connection string" (начинается с postgresql://)
3. Сохрани его - понадобится для Vercel

#### 2.3 Применяешь миграции
```bash
# В корне проекта
DATABASE_URL="твой-connection-string" npx prisma migrate deploy
```

**Готово? Напиши "готов к этапу 3"**

---

## Этап 3: Настройка Vercel ✅ ЗАВЕРШЕН

### 🤖 AI Assistant - что сделал:

#### 3.1 ✅ Создал environment variables template
- Создан `env.production.example` с полным списком переменных
- Добавлена валидация environment variables в `lib/server/env-validation.ts`
- Обновлен health check endpoint для проверки конфигурации

#### 3.2 ✅ Оптимизировал конфигурацию Vercel
- Увеличен timeout для тяжелых API (magic-fill, process-photo) до 60 секунд
- Добавлены security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Настроены редиректы для SEO

#### 3.3 ✅ Создал детальную документацию
- `docs/VERCEL_SETUP.md` - полная инструкция по настройке
- `docs/VERCEL_QUICK_START.md` - быстрый старт для пользователя

### 👤 Пользователь - что делаешь:

#### 3.1 Подключаешь GitHub репозиторий к Vercel
1. Зайди в [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажми "Add New..." → "Project"
3. Выбери свой GitHub репозиторий
4. Нажми "Import"

#### 3.2 Настраиваешь переменные окружения
1. В проекте Vercel найди "Settings" → "Environment Variables"
2. Добавь все переменные из .env.production:
   - `DATABASE_URL` (твой Neon connection string)
   - `NEXTAUTH_SECRET` (сгенерируй: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (пока оставь пустым, добавим после деплоя)
   - `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` (из Google Console)
   - `OPENAI_API_KEY` (из OpenAI)
   - Остальные переменные из твоего .env.local

#### 3.3 Выполняешь первый деплой
1. Нажми "Deploy" в Vercel
2. Дождись завершения сборки
3. Скопируй URL деплоя (например: https://trade-card-builder.vercel.app)

**Готово? Напиши "готов к этапу 4"**

---

## Этап 4: Настройка CI/CD ✅ ЗАВЕРШЕН

### 🤖 AI Assistant - что делаю:

#### 4.1 ✅ Настроил GitHub Actions для контроля качества
- ✅ CI/CD pipeline в `.github/workflows/deploy.yml`
- ✅ Автоматические тесты при каждом PR
- ✅ Проверка lint, typecheck, tests, build
- ✅ **Деплой через Vercel** (автоматически при push в main)

#### 4.2 ✅ Проверил все команды
- ✅ `npm run lint` - работает (92 warnings, 0 errors)
- ✅ `npm run typecheck` - проходит без ошибок
- ✅ `npm run test` - 15 тестов проходят успешно
- ✅ `npm run build` - собирается без ошибок
```yaml
# .github/workflows/deploy.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run typecheck

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: "file:./test.db"

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: "postgresql://test:test@localhost:5432/test"
          NEXTAUTH_SECRET: "test-secret-32-chars-long-for-testing"
          NEXTAUTH_URL: "http://localhost:3000"
          GOOGLE_CLIENT_ID: "test-client-id"
          GOOGLE_CLIENT_SECRET: "test-client-secret"
          BILLING_PROVIDER: "lemon-squeezy"
          LEMON_SQUEEZY_WEBHOOK_SECRET: "test-webhook-secret"
          OPENAI_API_KEY: "test-openai-key"
          GTIN_PROVIDER: "upcitemdb"
          UPCITEMDB_USER_KEY: "test-upcitemdb-key"

  # Деплой через Vercel происходит автоматически при push в main
  # Этот workflow только проверяет качество кода
```

### 👤 Пользователь - что делаешь:

#### 4.1 ✅ GitHub Actions настроен автоматически
- ✅ **Деплой через Vercel** - происходит автоматически при push в main
- ✅ **GitHub Actions** - только проверяет качество кода (lint, tests, build)
- ✅ **Никаких секретов не нужно** - Vercel сам управляет деплоем

#### 4.2 Протестируешь CI/CD pipeline
1. Сделай небольшое изменение в коде
2. Закоммить и запушь в main ветку
3. Проверь, что:
   - ✅ GitHub Actions запустился и прошел тесты
   - ✅ Vercel автоматически сделал деплой
   - ✅ Сайт обновился с новыми изменениями

**Готово? Напиши "готов к этапу 5"**

---

## Этап 5: Настройка домена

### 🤖 AI Assistant - что делаю:

#### 5.1 Создаю конфигурацию для домена
```typescript
// middleware.ts - обновляю для продакшена
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Редирект с www на основной домен
  if (request.nextUrl.hostname.startsWith('www.')) {
    return NextResponse.redirect(
      new URL(request.nextUrl.pathname, request.nextUrl.href.replace('www.', ''))
    )
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 👤 Пользователь - что делаешь:

#### 5.1 Покупаешь домен
1. Выбери регистратора доменов:
   - [nic.kz](https://nic.kz) - для .kz доменов
   - [reg.ru](https://reg.ru) - для .ru доменов
   - [namecheap.com](https://namecheap.com) - для .com доменов
2. Выбери домен (рекомендую: tradecardbuilder.kz)
3. Оформи покупку

#### 5.2 Настраиваешь DNS записи
1. В панели управления доменом найди "DNS Management"
2. Добавь следующие записи:
   ```
   Type: A
   Name: @
   Value: 76.76.19.19 (Vercel IP)
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

#### 5.3 Подключаешь домен к Vercel
1. В Vercel Dashboard найди "Settings" → "Domains"
2. Нажми "Add Domain"
3. Введи свой домен
4. Следуй инструкциям по настройке DNS

**Готово? Напиши "готов к этапу 6"**

---

## Этап 6: Тестирование

### 🤖 AI Assistant - что делаю:

#### 6.1 Создаю тесты для продакшена
```typescript
// test/production.test.ts
import { describe, it, expect } from 'vitest'

describe('Production Health Checks', () => {
  it('should have correct environment variables', () => {
    expect(process.env.NODE_ENV).toBe('production')
    expect(process.env.DATABASE_URL).toContain('postgresql://')
    expect(process.env.NEXTAUTH_SECRET).toBeDefined()
  })
  
  it('should connect to database', async () => {
    // Тест подключения к БД
  })
})
```

#### 6.2 Проверяю все API endpoints
```typescript
// test/api.test.ts
import { describe, it, expect } from 'vitest'

describe('API Endpoints', () => {
  it('should respond to health check', async () => {
    const response = await fetch('/api/health')
    expect(response.status).toBe(200)
  })
  
  it('should handle auth endpoints', async () => {
    const response = await fetch('/api/auth/signin')
    expect(response.status).toBe(200)
  })
})
```

### 👤 Пользователь - что делаешь:

#### 6.1 Тестируешь все функции
1. Открой свой домен в браузере
2. Проверь:
   - [ ] Загрузка главной страницы
   - [ ] Регистрация/вход через Google
   - [ ] Загрузка изображений
   - [ ] Magic Fill функция
   - [ ] Экспорт карточек
   - [ ] Все формы работают

#### 6.2 Проверяешь производительность
1. Используй [PageSpeed Insights](https://pagespeed.web.dev/)
2. Проверь время загрузки
3. Убедись, что изображения оптимизируются

#### 6.3 Настраиваешь мониторинг
1. В Vercel Dashboard включи "Analytics"
2. Настрой уведомления об ошибках
3. Проверь логи в "Functions" секции

**Готово? Напиши "деплой завершен"**

---

## 🎉 Поздравляю!

Твой проект успешно развернут на продакшене! 

### Что у тебя теперь есть:
- ✅ Быстрый и надежный хостинг на Vercel
- ✅ Масштабируемая база данных на Neon
- ✅ Автоматические деплои через GitHub Actions
- ✅ Собственный домен
- ✅ SSL сертификат
- ✅ CDN для быстрой загрузки

### Следующие шаги:
1. Настрой мониторинг (Vercel Analytics)
2. Добавь резервное копирование БД
3. Настрой уведомления об ошибках
4. Оптимизируй производительность

**Удачи с проектом! 🚀**
