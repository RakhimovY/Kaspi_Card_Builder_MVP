import { NextResponse } from 'next/server'
import { env } from '@/lib/server/env'

export async function GET() {
  try {
    return NextResponse.json({
      provider: env.BILLING_PROVIDER,
      // Only expose public configuration
      publicConfig: {
        provider: env.BILLING_PROVIDER,
        // Add any public configuration here
      }
    })
  } catch (error) {
    console.error('Failed to get billing config:', error)
    return NextResponse.json(
      { error: 'Failed to get billing configuration' },
      { status: 500 }
    )
  }
}
