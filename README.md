# Trade Card Builder MVP

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local` и заполните:

```bash
# Обязательные переменные для работы
DATABASE_URL="postgresql://username:password@localhost:5432/trade_card_builder"
NEXTAUTH_SECRET="your-32-character-secret-here"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Для Lemon Squeezy (billing)
NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID="your-product-id"
NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID="your-variant-id"
LEMON_SQUEEZY_WEBHOOK_SECRET="your-webhook-secret"
LEMON_SQUEEZY_API_KEY="your-api-key"
```

### 3. Настройка базы данных

```bash
# Переключение на SQLite для разработки
./scripts/switch-db.sh sqlite

# Или на PostgreSQL
./scripts/switch-db.sh postgres

# Применение миграций
npx prisma migrate dev
npx prisma generate
```

### 4. Запуск

```bash
npm run dev
```

## 📚 Документация

- [Project Brief](docs/PROJECT_BRIEF.md) - Описание проекта
- [Code Rules](docs/CODE_RULES.md) - Правила кодирования
- [API Documentation](docs/API.md) - API endpoints
- [Lemon Squeezy Setup](docs/LEMON_SQUEEZY_SETUP.md) - Настройка billing
- [Database Setup](docs/DATABASE_SETUP.md) - Настройка БД

## 🔧 Настройка Lemon Squeezy

**Важно:** Для работы billing системы необходимо настроить Lemon Squeezy:

1. Создайте аккаунт на [https://app.lemonsqueezy.com](https://app.lemonsqueezy.com)
2. Создайте продукт "Trade Card Builder Pro"
3. Скопируйте Product ID и Variant ID в `.env.local`
4. Настройте webhook на `/api/webhooks/billing`

Подробная инструкция: [docs/LEMON_SQUEEZY_SETUP.md](docs/LEMON_SQUEEZY_SETUP.md)

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Проверка типов
npm run typecheck

# Линтинг
npm run lint
```

Профессиональные карточки товаров для Kaspi Marketplace

## 🚀 Быстрый старт

1. **Клонируйте репозиторий**

   ```bash
   git clone <repository-url>
   cd Trade_Card_Builder_MVP
   ```

2. **Установите зависимости**

   ```bash
   npm install
   ```

3. **Настройте переменные окружения**

   ```bash
   cp .env.example .env.local
   ```

   Отредактируйте `.env.local`:

   ```env
   # Plausible Analytics
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=your-domain.com

   # App Configuration
   NEXT_PUBLIC_APP_NAME=Trade Card Builder
   ```

4. **Запустите проект**

   ```bash
   npm run dev
   ```

5. **Откройте в браузере**
   ```
   http://localhost:3000
   ```

## 📊 Настройка Plausible Analytics

1. Зарегистрируйтесь на [plausible.io](https://plausible.io)
2. Добавьте ваш домен в Plausible
3. Скопируйте домен в переменную `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

## 🌐 Локализация

Проект поддерживает две локали:

- **RU** (по умолчанию) - Русский
- **KZ** - Казахский

Переключение языка доступно на странице лендинга через компонент LanguageSwitcher с динамическим переводом без перезагрузки страницы.

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── landing/           # Лендинг страница с динамическим переводом
│   ├── studio/            # Студия для обработки файлов
│   └── page.tsx           # Главная страница (редирект на /landing)
├── components/            # React компоненты
│   ├── ui/               # shadcn/ui компоненты
│   └── LanguageSwitcher.tsx # Переключатель языка
└── lib/                  # Утилиты и библиотеки
    ├── analytics.ts      # Plausible аналитика
    └── store.ts          # Zustand store
```

## 🛠 Технологии

- **Next.js 15** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **shadcn/ui** - UI компоненты
- **Zustand** - Управление состоянием
- **Plausible** - Аналитика

## 📈 Отслеживаемые события

- `pageview` - Просмотры страниц
- `drop_files` - Загрузка файлов
- `process_start` - Начало обработки
- `process_done` - Завершение обработки
- `export_zip` - Экспорт ZIP

## 🚧 Статус разработки

- ✅ **Этап 0** - Инициализация проекта
- ✅ **Этап 1** - Лендинг с Plausible аналитикой и динамическим переводом
- 🔄 **Этап 2** - Каркас Studio (в разработке)

## 📝 Лицензия

MIT License
