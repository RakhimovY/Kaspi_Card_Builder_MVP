import { NextResponse } from 'next/server'
import { prisma } from '@/lib/server/prisma'
import { logger } from '@/lib/server/logger'

/**
 * Health check endpoint for uptime monitoring
 * Returns basic system status, database connectivity, and timestamp
 */
export async function GET() {
  const requestId = crypto.randomUUID()
  const log = logger.child({ requestId, endpoint: 'health' })

  try {
    // Check database connectivity
    let dbStatus = 'unknown'
    try {
      await prisma.$queryRaw`SELECT 1`
      dbStatus = 'connected'
    } catch (dbError) {
      dbStatus = 'error'
      log.error({ message: 'Database health check failed', dbError })
    }

    const healthData = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '0.1.0',
      database: {
        status: dbStatus,
        provider: 'sqlite',
      },
      services: {
        auth: 'available',
        billing: process.env.BILLING_PROVIDER ? 'configured' : 'not-configured',
        magicFill: process.env.OPENAI_API_KEY ? 'configured' : 'not-configured',
      },
    }

    log.info({ message: 'Health check completed', status: healthData.status, dbStatus })
    return NextResponse.json(healthData, { status: 200 })

  } catch (error) {
    log.error({ message: 'Health check failed', error: error instanceof Error ? error.message : 'Unknown error' })
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    )
  }
}
