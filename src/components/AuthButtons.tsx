 'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Crown, Sparkles, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearAuthData } from '@/lib/auth'
import { getRedirectUrl } from '@/lib/utils/url'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import LogoIcon from './LogoIcon'

export function AuthButtons() {
  const { data: session, status } = useSession()
  const router = useRouter()
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
  } | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(false)

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
      // В случае ошибки все равно перенаправляем
      router.push('/')
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-7 w-7 rounded-lg">
            <Avatar className="h-7 w-7 rounded-lg">
              <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
              <AvatarFallback>
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{session.user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Plan Information */}
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">
                {subscriptionData ? `${subscriptionData.plan === 'pro' ? 'Pro' : 'Free'} план` : 'Загрузка...'}
              </span>
            </div>
            
            {subscriptionData && (
              <div className="space-y-2">
                {/* Magic Fill Usage */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                    <span className="text-slate-600">Magic Fill</span>
                  </div>
                  <span className="text-slate-900 font-medium">
                    {subscriptionData.currentUsage.magicFillCount} / {subscriptionData.limits.magicFillCount}
                  </span>
                </div>
                
                {/* Photos Usage */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <LogoIcon className="h-3 w-3 text-blue-600" size="sm" />
                    <span className="text-slate-600">Фото</span>
                  </div>
                  <span className="text-slate-900 font-medium">
                    {subscriptionData.currentUsage.photosProcessed} / {subscriptionData.limits.photosProcessed}
                  </span>
                </div>
                
                {/* Exports Usage */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-slate-600">Экспорты</span>
                  </div>
                  <span className="text-slate-900 font-medium">
                    {subscriptionData.currentUsage.exportCount} / {subscriptionData.limits.exportCount}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Выйти</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button onClick={() => signIn('google', { 
      callbackUrl: getRedirectUrl('/studio')
    })} variant="outline">
      Войти
    </Button>
  )
}
