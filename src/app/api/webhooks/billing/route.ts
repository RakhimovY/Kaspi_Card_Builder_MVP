import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'
import { getBillingConfig } from '@/lib/server/env'
import { lemonSqueezyAPI } from '@/lib/server/lemonsqueezy'
import { polarAPI } from '@/lib/server/polar'
import { z } from 'zod'

// Lemon Squeezy webhook payload schema
const lemonSqueezyWebhookSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z.record(z.string(), z.any()).optional(),
  }),
  data: z.object({
    id: z.string(),
    type: z.string(),
    attributes: z.object({
      store_id: z.number(),
      customer_id: z.number(),
      product_id: z.number(),
      variant_id: z.number(),
      product_name: z.string(),
      variant_name: z.string(),
      status: z.string(),
      status_formatted: z.string(),
      trial_ends_at: z.string().nullable(),
      renews_at: z.string().nullable(),
      ends_at: z.string().nullable(),
      created_at: z.string(),
      updated_at: z.string(),
      test_mode: z.boolean(),
    }),
    relationships: z.object({
      store: z.object({
        data: z.object({
          id: z.string(),
          type: z.string(),
        }),
      }),
      customer: z.object({
        data: z.object({
          id: z.string(),
          type: z.string(),
        }),
      }),
    }),
  }),
})

type LemonSqueezySubscriptionData = z.infer<typeof lemonSqueezyWebhookSchema>['data']

// Polar webhook payload schema
const polarWebhookSchema = z.object({
  type: z.string(),
  data: z.object({
    id: z.string(),
    object: z.string(),
    customer_id: z.string(),
    product_id: z.string(),
    price_id: z.string(),
    status: z.enum(['active', 'canceled', 'past_due', 'unpaid']),
    current_period_start: z.string(),
    current_period_end: z.string(),
    cancel_at_period_end: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
})

type PolarSubscriptionData = z.infer<typeof polarWebhookSchema>['data']

// Lemon Squeezy signature verification
async function verifyLemonSqueezySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const crypto = await import('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

// Polar signature verification
async function verifyPolarSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const crypto = await import('crypto')
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint: 'webhooks/billing' })

  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')
    
    log.info({ message: 'Webhook received', signature: !!signature })

    const billingConfig = getBillingConfig()
    if (!billingConfig) {
      log.warn({ message: 'No billing provider configured' })
      return NextResponse.json({ error: 'Billing not configured' }, { status: 501 })
    }

    // Verify signature for Lemon Squeezy
    if (billingConfig.provider === 'lemon-squeezy') {
      if (!signature || !billingConfig.webhookSecret) {
        log.warn({ message: 'Missing signature or webhook secret' })
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (!(await verifyLemonSqueezySignature(body, signature, billingConfig.webhookSecret))) {
        log.warn({ message: 'Invalid signature' })
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }

      // Parse and validate webhook payload
      const payload = lemonSqueezyWebhookSchema.parse(JSON.parse(body))
      const { meta, data } = payload
      
      log.info({ 
        message: 'Processing Lemon Squeezy webhook',
        eventName: meta.event_name,
        subscriptionId: data.id,
        status: data.attributes.status
      })

      // Handle different webhook events
      switch (meta.event_name) {
        case 'subscription_created':
        case 'subscription_updated':
        case 'subscription_resumed':
          await handleLemonSqueezySubscriptionUpdate(data, 'active')
          break
        case 'subscription_cancelled':
        case 'subscription_expired':
        case 'subscription_paused':
          await handleLemonSqueezySubscriptionUpdate(data, 'canceled')
          break
        case 'subscription_payment_failed':
          await handleLemonSqueezySubscriptionUpdate(data, 'past_due')
          break
        default:
          log.info({ message: 'Unhandled event type', eventName: meta.event_name })
      }
    }

    // For Polar webhooks use official route at /api/polar/webhooks

    log.info({ message: 'Webhook processed successfully' })
    return NextResponse.json({ success: true })

  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleLemonSqueezySubscriptionUpdate(data: LemonSqueezySubscriptionData, status: string) {
  const log = logger.child({ function: 'handleSubscriptionUpdate' })
  
  try {
    const customerId = data.relationships.customer.data.id
    const subscriptionId = data.id
    
    log.info({ 
      message: 'Updating subscription',
      customerId,
      subscriptionId,
      status,
      productName: data.attributes.product_name
    })

    // Fetch customer details from Lemon Squeezy
    const customer = await lemonSqueezyAPI.getCustomer(parseInt(customerId))
    if (!customer) {
      log.warn({ message: 'Customer not found in Lemon Squeezy', customerId })
      return
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.name,
          lemonSqueezyCustomerId: customerId.toString(),
        }
      })
      log.info({ message: 'Created new user', userId: user.id, email: customer.email })
    } else if (!user.lemonSqueezyCustomerId) {
      // Link existing user to Lemon Squeezy customer
      await prisma.user.update({
        where: { id: user.id },
        data: { lemonSqueezyCustomerId: customerId.toString() }
      })
      log.info({ message: 'Linked existing user to Lemon Squeezy', userId: user.id, customerId })
    }

    // Determine plan based on product/variant
    const plan = data.attributes.product_name.toLowerCase().includes('pro') ? 'pro' : 'free'
    
    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: 'lemon-squeezy'
        }
      },
      update: {
        status,
        plan,
        providerId: subscriptionId,
        currentPeriodStart: new Date(data.attributes.created_at),
        currentPeriodEnd: data.attributes.renews_at ? new Date(data.attributes.renews_at) : new Date(data.attributes.ends_at || data.attributes.created_at),
        cancelAtPeriodEnd: data.attributes.ends_at ? true : false,
        customerId: customerId.toString(),
        metadata: {
          productId: data.attributes.product_id,
          variantId: data.attributes.variant_id,
          productName: data.attributes.product_name,
          variantName: data.attributes.variant_name,
          testMode: data.attributes.test_mode,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: 'lemon-squeezy',
        providerId: subscriptionId,
        plan,
        status,
        currentPeriodStart: new Date(data.attributes.created_at),
        currentPeriodEnd: data.attributes.renews_at ? new Date(data.attributes.renews_at) : new Date(data.attributes.ends_at || data.attributes.created_at),
        cancelAtPeriodEnd: data.attributes.ends_at ? true : false,
        customerId: customerId.toString(),
        metadata: {
          productId: data.attributes.product_id,
          variantId: data.attributes.variant_id,
          productName: data.attributes.product_name,
          variantName: data.attributes.variant_name,
          testMode: data.attributes.test_mode,
        },
      }
    })

    log.info({ 
      message: 'Subscription updated successfully',
      userId: user.id,
      subscriptionId: subscription.id,
      status,
      plan
    })
    
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}

async function handlePolarSubscriptionUpdate(data: PolarSubscriptionData, status: string) {
  const log = logger.child({ function: 'handlePolarSubscriptionUpdate' })
  
  try {
    const customerId = data.customer_id
    const subscriptionId = data.id
    
    log.info({ 
      message: 'Updating Polar subscription',
      customerId,
      subscriptionId,
      status,
      productId: data.product_id
    })

    // Fetch customer details from Polar
    const customer = await polarAPI.getCustomer(customerId)
    if (!customer) {
      log.warn({ message: 'Customer not found in Polar', customerId })
      return
    }

    // Find or create user by email
    let user = await prisma.user.findUnique({
      where: { email: customer.email }
    })

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.name || null,
          // Note: We'll need to add polarCustomerId field to User model
        }
      })
      log.info({ message: 'Created new user', userId: user.id, email: customer.email })
    }

    // Determine plan based on product
    const plan = data.product_id.includes('pro') ? 'pro' : 'free'
    
    // Update or create subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: 'polar'
        }
      },
      update: {
        status,
        plan,
        providerId: subscriptionId,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
        customerId: customerId,
        metadata: {
          productId: data.product_id,
          priceId: data.price_id,
          testMode: false, // Polar doesn't have test mode in webhook
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: 'polar',
        providerId: subscriptionId,
        plan,
        status,
        currentPeriodStart: new Date(data.current_period_start),
        currentPeriodEnd: new Date(data.current_period_end),
        cancelAtPeriodEnd: data.cancel_at_period_end,
        customerId: customerId,
        metadata: {
          productId: data.product_id,
          priceId: data.price_id,
          testMode: false,
        },
      }
    })

    log.info({ 
      message: 'Polar subscription updated successfully',
      userId: user.id,
      subscriptionId: subscription.id,
      status,
      plan
    })
    
  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}
