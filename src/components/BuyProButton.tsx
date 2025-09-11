'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2, CheckCircle, Crown } from 'lucide-react'
import { useTranslations } from '@/lib/useTranslations'
import { useSession } from 'next-auth/react'

interface BuyProButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  onSuccess?: () => void
}

interface SubscriptionData {
  plan: string
  status: string
  subscription: {
    plan: string
    status: string
  } | null
}

export function BuyProButton({ 
  className, 
  variant = "default", 
  size = "default", 
  disabled = false,
  onSuccess 
}: BuyProButtonProps) {
  const { t } = useTranslations()
  const { data: session } = useSession()
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle')
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false)

  // Fetch subscription data when component mounts or session changes
  useEffect(() => {
    if (session?.user?.email && !subscriptionData) {
      fetchSubscriptionData()
    }
  }, [session?.user?.email, subscriptionData])

  const fetchSubscriptionData = async () => {
    if (isLoadingSubscription) return; // Prevent duplicate calls
    
    setIsLoadingSubscription(true)
    try {
      const response = await fetch('/api/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  // Check if user already has Pro subscription
  const hasProSubscription = subscriptionData?.plan === 'pro' && subscriptionData?.status === 'active'
  const isDisabled = disabled || hasProSubscription || isLoadingSubscription

  const handlePurchase = async () => {
    setPurchaseStatus('purchasing')

    try {
      const response = await fetch('/api/mock-purchase-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      setPurchaseStatus('success')
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh the page after 2 seconds to show updated subscription status
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      console.error('Purchase failed:', error)
      setPurchaseStatus('error')
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setPurchaseStatus('idle')
      }, 3000)
    }
  }

  const getButtonContent = () => {
    // Show Pro status if user already has Pro subscription
    if (hasProSubscription) {
      return (
        <>
          <Crown className="w-4 h-4 mr-2" />
          У вас уже есть Pro
        </>
      )
    }

    switch (purchaseStatus) {
      case 'purchasing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('common.processing')}...
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            {t('landing.pricing.pro.activated')}!
          </>
        )
      case 'error':
        return (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            {t('common.tryAgain')}
          </>
        )
      default:
        return (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            {t('landing.pricing.pro.buyPro')}
          </>
        )
    }
  }

  const getButtonVariant = () => {
    if (hasProSubscription) return 'secondary'
    if (purchaseStatus === 'success') return 'default'
    if (purchaseStatus === 'error') return 'destructive'
    return variant
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={isDisabled || purchaseStatus === 'purchasing' || purchaseStatus === 'success'}
      variant={getButtonVariant()}
      size={size}
      className={className}
    >
      {getButtonContent()}
    </Button>
  )
}
