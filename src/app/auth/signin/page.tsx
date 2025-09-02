'use client'

import { signIn, getSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthTranslations } from '@/lib/useTranslations'
import { useRouter } from 'next/navigation'
import { Loader2, Chrome } from 'lucide-react'
import { clearAuthData } from '@/lib/auth'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const { signin } = useAuthTranslations()
  const router = useRouter()

  useEffect(() => {
    // Принудительно очищаем все данные аутентификации при загрузке страницы
    clearAuthData()
    
    // Проверяем, есть ли уже активная сессия
    const checkSession = async () => {
      try {
        const session = await getSession()
        if (session) {
          // Если есть активная сессия, перенаправляем в студию
          router.push('/studio')
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setIsCheckingSession(false)
      }
    }

    // Небольшая задержка для полной очистки данных
    setTimeout(checkSession, 100)
  }, [router])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Принудительно запрашиваем выбор аккаунта Google
      await signIn('google', { 
        callbackUrl: '/studio',
        prompt: 'select_account'
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{signin.title}</CardTitle>
          <CardDescription>{signin.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
            variant="outline"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Вход...
              </>
            ) : (
              <>
                <Chrome className="h-4 w-4" />
                {signin.google}
              </>
            )}
          </Button>
          
          <div className="text-center text-sm text-gray-500">
            <p>Войдите с помощью Google аккаунта</p>
            <p className="mt-1">При каждом входе вы сможете выбрать аккаунт</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
