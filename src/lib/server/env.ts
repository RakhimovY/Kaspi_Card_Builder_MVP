import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL должен быть валидным URL'),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET должен быть минимум 32 символа'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL должен быть валидным URL'),
  // For ngrok support - can be set to ngrok URL
  NEXTAUTH_NGROK_URL: z.string().url().optional(),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID обязателен'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET обязателен'),
  
  // Billing Provider
  BILLING_PROVIDER: z.enum(['lemon-squeezy', 'paddle', 'polar'], {
    errorMap: () => ({ message: 'BILLING_PROVIDER должен быть одним из: lemon-squeezy, paddle, polar' })
  }),
  
  // Lemon Squeezy
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().min(1, 'LEMON_SQUEEZY_WEBHOOK_SECRET обязателен'),
  LEMON_SQUEEZY_API_KEY: z.string().optional(),
  NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: z.string().optional(),
  NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID: z.string().optional(),
  
  // Paddle (альтернативный провайдер)
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_API_KEY: z.string().optional(),
  
  // Polar.sh
  POLAR_WEBHOOK_SECRET: z.string().min(1, 'POLAR_WEBHOOK_SECRET обязателен'),
  POLAR_ACCESS_TOKEN: z.string().min(1, 'POLAR_ACCESS_TOKEN обязателен'),
  NEXT_PUBLIC_POLAR_PRODUCT_ID: z.string().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY обязателен'),
  OPENAI_MODEL: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini']).default('gpt-4o-mini'),
  
  // GTIN Provider
  GTIN_PROVIDER: z.enum(['upcitemdb', 'barcodelookup']).default('upcitemdb'),
  UPCITEMDB_USER_KEY: z.string().optional(),
  BARCODE_LOOKUP_API_KEY: z.string().optional(), // альтернативный провайдер
  
  // Analytics (опционально)
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN: z.string().optional(),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// For build time, provide fallbacks
const getEnvWithFallbacks = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    // Build time - return fallbacks
    return {
      DATABASE_URL: 'postgresql://build:build@localhost:5432/build',
      NEXTAUTH_SECRET: 'build-secret-32-chars-long-for-production',
      NEXTAUTH_URL: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'build-client-id',
      GOOGLE_CLIENT_SECRET: 'build-client-secret',
      NODE_ENV: 'production' as const,
    }
  }
  
  return process.env
}

export const env = (() => {
  try {
    return envSchema.parse(getEnvWithFallbacks())
  } catch (error) {
    // Для build time возвращаем значения по умолчанию
    return {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://build:build@localhost:5432/build',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'build-secret-32-chars-long-for-production',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      NEXTAUTH_NGROK_URL: process.env.NEXTAUTH_NGROK_URL || undefined,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'build-client-id',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'build-client-secret',
      BILLING_PROVIDER: (process.env.BILLING_PROVIDER as 'lemon-squeezy' | 'paddle' | 'polar') || 'lemon-squeezy',
      LEMON_SQUEEZY_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || 'build-webhook-secret',
      LEMON_SQUEEZY_API_KEY: process.env.LEMON_SQUEEZY_API_KEY || 'build-api-key',
      NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID || 'build-product-id',
      NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID || 'build-variant-id',
      PADDLE_WEBHOOK_SECRET: process.env.PADDLE_WEBHOOK_SECRET || undefined,
      PADDLE_API_KEY: process.env.PADDLE_API_KEY || undefined,
      POLAR_WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET || 'build-polar-webhook-secret',
      POLAR_ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN || 'build-polar-access-token',
      NEXT_PUBLIC_POLAR_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || 'build-polar-product-id',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'build-openai-key',
      OPENAI_MODEL: (process.env.OPENAI_MODEL as 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-4o-mini') || 'gpt-4o-mini',
      GTIN_PROVIDER: (process.env.GTIN_PROVIDER as 'upcitemdb' | 'barcodelookup') || 'upcitemdb',
      UPCITEMDB_USER_KEY: process.env.UPCITEMDB_USER_KEY || 'build-upcitemdb-key',
      BARCODE_LOOKUP_API_KEY: process.env.BARCODE_LOOKUP_API_KEY || undefined,
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || undefined,
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    }
  }
})()

// Helper to get billing config
export const getBillingConfig = () => {
  switch (env.BILLING_PROVIDER) {
    case 'lemon-squeezy':
      return {
        provider: 'lemon-squeezy' as const,
        webhookSecret: env.LEMON_SQUEEZY_WEBHOOK_SECRET,
        apiKey: env.LEMON_SQUEEZY_API_KEY,
      }
    case 'paddle':
      return {
        provider: 'paddle' as const,
        webhookSecret: env.PADDLE_WEBHOOK_SECRET,
        apiKey: env.PADDLE_API_KEY,
      }
    case 'polar':
      return {
        provider: 'polar' as const,
        webhookSecret: env.POLAR_WEBHOOK_SECRET,
        apiKey: env.POLAR_ACCESS_TOKEN,
      }
    default:
      return null
  }
}

// Helper to get GTIN provider config
export const getGtinConfig = () => {
  switch (env.GTIN_PROVIDER) {
    case 'upcitemdb':
      return {
        provider: 'upcitemdb' as const,
        userKey: env.UPCITEMDB_USER_KEY,
        baseUrl: 'https://api.upcitemdb.com/prod',
        trialUrl: 'https://api.upcitemdb.com/prod/trial',
      }
    case 'barcodelookup':
      return {
        provider: 'barcodelookup' as const,
        apiKey: env.BARCODE_LOOKUP_API_KEY,
        baseUrl: 'https://api.barcodelookup.com/v3',
      }
    default:
      return {
        provider: 'upcitemdb' as const,
        userKey: undefined,
        baseUrl: 'https://api.upcitemdb.com/prod',
        trialUrl: 'https://api.upcitemdb.com/prod/trial',
      }
  }
}

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
