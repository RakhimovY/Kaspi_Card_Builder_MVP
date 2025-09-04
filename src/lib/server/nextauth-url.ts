import { env } from './env'

/**
 * Gets the appropriate NextAuth URL based on current environment and domain
 */
export function getNextAuthUrl(): string {
  // If NEXTAUTH_URL is explicitly set, use it
  if (env.NEXTAUTH_URL) {
    return env.NEXTAUTH_URL
  }
  
  // Check if we're in development and should use ngrok
  if (process.env.NODE_ENV === 'development') {
    // Check if we're running behind ngrok
    const host = process.env.HOST || 'localhost'
    const port = process.env.PORT || '3000'
    
    // If host contains ngrok, use ngrok URL from environment
    if (host.includes('ngrok') || process.env.NEXTAUTH_NGROK_URL) {
      // Use environment variable, no hardcoded fallback
      if (process.env.NEXTAUTH_NGROK_URL) {
        return process.env.NEXTAUTH_NGROK_URL
      }
    }
    
    // Otherwise use localhost
    return `http://${host}:${port}`
  }
  
  // Production fallback
  return 'http://localhost:3000'
}

/**
 * Gets the base URL for the current request context
 */
export function getBaseUrlFromRequest(request: Request): string {
  const host = request.headers.get('host')
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  
  if (host) {
    // Check if it's ngrok
    if (host.includes('ngrok')) {
      return `${protocol}://${host}`
    }
    
    // Check if it's localhost
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return `http://${host}`
    }
    
    // Other domains
    return `${protocol}://${host}`
  }
  
  // Fallback
  return getNextAuthUrl()
}

