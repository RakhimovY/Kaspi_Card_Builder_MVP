'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import { useAuthTranslations } from '@/lib/useTranslations'
import { 
  User, 
  Mail, 
  Calendar, 
  LogOut,
  Crown,
  Zap,
  Camera,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <Header 
        variant="profile"
        showBackButton={true}
        backHref="/"
        showAuthButtons={false}
        showLanguageSwitcher={false}
      />
      
      {/* Main content with matching container width */}
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session.user.name}</h1>
                <p className="text-gray-600">{session.user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    <User className="w-3 h-3 mr-1" />
                    {session.user.id}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {lastLogin}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/studio">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Открыть студию
                </Button>
              </Link>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {profile.signOut}
              </Button>
            </div>
          </div>
        </div>

        {/* Subscription Plan Card */}
        <div className="mb-8">
          <Card className="overflow-hidden shadow-lg border-0 bg-gradient-to-r from-white to-gray-50">
            <CardContent className="p-6">
              {loadingSubscription ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ) : subscriptionData ? (
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      subscriptionData.plan === 'pro' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-xl font-bold ${
                          subscriptionData.plan === 'pro' ? 'text-purple-800' : 'text-green-800'
                        }`}>
                          {subscriptionData.plan === 'pro' ? 'Pro' : 'Free'} план
                        </h3>
                        {subscriptionData.plan === 'pro' && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Активен
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${
                        subscriptionData.plan === 'pro' ? 'text-purple-600' : 'text-green-600'
                      }`}>
                        {subscriptionData.plan === 'pro' 
                          ? 'До 500 фото в месяц • Приоритетная обработка' 
                          : 'До 50 фото в месяц • Базовые функции'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {subscriptionData.plan === 'free' ? (
                    <Button 
                      onClick={handleUpgrade} 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      {profile.upgrade}
                    </Button>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-1">Следующее списание</p>
                      <p className="font-semibold text-gray-900">
                        {subscriptionData.subscription?.currentPeriodEnd 
                          ? new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString('ru-RU')
                          : 'Не указано'
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{profile.freePlan}</h3>
                    <p className="text-sm text-gray-600">{profile.freePlanLimit}</p>
                  </div>
                  <Button 
                    onClick={handleUpgrade}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {profile.upgrade}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Overview */}
        {subscriptionData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center p-6 shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-1">
                {subscriptionData.currentUsage.photosProcessed}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{profile.processedPhotos}</p>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (subscriptionData.currentUsage.photosProcessed / subscriptionData.limits.photosProcessed) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {subscriptionData.currentUsage.photosProcessed} / {subscriptionData.limits.photosProcessed}
              </p>
            </Card>

            <Card className="text-center p-6 shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-1">
                {subscriptionData.currentUsage.exportCount}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{profile.exports}</p>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (subscriptionData.currentUsage.exportCount / subscriptionData.limits.exportCount) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {subscriptionData.currentUsage.exportCount} / {subscriptionData.limits.exportCount}
              </p>
            </Card>

            <Card className="text-center p-6 shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-purple-600 mb-1">
                {subscriptionData.currentUsage.magicFillCount}
              </h3>
              <p className="text-sm text-gray-600 mb-2">Magic Fill</p>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (subscriptionData.currentUsage.magicFillCount / subscriptionData.limits.magicFillCount) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {subscriptionData.currentUsage.magicFillCount} / {subscriptionData.limits.magicFillCount}
              </p>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}
