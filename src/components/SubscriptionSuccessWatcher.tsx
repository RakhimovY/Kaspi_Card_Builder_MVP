'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export default function SubscriptionSuccessWatcher() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const checkoutId = params.get('checkout_id')

    if (success && checkoutId) {
      // Wait a moment for webhook to upsert subscription, then refetch
      const timer = setTimeout(async () => {
        try {
          // First check current subscription status
          const res = await fetch('/api/subscription', { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            if (data?.plan === 'pro' && data?.status === 'active') {
              toast.success('Подписка активирована! Спасибо за покупку Pro!')
              return
            }
          }

          // If still free, try to sync subscription from checkout
          const syncRes = await fetch('/api/polar/sync-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkoutId })
          })

          if (syncRes.ok) {
            const syncData = await syncRes.json()
            if (syncData?.plan === 'pro' && syncData?.status === 'active') {
              toast.success('Подписка активирована! Спасибо за покупку Pro!')
            } else {
              toast.info('Обработка оплаты. Статус скоро обновится. Обновите страницу через пару секунд.')
            }
          } else {
            toast.info('Обработка оплаты. Статус скоро обновится. Обновите страницу через пару секунд.')
          }
        } catch (_) {
          toast.info('Обработка оплаты. Статус скоро обновится. Обновите страницу через пару секунд.')
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  return null
}
