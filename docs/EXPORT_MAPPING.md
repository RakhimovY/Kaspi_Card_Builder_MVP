# EXPORT_MAPPING.md — Маппинг полей → CSV и правила экспорта (Kaspi)

## Минимальные колонки CSV
```
sku,name,brand,category,price,qty,description,image1,image2,image3,image4,image5,image6,image7,image8,attributes_notes
```

## Маппинг
- `sku` ← `sku`
- `name` ← `titleRU` (для KZ делаем альтернативный экспорт при необходимости)
- `brand` ← `brand`
- `category` ← `category`
- `price` ← `price`
- `qty` ← `qty`
- `description` ← `descRU` (структура: 3–5 буллетов + блок «Характеристики» из attributes)
- `image1..image8` ← массив обработанных изображений (главное — `image1`)
- `attributes_notes` ← сериализация `attributesJson` формата `key: value; key2: value2`

## Варианты (SKU-матрица)
- На каждый `variant.sku` — отдельная строка CSV.
- `name/brand/category/description` можно наследовать от родительского товара.
- `image1..image8` могут отличаться у варианта (если у него свои фотографии).

## Имена файлов
- `<SKU>_<index>.jpg|webp` (index от 1 до 8).

## Валидации перед экспортом
- Обязательные поля: `sku`, `brand`, `category`, `titleRU`, `descRU`, `price`, `qty`, `image1`.
- Фото: 500–5000 px сторона, ≤ 25MB, до 8 шт, без EXIF.
- `titleRU`: 60–80 символов, без лишних знаков и спама.
- Если есть варианты — `variant.sku` уникален.

## UX
- Превью CSV (первые 3 строки) + счётчики ошибок.
- Кнопка «Скачать ZIP» активна только при нуле критичных ошибок.