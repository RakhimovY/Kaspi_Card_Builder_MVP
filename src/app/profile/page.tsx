'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthTranslations } from '@/lib/useTranslations'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Shield, 
  Activity,
  FileImage,
  Download,
  History,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { clearAuthData } from '@/lib/auth'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profile } = useAuthTranslations()
  const [lastLogin, setLastLogin] = useState<string>('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile')
    }
    
    // Получаем дату последнего входа из localStorage или устанавливаем текущую
    const storedLastLogin = localStorage.getItem('lastLogin')
    if (storedLastLogin) {
      setLastLogin(storedLastLogin)
    } else {
      const now = new Date().toLocaleString('ru-RU')
      setLastLogin(now)
      localStorage.setItem('lastLogin', now)
    }
  }, [status, router])

  const handleSignOut = async () => {
    try {
      // Очищаем клиентские данные
      clearAuthData()
      
      // Очищаем сессию NextAuth
      await signOut({ 
        callbackUrl: '/',
        redirect: false 
      })
      
      // Дополнительная очистка через API
      await fetch('/api/auth/signout', { method: 'POST' })
      
      // Принудительно перенаправляем на главную страницу
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
      router.push('/')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600">{profile.loadingProfile}</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Заголовок и навигация */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {profile.backToHome}
              </Button>
            </Link>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {profile.signOut}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация профиля */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback className="text-2xl">
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl">{session.user.name}</CardTitle>
                <p className="text-gray-600">{session.user.email}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">{profile.userId}</p>
                      <p className="font-medium">{session.user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{session.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">{profile.lastLogin}</p>
                      <p className="font-medium">{lastLogin}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Дополнительная информация и действия */}
          <div className="lg:col-span-2 space-y-6">
            {/* Статистика использования */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  {profile.usageStats}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <FileImage className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-blue-600">0</p>
                    <p className="text-sm text-gray-600">{profile.processedPhotos}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">0</p>
                    <p className="text-sm text-gray-600">{profile.exports}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <History className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold text-purple-600">0</p>
                    <p className="text-sm text-gray-600">{profile.sessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-gray-500" />
                  {profile.quickActions}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/studio">
                    <Button className="w-full h-16 text-lg" variant="outline">
                      <FileImage className="w-5 h-5 mr-2" />
                      {profile.openStudio}
                    </Button>
                  </Link>
                  <Button className="w-full h-16 text-lg" variant="outline" disabled>
                    <Shield className="w-5 h-5 mr-2" />
                    {profile.securitySettings}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Информация о тарифе */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  {profile.currentPlan}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">{profile.freePlan}</p>
                      <p className="text-sm text-green-600">{profile.freePlanLimit}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      {profile.upgrade}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
