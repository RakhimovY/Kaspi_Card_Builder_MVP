import { Webhooks } from '@polar-sh/nextjs'
import { env } from '@/lib/server/env'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'

// Official Polar Webhooks handler. Polar validates signatures internally.
export const POST = Webhooks({
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  onPayload: async (payload) => {
    if (isSubscriptionEvent(payload)) {
      await upsertSubscription(payload)
    } else {
      logger.info({ endpoint: 'polar/webhooks', message: 'Ignoring non-subscription event', type: getEventType(payload) })
    }
  },
})

type PolarSubscriptionEvent = {
  type?: string
  data?: {
    id?: string | number
    status: 'active' | 'canceled' | 'past_due' | 'unpaid'
    product?: { id?: string | number; name?: string | null }
    price?: { id?: string | number }
    current_period_start?: string | number | Date
    current_period_end?: string | number | Date
    cancel_at_period_end?: boolean
    customer?: { id?: string | number; email?: string | null; name?: string | null }
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isSubscriptionEvent(payload: unknown): payload is PolarSubscriptionEvent {
  if (!isObject(payload)) return false
  const maybeData = (payload as { data?: unknown }).data
  if (!isObject(maybeData)) return false
  const status = (maybeData as { status?: unknown }).status
  return status === 'active' || status === 'canceled' || status === 'past_due' || status === 'unpaid'
}

function getEventType(payload: unknown): string | undefined {
  if (!isObject(payload)) return undefined
  const t = (payload as { type?: unknown }).type
  return typeof t === 'string' ? t : undefined
}

async function upsertSubscription(event: PolarSubscriptionEvent) {
  const log = logger.child({ endpoint: 'polar/webhooks', type: event?.type })

  try {
    const data = event?.data
    if (!data) return

    const customerEmail: string | undefined = (data.customer?.email ?? undefined)
    if (!customerEmail) {
      log.warn({ message: 'No customer email in event' })
      return
    }

    let user = await prisma.user.findUnique({ where: { email: customerEmail } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: customerEmail,
          name: data.customer?.name ?? null,
        }
      })
    }

    const subscriptionId: string = String(data.id)
    const status: 'active' | 'canceled' | 'past_due' | 'unpaid' = data.status
    const plan: 'pro' | 'free' = (data.product?.name ?? '').toLowerCase().includes('pro') ? 'pro' : 'free'

    await prisma.subscription.upsert({
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
        currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : undefined,
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : undefined,
        cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
        customerId: String(data.customer?.id ?? ''),
        metadata: {
          productId: String(data.product?.id ?? ''),
          priceId: String(data.price?.id ?? ''),
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: 'polar',
        providerId: subscriptionId,
        plan,
        status,
        currentPeriodStart: data.current_period_start ? new Date(data.current_period_start) : new Date(),
        currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end) : new Date(),
        cancelAtPeriodEnd: Boolean(data.cancel_at_period_end),
        customerId: String(data.customer?.id ?? ''),
        metadata: {
          productId: String(data.product?.id ?? ''),
          priceId: String(data.price?.id ?? ''),
        },
      }
    })

    log.info({ message: 'Polar subscription upserted', userId: user.id, status, plan })
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    throw error
  }
}


