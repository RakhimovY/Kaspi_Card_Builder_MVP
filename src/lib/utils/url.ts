/**
 * Utility functions for URL handling
 */

/**
 * Gets the current base URL
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use current location
    return window.location.origin
  }
  
  // Server-side: check environment variables
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Fallback to localhost
  return 'http://localhost:3000'
}

/**
 * Gets the current domain for comparison
 */
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname
  }
  
  // Server-side: parse from NEXTAUTH_URL
  if (process.env.NEXTAUTH_URL) {
    try {
      return new URL(process.env.NEXTAUTH_URL).hostname
    } catch {
      // Fallback
    }
  }
  
  return 'localhost'
}

/**
 * Checks if current domain is ngrok
 */
export function isNgrokDomain(): boolean {
  const domain = getCurrentDomain()
  return domain.includes('ngrok') || domain.includes('ngrok-free.app')
}

/**
 * Builds absolute URL for the current domain
 */
export function buildUrl(path: string): string {
  const baseUrl = getBaseUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  return `${baseUrl}${cleanPath}`
}

/**
 * Gets the appropriate redirect URL based on current domain
 */
export function getRedirectUrl(path: string): string {
  // Always use current location for redirects to avoid conflicts
  if (typeof window !== 'undefined') {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${window.location.origin}${cleanPath}`
  }
  
  // Server-side: use environment variable
  if (process.env.NEXTAUTH_URL) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${process.env.NEXTAUTH_URL}${cleanPath}`
  }
  
  // Fallback
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `http://localhost:3000${cleanPath}`
}

