import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth-config'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'

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

    const subscription = user.subscriptions[0]
    const usageStat = user.usageStats[0]

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
