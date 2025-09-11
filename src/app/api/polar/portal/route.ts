import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth-config'
import { polarAPI } from '@/lib/server/polar'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint: 'polar/portal' })

  try {
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      log.warn({ message: 'Unauthorized portal access attempt' })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { provider: 'polar' }
        }
      }
    })

    if (!user) {
      log.warn({ message: 'User not found', email: session.user.email })
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get active Polar subscription
    const activeSubscription = user.subscriptions.find(sub => 
      sub.provider === 'polar' && sub.status === 'active'
    )

    if (!activeSubscription) {
      log.warn({ message: 'No active Polar subscription found', userId: user.id })
      return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
    }

    const customerId = activeSubscription.customerId
    if (!customerId) {
      log.warn({ message: 'No customer ID in subscription', subscriptionId: activeSubscription.id })
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    log.info({ 
      message: 'Creating Polar customer portal session',
      userEmail: session.user.email,
      customerId
    })

    // Create customer portal session
    const portalSession = await polarAPI.createCustomerPortalSession(
      customerId,
      `${request.nextUrl.origin}/studio`
    )

    log.info({ 
      message: 'Polar customer portal session created',
      portalUrl: portalSession.url
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    log.error({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
}
