import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth-config'
import { getBaseUrlFromRequest } from '@/lib/server/nextauth-url'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ success: true, message: 'Already signed out' })
    }

    // Создаем ответ с очисткой cookies
    const baseUrl = getBaseUrlFromRequest(request)
    const response = NextResponse.json({ 
      success: true, 
      message: 'Sign out successful',
      redirectUrl: `${baseUrl}/`
    })

    // Очищаем все cookies, связанные с аутентификацией
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.session-token',
      '__Secure-next-auth.csrf-token',
      '__Secure-next-auth.callback-url'
    ]

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    console.log('API signout: Cookies cleared for user:', session.user.email)
    
    return response
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
