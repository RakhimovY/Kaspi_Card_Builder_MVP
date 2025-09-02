'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthTranslations } from '@/lib/useTranslations'
import Link from 'next/link'
import { Suspense } from 'react'

function AuthErrorContent() {
  const { error: errorTranslations } = useAuthTranslations()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return errorTranslations.configuration
      case 'AccessDenied':
        return errorTranslations.accessDenied
      case 'Verification':
        return errorTranslations.verification
      default:
        return errorTranslations.default
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            {errorTranslations.title}
          </CardTitle>
          <CardDescription>
            {getErrorMessage(errorParam)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            {errorTranslations.help}
          </div>
          <div className="flex space-x-2">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">
                {errorTranslations.tryAgain}
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">
                {errorTranslations.goHome}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
