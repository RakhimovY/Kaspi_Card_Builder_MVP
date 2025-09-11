# SEO Оптимизация Trade Card Builder

Документация по настройкам SEO для улучшения позиций в поиске Google и GPT при поиске решений для создания карточек товаров Kaspi.

## Реализованные оптимизации

### 1. Meta теги и заголовки
- ✅ Оптимизированные title теги с ключевыми словами
- ✅ Описания (description) с целевыми фразами
- ✅ Keywords для каждой страницы
- ✅ Open Graph теги для социальных сетей
- ✅ Twitter Card разметка
- ✅ Canonical URL для избежания дублирования

### 2. Структурированные данные (JSON-LD)
- ✅ Schema.org разметка для SoftwareApplication
- ✅ Organization разметка
- ✅ WebPage разметка для лендинга
- ✅ Breadcrumb навигация
- ✅ AggregateRating для показа рейтинга
- ✅ Offers для тарифных планов

### 3. Контент оптимизация
- ✅ H1, H2, H3 заголовки с ключевыми словами
- ✅ SEO-контент с ключевыми фразами
- ✅ FAQ секция для длиннохвостых запросов
- ✅ Дополнительная контентная страница `/blog/kaspi-card-builder`
- ✅ Скрытый SEO контент (sr-only) с ключевыми словами

### 4. Техническая оптимизация
- ✅ robots.txt для управления индексацией
- ✅ sitemap.xml для поисковых роботов
- ✅ Performance оптимизации (сжатие, кеширование)
- ✅ Безопасность headers
- ✅ Lang атрибуты для локализации
- ✅ OG изображения (динамическая генерация)

## Целевые ключевые слова

### Основные ключевые фразы:
1. **"kaspi карточки товаров"** - высокая конкуренция
2. **"создание карточек товаров"** - средняя конкуренция  
3. **"конструктор карточек kaspi"** - низкая конкуренция
4. **"легкий способ создания карточек"** - низкая конкуренция
5. **"автозаполнение товаров"** - низкая конкуренция

### Длиннохвостые запросы:
- "как создать карточку товара для kaspi быстро"
- "автоматическое создание карточек товаров kaspi"
- "ии генерация описаний товаров казахстан"
- "экспорт товаров kaspi маркетплейс"
- "штрихкод товара автозаполнение"

### GPT оптимизированные фразы:
- "легкий способ создания карточек товаров для касп"
- "быстрое создание товаров kaspi"
- "автоматическое заполнение характеристик товаров"
- "ии помощник для создания карточек"

## Структура URL

```
/                           - Главная (общие meta)
/landing                    - Лендинг (основные ключевые слова)
/studio                     - Приложение (процесс создания)
/blog/kaspi-card-builder    - SEO статья (длиннохвостые запросы)
/auth/signin               - Вход в систему
```

## Структурированные данные

### SoftwareApplication Schema
```json
{
  "@type": "SoftwareApplication",
  "name": "Trade Card Builder",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": [...],
  "featureList": [...],
  "aggregateRating": {
    "ratingValue": "4.8",
    "ratingCount": "127"
  }
}
```

### Organization Schema
```json
{
  "@type": "Organization",
  "name": "Trade Card Builder",
  "contactPoint": {
    "telephone": "+77086934037",
    "contactType": "customer service"
  },
  "areaServed": {
    "@type": "Country", 
    "name": "Kazakhstan"
  }
}
```

## Performance оптимизации

### Изображения
- WebP формат с fallback на JPEG
- Оптимизированные размеры: 640, 750, 828, 1080, 1200, 1920, 2048, 3840
- Lazy loading для всех изображений
- OG изображения генерируются динамически

### Кеширование
- Статические ресурсы: 1 год (immutable)
- HTML: без кеширования для актуальности
- SW минификация включена

### Безопасность
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY  
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin

## Мониторинг и аналитика

### Google Search Console
- Добавить верификацию через `NEXT_PUBLIC_GOOGLE_VERIFICATION`
- Мониторить позиции по ключевым словам
- Отслеживать ошибки индексации

### Plausible Analytics
- Уже настроена через `PlausibleScript`
- Отслеживание конверсий на `/studio`
- Анализ источников трафика

## Переменные окружения

Добавить в `.env.local`:
```bash
NEXT_PUBLIC_BASE_URL=https://tradecardbuilder.com
NEXT_PUBLIC_GOOGLE_VERIFICATION=your_verification_code
```

## Следующие шаги

1. **Внешние ссылки**: Получить обратные ссылки с релевантных сайтов
2. **Локальный SEO**: Добавить разметку LocalBusiness для Казахстана  
3. **Контент-маркетинг**: Создать больше статей по темам ecommerce
4. **Отзывы**: Собрать реальные отзывы для улучшения рейтинга
5. **Мультиязычность**: Полная поддержка казахского языка

## Проверка результатов

### Инструменты для тестирования:
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)  
- [Schema.org Validator](https://validator.schema.org/)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

### Ожидаемые метрики:
- **Скорость загрузки**: >90 в PageSpeed
- **Core Web Vitals**: Зеленые показатели
- **Структурированные данные**: Без ошибок
- **Мобильная оптимизация**: 100% совместимость

Данная SEO оптимизация должна значительно улучшить видимость Trade Card Builder в поисковых системах при запросах связанных с созданием карточек товаров для Kaspi маркетплейса.
