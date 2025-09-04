import { env } from './env'
import { logger } from './logger'

export interface LemonSqueezyCustomer {
  id: number
  email: string
  name: string
  city?: string
  region?: string
  country?: string
  total_revenue_currency?: string
  mrr?: number
  status?: string
  created_at: string
  updated_at: string
}

export interface LemonSqueezySubscription {
  id: string
  type: string
  attributes: {
    store_id: number
    customer_id: number
    product_id: number
    variant_id: number
    product_name: string
    variant_name: string
    status: string
    status_formatted: string
    trial_ends_at: string | null
    renews_at: string | null
    ends_at: string | null
    created_at: string
    updated_at: string
    test_mode: boolean
  }
  relationships: {
    store: {
      data: {
        id: string
        type: string
      }
    }
    customer: {
      data: {
        id: string
        type: string
      }
    }
  }
}

export class LemonSqueezyAPI {
  private apiKey: string
  private baseUrl = 'https://api.lemonsqueezy.com/v1'

  constructor() {
    this.apiKey = env.LEMON_SQUEEZY_API_KEY || ''
    if (!this.apiKey) {
      logger.warn('Lemon Squeezy API key not configured')
    }
  }

  async getCustomer(customerId: number): Promise<LemonSqueezyCustomer | null> {
    if (!this.apiKey) {
      logger.warn('Cannot fetch customer: API key not configured')
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        logger.warn({ message: 'Failed to fetch customer', customerId, status: response.status })
        return null
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error', customerId })
      return null
    }
  }

  async getSubscription(subscriptionId: string): Promise<LemonSqueezySubscription | null> {
    if (!this.apiKey) {
      logger.warn('Cannot fetch subscription: API key not configured')
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        logger.warn({ message: 'Failed to fetch subscription', subscriptionId, status: response.status })
        return null
      }

      const data = await response.json()
      return data.data
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error', subscriptionId })
      return null
    }
  }

  async listSubscriptions(customerId?: number): Promise<LemonSqueezySubscription[]> {
    if (!this.apiKey) {
      logger.warn('Cannot list subscriptions: API key not configured')
      return []
    }

    try {
      const params = new URLSearchParams()
      if (customerId) {
        params.append('filter[customer_id]', customerId.toString())
      }

      const response = await fetch(`${this.baseUrl}/subscriptions?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        logger.warn({ message: 'Failed to list subscriptions', customerId, status: response.status })
        return []
      }

      const data = await response.json()
      return data.data || []
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : 'Unknown error', customerId })
      return []
    }
  }
}

export const lemonSqueezyAPI = new LemonSqueezyAPI()

