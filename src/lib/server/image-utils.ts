import { z } from 'zod'

// Общие константы для валидации изображений
export const IMAGE_CONSTRAINTS = {
  MIN_SIZE: 500,
  MAX_SIZE: 5000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'] as const,
  SUPPORTED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const

// Схемы валидации
export const imageProcessingOptionsSchema = z.object({
  removeBg: z.boolean().default(false),
  quality: z.number().min(0.1).max(1.0).default(0.8),
  format: z.enum(['png', 'jpeg', 'webp']).default('png'),
  maxEdgePx: z.number().min(500).max(5000).default(2000),
})

export type ImageProcessingOptions = z.infer<typeof imageProcessingOptionsSchema>

export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Валидация изображения по Buffer
 */
export function validateImageBuffer(
  buffer: Buffer,
  filename: string
): ImageValidationResult {
  const errors: string[] = []

  // Проверка размера файла
  if (buffer.length > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    errors.push(
      `Размер файла превышает 25MB (${Math.round(
        buffer.length / 1024 / 1024
      )}MB)`
    )
  }

  // Проверка минимального размера
  if (buffer.length < 1024) {
    errors.push('Файл слишком маленький (меньше 1KB)')
  }

  // Проверка формата файла
  const fileExtension = filename.toLowerCase().split('.').pop()
  if (!fileExtension || !IMAGE_CONSTRAINTS.SUPPORTED_FORMATS.includes(fileExtension)) {
    errors.push('Неподдерживаемый формат файла. Разрешены: JPEG, PNG, WebP')
  }

  // Проверка сигнатуры файла
  if (!checkImageSignature(buffer)) {
    errors.push('Файл не является валидным изображением')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Валидация изображения по File (клиентская)
 */
export function validateImageFile(
  file: File,
  width?: number,
  height?: number
): ImageValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Проверка размера файла
  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    errors.push(
      `Файл слишком большой (${formatFileSize(
        file.size
      )}). Максимум: ${formatFileSize(IMAGE_CONSTRAINTS.MAX_FILE_SIZE)}`
    )
  }

  // Проверка размеров (если доступны)
  if (width && height) {
    if (width < IMAGE_CONSTRAINTS.MIN_SIZE || height < IMAGE_CONSTRAINTS.MIN_SIZE) {
      warnings.push(
        `Размер изображения меньше ${IMAGE_CONSTRAINTS.MIN_SIZE}px. Рекомендуется: минимум ${IMAGE_CONSTRAINTS.MIN_SIZE}px`
      )
    }
    if (width > IMAGE_CONSTRAINTS.MAX_SIZE || height > IMAGE_CONSTRAINTS.MAX_SIZE) {
      warnings.push(
        `Размер изображения больше ${IMAGE_CONSTRAINTS.MAX_SIZE}px. Будет уменьшено до ${IMAGE_CONSTRAINTS.MAX_SIZE}px`
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Проверка сигнатуры файла изображения
 */
export function checkImageSignature(buffer: Buffer): boolean {
  if (buffer.length < 8) return false

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true
  }

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    // Проверяем RIFF...WEBP
    if (
      buffer.length >= 12 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      return true
    }
  }

  return false
}

/**
 * Определение MIME типа по сигнатуре файла
 */
export function getMimeTypeFromSignature(buffer: Buffer): string {
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return 'image/jpeg'
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }
  if (
    buffer.length >= 12 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp'
  }
  return 'image/png' // по умолчанию
}

/**
 * Получение размеров изображения из Buffer (упрощенная версия)
 */
export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number }> {
  // Простая проверка для PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    const width = buffer.readUInt32BE(16)
    const height = buffer.readUInt32BE(20)
    return { width, height }
  }

  // Для JPEG и WebP нужна более сложная логика
  // Пока возвращаем заглушку, в реальном проекте можно использовать sharp или jimp
  return { width: 0, height: 0 }
}

/**
 * Форматирование размера файла для отображения
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Конвертация клиентских опций в серверные
 */
export function convertToServerOptions(
  options: {
    maxEdgePx: number
    format: 'jpeg' | 'webp'
    quality: number
    removeBg: boolean
  }
): ImageProcessingOptions {
  return {
    removeBg: options.removeBg,
    quality: options.quality,
    format: options.format === 'jpeg' ? 'jpeg' : options.format === 'webp' ? 'webp' : 'png',
    maxEdgePx: options.maxEdgePx,
  }
}
