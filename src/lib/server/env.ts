import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url().optional(),
  // For ngrok support - can be set to ngrok URL
  NEXTAUTH_NGROK_URL: z.string().url().optional(),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  
  // Billing Provider
  BILLING_PROVIDER: z.enum(['lemon-squeezy', 'paddle', 'polar']).optional(),
  
  // Lemon Squeezy
  LEMON_SQUEEZY_WEBHOOK_SECRET: z.string().optional(),
  LEMON_SQUEEZY_API_KEY: z.string().optional(),
  NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID: z.string().optional(),
  NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID: z.string().optional(),
  
  // Paddle
  PADDLE_WEBHOOK_SECRET: z.string().optional(),
  PADDLE_API_KEY: z.string().optional(),
  
  // Polar
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_API_KEY: z.string().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  
  // Analytics
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

export const env = envSchema.parse(getEnvWithFallbacks())

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
        apiKey: env.POLAR_API_KEY,
      }
    default:
      return null
  }
}
