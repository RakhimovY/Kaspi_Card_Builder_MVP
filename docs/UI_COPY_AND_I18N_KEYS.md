# UI_COPY_AND_I18N_KEYS.md — Тексты и ключи локализации (RU/KZ) для новых полей

## Разделы/лейблы
- `form.ident.sku` — Артикул (SKU)
- `form.ident.gtin` — Штрихкод (GTIN)
- `form.ident.brand` — Бренд
- `form.ident.type` — Тип товара
- `form.ident.model` — Модель
- `form.ident.keyspec` — Ключевая характеристика

- `form.content.title_ru` — Заголовок (RU)
- `form.content.title_kz` — Тақырып (KZ)
- `form.content.desc_ru` — Описание (RU)
- `form.content.desc_kz` — Сипаттама (KZ)
- `form.content.generate` — Сгенерировать

- `form.variants.title` — Варианты
- `form.variants.sku` — SKU варианта
- `form.variants.color` — Цвет
- `form.variants.size` — Размер
- `form.variants.capacity` — Объём/Ёмкость
- `form.variants.compat` — Совместимость
- `form.variants.add` — Добавить вариант
- `form.variants.remove` — Удалить

- `form.attributes.title` — Атрибуты
- `form.attributes.key` — Ключ
- `form.attributes.value` — Значение
- `form.attributes.add` — Добавить атрибут
- `form.attributes.remove` — Удалить

- `form.logistics.title` — Логистика и соответствие
- `form.logistics.weight` — Вес, кг
- `form.logistics.dimensions` — Габариты, см (Д×Ш×В)
- `form.logistics.bundle` — Комплектация
- `form.logistics.warranty` — Гарантия
- `form.logistics.country` — Страна происхождения
- `form.logistics.cert` — Сертификация/ТР ТС
- `form.logistics.power` — Питание/Мощность
- `form.logistics.age` — Возрастные ограничения

- `form.category.title` — Категория
- `form.checklist.title` — Чек-лист

- `form.progress.title` — Заполненность
- `form.progress.missing` — Не хватает полей: {fields}

- `form.actions.scan_barcode` — Сканировать штрихкод
- `form.actions.magic_fill` — Заполнить Magic Fill
- `form.actions.export_zip` — Скачать ZIP
- `form.actions.preview_csv` — Предпросмотр CSV

## Ошибки/валидация
- `error.required` — Обязательное поле
- `error.title_length` — 60–80 символов
- `error.images_rules` — Фото: 500–5000 px, ≤ 25MB, до 8 шт
- `error.variant_sku_unique` — SKU варианта должен быть уникальным

## Подсказки
- `hint.title_formula` — Формула: <Тип> <Бренд> <Модель> <Ключ. признак>
- `hint.gtin_optional` — GTIN необязателен, но ускорит автозаполнение
- `hint.attributes_preset` — Атрибуты подтянутся из пресета категории

Добавь эти ключи в `src/messages/ru.json` и `src/messages/kz.json`. Все новые тексты выводить через i18n-хуки проекта.