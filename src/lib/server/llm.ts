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
    
    logger.info({
      message: 'Starting LLM enrichment',
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
    debugLogger.logLlmRequest(prompt, 'gpt-3.5-turbo')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Ты эксперт по товарам для маркетплейсов. Анализируй данные о товаре и создавай структурированную информацию для карточки товара на Kaspi.kz.

Верни ТОЛЬКО валидный JSON в следующем формате:
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

Правила:
- Используй данные из GTIN и OCR текста
- Названия должны быть краткими и информативными
- Описания должны быть структурированными с маркерами
- Атрибуты должны быть релевантными для категории
- Confidence от 0 до 1 (насколько уверен в результате)
- Если данных мало, используй разумные предположения
- ВАЖНО: обувь (ботинки, сапоги, туфли) относится к категории "clothing"`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
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

    logger.info({
      message: 'LLM enrichment completed - parsed result',
      confidence: result.confidence,
      hasTitle: !!result.titleRU,
      hasDescription: !!result.descriptionRU,
      parsedResult: {
        brand: result.brand,
        type: result.type,
        model: result.model,
        keySpec: result.keySpec,
        category: result.category,
        titleRU: result.titleRU,
        titleKZ: result.titleKZ,
        descriptionRU: result.descriptionRU,
        descriptionKZ: result.descriptionKZ,
        attributes: result.attributes,
        confidence: result.confidence,
      }
    })

    return result

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
  const titleKZ = `${type} ${brand} ${model}`.trim() // TODO: Add Kazakh translation

  const descriptionRU = `• Высокое качество и надежность
• Современный дизайн
• Удобство в использовании
• Соответствие стандартам

Характеристики:
• Бренд: ${brand}
• Модель: ${model}
• Тип: ${type}
${keySpec ? `• Особенности: ${keySpec}` : ''}`

  const descriptionKZ = `• Жоғары сапа және сенімділік
• Заманауи дизайн
• Пайдалануға ыңғайлы
• Стандарттарға сәйкестік

Сипаттамалар:
• Бренд: ${brand}
• Модель: ${model}
• Түрі: ${type}
${keySpec ? `• Ерекшеліктері: ${keySpec}` : ''}`

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
