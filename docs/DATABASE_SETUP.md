# Настройка базы данных

## Обзор

Проект использует **Prisma ORM** с **SQLite** для локальной разработки и **PostgreSQL** для продакшена.

## Локальная разработка (SQLite)

### Быстрый старт

1. **Создание базы данных:**
   ```bash
   npm run prisma:db:push
   ```

2. **Генерация Prisma клиента:**
   ```bash
   npm run prisma:generate
   ```

3. **Запуск Prisma Studio (опционально):**
   ```bash
   npm run prisma:studio
   ```
   Откроется на http://localhost:5555

### Переменные окружения

Создайте `.env.local` файл:
```env
DATABASE_URL="file:./dev.db"
```

## Продакшен (PostgreSQL)

### Переменные окружения

```env
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Миграции

```bash
# Создание миграции
npm run prisma:migrate

# Применение миграций
npx prisma migrate deploy
```

## Схема базы данных

### Основные модели

- **User** - пользователи (NextAuth)
- **Account** - OAuth аккаунты
- **Session** - сессии пользователей
- **Subscription** - подписки и тарифы
- **UsageStat** - статистика использования
- **ProductDraft** - черновики продуктов
- **ImageAsset** - изображения продуктов
- **BarcodeLookup** - кэш штрихкодов

### Связи

```
User (1) ←→ (N) Subscription
User (1) ←→ (N) UsageStat
User (1) ←→ (N) ProductDraft
User (1) ←→ (N) ImageAsset
ProductDraft (1) ←→ (N) ImageAsset
```

## Команды Prisma

```bash
# Генерация клиента
npm run prisma:generate

# Синхронизация схемы с БД (SQLite)
npm run prisma:db:push

# Создание миграции (PostgreSQL)
npm run prisma:migrate

# Запуск Prisma Studio
npm run prisma:studio

# Сброс базы данных
npx prisma db push --force-reset
```

## Тестирование

```bash
# Запуск тестов базы данных
npm test prisma.test.ts

# Запуск всех тестов
npm test
```

## Переключение между SQLite и PostgreSQL

### Для локальной разработки:
1. Переименуйте `.env` в `.env.cloud`
2. Создайте `.env` с `DATABASE_URL="file:./dev.db"`
3. Обновите `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

### Для продакшена:
1. Восстановите `.env.cloud` как `.env`
2. Обновите `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

## Troubleshooting

### Ошибка "Can't reach database server"
- Проверьте, что база данных запущена
- Проверьте `DATABASE_URL` в `.env`
- Для SQLite убедитесь, что путь к файлу корректный

### Ошибка "Environment variable not found: DATABASE_URL"
- Создайте `.env` файл
- Проверьте, что переменная `DATABASE_URL` определена

### Ошибка "Prisma schema validation"
- Проверьте синтаксис `prisma/schema.prisma`
- Убедитесь, что провайдер БД соответствует `DATABASE_URL`
