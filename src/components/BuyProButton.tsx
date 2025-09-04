'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Loader2, CheckCircle } from 'lucide-react'
import { useTranslations } from '@/lib/useTranslations'

interface BuyProButtonProps {
  className?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  onSuccess?: () => void
}

export function BuyProButton({ 
  className, 
  variant = "default", 
  size = "default", 
  disabled = false,
  onSuccess 
}: BuyProButtonProps) {
  const { t } = useTranslations()
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle')

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
    if (purchaseStatus === 'success') return 'default'
    if (purchaseStatus === 'error') return 'destructive'
    return variant
  }

  return (
    <Button
      onClick={handlePurchase}
      disabled={disabled || purchaseStatus === 'purchasing' || purchaseStatus === 'success'}
      variant={getButtonVariant()}
      size={size}
      className={className}
    >
      {getButtonContent()}
    </Button>
  )
}
