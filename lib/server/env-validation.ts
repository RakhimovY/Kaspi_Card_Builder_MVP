import { z } from 'zod'

/**
 * Валидация environment variables для продакшена
 * Используется для проверки корректности настроек при деплое
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL должен быть валидным URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET должен быть минимум 32 символа'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL должен быть валидным URL'),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID обязателен'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET обязателен'),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY обязателен'),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  
  // Billing Provider
  BILLING_PROVIDER: z.enum(['lemon-squeezy', 'paddle', 'polar']).default('lemon-squeezy'),
  
  // Lemon Squeezy
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(1, 'LEMON_SQUEEZY_WEBHOOK_SECRET обязателен'),
  LEMON_SQUEEZY_API_KEY: z.string().min(1, 'LEMON_SQUEEZY_API_KEY обязателен'),
  NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: z.string().min(1, 'NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID обязателен'),
  NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID: z.string().min(1, 'NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID обязателен'),
  
  // GTIN Provider
  GTIN_PROVIDER: z.enum(['upcitemdb', 'barcodelookup']).default('upcitemdb'),
  UPCITEMDB_USER_KEY: z.string().min(1, 'UPCITEMDB_USER_KEY обязателен'),
  
  // Analytics
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().min(1, 'NEXT_PUBLIC_PLAUSIBLE_DOMAIN обязателен'),
  
  // App
  NODE_ENV: z.enum(['development', 'production']).default('production'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
})

/**
 * Валидированные environment variables
 * Выбрасывает ошибку при некорректных значениях
 */
export const env = envSchema.parse(process.env)

/**
 * Проверка, что все обязательные переменные установлены
 * Используется в health check endpoint
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    envSchema.parse(process.env)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`))
    } else {
      errors.push('Неизвестная ошибка валидации')
    }
    return { valid: false, errors }
  }
}

/**
 * Получение безопасной информации об environment для логирования
 * Не включает секретные данные
 */
export function getEnvironmentInfo() {
  return {
    NODE_ENV: env.NODE_ENV,
    LOG_LEVEL: env.LOG_LEVEL,
    BILLING_PROVIDER: env.BILLING_PROVIDER,
    GTIN_PROVIDER: env.GTIN_PROVIDER,
    OPENAI_MODEL: env.OPENAI_MODEL,
    HAS_DATABASE_URL: !!env.DATABASE_URL,
    HAS_NEXTAUTH_SECRET: !!env.NEXTAUTH_SECRET,
    HAS_GOOGLE_OAUTH: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    HAS_OPENAI: !!env.OPENAI_API_KEY,
    HAS_BILLING: !!(env.LEMON_SQUEEZY_API_KEY && env.LEMON_SQUEEZY_WEBHOOK_SECRET),
    HAS_GTIN: !!env.UPCITEMDB_USER_KEY,
    HAS_ANALYTICS: !!env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
  }
}
