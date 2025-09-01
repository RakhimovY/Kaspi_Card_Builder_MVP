---
alwaysApply: true
---

# Coding Rules & Best Practices

## Общие
- TypeScript **strict** везде. Запрещены `any` и `// @ts-ignore` (кроме документированных исключений).
- ESLint (typescript, react, import, unused-imports) + Prettier + sort-imports.
- Архитектура: «тонкие страницы, толстые компоненты» недопустимы — выноси бизнес-логику в /lib.
- Все формы на React-Hook-Form + Zod схемы (валидация на вводе).

## UI/UX
- Tailwind + shadcn/ui. Компоненты атомарны, без лишней магии.
- Доступность: aria-атрибуты, фокус-кольца, таб-навигация, контраст ≥ 4.5.
- Состояния загрузки, пустые экраны, ошибки — обязательны.
- Никаких «мигающих» layout-shift: используем Skeleton/Placeholder.

## Изображения (клиент-пайплайн)
- Лимиты: 500–5000 px (min/max side), ≤25 MB; форматы: JPEG/PNG/WebP.
- При импорте — быстрое предварительное чтение метаданных (без полной декомпрессии).
- Перед экспортом — удалить EXIF.
- Default: WebP если поддерживается; иначе JPEG с quality ~0.82.
- Функции чистые, покрыть unit-тестами базовые шаги: resize, compress, validate, name sanitize.

## i18n
- default RU, вторичная KZ. Ключи человекочитаемые, неймспейсы `landing`, `studio`, `common`.
- Не хардкодить строки в компонентах (кроме dev-логов).

## State & Data
- Zustand с persist для сессии. Состояния разделены по слайсам: filesSlice, settingsSlice, formSlice.
- Никаких глобальных mutable singletons.

## Безопасность
- Никаких внешних API-ключей на клиенте (кроме публичных).
- Если позже добавляем серверную обработку/хранилище — только подписанные URL и TTL.

## Тесты
- Vitest + React Testing Library для утилит и критичных компонентов (Dropzone, Export).
- Минимум: тесты на CSV генератор, sanitize filename, resize/validate.

## Коммиты и CI
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`.
- GitHub Actions: lint + typecheck + unit tests на PR.
- Версионирование: semver, теги release.

## Производительность
- Избегать больших бандлов: динамический импорт тяжёлых частей (bg-removal).
- Web workers для тяжёлых операций (фон-удаление/ресайз).
- Debounce на UI-инпутах; не хранить большие ArrayBuffer в состоянии дольше, чем нужно.

## Документация
- Все публичные утилиты — JSDoc.
- В /docs положить: PROJECT_BRIEF.md, DEV_STEPS_FOR_CURSOR.md, эта страница.
# Coding Rules & Best Practices

## Общие
- TypeScript **strict** везде. Запрещены `any` и `// @ts-ignore` (кроме документированных исключений).
- ESLint (typescript, react, import, unused-imports) + Prettier + sort-imports.
- Архитектура: «тонкие страницы, толстые компоненты» недопустимы — выноси бизнес-логику в /lib.
- Все формы на React-Hook-Form + Zod схемы (валидация на вводе).

## UI/UX
- Tailwind + shadcn/ui. Компоненты атомарны, без лишней магии.
- Доступность: aria-атрибуты, фокус-кольца, таб-навигация, контраст ≥ 4.5.
- Состояния загрузки, пустые экраны, ошибки — обязательны.
- Никаких «мигающих» layout-shift: используем Skeleton/Placeholder.

## Изображения (клиент-пайплайн)
- Лимиты: 500–5000 px (min/max side), ≤25 MB; форматы: JPEG/PNG/WebP.
- При импорте — быстрое предварительное чтение метаданных (без полной декомпрессии).
- Перед экспортом — удалить EXIF.
- Default: WebP если поддерживается; иначе JPEG с quality ~0.82.
- Функции чистые, покрыть unit-тестами базовые шаги: resize, compress, validate, name sanitize.

## i18n
- default RU, вторичная KZ. Ключи человекочитаемые, неймспейсы `landing`, `studio`, `common`.
- Не хардкодить строки в компонентах (кроме dev-логов).

## State & Data
- Zustand с persist для сессии. Состояния разделены по слайсам: filesSlice, settingsSlice, formSlice.
- Никаких глобальных mutable singletons.

## Безопасность
- Никаких внешних API-ключей на клиенте (кроме публичных).
- Если позже добавляем серверную обработку/хранилище — только подписанные URL и TTL.

## Тесты
- Vitest + React Testing Library для утилит и критичных компонентов (Dropzone, Export).
- Минимум: тесты на CSV генератор, sanitize filename, resize/validate.

## Коммиты и CI
- Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`.
- GitHub Actions: lint + typecheck + unit tests на PR.
- Версионирование: semver, теги release.

## Производительность
- Избегать больших бандлов: динамический импорт тяжёлых частей (bg-removal).
- Web workers для тяжёлых операций (фон-удаление/ресайз).
- Debounce на UI-инпутах; не хранить большие ArrayBuffer в состоянии дольше, чем нужно.

## Документация
- Все публичные утилиты — JSDoc.
- В /docs положить: PROJECT_BRIEF.md, DEV_STEPS_FOR_CURSOR.md, эта страница.
- В конце как сам посчитаешь что завершил шаг из DEV_STEPS_FOR_CURSOR.md поменяй статус его на завершон. Но до этого получи подтвержение от пользователя. Когда в чате напишут  `дальше в к следуюшему шагу` приступай к след. шагу который не равершон по очередно