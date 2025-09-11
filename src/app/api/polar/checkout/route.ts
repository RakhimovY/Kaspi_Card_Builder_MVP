import { NextResponse } from 'next/server'
import { polar } from '@/lib/server/polar'

// Support both GET (legacy redirect flow from UI) and POST (programmatic)

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const productOrPriceId = url.searchParams.get('products')

    if (!productOrPriceId) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 })
    }

    // If a product ID is provided, fetch it to resolve a price ID. If it's already a price ID, fall back to it directly.
    let priceId: string = productOrPriceId
    try {
      const product = await polar.products.get({ id: productOrPriceId })
      const firstAvailablePrice = product.prices.find(p => !(p as any).isArchived)
      priceId = (firstAvailablePrice as any)?.id || product.prices[0]?.id
    } catch {
      // Not a product ID or fetch failed; assume it's already a price ID
      priceId = productOrPriceId
    }

    const checkout = await polar.checkouts.custom.create({
      productPriceId: priceId,
      successUrl: `${url.origin}/studio?success=1&checkout_id={CHECKOUT_ID}`,
    })

    const redirectUrl = checkout.url || `${url.origin}/studio?error=no-checkout-url`
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    const url = new URL(request.url)
    return NextResponse.redirect(`${url.origin}/studio?error=checkout-failed`)
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      price_id?: string
      product_id?: string
      success_url: string
      cancel_url?: string
      customer_email?: string
    }

    if (!body?.success_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let priceId = body.price_id
    if (!priceId && body.product_id) {
      try {
        const product = await polar.products.get({ id: body.product_id })
        const firstAvailablePrice = product.prices.find(p => !(p as any).isArchived)
        priceId = (firstAvailablePrice as any)?.id || product.prices[0]?.id
      } catch {
        // fall through
      }
    }

    if (!priceId) {
      return NextResponse.json({ error: 'Missing price_id or resolvable product_id' }, { status: 400 })
    }

    const checkout = await polar.checkouts.custom.create({
      productPriceId: priceId,
      successUrl: body.success_url.includes('checkout_id=')
        ? body.success_url
        : `${body.success_url}${body.success_url.includes('?') ? '&' : '?'}checkout_id={CHECKOUT_ID}`,
      customerEmail: body.customer_email,
    })

    return NextResponse.json({ url: checkout.url })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 400 })
  }
}
