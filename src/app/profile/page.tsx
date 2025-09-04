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
  LogOut,
  Crown,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { clearAuthData } from '@/lib/auth'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { profile } = useAuthTranslations()
  const [lastLogin, setLastLogin] = useState<string>('')
  const [subscriptionData, setSubscriptionData] = useState<{
    plan: string;
    status: string;
    limits: {
      photosProcessed: number;
      magicFillCount: number;
      exportCount: number;
    };
    currentUsage: {
      photosProcessed: number;
      magicFillCount: number;
      exportCount: number;
    };
    subscription?: {
      id: string;
      provider: string;
      plan: string;
      status: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      cancelAtPeriodEnd: boolean;
    };
  } | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)

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

  // Загружаем данные подписки при аутентификации
  useEffect(() => {
    if (session?.user?.email) {
      fetchSubscriptionInfo()
    }
  }, [session])

  const fetchSubscriptionInfo = async () => {
    try {
      setLoadingSubscription(true)
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

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

  const handleUpgrade = () => {
    // Перенаправляем на лендинг с якорем к секции тарифов
    router.push('/landing#pricing')
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
                    <p className="text-2xl font-bold text-blue-600">
                      {subscriptionData?.currentUsage?.photosProcessed || 0}
                    </p>
                    <p className="text-sm text-gray-600">{profile.processedPhotos}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">
                      {subscriptionData?.currentUsage?.exportCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">{profile.exports}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <History className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold text-purple-600">
                      {subscriptionData?.currentUsage?.magicFillCount || 0}
                    </p>
                    <p className="text-sm text-gray-600">Magic Fill</p>
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
                  <Crown className="w-5 h-5 mr-2 text-green-500" />
                  {profile.currentPlan}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSubscription ? (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : subscriptionData ? (
                  <div className={`p-4 rounded-lg border ${
                    subscriptionData.plan === 'pro' 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Crown className={`w-5 h-5 ${
                          subscriptionData.plan === 'pro' ? 'text-purple-600' : 'text-green-600'
                        }`} />
                        <div>
                          <p className={`font-semibold ${
                            subscriptionData.plan === 'pro' ? 'text-purple-800' : 'text-green-800'
                          }`}>
                            {subscriptionData.plan === 'pro' ? 'Pro' : 'Free'} план
                          </p>
                          <p className={`text-sm ${
                            subscriptionData.plan === 'pro' ? 'text-purple-600' : 'text-green-600'
                          }`}>
                            {subscriptionData.plan === 'pro' 
                              ? 'До 500 фото в месяц' 
                              : 'До 50 фото в месяц'
                            }
                          </p>
                        </div>
                      </div>
                      {subscriptionData.plan === 'free' && (
                        <Button 
                          onClick={handleUpgrade} 
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          {profile.upgrade}
                        </Button>
                      )}
                    </div>
                    
                    {/* Лимиты использования */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Фото обработано:</span>
                        <span className="font-medium">
                          {subscriptionData.currentUsage.photosProcessed} / {subscriptionData.limits.photosProcessed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Magic Fill:</span>
                        <span className="font-medium">
                          {subscriptionData.currentUsage.magicFillCount} / {subscriptionData.limits.magicFillCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Экспорты:</span>
                        <span className="font-medium">
                          {subscriptionData.currentUsage.exportCount} / {subscriptionData.limits.exportCount}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">{profile.freePlan}</p>
                        <p className="text-sm text-gray-600">{profile.freePlanLimit}</p>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        {profile.upgrade}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
