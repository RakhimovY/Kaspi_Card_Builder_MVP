'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PolarCheckoutProps {
  productId?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  children?: React.ReactNode
  className?: string
}

export function PolarCheckout({ 
  productId, 
  priceId, 
  onSuccess, 
  onError, 
  children,
  className 
}: PolarCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    if (!productId) {
      onError?.('Product ID not configured')
      return
    }

    setIsLoading(true)

    try {
      // Redirect to Polar adapter route with products
      const url = new URL('/api/polar/checkout', window.location.origin)
      url.searchParams.set('products', productId)
      window.location.href = url.toString()
      
    } catch (error) {
      console.error('Polar checkout error:', error)
      onError?.(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Обработка...' : (children || 'Оформить Pro')}
    </Button>
  )
}

// Hook for using Polar checkout
export function usePolarCheckout() {
  const [isLoading, setIsLoading] = useState(false)

  const createCheckout = async (priceId: string) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/polar/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/studio?success=true`,
          cancel_url: `${window.location.origin}/landing?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      return url
      
    } catch (error) {
      console.error('Polar checkout error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createCheckout,
    isLoading,
  }
}
