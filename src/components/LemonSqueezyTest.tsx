'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react'

export function LemonSqueezyTest() {
  const [mockMode, setMockMode] = useState(true) // Enable mock mode by default
  const [scriptStatus, setScriptStatus] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'purchasing' | 'success' | 'error'>('idle')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    if (mockMode) {
      setScriptStatus('loaded')
      addDebugInfo('Mock mode enabled - simulating Lemon Squeezy')
      return
    }

    const checkScript = () => {
      if (typeof window !== 'undefined') {
        if ((window as any).createLemonSqueezy) {
          setScriptStatus('loaded')
          addDebugInfo('Lemon Squeezy script detected')
        } else {
          setScriptStatus('loading')
        }
      }
    }

    checkScript()
    const interval = setInterval(checkScript, 1000)
    
    return () => clearInterval(interval)
  }, [mockMode])

  const mockPurchasePro = async () => {
    setPurchaseStatus('purchasing')
    addDebugInfo('Starting mock Pro purchase...')

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

      addDebugInfo(`Mock purchase successful: ${JSON.stringify(data)}`)
      setPurchaseStatus('success')
      
      // Refresh the page after 2 seconds to show updated subscription status
      setTimeout(() => {
        window.location.reload()
      }, 2000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addDebugInfo(`Mock purchase failed: ${errorMessage}`)
      setPurchaseStatus('error')
    }
  }

  const testOverlay = () => {
    if (mockMode) {
      mockPurchasePro()
      return
    }

    if (typeof window !== 'undefined' && (window as any).createLemonSqueezy) {
      setPurchaseStatus('purchasing')
      addDebugInfo('Attempting to open overlay...')
      
      try {
        (window as any).createLemonSqueezy({
          productId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID || '123456',
          variantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID || '789012',
          name: 'Trade Card Builder Pro',
          email: '',
          successCallback: (data: any) => {
            addDebugInfo(`Payment successful: ${JSON.stringify(data)}`)
            setPurchaseStatus('success')
          },
          closedCallback: () => {
            addDebugInfo('Overlay closed')
            setPurchaseStatus('idle')
          },
          loadingCallback: (loading: boolean) => {
            addDebugInfo(`Loading state: ${loading}`)
          }
        })
        
        addDebugInfo('Overlay opened successfully')
      } catch (error) {
        addDebugInfo(`Error opening overlay: ${error}`)
        setPurchaseStatus('error')
      }
    } else {
      addDebugInfo('Lemon Squeezy not available')
      setPurchaseStatus('error')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loaded':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'loading':
      case 'purchasing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loaded':
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'loading':
      case 'purchasing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mockMode ? '🎭' : '🍋'} {mockMode ? 'Mock' : 'Lemon Squeezy'} Pro Purchase Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mock Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="text-sm font-medium">Mock Mode:</span>
          <Button
            variant={mockMode ? "default" : "outline"}
            size="sm"
            onClick={() => setMockMode(!mockMode)}
          >
            {mockMode ? 'Enabled' : 'Disabled'}
          </Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {mockMode ? 'Mock Status:' : 'Script Status:'}
            </span>
            {getStatusIcon(scriptStatus)}
            <Badge className={getStatusColor(scriptStatus)}>
              {scriptStatus}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Purchase Status:</span>
            {getStatusIcon(purchaseStatus)}
            <Badge className={getStatusColor(purchaseStatus)}>
              {purchaseStatus}
            </Badge>
          </div>
        </div>

        {/* Environment Variables */}
        {!mockMode && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Environment Variables:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Product ID:</span>
                <span className="ml-2 text-gray-600">
                  {process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID || 'Not set (using fallback: 123456)'}
                </span>
              </div>
              <div>
                <span className="font-medium">Variant ID:</span>
                <span className="ml-2 text-gray-600">
                  {process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID || 'Not set (using fallback: 789012)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mock Info */}
        {mockMode && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Mock Purchase Info:</h4>
            <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-700">
              <p>• Creates Pro subscription in database</p>
              <p>• Sets subscription period for 1 month</p>
              <p>• Updates user limits to Pro tier</p>
              <p>• No real payment processing</p>
            </div>
          </div>
        )}

        {/* Test Button */}
        <Button 
          onClick={testOverlay}
          disabled={scriptStatus !== 'loaded' || purchaseStatus === 'purchasing'}
          className="w-full"
        >
          {purchaseStatus === 'purchasing' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mockMode ? 'Processing Mock Purchase...' : 'Opening Overlay...'}
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              {mockMode ? 'Buy Pro Plan (Mock)' : 'Test Lemon Squeezy Overlay'}
            </>
          )}
        </Button>

        {/* Success Message */}
        {purchaseStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                {mockMode ? 'Pro subscription activated!' : 'Payment successful!'}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              {mockMode ? 'Page will refresh in 2 seconds to show updated status.' : 'Check your email for confirmation.'}
            </p>
          </div>
        )}

        {/* Debug Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Debug Information:</h4>
          <div className="bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500 text-sm">No debug information yet</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-gray-700 font-mono">
                  {info}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Manual Check */}
        {!mockMode && (
          <div className="text-xs text-gray-600">
            <p>If overlay doesn't work, check:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Lemon Squeezy script is loaded (check Network tab)</li>
              <li>Product ID and Variant ID are correct</li>
              <li>No Content Security Policy blocking the script</li>
              <li>Console for JavaScript errors</li>
            </ul>
          </div>
        )}

        {mockMode && (
          <div className="text-xs text-gray-600">
            <p>Mock mode benefits:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Test subscription logic without real payments</li>
              <li>Instant Pro plan activation in database</li>
              <li>Perfect for development and testing</li>
              <li>No external dependencies required</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

