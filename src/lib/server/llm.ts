import { env } from './env'
import { logger } from './logger'
import { debugLogger } from './debug-logger'

export interface ProductData {
  brand?: string
  type?: string
  model?: string
  keySpec?: string
  category?: string
  gtinData?: Record<string, unknown>
  ocrText?: string
}

export interface LlmEnrichmentResult {
  brand?: string
  type?: string
  model?: string
  keySpec?: string
  category?: string
  titleRU?: string
  titleKZ?: string
  descriptionRU?: string
  descriptionKZ?: string
  attributes?: Record<string, string>
  confidence: number
}

/**
 * Get optimal parameters for different OpenAI models
 */
function getModelParameters(model: string) {
  switch (model) {
    case 'gpt-4o-mini':
      return {
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1200,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      }
    case 'gpt-4o':
      return {
        temperature: 0.3,
        top_p: 0.95,
        max_tokens: 1500,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }
    case 'gpt-4':
    case 'gpt-4-turbo':
      return {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1500,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }
    case 'gpt-3.5-turbo':
    default:
      return {
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1000,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }
  }
}

/**
 * Enrich product data using OpenAI GPT
 */
export async function enrichProductWithLlm(
  productData: ProductData
): Promise<LlmEnrichmentResult> {
  if (!env.OPENAI_API_KEY) {
    logger.warn({
      message: 'OpenAI API key not configured, using fallback',
    })
    return enrichProductFallback(productData)
  }

  try {
    const prompt = buildEnrichmentPrompt(productData)
    
    // Get optimal parameters for the model
    const modelParams = getModelParameters(env.OPENAI_MODEL)
    
    logger.info({
      message: 'Starting LLM enrichment',
      model: env.OPENAI_MODEL,
      modelParams,
      hasGtinData: !!productData.gtinData,
      hasOcrText: !!productData.ocrText,
      promptLength: prompt.length,
      productData: {
        brand: productData.brand,
        type: productData.type,
        model: productData.model,
        keySpec: productData.keySpec,
        category: productData.category,
        gtinDataKeys: productData.gtinData ? Object.keys(productData.gtinData) : [],
        ocrTextLength: productData.ocrText?.length || 0,
      },
      fullPrompt: prompt,
    })

    // Log to debug file
    debugLogger.logLlmRequest(prompt, env.OPENAI_MODEL)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: `Ты эксперт по товарам для маркетплейсов Kaspi.kz. Твоя задача: проанализировать данные о товаре и создать качественные заголовки и описания на русском и казахском языках.

ВАЖНО: Верни ТОЛЬКО валидный JSON без дополнительного текста в следующем формате:
{
  "brand": "Название бренда",
  "type": "Тип товара",
  "model": "Модель",
  "keySpec": "Ключевые характеристики",
  "category": "electronics|clothing|cosmetics|home|sports|other",
  "titleRU": "Название на русском",
  "titleKZ": "Название на казахском",
  "descriptionRU": "Описание на русском",
  "descriptionKZ": "Описание на казахском",
  "attributes": {
    "attribute1": "value1",
    "attribute2": "value2"
  },
  "confidence": 0.95
}

Правила определения категории:
- electronics: электроника, техника, гаджеты
- clothing: одежда, обувь, аксессуары (включая ботинки, сапоги, туфли)
- cosmetics: косметика, парфюмерия, уход
- home: товары для дома, мебель, декор
- sports: спортивные товары, фитнес
- other: все остальное

ПРАВИЛА ПЕРЕВОДА НА КАЗАХСКИЙ ЯЗЫК:

1. ТЕРМИНОЛОГИЯ ПО КАТЕГОРИЯМ:
   • Электроника: "смартфон" → "ақылды телефон", "наушники" → "құлаққап", "ноутбук" → "ноутбук"
   • Одежда: "сапоги/ботинки" → "етік", "кроссовки" → "спорт аяқкиім", "джинсы" → "джинс"
   • Косметика: "помада" → "еңіз бояуы", "тушь" → "көз бояуы", "крем" → "крем"

2. ГЕНДЕРНЫЕ УКАЗАТЕЛИ:
   • "женские" → "әйелдерге арналған"
   • "мужские" → "ерлерге арналған"
   • "детские" → "балаларға арналған"

3. НАЗНАЧЕНИЕ/СФЕРА:
   • "для верховой езды" → "атқа мінуге арналған"
   • "для бега" → "жүгіруге арналған"
   • "рабочие" → "жұмысқа арналған"

4. СТРУКТУРА ЗАГОЛОВКА:
   Порядок: <Бренд> <аудитория> <назначение> <тип> <модель>

5. ОБЩИЕ ПРАВИЛА:
   • Бренды и модели сохраняй в оригинальном виде
   • Используй естественные казахские фразы
   • Для описаний используй маркеры "•"

ПРИМЕРЫ КАЧЕСТВЕННЫХ ПЕРЕВОДОВ:
Русский: "Смартфон Samsung Galaxy S23"
Казахский: "Samsung Galaxy S23 ақылды телефоны"

Русский: "Мужская футболка из хлопка"
Казахский: "Ерлерге арналған мақта футболкасы"

Русский: "Увлажняющий крем для лица"
Казахский: "Бетке арналған ылғалдандырғыш крем"

Русский: "Женские сапоги для верховой езды Journee"
Казахский: "Journee әйелдерге арналған атқа мінуге арналған етіктер"

ОБЯЗАТЕЛЬНЫЕ ТРЕБОВАНИЯ:
1. Используй ВСЕ доступные данные (GTIN, OCR, ручные данные)
2. Заголовки: краткие, информативные, с правильным порядком слов
3. Описания: структурированные с маркерами "•"
4. Атрибуты: релевантные для категории товара
5. Confidence: от 0.0 до 1.0 (оцени честно)
6. Категория "clothing" включает всю обувь (сапоги, ботинки, туфли)

ФОРМАТ ОТВЕТА: Только JSON, без дополнительного текста!`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        ...modelParams,
      }),
      // Timeout after 30 seconds
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error({
        message: 'OpenAI API request failed',
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    // Log raw LLM response
    logger.info({
      message: 'LLM raw response received',
      responseData: data,
      content: content,
      usage: data.usage,
    })

    // Log to debug file
    debugLogger.logLlmResponse(data)

    if (!content) {
      throw new Error('No content in OpenAI response')
    }

    // Parse JSON response
    const result = JSON.parse(content) as LlmEnrichmentResult

    // Validate and improve Kazakh translations
    const validatedResult = validateAndImproveKazakhTranslations(result, productData)

    logger.info({
      message: 'LLM enrichment completed - parsed result',
      confidence: validatedResult.confidence,
      hasTitle: !!validatedResult.titleRU,
      hasDescription: !!validatedResult.descriptionRU,
      kazakhQuality: {
        titleQuality: validateKazakhQuality(validatedResult.titleKZ || ''),
        descriptionQuality: validateKazakhQuality(validatedResult.descriptionKZ || ''),
      },
      parsedResult: {
        brand: validatedResult.brand,
        type: validatedResult.type,
        model: validatedResult.model,
        keySpec: validatedResult.keySpec,
        category: validatedResult.category,
        titleRU: validatedResult.titleRU,
        titleKZ: validatedResult.titleKZ,
        descriptionRU: validatedResult.descriptionRU,
        descriptionKZ: validatedResult.descriptionKZ,
        attributes: validatedResult.attributes,
        confidence: validatedResult.confidence,
      }
    })

    return validatedResult

  } catch (error) {
    logger.error({
      message: 'LLM enrichment failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    // Fallback to rule-based enrichment
    return enrichProductFallback(productData)
  }
}

/**
 * Build prompt for LLM enrichment
 */
function buildEnrichmentPrompt(productData: ProductData): string {
  const parts: string[] = []

  parts.push('Данные о товаре:')

  if (productData.brand) {
    parts.push(`Бренд: ${productData.brand}`)
  }
  if (productData.type) {
    parts.push(`Тип: ${productData.type}`)
  }
  if (productData.model) {
    parts.push(`Модель: ${productData.model}`)
  }
  if (productData.keySpec) {
    parts.push(`Характеристики: ${productData.keySpec}`)
  }
  if (productData.category) {
    parts.push(`Категория: ${productData.category}`)
  }

  if (productData.gtinData) {
    parts.push('\nДанные из GTIN:')
    parts.push(JSON.stringify(productData.gtinData, null, 2))
  }

  if (productData.ocrText) {
    parts.push('\nТекст с изображения:')
    parts.push(productData.ocrText)
  }

  return parts.join('\n')
}

/**
 * Fallback enrichment without LLM
 */
function enrichProductFallback(productData: ProductData): LlmEnrichmentResult {
  const brand = productData.brand || 'Неизвестный бренд'
  const type = productData.type || 'Товар'
  const model = productData.model || 'Модель'
  const keySpec = productData.keySpec || 'Основные характеристики'
  const category = productData.category || 'other'

  const titleRU = `${type} ${brand} ${model}`.trim()
  const titleKZ = generateKazakhTitle(type, brand, model, category)

  const descriptionRU = `• Высокое качество и надежность
• Современный дизайн
• Удобство в использовании
• Соответствие стандартам

Характеристики:
• Бренд: ${brand}
• Модель: ${model}
• Тип: ${type}
${keySpec ? `• Особенности: ${keySpec}` : ''}`

  const descriptionKZ = generateKazakhDescription(type, brand, model, keySpec, category)

  const attributes = generateAttributesByCategory(category, { brand, type, model, keySpec })

  return {
    brand,
    type,
    model,
    keySpec,
    category,
    titleRU,
    titleKZ,
    descriptionRU,
    descriptionKZ,
    attributes,
    confidence: 0.7, // Lower confidence for fallback
  }
}

/**
 * Generate Kazakh title based on product type and category
 */
function generateKazakhTitle(type: string, brand: string, model: string, category: string): string {
  const typeKZ = translateTypeToKazakh(type, category)
  const typeLower = type.toLowerCase()
  const audience = detectAudienceKZ(typeLower)
  const purpose = detectPurposeKZ(typeLower)

  // Order: Brand + audience + purpose + type + model
  return [brand, audience, purpose, typeKZ, model].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}

/**
 * Generate Kazakh description based on product context
 */
function generateKazakhDescription(type: string, brand: string, model: string, keySpec: string, category: string): string {
  const typeKZ = translateTypeToKazakh(type, category)
  
  let baseDescription = `• Жоғары сапа және сенімділік
• Заманауи дизайн
• Пайдалануға ыңғайлы
• Стандарттарға сәйкестік

Сипаттамалар:
• Бренд: ${brand}
• Модель: ${model}
• Түрі: ${typeKZ}`

  if (keySpec) {
    baseDescription += `\n• Ерекшеліктері: ${keySpec}`
  }

  // Add category-specific features
  const categoryFeatures = getCategorySpecificFeatures(category)
  if (categoryFeatures.length > 0) {
    baseDescription += `\n\nАртықшылықтары:\n${categoryFeatures.map(feature => `• ${feature}`).join('\n')}`
  }

  return baseDescription
}

/**
 * Translate product type to Kazakh based on category
 */
function translateTypeToKazakh(type: string, category: string): string {
  const typeLower = type.toLowerCase()
  
  // Electronics
  if (category === 'electronics') {
    if (typeLower.includes('смартфон') || typeLower.includes('телефон')) return 'ақылды телефон'
    if (typeLower.includes('ноутбук') || typeLower.includes('laptop')) return 'ноутбук'
    if (typeLower.includes('наушники') || typeLower.includes('headphone')) return 'құлаққап'
    if (typeLower.includes('планшет')) return 'планшет'
    if (typeLower.includes('часы') || typeLower.includes('watch')) return 'сағат'
    if (typeLower.includes('камера') || typeLower.includes('camera')) return 'камера'
    if (typeLower.includes('монитор')) return 'монитор'
    if (typeLower.includes('клавиатура')) return 'пернетақта'
    if (typeLower.includes('мышь') || typeLower.includes('мышка')) return 'тышқан'
    return 'электроника'
  }
  
  // Clothing
  if (category === 'clothing') {
    if (typeLower.includes('футболка') || typeLower.includes('t-shirt')) return 'футболка'
    if (typeLower.includes('джинсы') || typeLower.includes('jeans')) return 'джинс'
    if (typeLower.includes('кроссовки') || typeLower.includes('sneakers')) return 'спорт аяқкиім'
    if (typeLower.includes('ботинки') || typeLower.includes('boots')) return 'етік'
    if (typeLower.includes('сапоги')) return 'етік'
    if (typeLower.includes('туфли') || typeLower.includes('shoes')) return 'аяқкиім'
    if (typeLower.includes('рубашка') || typeLower.includes('shirt')) return 'көйлек'
    if (typeLower.includes('платье') || typeLower.includes('dress')) return 'көйлек'
    if (typeLower.includes('куртка') || typeLower.includes('jacket')) return 'жакет'
    if (typeLower.includes('пальто') || typeLower.includes('coat')) return 'пальто'
    if (typeLower.includes('шорты') || typeLower.includes('shorts')) return 'шорты'
    if (typeLower.includes('брюки') || typeLower.includes('pants')) return 'шалбар'
    return 'киім'
  }
  
  // Cosmetics
  if (category === 'cosmetics') {
    if (typeLower.includes('крем') || typeLower.includes('cream')) return 'крем'
    if (typeLower.includes('шампунь') || typeLower.includes('shampoo')) return 'шампунь'
    if (typeLower.includes('помада') || typeLower.includes('lipstick')) return 'еңіз бояуы'
    if (typeLower.includes('тушь') || typeLower.includes('mascara')) return 'көз бояуы'
    if (typeLower.includes('тональный') || typeLower.includes('foundation')) return 'тондық крем'
    if (typeLower.includes('пудра') || typeLower.includes('powder')) return 'ұнтақ'
    if (typeLower.includes('духи') || typeLower.includes('perfume')) return 'иіс'
    if (typeLower.includes('гель') || typeLower.includes('gel')) return 'гель'
    if (typeLower.includes('маска') || typeLower.includes('mask')) return 'маска'
    if (typeLower.includes('сыворотка') || typeLower.includes('serum')) return 'серум'
    return 'косметика'
  }
  
  // Home
  if (category === 'home') {
    if (typeLower.includes('мебель') || typeLower.includes('furniture')) return 'жиһаз'
    if (typeLower.includes('лампа') || typeLower.includes('lamp')) return 'шам'
    if (typeLower.includes('ковер') || typeLower.includes('carpet')) return 'кілем'
    if (typeLower.includes('посуда') || typeLower.includes('dishes')) return 'ыдыс'
    if (typeLower.includes('постельное') || typeLower.includes('bedding')) return 'төсек орамы'
    if (typeLower.includes('полотенце') || typeLower.includes('towel')) return 'сүлгі'
    if (typeLower.includes('занавески') || typeLower.includes('curtains')) return 'перде'
    return 'үй бұйымдары'
  }
  
  // Sports
  if (category === 'sports') {
    if (typeLower.includes('мяч') || typeLower.includes('ball')) return 'доп'
    if (typeLower.includes('ракетка') || typeLower.includes('racket')) return 'ракетка'
    if (typeLower.includes('велосипед') || typeLower.includes('bicycle')) return 'велосипед'
    if (typeLower.includes('лыжи') || typeLower.includes('skis')) return 'шана'
    if (typeLower.includes('коньки') || typeLower.includes('skates')) return 'коньки'
    if (typeLower.includes('гантели') || typeLower.includes('dumbbells')) return 'гантель'
    if (typeLower.includes('тренажер') || typeLower.includes('trainer')) return 'тренажер'
    return 'спорт бұйымдары'
  }
  
  return type
}

/**
 * Detect target audience tokens in Russian and convert to Kazakh phrase
 */
function detectAudienceKZ(typeLower: string): string {
  if (typeLower.includes('женск')) return 'әйелдерге арналған'
  if (typeLower.includes('мужск')) return 'ерлерге арналған'
  if (typeLower.includes('детск')) return 'балаларға арналған'
  if (typeLower.includes('мальчик') || typeLower.includes('для мальчиков')) return 'ұлдарға арналған'
  if (typeLower.includes('девоч') || typeLower.includes('для девочек')) return 'қыздарға арналған'
  return ''
}

/**
 * Detect purpose/usage and convert to Kazakh phrase
 */
function detectPurposeKZ(typeLower: string): string {
  if (typeLower.includes('верхов') || typeLower.includes('конн') || typeLower.includes('конный спорт')) return 'атқа мінуге арналған'
  if (typeLower.includes('бег') || typeLower.includes('для бега') || typeLower.includes('running')) return 'жүгіруге арналған'
  if (typeLower.includes('треккинг') || typeLower.includes('поход') || typeLower.includes('туризм')) return 'жорыққа арналған'
  if (typeLower.includes('работ') || typeLower.includes('рабоч')) return 'жұмысқа арналған'
  if (typeLower.includes('зима') || typeLower.includes('зимние')) return 'қысқа арналған'
  if (typeLower.includes('лето') || typeLower.includes('летние')) return 'жазға арналған'
  return ''
}

/**
 * Get category-specific features in Kazakh
 */
function getCategorySpecificFeatures(category: string): string[] {
  switch (category) {
    case 'electronics':
      return [
        'Жылдам жұмыс істеу',
        'Ұзақ батарея ұзақтығы',
        'Жаңа технологиялар'
      ]
    case 'clothing':
      return [
        'Жоғары сапалы материал',
        'Ыңғайлы крой',
        'Стильді дизайн'
      ]
    case 'cosmetics':
      return [
        'Табиғи ингредиенттер',
        'Теріге қауіпсіз',
        'Тиімді нәтиже'
      ]
    case 'home':
      return [
        'Үйге ыңғайлы',
        'Ұзақ мерзімді пайдалану',
        'Стильді көрініс'
      ]
    case 'sports':
      return [
        'Спортшыларға арналған',
        'Жоғары беріктік',
        'Ыңғайлы пайдалану'
      ]
    default:
      return []
  }
}

/**
 * Generate attributes based on category (from original magic-fill)
 */
function generateAttributesByCategory(category: string, data: Record<string, string>) {
  const baseAttributes = {
    brand: data.brand,
    model: data.model,
    type: data.type,
  }

  switch (category) {
    case 'electronics':
      return {
        ...baseAttributes,
        power: '220В, 50-60Гц',
        warranty: '12 месяцев',
        country: 'Китай',
        cert: 'EAC, ТР ТС'
      }
    case 'clothing':
      return {
        ...baseAttributes,
        material: 'Хлопок 100%',
        care: 'Машинная стирка',
        country: 'Китай',
        season: 'Всесезонный'
      }
    case 'cosmetics':
      return {
        ...baseAttributes,
        volume: '50мл',
        shelfLife: '36 месяцев',
        country: 'Китай',
        cert: 'ТР ТС'
      }
    default:
      return baseAttributes
  }
}

/**
 * Validate and improve Kazakh translations
 */
function validateAndImproveKazakhTranslations(result: LlmEnrichmentResult, productData: ProductData): LlmEnrichmentResult {
  const improvedResult = { ...result }

  // Improve title if quality is low
  if (improvedResult.titleKZ) {
    const titleQuality = validateKazakhQuality(improvedResult.titleKZ)
    if (titleQuality < 0.7) {
      improvedResult.titleKZ = generateKazakhTitle(
        improvedResult.type || productData.type || 'Товар',
        improvedResult.brand || productData.brand || 'Бренд',
        improvedResult.model || productData.model || 'Модель',
        improvedResult.category || productData.category || 'other'
      )
    }
  }

  // Improve description if quality is low
  if (improvedResult.descriptionKZ) {
    const descQuality = validateKazakhQuality(improvedResult.descriptionKZ)
    if (descQuality < 0.7) {
      improvedResult.descriptionKZ = generateKazakhDescription(
        improvedResult.type || productData.type || 'Товар',
        improvedResult.brand || productData.brand || 'Бренд',
        improvedResult.model || productData.model || 'Модель',
        improvedResult.keySpec || productData.keySpec || '',
        improvedResult.category || productData.category || 'other'
      )
    }
  }

  return improvedResult
}

/**
 * Validate quality of Kazakh translation
 * Returns score from 0 to 1 (higher is better)
 */
function validateKazakhQuality(text: string): number {
  if (!text || text.trim().length === 0) return 0

  let score = 1.0
  const textLower = text.toLowerCase()

  // Check for obvious Russian words that should be translated
  const russianWords = [
    'смартфон', 'телефон', 'ноутбук', 'наушники', 'футболка', 'джинсы',
    'кроссовки', 'крем', 'шампунь', 'помада', 'мебель', 'лампа'
  ]
  
  const russianWordCount = russianWords.filter(word => textLower.includes(word)).length
  score -= russianWordCount * 0.2

  // Check for proper Kazakh words
  const kazakhWords = [
    'ақылды', 'телефон', 'ноутбук', 'құлаққап', 'футболка', 'джинс',
    'спорт', 'аяқкиім', 'крем', 'шампунь', 'еңіз', 'бояуы', 'жиһаз', 'шам'
  ]
  
  const kazakhWordCount = kazakhWords.filter(word => textLower.includes(word)).length
  score += kazakhWordCount * 0.1

  // Check for proper Kazakh grammar patterns
  if (text.includes('ға') || text.includes('ге') || text.includes('қа') || text.includes('ке')) {
    score += 0.1 // Dative case endings
  }
  
  if (text.includes('ның') || text.includes('нің')) {
    score += 0.1 // Genitive case endings
  }

  // Check for brand names (should remain unchanged)
  const hasBrandPattern = /[A-Z][a-z]+ [A-Z][a-z0-9]+/.test(text)
  if (hasBrandPattern) {
    score += 0.1
  }

  // Ensure score is between 0 and 1
  return Math.max(0, Math.min(1, score))
}
