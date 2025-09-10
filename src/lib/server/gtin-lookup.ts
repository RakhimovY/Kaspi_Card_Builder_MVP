import { z } from 'zod'
import { getGtinConfig } from './env'
import { logger } from './logger'
import { debugLogger } from './debug-logger'

// UPCitemdb API Response Schema
const upcitemdbItemSchema = z.object({
  ean: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  upc: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  dimension: z.string().optional(),
  weight: z.string().optional(),
  category: z.string().optional(),
  currency: z.string().optional(),
  lowest_recorded_price: z.number().optional(),
  highest_recorded_price: z.number().optional(),
  images: z.array(z.string()).optional(),
  offers: z.array(z.object({
    merchant: z.string().optional(),
    domain: z.string().optional(),
    title: z.string().optional(),
    currency: z.string().optional(),
    list_price: z.union([z.string(), z.number()]).optional(),
    price: z.number().optional(),
    shipping: z.string().optional(),
    condition: z.string().optional(),
    availability: z.string().optional(),
    link: z.string().optional(),
    updated_t: z.number().optional(),
  })).optional(),
})

const upcitemdbResponseSchema = z.object({
  code: z.string(),
  total: z.number(),
  offset: z.number(),
  items: z.array(upcitemdbItemSchema),
})

export interface NormalizedGtinData {
  gtin: string
  brand?: string
  name?: string
  model?: string
  category?: string
  description?: string
  images?: string[]
  price?: number
  currency?: string
  rawData: Record<string, unknown>
}

export interface GtinLookupResult {
  success: boolean
  data?: NormalizedGtinData
  error?: string
  fromCache?: boolean
}

/**
 * Lookup GTIN using UPCitemdb API
 */
export async function lookupGtinUpcitemdb(
  gtin: string,
  usePaidEndpoint: boolean = false
): Promise<GtinLookupResult> {
  try {
    const config = getGtinConfig()
    
    if (config.provider !== 'upcitemdb') {
      throw new Error('UPCitemdb provider not configured')
    }

    const baseUrl = usePaidEndpoint ? config.baseUrl : config.trialUrl
    const url = `${baseUrl}/lookup?upc=${encodeURIComponent(gtin)}`
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Kaspi-Card-Builder/1.0',
    }

    // Add API key for paid endpoint
    if (usePaidEndpoint && config.userKey) {
      headers['user_key'] = config.userKey
    }

    // Log to debug file
    debugLogger.logGtinRequest(gtin, url, headers)

    const response = await fetch(url, {
      method: 'GET',
      headers,
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      return {
        success: false,
        error: `API request failed: ${response.status} ${response.statusText}`,
      }
    }

    const rawData = await response.json()
    
    // Log to debug file
    debugLogger.logGtinResponse(gtin, rawData)
    
    const parsed = upcitemdbResponseSchema.parse(rawData)

    if (parsed.code !== 'OK' || parsed.items.length === 0) {
      return {
        success: false,
        error: 'No product found for this GTIN',
      }
    }

    const item = parsed.items[0]
    const normalized: NormalizedGtinData = {
      gtin,
      brand: item.brand,
      name: item.title,
      model: item.model,
      category: item.category,
      description: item.description,
      images: item.images,
      price: item.lowest_recorded_price,
      currency: item.currency,
      rawData: rawData,
    }

    return {
      success: true,
      data: normalized,
    }

  } catch (error) {

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Main GTIN lookup function with fallback logic
 */
export async function lookupGtin(gtin: string): Promise<GtinLookupResult> {
  const config = getGtinConfig()
  
  // Try paid endpoint first if key is available
  if (config.provider === 'upcitemdb' && config.userKey) {
    const result = await lookupGtinUpcitemdb(gtin, true)
    if (result.success) {
      return result
    }
  }
  
  // Fallback to trial endpoint
  if (config.provider === 'upcitemdb') {
    return await lookupGtinUpcitemdb(gtin, false)
  }
  
  return {
    success: false,
    error: `Unsupported GTIN provider: ${config.provider}`,
  }
}
