import { logger } from './logger'

export interface OcrResult {
  text: string
  confidence: number
  processingTime: number
  language?: string
}

export interface OcrOptions {
  language?: string
  timeout?: number
}

/**
 * Extract text from image using Tesseract.js on server
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  options: OcrOptions = {}
): Promise<OcrResult> {
  const startTime = Date.now()
  const { language = 'rus+eng', timeout = 30000 } = options

  try {
    logger.info({
      message: 'Starting OCR processing',
      bufferSize: imageBuffer.length,
      language,
    })

    // Dynamic import to avoid bundling tesseract in client
    const { createWorker } = await import('tesseract.js')
    
    const worker = await createWorker()

    try {
      // Load language data
      await (worker as any).loadLanguage(language)
      await (worker as any).initialize(language)

      // Set parameters for better accuracy
      await (worker as any).setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя0123456789.,!?;:()[]{}"\'/-+=@#$%^&*~`|\\<>',
        tessedit_pageseg_mode: 6, // Assume uniform block of text
      })

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('OCR timeout')), timeout)
      })

      // Process image with timeout
      const result = await Promise.race([
        (worker as any).recognize(imageBuffer),
        timeoutPromise,
      ])

      const processingTime = Date.now() - startTime

      logger.info({
        message: 'OCR processing completed',
        processingTime,
        textLength: result.data.text.length,
        confidence: result.data.confidence,
      })

      return {
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        processingTime,
        language,
      }

    } finally {
      await (worker as any).terminate()
    }

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    logger.error({
      message: 'OCR processing failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime,
      bufferSize: imageBuffer.length,
    })

    throw new Error(
      `OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Extract text from multiple images
 */
export async function extractTextFromImages(
  imageBuffers: Buffer[],
  options: OcrOptions = {}
): Promise<OcrResult[]> {
  const results: OcrResult[] = []
  
  for (let i = 0; i < imageBuffers.length; i++) {
    try {
      logger.info({
        message: 'Processing image for OCR',
        imageIndex: i,
        totalImages: imageBuffers.length,
      })

      const result = await extractTextFromImage(imageBuffers[i], options)
      results.push(result)
      
    } catch (error) {
      logger.error({
        message: 'OCR failed for image',
        imageIndex: i,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      // Add failed result to maintain array order
      results.push({
        text: '',
        confidence: 0,
        processingTime: 0,
        language: options.language,
      })
    }
  }
  
  return results
}

/**
 * Clean and normalize OCR text
 */
export function cleanOcrText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()\[\]{}"'/+=@#$%^&*~`|\\<>-]/g, '') // Remove special chars
    .trim()
}

/**
 * Extract key information from OCR text
 */
export function extractKeyInfoFromOcr(text: string): {
  brand?: string
  model?: string
  specifications?: string[]
  price?: string
} {
  const cleaned = cleanOcrText(text)
  const lines = cleaned.split('\n').map(line => line.trim()).filter(Boolean)
  
  const result: {
    brand?: string
    model?: string
    specifications?: string[]
    price?: string
  } = {
    specifications: [],
  }

  // Simple pattern matching for common product info
  for (const line of lines) {
    // Look for brand (usually first line or contains common brand indicators)
    if (!result.brand && (
      line.length < 50 && 
      /^[A-Z][a-zA-Z\s]+$/.test(line) ||
      line.toLowerCase().includes('brand') ||
      line.toLowerCase().includes('бренд')
    )) {
      result.brand = line
    }
    
    // Look for model numbers
    if (!result.model && (
      /^[A-Z0-9\-_]+$/.test(line) ||
      line.toLowerCase().includes('model') ||
      line.toLowerCase().includes('модель')
    )) {
      result.model = line
    }
    
    // Look for price
    if (!result.price && (
      /\d+[\.,]\d+\s*(₽|руб|рублей|тенге|тг)/i.test(line) ||
      /\$\d+[\.,]\d+/.test(line)
    )) {
      result.price = line
    }
    
    // Collect specifications
    if (line.length > 10 && line.length < 200) {
      result.specifications?.push(line)
    }
  }

  return result
}
