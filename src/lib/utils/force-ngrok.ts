/**
 * Utility to force ngrok URLs in development
 */

/**
 * Forces ngrok URL if we're in development and NEXTAUTH_NGROK_URL is set
 */
export function forceNgrokUrl(url: string): string {
  if (process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_NGROK_URL) {
    const ngrokUrl = process.env.NEXTAUTH_NGROK_URL
    
    // Replace localhost with ngrok
    if (url.includes('localhost:3000')) {
      const fixedUrl = url.replace('http://localhost:3000', ngrokUrl)
      console.log('Force ngrok - Fixed URL:', { from: url, to: fixedUrl })
      return fixedUrl
    }
    
    // If it's a relative URL, make it absolute with ngrok
    if (url.startsWith('/')) {
      const fullUrl = `${ngrokUrl}${url}`
      console.log('Force ngrok - Made absolute:', { from: url, to: fullUrl })
      return fullUrl
    }
  }
  
  return url
}

/**
 * Forces ngrok URL for NextAuth redirects
 */
export function forceNgrokRedirect(url: string, baseUrl: string): string {
  if (process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_NGROK_URL) {
    const ngrokUrl = process.env.NEXTAUTH_NGROK_URL
    
    // If baseUrl is localhost, replace with ngrok
    if (baseUrl.includes('localhost:3000')) {
      const newBaseUrl = baseUrl.replace('http://localhost:3000', ngrokUrl)
      
      if (url.startsWith('/')) {
        return `${newBaseUrl}${url}`
      } else if (url.startsWith('http://localhost:3000')) {
        return url.replace('http://localhost:3000', ngrokUrl)
      }
    }
  }
  
  return url
}

/**
 * Gets the forced base URL for the current environment
 */
export function getForcedBaseUrl(): string {
  if (process.env.NODE_ENV === 'development' && process.env.NEXTAUTH_NGROK_URL) {
    return process.env.NEXTAUTH_NGROK_URL
  }
  
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

