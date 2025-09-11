import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const url = request.nextUrl
  
  // Log for debugging
  console.log('Middleware - Host:', host)
  console.log('Middleware - URL:', url.toString())
  console.log('Middleware - Protocol:', request.headers.get('x-forwarded-proto'))
  
  // Handle www redirect to naked domain
  if (host?.startsWith('www.')) {
    const nakedDomain = host.replace('www.', '')
    const redirectUrl = new URL(url)
    redirectUrl.host = nakedDomain
    console.log('Redirecting www to naked domain:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl, 301)
  }
  
  // Ensure HTTPS in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    const httpsUrl = new URL(url)
    httpsUrl.protocol = 'https:'
    console.log('Redirecting to HTTPS:', httpsUrl.toString())
    return NextResponse.redirect(httpsUrl, 301)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

