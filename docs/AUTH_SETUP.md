# Настройка аутентификации NextAuth

## Этап 12 — NextAuth (Google) ✅

### Что реализовано

1. **NextAuth конфигурация** - `app/api/auth/[...nextauth]/route.ts`
   - Google OAuth провайдер
   - PrismaAdapter для работы с базой данных
   - JWT сессии
   - Кастомные страницы входа и ошибок

2. **UI компоненты**
   - Страница входа `/auth/signin`
   - Страница ошибки `/auth/signin/error`
   - Компонент `AuthButtons` с кнопками входа/выхода
   - Страница профиля `/profile`

3. **Серверные утилиты**
   - `lib/server/auth.ts` - функции для проверки аутентификации
   - Защищенный API endpoint `/api/test-auth`

4. **Интеграция**
   - SessionProvider в корневом layout
   - Кнопки аутентификации в хедере лендинга
   - Переводы на RU/KZ

### Настройка для разработки

1. **Создайте файл `.env.local`** в корне проекта:
```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-32-character-secret-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (заполните своими данными)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# App
NODE_ENV="development"
LOG_LEVEL="info"
```

2. **Настройте Google OAuth**:
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте новый проект или выберите существующий
   - Включите Google+ API
   - Создайте OAuth 2.0 credentials
   - Добавьте `http://localhost:3000/api/auth/callback/google` в Authorized redirect URIs
   - Скопируйте Client ID и Client Secret в `.env.local`

3. **Запустите базу данных**:
```bash
npm run db:local
npm run prisma:generate
npm run prisma:migrate
```

### Тестирование

1. **Запустите приложение**:
```bash
npm run dev
```

2. **Проверьте аутентификацию**:
   - Откройте `http://localhost:3000`
   - Нажмите "Войти" в хедере
   - Войдите через Google
   - Перейдите в профиль `/profile`
   - Протестируйте защищенный API

3. **API тест**:
   - GET `/api/test-auth` - должен вернуть 401 без аутентификации
   - GET `/api/test-auth` с сессией - должен вернуть данные пользователя

### Структура файлов

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth конфигурация
│   │   └── test-auth/
│   │       └── route.ts              # Тестовый защищенный API
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx              # Страница входа
│   │   └── error/
│   │       └── page.tsx              # Страница ошибки
│   └── profile/
│       └── page.tsx                  # Страница профиля
├── components/
│   ├── AuthButtons.tsx               # Кнопки входа/выхода
│   ├── SessionProvider.tsx           # NextAuth провайдер
│   └── ui/
│       ├── avatar.tsx                # Аватар пользователя
│       └── dropdown-menu.tsx         # Выпадающее меню
└── lib/
    └── server/
        └── auth.ts                   # Серверные утилиты аутентификации
```

### DoD (Definition of Done)

✅ **После логина создаётся пользователь** - PrismaAdapter автоматически создает записи в таблицах User/Account/Session

✅ **Защищённые API читают userId из сессии** - `/api/test-auth` использует `getCurrentUser()` для проверки аутентификации

✅ **UI компоненты работают** - кнопки входа/выхода, страницы аутентификации, профиль

✅ **Переводы добавлены** - поддержка RU/KZ для всех текстов аутентификации

✅ **Сессии работают** - JWT стратегия, SessionProvider в layout

✅ **Проект собирается** - все типы и зависимости корректны

### Следующие шаги

После настройки аутентификации можно переходить к:
- **Этап 13** - Billing (MoR) с webhooks
- **Этап 14** - Квоты и лимиты
- **Этап 15** - Magic Fill API

---

## 🎉 Этап 12 завершен успешно!

**Аутентификация NextAuth с Google провайдером полностью настроена и готова к использованию.**

Для продолжения работы дождитесь команды пользователя: **"дальше к следующему шагу"**
