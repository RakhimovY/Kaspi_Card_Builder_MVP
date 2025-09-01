# Kaspi Card Builder MVP

Профессиональные карточки товаров для Kaspi Marketplace

## 🚀 Быстрый старт

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd Kaspi_Card_Builder_MVP
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
   NEXT_PUBLIC_APP_NAME=Kaspi Card Builder
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
