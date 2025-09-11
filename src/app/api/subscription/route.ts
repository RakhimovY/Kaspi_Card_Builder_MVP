import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth-config'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'
import { env } from '@/lib/server/env'
import { polarAPI } from '@/lib/server/polar'

export async function GET(request: NextRequest) {
  const log = logger.child({ endpoint: 'subscription' })

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: { in: ['active', 'past_due'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        usageStats: {
          where: {
            periodYM: new Date().toISOString().slice(0, 7) // Current month
          },
          take: 1,
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let subscription = user.subscriptions[0]
    const usageStat = user.usageStats[0]

    // Optionally refresh from provider when requested or stale/expired
    const searchParams = request.nextUrl.searchParams
    const forceRefresh = searchParams.get('refresh') === '1'
    const now = new Date()

    if (subscription && (forceRefresh || subscription.currentPeriodEnd < now || subscription.status !== 'active')) {
      try {
        if (subscription.provider === 'polar' && env.BILLING_PROVIDER === 'polar' && subscription.providerId) {
          const remote = await polarAPI.getSubscription(subscription.providerId)
          if (remote) {
            const updated = await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                status: remote.status,
                currentPeriodStart: new Date(remote.current_period_start),
                currentPeriodEnd: new Date(remote.current_period_end),
                cancelAtPeriodEnd: remote.cancel_at_period_end,
                metadata: {
                  ...(subscription.metadata as Record<string, unknown> | null ?? {}),
                  lastSyncedAt: new Date().toISOString(),
                },
              },
            })
            subscription = updated
          }
        }
      } catch (e) {
        log.warn({ message: 'Failed to refresh subscription from provider', error: e instanceof Error ? e.message : 'unknown' })
      }
    }

    // Determine current plan and limits
    let plan = 'free'
    let limits = {
      photosProcessed: 50,
      magicFillCount: 10,
      exportCount: 5,
    }

    if (subscription && subscription.status === 'active') {
      plan = subscription.plan
      if (plan === 'pro') {
        limits = {
          photosProcessed: 500,
          magicFillCount: 100,
          exportCount: 50,
        }
      }
    }

    // Get current usage
    const currentUsage = {
      photosProcessed: usageStat?.photosProcessed || 0,
      magicFillCount: usageStat?.magicFillCount || 0,
      exportCount: usageStat?.exportCount || 0,
    }

    const response = {
      plan,
      status: subscription?.status || 'free',
      limits,
      currentUsage,
      subscription: subscription ? {
        id: subscription.id,
        provider: subscription.provider,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      } : null,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        lemonSqueezyCustomerId: user.lemonSqueezyCustomerId,
      }
    }

    log.info({ message: 'Subscription info retrieved', userId: user.id, plan })
    return NextResponse.json(response)

  } catch (error) {
    log.error({ error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
