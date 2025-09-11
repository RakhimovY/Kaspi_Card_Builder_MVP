import { NextResponse } from 'next/server'
import { polar } from '@/lib/server/polar'

// Keep GET handler via official adapter behavior removed; use explicit POST flow per docs

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      price_id: string
      success_url: string
      cancel_url?: string
      customer_email?: string
    }

    if (!body?.price_id || !body?.success_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const checkout = await polar.checkouts.create({
      productPriceId: body.price_id,
      successUrl: body.success_url,
      customerEmail: body.customer_email,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 400 })
  }
}
