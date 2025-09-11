import { env } from './env'
import { Polar as PolarSDK } from '@polar-sh/sdk'

// Polar.sh API types
interface PolarCustomer {
  id: string
  email: string
  name?: string
  created_at: string
  updated_at: string
}

interface PolarSubscription {
  id: string
  customer_id: string
  product_id: string
  price_id: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

interface PolarProduct {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

interface PolarPrice {
  id: string
  product_id: string
  amount: number
  currency: string
  interval?: 'month' | 'year'
  created_at: string
  updated_at: string
}

// Official Polar SDK instance per docs: https://docs.polar.sh/api-reference/introduction#using-sdks
export const polar = new PolarSDK({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: env.NODE_ENV === 'development' ? 'sandbox' : 'production',
})

class PolarAPI {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    // Select base URL strictly by environment (mirrors SDK server option)
    this.baseUrl = env.NODE_ENV === 'development'
      ? 'https://sandbox-api.polar.sh/v1'
      : 'https://api.polar.sh/v1'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Polar API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getCustomer(customerId: string): Promise<PolarCustomer | null> {
    try {
      return await this.request<PolarCustomer>(`/customers/${customerId}`)
    } catch (error) {
      console.error('Failed to fetch customer from Polar:', error)
      return null
    }
  }

  async getSubscription(subscriptionId: string): Promise<PolarSubscription | null> {
    try {
      return await this.request<PolarSubscription>(`/subscriptions/${subscriptionId}`)
    } catch (error) {
      console.error('Failed to fetch subscription from Polar:', error)
      return null
    }
  }

  async listSubscriptions(customerId: string): Promise<PolarSubscription[]> {
    try {
      const response = await this.request<{ items: PolarSubscription[] }>(`/customers/${customerId}/subscriptions`)
      return response.items
    } catch (error) {
      console.error('Failed to list subscriptions from Polar:', error)
      return []
    }
  }

  async getProduct(productId: string): Promise<PolarProduct | null> {
    try {
      return await this.request<PolarProduct>(`/products/${productId}`)
    } catch (error) {
      console.error('Failed to fetch product from Polar:', error)
      return null
    }
  }

  async getPrice(priceId: string): Promise<PolarPrice | null> {
    try {
      return await this.request<PolarPrice>(`/prices/${priceId}`)
    } catch (error) {
      console.error('Failed to fetch price from Polar:', error)
      return null
    }
  }

  async createCheckoutSession(data: {
    price_id: string
    customer_id?: string
    success_url: string
    cancel_url: string
    metadata?: Record<string, string>
  }): Promise<{ url: string }> {
    return await this.request<{ url: string }>('/checkout/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    return await this.request<{ url: string }>('/customer-portal/sessions', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: customerId,
        return_url: returnUrl,
      }),
    })
  }
}

// Export singleton instance
export const polarAPI = new PolarAPI(env.POLAR_ACCESS_TOKEN)
