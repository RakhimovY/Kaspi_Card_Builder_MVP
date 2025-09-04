'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Crown, Zap, Calendar, AlertCircle } from 'lucide-react'

interface SubscriptionData {
  plan: string
  status: string
  limits: {
    photosProcessed: number
    magicFillCount: number
    exportCount: number
  }
  currentUsage: {
    photosProcessed: number
    magicFillCount: number
    exportCount: number
  }
  subscription: {
    id: string
    provider: string
    plan: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
  user: {
    id: string
    email: string
    name: string
    lemonSqueezyCustomerId: string | null
  }
}

export function SubscriptionInfo() {
  const { data: session } = useSession()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      fetchSubscriptionInfo()
    }
    
    // Определяем, находимся ли мы в студии
    if (typeof window !== 'undefined') {
      setIsCompact(window.location.pathname === '/studio')
    }
  }, [session])

  const fetchSubscriptionInfo = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/subscription')
      if (!response.ok) {
        throw new Error('Failed to fetch subscription info')
      }
      const data = await response.json()
      setSubscriptionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    // Redirect to pricing page or open Lemon Squeezy overlay
    window.location.href = '/#pricing'
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Подписка
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Ошибка загрузки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSubscriptionInfo} variant="outline">
            Попробовать снова
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!subscriptionData) {
    return null
  }

  const { plan, status, limits, currentUsage, subscription } = subscriptionData

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800'
      case 'canceled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    return plan === 'pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="w-full">
      <CardHeader className={isCompact ? 'pb-3' : ''}>
        <CardTitle className={`flex items-center gap-2 ${isCompact ? 'text-lg' : ''}`}>
          <Crown className="w-5 h-5" />
          {isCompact ? 'Статус подписки' : 'Подписка'}
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-6 ${isCompact ? 'space-y-4' : ''}`}>
        {/* Plan Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={getPlanColor(plan)}>
              {plan === 'pro' ? 'Pro' : 'Free'}
            </Badge>
            <Badge className={getStatusColor(status)}>
              {status === 'active' ? 'Активна' : 
               status === 'past_due' ? 'Просрочена' : 
               status === 'canceled' ? 'Отменена' : 'Бесплатная'}
            </Badge>
          </div>
          {plan === 'free' && !isCompact && (
            <Button onClick={handleUpgrade} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Zap className="w-4 h-4 mr-2" />
              Обновить до Pro
            </Button>
          )}
        </div>

        {/* Usage Stats */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm text-gray-700">Использование в этом месяце</h4>
          
          {/* Photos Processed */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Обработано фото</span>
              <span className="font-medium">{currentUsage.photosProcessed} / {limits.photosProcessed}</span>
            </div>
            <Progress 
              value={getUsagePercentage(currentUsage.photosProcessed, limits.photosProcessed)} 
              className="h-2"
            />
          </div>

          {/* Magic Fill */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Magic Fill</span>
              <span className="font-medium">{currentUsage.magicFillCount} / {limits.magicFillCount}</span>
            </div>
            <Progress 
              value={getUsagePercentage(currentUsage.magicFillCount, limits.magicFillCount)} 
              className="h-2"
            />
          </div>

          {/* Exports */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Экспорты</span>
              <span className="font-medium">{currentUsage.exportCount} / {limits.exportCount}</span>
            </div>
            <Progress 
              value={getUsagePercentage(currentUsage.exportCount, limits.exportCount)} 
              className="h-2"
            />
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && !isCompact && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Детали подписки</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Провайдер:</span>
                <span className="capitalize">{subscription.provider.replace('-', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span>Период:</span>
                <span>
                  {new Date(subscription.currentPeriodStart).toLocaleDateString('ru-RU')} - {new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}
                </span>
              </div>
              {subscription.cancelAtPeriodEnd && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Отменена в конце периода</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Billing */}
        {subscription && subscription.status === 'active' && !subscription.cancelAtPeriodEnd && !isCompact && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Следующее списание: {new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

