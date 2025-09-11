import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth-config'
import { polar } from '@/lib/server/polar'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as { checkoutId: string }
    if (!body.checkoutId) {
      return NextResponse.json({ error: 'Missing checkout ID' }, { status: 400 })
    }

    const log = logger.child({ endpoint: 'polar/sync-subscription', checkoutId: body.checkoutId })

    // Get checkout details from Polar
    const checkout = await polar.checkouts.custom.get({ id: body.checkoutId })
    log.info({ message: 'Retrieved checkout', checkout: JSON.stringify(checkout) })

    if (!checkout || !checkout.productPrice) {
      return NextResponse.json({ error: 'Checkout not found or invalid' }, { status: 404 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
        }
      })
    }

    // Determine plan based on product name
    const productName = checkout.product?.name || ''
    const plan: 'pro' | 'free' = productName.toLowerCase().includes('pro') ? 'pro' : 'free'

    // Upsert subscription
    const subscription = await prisma.subscription.upsert({
      where: {
        userId_provider: {
          userId: user.id,
          provider: 'polar'
        }
      },
      update: {
        status: 'active',
        plan,
        providerId: checkout.id,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        customerId: checkout.customerEmail || '',
        metadata: {
          productId: checkout.product?.id || '',
          priceId: checkout.productPrice?.id || '',
          checkoutId: checkout.id,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        provider: 'polar',
        providerId: checkout.id,
        plan,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        customerId: checkout.customerEmail || '',
        metadata: {
          productId: checkout.product?.id || '',
          priceId: checkout.productPrice?.id || '',
          checkoutId: checkout.id,
        },
      }
    })

    log.info({ message: 'Subscription synced', userId: user.id, plan, status: subscription.status })

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      message: 'Subscription synced successfully'
    })

  } catch (error) {
    logger.error({ 
      endpoint: 'polar/sync-subscription', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    return NextResponse.json({ error: 'Failed to sync subscription' }, { status: 500 })
  }
}
